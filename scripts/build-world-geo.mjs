import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const geoDir = path.join(root, 'public', 'geo')
const sourceCountries =
  process.env.SOURCE_COUNTRIES ||
  path.join(process.env.TEMP || process.env.TMP || '.', 'ne50_countries.geojson')
const detailCountries =
  process.env.SOURCE_COUNTRIES_10M ||
  path.join(process.env.TEMP || process.env.TMP || '.', 'ne10_countries.geojson')
const sourceMarine =
  process.env.SOURCE_MARINE ||
  path.join(process.env.TEMP || process.env.TMP || '.', 'ne10_marine.geojson')

const nameOverrides = {
  CHN: '中国',
  TWN: '台湾',
  HKG: '香港',
  MAC: '澳门',
  USA: '美国',
  GBR: '英国',
  RUS: '俄罗斯',
  KOR: '韩国',
  PRK: '朝鲜',
  CZE: '捷克',
  VAT: '梵蒂冈'
}

const continentMeta = {
  asia: { id: 'asia', name: '亚洲', lat: 34, lng: 95 },
  europe: { id: 'europe', name: '欧洲', lat: 54, lng: 15 },
  africa: { id: 'africa', name: '非洲', lat: 1, lng: 20 },
  'north-america': { id: 'north-america', name: '北美洲', lat: 48, lng: -105 },
  'south-america': { id: 'south-america', name: '南美洲', lat: -16, lng: -60 },
  oceania: { id: 'oceania', name: '大洋洲', lat: -24, lng: 135 },
  'antarctica-continent': { id: 'antarctica-continent', name: '南极洲', lat: -82, lng: 20 }
}

function readJson(file) {
  return fs.readFile(file, 'utf8').then((text) => JSON.parse(text.replace(/^\uFEFF/, '')))
}

function normalizeCountryFeature(feature) {
  const props = feature.properties || {}
  const id = props.ADM0_A3 || props.ISO_A3 || props.SU_A3 || props.GU_A3
  if (!id || id === '-99') return null
  const name = nameOverrides[id] || props.NAME_ZH || props.NAME_LONG || props.ADMIN || props.NAME || id
  return {
    type: 'Feature',
    id,
    properties: {
      name,
      name_en: props.NAME_LONG || props.ADMIN || props.NAME || id,
      iso_a3: props.ISO_A3 || id,
      adm0_a3: id,
      sov_a3: props.SOV_A3 || id,
      continent: getContinentId(id, props),
      type: '国家'
    },
    geometry: feature.geometry
  }
}

function getContinentId(id, props = {}) {
  if (id === 'ATA') return 'antarctica-continent'
  if (['TWN', 'HKG', 'MAC'].includes(id)) return 'asia'

  const continent = props.CONTINENT || ''
  const region = props.REGION_UN || ''
  const subregion = props.SUBREGION || ''

  if (continent === 'Antarctica') return 'antarctica-continent'
  if (continent === 'Asia' || region === 'Asia') return 'asia'
  if (continent === 'Europe' || region === 'Europe') return 'europe'
  if (continent === 'Africa' || region === 'Africa') return 'africa'
  if (continent === 'Oceania' || region === 'Oceania') return 'oceania'
  if (continent === 'South America' || subregion === 'South America') return 'south-america'
  if (continent === 'North America' || region === 'Americas') return 'north-america'
  return 'asia'
}

