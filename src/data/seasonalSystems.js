export const monthNames = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]

export const seasonalQuarterMonths = [1, 4, 7, 10]

const winterMonsoon = {
  id: 'east-asia-winter-monsoon',
  role: 'winter-monsoon',
  label: '东亚冬季风',
  direction: 'land-to-ocean',
  strength: 0.82,
  effect: '大陆冷高压把干冷气流推向太平洋，华北、朝鲜半岛和日本西侧更容易出现寒潮与降雪。',
  path: [
    [48, 92],
    [36, 112],
    [24, 126],
    [10, 138]
  ]
}

const southAsiaWinter = {
  id: 'south-asia-winter-monsoon',
  role: 'winter-monsoon',
  label: '南亚冬季风',
  direction: 'land-to-ocean',
  strength: 0.66,
  effect: '印度半岛受大陆干风控制，降水减少，形成典型旱季。',
  path: [
    [30, 76],
    [20, 82],
    [10, 88],
    [2, 94]
  ]
}

const southAsiaSummer = {
  id: 'south-asia-summer-monsoon',
  role: 'summer-monsoon',
  label: '南亚夏季风',
  direction: 'ocean-to-land',
  strength: 0.96,
  effect: '印度洋暖湿气流越过阿拉伯海和孟加拉湾，抬升后带来南亚雨季。',
  path: [
    [-8, 52],
    [5, 66],
    [18, 78],
    [28, 88]
  ]
}

const eastAsiaSummer = {
  id: 'east-asia-summer-monsoon',
  role: 'summer-monsoon',
  label: '东亚夏季风',
  direction: 'ocean-to-land',
  strength: 0.84,
  effect: '西太平洋副热带高压边缘把暖湿气流送入中国东部、日本和朝鲜半岛。',
  path: [
    [6, 136],
    [18, 126],
    [30, 118],
    [39, 112]
  ]
}

const westAfricaSummer = {
  id: 'west-africa-summer-monsoon',
  role: 'summer-monsoon',
  label: '西非夏季风',
  direction: 'ocean-to-land',
  strength: 0.76,
  effect: '几内亚湾水汽北上，萨赫勒进入短促而关键的雨季。',
  path: [
    [-3, -18],
    [7, -8],
    [14, 0],
    [18, 8]
  ]
}

const australianSummer = {
  id: 'australia-summer-monsoon',
  role: 'summer-monsoon',
  label: '澳北夏季风',
  direction: 'ocean-to-land',
  strength: 0.78,
  effect: '赤道附近对流南移，暖湿气流进入澳大利亚北部和印尼群岛。',
  path: [
    [-2, 122],
    [-9, 130],
    [-16, 136],
    [-21, 142]
  ]
}

const transitionalEastAsia = {
  ...eastAsiaSummer,
  id: 'east-asia-transitional-monsoon',
  label: '东亚过渡季风',
  strength: 0.52,
  effect: '海陆热力差异正在建立或衰退，雨带呈阶段性推进或回撤。'
}

const somaliCurrent = {
  id: 'somali-current',
  label: '索马里寒流与上升流',
  kind: 'cold',
  note: '夏季西南季风增强，索马里沿岸离岸输送加强，冷水上翻，渔场生产力上升。',
  path: [
    [-9, 48],
    [0, 50],
    [8, 51],
    [13, 52]
  ]
}

const kuroshioExtension = {
  id: 'kuroshio-warm-extension',
  label: '黑潮暖流北缘',
  kind: 'warm',
  note: '东亚夏季风和西太副高配合，暖湿空气沿暖流区更容易发展云雨。',
  path: [
    [18, 123],
    [26, 130],
    [34, 142],
    [40, 151]
  ]
}

const brazilWarmCurrent = {
  id: 'brazil-warm-current-seasonal',
  label: '巴西暖流暖湿输送',
  kind: 'warm',
  note: '南半球夏季，巴西东岸暖流和海陆热力差异增强南美东部降水。',
  path: [
    [-8, -34],
    [-18, -38],
    [-28, -45],
    [-38, -52]
  ]
}

const benguelaUpwelling = {
  id: 'benguela-upwelling',
  label: '本格拉寒流上升流',
  kind: 'cold',
  note: '副热带高压和东南信风维持离岸输送，纳米布沿岸干旱与渔场并存。',
  path: [
    [-34, 15],
    [-27, 13],
    [-20, 12],
    [-14, 11]
  ]
}

