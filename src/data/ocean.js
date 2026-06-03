export const oceanLayerTypes = [
  { id: 'depth', label: '海洋深度', description: '用蓝色深浅观察浅海、大洋盆地与海沟。' },
  { id: 'currents', label: '海流 / 洋流', description: '显示主要洋流如何运输热量并影响气候。' },
  { id: 'trenches', label: '海沟', description: '观察板块俯冲形成的深海边界。' },
  { id: 'ridges', label: '海岭', description: '观察海底扩张形成的新洋壳脊线。' },
  { id: 'basins', label: '海盆', description: '观察大洋深部盆地与沉积空间。' },
  { id: 'reefs', label: '珊瑚礁', description: '观察浅海生态系统与暖水边界。' }
]

export const oceanFeatures = [
  {
    id: 'pacific-ocean',
    name: '太平洋',
    name_en: 'Pacific Ocean',
    type: 'ocean',
    area: '约 1.65 亿 km²',
    avg_depth: '约 4,280 m',
    max_depth: '10,984 m',
    surrounding_countries: ['中国', '日本', '美国', '澳大利亚', '智利'],
    significance: '地球最大的海洋，连接环太平洋火山带、深海海沟、暖流系统和全球贸易航线。',
    center: [0, -160],
    radius: 0.78,
    depthClass: 'abyssal'
  },
  {
    id: 'atlantic-ocean',
    name: '大西洋',
    name_en: 'Atlantic Ocean',
    type: 'ocean',
    area: '约 1.06 亿 km²',
    avg_depth: '约 3,646 m',
    max_depth: '8,376 m',
    surrounding_countries: ['美国', '巴西', '英国', '法国', '南非'],
    significance: '连接欧洲、非洲与美洲，中央海岭记录着海底扩张，湾流深刻影响西欧气候。',
    center: [8, -32],
    radius: 0.56,
    depthClass: 'deep'
  },
  {
    id: 'indian-ocean',
    name: '印度洋',
    name_en: 'Indian Ocean',
    type: 'ocean',
    area: '约 7,050 万 km²',
    avg_depth: '约 3,741 m',
    max_depth: '7,258 m',
    surrounding_countries: ['印度', '印度尼西亚', '澳大利亚', '南非', '阿曼'],
    significance: '季风、海上丝绸之路与能源航线在这里交汇，是连接亚洲、非洲和澳洲的海洋走廊。',
    center: [-18, 78],
    radius: 0.5,
    depthClass: 'deep'
  },
  {
    id: 'arctic-ocean',
    name: '北冰洋',
    name_en: 'Arctic Ocean',
    type: 'ocean',
    area: '约 1,400 万 km²',
    avg_depth: '约 1,205 m',
    max_depth: '5,550 m',
    surrounding_countries: ['俄罗斯', '加拿大', '美国', '挪威', '丹麦'],
    significance: '海冰、极昼极夜和北极航道让它成为理解气候变化与高纬海洋的关键区域。',
    center: [78, 20],
    radius: 0.24,
    depthClass: 'polar'
  },
  {
    id: 'southern-ocean',
    name: '南大洋',
    name_en: 'Southern Ocean',
    type: 'ocean',
    area: '约 2,030 万 km²',
    avg_depth: '约 3,270 m',
    max_depth: '7,236 m',
    surrounding_countries: ['南极洲周边海域'],
    significance: '环绕南极的西风漂流将全球海洋连接成一个系统，调节热量、碳循环和深层水形成。',
    center: [-62, 20],
    radius: 0.62,
    depthClass: 'cold'
  },
  {
    id: 'mediterranean-sea',
    name: '地中海',
    name_en: 'Mediterranean Sea',
    type: 'sea',
    area: '约 250 万 km²',
    avg_depth: '约 1,500 m',
    max_depth: '5,267 m',
    surrounding_countries: ['西班牙', '法国', '意大利', '希腊', '埃及'],
    significance: '欧亚非之间的内海，塑造了港口、贸易、农业和古典文明网络。',
    center: [35, 18],
    radius: 0.18,
    depthClass: 'middle'
  },
  {
    id: 'caribbean-sea',
    name: '加勒比海',
    name_en: 'Caribbean Sea',
    type: 'sea',
    area: '约 275 万 km²',
    avg_depth: '约 2,200 m',
    max_depth: '7,686 m',
    surrounding_countries: ['古巴', '牙买加', '委内瑞拉', '哥伦比亚', '墨西哥'],
    significance: '热带海域、岛弧和飓风路径交汇，是海洋气候与岛屿文明的典型样本。',
    center: [15, -75],
    radius: 0.16,
    depthClass: 'deep'
  },
  {
    id: 'south-china-sea',
    name: '南海',
    name_en: 'South China Sea',
    type: 'sea',
    area: '约 350 万 km²',
    avg_depth: '约 1,200 m',
    max_depth: '5,016 m',
    surrounding_countries: ['中国', '越南', '菲律宾', '马来西亚', '文莱'],
    significance: '季风、珊瑚礁、岛链与航运通道交织，是理解东亚海洋环境的重要区域。',
    center: [12, 115],
    radius: 0.18,
    depthClass: 'middle'
  },
  {
    id: 'baltic-sea',
    name: '波罗的海',
    name_en: 'Baltic Sea',
    type: 'sea',
    area: '约 37.7 万 km²',
    avg_depth: '约 55 m',
    max_depth: '459 m',
    surrounding_countries: ['瑞典', '芬兰', '俄罗斯', '波兰', '德国'],
    significance: '低盐、浅水和半封闭结构让它成为北欧气候、航运和生态压力的窗口。',
    center: [58, 20],
    radius: 0.1,
    depthClass: 'shelf'
  },
  {
    id: 'black-sea',
    name: '黑海',
    name_en: 'Black Sea',
    type: 'sea',
    area: '约 43.6 万 km²',
    avg_depth: '约 1,253 m',
    max_depth: '2,212 m',
    surrounding_countries: ['土耳其', '俄罗斯', '乌克兰', '罗马尼亚', '格鲁吉亚'],
    significance: '内海、海峡和河流输入共同塑造黑海的分层水体与港口战略价值。',
    center: [43, 35],
    radius: 0.11,
    depthClass: 'middle'
  },
  {
    id: 'red-sea',
    name: '红海',
    name_en: 'Red Sea',
    type: 'sea',
    area: '约 43.8 万 km²',
    avg_depth: '约 490 m',
    max_depth: '3,040 m',
    surrounding_countries: ['埃及', '沙特阿拉伯', '苏丹', '厄立特里亚', '也门'],
    significance: '裂谷海盆正在缓慢张开，热盐环境孕育珊瑚礁并连接苏伊士航道。',
    center: [20, 38],
    radius: 0.12,
    depthClass: 'rift'
  },
  {
    id: 'arabian-sea',
    name: '阿拉伯海',
    name_en: 'Arabian Sea',
    type: 'sea',
    area: '约 386 万 km²',
    avg_depth: '约 2,734 m',
    max_depth: '4,652 m',
    surrounding_countries: ['印度', '巴基斯坦', '阿曼', '也门', '索马里'],
    significance: '季风风场驱动强烈上升流，能源航线、渔业和古代贸易在这里叠加。',
    center: [15, 65],
    radius: 0.2,
    depthClass: 'deep'
  },
  {
    id: 'bering-sea',
    name: '白令海',
    name_en: 'Bering Sea',
    type: 'sea',
    area: '约 230 万 km²',
    avg_depth: '约 1,600 m',
    max_depth: '4,097 m',
    surrounding_countries: ['美国', '俄罗斯'],
    significance: '连接北太平洋与北冰洋，陆架、寒流和生物生产力共同塑造高纬海洋生态。',
    center: [58, -175],
    radius: 0.16,
    depthClass: 'cold'
  }
]

