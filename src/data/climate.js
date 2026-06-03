export const climateTypes = [
  { id: 'climate-type-tropical-rainforest', code: 'tropical_rainforest', name: 'Tropical Rainforest', label: '热带雨林', group: 'tropical', description: '赤道附近全年高温多雨、对流旺盛的森林气候。', color: '#0f8f5f' },
  { id: 'climate-type-tropical-monsoon', code: 'tropical_monsoon', name: 'Tropical Monsoon', label: '热带季风', group: 'monsoon', description: '受海陆热力差异和季风环流控制，干湿季分明。', color: '#16a878' },
  { id: 'climate-type-savanna', code: 'savanna', name: 'Savanna', label: '热带草原', group: 'tropical', description: '热带干湿季交替，草原、稀树与迁徙动物共同塑造景观。', color: '#8bbd45' },
  { id: 'climate-type-hot-desert', code: 'hot_desert', name: 'Hot Desert', label: '热带沙漠', group: 'arid', description: '副热带高压、寒流或大陆内部位置造成高温少雨。', color: '#e0b545' },
  { id: 'climate-type-cold-desert', code: 'cold_desert', name: 'Cold Desert', label: '冷沙漠', group: 'arid', description: '内陆、雨影或高纬环境中的低温干旱气候。', color: '#c7b37a' },
  { id: 'climate-type-mediterranean', code: 'mediterranean', name: 'Mediterranean', label: '地中海', group: 'temperate', description: '夏季干热、冬季温和多雨，常见于大陆西岸。', color: '#d98b44' },
  { id: 'climate-type-humid-subtropical', code: 'humid_subtropical', name: 'Humid Subtropical', label: '湿润亚热带', group: 'temperate', description: '温暖湿润、降水充足，常支撑稻作、森林和高密度城市。', color: '#53b56d' },
  { id: 'climate-type-temperate-monsoon', code: 'temperate_monsoon', name: 'Temperate Monsoon', label: '温带季风', group: 'monsoon', description: '温带大陆东岸受季风控制，夏雨冬干、四季分明。', color: '#4ea66f' },
  { id: 'climate-type-oceanic', code: 'oceanic', name: 'Oceanic', label: '海洋性', group: 'oceanic', description: '西风和海洋调节使冬夏温差小、降水均匀。', color: '#4aa7c7' },
  { id: 'climate-type-continental', code: 'continental', name: 'Continental', label: '大陆性', group: 'continental', description: '远离海洋调节，冬冷夏热、年温差大。', color: '#77a85d' },
  { id: 'climate-type-subarctic', code: 'subarctic', name: 'Subarctic', label: '亚寒带', group: 'cold', description: '漫长严冬和短促夏季塑造针叶林、冻土和低密度聚落。', color: '#4f86c6' },
  { id: 'climate-type-polar', code: 'polar', name: 'Polar', label: '极地', group: 'cold', description: '太阳高度低、冰雪反照率高，全年寒冷且生态脆弱。', color: '#e8f3f7' },
  { id: 'climate-type-highland', code: 'highland', name: 'Highland', label: '高山', group: 'highland', description: '海拔抬升让同一纬度出现垂直气候带。', color: '#91c4d7' }
]

export const climateGroups = [
  { code: 'tropical', label: '热带', description: '太阳辐射强，对流和水汽循环决定雨林、季雨林与草原边界。' },
  { code: 'temperate', label: '温带', description: '中纬度西风、海陆位置和季节变化共同塑造农业与城市带。' },
  { code: 'cold', label: '寒带', description: '低太阳高度、冰雪和冻土限制生态生产力与聚落密度。' },
  { code: 'highland', label: '高山', description: '海拔让气温、降水和植被沿坡面快速切换。' },
  { code: 'arid', label: '干旱', description: '高压下沉、雨影和大陆内部位置让蒸发远大于降水。' },
  { code: 'monsoon', label: '季风', description: '海陆热力差异驱动风向翻转，决定雨季、农业和人口密度。' },
  { code: 'oceanic', label: '海洋性', description: '海洋热容量、西风和洋流抹平温差，带来湿润稳定的环境。' },
  { code: 'continental', label: '大陆性', description: '远离海洋后，季节温差、寒潮和热浪成为核心气候体验。' }
]

export const climateFactors = [
  { id: 'factor-latitude', code: 'latitude', name: 'Latitude', label: '纬度', description: '决定太阳高度、昼夜长度和基础热量。' },
  { id: 'factor-altitude', code: 'altitude', name: 'Altitude', label: '海拔', description: '海拔升高使气温下降，并改变降水形态。' },
  { id: 'factor-ocean-current', code: 'ocean_current', name: 'Ocean Current', label: '洋流', description: '暖流增湿增温，寒流稳定空气并抑制降水。' },
  { id: 'factor-mountain-barrier', code: 'mountain_barrier', name: 'Mountain Barrier', label: '山地屏障', description: '山脉迫使气流抬升或制造雨影。' },
  { id: 'factor-monsoon', code: 'monsoon', name: 'Monsoon', label: '季风', description: '季节性风向转换重排降水和农业节律。' },
  { id: 'factor-pressure-system', code: 'pressure_system', name: 'Pressure System', label: '气压系统', description: '高压下沉变干，低压抬升成云成雨。' },
  { id: 'factor-solar-radiation', code: 'solar_radiation', name: 'Solar Radiation', label: '太阳辐射', description: '驱动热量、蒸发、对流和四季变化。' },
  { id: 'factor-land-sea-distribution', code: 'land_sea_distribution', name: 'Land Sea Distribution', label: '海陆分布', description: '海洋和陆地热容量不同，决定温差和风场。' }
]

export const climateColors = Object.fromEntries(climateTypes.map((type) => [type.code, type.color]))

const now = '2026-05-31T00:00:00.000Z'
const cachedUnsplash = (id) => `/images/cached/unsplash/${id}.jpg`
const specialCover = (id, ext = 'jpg') => `/images/cached/special/${id}.${ext}`
const image = (id) => cachedUnsplash(id)

function makeZone(zone) {
  const coverImage = zone.cover_image || ''
  return {
    created_at: now,
    updated_at: now,
    related_terrain: [],
    related_oceans: [],
    related_countries: [],
    related_routes: [],
    related_climate_ids: [],
    tags: [],
    factors: [],
    story_steps: [],
    ...zone,
    cover_image: coverImage,
    gallery_images: [coverImage, ...(zone.gallery_images || [])].filter(Boolean)
  }
}

export function climateTypeFor(code) {
  return climateTypes.find((type) => type.code === code) || null
}

