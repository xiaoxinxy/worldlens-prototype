const profiles = {
  BRA: {
    label: '热带节奏与大陆尺度',
    summary: '从亚马孙雨林到里约海岸，从桑巴街区到现代主义首都，巴西的文化更适合用几个鲜明现场进入。',
    stories: [
      { title: '亚马孙雨林', kicker: '自然符号', imageKey: 'geography', content: '亚马孙不只是地理背景，它影响河流交通、生态议题、原住民知识和全球对巴西的想象。' },
      { title: '狂欢节与桑巴', kicker: '城市节奏', imageKey: 'festival', content: '狂欢节把音乐、舞蹈、服饰和社区组织推到街头，是理解巴西公共生活的重要入口。' },
      { title: '足球与街区', kicker: '日常信仰', imageKey: 'lifestyle', content: '从海滩、球场到酒吧，足球连接城市情绪、身份认同和几代人的共同记忆。' },
      { title: '奥鲁普雷图与巴西利亚', kicker: '建筑跨度', imageKey: 'architecture', content: '殖民矿业城镇和现代主义首都并置，展现巴西在历史遗产与现代国家想象之间的张力。' },
      { title: '黑豆饭与海岸饮食', kicker: '味觉现场', imageKey: 'food', content: '黑豆饭、烤肉、木薯和热带水果构成巴西饮食的常见基底，也折射多族群融合。' }
    ]
  },
  CHN: {
    label: '山河、城市与连续文明',
    summary: '中国的辨识度来自辽阔地貌、文字传统、节日秩序与高速变化的城市现场。',
    stories: [
      { title: '山河与农耕尺度', kicker: '地貌', imageKey: 'geography', content: '山地、高原、平原和河流共同塑造交通、农耕、聚落与区域文化差异。' },
      { title: '故宫与王朝记忆', kicker: '文明', imageKey: 'history', content: '宫城、礼制、书写和城市中轴把历史转化成仍可行走和观看的空间。' },
      { title: '春节与灯火', kicker: '节日', imageKey: 'festival', content: '春节、元宵和地方庙会把家族、迁徙、祈福和集体记忆重新连接。' },
      { title: '从茶馆到都市天际线', kicker: '日常', imageKey: 'lifestyle', content: '传统生活方式与现代城市并行，构成中国今日最强烈的时间层次。' }
    ]
  },
  USA: {
    label: '移民社会与流行文化',
    summary: '美国的国家形象由国家公园、移民城市、流行音乐、影视工业和公路文化共同塑造。',
    stories: [
      { title: '国家公园与开阔地貌', kicker: '自然', imageKey: 'geography', content: '峡谷、山脉、荒漠和海岸线构成美国文化中反复出现的空间想象。' },
      { title: '纽约与移民城市', kicker: '城市', imageKey: 'lifestyle', content: '大都市承载移民、金融、媒体和街区文化，是美国多元社会的浓缩现场。' },
      { title: '爵士、摇滚与电影', kicker: '流行文化', imageKey: 'festival', content: '音乐和影像产业把地方经验转化成全球可识别的文化符号。' },
      { title: '自由女神与国家叙事', kicker: '记忆', imageKey: 'history', content: '公共纪念物、博物馆和国家仪式持续塑造美国的身份叙事。' }
    ]
  },
  JPN: {
    label: '季节审美与精密日常',
    summary: '日本的文化识别来自山海岛屿、神社寺院、季节节庆、料理秩序和都市亚文化。',
    stories: [
      { title: '富士山与岛屿地理', kicker: '自然', imageKey: 'geography', content: '火山、海岸和季风气候塑造了日本对季节、灾害和景观的敏感。' },
      { title: '京都寺社', kicker: '古都', imageKey: 'history', content: '庭园、木构建筑和祭礼保存着古都的时间感。' },
      { title: '和食与器物', kicker: '味觉', imageKey: 'food', content: '米饭、鱼、汤、腌物和器皿共同构成克制而精密的饮食审美。' },
      { title: '东京的夜与通勤', kicker: '当代', imageKey: 'lifestyle', content: '高密城市生活与动漫、音乐、设计共同形成现代日本的另一面。' }
    ]
  },
  IND: {
    label: '河流、信仰与色彩',
    summary: '印度适合从恒河、宗教城市、香料饮食、节庆色彩和电影音乐进入。',
    stories: [
      { title: '恒河与北印度平原', kicker: '河流文明', imageKey: 'geography', content: '河流与季风影响农业、朝圣、城市和日常仪式。' },
      { title: '泰姬陵与莫卧儿记忆', kicker: '历史', imageKey: 'history', content: '陵墓、堡垒和古城把王朝历史转化成视觉强烈的建筑遗产。' },
      { title: '香料、街市与家庭厨房', kicker: '饮食', imageKey: 'food', content: '香料系统、素食传统和地方主食共同形成极丰富的味觉地图。' },
      { title: '洒红节与电影音乐', kicker: '公共节庆', imageKey: 'festival', content: '节日、歌舞和电影工业让色彩与声音成为印度文化的全球符号。' }
    ]
  },
  FRA: {
    label: '街区、艺术与餐桌',
    summary: '法国的吸引力来自巴黎街区、博物馆体系、葡萄酒餐桌和地方景观。',
    stories: [
      { title: '巴黎与城市漫步', kicker: '城市', imageKey: 'lifestyle', content: '街区、咖啡馆、书店和河岸共同塑造法式城市生活想象。' },
      { title: '卢浮宫与艺术体系', kicker: '艺术', imageKey: 'history', content: '博物馆、学院和公共收藏让艺术成为法国文化的重要结构。' },
      { title: '葡萄酒与餐桌', kicker: '味觉', imageKey: 'food', content: '地方物产、奶酪、面包、葡萄酒和餐桌礼仪共同构成饮食传统。' },
      { title: '山地与海岸', kicker: '地貌', imageKey: 'geography', content: '从阿尔卑斯到大西洋海岸，地貌差异带来鲜明地方文化。' }
    ]
  },
  GBR: {
    label: '海岛、博物馆与流行音乐',
    summary: '英国更适合从伦敦、城堡大学、乡村景观、博物馆和流行音乐进入。',
    stories: [
      { title: '伦敦与泰晤士河', kicker: '都市', imageKey: 'lifestyle', content: '金融、剧场、博物馆和多元社区共同构成伦敦的文化密度。' },
      { title: '城堡、大学与王室仪式', kicker: '历史', imageKey: 'history', content: '古堡、学院和国家仪式把历史转化成可见的公共景观。' },
      { title: '湖区与乡村想象', kicker: '地貌', imageKey: 'geography', content: '湖区、海岸和田园景观持续影响文学、旅行和生活审美。' },
      { title: '摇滚、戏剧与酒馆', kicker: '日常', imageKey: 'festival', content: '音乐、剧场和酒馆文化让英国日常生活具有强烈公共性。' }
    ]
  },
  DEU: {
    label: '工程秩序与城市记忆',
    summary: '德国的文化线索在森林、古城、工业设计、音乐传统和啤酒节之间展开。',
    stories: [
      { title: '黑森林与河谷', kicker: '地貌', imageKey: 'geography', content: '森林、河流和中欧平原塑造德国的旅行、童话和地方生活。' },
      { title: '柏林的断裂记忆', kicker: '历史', imageKey: 'history', content: '纪念碑、博物馆和城市更新让近现代历史成为德国公共文化核心。' },
      { title: '啤酒节与地方社群', kicker: '节庆', imageKey: 'festival', content: '地方节庆、啤酒馆和市集承载社交秩序与地方身份。' },
      { title: '教堂、工厂与设计', kicker: '建筑', imageKey: 'architecture', content: '哥特教堂、现代工业和设计传统共同构成德国视觉语言。' }
    ]
  },
  RUS: {
    label: '广袤土地与文学音乐',
    summary: '俄罗斯的文化气质来自辽阔地理、东正教建筑、文学音乐和寒冷城市生活。',
    stories: [
      { title: '贝加尔湖与大陆深处', kicker: '自然', imageKey: 'geography', content: '辽阔空间和极端气候塑造俄罗斯独特的距离感。' },
      { title: '克里姆林宫与红场', kicker: '历史', imageKey: 'history', content: '国家权力、宗教建筑和城市广场共同构成强烈历史符号。' },
      { title: '文学、芭蕾与冬季节庆', kicker: '艺术', imageKey: 'festival', content: '文学、古典音乐和舞台艺术长期塑造俄罗斯的世界形象。' },
      { title: '罗宋汤与寒地餐桌', kicker: '味觉', imageKey: 'food', content: '汤、面包、腌制食物和高热量饮食回应漫长冬季。' }
    ]
  },
  ITA: {
    label: '古典遗产与街巷生活',
    summary: '意大利的文化线索在罗马遗迹、文艺复兴城市、海岸街巷和餐桌之间流动。',
    stories: [
      { title: '罗马与古典遗迹', kicker: '历史', imageKey: 'history', content: '古城遗迹让城市本身成为开放的历史现场。' },
      { title: '佛罗伦萨与文艺复兴', kicker: '艺术', imageKey: 'architecture', content: '教堂、绘画和广场共同保存欧洲艺术史的重要节点。' },
      { title: '披萨、面食与地方餐桌', kicker: '饮食', imageKey: 'food', content: '简单食材、地方风土和家庭餐桌构成意大利饮食魅力。' },
      { title: '威尼斯与海上城市', kicker: '城市', imageKey: 'lifestyle', content: '水巷、桥梁和嘉年华展现意大利城市生活的戏剧性。' }
    ]
  },
  ESP: {
    label: '广场、节庆与地中海阳光',
    summary: '西班牙由广场生活、安达卢西亚遗产、节庆仪式、海岸和餐桌共同塑造。',
    stories: [
      { title: '阿尔罕布拉与南方记忆', kicker: '历史', imageKey: 'history', content: '伊斯兰、基督教和地方工艺在建筑与城市空间中叠合。' },
      { title: '广场与晚间生活', kicker: '日常', imageKey: 'lifestyle', content: '广场、街角酒吧和夜生活构成西班牙城市的社交节奏。' },
      { title: '海鲜饭与小食文化', kicker: '味觉', imageKey: 'food', content: '海岸物产和地方餐桌让西班牙饮食具有强烈区域性。' },
      { title: '圣周与公共仪式', kicker: '节庆', imageKey: 'festival', content: '宗教游行、音乐和街道空间共同构成高密度的节庆场景。' }
    ]
  },
  KOR: {
    label: '宫阙、山城与流行文化',
    summary: '韩国的文化识别来自首尔宫阙、山地城市、韩食、节庆和全球流行文化。',
    stories: [
      { title: '首尔宫阙与韩屋', kicker: '建筑', imageKey: 'history', content: '宫阙、韩屋和现代街区并置，展现传统和现代之间的紧密切换。' },
      { title: '雪岳山与半岛地貌', kicker: '自然', imageKey: 'geography', content: '山地、海岸和季节变化影响旅行、饮食与审美。' },
      { title: '韩定食与发酵味觉', kicker: '饮食', imageKey: 'food', content: '泡菜、酱、汤饭和小菜体系构成韩食的日常秩序。' },
      { title: '首尔夜色与流行音乐', kicker: '当代', imageKey: 'lifestyle', content: '音乐、影视、美妆和设计让韩国当代文化形成全球传播力。' }
    ]
  },
  AUS: {
    label: '海岸大陆与原住民记忆',
    summary: '澳大利亚由海岸城市、内陆红土、原住民艺术、珊瑚生态和户外生活构成。',
    stories: [
      { title: '大堡礁与海洋生态', kicker: '自然', imageKey: 'geography', content: '珊瑚礁生态是澳大利亚最鲜明的全球自然符号之一。' },
      { title: '乌鲁鲁与原住民记忆', kicker: '精神地景', imageKey: 'history', content: '红土中心承载原住民叙事、土地关系和文化保护议题。' },
      { title: '悉尼港与海岸生活', kicker: '城市', imageKey: 'lifestyle', content: '港湾、海滩和开放空间塑造澳大利亚城市生活的轻盈感。' },
      { title: '户外、咖啡与多元社群', kicker: '日常', imageKey: 'food', content: '移民饮食、咖啡文化和户外运动共同构成都市日常。' }
    ]
  },
  EGY: {
    label: '尼罗河与古文明',
    summary: '埃及的核心不是普通模板，而是尼罗河、金字塔、神庙、开罗和沙漠之间的文明张力。',
    stories: [
      { title: '尼罗河', kicker: '生命线', imageKey: 'geography', content: '尼罗河决定农业、城市和古代文明的空间结构。' },
      { title: '金字塔与王朝记忆', kicker: '古文明', imageKey: 'history', content: '金字塔和墓葬体系让埃及成为全球最具识别度的古文明现场。' },
      { title: '神庙与石刻', kicker: '建筑', imageKey: 'architecture', content: '神庙、柱厅和浮雕保存了宗教、权力与艺术系统。' },
      { title: '开罗与今日生活', kicker: '当代城市', imageKey: 'lifestyle', content: '开罗把古迹、市场、交通和现代生活压缩在同一座城市中。' }
    ]
  },
  TUR: {
    label: '欧亚交汇与城市层叠',
    summary: '土耳其的魅力来自伊斯坦布尔、卡帕多奇亚、清真寺、集市和欧亚交汇。',
    stories: [
      { title: '伊斯坦布尔', kicker: '交汇城市', imageKey: 'lifestyle', content: '海峡、古城、清真寺和现代街区让伊斯坦布尔成为欧亚交汇的象征。' },
      { title: '圣索菲亚', kicker: '历史层叠', imageKey: 'history', content: '宗教、帝国和建筑技术在圣索菲亚形成高度浓缩的历史现场。' },
      { title: '卡帕多奇亚', kicker: '地貌', imageKey: 'geography', content: '岩柱、洞穴和热气球让土耳其地貌具有强烈视觉辨识度。' },
      { title: '集市、茶与烤肉', kicker: '日常', imageKey: 'food', content: '市场、茶馆、香料和烤肉构成街头生活的核心气味。' }
    ]
  },
  ZAF: {
    label: '海角、城市与多族群记忆',
    summary: '南非适合从桌山、开普敦、约翰内斯堡、罗本岛和多族群文化进入。',
    stories: [
      { title: '桌山与海角', kicker: '地貌', imageKey: 'geography', content: '山海相接的地貌让南非拥有强烈的空间辨识度。' },
      { title: '罗本岛', kicker: '历史', imageKey: 'history', content: '罗本岛连接殖民、隔离制度和现代民主记忆。' },
      { title: '约翰内斯堡', kicker: '城市', imageKey: 'lifestyle', content: '矿业、迁徙、音乐和街区文化塑造了这座内陆都市。' },
      { title: '祖鲁文化与地方饮食', kicker: '社群', imageKey: 'festival', content: '多族群传统、仪式和食物共同构成南非复杂的文化表情。' }
    ]
  }
}

export function detailProfileForPlace(place = {}) {
  return profiles[place.geoFeatureId] || profiles[place.slug] || null
}