export const oceanOverlays = {
  currents: [
    { id: 'gulf-stream', name: '湾流', kind: 'warm', path: [[25, -80], [34, -72], [42, -55], [50, -35], [56, -15]] },
    { id: 'kuroshio', name: '黑潮', kind: 'warm', path: [[18, 122], [27, 130], [35, 142], [42, 154]] },
    { id: 'humboldt', name: '洪堡寒流', kind: 'cold', path: [[-45, -78], [-30, -75], [-15, -78], [-5, -82]] },
    { id: 'antarctic-circumpolar', name: '南极绕极流', kind: 'cold', path: [[-56, -160], [-58, -80], [-57, 0], [-56, 80], [-58, 160]] }
  ],
  trenches: [
    { id: 'mariana-trench', name: '马里亚纳海沟', path: [[20, 145], [16, 145], [12, 143], [8, 141]] },
    { id: 'tonga-trench', name: '汤加海沟', path: [[-15, -174], [-22, -174], [-28, -176]] },
    { id: 'peru-chile-trench', name: '秘鲁-智利海沟', path: [[-8, -81], [-20, -75], [-36, -73], [-48, -76]] }
  ],
  ridges: [
    { id: 'mid-atlantic-ridge', name: '大西洋中脊', path: [[65, -28], [45, -30], [25, -35], [5, -28], [-20, -14], [-40, -12]] },
    { id: 'east-pacific-rise', name: '东太平洋海隆', path: [[25, -110], [5, -105], [-20, -112], [-45, -118]] },
    { id: 'indian-ocean-ridge', name: '印度洋中脊', path: [[12, 58], [-12, 66], [-35, 75], [-48, 95]] }
  ],
  basins: [
    { id: 'north-pacific-basin', name: '北太平洋海盆', center: [28, -170], radius: 0.22 },
    { id: 'brazil-basin', name: '巴西海盆', center: [-25, -35], radius: 0.18 },
    { id: 'somali-basin', name: '索马里海盆', center: [-5, 55], radius: 0.16 }
  ],
  reefs: [
    { id: 'great-barrier-reef', name: '大堡礁', center: [-18, 147], radius: 0.09 },
    { id: 'coral-triangle', name: '珊瑚三角区', center: [-2, 124], radius: 0.13 },
    { id: 'belize-barrier-reef', name: '伯利兹堡礁', center: [17, -88], radius: 0.06 }
  ]
}

export function getOceanLayerType(id) {
  return oceanLayerTypes.find((layer) => layer.id === id) || oceanLayerTypes[0]
}

export function getOceanFeature(id) {
  return oceanFeatures.find((feature) => feature.id === id) || null
}

export function getFeaturedOceans() {
  return oceanFeatures.filter((feature) => feature.type === 'ocean')
}