export const climateZones = [
  makeZone({
    id: 'amazon-rainforest-climate',
    name: '亚马逊雨林气候',
    name_en: 'Amazon Rainforest Climate',
    type: 'tropical_rainforest',
    type_label: '热带雨林',
    group: 'tropical',
    continent: '南美洲',
    region: '亚马逊盆地',
    latitude: -3.5,
    longitude: -62.0,
    map_radius: 0.54,
    summary: '亚马逊雨林气候不是简单的“热而湿”。赤道辐射、巨量蒸散、低压对流和大西洋水汽循环叠加，使森林本身也参与制造降雨。',
    temperature: '全年高温，月均温多在 24-28°C，年温差小。',
    precipitation: '多数地区年降水量超过 2,000 mm，雨季明显但少有真正干季。',
    humidity: '空气湿度长期偏高，森林蒸散形成稳定的水汽回路。',
    wind_pattern: '信风把大西洋水汽推入内陆，对流云团在午后快速发展。',
    seasonality: '季节主要表现为雨量强弱变化，而非温度剧烈切换。',
    formation_reason: '低纬太阳辐射让地表持续受热，湿热空气上升形成赤道低压和强对流。亚马逊河网、森林蒸散和大西洋水汽共同维持“森林制造雨”的正反馈。',
    vegetation: '多层常绿阔叶林、藤本、附生植物和湿地森林共同构成高生物量系统。',
    wildlife: '灵长类、树懒、美洲豹、巨嘴鸟、河豚和昆虫多样性极高。',
    agriculture: '天然土壤养分多锁在生物循环中，粗放开垦容易导致肥力快速流失；适合多层混农林和小尺度可持续采集。',
    human_settlement: '聚落多沿河分布，交通、渔猎、贸易和城市扩张都依赖水系。',
    civilization_impact: '丰沛水网支撑河岸文化和跨区域交换，也让森林成为全球碳循环、水循环和气候稳定的重要调节器。',
    related_terrain: ['amazon-rainforest', 'amazon-river'],
    related_oceans: ['atlantic-ocean'],
    related_countries: ['BRA', 'PER', 'COL', 'VEN', 'BOL', 'ECU'],
    related_routes: ['atlantic-exchange'],
    related_climate_ids: ['congo-basin-rainforest-climate', 'indian-monsoon-climate'],
    factors: ['latitude', 'solar_radiation', 'pressure_system', 'land_sea_distribution'],
    story_steps: [
      { title: '赤道强辐射', text: '太阳高度大，地表和森林冠层持续加热。', factor: 'solar_radiation' },
      { title: '湿热空气上升', text: '水汽抬升、冷却并凝结成对流云。', factor: 'pressure_system' },
      { title: '森林蒸散补水', text: '树木把水重新送回大气，延长水汽在内陆的停留时间。', factor: 'land_sea_distribution' },
      { title: '雨林反过来塑造气候', text: '森林越完整，局地降雨和河流补给越稳定。', factor: 'latitude' }
    ],
    tags: ['赤道低压', '森林蒸散', '碳循环', '河网聚落'],
    cover_image: image('photo-1441974231531-c6227db76b6e')
  }),
  makeZone({
    id: 'congo-basin-rainforest-climate',
    name: '刚果盆地雨林气候',
    name_en: 'Congo Basin Rainforest Climate',
    type: 'tropical_rainforest',
    type_label: '热带雨林',
    group: 'tropical',
    continent: '非洲',
    region: '刚果盆地',
    latitude: -1.5,
    longitude: 23.0,
    map_radius: 0.44,
    summary: '刚果盆地位于赤道附近，盆地地形、河网和大西洋水汽让这里成为非洲最重要的湿热核心。',
    temperature: '全年温暖，月均温大多在 23-27°C。',
    precipitation: '年降水量通常在 1,500-2,200 mm，赤道两侧雨季节律交错。',
    humidity: '高湿环境常年维持，林下蒸发和云量稳定。',
    wind_pattern: '赤道辐合带南北摆动，叠加大西洋湿气输入。',
    seasonality: '干湿差异较亚马逊更明显，但核心区仍保持湿润。',
    formation_reason: '赤道低压带提供上升运动，盆地低洼地形汇集水汽与河流，周边高地限制空气快速外泄，使湿热环境长期稳定。',
    vegetation: '常绿雨林、沼泽林和河岸森林交织，形成连续的森林覆盖。',
    wildlife: '大猩猩、森林象、倭黑猩猩和丰富鸟类依赖大面积连通栖息地。',
    agriculture: '湿热气候适合木薯、蕉类和可可，但道路建设和采伐会迅速改变微气候。',
    human_settlement: '人口和城市多沿刚果河及支流分布，森林内部交通成本较高。',
    civilization_impact: '刚果河系统把内陆与大西洋连接起来，气候和水网共同塑造了贸易、迁徙和资源开发路径。',
    related_terrain: ['congo-basin'],
    related_oceans: ['atlantic-ocean'],
    related_countries: ['COD', 'COG', 'GAB', 'CMR', 'CAF', 'GNQ'],
    related_routes: ['atlantic-exchange'],
    related_climate_ids: ['amazon-rainforest-climate', 'sahara-desert-climate'],
    factors: ['latitude', 'pressure_system', 'land_sea_distribution'],
    story_steps: [
      { title: '赤道辐合', text: '湿空气在赤道附近汇聚并上升。', factor: 'pressure_system' },
      { title: '盆地蓄湿', text: '低洼地形和河网保存水汽，不让环境快速变干。', factor: 'land_sea_distribution' },
      { title: '森林保持降雨', text: '雨林蒸散维持云量和午后降雨。', factor: 'latitude' },
      { title: '水网连接聚落', text: '河流成为交通骨架，人口沿水系展开。', factor: 'land_sea_distribution' }
    ],
    tags: ['赤道辐合', '盆地蓄湿', '刚果河', '森林碳库'],
    cover_image: image('photo-1511497584788-876760111969')
  }),
  makeZone({
    id: 'indian-monsoon-climate',
    name: '印度季风气候',
    name_en: 'Indian Monsoon Climate',
    type: 'tropical_monsoon',
    type_label: '热带季风',
    group: 'monsoon',
    continent: '亚洲',
    region: '南亚次大陆',
    latitude: 21.0,
    longitude: 78.0,
    map_radius: 0.48,
    summary: '印度季风把海洋、陆地和喜马拉雅山连接成一个年度呼吸系统。雨季的到来决定播种、河流、城市排水和人口生活节奏。',
    temperature: '热季高温显著，雨季后温度下降，冬季较温和。',
    precipitation: '年雨量空间差异极大，从西北干旱区到东北山地超高降雨并存。',
    humidity: '雨季湿度急升，旱季内陆湿度下降明显。',
    wind_pattern: '夏季西南季风从印度洋带来水汽，冬季东北风转干。',
    seasonality: '热季、雨季、凉季非常清晰，农业和城市系统围绕雨季组织。',
    formation_reason: '夏季陆地升温快于海洋，低压吸引印度洋暖湿气流北上；喜马拉雅山阻挡气流继续北进并迫使其抬升降雨。',
    vegetation: '从季雨林、稀树草原到干旱灌丛呈梯度分布。',
    wildlife: '季节性水源塑造象群、鹿群、虎和湿地鸟类活动节律。',
    agriculture: '水稻、棉花、甘蔗和小麦高度依赖季风强弱；季风异常会直接改变粮食安全。',
    human_settlement: '恒河平原和沿海城市人口稠密，水利、堤防和排涝系统决定城市韧性。',
    civilization_impact: '季风雨和大河冲积平原支撑了南亚农业文明、港口贸易和宗教朝圣路线。',
    related_terrain: ['himalayas'],
    related_oceans: ['indian-ocean'],
    related_countries: ['IND', 'BGD', 'PAK', 'NPL', 'LKA'],
    related_routes: ['indian-ocean-trade', 'buddhist-spread'],
    related_climate_ids: ['east-asian-monsoon-climate', 'tibetan-highland-climate'],
    factors: ['monsoon', 'land_sea_distribution', 'mountain_barrier', 'solar_radiation'],
    story_steps: [
      { title: '夏季陆地快速升温', text: '南亚大陆形成低压，把海洋空气吸向内陆。', factor: 'land_sea_distribution' },
      { title: '印度洋水汽北上', text: '西南季风把暖湿空气推向半岛和恒河平原。', factor: 'monsoon' },
      { title: '喜马拉雅抬升气流', text: '山脉阻挡并抬升水汽，形成强降雨和河流补给。', factor: 'mountain_barrier' },
      { title: '农业文明跟随雨季', text: '播种、粮食、城市排水和节庆都围绕雨季展开。', factor: 'monsoon' }
    ],
    tags: ['西南季风', '喜马拉雅屏障', '稻作农业', '洪涝风险'],
    cover_image: image('photo-1500530855697-b586d89ba3ee')
  }),
  makeZone({
    id: 'east-asian-monsoon-climate',
    name: '东亚季风气候',
    name_en: 'East Asian Monsoon Climate',
    type: 'temperate_monsoon',
    type_label: '温带季风',
    group: 'monsoon',
    continent: '亚洲',
    region: '中国东部 / 朝鲜半岛 / 日本',
    latitude: 34.0,
    longitude: 112.0,
    map_radius: 0.46,
    summary: '东亚季风把太平洋水汽、欧亚大陆冷暖变化和青藏高原热力作用串联起来，形成密集农业和城市文明的气候基础。',
    temperature: '夏季炎热湿润，冬季寒冷干燥，南北温差明显。',
    precipitation: '降水集中在暖季，梅雨、台风雨和锋面雨共同贡献水量。',
    humidity: '夏季湿度高，冬季受大陆冷高压影响空气干燥。',
    wind_pattern: '夏季东南风和西南风输送水汽，冬季西北季风带来冷干空气。',
    seasonality: '四季分明，雨热同期让稻作和旱作农业都能发展。',
    formation_reason: '欧亚大陆和太平洋热力差异驱动季风反转；青藏高原像巨大的加热台和屏障，改变高空环流与雨带推进。',
    vegetation: '由亚热带常绿林向温带落叶林、针阔混交林逐渐过渡。',
    wildlife: '湿地鸟类、山地兽类和农田生态系统依赖季节性水热条件。',
    agriculture: '雨热同期支撑水稻、小麦、茶、桑和多熟制农业，但旱涝波动也极敏感。',
    human_settlement: '东部平原、河谷与沿海城市密集，水利工程和粮仓体系深受季风节律影响。',
    civilization_impact: '黄河、长江流域的农业国家、漕运体系和城市网络，都与季风雨带和河流泥沙密切相关。',
    related_terrain: ['tibetan-plateau', 'himalayas', 'yangtze-river', 'yellow-river'],
    related_oceans: ['pacific-ocean'],
    related_countries: ['CHN', 'JPN', 'KOR', 'PRK'],
    related_routes: ['silk-road', 'buddhist-spread'],
    related_climate_ids: ['indian-monsoon-climate', 'north-american-continental-climate'],
    factors: ['monsoon', 'land_sea_distribution', 'mountain_barrier', 'pressure_system'],
    story_steps: [
      { title: '海陆热力差异', text: '夏季大陆升温快，太平洋提供水汽。', factor: 'land_sea_distribution' },
      { title: '雨带向北推进', text: '锋面和季风把降水从华南推向江淮、华北和东北。', factor: 'monsoon' },
      { title: '青藏高原改写环流', text: '高原加热和地形屏障影响高空风场。', factor: 'mountain_barrier' },
      { title: '雨热同期支撑文明', text: '高产农业、人口密度和城市网络在季风区扩展。', factor: 'pressure_system' }
    ],
    tags: ['雨热同期', '梅雨锋面', '台风雨', '农业文明'],
    cover_image: image('photo-1470115636492-6d2b56f9146d')
  }),
  makeZone({
    id: 'sahara-desert-climate',
    name: '撒哈拉沙漠气候',
    name_en: 'Sahara Desert Climate',
    type: 'hot_desert',
    type_label: '热带沙漠',
    group: 'arid',
    continent: '非洲',
    region: '北非撒哈拉',
    latitude: 23.5,
    longitude: 13.0,
    map_radius: 0.62,
    summary: '撒哈拉的核心不是“沙子很多”，而是大气长期下沉。副热带高压让云很难长大，少雨环境再反过来扩大裸地和强烈加热。',
    temperature: '白天高温极端，昼夜温差大，夏季地表温度可非常高。',
    precipitation: '大部分地区年降水量低于 100 mm，且高度不稳定。',
    humidity: '空气干燥，蒸发潜力远大于降水。',
    wind_pattern: '东北信风、哈马丹风和局地热低压共同推动沙尘输送。',
    seasonality: '季节差异主要表现为热量和风沙强度变化，雨季弱且不稳定。',
    formation_reason: '副热带高压带使空气下沉增温，云难以凝结；北非大陆面积大、远离稳定水汽来源，部分海岸还受寒流稳定空气影响。',
    vegetation: '植被稀疏，主要为耐旱灌木、短命草本和绿洲植被。',
    wildlife: '骆驼、耳廓狐、蜥蜴、蝎类和迁徙鸟类适应高温缺水。',
    agriculture: '农业集中在绿洲、河谷和地下水可及处，灌溉决定生产边界。',
    human_settlement: '人口沿尼罗河、绿洲和商路节点分布，水源比土地面积更决定聚落。',
    civilization_impact: '沙漠既是屏障也是通道，绿洲和驼队贸易把地中海、尼罗河和撒哈拉以南非洲连接起来。',
    related_terrain: ['sahara-desert'],
    related_oceans: ['atlantic-ocean', 'mediterranean-sea'],
    related_countries: ['EGY', 'DZA', 'LBY', 'MAR', 'TUN', 'MLI', 'NER', 'TCD', 'SDN'],
    related_routes: ['trans-saharan-trade'],
    related_climate_ids: ['arabian-desert-climate', 'congo-basin-rainforest-climate'],
    factors: ['pressure_system', 'latitude', 'ocean_current', 'land_sea_distribution'],
    story_steps: [
      { title: '副热带高压控制', text: '空气下沉增温，云层被压散。', factor: 'pressure_system' },
      { title: '降水难以形成', text: '水汽不足，抬升机制弱，雨云很少发展。', factor: 'latitude' },
      { title: '裸地强化加热', text: '稀疏植被和强日照让地表继续变热变干。', factor: 'solar_radiation' },
      { title: '绿洲成为文明节点', text: '有限水源决定交通、贸易和聚落位置。', factor: 'land_sea_distribution' }
    ],
    tags: ['副热带高压', '下降气流', '绿洲', '沙尘输送'],
    cover_image: image('photo-1509316785289-025f5b846b35')
  }),
  makeZone({
    id: 'arabian-desert-climate',
    name: '阿拉伯沙漠气候',
    name_en: 'Arabian Desert Climate',
    type: 'hot_desert',
    type_label: '热带沙漠',
    group: 'arid',
    continent: '亚洲',
    region: '阿拉伯半岛',
    latitude: 23.0,
    longitude: 45.0,
    map_radius: 0.44,
    summary: '阿拉伯半岛处在副热带高压和大陆性干旱的交界，海洋近在周围，却很难把稳定雨水送进内陆。',
    temperature: '夏季极热，冬季较温和，昼夜温差在内陆显著。',
    precipitation: '年降水量低且不稳定，局地暴雨可能造成短时洪水。',
    humidity: '沿海湿热，内陆干燥，体感差异很大。',
    wind_pattern: '夏季沙马风和局地热低压常带来沙尘，季风主要影响南缘山地。',
    seasonality: '长时间干旱，被短促降雨事件打断。',
    formation_reason: '副热带下沉气流抑制降雨，半岛内部缺少高大河流和稳定水汽通道；周边海域虽近，但热稳定层和风向限制水汽深入。',
    vegetation: '荒漠灌丛、短命草本和绿洲椰枣林为主。',
    wildlife: '阿拉伯羚羊、沙狐、爬行动物和迁徙鸟类依赖稀疏水源。',
    agriculture: '传统农业依赖绿洲、山地雨水和地下水；现代灌溉提高产量但带来水资源压力。',
    human_settlement: '城镇集中在海岸、绿洲和油气资源节点，淡化海水和管网成为城市生命线。',
    civilization_impact: '干旱环境塑造了游牧、商路、港口贸易和朝圣网络，也让水管理成为国家发展核心。',
    related_terrain: ['sahara-desert'],
    related_oceans: ['red-sea', 'arabian-sea', 'persian-gulf'],
    related_countries: ['SAU', 'ARE', 'OMN', 'YEM', 'QAT', 'KWT', 'IRQ', 'JOR'],
    related_routes: ['indian-ocean-trade'],
    related_climate_ids: ['sahara-desert-climate', 'australian-interior-arid-climate'],
    factors: ['pressure_system', 'land_sea_distribution', 'solar_radiation'],
    story_steps: [
      { title: '高压下沉', text: '副热带高压让空气变暖变干。', factor: 'pressure_system' },
      { title: '水汽进不来', text: '海洋环绕但风场和稳定层限制水汽深入内陆。', factor: 'land_sea_distribution' },
      { title: '短雨变成洪水', text: '硬化干地无法快速吸收暴雨，形成突发径流。', factor: 'solar_radiation' },
      { title: '水工程支撑城市', text: '淡化、地下水和管网决定现代聚落规模。', factor: 'land_sea_distribution' }
    ],
    tags: ['高压干旱', '沙马风', '淡化海水', '绿洲农业'],
    cover_image: image('photo-1488197047962-b48492212cda')
  }),
  makeZone({
    id: 'mediterranean-climate',
    name: '地中海气候',
    name_en: 'Mediterranean Climate',
    type: 'mediterranean',
    type_label: '地中海',
    group: 'temperate',
    continent: '欧洲 / 非洲 / 亚洲',
    region: '地中海沿岸',
    latitude: 38.0,
    longitude: 15.0,
    map_radius: 0.42,
    summary: '地中海气候的关键是季节性换挡：夏季被副热带高压压干，冬季被西风带带来雨。橄榄、葡萄、港口和城邦都在这个节律中出现。',
    temperature: '夏季炎热或温暖，冬季温和，霜冻少。',
    precipitation: '雨水集中在冬半年，夏季显著干燥。',
    humidity: '沿海湿度适中，夏季内陆干热。',
    wind_pattern: '夏季受高压控制，冬季西风和气旋活动增强。',
    seasonality: '夏干冬雨是最重要的节律，火灾风险也随夏季升高。',
    formation_reason: '夏季副热带高压北移，抑制云雨；冬季高压南退，西风带和温带气旋带来降水。',
    vegetation: '硬叶常绿灌丛、松林、橄榄树、葡萄藤和香草植物适应夏季干旱。',
    wildlife: '鸟类迁徙、山地兽类和沿海生态受季节性水源控制。',
    agriculture: '葡萄、橄榄、柑橘、小麦和牧业形成典型混合农业景观。',
    human_settlement: '港口、梯田、山海之间的城市和避暑聚落共同构成密集人居带。',
    civilization_impact: '温和冬季、夏季晴朗和内海交通促进了地中海贸易、城市国家和饮食文化。',
    related_terrain: ['alps'],
    related_oceans: ['mediterranean-sea', 'atlantic-ocean'],
    related_countries: ['ESP', 'FRA', 'ITA', 'GRC', 'TUR', 'MAR', 'DZA'],
    related_routes: ['mediterranean-ports', 'silk-road'],
    related_climate_ids: ['british-oceanic-climate', 'western-europe-oceanic-climate'],
    factors: ['pressure_system', 'latitude', 'ocean_current', 'land_sea_distribution'],
    story_steps: [
      { title: '夏季高压北移', text: '下沉气流让天空晴朗、雨水减少。', factor: 'pressure_system' },
      { title: '冬季西风回归', text: '气旋和锋面带来主要降水。', factor: 'land_sea_distribution' },
      { title: '植物适应夏旱', text: '硬叶、深根和休眠策略保存水分。', factor: 'solar_radiation' },
      { title: '农业文化成形', text: '葡萄、橄榄、港口贸易和城市生活围绕夏干冬雨组织。', factor: 'latitude' }
    ],
    tags: ['夏干冬雨', '西风带', '葡萄橄榄', '火灾风险'],
    cover_image: image('photo-1533105079780-92b9be482077')
  }),
  makeZone({
    id: 'british-oceanic-climate',
    name: '英国海洋性气候',
    name_en: 'British Oceanic Climate',
    type: 'oceanic',
    type_label: '海洋性',
    group: 'oceanic',
    continent: '欧洲',
    region: '不列颠群岛',
    latitude: 54.0,
    longitude: -2.0,
    map_radius: 0.24,
    summary: '英国的温和多云来自大西洋。西风、北大西洋暖流和岛屿位置把冬天变暖，也让天空经常被云雨占据。',
    temperature: '冬季较同纬度内陆温和，夏季凉爽，年温差小。',
    precipitation: '全年都有降水，西部迎风山地更多。',
    humidity: '湿度较高，多云和雾霭常见。',
    wind_pattern: '盛行西风把大西洋气团持续带入岛屿。',
    seasonality: '四季温差不剧烈，天气变化频繁。',
    formation_reason: '北大西洋暖流输送热量，盛行西风把海洋空气带上陆地；岛屿四周被海洋包围，削弱极端冷热。',
    vegetation: '温带落叶林、草地、石楠荒原和湿地景观并存。',
    wildlife: '海鸟、湿地鸟类、鹿类和温带林地物种受温和湿润环境支撑。',
    agriculture: '草场、奶畜、小麦和根茎作物适应湿润凉爽环境。',
    human_settlement: '港口城市、工业城镇和交通网络依赖可通航海岸与温和气候。',
    civilization_impact: '温和冬季、海港和煤铁工业共同推动英国城市化、海上贸易和工业革命。',
    related_terrain: [],
    related_oceans: ['atlantic-ocean', 'north-sea'],
    related_countries: ['GBR', 'IRL'],
    related_routes: ['atlantic-exchange'],
    related_climate_ids: ['western-europe-oceanic-climate', 'mediterranean-climate'],
    factors: ['ocean_current', 'land_sea_distribution', 'latitude'],
    story_steps: [
      { title: '暖流输热', text: '北大西洋暖流把低纬热量送向西欧。', factor: 'ocean_current' },
      { title: '西风带送湿', text: '盛行西风不断把海洋气团推向岛屿。', factor: 'land_sea_distribution' },
      { title: '海洋削弱极端', text: '海水热容量大，冬夏温差被抹平。', factor: 'land_sea_distribution' },
      { title: '港口城市扩展', text: '温和气候与海岸线帮助贸易和工业聚集。', factor: 'ocean_current' }
    ],
    tags: ['北大西洋暖流', '盛行西风', '多云湿润', '港口城市'],
    cover_image: image('photo-1505761671935-60b3a7427bad')
  }),
  makeZone({
    id: 'western-europe-oceanic-climate',
    name: '西欧海洋性气候',
    name_en: 'Western Europe Oceanic Climate',
    type: 'oceanic',
    type_label: '海洋性',
    group: 'oceanic',
    continent: '欧洲',
    region: '法国西部 / 比荷卢 / 德国西北部',
    latitude: 49.0,
    longitude: 4.0,
    map_radius: 0.34,
    summary: '西欧海洋性气候把农业、河流、港口和城市带连成一片。温和湿润减少生存压力，也提高了交通和生产的连续性。',
    temperature: '冬季温和，夏季不极端，年温差较小。',
    precipitation: '全年分配较均匀，西部和山地迎风坡更多。',
    humidity: '湿度中高，多云天气和锋面降雨频繁。',
    wind_pattern: '西风带和大西洋气旋控制天气变化。',
    seasonality: '四季存在，但极端冷热比同纬度内陆弱。',
    formation_reason: '北大西洋暖流、盛行西风和大西洋开阔水面持续调节温度与降水，使西欧比同纬度内陆更温和。',
    vegetation: '温带落叶林、草地和农田镶嵌分布。',
    wildlife: '湿地、河口和森林物种依赖温和湿润环境。',
    agriculture: '乳畜业、小麦、甜菜和葡萄边界共同形成高强度农业。',
    human_settlement: '莱茵河、塞纳河、低地港口和城市群在温和气候下高密度扩展。',
    civilization_impact: '稳定农业、河海交通和城市网络促进了商业、工业和国家治理能力的发展。',
    related_terrain: ['alps'],
    related_oceans: ['atlantic-ocean', 'north-sea'],
    related_countries: ['FRA', 'BEL', 'NLD', 'DEU', 'DNK'],
    related_routes: ['atlantic-exchange', 'mediterranean-ports'],
    related_climate_ids: ['british-oceanic-climate', 'north-american-continental-climate'],
    factors: ['ocean_current', 'land_sea_distribution', 'latitude'],
    story_steps: [
      { title: '大西洋调温', text: '海洋让冬季不至于过冷。', factor: 'ocean_current' },
      { title: '西风频繁过境', text: '锋面和气旋让降水均匀出现。', factor: 'pressure_system' },
      { title: '河海交通稳定', text: '温和环境让港口和内河全年更可用。', factor: 'land_sea_distribution' },
      { title: '城市群成形', text: '农业剩余、贸易和工业在低地密集连接。', factor: 'latitude' }
    ],
    tags: ['西风带', '暖流调温', '均匀降水', '城市群'],
    cover_image: image('photo-1467269204594-9661b134dd2b')
  }),
  makeZone({
    id: 'siberian-subarctic-climate',
    name: '西伯利亚寒带气候',
    name_en: 'Siberian Subarctic Climate',
    type: 'subarctic',
    type_label: '亚寒带',
    group: 'cold',
    continent: '亚洲',
    region: '西伯利亚内陆',
    latitude: 62.0,
    longitude: 100.0,
    map_radius: 0.54,
    summary: '西伯利亚的寒冷来自纬度，也来自大陆尺度。远离海洋后，冬季冷空气可以在内陆堆积，形成漫长、干冷、低人口密度的环境。',
    temperature: '冬季严寒漫长，夏季短而可较暖，年温差极大。',
    precipitation: '降水不多，多集中在夏季，冬季以少量降雪为主。',
    humidity: '冬季空气干冷，夏季局地湿地和森林增加湿度。',
    wind_pattern: '冬季受西伯利亚高压控制，冷空气外流影响东亚。',
    seasonality: '冻结期长，融雪和短夏决定生态生产窗口。',
    formation_reason: '高纬太阳辐射弱，欧亚大陆内部远离海洋调节；冬季地表强烈冷却形成稳定高压和温度逆温。',
    vegetation: '泰加针叶林、沼泽、苔原边缘和多年冻土景观广泛分布。',
    wildlife: '驯鹿、棕熊、狼、貂类和候鸟围绕短暂夏季活动。',
    agriculture: '农业窗口短，主要局限于南缘河谷和较温暖地区。',
    human_settlement: '城市和交通常沿铁路、矿产、河流和能源基地展开，建设要面对冻土。',
    civilization_impact: '寒冷限制人口密度，却保存森林、矿产和能源资源，并通过冷空气影响东亚气候。',
    related_terrain: ['baikal-lake'],
    related_oceans: ['arctic-ocean'],
    related_countries: ['RUS'],
    related_routes: ['silk-road'],
    related_climate_ids: ['greenland-polar-climate', 'north-american-continental-climate'],
    factors: ['latitude', 'land_sea_distribution', 'pressure_system'],
    story_steps: [
      { title: '高纬低太阳', text: '冬季太阳高度低，地表持续散热。', factor: 'latitude' },
      { title: '大陆内部冷却', text: '远离海洋调温，冷空气在内陆积累。', factor: 'land_sea_distribution' },
      { title: '西伯利亚高压', text: '冷而重的空气形成稳定高压并向外扩散。', factor: 'pressure_system' },
      { title: '短夏限制生活', text: '生态、农业和建设都被短促解冻期约束。', factor: 'latitude' }
    ],
    tags: ['西伯利亚高压', '多年冻土', '泰加林', '寒潮源地'],
    cover_image: image('photo-1483664852095-d6cc6870702d')
  }),
  makeZone({
    id: 'greenland-polar-climate',
    name: '格陵兰极地气候',
    name_en: 'Greenland Polar Climate',
    type: 'polar',
    type_label: '极地',
    group: 'cold',
    continent: '北美洲',
    region: '格陵兰冰盖',
    latitude: 72.0,
    longitude: -40.0,
    map_radius: 0.34,
    summary: '格陵兰气候由高纬、冰盖和反照率共同锁定。冰雪把太阳能量反射回去，冷环境又让冰盖得以保存。',
    temperature: '全年寒冷，内陆冰盖冬季极低温，沿海略受海洋调节。',
    precipitation: '总量不大，多以雪的形式积累，边缘地区差异明显。',
    humidity: '寒冷空气含水量低，沿海风暴可带来湿气。',
    wind_pattern: '冰盖下坡风、极地东风和北大西洋风暴共同影响沿海。',
    seasonality: '极昼极夜造成光照季节强烈切换，但温度仍长期偏低。',
    formation_reason: '高纬度太阳高度低，冰雪高反照率减少吸热；厚冰盖抬高地表海拔，使气温进一步下降。',
    vegetation: '沿海无冰区有苔原、苔藓、地衣和矮小灌木。',
    wildlife: '北极熊、海豹、鲸类、海鸟和驯鹿依赖海冰与沿海生态。',
    agriculture: '农业极少，沿海温室和牧羊受限于短夏。',
    human_settlement: '聚落集中在无冰海岸，渔业、航运、科研和气候监测重要。',
    civilization_impact: '极地气候限制大规模农业，却深刻影响北大西洋航线、原住民生活和全球海平面风险。',
    related_terrain: ['greenland-ice-sheet'],
    related_oceans: ['arctic-ocean', 'atlantic-ocean'],
    related_countries: ['GRL', 'DNK'],
    related_routes: ['atlantic-exchange'],
    related_climate_ids: ['siberian-subarctic-climate', 'tibetan-highland-climate'],
    factors: ['latitude', 'altitude', 'solar_radiation', 'ocean_current'],
    story_steps: [
      { title: '低太阳高度', text: '高纬让入射能量少，冬季还有极夜。', factor: 'latitude' },
      { title: '冰雪反照率', text: '白色冰盖把大量阳光反射回太空。', factor: 'solar_radiation' },
      { title: '冰盖抬高地表', text: '海拔升高进一步降低气温。', factor: 'altitude' },
      { title: '全球水位相连', text: '冰盖变化会影响海平面和北大西洋系统。', factor: 'ocean_current' }
    ],
    tags: ['极地冰盖', '反照率', '极昼极夜', '海平面'],
    cover_image: image('photo-1517783999520-f068d7431a60')
  }),
  makeZone({
    id: 'tibetan-highland-climate',
    name: '青藏高原高山气候',
    name_en: 'Tibetan Plateau Highland Climate',
    type: 'highland',
    type_label: '高山',
    group: 'highland',
    continent: '亚洲',
    region: '青藏高原',
    latitude: 32.0,
    longitude: 88.0,
    map_radius: 0.42,
    summary: '青藏高原把大气抬到四千米以上，也把亚洲季风和西风带重新组织。这里的气候不是纬度决定，而是海拔重写了纬度。',
    temperature: '气温显著低于同纬度低地，昼夜温差大，冬季寒冷。',
    precipitation: '东南部受季风影响较湿，西北部干冷，降水梯度强烈。',
    humidity: '整体空气稀薄偏干，河谷和湖区局地湿度较高。',
    wind_pattern: '西风、季风和高原热力环流相互作用。',
    seasonality: '短夏、长冬、强辐射和冻融循环决定生态节律。',
    formation_reason: '板块碰撞抬升地表，海拔升高导致气温下降；高原作为巨大热源和屏障，重塑周边风场与降水。',
    vegetation: '高寒草甸、高寒草原、灌丛、湿地和雪线以上裸岩冰川分布明显。',
    wildlife: '藏羚羊、野牦牛、雪豹、黑颈鹤等适应低氧和寒冷。',
    agriculture: '青稞、牧业和河谷农业是核心，人类活动受热量和水源强约束。',
    human_settlement: '城镇多在河谷和交通节点，基础设施必须应对冻土、缺氧和生态脆弱。',
    civilization_impact: '高原气候塑造游牧、寺院网络、朝圣路线和亚洲水塔，对下游国家发展有长程影响。',
    related_terrain: ['tibetan-plateau', 'himalayas', 'yangtze-river', 'yellow-river'],
    related_oceans: [],
    related_countries: ['CHN', 'NPL', 'IND', 'BTN'],
    related_routes: ['silk-road', 'buddhist-spread'],
    related_climate_ids: ['indian-monsoon-climate', 'east-asian-monsoon-climate', 'andes-highland-climate'],
    factors: ['altitude', 'mountain_barrier', 'solar_radiation', 'monsoon'],
    story_steps: [
      { title: '地表被抬高', text: '板块碰撞把大陆抬升到稀薄冷空气中。', factor: 'altitude' },
      { title: '气温随海拔下降', text: '同纬度下，高原比低地冷得多。', factor: 'altitude' },
      { title: '屏障改变水汽', text: '山脉阻挡季风，也制造干湿差异。', factor: 'mountain_barrier' },
      { title: '亚洲水塔形成', text: '冰雪和湖泊影响多条大河的补给。', factor: 'monsoon' }
    ],
    tags: ['高原热源', '亚洲水塔', '垂直地带', '冻土'],
    cover_image: image('photo-1544735716-392fe2489ffa')
  }),
  makeZone({
    id: 'andes-highland-climate',
    name: '安第斯山高山气候',
    name_en: 'Andes Highland Climate',
    type: 'highland',
    type_label: '高山',
    group: 'highland',
    continent: '南美洲',
    region: '安第斯山脉',
    latitude: -15.0,
    longitude: -70.0,
    map_radius: 0.48,
    summary: '安第斯山把热带、沙漠、冰川和高原农业压缩到一条山脊上。海拔决定温度，山脉决定水汽去向。',
    temperature: '随海拔快速下降，昼夜温差大，热带山地也可有寒冷夜晚。',
    precipitation: '东坡受亚马逊水汽影响较湿，西坡和内陆高原则可极干。',
    humidity: '坡向差异强，云雾林和干旱高原相距不远。',
    wind_pattern: '东侧湿气抬升，西侧受副热带高压和寒流影响偏干。',
    seasonality: '雨季、旱季和海拔带共同决定农业窗口。',
    formation_reason: '纳斯卡板块俯冲抬升山脉，巨大海拔差制造垂直气候带；山体截留亚马逊水汽，也加剧太平洋侧干旱。',
    vegetation: '云雾林、普纳草原、高山灌丛、冰川裸地和河谷农田交错。',
    wildlife: '美洲驼、羊驼、安第斯神鹰、眼镜熊和高山湿地物种适应坡向差异。',
    agriculture: '梯田、马铃薯、藜麦、玉米和牧业依赖海拔带选择。',
    human_settlement: '城市和村落多位于高原盆地、河谷和矿业节点。',
    civilization_impact: '垂直气候带让安第斯文明发展出跨海拔资源交换，山路和梯田成为国家组织能力的一部分。',
    related_terrain: ['andes'],
    related_oceans: ['pacific-ocean'],
    related_countries: ['PER', 'BOL', 'CHL', 'ARG', 'ECU', 'COL'],
    related_routes: ['andes-terraces'],
    related_climate_ids: ['tibetan-highland-climate', 'amazon-rainforest-climate'],
    factors: ['altitude', 'mountain_barrier', 'ocean_current'],
    story_steps: [
      { title: '俯冲抬升山脉', text: '板块运动制造巨大的海拔差。', factor: 'altitude' },
      { title: '坡向重排水汽', text: '东坡接住亚马逊湿气，西坡进入雨影。', factor: 'mountain_barrier' },
      { title: '垂直气候带出现', text: '谷地、云雾林、高原和雪线在短距离内切换。', factor: 'altitude' },
      { title: '文明跨海拔组织', text: '作物、牧场和道路沿不同高度互补。', factor: 'mountain_barrier' }
    ],
    tags: ['垂直气候带', '雨影', '梯田农业', '高原城市'],
    cover_image: image('photo-1526392060635-9d6019884377')
  }),
  makeZone({
    id: 'australian-interior-arid-climate',
    name: '澳大利亚内陆干旱气候',
    name_en: 'Australian Interior Arid Climate',
    type: 'hot_desert',
    type_label: '热带沙漠',
    group: 'arid',
    continent: '大洋洲',
    region: '澳大利亚内陆',
    latitude: -24.0,
    longitude: 133.0,
    map_radius: 0.42,
    summary: '澳大利亚内陆干旱来自副热带高压、平坦大陆和水汽通道不足。海岸并不远，但稳定雨水难以跨过广阔内陆。',
    temperature: '夏季炎热，冬季夜间可明显降温，昼夜温差大。',
    precipitation: '年降水量低且高度变率，暴雨事件间隔长。',
    humidity: '内陆空气干燥，蒸发强烈。',
    wind_pattern: '热低压、信风和偶发热带系统共同影响降雨事件。',
    seasonality: '北部受季风边缘影响，南部更多受温带系统偶发影响。',
    formation_reason: '大陆主体位于副热带高压控制区，地形总体平坦且缺少持续抬升机制；水汽输送常在沿海或北部耗散。',
    vegetation: '荒漠灌丛、金合欢、桉树疏林和短命草本适应干旱周期。',
    wildlife: '袋鼠、蜥蜴、鸸鹋和夜行小型哺乳动物适应热旱。',
    agriculture: '畜牧、地下水和矿业城镇是主要活动，耕作受降雨不确定性限制。',
    human_settlement: '人口极度集中在海岸，内陆聚落依赖道路、铁路、矿产和水源。',
    civilization_impact: '干旱格局让澳大利亚国家发展呈现海岸集中、内陆资源型和强水管理特征。',
    related_terrain: [],
    related_oceans: ['indian-ocean', 'pacific-ocean'],
    related_countries: ['AUS'],
    related_routes: ['indian-ocean-trade'],
    related_climate_ids: ['sahara-desert-climate', 'arabian-desert-climate'],
    factors: ['pressure_system', 'land_sea_distribution', 'solar_radiation'],
    story_steps: [
      { title: '副热带高压常驻', text: '下沉空气抑制云雨。', factor: 'pressure_system' },
      { title: '水汽难入内陆', text: '宽广大陆让海洋湿气难以持续深入。', factor: 'land_sea_distribution' },
      { title: '蒸发大于降水', text: '强日照让偶发雨水很快被消耗。', factor: 'solar_radiation' },
      { title: '人口转向海岸', text: '稳定水源和港口让城市集中在沿海。', factor: 'land_sea_distribution' }
    ],
    tags: ['副热带高压', '内陆干旱', '海岸城市', '矿业城镇'],
    cover_image: specialCover('australian-outback')
  }),
  makeZone({
    id: 'north-american-continental-climate',
    name: '北美大陆性气候',
    name_en: 'North American Continental Climate',
    type: 'continental',
    type_label: '大陆性',
    group: 'continental',
    continent: '北美洲',
    region: '北美内陆平原',
    latitude: 43.0,
    longitude: -95.0,
    map_radius: 0.5,
    summary: '北美大陆性气候把大平原变成农业带，也让龙卷风、寒潮和热浪频繁登场。没有东西向山脉阻隔，冷暖空气可以长距离冲撞。',
    temperature: '冬季寒冷，夏季温暖到炎热，年温差较大。',
    precipitation: '东部较湿，向西逐渐变干，春夏对流降雨重要。',
    humidity: '墨西哥湾水汽可让夏季湿度快速升高，西部内陆较干。',
    wind_pattern: '北极冷空气、落基山背风气流和墨西哥湾暖湿气流频繁交汇。',
    seasonality: '四季分明，春季强对流、冬季暴风雪和夏季热浪都常见。',
    formation_reason: '内陆远离海洋调温，南北向平原允许冷暖气团无阻推进；落基山改变西风和降水，墨西哥湾提供暖湿水汽。',
    vegetation: '草原、落叶林、湿地和农田随降水梯度分布。',
    wildlife: '草原鸟类、鹿、野牛恢复种群和湿地生物依赖季节性生态。',
    agriculture: '玉米、小麦、大豆和牧业构成世界级粮食带，但对干旱、洪涝和极端天气敏感。',
    human_settlement: '铁路、公路、谷仓城市和农业加工中心沿平原展开。',
    civilization_impact: '大陆性气候和肥沃平原支撑美国、加拿大的粮食生产、内陆城市和国家扩张路径。',
    related_terrain: ['grand-canyon'],
    related_oceans: ['atlantic-ocean', 'pacific-ocean', 'gulf-of-mexico'],
    related_countries: ['USA', 'CAN'],
    related_routes: ['atlantic-exchange'],
    related_climate_ids: ['siberian-subarctic-climate', 'western-europe-oceanic-climate'],
    factors: ['land_sea_distribution', 'latitude', 'mountain_barrier', 'pressure_system'],
    story_steps: [
      { title: '内陆失去海洋缓冲', text: '冬夏温差变大，极端温度更容易出现。', factor: 'land_sea_distribution' },
      { title: '南北气团长驱直入', text: '平原让冷空气和暖湿空气快速相遇。', factor: 'latitude' },
      { title: '强对流生成', text: '温差和湿度差推动雷暴、龙卷风和暴雨。', factor: 'pressure_system' },
      { title: '粮食带形成', text: '平原、土壤和雨热条件支撑机械化农业。', factor: 'land_sea_distribution' }
    ],
    tags: ['年温差大', '强对流', '粮食带', '寒潮热浪'],
    cover_image: image('photo-1500382017468-9049fed747ef')
  })
]

