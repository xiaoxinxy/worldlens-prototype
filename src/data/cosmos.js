export const cosmosSeasons = [
  {
    id: 'march-equinox',
    label: '春分',
    nameEn: 'March Equinox',
    subsolarLatitude: 0,
    directPoint: '赤道',
    northernSeason: '北半球进入春季',
    southernSeason: '南半球进入秋季',
    northPolar: '极昼尚未展开，昼夜接近等长',
    southPolar: '极夜尚未展开，昼夜接近等长',
    climateLink: '两半球获得接近均衡的日照，季风和温带环流进入过渡期。',
    summary: '太阳直射赤道，晨昏线大致穿过两极，全球多数地区昼夜接近等长。'
  },
  {
    id: 'june-solstice',
    label: '夏至',
    nameEn: 'June Solstice',
    subsolarLatitude: 23.44,
    directPoint: '北回归线',
    northernSeason: '北半球夏季',
    southernSeason: '南半球冬季',
    northPolar: '北极圈内出现极昼',
    southPolar: '南极圈内出现极夜',
    climateLink: '北半球陆地升温更强，亚洲季风、农业生长期和高纬生态节律被放大。',
    summary: '太阳直射北回归线，北半球获得更长日照，南半球进入低太阳高度季节。'
  },
  {
    id: 'september-equinox',
    label: '秋分',
    nameEn: 'September Equinox',
    subsolarLatitude: 0,
    directPoint: '赤道',
    northernSeason: '北半球进入秋季',
    southernSeason: '南半球进入春季',
    northPolar: '极昼结束后进入昼夜转换',
    southPolar: '极夜结束后进入昼夜转换',
    climateLink: '热量分布重新趋于均衡，风带、雨带和海陆温差开始换季。',
    summary: '太阳再次直射赤道，晨昏线接近南北向，昼夜长度趋于均衡。'
  },
  {
    id: 'december-solstice',
    label: '冬至',
    nameEn: 'December Solstice',
    subsolarLatitude: -23.44,
    directPoint: '南回归线',
    northernSeason: '北半球冬季',
    southernSeason: '南半球夏季',
    northPolar: '北极圈内出现极夜',
    southPolar: '南极圈内出现极昼',
    climateLink: '南半球海洋吸收更多太阳能，北半球大陆冷高压和寒带气候信号增强。',
    summary: '太阳直射南回归线，南半球获得更长日照，北半球进入低太阳高度季节。'
  }
]

export const moonPhases = [
  {
    id: 'new',
    label: '新月',
    nameEn: 'New Moon',
    angleOffset: 0,
    tide: 'spring',
    tideLabel: '大潮',
    summary: '月球大致位于太阳同侧，太阳与月球引潮力方向叠加。'
  },
  {
    id: 'first-quarter',
    label: '上弦月',
    nameEn: 'First Quarter',
    angleOffset: -90,
    tide: 'neap',
    tideLabel: '小潮',
    summary: '月球与太阳方向接近直角，引潮力部分抵消，潮差减小。'
  },
  {
    id: 'full',
    label: '满月',
    nameEn: 'Full Moon',
    angleOffset: 180,
    tide: 'spring',
    tideLabel: '大潮',
    summary: '月球位于太阳相对方向，地球两侧引潮隆起更明显。'
  },
  {
    id: 'last-quarter',
    label: '下弦月',
    nameEn: 'Last Quarter',
    angleOffset: 90,
    tide: 'neap',
    tideLabel: '小潮',
    summary: '月球与太阳方向再次接近直角，潮汐振幅相对减弱。'
  }
]

export const polarRegions = [
  {
    id: 'north',
    label: '北极圈',
    latitude: 66.56,
    summary: '地轴倾斜让北极圈在夏至附近连续面向太阳，在冬至附近连续背向太阳。'
  },
  {
    id: 'south',
    label: '南极圈',
    latitude: -66.56,
    summary: '南极圈的极昼极夜与北极圈相反，反映两半球季节互换。'
  }
]

export function seasonById(id) {
  return cosmosSeasons.find((season) => season.id === id) || cosmosSeasons[1]
}

export function moonPhaseById(id) {
  return moonPhases.find((phase) => phase.id === id) || moonPhases[2]
}

export function polarRegionById(id) {
  return polarRegions.find((region) => region.id === id) || polarRegions[0]
}

export function formatBeijingTime(hour) {
  const normalizedHour = Number.isFinite(Number(hour)) ? Number(hour) : 12
  const hours = Math.floor(normalizedHour).toString().padStart(2, '0')
  const minutes = Math.round((normalizedHour % 1) * 60).toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function normalizeLongitude(lng) {
  return ((((lng + 180) % 360) + 360) % 360) - 180
}

export function getSunPositionForState(state = {}) {
  const season = seasonById(state.season)
  const beijingHour = Number.isFinite(Number(state.time)) ? Number(state.time) : 12
  const utcHour = (beijingHour - 8 + 24) % 24
  return {
    declination: season.subsolarLatitude,
    subsolarLongitude: normalizeLongitude((12 - utcHour) * 15),
    season
  }
}

export function getTideForMoonPhase(phaseId) {
  const phase = moonPhaseById(phaseId)
  return {
    type: phase.tide,
    label: phase.tideLabel,
    strength: phase.tide === 'spring' ? 1 : 0.58,
    phase
  }
}
