import { backgroundImage, cssImageUrl, optimizedImageUrl } from '../utils/imageUrl'

const states = new WeakMap()

const observer = typeof window !== 'undefined' && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)
        const state = states.get(entry.target)
        if (!state) return
        state.visible = true
        loadBackground(entry.target, state.config)
      })
    }, { rootMargin: '360px 0px' })
  : null

function normalizeConfig(value) {
  if (typeof value === 'string') {
    return { image: value, width: 900 }
  }

  if (!value || typeof value !== 'object') {
    return { image: '', width: 900 }
  }

  return {
    image: value.image || value.url || '',
    overlay: value.overlay || '',
    variable: value.variable || '',
    width: value.width || 900,
    quality: value.quality || 78
  }
}

function configKey(config) {
  return [
    config.image,
    config.overlay,
    config.variable,
    config.width,
    config.quality
  ].join('|')
}

function applyBackground(el, config) {
  if (config.variable) {
    el.style.setProperty(config.variable, cssImageUrl(config.image, config))
    return
  }

  el.style.backgroundImage = backgroundImage(config.image, config.overlay, config)
}

function loadBackground(el, config) {
  const state = states.get(el)
  if (!state || !config.image) return

  const key = configKey(config)
  if (state.loadedKey === key || state.loadingKey === key) return
  state.loadingKey = key
  applyBackground(el, config)

  const image = new Image()
  state.loader = image
  image.decoding = 'async'
  image.onload = () => {
    state.loadedKey = key
    state.loadingKey = ''
    state.loader = null
    applyBackground(el, config)
    el.classList.add('is-bg-loaded')
  }
  image.onerror = () => {
    state.loadingKey = ''
    state.loader = null
    applyBackground(el, config)
    el.classList.add('is-bg-loaded')
  }
  image.src = optimizedImageUrl(config.image, config)
}

function bindOrUpdate(el, value) {
  const config = normalizeConfig(value)
  const existing = states.get(el) || { visible: false, loadedKey: '', loadingKey: '', loader: null, config: null }
  existing.config = config
  states.set(el, existing)

  if (!config.image) return

  if (!observer) {
    existing.visible = true
    loadBackground(el, config)
    return
  }

  if (existing.visible) {
    loadBackground(el, config)
    return
  }

  observer.observe(el)
}

export const lazyBackground = {
  mounted(el, binding) {
    bindOrUpdate(el, binding.value)
  },
  updated(el, binding) {
    bindOrUpdate(el, binding.value)
  },
  beforeUnmount(el) {
    if (observer) observer.unobserve(el)
    states.delete(el)
  }
}
