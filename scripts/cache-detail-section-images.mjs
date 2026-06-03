import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import { oceanFeatures } from '../src/data/ocean.js'
import { regions } from '../src/data/regions.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const execFileAsync = promisify(execFile)
const outputDir = path.join(root, 'public', 'images', 'wiki', 'detail')
const auditFile = path.join(root, 'public', 'images', 'wiki', 'detail-audit.json')
const userAgent = 'WorldLens detail image cache/1.0 (educational prototype)'
const width = 900
const concurrency = 2
const sectionKeys = ['cover', 'geography', 'history', 'food', 'festival', 'architecture', 'lifestyle']

const countryTargets = {
  CHN: q('China', {
    cover: ['Great Wall of China landscape', 'China landscape'],
    geography: ['Li River Guangxi China landscape', 'Zhangjiajie China landscape'],
    history: ['Forbidden City Beijing China'],
    food: ['Chinese cuisine dim sum', 'Chinese food table'],
    festival: ['Chinese New Year lanterns', 'Spring Festival China lantern'],
    architecture: ['Chinese temple architecture', 'Temple of Heaven Beijing'],
    lifestyle: ['Shanghai skyline night', 'Shanghai street China']
  }),
  USA: q('United States', {
    cover: ['Grand Canyon United States'],
    geography: ['Yosemite National Park landscape', 'Grand Canyon landscape'],
    history: ['Statue of Liberty New York'],
    food: ['American diner food', 'American cuisine'],
    festival: ['New Orleans jazz festival', 'Hollywood sign Los Angeles'],
    architecture: ['Chicago skyline architecture', 'United States architecture skyline'],
    lifestyle: ['New York City street', 'New York City night']
  }),
  JPN: q('Japan', {
    cover: ['Mount Fuji Japan landscape'],
    geography: ['Mount Fuji Japan'],
    history: ['Kiyomizu-dera Kyoto'],
    food: ['Japanese cuisine bento', 'Washoku Japanese cuisine'],
    festival: ['Gion Matsuri Kyoto', 'Japan matsuri festival'],
    architecture: ['Himeji Castle Japan', 'Japanese castle architecture'],
    lifestyle: ['Tokyo Shibuya night', 'Tokyo street night']
  }),
  GBR: q('United Kingdom', {
    cover: ['London Thames skyline'],
    geography: ['Lake District England landscape', 'Scottish Highlands landscape'],
    history: ['Tower of London'],
    food: ['British pub food', 'English breakfast'],
    festival: ['Notting Hill Carnival London', 'Glastonbury Festival'],
    architecture: ['Oxford University architecture', 'Westminster Abbey architecture'],
    lifestyle: ['London street night', 'London pub street']
  }),
  FRA: q('France', {
    cover: ['Paris Eiffel Tower'],
    geography: ['French Alps landscape', 'Provence France landscape'],
    history: ['Louvre Museum Paris'],
    food: ['French cuisine wine cheese', 'French cafe food'],
    festival: ['Bastille Day fireworks Paris', 'France festival street'],
    architecture: ['Notre-Dame de Paris architecture', 'French architecture cathedral'],
    lifestyle: ['Paris street cafe', 'Paris street France']
  }),
  DEU: q('Germany', {
    cover: ['Brandenburg Gate Berlin'],
    geography: ['Black Forest Germany landscape'],
    history: ['Berlin Wall memorial'],
    food: ['German cuisine beer sausage', 'German food beer'],
    festival: ['Oktoberfest Munich'],
    architecture: ['Cologne Cathedral Germany'],
    lifestyle: ['Berlin street night', 'Berlin city Germany']
  }),
  RUS: q('Russia', {
    cover: ['Saint Basil Cathedral Moscow'],
    geography: ['Lake Baikal Russia landscape'],
    history: ['Kremlin Red Square Moscow'],
    food: ['Russian borscht food', 'Russian cuisine table'],
    festival: ['Russian ballet theatre', 'Russia winter festival'],
    architecture: ['Saint Petersburg architecture Russia'],
    lifestyle: ['Moscow winter street', 'Moscow street night']
  }),
  ITA: q('Italy', {
    cover: ['Colosseum Rome Italy'],
    geography: ['Amalfi Coast Italy landscape'],
    history: ['Roman Forum Italy'],
    food: ['Italian pasta pizza food'],
    festival: ['Venice Carnival Italy'],
    architecture: ['Florence Cathedral Italy'],
    lifestyle: ['Venice canal Italy', 'Rome street Italy']
  }),
  ESP: q('Spain', {
    cover: ['Alhambra Granada Spain'],
    geography: ['Costa Brava Spain coast', 'Spain landscape coast'],
    history: ['Alhambra Granada Spain'],
    food: ['Spanish paella food'],
    festival: ['Semana Santa Spain procession'],
    architecture: ['Sagrada Familia Barcelona'],
    lifestyle: ['Madrid plaza night', 'Spain street cafe']
  }),
  IND: q('India', {
    cover: ['Taj Mahal India'],
    geography: ['Ganges River Varanasi India'],
    history: ['Taj Mahal Agra India'],
    food: ['Indian spices market', 'Indian cuisine thali'],
    festival: ['Holi festival India'],
    architecture: ['Indian temple architecture'],
    lifestyle: ['Mumbai street India', 'Delhi street India']
  }),
  KOR: q('South Korea', {
    cover: ['Gyeongbokgung Palace Seoul'],
    geography: ['Seoraksan Korea landscape'],
    history: ['Gyeongbokgung Palace Seoul'],
    food: ['Korean cuisine kimchi', 'Korean food table'],
    festival: ['Lotus Lantern Festival Seoul'],
    architecture: ['Bukchon Hanok Village Seoul'],
    lifestyle: ['Seoul night street', 'Seoul city night']
  }),
  AUS: q('Australia', {
    cover: ['Sydney Opera House Australia'],
    geography: ['Great Barrier Reef Australia'],
    history: ['Uluru Australia landscape'],
    food: ['Australian cafe food', 'Australia food market'],
    festival: ['Aboriginal Australian dance festival', 'Australia festival'],
    architecture: ['Sydney Opera House architecture'],
    lifestyle: ['Sydney beach lifestyle', 'Melbourne street Australia']
  }),
  BRA: q('Brazil', {
    cover: ['Rio de Janeiro Brazil'],
    geography: ['Amazon rainforest Brazil'],
    history: ['Ouro Preto Brazil architecture'],
    food: ['Brazilian feijoada food'],
    festival: ['Rio Carnival Brazil'],
    architecture: ['Brasilia Cathedral Brazil'],
    lifestyle: ['Brazil football street', 'Rio de Janeiro street']
  }),
  EGY: q('Egypt', {
    cover: ['Pyramids of Giza Egypt'],
    geography: ['Nile River Egypt'],
    history: ['Pyramids of Giza'],
    food: ['Egyptian food koshari', 'Egyptian cuisine'],
    festival: ['Cairo market Egypt', 'Egypt festival street'],
    architecture: ['Karnak Temple Egypt'],
    lifestyle: ['Cairo street Egypt']
  }),
  TUR: q('Turkey', {
    cover: ['Hagia Sophia Istanbul'],
    geography: ['Cappadocia Turkey balloons'],
    history: ['Hagia Sophia Istanbul'],
    food: ['Turkish bazaar food tea', 'Turkish cuisine'],
    festival: ['Whirling dervishes Turkey'],
    architecture: ['Blue Mosque Istanbul architecture'],
    lifestyle: ['Istanbul Bosphorus street']
  }),
  ZAF: q('South Africa', {
    cover: ['Table Mountain Cape Town'],
    geography: ['Table Mountain South Africa'],
    history: ['Robben Island South Africa'],
    food: ['South African braai food'],
    festival: ['Zulu dance South Africa'],
    architecture: ['Johannesburg skyline South Africa'],
    lifestyle: ['Cape Town waterfront street']
  })
}

