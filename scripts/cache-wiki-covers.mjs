import { execFile } from 'node:child_process'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import { climateZones } from '../src/data/climate.js'
import { majorPlates, volcanoFeatures } from '../src/data/earthDynamics.js'
import { oceanFeatures } from '../src/data/ocean.js'
import { regions } from '../src/data/regions.js'
import { terrainFeatures } from '../src/data/terrain.js'

const execFileAsync = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(root, 'public', 'images', 'wiki')
const manifestFile = path.join(root, 'src', 'data', 'wikiImageManifest.js')
const auditFile = path.join(root, 'public', 'images', 'wiki', 'audit.json')
const userAgent = 'WorldLens local real image cache/1.0 (educational prototype)'
const width = 640
const gallerySize = 3
const concurrency = 2

const titleOverrides = {
  country: {
    COD: 'Democratic Republic of the Congo',
    COG: 'Republic of the Congo',
    FSM: 'Federated States of Micronesia',
    TLS: 'East Timor',
    VAT: 'Vatican City',
    SDS: 'South Sudan',
    PSX: 'State of Palestine',
    SAH: 'Western Sahara',
    SOL: 'Somaliland',
    KOS: 'Kosovo',
    ALD: 'Åland',
    CYN: 'Northern Cyprus',
    IOA: 'Australian Indian Ocean Territories',
    ATC: 'Ashmore and Cartier Islands',
    KAS: 'Siachen Glacier'
  },
  place: {
    asia: 'Asia',
    europe: 'Europe',
    africa: 'Africa',
    'north-america': 'North America',
    'south-america': 'South America',
    oceania: 'Oceania',
    'antarctica-continent': 'Antarctica',
    'arctic-region': 'Arctic',
    'arctic-circle': 'Arctic',
    'pacific-ocean': 'Pacific Ocean',
    'atlantic-ocean': 'Atlantic Ocean',
    'indian-ocean': 'Indian Ocean',
    'arctic-ocean': 'Arctic Ocean',
    'southern-ocean': 'Southern Ocean',
    'mediterranean-sea': 'Mediterranean Sea',
    'caribbean-sea': 'Caribbean Sea',
    'red-sea': 'Red Sea',
    'black-sea': 'Black Sea',
    'south-china-sea': 'South China Sea',
    'baltic-sea': 'Baltic Sea',
    'arabian-sea': 'Arabian Sea',
    'bering-sea': 'Bering Sea'
  },
  climate: {
    'amazon-rainforest-climate': 'Amazon rainforest',
    'congo-basin-rainforest-climate': 'Congo Basin',
    'indian-monsoon-climate': 'Monsoon of South Asia',
    'east-asian-monsoon-climate': 'East Asian Monsoon',
    'sahara-desert-climate': 'Sahara',
    'arabian-desert-climate': 'Arabian Desert',
    'mediterranean-climate': 'Mediterranean climate',
    'british-oceanic-climate': 'British Isles',
    'western-europe-oceanic-climate': 'Western Europe',
    'siberian-subarctic-climate': 'Siberia',
    'greenland-polar-climate': 'Greenland ice sheet',
    'tibetan-highland-climate': 'Tibetan Plateau',
    'andes-highland-climate': 'Andes',
    'australian-interior-arid-climate': 'Outback',
    'north-american-continental-climate': 'Great Plains'
  },
  dynamic: {
    eurasian: 'Eurasian Plate',
    pacific: 'Pacific Plate',
    'indo-australian': 'Indo-Australian Plate',
    african: 'African Plate',
    'north-american': 'North American Plate',
    'south-american': 'South American Plate',
    antarctic: 'Antarctic Plate',
    fuji: 'Mount Fuji',
    kilimanjaro: 'Mount Kilimanjaro',
    etna: 'Mount Etna',
    'mauna-loa': 'Mauna Loa',
    yellowstone: 'Yellowstone Caldera',
    toba: 'Lake Toba'
  }
}

