const cachedUnsplash = (id) => `/images/cached/unsplash/${id}.jpg`

export const culturalRoutes = [
  {
    routeId: 'silk-road',
    name: '丝绸之路',
    intro: '从长安出发，穿越河西走廊、中亚绿洲与安纳托利亚，把丝绸、玻璃、香料、宗教与城市制度连接成横跨欧亚的文明网络。',
    period: '约公元前2世纪至15世纪',
    countries: ['中国', '乌兹别克斯坦', '伊朗', '土耳其', '意大利'],
    keywords: ['商贸', '绿洲城市', '宗教交流', '手工艺'],
    nodes: [
      {
        id: 'silk-xian',
        name: '长安',
        country: '中国',
        lat: 34.3416,
        lng: 108.9398,
        description: '汉唐都城与东端枢纽，商旅、使节和僧侣在这里集结，开启通向中亚的道路。',
        image: '/images/wiki/detail/chn-history.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%95%BF%E5%AE%89'
      },
      {
        id: 'silk-dunhuang',
        name: '敦煌',
        country: '中国',
        lat: 40.1421,
        lng: 94.6619,
        description: '河西走廊的门户，莫高窟保存了商路上的宗教图像、语言和审美记忆。',
        image: '/images/wiki/detail/chn-festival.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E6%95%A6%E7%85%8C%E5%B8%82'
      },
      {
        id: 'silk-samarkand',
        name: '撒马尔罕',
        country: '乌兹别克斯坦',
        lat: 39.6542,
        lng: 66.9597,
        description: '中亚绿洲城市，粟特商人与伊斯兰建筑传统在这里塑造了丝路的城市精神。',
        image: cachedUnsplash('photo-1626716493137-b67fe9501e76'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E6%92%92%E9%A9%AC%E5%B0%94%E7%BD%95'
      },
      {
        id: 'silk-isfahan',
        name: '伊斯法罕',
        country: '伊朗',
        lat: 32.6539,
        lng: 51.666,
        description: '波斯高原上的贸易与工艺中心，织物、陶器和建筑装饰沿商路向东西传播。',
        image: cachedUnsplash('photo-1578301978693-85fa9c0320b9'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E4%BC%8A%E6%96%AF%E6%B3%95%E7%BD%95'
      },
      {
        id: 'silk-istanbul',
        name: '伊斯坦布尔',
        country: '土耳其',
        lat: 41.0082,
        lng: 28.9784,
        description: '欧亚交界的帝国城市，陆上商路在这里与地中海航运交汇。',
        image: cachedUnsplash('photo-1541432901042-2d8bd64b4a9b'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E4%BC%8A%E6%96%AF%E5%9D%A6%E5%B8%83%E5%B0%94'
      },
      {
        id: 'silk-venice',
        name: '威尼斯',
        country: '意大利',
        lat: 45.4408,
        lng: 12.3155,
        description: '地中海商业共和国，东方商品与欧洲金融、航海和艺术市场在此汇合。',
        image: cachedUnsplash('photo-1514890547357-a9ee288728e0'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%A8%81%E5%B0%BC%E6%96%AF'
      }
    ]
  },
  {
    routeId: 'buddhist-spread',
    name: '佛教传播路线',
    intro: '佛教从恒河平原出发，经中亚、丝路和海上网络传入东亚与东南亚，形成跨语言、跨地域的寺院、图像与思想传统。',
    period: '约公元前5世纪至公元8世纪',
    countries: ['印度', '尼泊尔', '中国', '日本', '印度尼西亚'],
    keywords: ['寺院', '译经', '石窟', '朝圣'],
    nodes: [
      {
        id: 'bud-bodh-gaya',
        name: '菩提伽耶',
        country: '印度',
        lat: 24.6951,
        lng: 84.9913,
        description: '佛陀悟道之地，是南亚佛教朝圣网络的精神原点。',
        image: cachedUnsplash('photo-1590766940554-634a7ed41450'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E8%8F%A9%E6%8F%90%E4%BC%BD%E8%80%B6'
      },
      {
        id: 'bud-lumbini',
        name: '蓝毗尼',
        country: '尼泊尔',
        lat: 27.4698,
        lng: 83.275,
        description: '佛陀诞生地，连接印度平原、喜马拉雅山麓和南亚朝圣传统。',
        image: cachedUnsplash('photo-1544735716-392fe2489ffa'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E8%93%9D%E6%AF%97%E5%B0%BC'
      },
      {
        id: 'bud-dunhuang',
        name: '敦煌',
        country: '中国',
        lat: 40.1421,
        lng: 94.6619,
        description: '石窟壁画、写本与译经活动记录了佛教进入东亚后的视觉转化。',
        image: '/images/wiki/detail/chn-food.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E8%8E%AB%E9%AB%98%E7%AA%9F'
      },
      {
        id: 'bud-nara',
        name: '奈良',
        country: '日本',
        lat: 34.6851,
        lng: 135.8048,
        description: '日本古代都城，寺院制度、佛像工艺和律令国家建设在这里彼此塑形。',
        image: cachedUnsplash('photo-1545569341-9eb8b30979d9'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%A5%88%E8%89%AF%E5%B8%82'
      },
      {
        id: 'bud-borobudur',
        name: '婆罗浮屠',
        country: '印度尼西亚',
        lat: -7.6079,
        lng: 110.2038,
        description: '爪哇岛上的佛教建筑群，展现海上交流与本土艺术结合后的宏大叙事。',
        image: cachedUnsplash('photo-1566552881560-0be862a7c445'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%A9%86%E7%BD%97%E6%B5%AE%E5%B1%A0'
      }
    ]
  },
  {
    routeId: 'age-of-sail',
    name: '大航海时代',
    intro: '从伊比利亚半岛出发的远洋航线把大西洋、印度洋和太平洋连为一体，也重塑了贸易、殖民、移民与知识地图。',
    period: '15世纪至17世纪',
    countries: ['葡萄牙', '佛得角', '南非', '印度', '马来西亚', '中国', '菲律宾'],
    keywords: ['远洋航行', '港口', '殖民网络', '地图学'],
    nodes: [
      {
        id: 'sail-lisbon',
        name: '里斯本',
        country: '葡萄牙',
        lat: 38.7223,
        lng: -9.1393,
        description: '大西洋航海的欧洲起点之一，造船、地图和王室贸易体系在这里集结。',
        image: cachedUnsplash('photo-1501927023255-9063be98970c'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%87%8C%E6%96%AF%E6%9C%AC'
      },
      {
        id: 'sail-cape-verde',
        name: '佛得角',
        country: '佛得角',
        lat: 14.933,
        lng: -23.5133,
        description: '大西洋中继港，连接欧洲、非洲西岸与跨洋航线。',
        image: cachedUnsplash('photo-1500530855697-b586d89ba3ee'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E4%BD%9B%E5%BE%97%E8%A7%92'
      },
      {
        id: 'sail-cape-town',
        name: '开普敦',
        country: '南非',
        lat: -33.9249,
        lng: 18.4241,
        description: '好望角附近的补给点，成为连接大西洋与印度洋的航海节点。',
        image: cachedUnsplash('photo-1580060839134-75a5edca2e99'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%BC%80%E6%99%AE%E6%95%A6'
      },
      {
        id: 'sail-goa',
        name: '果阿',
        country: '印度',
        lat: 15.2993,
        lng: 74.124,
        description: '印度西岸港口，宗教、香料贸易和殖民行政在此交织。',
        image: cachedUnsplash('photo-1512343879784-a960bf40e7f2'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E6%9E%9C%E9%98%BF%E9%82%A6'
      },
      {
        id: 'sail-malacca',
        name: '马六甲',
        country: '马来西亚',
        lat: 2.1896,
        lng: 102.2501,
        description: '马六甲海峡的关键港口，东西方海上商贸在这里汇聚。',
        image: '/images/wiki/country/mys-1.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A9%AC%E5%85%AD%E7%94%B2%E5%B8%82'
      },
      {
        id: 'sail-macao',
        name: '澳门',
        country: '中国',
        lat: 22.1987,
        lng: 113.5439,
        description: '珠江口的海上贸易节点，连接东亚、南亚和欧洲商路。',
        image: '/images/places/china-gallery-3.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E6%BE%B3%E9%97%A8'
      },
      {
        id: 'sail-manila',
        name: '马尼拉',
        country: '菲律宾',
        lat: 14.5995,
        lng: 120.9842,
        description: '太平洋贸易的西端港口，马尼拉大帆船把亚洲货物带向美洲。',
        image: cachedUnsplash('photo-1518509562904-e7ef99cdcc86'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A9%AC%E5%B0%BC%E6%8B%89'
      }
    ]
  },
  {
    routeId: 'spice-route',
    name: '香料贸易路线',
    intro: '丁香、肉豆蔻、胡椒和肉桂沿印度洋与东南亚海域流动，港口城市因此形成多语言、多宗教的商业共同体。',
    period: '古典时代至17世纪',
    countries: ['印度尼西亚', '马来西亚', '印度', '阿曼', '埃及', '意大利'],
    keywords: ['香料', '季风', '港口城市', '海上贸易'],
    nodes: [
      {
        id: 'spice-maluku',
        name: '马鲁古群岛',
        country: '印度尼西亚',
        lat: -3.2385,
        lng: 130.1453,
        description: '丁香与肉豆蔻的原产地之一，被称为香料群岛。',
        image: cachedUnsplash('photo-1507525428034-b723cf961d3e'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A6%AC%E9%AD%AF%E5%8F%A4%E7%BE%A4%E5%B3%B6'
      },
      {
        id: 'spice-malacca',
        name: '马六甲',
        country: '马来西亚',
        lat: 2.1896,
        lng: 102.2501,
        description: '海峡港口控制着季风航线上的转运节奏。',
        image: cachedUnsplash('photo-1565967511849-76a60a516170'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A9%AC%E5%85%AD%E7%94%B2%E5%B8%82'
      },
      {
        id: 'spice-kochi',
        name: '科钦',
        country: '印度',
        lat: 9.9312,
        lng: 76.2673,
        description: '印度西南海岸的胡椒与香料港口，连接阿拉伯海贸易网络。',
        image: cachedUnsplash('photo-1602216056096-3b40cc0c9944'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E7%A7%91%E9%92%A6'
      },
      {
        id: 'spice-muscat',
        name: '马斯喀特',
        country: '阿曼',
        lat: 23.588,
        lng: 58.3829,
        description: '阿拉伯海门户，航海传统与香料、乳香贸易在此交汇。',
        image: '/images/wiki/country/omn-1.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A9%AC%E6%96%AF%E5%96%80%E7%89%B9'
      },
      {
        id: 'spice-alexandria',
        name: '亚历山大',
        country: '埃及',
        lat: 31.2001,
        lng: 29.9187,
        description: '地中海入口港，印度洋货物经红海与尼罗河转入欧洲市场。',
        image: cachedUnsplash('photo-1533105079780-92b9be482077'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%B8%AF'
      },
      {
        id: 'spice-venice',
        name: '威尼斯',
        country: '意大利',
        lat: 45.4408,
        lng: 12.3155,
        description: '香料进入欧洲后的金融和消费中心之一。',
        image: cachedUnsplash('photo-1516483638261-f4dbaf036963'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%A8%81%E5%B0%BC%E6%96%AF'
      }
    ]
  },
  {
    routeId: 'mediterranean-circle',
    name: '地中海文明圈',
    intro: '地中海并非边界，而是一片把希腊城邦、罗马帝国、埃及、腓尼基与拜占庭连接起来的内海。',
    period: '古典时代至中世纪早期',
    countries: ['希腊', '意大利', '埃及', '突尼斯', '土耳其', '法国'],
    keywords: ['城邦', '帝国', '港口', '哲学', '建筑'],
    nodes: [
      {
        id: 'med-athens',
        name: '雅典',
        country: '希腊',
        lat: 37.9838,
        lng: 23.7275,
        description: '古希腊城邦文化中心，哲学、戏剧和民主制度在这里留下深远影响。',
        image: cachedUnsplash('photo-1555993539-1732b0258235'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%9B%85%E5%85%B8'
      },
      {
        id: 'med-rome',
        name: '罗马',
        country: '意大利',
        lat: 41.9028,
        lng: 12.4964,
        description: '帝国道路、法律和城市工程从这里辐射整个地中海。',
        image: cachedUnsplash('photo-1525874684015-58379d421a52'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E7%BD%97%E9%A9%AC'
      },
      {
        id: 'med-alexandria',
        name: '亚历山大',
        country: '埃及',
        lat: 31.2001,
        lng: 29.9187,
        description: '希腊化世界的知识港口，图书馆和灯塔象征古代地中海的知识交流。',
        image: cachedUnsplash('photo-1529260830199-42c24126f198'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E4%BA%9A%E5%8E%86%E5%B1%B1%E5%A4%A7%E6%B8%AF'
      },
      {
        id: 'med-carthage',
        name: '迦太基',
        country: '突尼斯',
        lat: 36.8528,
        lng: 10.3233,
        description: '腓尼基商业城邦，海上贸易与罗马扩张在此激烈相遇。',
        image: cachedUnsplash('photo-1549893072-4bc678117f45'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E8%BF%A6%E5%A4%AA%E5%9F%BA'
      },
      {
        id: 'med-istanbul',
        name: '君士坦丁堡',
        country: '土耳其',
        lat: 41.0082,
        lng: 28.9784,
        description: '博斯普鲁斯海峡上的帝国都城，连接黑海、地中海与亚洲内陆。',
        image: cachedUnsplash('photo-1524231757912-21f4fe3a7200'),
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E5%90%9B%E5%A3%AB%E5%9D%A6%E4%B8%81%E5%A0%A1'
      },
      {
        id: 'med-marseille',
        name: '马赛',
        country: '法国',
        lat: 43.2965,
        lng: 5.3698,
        description: '西地中海港口，希腊殖民、罗马交通和现代移民文化在这里叠合。',
        image: '/images/places/france-gallery-4.jpg',
        wikiUrl: 'https://zh.wikipedia.org/wiki/%E9%A9%AC%E8%B5%9B'
      }
    ]
  }
]

export default culturalRoutes
