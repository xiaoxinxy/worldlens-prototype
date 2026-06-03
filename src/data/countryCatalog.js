import { coverForPlace, galleryForPlace, sectionImageForPlace } from './placeImages.js'

const continentByRegion = {
  Asia: '亚洲',
  Europe: '欧洲',
  Africa: '非洲',
  Oceania: '大洋洲',
  Antarctic: '南极洲'
}

const nameOverrides = {
  CHN: '中国',
  USA: '美国',
  JPN: '日本',
  GBR: '英国',
  FRA: '法国',
  DEU: '德国',
  RUS: '俄罗斯',
  ITA: '意大利',
  ESP: '西班牙',
  IND: '印度',
  KOR: '韩国',
  AUS: '澳大利亚',
  BRA: '巴西',
  EGY: '埃及',
  TUR: '土耳其'
}

const aLevelKeywords = {
  CHN: ['长城', '故宫', '春节', '丝绸之路', '山水城市'],
  USA: ['纽约', '国家公园', '多元城市', '爵士乐', '公路文化'],
  JPN: ['京都', '神社', '樱花', '和食', '祭典'],
  GBR: ['伦敦', '博物馆', '古堡', '乡村', '工业遗产'],
  FRA: ['巴黎', '卢浮宫', '街区', '美食', '建筑'],
  DEU: ['柏林', '城堡', '古典音乐', '工业设计', '森林'],
  RUS: ['莫斯科', '圣彼得堡', '东正教', '文学', '欧亚大陆'],
  ITA: ['罗马', '威尼斯', '文艺复兴', '教堂', '街巷'],
  ESP: ['马德里', '安达卢西亚', '弗拉门戈', '海岸', '广场'],
  IND: ['泰姬陵', '恒河', '色彩节', '市场', '香料'],
  KOR: ['首尔', '宫殿', '韩食', '韩屋', '流行文化'],
  AUS: ['悉尼', '海岸', '原住民艺术', '大堡礁', '荒原'],
  BRA: ['里约', '亚马逊', '狂欢节', '桑巴', '海岸'],
  EGY: ['金字塔', '尼罗河', '神庙', '沙漠', '开罗'],
  TUR: ['伊斯坦布尔', '安纳托利亚', '清真寺', '集市', '地中海']
}

const skipSeparateCountries = new Set(['TWN', 'HKG', 'MAC'])
const priorityCountries = ['CHN', 'USA', 'RUS', 'IND', 'BRA', 'JPN', 'GBR', 'FRA', 'DEU', 'ITA', 'ESP', 'KOR', 'AUS', 'EGY', 'TUR']

const regionDisplay = createDisplayNames('region')
const languageDisplay = createDisplayNames('language')
const currencyDisplay = createDisplayNames('currency')

const subregionOverrides = {
  Caribbean: '加勒比',
  'Central America': '中美洲',
  'North America': '北美洲',
  'South America': '南美洲',
  'Western Africa': '西非',
  'Eastern Africa': '东非',
  'Middle Africa': '中非',
  'Northern Africa': '北非',
  'Southern Africa': '南部非洲',
  'Central Asia': '中亚',
  'Eastern Asia': '东亚',
  'South-Eastern Asia': '东南亚',
  'Southern Asia': '南亚',
  'Western Asia': '西亚',
  'Eastern Europe': '东欧',
  'Northern Europe': '北欧',
  'Southern Europe': '南欧',
  'Western Europe': '西欧',
  'Central Europe': '中欧',
  'Australia and New Zealand': '澳大利亚与新西兰',
  Melanesia: '美拉尼西亚',
  Micronesia: '密克罗尼西亚',
  Polynesia: '波利尼西亚'
}

const capitalOverrides = {
  AFG: '喀布尔',
  ARE: '阿布扎比',
  OMN: '马斯喀特',
  AZE: '巴库',
  BHR: '麦纳麦',
  PAK: '伊斯兰堡',
  CHN: '北京',
  USA: '华盛顿',
  RUS: '莫斯科',
  IND: '新德里',
  BRA: '巴西利亚',
  JPN: '东京',
  GBR: '伦敦',
  FRA: '巴黎',
  DEU: '柏林',
  ITA: '罗马',
  ESP: '马德里',
  KOR: '首尔',
  AUS: '堪培拉',
  EGY: '开罗',
  TUR: '安卡拉'
}