const humboldtUpwelling = {
  id: 'humboldt-upwelling',
  label: '秘鲁寒流上升流',
  kind: 'cold',
  note: '东南信风与寒流维持低温海面，秘鲁沿岸少雨而渔业高产。',
  path: [
    [-42, -76],
    [-28, -74],
    [-15, -77],
    [-5, -81]
  ]
}

const monthlyConfigs = [
  {
    month: 1,
    seasonLabel: '北半球冬季 / 南半球夏季',
    solarDirectLatitude: -20.6,
    rainRange: [-14, 0],
    monsoonSystems: [winterMonsoon, southAsiaWinter, australianSummer],
    seasonalCurrents: [brazilWarmCurrent, benguelaUpwelling, humboldtUpwelling],
    impacts: [
      impactArea('east-asia-cold-wave', '东亚寒潮与日本海降雪', [25, 48], [95, 145], '大陆冷高压增强，冬季风越海取湿，日本海一侧降雪增多。', '#b7d4ff'),
      impactArea('south-asia-dry-season', '南亚旱季', [7, 26], [68, 92], '陆风控制印度半岛，农业和城市供水进入旱季管理。', '#f8c471'),
      impactArea('australia-wet-season', '澳北与印尼雨季', [-22, -2], [105, 150], '太阳直射点偏南，赤道低压和对流南移，热带北澳降雨增强。', '#5eead4'),
      impactArea('brazil-summer-rain', '巴西东南部夏季雨', [-28, -8], [-55, -35], '巴西暖流供水汽，内陆热低压触发对流雨。', '#80ffbf')
    ]
  },
  {
    month: 2,
    seasonLabel: '北半球冬季末 / 南半球夏季末',
    solarDirectLatitude: -12.8,
    rainRange: [-9, 4],
    monsoonSystems: [winterMonsoon, southAsiaWinter, australianSummer],
    seasonalCurrents: [brazilWarmCurrent, benguelaUpwelling, humboldtUpwelling],
    impacts: [
      impactArea('east-asia-late-winter', '东亚冬季风减弱但仍活跃', [24, 46], [100, 145], '大陆高压开始衰退，寒潮频率下降但冷暖空气交汇仍明显。', '#b7d4ff'),
      impactArea('indonesia-convection', '印尼群岛深对流', [-10, 5], [95, 145], '雨带仍在赤道以南，海温高、对流强，雷暴和短时强降水频繁。', '#5eead4'),
      impactArea('southern-africa-rain', '南部非洲雨季', [-28, -8], [18, 36], '热带辐合带南伸，赞比西河流域进入高水位期。', '#80ffbf')
    ]
  },
  {
    month: 3,
    seasonLabel: '春分前后',
    solarDirectLatitude: -1.4,
    rainRange: [-4, 8],
    monsoonSystems: [southAsiaWinter, transitionalEastAsia],
    seasonalCurrents: [benguelaUpwelling, humboldtUpwelling],
    impacts: [
      impactArea('equatorial-rain-peak', '赤道雨带增强', [-5, 8], [-75, 150], '太阳直射点接近赤道，亚马孙、刚果、印尼对流共同增强。', '#5eead4'),
      impactArea('sahel-pre-monsoon', '萨赫勒雨季前热低压建立', [8, 18], [-18, 20], '陆地升温加快，为夏季风北推建立压力梯度。', '#f7d774'),
      impactArea('south-asia-heat-build', '南亚季风前升温', [10, 28], [68, 92], '印度半岛快速增温，海陆热力差异开始积累。', '#ff9f6e')
    ]
  },
  {
    month: 4,
    seasonLabel: '北半球春季推进',
    solarDirectLatitude: 9.2,
    rainRange: [1, 13],
    monsoonSystems: [transitionalEastAsia, westAfricaSummer],
    seasonalCurrents: [kuroshioExtension, benguelaUpwelling],
    impacts: [
      impactArea('south-china-pre-flood', '华南前汛期', [20, 28], [105, 122], '暖湿气流北上遇冷空气，锋面雨带开始影响华南。', '#67e8f9'),
      impactArea('west-africa-first-rains', '西非沿海初雨', [0, 10], [-15, 10], '几内亚湾水汽进入沿海，雨季从低纬地区启动。', '#5eead4'),
      impactArea('indian-heat-low', '印度热低压增强', [12, 30], [68, 90], '陆地升温强于海洋，为南亚夏季风爆发蓄势。', '#ffb86b')
    ]
  },
  {
    month: 5,
    seasonLabel: '北半球初夏',
    solarDirectLatitude: 17.8,
    rainRange: [5, 18],
    monsoonSystems: [southAsiaSummer, eastAsiaSummer, westAfricaSummer],
    seasonalCurrents: [kuroshioExtension, somaliCurrent, benguelaUpwelling],
    impacts: [
      impactArea('bay-of-bengal-monsoon-onset', '孟加拉湾季风爆发', [8, 24], [78, 98], '海洋水汽快速输入，印度东北部和孟加拉湾沿岸暴雨增多。', '#5eead4'),
      impactArea('yangtze-meiyu-setup', '江淮梅雨带准备北抬', [24, 34], [105, 124], '副高边缘与冷暖空气交汇，持续性降雨条件建立。', '#67e8f9'),
      impactArea('sahel-rain-northward', '萨赫勒雨带北推', [8, 16], [-16, 22], '西非夏季风加强，牧草和农作播种窗口打开。', '#80ffbf')
    ]
  },
  {
    month: 6,
    seasonLabel: '夏至前后',
    solarDirectLatitude: 23.4,
    rainRange: [8, 22],
    monsoonSystems: [southAsiaSummer, eastAsiaSummer, westAfricaSummer],
    seasonalCurrents: [somaliCurrent, kuroshioExtension, humboldtUpwelling],
    impacts: [
      impactArea('south-asia-core-monsoon', '南亚雨季核心区', [8, 28], [68, 98], '太阳直射点北上，陆地热低压最强，西南季风把印度洋水汽送入南亚。', '#5eead4'),
      impactArea('east-asia-meiyu', '东亚梅雨锋', [24, 36], [105, 140], '西太副高边缘稳定，长江中下游、日本一带持续降雨。', '#67e8f9'),
      impactArea('somali-upwelling-impact', '索马里沿岸冷水上翻', [-4, 14], [44, 56], '西南季风贴岸吹送，离岸输送让冷水上翻，鱼群和海鸟活动增强。', '#7dd3fc')
    ]
  },
  {
    month: 7,
    seasonLabel: '北半球盛夏',
    solarDirectLatitude: 21.0,
    rainRange: [10, 24],
    monsoonSystems: [southAsiaSummer, eastAsiaSummer, westAfricaSummer],
    seasonalCurrents: [somaliCurrent, kuroshioExtension, humboldtUpwelling],
    impacts: [
      impactArea('india-monsoon-rain', '印度半岛雨季高峰', [8, 29], [68, 92], '海洋向陆地输送水汽，西高止山和喜马拉雅南坡强迫抬升，洪涝风险升高。', '#5eead4'),
      impactArea('north-china-rain-belt', '华北雨带北进', [32, 43], [108, 124], '副热带高压北跳，东亚夏季风把暖湿空气推进华北。', '#67e8f9'),
      impactArea('sahel-growing-season', '萨赫勒短雨季', [10, 19], [-18, 22], '雨带到达最北位置，农业生产高度依赖这一窗口。', '#80ffbf'),
      impactArea('mediterranean-summer-dry', '地中海夏季干热', [32, 44], [-10, 35], '副热带高压控制，下沉气流抑制降水，形成炎热干季。', '#f8c471')
    ]
  },
  {
    month: 8,
    seasonLabel: '北半球夏末',
    solarDirectLatitude: 13.2,
    rainRange: [9, 23],
    monsoonSystems: [southAsiaSummer, eastAsiaSummer, westAfricaSummer],
    seasonalCurrents: [somaliCurrent, kuroshioExtension, humboldtUpwelling],
    impacts: [
      impactArea('south-asia-monsoon-retreat-start', '南亚雨季开始准备撤退', [8, 28], [68, 95], '陆地热低压减弱前，季风仍强，洪涝和滑坡风险维持。', '#5eead4'),
      impactArea('west-pacific-typhoon-moisture', '西北太平洋台风水汽', [12, 32], [120, 155], '暖海面和夏季风水汽配合，热带气旋更容易影响东亚沿岸。', '#67e8f9'),
      impactArea('sahel-peak-rains', '萨赫勒降水峰值', [10, 20], [-18, 22], '雨带仍处北位，草场和农田进入主要生长期。', '#80ffbf')
    ]
  },
  {
    month: 9,
    seasonLabel: '秋分前后',
    solarDirectLatitude: 2.2,
    rainRange: [4, 18],
    monsoonSystems: [eastAsiaSummer, westAfricaSummer],
    seasonalCurrents: [kuroshioExtension, benguelaUpwelling],
    impacts: [
      impactArea('monsoon-retreat', '亚洲夏季风撤退', [8, 35], [68, 125], '太阳直射点南移，陆地降温，季风雨带逐步向南回撤。', '#67e8f9'),
      impactArea('equatorial-second-rain', '赤道第二雨季', [-4, 8], [-75, 145], '直射点接近赤道，赤道低压带再次增强。', '#5eead4'),
      impactArea('mediterranean-rain-return', '地中海秋雨开始', [32, 44], [-10, 35], '副热带高压南撤，西风带扰动逐步进入地中海。', '#93c5fd')
    ]
  },
  {
    month: 10,
    seasonLabel: '北半球秋季推进',
    solarDirectLatitude: -8.8,
    rainRange: [-2, 12],
    monsoonSystems: [winterMonsoon, transitionalEastAsia],
    seasonalCurrents: [brazilWarmCurrent, benguelaUpwelling],
    impacts: [
      impactArea('east-asia-autumn-transition', '东亚秋季转换', [24, 44], [100, 140], '大陆冷高压建立，夏季风退场，冷空气南下次数增加。', '#b7d4ff'),
      impactArea('south-china-retreating-rain', '华南后汛期收束', [18, 26], [105, 122], '雨带南撤，降水从锋面主导转向台风和局地对流。', '#67e8f9'),
      impactArea('australia-monsoon-build', '澳北雨季前积热', [-22, -8], [115, 148], '南半球陆地升温，赤道低压开始向南摆动。', '#ffb86b')
    ]
  },
  {
    month: 11,
    seasonLabel: '北半球初冬',
    solarDirectLatitude: -17.2,
    rainRange: [-8, 5],
    monsoonSystems: [winterMonsoon, southAsiaWinter, australianSummer],
    seasonalCurrents: [brazilWarmCurrent, benguelaUpwelling, humboldtUpwelling],
    impacts: [
      impactArea('east-asia-winter-start', '东亚冬季风建立', [25, 48], [95, 145], '蒙古-西伯利亚高压增强，冷干气流开始主导东亚。', '#b7d4ff'),
      impactArea('south-asia-clear-season', '南亚晴朗旱季', [7, 26], [68, 92], '东北季风使印度大部降水减少，恒河平原雾霾更容易累积。', '#f8c471'),
      impactArea('australia-pre-monsoon-storms', '澳北季风前雷暴', [-22, -4], [115, 150], '海温和陆地热低压增强，对流活动开始频繁。', '#5eead4')
    ]
  },
  {
    month: 12,
    seasonLabel: '冬至前后',
    solarDirectLatitude: -23.4,
    rainRange: [-14, -1],
    monsoonSystems: [winterMonsoon, southAsiaWinter, australianSummer],
    seasonalCurrents: [brazilWarmCurrent, benguelaUpwelling, humboldtUpwelling],
    impacts: [
      impactArea('north-hemisphere-winter-highs', '北半球大陆冷高压最强', [30, 55], [60, 125], '太阳高度低，陆地快速冷却，高压中心强迫冬季风南下。', '#b7d4ff'),
      impactArea('australia-monsoon-rain', '澳北雨季增强', [-22, -4], [115, 150], '赤道低压和对流南移，热带北澳进入强降雨季节。', '#5eead4'),
      impactArea('brazil-summer-convection', '南美东部夏季对流', [-28, -8], [-58, -34], '巴西暖流和陆地热低压叠加，东南部降水显著增加。', '#80ffbf')
    ]
  }
]