export const climateRelations = climateZones.flatMap((zone) => [
  ...zone.related_countries.map((code) => ({
    id: `${zone.id}-country-${code}`,
    climate_id: zone.id,
    target_type: 'country',
    target_id: code
  })),
  ...zone.related_terrain.map((terrainId) => ({
    id: `${zone.id}-terrain-${terrainId}`,
    climate_id: zone.id,
    target_type: 'terrain',
    target_id: terrainId
  })),
  ...zone.related_oceans.map((oceanId) => ({
    id: `${zone.id}-ocean-${oceanId}`,
    climate_id: zone.id,
    target_type: 'ocean',
    target_id: oceanId
  })),
  ...zone.related_routes.map((routeId) => ({
    id: `${zone.id}-route-${routeId}`,
    climate_id: zone.id,
    target_type: 'route',
    target_id: routeId
  }))
])

export function getClimateZone(id) {
  return climateZones.find((zone) => zone.id === id || zone.name_en === id || zone.name === id) || null
}

export function filterClimateZones(zones = climateZones, filters = {}) {
  const type = String(filters.type || '').trim()
  const group = String(filters.group || '').trim()
  const continent = String(filters.continent || '').trim()
  const country = String(filters.country || '').trim().toUpperCase()
  const terrain = String(filters.terrain || '').trim()
  const factor = String(filters.factor || '').trim()
  const keyword = String(filters.keyword || filters.q || '').trim().toLowerCase()

  return zones.filter((zone) => {
    if (type && zone.type !== type) return false
    if (group && zone.group !== group) return false
    if (continent && zone.continent !== continent) return false
    if (country && !zone.related_countries.includes(country)) return false
    if (terrain && !zone.related_terrain.includes(terrain)) return false
    if (factor && !zone.factors.includes(factor)) return false
    if (!keyword) return true
    const haystack = [
      zone.name,
      zone.name_en,
      zone.type_label,
      zone.group,
      zone.continent,
      zone.region,
      zone.summary,
      zone.temperature,
      zone.precipitation,
      zone.humidity,
      zone.wind_pattern,
      zone.seasonality,
      zone.formation_reason,
      zone.vegetation,
      zone.wildlife,
      zone.agriculture,
      zone.human_settlement,
      zone.civilization_impact,
      ...zone.tags,
      ...zone.factors,
      ...zone.related_countries,
      ...zone.related_terrain,
      ...zone.related_oceans,
      ...zone.related_routes
    ].join(' ').toLowerCase()
    return haystack.includes(keyword)
  })
}