const manualFiles = {
  terrain: {
    'dead-sea': ['Dead_Sea_by_David_Shankbone.jpg'],
    'lake-baikal': ['Baikal.A2001296.0420.250m-NASA.jpg'],
    'rocky-mountains': ['Moraine_Lake_17092005.jpg'],
    'great-plains': ['High_Plains.jpg'],
    'gobi-desert': ['Gobi_Desert_dunes.jpg'],
    'arabian-desert': ['Rub_al_Khali_002.JPG'],
    'amazon-river': ['Amazon-river-NASA.jpg'],
    'etna-volcano': ['Catania-etna.JPG'],
    'japanese-archipelago': ['ISS039-E-12345_-_View_of_Japan.jpg'],
    'mariana-trench': ['Mariana_trench_location.jpg'],
    'mid-atlantic-ridge': ['Mid-atlantic_ridge_map.png']
  },
  climate: {
    'australian-interior-arid-climate': ["Australia's_Simpson_Desert_(MODIS).jpg"],
    'greenland-polar-climate': ['Greenland_ice_sheet_AMS_2021.jpg'],
    'sahara-desert-climate': ['Libya_4985_Tadrart_Acacus_Luca_Galuzzi_2007.jpg']
  }
}

const badAlways = /\b(flag|flags|coat of arms|emblem|seal|logo|icon|poster|stamp|passport|banknote|coin|exports|treemap|anthem|ogg|pdf|djvu|svg map|locator|location map|blank map|political map|relief location|orthographic|globe|wikimedia|commons-logo)\b/i
const weakMedia = /\b(map|chart|diagram|graph|scheme|schema|coat|arms|flag|logo|locator|location)\b/i
const badCountryScene = /\b(children|tennis|officers|portrait|group|assembly|minister|president|military|uniform|anatomie|anatomy|nerve|wellcome|exports|treemap|francesco|madonna|bambino|santi|nicola|lorenzo|dossale|painting|artwork|fresco|altar|helicopter)\b/i

const titleEntityCache = new Map()
const searchEntityCache = new Map()
const prefetchedEntitiesById = new Map()

await mkdir(outputRoot, { recursive: true })

let targets = await buildTargets()
if (process.env.WIKI_IMAGE_KIND) {
  targets = targets.filter((target) => target.kind === process.env.WIKI_IMAGE_KIND)
}
if (process.env.WIKI_IMAGE_ID) {
  const ids = new Set(process.env.WIKI_IMAGE_ID.split(',').map((item) => item.trim()).filter(Boolean))
  targets = targets.filter((target) => ids.has(target.id))
}
if (Number(process.env.WIKI_IMAGE_LIMIT || 0) > 0) {
  targets = targets.slice(0, Number(process.env.WIKI_IMAGE_LIMIT))
}
if (process.env.WIKI_COUNTRY_WIKIDATA === '1') {
  await prefetchCountryEntities(targets.filter((target) => target.kind === 'country'))
}
const manifest = {}
const audit = {}
const usedSources = new Set()

await runPool(targets, concurrency, async (target, index) => {
  let failure = ''
  const images = await resolveImages(target).catch((error) => {
    failure = error.message
    console.warn(`failed ${target.kind}/${target.id}: ${error.message}`)
    return []
  })
  if (!manifest[target.kind]) manifest[target.kind] = {}
  manifest[target.kind][target.id] = images.map((item) => item.localPath)
  auditKey(target, {
    title: target.title,
    entityId: target.entityId || '',
    error: failure,
    images: images.map(({ localPath, sourceUrl, sourceTitle }) => ({ localPath, sourceUrl, sourceTitle }))
  })
  console.log(`${String(index + 1).padStart(3, '0')}/${targets.length} ${target.kind.padEnd(7)} ${target.id.padEnd(24)} ${images.length}/${target.need}`)
})

await writeFile(manifestFile, renderManifest(manifest), 'utf8')
await writeFile(auditFile, JSON.stringify(audit, null, 2), 'utf8')

const incomplete = Object.entries(audit)
  .flatMap(([kind, entries]) => Object.entries(entries).map(([id, value]) => ({ kind, id, count: value.images?.length || 0, error: value.error || '' })))
  .filter((item) => item.count < targetNeed(item.kind))

if (incomplete.length) {
  console.warn('Incomplete image targets:')
  for (const item of incomplete) console.warn(`${item.kind}/${item.id}: ${item.count}${item.error ? ` ${item.error}` : ''}`)
  process.exitCode = 1
} else {
  console.log(`Wiki image cache ready: ${targets.length} targets, ${countImages(manifest)} local images.`)
}