export const seasonalMonths = monthlyConfigs.map(buildMonth)

export function clampSeasonalMonth(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 7
  return Math.min(12, Math.max(1, Math.round(number)))
}

export function seasonalMonthByNumber(value) {
  const month = clampSeasonalMonth(value)
  return seasonalMonths.find((item) => item.month === month) || seasonalMonths[6]
}

function buildMonth(config) {
  const sunBelt = buildSunBelt(config.solarDirectLatitude)
  const rainBelt = {
    label: config.solarDirectLatitude >= 0 ? '热带雨带随直射点北移' : '热带雨带随直射点南移',
    latRange: config.rainRange,
    intensity: 0.74 + Math.min(0.18, Math.abs(config.rainRange[1] - config.rainRange[0]) / 90)
  }
  const pressureBelts = buildPressureBelts(config.solarDirectLatitude)
  const polarCaps = buildPolarCaps(config.solarDirectLatitude)
  const regionalImpacts = config.impacts.map((impact, index) => ({
    ...impact,
    order: index + 1
  }))

  return {
    month: config.month,
    label: monthNames[config.month - 1],
    seasonLabel: config.seasonLabel,
    solarDirectLatitude: config.solarDirectLatitude,
    directPointLabel: `${formatLatitude(config.solarDirectLatitude)}附近`,
    sunBelt,
    rainBelt,
    pressureBelts,
    monsoonSystems: config.monsoonSystems,
    seasonalCurrents: config.seasonalCurrents,
    polarCaps,
    regionalImpacts,
    logicSteps: [
      {
        kind: 'solar',
        title: '太阳直射点',
        description: `太阳直射点位于${formatLatitude(config.solarDirectLatitude)}，地表受热中心随之移动。`
      },
      {
        kind: 'belts',
        title: '雨带与气压带',
        description: `${rainBelt.label}，副热带高压和极地高压同步重排。`
      },
      {
        kind: 'monsoon',
        title: '海陆热力差驱动季风',
        description: config.monsoonSystems.map((item) => item.label).join('、') + '成为本月主要风场。'
      },
      {
        kind: 'impact',
        title: '区域气候结果',
        description: regionalImpacts.slice(0, 3).map((item) => item.label).join('、') + '最明显。'
      }
    ]
  }
}