const oceanTitleOverrides = {
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
}

const regionTitleOverrides = {
  asia: 'Asia',
  europe: 'Europe',
  africa: 'Africa',
  'north-america': 'North America',
  'south-america': 'South America',
  oceania: 'Oceania',
  'antarctica-continent': 'Antarctica',
  'arctic-circle': 'Arctic',
  'southern-ocean': 'Southern Ocean',
  'mediterranean-sea': 'Mediterranean Sea',
  'caribbean-sea': 'Caribbean Sea',
  'red-sea': 'Red Sea',
  'black-sea': 'Black Sea',
  'south-china-sea': 'South China Sea',
  'baltic-sea': 'Baltic Sea',
  'arabian-sea': 'Arabian Sea'
}

const badTitle = /\b(flag|flags|coat of arms|emblem|seal|logo|icon|poster|stamp|passport|banknote|coin|anthem|ogg|pdf|djvu|svg|map|maps|locator|location map|blank map|political map|relief map|orthographic|globe|diagram|chart|graph|wikimedia|commons-logo|portrait|minister|president|military|uniform)\b/i
const badScene = /\b(anatomy|nerve|tennis|footballer|soccer player|formula one|album cover|book cover|painting|fresco)\b/i

await mkdir(outputDir, { recursive: true })