async function buildTargets() {
  const [countryMeta, countriesGeo] = await Promise.all([
    readJson('public/geo/country-meta.json'),
    readJson('public/geo/countries.geojson')
  ])
  const countryTargets = new Map()

  for (const meta of countryMeta) {
    if (!meta.cca3) continue
    const title = titleOverrides.country[meta.cca3] || meta.name?.common || meta.cca3
    countryTargets.set(meta.cca3, {
      kind: 'country',
      id: meta.cca3,
      title,
      context: [meta.subregion, meta.region].filter(Boolean).join(' '),
      aliases: [
        meta.name?.common,
        meta.name?.official,
        ...(meta.capital || []).map((capital) => `${capital}, ${title}`),
        ...(meta.capital || [])
      ].filter(Boolean),
      need: gallerySize
    })
  }

  for (const feature of countriesGeo.features) {
    if (!feature.id || countryTargets.has(feature.id)) continue
    const title = titleOverrides.country[feature.id] || feature.properties?.name_en || feature.properties?.name || feature.id
    countryTargets.set(feature.id, {
      kind: 'country',
      id: feature.id,
      title,
      context: '',
      aliases: [feature.properties?.name_en, feature.properties?.name].filter(Boolean),
      need: gallerySize
    })
  }

  const placeIds = new Map()
  for (const region of regions) {
    const id = region.geoFeatureId || region.id
    placeIds.set(id, titleOverrides.place[id] || titleOverrides.place[region.id] || region.name || id)
  }
  for (const ocean of oceanFeatures) {
    placeIds.set(ocean.id, titleOverrides.place[ocean.id] || ocean.name_en || ocean.name || ocean.id)
  }

  return [
    ...countryTargets.values(),
    ...[...placeIds.entries()].map(([id, title]) => ({ kind: 'place', id, title, aliases: [title], need: gallerySize })),
    ...terrainFeatures.map((item) => ({ kind: 'terrain', id: item.id, title: item.name_en || item.id, aliases: [item.name_en, item.name, ...(item.search_aliases || [])].filter(Boolean), need: gallerySize })),
    ...climateZones.map((item) => ({ kind: 'climate', id: item.id, title: titleOverrides.climate[item.id] || item.name_en || item.id, aliases: [item.name_en, item.region, item.name].filter(Boolean), need: gallerySize })),
    ...majorPlates.map((item) => ({ kind: 'dynamic', id: item.id, title: titleOverrides.dynamic[item.id] || item.id, aliases: [item.name], need: 1, allowMaps: true })),
    ...volcanoFeatures.map((item) => ({ kind: 'dynamic', id: item.id, title: titleOverrides.dynamic[item.id] || item.id, aliases: [item.name], need: 1 }))
  ]
}

async function resolveImages(target) {
  const candidates = []
  for (const file of manualFiles[target.kind]?.[target.id] || []) {
    candidates.push(mediaFileCandidate(file, 'manual'))
  }

  if (target.kind === 'country') {
    if (process.env.WIKI_COUNTRY_WIKIDATA === '1') {
      const entity = await resolveEntity(target)
      debug(`${target.kind}/${target.id} entity ${entity?.id || 'none'}`)
      if (entity) {
        target.entityId = entity.id
        candidates.push(...claimMediaCandidates(entity, ['P948', 'P18', 'P242', 'P41']))
      }
    }
    for (const query of searchQueries(target).slice(0, 5)) {
      if (candidates.filter((candidate) => candidateAllowed(candidate, target, false)).length >= target.need) break
      candidates.push(...await commonsSearchCandidates(query, target))
      debug(`${target.kind}/${target.id} query "${query}" candidates ${candidates.length}`)
    }
  } else {
    const entity = await resolveEntity(target)
    debug(`${target.kind}/${target.id} entity ${entity?.id || 'none'}`)
    if (entity) {
      target.entityId = entity.id
      candidates.push(...claimMediaCandidates(entity, ['P948', 'P18']))
      const category = claimValue(entity, 'P373')
      debug(`${target.kind}/${target.id} category ${category || 'none'} claimCandidates ${candidates.length}`)
      if (category) candidates.push(...await commonsCategoryCandidates(category, target))
    }
    for (const query of searchQueries(target)) {
      if (candidates.length >= target.need * 8) break
      candidates.push(...await commonsSearchCandidates(query, target))
      debug(`${target.kind}/${target.id} query "${query}" candidates ${candidates.length}`)
    }
  }

  const ranked = candidates
    .map((candidate, order) => ({ ...candidate, order }))
    .sort((a, b) => candidateRank(a, target) - candidateRank(b, target) || a.order - b.order)
  const strong = ranked.filter((candidate) => candidateAllowed(candidate, target, false))
  const weak = ranked.filter((candidate) => candidateAllowed(candidate, target, true))
  debug(`${target.kind}/${target.id} candidates ${candidates.length} strong ${strong.length} weak ${weak.length}`)
  const selected = []
  for (const candidate of [...strong, ...weak]) {
    if (selected.length >= target.need) break
    const key = sourceKey(candidate)
    if (usedSources.has(key)) continue
    if (selected.some((item) => sourceKey(item) === key)) continue
    const downloaded = await downloadCandidate(candidate, target, selected.length + 1).catch(() => null)
    if (!downloaded) continue
    selected.push(downloaded)
    usedSources.add(key)
  }
  return selected
}