export function buildCountryCatalog(countriesGeo, countryMeta = [], curatedPlaces = []) {
  const metaByCode = new Map(countryMeta.map((item) => [item.cca3, item]))
  const curatedByGeoId = new Map(
    curatedPlaces
      .filter((place) => place.geoFeatureId)
      .map((place) => [place.geoFeatureId, place])
  )

  const polygonCountries = countriesGeo.features
    .filter((feature) => !skipSeparateCountries.has(countryId(feature)))
    .map((feature) => {
      const id = countryId(feature)
      const meta = metaByCode.get(id)
      const place = makeCountryPlace(feature, meta)
      const curated = curatedByGeoId.get(id)
      return curated
        ? {
            ...place,
            ...curated,
            id: curated.id,
            slug: curated.slug,
            geoFeatureId: id,
            boundaryType: '国家',
            hasBoundary: true
          }
        : place
    })

  const known = new Set(polygonCountries.map((place) => place.geoFeatureId))
  const pointOnlyCountries = countryMeta
    .filter((meta) => meta.cca3 && !known.has(meta.cca3) && !skipSeparateCountries.has(meta.cca3))
    .map((meta) => makePointCountry(meta))

  return [...polygonCountries, ...pointOnlyCountries].sort(countrySort)
}

function countrySort(a, b) {
  const ai = priorityCountries.indexOf(a.geoFeatureId)
  const bi = priorityCountries.indexOf(b.geoFeatureId)
  if (ai !== -1 || bi !== -1) {
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  }
  return a.name.localeCompare(b.name)
}

function countryId(feature) {
  return feature.id || feature.properties?.adm0_a3 || feature.properties?.iso_a3
}

function makeCountryPlace(feature, meta) {
  const id = countryId(feature)
  const centroid = meta?.latlng?.length === 2
    ? { lat: meta.latlng[0], lng: meta.latlng[1] }
    : geometryCentroid(feature.geometry)
      const name = countryNameZh(id, feature, meta)
  const continent = continentName(feature.properties?.continent, meta)
  return {
    id: `country-${id.toLowerCase()}`,
    slug: `country-${id.toLowerCase()}`,
    name,
    type: '国家',
    detailLevel: priorityCountries.includes(id) ? 'full' : 'brief',
    continent,
    lat: Number(centroid.lat.toFixed(4)),
    lng: Number(centroid.lng.toFixed(4)),
    geoFeatureId: id,
    boundaryType: '国家',
    hasBoundary: true,
    nameZh: name,
    nameEn: meta?.name?.common || feature.properties?.name_en || feature.properties?.name || id,
    intro: countryIntro(name, continent, meta),
    keywords: countryKeywords(id, meta),
    wikiUrl: wikipediaUrl(name),
    coverImage: coverForPlace({ geoFeatureId: id, continent }),
    gallery: galleryForPlace({ geoFeatureId: id, continent, intro: countryIntro(name, continent, meta) }),
    sectionImages: sectionImages(id, continent),
    stats: countryStats(id, meta),
    sections: countrySections(name, continent, meta),
    timeline: [],
    facts: []
  }
}

function makePointCountry(meta) {
  const id = meta.cca3
  const [lat = 0, lng = 0] = meta.latlng || []
  const name = countryNameZh(id, null, meta)
  const continent = continentName('', meta)
  return {
    id: `country-${id.toLowerCase()}`,
    slug: `country-${id.toLowerCase()}`,
    name,
    type: '国家',
    detailLevel: priorityCountries.includes(id) ? 'full' : 'brief',
    continent,
    lat,
    lng,
    geoFeatureId: id,
    boundaryType: '国家',
    hasBoundary: false,
    nameZh: name,
    nameEn: meta.name?.common || id,
    intro: countryIntro(name, continent, meta),
    keywords: countryKeywords(id, meta),
    wikiUrl: wikipediaUrl(name),
    coverImage: coverForPlace({ geoFeatureId: id, continent }),
    gallery: galleryForPlace({ geoFeatureId: id, continent, intro: countryIntro(name, continent, meta) }),
    sectionImages: sectionImages(id, continent),
    stats: countryStats(id, meta),
    sections: countrySections(name, continent, meta),
    timeline: [],
    facts: []
  }
}

function sectionImages(id, continent) {
  const place = { geoFeatureId: id, continent }
  return {
    geography: sectionImageForPlace(place, 'geography'),
    history: sectionImageForPlace(place, 'history'),
    food: sectionImageForPlace(place, 'food'),
    festival: sectionImageForPlace(place, 'festival'),
    architecture: sectionImageForPlace(place, 'architecture'),
    lifestyle: sectionImageForPlace(place, 'lifestyle')
  }
}

function wikipediaUrl(name) {
  return `https://zh.wikipedia.org/wiki/${encodeURIComponent(String(name || '').replaceAll(' ', '_'))}`
}

function countryIntro(name, continent, meta) {
  const capital = capitalName(meta?.cca3, meta)
  return capital
    ? `${name}位于${continent}，以${capital}为重要城市节点，地理环境、历史迁徙与日常生活共同塑造了这里的文化纹理。`
    : `${name}位于${continent}，它的地理位置、语言与社会生活构成了独特的地方记忆。`
}

