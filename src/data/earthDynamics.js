import { wikiCover } from './wikiImageManifest.js'

const dynamicCover = (id, fallback = '') => wikiCover('dynamic', id) || fallback

export const earthDynamicModes = [
  { id: 'earthquakes', label: '地震', description: '观察板块边界附近释放能量的位置。' },
  { id: 'volcanoes', label: '火山', description: '观察活火山、休眠火山与超级火山如何沿板块边界分布。' },
  { id: 'plates', label: '板块运动', description: '观察主要板块的边界与运动方向。' }
]

export const earthquakeWindows = [
  { id: '24h', label: '最近24小时', days: 1 },
  { id: '7d', label: '最近7天', days: 7 },
  { id: '30d', label: '最近30天', days: 30 }
]

export const earthquakeEvents = [
  { id: 'eq-japan-trench', name: '日本海沟地震带', magnitude: 5.7, window: '24h', lat: 38.4, lng: 143.2, depth: '36 km', summary: '太平洋板块向欧亚边缘俯冲，浅源到中源地震频繁。' },
  { id: 'eq-chile', name: '智利俯冲带', magnitude: 6.1, window: '24h', lat: -30.8, lng: -72.4, depth: '28 km', summary: '纳斯卡板块向南美板块下方俯冲，形成安第斯山脉与强震带。' },
  { id: 'eq-indonesia', name: '印尼巽他海沟', magnitude: 5.9, window: '7d', lat: -4.1, lng: 101.8, depth: '54 km', summary: '印度洋板块俯冲到巽他板块下方，地震、火山和海啸风险叠加。' },
  { id: 'eq-turkey', name: '安纳托利亚断层', magnitude: 5.3, window: '7d', lat: 39.2, lng: 38.9, depth: '12 km', summary: '阿拉伯板块挤压安纳托利亚，走滑断层释放水平位移能量。' },
  { id: 'eq-alaska', name: '阿拉斯加弧', magnitude: 5.5, window: '30d', lat: 54.5, lng: -160.2, depth: '42 km', summary: '太平洋板块沿阿留申弧俯冲，形成弧形岛链和火山地震系统。' },
  { id: 'eq-mid-atlantic', name: '大西洋中脊微震', magnitude: 4.8, window: '30d', lat: 0.6, lng: -28.7, depth: '10 km', summary: '板块在洋中脊分离，新洋壳形成时产生浅源地震。' }
]

export const volcanoFeatures = [
  { id: 'fuji', name: '富士山', status: 'active', cover_image: dynamicCover('fuji'), lat: 35.36, lng: 138.73, elevation: '3,776 m', plateContext: '太平洋板块俯冲影响日本岛弧。' },
  { id: 'kilimanjaro', name: '乞力马扎罗', status: 'dormant', cover_image: dynamicCover('kilimanjaro'), lat: -3.07, lng: 37.36, elevation: '5,895 m', plateContext: '东非裂谷系统拉张减薄地壳，岩浆活动沿裂谷上升。' },
  { id: 'etna', name: '埃特纳火山', status: 'active', cover_image: dynamicCover('etna'), lat: 37.75, lng: 14.99, elevation: '3,357 m', plateContext: '非洲板块与欧亚板块相互作用，形成地中海火山活动。' },
  { id: 'mauna-loa', name: '冒纳罗亚', status: 'active', cover_image: dynamicCover('mauna-loa'), lat: 19.47, lng: -155.59, elevation: '4,169 m', plateContext: '热点火山不在典型板块边界上，记录太平洋板块移动轨迹。' },
  { id: 'yellowstone', name: '黄石火山', status: 'supervolcano', cover_image: dynamicCover('yellowstone'), lat: 44.43, lng: -110.67, elevation: '2,805 m', plateContext: '大陆热点系统在北美板块下方形成大型火山口。' },
  { id: 'toba', name: '多巴火山', status: 'supervolcano', cover_image: dynamicCover('toba'), lat: 2.58, lng: 98.83, elevation: '火山湖 900 m', plateContext: '巽他俯冲系统孕育大型硅质岩浆库。' }
]

export const majorPlates = [
  {
    id: 'eurasian',
    name: '欧亚板块',
    cover_image: dynamicCover('eurasian'),
    center: [50, 70],
    motion: [42, 88],
    boundary: [[70, -10], [58, 40], [48, 85], [35, 105], [25, 125], [5, 135]],
    summary: '承载欧洲与亚洲大部分陆地，南缘与印度、阿拉伯和非洲板块碰撞。'
  },
  {
    id: 'pacific',
    name: '太平洋板块',
    cover_image: dynamicCover('pacific'),
    center: [2, -165],
    motion: [-6, -150],
    boundary: [[55, 160], [35, 145], [15, 142], [-15, 170], [-40, -170], [-20, -110], [20, -105], [50, -130]],
    summary: '最大海洋板块，沿环太平洋边缘俯冲，塑造海沟、岛弧和火山带。'
  },
  {
    id: 'indo-australian',
    name: '印度洋板块',
    cover_image: dynamicCover('indo-australian'),
    center: [-18, 92],
    motion: [-8, 78],
    boundary: [[20, 65], [8, 95], [-8, 115], [-28, 110], [-45, 80], [-25, 45], [5, 55]],
    summary: '向北挤压欧亚大陆，参与形成喜马拉雅和印尼俯冲系统。'
  },
  {
    id: 'african',
    name: '非洲板块',
    cover_image: dynamicCover('african'),
    center: [5, 22],
    motion: [12, 28],
    boundary: [[36, -10], [32, 35], [10, 48], [-20, 42], [-38, 18], [-25, -15], [5, -20]],
    summary: '东非裂谷显示大陆正在拉张，北缘与欧亚板块作用形成地中海地震火山带。'
  },
  {
    id: 'north-american',
    name: '北美板块',
    cover_image: dynamicCover('north-american'),
    center: [48, -105],
    motion: [52, -118],
    boundary: [[72, -150], [56, -130], [35, -122], [18, -95], [25, -55], [55, -35], [75, -80]],
    summary: '西缘与太平洋板块相互作用，形成断层、山脉与火山链。'
  },
  {
    id: 'south-american',
    name: '南美板块',
    cover_image: dynamicCover('south-american'),
    center: [-18, -58],
    motion: [-20, -70],
    boundary: [[10, -80], [-10, -78], [-32, -72], [-55, -70], [-45, -35], [-10, -25], [8, -45]],
    summary: '西缘受纳斯卡板块俯冲影响，形成安第斯山脉和强震带。'
  },
  {
    id: 'antarctic',
    name: '南极板块',
    cover_image: dynamicCover('antarctic'),
    center: [-75, 20],
    motion: [-68, 45],
    boundary: [[-58, -160], [-60, -80], [-58, 0], [-60, 80], [-58, 160], [-72, 120], [-76, 0], [-72, -120]],
    summary: '环绕南极大陆，与南大洋海岭系统和冰盖环境共同影响全球海洋循环。'
  }
]

export function getEarthDynamicMode(id) {
  return earthDynamicModes.find((mode) => mode.id === id) || earthDynamicModes[0]
}

export function getEarthquakes(windowId = '24h') {
  const window = earthquakeWindows.find((item) => item.id === windowId) || earthquakeWindows[0]
  if (window.id === '24h') return earthquakeEvents.filter((event) => event.window === '24h')
  if (window.id === '7d') return earthquakeEvents.filter((event) => ['24h', '7d'].includes(event.window))
  return earthquakeEvents
}