async function resolveEntity(target) {
  const prefetched = prefetchedEntitiesById.get(target.id)
  if (prefetched) return prefetched
  const titles = unique([target.title, ...target.aliases]).slice(0, 8)
  for (const title of titles) {
    const direct = await wikidataByTitle(title)
    if (direct) return direct
  }
  for (const title of titles) {
    const searched = await wikidataSearch(title)
    if (searched) return searched
  }
  return null
}

async function prefetchCountryEntities(countryTargets) {
  if (!countryTargets.length) return
  const byTitle = new Map(countryTargets.map((target) => [target.title.toLowerCase(), target]))
  const chunks = chunk(unique(countryTargets.map((target) => target.title)), 40)
  for (const titles of chunks) {
    const json = await curlJson(wikidataUrl('wbgetentities', {
      sites: 'enwiki',
      titles: titles.join('|'),
      props: 'claims|labels|descriptions|sitelinks',
      languages: 'en'
    })).catch((error) => {
      debug(`wikidata batch failed: ${error.message}`)
      return null
    })
    for (const entity of Object.values(json?.entities || {})) {
      if (!entity || entity.missing) continue
      const isoCodes = claimValues(entity, 'P298')
      for (const iso of isoCodes) {
        const target = countryTargets.find((item) => item.id === iso)
        if (target) prefetchedEntitiesById.set(target.id, entity)
      }
      const title = entity.sitelinks?.enwiki?.title?.toLowerCase()
      const targetByTitle = title ? byTitle.get(title) : null
      if (targetByTitle) prefetchedEntitiesById.set(targetByTitle.id, entity)
    }
  }
}

async function wikidataByTitle(title) {
  const key = String(title || '').trim()
  if (!key) return null
  if (titleEntityCache.has(key)) return titleEntityCache.get(key)
  const url = wikidataUrl('wbgetentities', {
    sites: 'enwiki',
    titles: key,
    props: 'claims|labels|descriptions',
    languages: 'en'
  })
  const json = await curlJson(url).catch((error) => {
    debug(`wikidata title failed ${key}: ${error.message}`)
    return null
  })
  const entity = firstEntity(json)
  titleEntityCache.set(key, entity)
  return entity
}

async function wikidataSearch(title) {
  const key = String(title || '').trim()
  if (!key) return null
  if (searchEntityCache.has(key)) return searchEntityCache.get(key)
  const searchJson = await curlJson(wikidataUrl('wbsearchentities', {
    search: key,
    language: 'en',
    limit: '5'
  })).catch((error) => {
    debug(`wikidata search failed ${key}: ${error.message}`)
    return null
  })
  const first = searchJson?.search?.[0]
  if (!first?.id) {
    searchEntityCache.set(key, null)
    return null
  }
  const entityJson = await curlJson(wikidataUrl('wbgetentities', {
    ids: first.id,
    props: 'claims|labels|descriptions',
    languages: 'en'
  })).catch((error) => {
    debug(`wikidata entity failed ${key}: ${error.message}`)
    return null
  })
  const entity = firstEntity(entityJson)
  searchEntityCache.set(key, entity)
  return entity
}

function firstEntity(json) {
  const entries = Object.entries(json?.entities || {})
  const found = entries.find(([id, entity]) => id !== '-1' && !entity.missing)
  return found?.[1] || null
}