function countryKeywords(id, meta) {
  if (aLevelKeywords[id]) return aLevelKeywords[id]
  return uniqueValues([
    capitalName(id, meta),
    ...languageNames(meta).slice(0, 2),
    subregionName(meta?.subregion),
    continentName('', meta)
  ]).filter(Boolean)
}

function countryStats(id, meta) {
  const language = languageNames(meta).slice(0, 2).join(' / ') || '多语言'
  const currency = currencyName(meta) || '本地货币'
  return [
    { label: '首都', value: capitalName(id, meta) || '—' },
    { label: '人口', value: meta?.population ? meta.population.toLocaleString('zh-CN') : '—' },
    { label: '语言', value: language },
    { label: '货币', value: currency }
  ]
}

function countrySections(name, continent, meta) {
  const language = languageNames(meta).slice(0, 2).join('、') || '多种语言'
  return {
    geography: `${name}位于${continent}，地形、气候与水系影响了聚落、农业、交通和城市形态。`,
    history: `${name}的历史由区域交流、迁徙、制度演变与地方记忆共同书写。`,
    architecture: `建筑与公共空间记录了${name}的材料、气候、信仰和社会秩序。`,
    food: `饮食常与本地物产、贸易路线和家庭生活连接在一起。`,
    festival: `节庆、公共仪式与宗教传统让${name}的地方身份在日常生活中被持续看见。`,
    clothing: `服饰、手工艺与材料选择体现了气候、审美和社会身份的关系。`,
    music: `音乐、语言和口述传统记录着迁徙、劳动与社区情感。`,
    lifestyle: `${language}、城市节奏与社区习俗构成了今日${name}的生活面貌。`
  }
}

function continentName(continentId, meta) {
  if (continentId === 'north-america') return '北美洲'
  if (continentId === 'south-america') return '南美洲'
  if (continentId === 'antarctica-continent') return '南极洲'
  if (continentId === 'oceania') return '大洋洲'
  if (continentId === 'asia') return '亚洲'
  if (continentId === 'europe') return '欧洲'
  if (continentId === 'africa') return '非洲'
  if (meta?.region === 'Americas') return meta.subregion === 'South America' ? '南美洲' : '北美洲'
  return continentByRegion[meta?.region] || subregionName(meta?.region) || '地球'
}

function createDisplayNames(type) {
  try {
    return new Intl.DisplayNames(['zh-CN'], { type })
  } catch {
    return null
  }
}

function countryNameZh(id, feature, meta) {
  if (nameOverrides[id]) return nameOverrides[id]
  if (meta?.name?.nativeName?.zho?.common) return meta.name.nativeName.zho.common
  const alpha2 = countryAlpha2(meta)
  const intlName = alpha2 ? regionDisplay?.of(alpha2) : ''
  return intlName || feature?.properties?.name || meta?.name?.common || id
}

function countryAlpha2(meta) {
  const flagUrl = meta?.flags?.svg || meta?.flags?.png || ''
  const match = String(flagUrl).match(/flagcdn\.com\/(?:w\d+\/)?([a-z]{2})\.(?:svg|png)/i)
  return match?.[1]?.toUpperCase() || ''
}

function subregionName(value) {
  if (!value) return ''
  return subregionOverrides[value] || value
}

function languageNames(meta) {
  return uniqueValues(
    Object.entries(meta?.languages || {})
      .map(([code, fallback]) => languageName(code, fallback))
      .filter(Boolean)
  )
}

function languageName(code, fallback) {
  try {
    const name = languageDisplay?.of(code)
    if (name && !isEnglishOnly(name) && name !== code) return name
  } catch {}
  return isEnglishOnly(fallback) ? '本地语言' : fallback
}

function currencyName(meta) {
  const [code, fallback] = Object.entries(meta?.currencies || {})[0] || []
  if (!code) return ''
  try {
    const name = currencyDisplay?.of(code)
    if (name && !isEnglishOnly(name) && name !== code) return name
  } catch {}
  return isEnglishOnly(fallback?.name) ? '本地货币' : fallback?.name
}

function capitalName(id, meta) {
  if (capitalOverrides[id]) return capitalOverrides[id]
  return meta?.capital?.length ? '首都城市' : ''
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

function isEnglishOnly(value = '') {
  return /^[A-Za-z\s.'()-]+$/.test(String(value).trim())
}

function geometryCentroid(geometry) {
  const rings = geometry?.type === 'MultiPolygon'
    ? geometry.coordinates.flatMap((polygon) => polygon.slice(0, 1))
    : geometry?.coordinates?.slice(0, 1) || []
  const points = rings.flat()
  if (!points.length) return { lat: 0, lng: 0 }
  const sum = points.reduce((acc, [lng, lat]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}