let targets = [
  ...Object.entries(countryTargets).map(([id, value]) => ({ id, kind: 'country', ...value })),
  ...regions.map((place) => {
    const id = place.id
    const title = regionTitleOverrides[id] || place.name_en || place.name || id
    return { id, kind: 'region', title, queries: regionQueries(id, title) }
  }),
  ...oceanFeatures.map((feature) => {
    const title = oceanTitleOverrides[feature.id] || feature.name_en || feature.name || feature.id
    return { id: feature.id, kind: 'ocean', title, queries: oceanQueries(title) }
  })
]

if (process.env.DETAIL_IMAGE_ID) {
  const ids = new Set(process.env.DETAIL_IMAGE_ID.split(',').map((item) => item.trim()).filter(Boolean))
  targets = targets.filter((target) => ids.has(target.id))
}

const audit = {}

await runPool(targets, concurrency, async (target) => {
  const usedDigests = new Set()
  audit[target.id] = {}
  for (const key of sectionKeys) {
    const file = path.join(outputDir, `${safeId(target.id)}-${key}.jpg`)
    if (!process.env.DETAIL_IMAGE_FORCE && await validJpeg(file)) {
      const digest = await fileDigest(file)
      usedDigests.add(digest)
      audit[target.id][key] = { localPath: localPath(target.id, key), sourceTitle: 'existing' }
      continue
    }
    await unlink(file).catch(() => {})
    const cached = await cacheSectionImage(target, key, file, usedDigests)
    audit[target.id][key] = cached
    console.log(`${target.id.padEnd(20)} ${key.padEnd(12)} ${cached.sourceTitle}`)
  }
})

await writeFile(auditFile, JSON.stringify(audit, null, 2), 'utf8')
console.log(`Detail image cache ready: ${targets.length} targets.`)

function q(title, queries) {
  return { title, queries }
}

function oceanQueries(title) {
  return {
    cover: [`${title} ocean landscape`, `${title} sea landscape`],
    geography: [`${title} coastline`, `${title} ocean waves`, `${title} satellite water`],
    history: [`${title} port ship`, `${title} harbor shipping`],
    food: [`${title} fishing`, `${title} seafood coast`],
    festival: [`${title} coastal town`, `${title} beach people`],
    architecture: [`${title} lighthouse`, `${title} harbor lighthouse`],
    lifestyle: [`${title} beach coast`, `${title} sailing`]
  }
}

function regionQueries(id, title) {
  if (id.includes('sea') || id.includes('ocean')) return oceanQueries(title)
  return {
    cover: [`${title} landscape`, `${title} continent landscape`],
    geography: [`${title} geography landscape`, `${title} mountains landscape`, `${title} river landscape`],
    history: [`${title} historic city`, `${title} ancient city`],
    food: [`${title} food market`, `${title} cuisine`],
    festival: [`${title} festival`, `${title} cultural festival`],
    architecture: [`${title} architecture`, `${title} historic architecture`],
    lifestyle: [`${title} city street`, `${title} people street`]
  }
}