function claimMediaCandidates(entity, props) {
  return props.flatMap((prop) => (entity.claims?.[prop] || [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean)
    .map((file) => mediaFileCandidate(file, `wikidata:${entity.id}:${prop}`)))
}

function claimValue(entity, prop) {
  return entity.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value || ''
}

function claimValues(entity, prop) {
  return (entity.claims?.[prop] || [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean)
}

function mediaFileCandidate(file, source) {
  return {
    sourceTitle: `File:${file}`,
    sourceUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`,
    mime: '',
    width: 0,
    height: 0,
    source
  }
}

async function commonsCategoryCandidates(category, target) {
  const url = commonsUrl({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${category}`,
    gcmtype: 'file',
    gcmlimit: '50',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: String(width)
  })
  const json = await curlJson(url).catch((error) => {
    debug(`commons category failed ${category}: ${error.message}`)
    return null
  })
  return commonsPages(json).map((page) => pageCandidate(page, `commons-category:${category}`, target))
}

async function commonsSearchCandidates(query, target) {
  const url = commonsUrl({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: String(width)
  })
  const json = await curlJson(url).catch((error) => {
    debug(`commons search failed ${query}: ${error.message}`)
    return null
  })
  return commonsPages(json).map((page) => pageCandidate(page, `commons-search:${query}`, target))
}

function commonsPages(json) {
  return Object.values(json?.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0))
}

function pageCandidate(page, source) {
  const info = page.imageinfo?.[0] || {}
  return {
    sourceTitle: page.title,
    sourceUrl: info.thumburl || info.url,
    mime: info.mime || '',
    width: info.width || info.thumbwidth || 0,
    height: info.height || info.thumbheight || 0,
    source
  }
}

function searchQueries(target) {
  const title = target.title
  if (target.kind === 'country') {
    const context = target.context || ''
    return unique([
      `${title} landscape`,
      `${title} city`,
      `${title} aerial`,
      `${title} landmark`,
      `${title} tourism`,
      `${title} island`,
      `${title} country landscape`,
      `${title} ${context} landscape`,
      `${title} ${context} city`,
      `${title} ${context} island`,
      ...target.aliases.map((item) => `${item} ${title}`)
    ])
  }
  if (target.kind === 'dynamic' && target.allowMaps) {
    return [`${title} map`, `${title} tectonic`, title]
  }
  return unique([
    title,
    `${title} landscape`,
    `${title} satellite`,
    `${title} geography`,
    `${title} panorama`
  ])
}

function candidateAllowed(candidate, target, allowWeak) {
  if (!candidate.sourceUrl) return false
  const title = decodeURIComponent(candidate.sourceTitle || candidate.sourceUrl).replaceAll('_', ' ')
  const mime = candidate.mime || ''
  if (/application\/|audio\//i.test(mime)) return false
  const countryWeakSymbol = target.kind === 'country' && allowWeak && /:P(?:18|41|242)$/.test(candidate.source || '')
  if (!target.allowMaps && badAlways.test(title) && !countryWeakSymbol) return false
  if (target.kind === 'country' && badCountryScene.test(title)) return false
  if (target.kind === 'country' && candidate.source?.startsWith('commons-search') && !candidateHasTargetWord(candidate, target)) return false
  if (!allowWeak && !target.allowMaps && weakMedia.test(title)) return false
  if (!allowWeak && mime === 'image/svg+xml') return false
  if (!allowWeak && candidate.width && candidate.height && candidate.width < 320 && candidate.height < 220) return false
  return true
}

function candidateRank(candidate, target) {
  const source = candidate.source || ''
  const title = decodeURIComponent(candidate.sourceTitle || '').toLowerCase()
  const hasTargetWord = candidateHasTargetWord(candidate, target)
  if (source === 'manual') return 0
  if (source.includes(':P948')) return 1
  if (source.includes(':P18') && !weakMedia.test(title)) return 2
  if (source.startsWith('commons-search') && hasTargetWord) return 2
  if (source.startsWith('commons-search')) return 3
  if (source.startsWith('commons-category') && hasTargetWord) return 4
  if (source.includes(':P18')) return target.allowMaps ? 2 : 5
  if (source.includes(':P242')) return 7
  if (source.includes(':P41')) return 8
  return 6
}

function candidateHasTargetWord(candidate, target) {
  const title = decodeURIComponent(candidate.sourceTitle || '').toLowerCase()
  const targetWords = unique([target.title, ...target.aliases])
    .flatMap((item) => String(item).toLowerCase().split(/[^a-z0-9]+/))
    .filter((word) => word.length > 3)
  return targetWords.some((word) => title.includes(word))
}

async function downloadCandidate(candidate, target, index) {
  const ext = extensionFor(candidate)
  const dir = path.join(outputRoot, target.kind)
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `${safeId(target.id)}-${index}.${ext}`)
  if (process.env.WIKI_IMAGE_FORCE || !(await validImage(file))) {
    await unlink(file).catch(() => {})
    await curlFile(candidate.sourceUrl, file)
  }
  if (!(await validImage(file))) {
    await unlink(file).catch(() => {})
    throw new Error(`not a usable image: ${candidate.sourceTitle}`)
  }
  return {
    localPath: `/images/wiki/${target.kind}/${safeId(target.id)}-${index}.${ext}`,
    sourceUrl: candidate.sourceUrl,
    sourceTitle: candidate.sourceTitle
  }
}