function collectPolygons(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

function buildContinents(countryFeatures) {
  const grouped = new Map(Object.keys(continentMeta).map((id) => [id, []]))

  for (const feature of countryFeatures) {
    const continentId = feature.properties.continent
    const polygons = collectPolygons(feature.geometry)
    if (!grouped.has(continentId)) grouped.set(continentId, [])
    grouped.get(continentId).push(...polygons)
  }

  return {
    type: 'FeatureCollection',
    features: [...grouped.entries()]
      .filter(([, polygons]) => polygons.length)
      .map(([id, polygons]) => ({
        type: 'Feature',
        id,
        properties: {
          ...continentMeta[id],
          type: id === 'antarctica-continent' ? '极地' : '大洲'
        },
        geometry: { type: 'MultiPolygon', coordinates: polygons }
      }))
  }
}

function collectMarinePolygons(features, names) {
  const accepted = new Set(names.map((name) => name.toLowerCase()))
  const polygons = []
  for (const feature of features) {
    const props = feature.properties || {}
    const candidates = [props.name, props.name_en, props.namealt, props.label]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
    if (!candidates.some((value) => accepted.has(value))) continue
    polygons.push(...collectPolygons(feature.geometry))
  }
  return polygons
}

function marineFeature(features, config) {
  const polygons = collectMarinePolygons(features, config.names)
  if (!polygons.length) {
    throw new Error(`Missing marine polygons for ${config.id}`)
  }
  return {
    type: 'Feature',
    id: config.id,
    properties: {
      name: config.name,
      type: config.type,
      continent: config.continent,
      lat: config.lat,
      lng: config.lng
    },
    geometry: { type: 'MultiPolygon', coordinates: polygons }
  }
}

function buildOceans(marineFeatures) {
  const configs = [
    { id: 'pacific-ocean', name: '太平洋', type: '大洋', continent: '亚洲 / 大洋洲 / 美洲', lat: 0, lng: -160, names: ['North Pacific Ocean', 'South Pacific Ocean'] },
    { id: 'atlantic-ocean', name: '大西洋', type: '大洋', continent: '欧洲 / 非洲 / 美洲', lat: 7, lng: -35, names: ['North Atlantic Ocean', 'South Atlantic Ocean'] },
    { id: 'indian-ocean', name: '印度洋', type: '大洋', continent: '亚洲 / 非洲 / 大洋洲', lat: -22, lng: 75, names: ['INDIAN OCEAN', 'Indian Ocean'] },
    { id: 'arctic-ocean', name: '北冰洋', type: '大洋', continent: '北极地区', lat: 82, lng: 0, names: ['Arctic Ocean'] },
    { id: 'southern-ocean', name: '南大洋', type: '大洋', continent: '南极地区', lat: -65, lng: 0, names: ['SOUTHERN OCEAN', 'Southern Ocean'] },
    { id: 'mediterranean-sea', name: '地中海', type: '海域', continent: '欧洲 / 非洲 / 亚洲', lat: 37, lng: 18, names: ['Mediterranean Sea'] },
    { id: 'red-sea', name: '红海', type: '海域', continent: '非洲 / 亚洲', lat: 21, lng: 38, names: ['Red Sea'] },
    { id: 'black-sea', name: '黑海', type: '海域', continent: '欧洲 / 亚洲', lat: 43.2, lng: 35, names: ['Black Sea'] },
    { id: 'caribbean-sea', name: '加勒比海', type: '海域', continent: '北美洲', lat: 16, lng: -75, names: ['Caribbean Sea'] },
    { id: 'south-china-sea', name: '南海', type: '海域', continent: '亚洲', lat: 13, lng: 115, names: ['South China Sea'] },
    { id: 'baltic-sea', name: '波罗的海', type: '海域', continent: '欧洲', lat: 58.5, lng: 20, names: ['Baltic Sea'] },
    { id: 'arabian-sea', name: '阿拉伯海', type: '海域', continent: '亚洲 / 非洲', lat: 15, lng: 62, names: ['Arabian Sea'] }
  ]

  return {
    type: 'FeatureCollection',
    features: configs.map((config) => marineFeature(marineFeatures, config))
  }
}

await fs.mkdir(geoDir, { recursive: true })
const source = await readJson(sourceCountries)
const detailSource = await fs.access(detailCountries)
  .then(() => readJson(detailCountries))
  .catch(() => null)
const marineSource = await readJson(sourceMarine)
const detailById = new Map(
  (detailSource?.features || []).map((feature) => [
    feature.properties?.ADM0_A3 || feature.properties?.ISO_A3 || feature.properties?.SU_A3,
    feature
  ])
)
const smallTerritories = new Set(['HKG', 'MAC', 'SGP', 'VAT', 'MCO', 'AND', 'SMR'])
const countries = {
  type: 'FeatureCollection',
  features: source.features
    .map((feature) => {
      const id = feature.properties?.ADM0_A3 || feature.properties?.ISO_A3 || feature.properties?.SU_A3
      return smallTerritories.has(id) && detailById.has(id) ? detailById.get(id) : feature
    })
    .map(normalizeCountryFeature)
    .filter(Boolean)
}

await fs.writeFile(path.join(geoDir, 'countries.geojson'), `${JSON.stringify(countries)}\n`, 'utf8')
await fs.writeFile(path.join(geoDir, 'continents.geojson'), `${JSON.stringify(buildContinents(countries.features))}\n`, 'utf8')
await fs.writeFile(path.join(geoDir, 'oceans.geojson'), `${JSON.stringify(buildOceans(marineSource.features || []))}\n`, 'utf8')

console.log(`countries: ${countries.features.length}`)
console.log('continents: generated from country polygons')
console.log(`oceans: ${marineSource.features?.length || 0} Natural Earth marine features merged`)