async function cacheSectionImage(target, key, file, usedDigests) {
  const queries = [
    ...(target.queries[key] || []),
    `${target.title} ${key}`,
    target.title
  ]
  const seenSources = new Set()
  for (const query of queries) {
    const candidates = await commonsSearch(query)
    for (const candidate of candidates) {
      const sourceKey = candidate.sourceTitle.toLowerCase()
      if (seenSources.has(sourceKey)) continue
      seenSources.add(sourceKey)
      if (!candidateAllowed(candidate)) continue
      await download(candidate.url, file).catch(() => null)
      if (!await validJpeg(file)) {
        await unlink(file).catch(() => {})
        continue
      }
      const digest = await fileDigest(file)
      if (usedDigests.has(digest)) {
        await unlink(file).catch(() => {})
        continue
      }
      usedDigests.add(digest)
      return {
        localPath: localPath(target.id, key),
        sourceTitle: candidate.sourceTitle,
        query
      }
    }
  }
  throw new Error(`No detail image found for ${target.id}/${key}`)
}

async function commonsSearch(query) {
  const url = commonsUrl({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: String(width)
  })
  const json = await getJson(url).catch(() => null)
  return Object.values(json?.query?.pages || {})
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((page) => {
      const info = page.imageinfo?.[0] || {}
      return {
        sourceTitle: page.title || '',
        url: info.thumburl || info.url || '',
        mime: info.mime || '',
        width: info.thumbwidth || info.width || 0,
        height: info.thumbheight || info.height || 0
      }
    })
}

function candidateAllowed(candidate) {
  if (!candidate.url || candidate.mime !== 'image/jpeg') return false
  const title = decodeURIComponent(candidate.sourceTitle).replaceAll('_', ' ')
  if (badTitle.test(title) || badScene.test(title)) return false
  if (candidate.width && candidate.width < 480) return false
  if (candidate.height && candidate.height < 300) return false
  return true
}

async function getJson(url) {
  const { stdout } = await execFileAsync('curl.exe', [
    '-sS',
    '-L',
    '--fail',
    '--ipv4',
    '--retry',
    '1',
    '--connect-timeout',
    '8',
    '--max-time',
    '16',
    '-A',
    userAgent,
    url
  ], { maxBuffer: 24 * 1024 * 1024 })
  return JSON.parse(stripBom(stdout))
}

async function download(url, target) {
  await execFileAsync('curl.exe', [
    '-sS',
    '-L',
    '--fail',
    '--ipv4',
    '--retry',
    '1',
    '--connect-timeout',
    '8',
    '--max-time',
    '16',
    '--speed-time',
    '6',
    '--speed-limit',
    '1024',
    '-A',
    userAgent,
    '-o',
    target,
    url
  ], { maxBuffer: 8 * 1024 * 1024 })
}

function commonsUrl(params) {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  for (const [key, value] of Object.entries({ format: 'json', origin: '*', ...params })) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

async function validJpeg(file) {
  try {
    const info = await stat(file)
    if (info.size < 1024) return false
    return isJpeg(await readFile(file))
  } catch {
    return false
  }
}

function isJpeg(buffer) {
  return buffer?.[0] === 0xff && buffer?.[1] === 0xd8
}

async function fileDigest(file) {
  return digestBuffer(await readFile(file))
}

function digestBuffer(buffer) {
  return createHash('sha1').update(buffer).digest('hex')
}

function localPath(id, key) {
  return `/images/wiki/detail/${safeId(id)}-${key}.jpg`
}

function safeId(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'image'
}

function stripBom(value) {
  return String(value).replace(/^\uFEFF/, '')
}

async function runPool(items, size, worker) {
  let next = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const item = items[next++]
      await worker(item)
    }
  }))
}