function buildSunBelt(latitude) {
  const width = 4.2
  return {
    label: '太阳能量最强带',
    latRange: [round(latitude - width), round(latitude + width)],
    intensity: 0.92
  }
}

function buildPressureBelts(latitude) {
  const northShift = latitude > 0 ? 3 : latitude < -12 ? -1 : 1
  const southShift = latitude < 0 ? -3 : latitude > 12 ? 1 : -1
  return [
    {
      id: 'north-subtropical-high',
      label: '北半球副热带高压带',
      role: 'subtropical-high',
      latRange: [round(22 + northShift), round(35 + northShift)],
      intensity: latitude > 0 ? 0.84 : 0.62
    },
    {
      id: 'south-subtropical-high',
      label: '南半球副热带高压带',
      role: 'subtropical-high',
      latRange: [round(-35 + southShift), round(-22 + southShift)],
      intensity: latitude < 0 ? 0.84 : 0.62
    },
    {
      id: 'polar-high-active',
      label: latitude >= 0 ? '南半球极地冷高压' : '北半球极地冷高压',
      role: 'polar-high',
      latRange: latitude >= 0 ? [-90, -66.5] : [66.5, 90],
      intensity: 0.58
    }
  ]
}

function buildPolarCaps(latitude) {
  if (latitude >= 0) {
    return [
      { id: 'north-polar-day', label: '北极圈极昼区', role: 'polar-day', latRange: [66.5, 90], intensity: latitude / 23.4 },
      { id: 'south-polar-night', label: '南极圈极夜区', role: 'polar-night', latRange: [-90, -66.5], intensity: latitude / 23.4 }
    ]
  }
  return [
    { id: 'north-polar-night', label: '北极圈极夜区', role: 'polar-night', latRange: [66.5, 90], intensity: Math.abs(latitude) / 23.4 },
    { id: 'south-polar-day', label: '南极圈极昼区', role: 'polar-day', latRange: [-90, -66.5], intensity: Math.abs(latitude) / 23.4 }
  ]
}

function impactArea(id, label, latRange, lngRange, effect, color) {
  return {
    id,
    label,
    effect,
    color,
    area: { latRange, lngRange }
  }
}

function formatLatitude(value) {
  if (Math.abs(value) < 0.5) return '赤道'
  return `${Math.abs(value).toFixed(1)}°${value > 0 ? 'N' : 'S'}`
}

function round(value) {
  return Number(value.toFixed(1))
}