function extensionFor(candidate) {
  const value = `${candidate.mime} ${candidate.sourceUrl} ${candidate.sourceTitle}`.toLowerCase()
  if (value.includes('image/png') || value.includes('.png')) return 'png'
  if (value.includes('image/webp') || value.includes('.webp')) return 'webp'
  if (value.includes('image/svg') || value.includes('.svg')) return 'svg'
  if (value.includes('image/gif') || value.includes('.gif')) return 'gif'
  return 'jpg'
}

async function validImage(file) {
  try {
    const [info, buffer] = await Promise.all([stat(file), readFile(file)])
    if (info.size < 1024) return false
    const head = buffer.subarray(0, 16)
    const text = buffer.subarray(0, 256).toString('utf8').trimStart()
    return (
      (head[0] === 0xff && head[1] === 0xd8) ||
      (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) ||
      (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46) ||
      (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) ||
      text.includes('<svg')
    )
  } catch {
    return false
  }
}

async function curlJson(url) {
  const { stdout } = await execFileAsync('curl.exe', [
    '-sS',
    '-L',
    '--fail',
    '--retry',
    '0',
    '--connect-timeout',
    '8',
    '--max-time',
    '18',
    '-A',
    userAgent,
    url
  ], { maxBuffer: 24 * 1024 * 1024 })
  return JSON.parse(stripBom(stdout))
}

async function curlFile(url, target) {
  await execFileAsync('curl.exe', [
    '-sS',
    '-L',
    '--fail',
    '--retry',
    '0',
    '--connect-timeout',
    '8',
    '--max-time',
    '10',
    '-A',
    userAgent,
    '-o',
    target,
    url
  ], { maxBuffer: 8 * 1024 * 1024 })
}

function wikidataUrl(action, params) {
  return withParams('https://www.wikidata.org/w/api.php', { action, format: 'json', origin: '*', ...params })
}

function commonsUrl(params) {
  return withParams('https://commons.wikimedia.org/w/api.php', { format: 'json', origin: '*', ...params })
}

function withParams(base, params) {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url.toString()
}

async function runPool(items, size, worker) {
  let next = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const index = next++
      await worker(items[index], index)
    }
  }))
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function auditKey(target, value) {
  if (!audit[target.kind]) audit[target.kind] = {}
  audit[target.kind][target.id] = value
}

function targetNeed(kind) {
  return kind === 'dynamic' ? 1 : gallerySize
}

function sourceKey(candidate) {
  return String(candidate.sourceTitle || candidate.sourceUrl).toLowerCase()
}

function safeId(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'image'
}

function stripBom(value) {
  return String(value).replace(/^\uFEFF/, '')
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function chunk(items, size) {
  const chunks = []
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size))
  return chunks
}

function countImages(value) {
  return Object.values(value).flatMap((group) => Object.values(group)).flat().length
}

function debug(message) {
  if (process.env.WIKI_IMAGE_DEBUG) console.warn(message)
}

function renderManifest(value) {
  return `export const wikiImageManifest = ${JSON.stringify(value, null, 2)}\n\n` +
    `export function wikiImages(kind, id) {\n` +
    `  return wikiImageManifest?.[kind]?.[id] || []\n` +
    `}\n\n` +
    `export function wikiCover(kind, id) {\n` +
    `  return wikiImages(kind, id)[0] || ''\n` +
    `}\n`
}
