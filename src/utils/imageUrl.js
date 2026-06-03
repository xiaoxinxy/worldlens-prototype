const DEFAULT_WIDTH = 1200
const DEFAULT_QUALITY = 78
const DEFAULT_RATIO = 2 / 3

function normalizedWidth(width) {
  const value = Number(width)
  return Number.isFinite(value) && value > 0 ? Math.round(value) : DEFAULT_WIDTH
}

function normalizedQuality(quality) {
  const value = Number(quality)
  return Number.isFinite(value) && value > 0 ? Math.round(value) : DEFAULT_QUALITY
}

function optimizeUnsplash(input, width, quality) {
  try {
    const url = new URL(input)
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality))
    return url.toString()
  } catch {
    return input
  }
}

function optimizePicsum(input, width) {
  const height = Math.round(width * DEFAULT_RATIO)
  return input
    .replace(/(picsum\.photos\/(?:seed\/[^/?#]+|id\/\d+))\/\d+\/\d+/i, `$1/${width}/${height}`)
    .replace(/(picsum\.photos)\/\d+\/\d+/i, `$1/${width}/${height}`)
}

function optimizeWikimedia(input, width) {
  if (!/upload\.wikimedia\.org/i.test(input)) return input

  const resizedThumb = input.replace(/\/\d+px-/g, `/${width}px-`)
  if (resizedThumb !== input) return resizedThumb

  const fullImagePattern = /^(https:\/\/upload\.wikimedia\.org)(\/wikipedia\/(?:commons|en)\/)(?!thumb\/)([^?#]+\.(?:jpe?g|png|webp))([?#].*)?$/i
  const match = input.match(fullImagePattern)
  if (!match) return input

  const [, origin, wikiPath, filePath, suffix = ''] = match
  const fileName = filePath.split('/').pop()
  return `${origin}${wikiPath}thumb/${filePath}/${width}px-${fileName}${suffix}`
}

export function optimizedImageUrl(url, options = {}) {
  const input = String(url || '').trim()
  if (!input) return input

  const width = normalizedWidth(options.width)
  const quality = normalizedQuality(options.quality)

  if (/images\.unsplash\.com/i.test(input)) {
    return optimizeUnsplash(input, width, quality)
  }

  if (/picsum\.photos/i.test(input)) {
    return optimizePicsum(input, width)
  }

  if (/upload\.wikimedia\.org/i.test(input)) {
    return optimizeWikimedia(input, options.wikiWidth || width)
  }

  return input
}

export function cssImageUrl(url, options = {}) {
  const optimized = optimizedImageUrl(url, options).replace(/"/g, '\\"')
  return optimized ? `url("${optimized}")` : ''
}

export function backgroundImage(url, overlay = '', options = {}) {
  const image = cssImageUrl(url, options)
  return [overlay, image].filter(Boolean).join(', ')
}
