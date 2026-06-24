export const civilizationLayerTypes = [
  {
    id: 'routes',
    label: '文明路线',
    shortLabel: '路线',
    eyebrow: '文明脉络',
    title: '沿路线观察文明如何连接。',
    description: '贸易、迁徙、宗教和技术沿地理通道流动，塑造了跨区域的文明网络。'
  },
  {
    id: 'population',
    label: '人口分布',
    shortLabel: '人口',
    eyebrow: '人口密度感',
    title: '用色阶观察人口规模。',
    description: '颜色越暖，代表国家级人口规模越大；对数色阶保留中等国家的可读性。'
  },
  {
    id: 'language',
    label: '语言分布',
    shortLabel: '语言',
    eyebrow: '语言板块',
    title: '观察主要语言圈的空间关系。',
    description: '按官方或主要语言归入粗粒度语系色组，用于快速观察语言地理格局。'
  },
  {
    id: 'skin-tone',
    label: '肤色分布',
    shortLabel: '肤色',
    eyebrow: '三色分布',
    title: '观察白、黄、黑三类肤色分布。',
    description: '按白色、黄色、黑色三类粗略显示宏观分布，仅用于地球尺度可视化。'
  }
]

const populationStops = [
  { at: 0, color: '#1d4ed8', label: '较少' },
  { at: 0.28, color: '#0891b2', label: '低' },
  { at: 0.52, color: '#16a34a', label: '中' },
  { at: 0.76, color: '#facc15', label: '高' },
  { at: 1, color: '#ef4444', label: '极高' }
]

const languageGroups = [
  { id: 'sinitic', label: '汉语圈', color: '#facc15', codes: ['zho', 'cmn', 'yue'] },
  { id: 'japanese-korean', label: '日语 / 韩语', color: '#38bdf8', codes: ['jpn', 'kor'] },
  { id: 'indo-iranian', label: '印度-伊朗语支', color: '#22c55e', codes: ['hin', 'urd', 'ben', 'nep', 'fas', 'pus', 'prs', 'snd', 'sin', 'div'] },
  { id: 'dravidian', label: '达罗毗荼语族', color: '#14b8a6', codes: ['tam', 'tel', 'kan', 'mal'] },
  { id: 'arabic', label: '阿拉伯语圈', color: '#f59e0b', codes: ['ara'] },
  { id: 'romance', label: '罗曼语族', color: '#fb7185', codes: ['spa', 'por', 'fra', 'ita', 'ron', 'cat'] },
  { id: 'germanic', label: '日耳曼语族', color: '#60a5fa', codes: ['eng', 'deu', 'nld', 'swe', 'dan', 'nor', 'isl', 'afr'] },
  { id: 'slavic', label: '斯拉夫语族', color: '#a855f7', codes: ['rus', 'ukr', 'pol', 'ces', 'slk', 'slv', 'hrv', 'srp', 'bul', 'bel', 'mkd', 'bos'] },
  { id: 'turkic', label: '突厥语族', color: '#f97316', codes: ['tur', 'aze', 'uzb', 'kaz', 'kir', 'tuk'] },
  { id: 'austronesian', label: '南岛语族', color: '#06b6d4', codes: ['ind', 'msa', 'tgl', 'fil', 'mri', 'smo', 'ton', 'fij', 'tet', 'bis'] },
  { id: 'african', label: '非洲本地语群', color: '#84cc16', codes: ['swa', 'amh', 'hau', 'yor', 'ibo', 'kin', 'run', 'zul', 'xho', 'sot', 'nso', 'tsn', 'ssw', 'ven', 'tso', 'nya', 'som', 'tir'] },
  { id: 'other', label: '多语 / 本地语', color: '#94a3b8', codes: [] }
]

const skinToneGroups = [
  { id: 'white', label: '白色', color: '#f8f4e8', rank: 1 },
  { id: 'yellow', label: '黄色', color: '#ffd43b', rank: 2 },
  { id: 'black', label: '黑色', color: '#111111', rank: 3 }
]

const displayNames = createLanguageDisplayNames()

export function buildCivilizationCountryMetrics(countryMeta = [], places = []) {
  const placeByCode = new Map(
    places
      .filter((place) => place.geoFeatureId)
      .map((place) => [String(place.geoFeatureId).toUpperCase(), place])
  )
  const populations = countryMeta
    .map((meta) => Number(meta.population || 0))
    .filter((value) => value > 0)
  const minLog = Math.log10(Math.max(1000, Math.min(...populations)))
  const maxLog = Math.log10(Math.max(...populations, 1000))

  return Object.fromEntries(
    countryMeta
      .filter((meta) => meta?.cca3)
      .map((meta) => {
        const code = String(meta.cca3).toUpperCase()
        const place = placeByCode.get(code)
        const population = Number(meta.population || 0)
        const populationIntensity = scalePopulation(population, minLog, maxLog)
        const language = languageProfile(meta)
        const toneGroup = skinToneGroupForMeta(meta)

        return [code, {
          id: code,
          name: place?.name || countryName(meta),
          lat: Number(place?.lat ?? meta.latlng?.[0] ?? 0),
          lng: Number(place?.lng ?? meta.latlng?.[1] ?? 0),
          region: meta.region || '',
          subregion: meta.subregion || '',
          population,
          populationLabel: formatPopulation(population),
          populationIntensity,
          populationColor: colorFromStops(populationStops, populationIntensity),
          languageCode: language.code,
          languageName: language.name,
          languageGroup: language.group.id,
          languageGroupLabel: language.group.label,
          languageColor: language.group.color,
          toneIndex: toneGroup.rank / skinToneGroups.length,
          toneGroup: toneGroup.id,
          toneGroupLabel: toneGroup.label,
          toneLabel: toneGroup.label,
          toneColor: toneGroup.color
        }]
      })
  )
}