export function featuredClimateZones(limit = 6) {
  const priority = [
    'amazon-rainforest-climate',
    'indian-monsoon-climate',
    'sahara-desert-climate',
    'mediterranean-climate',
    'greenland-polar-climate',
    'tibetan-highland-climate'
  ]
  return priority
    .map((id) => getClimateZone(id))
    .filter(Boolean)
    .slice(0, limit)
}

export function relatedClimateZones(id) {
  const zone = getClimateZone(id)
  if (!zone) return []
  const direct = zone.related_climate_ids
    .map((climateId) => getClimateZone(climateId))
    .filter(Boolean)
  const similar = climateZones.filter((item) => {
    if (item.id === zone.id || direct.some((related) => related.id === item.id)) return false
    return item.type === zone.type ||
      item.group === zone.group ||
      item.related_terrain.some((terrainId) => zone.related_terrain.includes(terrainId)) ||
      item.related_countries.some((code) => zone.related_countries.includes(code))
  })
  return [...direct, ...similar].slice(0, 6)
}

export function climateForCountry(code) {
  const countryCode = String(code || '').toUpperCase()
  return climateZones.filter((zone) => zone.related_countries.includes(countryCode))
}

export function climateForTerrain(id) {
  const terrainId = String(id || '')
  return climateZones.filter((zone) => zone.related_terrain.includes(terrainId))
}

export function climateColorFor(type) {
  return climateColors[type] || '#82d8ff'
}
