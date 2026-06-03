function makeRegion({ id, slug = id, name, type, continent, lat, lng, intro, keywords, geoFeatureId = id, boundaryType = type }) {
  return {
    id,
    slug,
    name,
    type,
    continent,
    lat,
    lng,
    bounds: [],
    geoFeatureId,
    boundaryType,
    coverGradient: 'linear-gradient(135deg,#020617,#0f766e,#e7c46b)',
    intro,
    keywords,
    stats: [
      { label: '类型', value: type },
      { label: '区域', value: continent },
      { label: '识别层', value: boundaryType }
    ],
    sections: {
      geography: intro,
      history: '这片区域的地理位置长期影响着迁徙、贸易、语言与信仰的流动。',
      food: '饮食常随气候、物产、航线与城市网络形成差异。',
      festival: '节庆与公共仪式让地方记忆在当代生活中继续被看见。',
      clothing: '服饰与材料、气候、身份和审美传统相互连接。',
      architecture: '建筑形态回应气候、材料、技术与社会秩序。',
      music: '声音、节奏与口述传统常记录人群的迁徙和日常情感。',
      lifestyle: '日常生活把宏大的地理条件转译为具体的居住、交通和社交方式。'
    },
    timeline: ['地理环境塑造早期生活方式', '贸易与迁徙带来文化交流', '现代城市和生态议题重塑区域关系'],
    facts: ['区域边界常是理解文化差异的入口。', '海岸、山脉、河流和航线会持续影响人类活动。'],
    gallery: []
  }
}

export const regions = [
  makeRegion({ id: 'asia', name: '亚洲', type: '大洲', continent: '亚洲', lat: 34, lng: 95, intro: '亚洲横跨寒带、温带与热带，孕育了多条大河文明、游牧传统、海上贸易和密集城市网络。', keywords: ['季风', '丝绸之路', '大河文明', '群岛', '高原'] }),
  makeRegion({ id: 'europe', name: '欧洲', type: '大洲', continent: '欧洲', lat: 54, lng: 15, intro: '欧洲由半岛、海湾、平原和山脉交织而成，城市、港口、大学和艺术传统构成密集的文化网络。', keywords: ['城市', '港口', '艺术', '启蒙', '建筑'] }),
  makeRegion({ id: 'africa', name: '非洲', type: '大洲', continent: '非洲', lat: 1, lng: 20, intro: '非洲拥有沙漠、草原、雨林与漫长海岸，多样生态和古老迁徙构成丰厚的人类记忆。', keywords: ['撒哈拉', '草原', '尼罗河', '鼓乐', '口述传统'] }),
  makeRegion({ id: 'north-america', name: '北美洲', type: '大洲', continent: '北美洲', lat: 48, lng: -105, intro: '北美洲从北极冰原延伸到热带海域，山脉、平原、湖泊和移民城市塑造多元文化景观。', keywords: ['大湖', '国家公园', '城市文化', '原住民', '移民'] }),
  makeRegion({ id: 'south-america', name: '南美洲', type: '大洲', continent: '南美洲', lat: -16, lng: -60, intro: '南美洲由安第斯山、亚马逊雨林、草原和海岸城市组成，音乐、节庆和生态议题交织鲜明。', keywords: ['安第斯', '亚马逊', '狂欢节', '高原', '雨林'] }),
  makeRegion({ id: 'oceania', name: '大洋洲', type: '大洲', continent: '大洋洲', lat: -24, lng: 135, intro: '大洋洲包含澳大利亚大陆与太平洋岛屿，海洋航行、原住民艺术和生态环境构成独特文化层。', keywords: ['岛屿', '航海', '珊瑚礁', '原住民艺术', '海岸'] }),
  makeRegion({ id: 'antarctica-continent', slug: 'antarctica-continent', name: '南极洲', type: '大洲', continent: '极地', lat: -82, lng: 20, intro: '南极洲是冰盖覆盖的大陆，科研站、冰川、极端气候与全球气候记忆紧密相连。', keywords: ['冰盖', '科研站', '企鹅', '冰川', '极地气候'] }),
  makeRegion({ id: 'arctic-circle', slug: 'arctic-circle', name: '北极圈区域', type: '极地', continent: '极地', lat: 75, lng: 20, geoFeatureId: 'arctic-region', intro: '北极圈区域由海冰、苔原、原住民社区和极光构成，也承载着气候变化的前沿议题。', keywords: ['海冰', '极光', '苔原', '因纽特文化', '气候变化'] }),
  makeRegion({ id: 'southern-ocean', name: '南大洋', type: '大洋', continent: '极地', lat: -65, lng: 0, intro: '南大洋环绕南极洲，强劲洋流连接全球海洋系统，是冰架、鲸类和科研航线的重要区域。', keywords: ['洋流', '冰架', '鲸类', '科研航线', '极地生态'] }),
  makeRegion({ id: 'mediterranean-sea', name: '地中海', type: '海域', continent: '欧洲 / 非洲 / 亚洲', lat: 37, lng: 18, intro: '地中海连接欧亚非，港口、橄榄、葡萄酒、宗教与古典城市在这里长期交汇。', keywords: ['港口', '橄榄', '古典城市', '航海', '贸易'] }),
  makeRegion({ id: 'caribbean-sea', name: '加勒比海', type: '海域', continent: '北美洲', lat: 16, lng: -75, intro: '加勒比海由岛屿、珊瑚礁、殖民城市和音乐传统构成，是跨大西洋文化交流的重要海域。', keywords: ['岛屿', '珊瑚礁', '雷鬼', '港口', '热带'] }),
  makeRegion({ id: 'red-sea', name: '红海', type: '海域', continent: '非洲 / 亚洲', lat: 21, lng: 38, intro: '红海位于非洲东北部与阿拉伯半岛之间，是古代航线、港口贸易和珊瑚生态并存的狭长海域。', keywords: ['珊瑚', '航线', '港口', '沙漠海岸', '贸易'] }),
  makeRegion({ id: 'black-sea', name: '黑海', type: '海域', continent: '欧洲 / 亚洲', lat: 43.2, lng: 35, intro: '黑海连接东欧、高加索和安纳托利亚，港口城市、草原通道与多民族历史在这里交织。', keywords: ['港口', '高加索', '草原通道', '航运', '城市'] }),
  makeRegion({ id: 'south-china-sea', name: '南海', type: '海域', continent: '亚洲', lat: 13, lng: 115, intro: '南海连接东亚与东南亚，群岛、季风航路、渔业与港口网络塑造了活跃的海上文化。', keywords: ['季风', '群岛', '渔业', '航路', '港口'] }),
  makeRegion({ id: 'baltic-sea', name: '波罗的海', type: '海域', continent: '欧洲', lat: 58.5, lng: 20, intro: '波罗的海位于北欧与中东欧之间，汉萨港口、森林海岸和寒冷水域共同构成区域记忆。', keywords: ['北欧', '汉萨', '港口', '森林海岸', '航运'] }),
  makeRegion({ id: 'arabian-sea', name: '阿拉伯海', type: '海域', continent: '亚洲 / 非洲', lat: 15, lng: 62, intro: '阿拉伯海连接印度洋、阿拉伯半岛和南亚，季风航行、香料贸易与港口城市长期影响沿岸文化。', keywords: ['季风', '香料贸易', '港口', '航海', '印度洋'] })
]