export function civilizationStyleForCountry(metric, layerId) {
  if (!metric) {
    return {
      color: '#5f7480',
      opacity: 1,
      label: '暂无数据',
      value: '—'
    }
  }

  if (layerId === 'population') {
    return {
      color: metric.populationColor,
      opacity: 1,
      label: '人口',
      value: metric.populationLabel
    }
  }

  if (layerId === 'language') {
    return {
      color: metric.languageColor,
      opacity: 1,
      label: metric.languageGroupLabel,
      value: metric.languageName
    }
  }

  if (layerId === 'skin-tone') {
    return {
      color: metric.toneColor,
      opacity: 1,
      label: '肤色分布',
      value: metric.toneLabel
    }
  }

  return {
    color: '#82d8ff',
    opacity: 0,
    label: '文明路线',
    value: ''
  }
}

export function getCivilizationLayerLegend(layerId) {
  if (layerId === 'population') return populationStops.map(({ color, label }) => ({ color, label }))
  if (layerId === 'language') return languageGroups.filter((group) => group.id !== 'other').map(({ color, label }) => ({ color, label }))
  if (layerId === 'skin-tone') return skinToneGroups.map(({ color, label }) => ({ color, label }))
  return []
}

export function topCivilizationCountries(metrics, layerId, limit = 8) {
  const values = Object.values(metrics || {})
  if (layerId === 'population') {
    return values
      .filter((item) => item.population > 0)
      .sort((a, b) => b.population - a.population)
      .slice(0, limit)
  }
  if (layerId === 'skin-tone') {
    return values
      .sort((a, b) => b.population - a.population)
      .slice(0, limit)
  }
  if (layerId === 'language') {
    const byGroup = new Map()
    values.forEach((item) => {
      const current = byGroup.get(item.languageGroup)
      if (!current || item.population > current.population) byGroup.set(item.languageGroup, item)
    })
    return [...byGroup.values()]
      .sort((a, b) => b.population - a.population)
      .slice(0, limit)
  }
  return []
}

function scalePopulation(population, minLog, maxLog) {
  if (!population) return 0
  return clamp((Math.log10(population) - minLog) / (maxLog - minLog || 1), 0, 1)
}

function languageProfile(meta) {
  const entries = Object.entries(meta.languages || {})
  const codes = entries.map(([code]) => code.toLowerCase())
  const group = languageGroupForMeta(meta, codes)
  const [code = '', fallback = ''] = entries.find(([itemCode]) => group.codes.includes(itemCode.toLowerCase())) || entries[0] || []
  return {
    code,
    name: languageName(code, fallback),
    group
  }
}

function languageGroupForMeta(meta, codes) {
  if (meta.region === 'Africa' && meta.subregion !== 'Northern Africa' && !codes.includes('ara')) {
    return languageGroups.find((group) => group.id === 'african')
  }

  return languageGroups.find((group) =>
    group.codes.some((code) => codes.includes(code))
  ) || languageGroups.find((group) => group.id === 'other')
}

function skinToneGroupForMeta(meta) {
  const subregion = meta.subregion || ''
  const region = meta.region || ''

  if (region === 'Africa' && subregion !== 'Northern Africa') return skinToneGroups.find((group) => group.id === 'black')
  if (subregion === 'Melanesia') return skinToneGroups.find((group) => group.id === 'black')
  if (['Eastern Asia', 'South-Eastern Asia', 'Southern Asia', 'Central Asia'].includes(subregion)) {
    return skinToneGroups.find((group) => group.id === 'yellow')
  }
  if (['Western Asia', 'Northern Africa', 'Caribbean'].includes(subregion)) {
    return skinToneGroups.find((group) => group.id === 'yellow')
  }
  return skinToneGroups.find((group) => group.id === 'white')
}

function formatPopulation(value) {
  const population = Number(value || 0)
  if (!population) return '暂无'
  if (population >= 100000000) {
    const fixed = population >= 1000000000 ? 1 : 2
    return `${trimNumber(population / 100000000, fixed)}亿`
  }
  if (population >= 10000) {
    const fixed = population >= 10000000 ? 0 : 1
    return `${trimNumber(population / 10000, fixed)}万`
  }
  return population.toLocaleString('zh-CN')
}

function countryName(meta) {
  return meta?.name?.nativeName?.zho?.common || meta?.name?.common || meta?.cca3 || '未知国家'
}

function languageName(code, fallback) {
  try {
    const name = displayNames?.of(code)
    if (name && name !== code && !isEnglishOnly(name)) return name
  } catch {}
  return isEnglishOnly(fallback) ? fallback : (fallback || code || '本地语言')
}

function createLanguageDisplayNames() {
  try {
    return new Intl.DisplayNames(['zh-CN'], { type: 'language' })
  } catch {
    return null
  }
}

function colorFromStops(stops, value) {
  const normalized = clamp(value, 0, 1)
  const upperIndex = stops.findIndex((stop) => stop.at >= normalized)
  if (upperIndex <= 0) return stops[0].color
  const lower = stops[upperIndex - 1]
  const upper = stops[upperIndex]
  const localT = (normalized - lower.at) / (upper.at - lower.at || 1)
  return mixHex(lower.color, upper.color, localT)
}

function mixHex(from, to, t) {
  const a = parseHex(from)
  const b = parseHex(to)
  const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * clamp(t, 0, 1)))
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function parseHex(hex) {
  const value = String(hex).replace('#', '')
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ]
}

function trimNumber(value, fixed) {
  return value.toFixed(fixed).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

function isEnglishOnly(value = '') {
  return /^[A-Za-z\s.'()-]+$/.test(String(value).trim())
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
