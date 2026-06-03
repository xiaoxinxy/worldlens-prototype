export const places = [
  {
    id: 'china',
    slug: 'china',
    name: '中国',
    type: '国家',
    continent: '亚洲',
    lat: 35.8617,
    lng: 104.1954,
    bounds: [{ minLat: 18, maxLat: 54, minLng: 73, maxLng: 135 }],
    coverGradient: 'linear-gradient(135deg, #3b0915, #8a1c1c 45%, #e8b04a)',
    intro: '辽阔的地域、多元的民族、悠久的农耕文明与现代城市共同构成了中国丰富的风土人情。',
    keywords: ['汉字', '春节', '茶文化', '长城', '丝绸之路'],
    stats: [
      { label: '文化关键词', value: '多元一体' },
      { label: '代表节日', value: '春节' },
      { label: '代表建筑', value: '长城' }
    ],
    sections: {
      geography: '中国地形复杂，东部平原与海岸线适合农业和城市发展，西部高原、山地与沙漠塑造了多样的自然景观。',
      history: '从黄河、长江流域的早期文明，到秦汉统一、唐宋繁盛、明清延续，中国历史形成了连续性强的文化传统。',
      food: '饮食地域差异明显，川菜重麻辣，粤菜重鲜，鲁菜重火候，淮扬菜重刀工，各地饮食和气候、物产紧密相关。',
      festival: '春节、元宵、清明、端午、中秋等节日承载团圆、祭祖、祈福和农时观念。',
      clothing: '传统服饰包含汉服、旗袍、唐装以及各民族服饰，强调礼仪、纹样、材质与身份表达。',
      architecture: '宫殿、园林、民居、牌坊、寺庙等建筑类型丰富，讲究中轴秩序、院落空间、木构体系和自然融合。',
      music: '古琴、二胡、笛子、琵琶等乐器与戏曲、民歌、曲艺共同构成传统音乐体系。',
      lifestyle: '从茶馆、市集、庙会到高速发展的都市生活，传统生活方式与现代科技在日常中并存。'
    },
    timeline: [
      '先秦时期形成礼乐、诸子思想与早期国家形态',
      '秦汉建立统一帝国和制度基础',
      '唐宋时期城市、文学、贸易与工艺高度发展',
      '近现代以来快速工业化与城市化'
    ],
    facts: ['中国菜系常以地域气候和物产形成差异。', '茶不仅是饮品，也是一种社交和审美方式。'],
    gallery: [
      { title: '长城山脊', desc: '防御工程与山地景观结合的象征。', gradient: 'linear-gradient(135deg,#171717,#7c2d12,#f59e0b)' },
      { title: '江南水巷', desc: '水网、桥梁与白墙黛瓦形成细腻空间。', gradient: 'linear-gradient(135deg,#0f172a,#155e75,#e0f2fe)' },
      { title: '西部高原', desc: '高海拔地貌与游牧文化交织。', gradient: 'linear-gradient(135deg,#312e81,#64748b,#fde68a)' }
    ]
  },
  {
    id: 'japan',
    slug: 'japan',
    name: '日本',
    type: '国家',
    continent: '亚洲',
    lat: 36.2048,
    lng: 138.2529,
    bounds: [{ minLat: 30, maxLat: 46, minLng: 129, maxLng: 146 }],
    coverGradient: 'linear-gradient(135deg, #121826, #7f1d1d 50%, #f8fafc)',
    intro: '日本以岛屿地理、季节审美、神社寺院、城市秩序和流行文化形成独特的文化气质。',
    keywords: ['樱花', '神社', '和食', '动漫', '茶道'],
    stats: [
      { label: '文化气质', value: '季节感' },
      { label: '代表食物', value: '寿司' },
      { label: '代表艺术', value: '浮世绘' }
    ],
    sections: {
      geography: '日本由多岛构成，山地比例高，火山和海岸线塑造了温泉、渔业与紧凑城市空间。',
      history: '从绳文、弥生到平安、镰仓、江户，再到现代化，日本在吸收外来文化的同时形成本土审美。',
      food: '和食重视季节、摆盘与食材原味，寿司、拉面、天妇罗、怀石料理都代表不同层次的饮食文化。',
      festival: '祭典与神社密切相关，樱花季、盂兰盆节、夏日花火大会体现强烈季节体验。',
      clothing: '和服以纹样、腰带、季节色彩区分场合，浴衣则更常见于夏季祭典。',
      architecture: '神社、寺院、町屋、庭园和现代极简建筑共同体现木构、留白与自然意识。',
      music: '雅乐、尺八、三味线与现代 J-pop、动漫配乐构成传统与流行并存的音乐图景。',
      lifestyle: '城市生活高度秩序化，便利店、铁路、街区商业与小尺度空间体现细密的生活设计。'
    },
    timeline: ['平安时期形成贵族文学与审美', '江户时期城市文化与浮世绘兴盛', '明治以后快速现代化', '当代流行文化走向全球'],
    facts: ['日本很多节日与神社和地方共同体有关。', '季节限定商品是日本日常消费文化的一部分。'],
    gallery: [
      { title: '樱花街道', desc: '季节、城市与仪式感的结合。', gradient: 'linear-gradient(135deg,#111827,#be123c,#fecdd3)' },
      { title: '京都庭园', desc: '通过留白和借景表达自然。', gradient: 'linear-gradient(135deg,#022c22,#15803d,#d9f99d)' },
      { title: '东京夜色', desc: '高密度都市与流行文化的舞台。', gradient: 'linear-gradient(135deg,#020617,#312e81,#e879f9)' }
    ]
  },
  {
    id: 'india',
    slug: 'india',
    name: '印度',
    type: '国家',
    continent: '亚洲',
    lat: 20.5937,
    lng: 78.9629,
    bounds: [{ minLat: 6, maxLat: 36, minLng: 68, maxLng: 98 }],
    coverGradient: 'linear-gradient(135deg,#3b1d06,#c2410c 45%,#22c55e)',
    intro: '印度以古老文明、宗教多样性、香料饮食、节庆色彩和电影音乐形成极强的文化辨识度。',
    keywords: ['恒河', '香料', '瑜伽', '宝莱坞', '洒红节'],
    stats: [
      { label: '文化特征', value: '多宗教' },
      { label: '代表节日', value: '洒红节' },
      { label: '代表艺术', value: '宝莱坞' }
    ],
    sections: {
      geography: '印度北有喜马拉雅山，南临印度洋，恒河平原、德干高原和季风气候影响农业与人口分布。',
      history: '印度河文明、孔雀王朝、笈多时期、莫卧儿帝国和殖民时代共同塑造了复杂历史层次。',
      food: '咖喱、香料、扁豆、烤饼与乳制品非常常见，不同宗教和地区形成差异化饮食。',
      festival: '排灯节、洒红节等节日色彩鲜明，常与宗教信仰、季节变化和家庭团聚相关。',
      clothing: '纱丽、旁遮普服、库尔塔等服饰色彩丰富，常通过布料、刺绣和首饰表现身份与审美。',
      architecture: '泰姬陵、石窟寺、堡垒和寺庙建筑体现宗教、王权与工艺传统。',
      music: '印度古典音乐重视拉格体系，宝莱坞音乐则融合流行、舞蹈和戏剧表达。',
      lifestyle: '市集、宗教仪式、家庭结构和快速发展的科技城市共同构成多层次生活。'
    },
    timeline: ['印度河文明形成早期城市', '莫卧儿时期建筑艺术兴盛', '殖民时期带来制度转型', '当代软件产业与电影文化影响全球'],
    facts: ['印度香料使用与气候、贸易、宗教习惯有关。', '宝莱坞电影常把音乐舞蹈作为叙事核心。'],
    gallery: [
      { title: '恒河晨雾', desc: '河流、仪式与日常生活相互交织。', gradient: 'linear-gradient(135deg,#431407,#ea580c,#fef3c7)' },
      { title: '洒红节色彩', desc: '以色粉表达祝福与春天到来。', gradient: 'linear-gradient(135deg,#7e22ce,#ec4899,#facc15)' },
      { title: '泰姬陵剪影', desc: '莫卧儿建筑与爱情叙事的象征。', gradient: 'linear-gradient(135deg,#0f172a,#94a3b8,#ffffff)' }
    ]
  },
  {
    id: 'france',
    slug: 'france',
    name: '法国',
    type: '国家',
    continent: '欧洲',
    lat: 46.2276,
    lng: 2.2137,
    bounds: [{ minLat: 41, maxLat: 51.5, minLng: -5.5, maxLng: 8.5 }],
    coverGradient: 'linear-gradient(135deg,#020617,#1d4ed8 42%,#f8fafc 70%,#b91c1c)',
    intro: '法国以城市美学、葡萄酒、时装、艺术馆、咖啡馆和浪漫主义想象闻名。',
    keywords: ['巴黎', '卢浮宫', '葡萄酒', '法餐', '时装'],
    stats: [
      { label: '文化名片', value: '艺术与生活美学' },
      { label: '代表城市', value: '巴黎' },
      { label: '代表建筑', value: '埃菲尔铁塔' }
    ],
    sections: {
      geography: '法国拥有平原、山地、海岸与葡萄酒产区，地理多样性支撑了地区饮食和旅游资源。',
      history: '从高卢、法兰克王国、绝对王权到法国大革命，法国历史深刻影响欧洲政治与思想。',
      food: '法餐重视食材、酱汁、礼仪与产区，面包、奶酪、葡萄酒和甜点构成鲜明饮食符号。',
      festival: '国庆日、音乐节、戛纳电影节等活动体现政治记忆、艺术传统和公共生活。',
      clothing: '巴黎时装周、奢侈品牌和高级定制体现法国对时尚行业的长期影响。',
      architecture: '哥特式教堂、古典宫殿、奥斯曼街区和现代建筑构成丰富城市层次。',
      music: '香颂、古典音乐、电子音乐和电影配乐共同构成法国声音景观。',
      lifestyle: '咖啡馆、街角面包店、博物馆和公共广场构成慢节奏又重审美的生活方式。'
    },
    timeline: ['中世纪教堂城市发展', '启蒙时代思想影响欧洲', '法国大革命改变政治结构', '现代巴黎成为艺术与时尚中心'],
    facts: ['法国奶酪种类极多，常与地区和工艺绑定。', '咖啡馆在法国文学和公共讨论中有重要角色。'],
    gallery: [
      { title: '巴黎街角', desc: '城市肌理与日常美学。', gradient: 'linear-gradient(135deg,#111827,#334155,#fefce8)' },
      { title: '卢浮宫光影', desc: '古典艺术与现代空间相遇。', gradient: 'linear-gradient(135deg,#0f172a,#475569,#f8fafc)' },
      { title: '葡萄酒产区', desc: '风土、气候与酿造传统。', gradient: 'linear-gradient(135deg,#14532d,#7f1d1d,#fde68a)' }
    ]
  },
  {
    id: 'italy',
    slug: 'italy',
    name: '意大利',
    type: '国家',
    continent: '欧洲',
    lat: 41.8719,
    lng: 12.5674,
    bounds: [{ minLat: 36, maxLat: 47.5, minLng: 6, maxLng: 19 }],
    coverGradient: 'linear-gradient(135deg,#052e16,#fef3c7 52%,#991b1b)',
    intro: '意大利拥有古罗马遗产、文艺复兴艺术、地中海饮食和强烈城市性格。',
    keywords: ['罗马', '文艺复兴', '披萨', '歌剧', '威尼斯'],
    stats: [
      { label: '文化标签', value: '艺术与古城' },
      { label: '代表食物', value: '披萨' },
      { label: '代表艺术', value: '歌剧' }
    ],
    sections: {
      geography: '意大利呈靴形半岛，北部阿尔卑斯山、亚平宁山脉和地中海海岸塑造了多样地区文化。',
      history: '古罗马帝国、城邦时代、文艺复兴和近代统一构成意大利历史主线。',
      food: '披萨、意面、橄榄油、咖啡和葡萄酒体现地中海饮食传统与地区差异。',
      festival: '威尼斯狂欢节、锡耶纳赛马节和宗教庆典体现城市记忆与公共仪式。',
      clothing: '意大利时装强调剪裁、材质与生活化优雅，米兰是全球时尚中心之一。',
      architecture: '古罗马遗迹、教堂穹顶、广场、运河城市和乡村庄园共同构成意大利空间美学。',
      music: '歌剧传统影响深远，同时民歌、电影配乐和现代流行音乐也极具辨识度。',
      lifestyle: '街头咖啡、家庭餐桌、广场社交和慢生活形成鲜明日常气质。'
    },
    timeline: ['古罗马塑造法制与城市遗产', '文艺复兴推动艺术与科学发展', '19世纪完成国家统一', '现代设计和时尚产业繁荣'],
    facts: ['意大利很多城市本身就是大型露天博物馆。', '意面形状常与不同酱汁搭配。'],
    gallery: [
      { title: '罗马遗迹', desc: '古典文明的城市层积。', gradient: 'linear-gradient(135deg,#1c1917,#92400e,#fde68a)' },
      { title: '威尼斯水道', desc: '水上交通与城市仪式。', gradient: 'linear-gradient(135deg,#082f49,#0e7490,#f0f9ff)' },
      { title: '托斯卡纳田野', desc: '葡萄园、丘陵和乡村景观。', gradient: 'linear-gradient(135deg,#365314,#a16207,#fef3c7)' }
    ]
  },
  {
    id: 'uk',
    slug: 'united-kingdom',
    name: '英国',
    type: '国家',
    continent: '欧洲',
    lat: 55.3781,
    lng: -3.436,
    bounds: [{ minLat: 49, maxLat: 61, minLng: -9, maxLng: 2.5 }],
    coverGradient: 'linear-gradient(135deg,#020617,#1e3a8a 45%,#991b1b)',
    intro: '英国以岛屿历史、议会传统、文学戏剧、摇滚音乐、学院文化和雨雾城市景观形成独特气质。',
    keywords: ['伦敦', '莎士比亚', '下午茶', '摇滚', '城堡'],
    stats: [
      { label: '文化标签', value: '文学与制度' },
      { label: '代表城市', value: '伦敦' },
      { label: '代表习俗', value: '下午茶' }
    ],
    sections: {
      geography: '英国由大不列颠岛、北爱尔兰部分地区和周边岛屿组成，海洋气候带来多雨和温和环境。',
      history: '从罗马不列颠、盎格鲁撒克逊、诺曼征服到工业革命，英国历史影响现代制度和全球贸易。',
      food: '英式早餐、炸鱼薯条、派、布丁和下午茶构成日常饮食符号。',
      festival: '篝火之夜、圣诞市场、皇家仪式和音乐节体现历史记忆与流行文化。',
      clothing: '风衣、格纹、学院风和西装剪裁体现英国服饰的经典感。',
      architecture: '哥特式教堂、城堡、维多利亚建筑、红砖街区和现代高楼形成伦敦等城市层次。',
      music: '从古典合唱到披头士、摇滚、电子和独立音乐，英国音乐对全球流行文化影响巨大。',
      lifestyle: '酒吧文化、足球周末、博物馆、剧院和大学城构成英国日常生活图景。'
    },
    timeline: ['中世纪形成城堡与教堂城市', '工业革命改变生产与城市结构', '20世纪摇滚音乐走向世界', '当代文化产业持续输出'],
    facts: ['英国酒吧不只是饮酒场所，也常是社区社交空间。', '伦敦拥有大量免费博物馆。'],
    gallery: [
      { title: '伦敦雨夜', desc: '雨雾、街灯与城市记忆。', gradient: 'linear-gradient(135deg,#020617,#475569,#e0f2fe)' },
      { title: '苏格兰高地', desc: '山地、湖泊与民间传说。', gradient: 'linear-gradient(135deg,#052e16,#166534,#94a3b8)' },
      { title: '学院庭院', desc: '学术传统与建筑秩序。', gradient: 'linear-gradient(135deg,#1e293b,#7c2d12,#fde68a)' }
    ]
  },
  {
    id: 'taiwan',
    slug: 'taiwan',
    name: '台湾',
    type: '地区',
    continent: '亚洲',
    lat: 23.5,
    lng: 121.0,
    coverGradient: 'linear-gradient(135deg, #0f172a, #1e3a8a 45%, #f59e0b)',
    intro: '台湾融合了闽南、客家、原住民、日本及现代文化，形成了丰富多元的岛屿文化气质。以夜市、庙宇、山海景观和科技产业闻名。',
    keywords: ['夜市', '庙宇', '妈祖', '珍珠奶茶', '台北101'],
    stats: [
      { label: '文化特征', value: '多元融合' },
      { label: '代表城市', value: '台北' },
      { label: '代表景观', value: '阿里山' }
    ],
    sections: {
      geography: '台湾是西太平洋岛屿，中央山脉纵贯南北，东部多山，西部为平原和丘陵，周围有澎湖、金门、马祖等离岛。',
      history: '台湾历史包含原住民时期、荷兰西班牙殖民、明郑时期、清朝统治、日本时期和战后发展，形成多层次文化积淀。',
      food: '夜市小吃丰富多样，牛肉面、蚵仔煎、珍珠奶茶、卤肉饭、凤梨酥最为知名，融合闽南、客家与日本饮食影响。',
      festival: '妈祖绕境、元宵灯会、中元普渡、端午龙舟和原住民丰年祭都是重要节庆。',
      clothing: '原住民各族服饰色彩鲜明、纹样独特，现代时尚则融合日系、韩流与本地设计师风格。',
      architecture: '日治时期建筑、闽南式庙宇、客家土楼、现代摩天楼和文创园区共同构成城市景观。',
      music: '原住民歌唱、客家山歌、台语流行音乐与独立乐团组成多元音乐图景。',
      lifestyle: '便利商店、夜市文化、机车通勤、茶饮店和山林步道构成日常生活的鲜明特色。'
    },
    timeline: ['原住民在此生活数千年', '17世纪荷兰与西班牙殖民', '明郑时期汉人大量迁入', '日本时期现代化基础建立', '战后经济发展与文化繁荣'],
    facts: ['台湾夜市是国际知名的美食文化。', '台湾便利商店密度全球最高之一。'],
    gallery: [
      { title: '台北夜景', desc: '城市天际线与山脉环绕。', gradient: 'linear-gradient(135deg,#020617,#1e40af,#fbbf24)' },
      { title: '庙宇烟火', desc: '民间信仰与节庆仪式。', gradient: 'linear-gradient(135deg,#450a0a,#dc2626,#fde68a)' },
      { title: '山海公路', desc: '海岸线与中央山脉景观。', gradient: 'linear-gradient(135deg,#064e3b,#0891b2,#d9f99d)' }
    ]
  },
  {
    id: 'egypt',
    slug: 'egypt',
    name: '埃及',
    type: '国家',
    continent: '非洲',
    lat: 26.8206,
    lng: 30.8025,
    bounds: [{ minLat: 22, maxLat: 32, minLng: 24, maxLng: 37 }],
    coverGradient: 'linear-gradient(135deg,#431407,#b45309,#fde68a)',
    intro: '埃及因尼罗河、金字塔、法老文明、沙漠景观和阿拉伯城市生活而极具辨识度。',
    keywords: ['尼罗河', '金字塔', '法老', '开罗', '沙漠'],
    stats: [
      { label: '文化标签', value: '古文明' },
      { label: '代表河流', value: '尼罗河' },
      { label: '代表遗产', value: '金字塔' }
    ],
    sections: {
      geography: '埃及大部分是沙漠，尼罗河沿岸则形成农业、城市和文明发展的生命线。',
      history: '古埃及文明以法老、金字塔、象形文字和神庙闻名，后续又经历希腊化、罗马、伊斯兰等阶段。',
      food: '豆类、烤饼、米饭、香料和街头小吃构成埃及日常饮食。',
      festival: '宗教节庆、斋月活动和传统春季节日共同构成公共生活节奏。',
      clothing: '传统长袍、头巾与现代服饰并存，受到气候、宗教和城市生活影响。',
      architecture: '金字塔、神庙、清真寺和开罗老城街巷展现多重文明层次。',
      music: '阿拉伯音乐、乌德琴、鼓点和现代流行歌曲在城市中广泛传播。',
      lifestyle: '集市、咖啡馆、尼罗河游船和家庭聚会是埃及生活的重要场景。'
    },
    timeline: ['古王国时期金字塔建造达到高峰', '新王国时期神庙和帝国扩张', '伊斯兰时期开罗成为重要城市', '现代旅游与考古持续影响国家形象'],
    facts: ['尼罗河每年泛滥曾深刻影响农业历法。', '古埃及艺术常服务于宗教和王权叙事。'],
    gallery: [
      { title: '金字塔暮色', desc: '沙漠地平线上的古文明符号。', gradient: 'linear-gradient(135deg,#1c1917,#92400e,#fde68a)' },
      { title: '尼罗河岸', desc: '水源、城市和生活的通道。', gradient: 'linear-gradient(135deg,#082f49,#0284c7,#fef3c7)' },
      { title: '开罗市集', desc: '香料、手工艺与街巷生活。', gradient: 'linear-gradient(135deg,#431407,#dc2626,#fbbf24)' }
    ]
  },
  {
    id: 'south-africa',
    slug: 'south-africa',
    name: '南非',
    type: '国家',
    continent: '非洲',
    lat: -30.5595,
    lng: 22.9375,
    bounds: [{ minLat: -35, maxLat: -22, minLng: 16, maxLng: 33 }],
    coverGradient: 'linear-gradient(135deg,#052e16,#0f766e,#fde047)',
    intro: '南非以多民族社会、草原与海岸、葡萄酒产区、音乐节奏和“彩虹之国”形象闻名。',
    keywords: ['彩虹之国', '开普敦', '草原', '祖鲁文化', '葡萄酒'],
    stats: [
      { label: '文化标签', value: '多元社会' },
      { label: '代表城市', value: '开普敦' },
      { label: '自然景观', value: '桌山' }
    ],
    sections: {
      geography: '南非拥有高原、草原、海岸、山地和开普植物区，生物多样性丰富。',
      history: '南非历史包含本土社群、殖民、矿业发展、种族隔离和民主转型等重要阶段。',
      food: '烧烤、玉米粥、咖喱、海鲜和葡萄酒体现多民族和地理资源影响。',
      festival: '音乐节、文化节和体育赛事常展现多语言、多族群社会活力。',
      clothing: '祖鲁、科萨等传统服饰色彩鲜明，现代城市服饰也极具混合风格。',
      architecture: '开普荷兰式建筑、殖民街区、现代城市和乡村聚落并存。',
      music: '非洲节奏、合唱、爵士、Kwaito 和现代流行音乐形成鲜明声音。',
      lifestyle: '户外运动、海岸休闲、烧烤聚会和城市文化构成南非生活图景。'
    },
    timeline: ['本土社群形成多样语言与文化', '殖民和矿业改变社会结构', '1994年后进入民主转型时代', '当代文化和体育持续连接世界'],
    facts: ['南非有多个官方语言，反映复杂族群结构。', '开普敦桌山是极具辨识度的城市景观。'],
    gallery: [
      { title: '桌山海岸', desc: '山体与海湾共同构成城市轮廓。', gradient: 'linear-gradient(135deg,#0f172a,#0f766e,#bae6fd)' },
      { title: '草原暮色', desc: '动物迁徙与自然保护景观。', gradient: 'linear-gradient(135deg,#422006,#a16207,#fde68a)' },
      { title: '彩色街区', desc: '城市历史与社区记忆。', gradient: 'linear-gradient(135deg,#7e22ce,#dc2626,#facc15)' }
    ]
  },
  {
    id: 'usa',
    slug: 'united-states',
    name: '美国',
    type: '国家',
    continent: '北美洲',
    lat: 37.0902,
    lng: -95.7129,
    bounds: [{ minLat: 24, maxLat: 49.5, minLng: -125, maxLng: -66 }],
    coverGradient: 'linear-gradient(135deg,#020617,#1d4ed8 45%,#b91c1c)',
    intro: '美国以移民社会、多样地貌、流行文化、科技产业、国家公园和城市天际线形成全球影响。',
    keywords: ['纽约', '好莱坞', '爵士', '国家公园', '硅谷'],
    stats: [
      { label: '文化标签', value: '多元与创新' },
      { label: '代表产业', value: '影视科技' },
      { label: '代表音乐', value: '爵士/摇滚' }
    ],
    sections: {
      geography: '美国横跨北美大陆，拥有大平原、落基山、密西西比河、沙漠、海岸和国家公园。',
      history: '从原住民历史、殖民地、独立战争、西进运动到工业化和现代超级都市，美国历史充满迁徙与扩张。',
      food: '汉堡、烧烤、南方菜、墨西哥裔饮食、移民餐馆共同构成高度混合的饮食文化。',
      festival: '感恩节、独立日、万圣节、超级碗等节日和活动体现家庭、国家叙事与商业娱乐。',
      clothing: '牛仔裤、运动服、街头服饰和好莱坞时尚对全球流行影响很大。',
      architecture: '摩天楼、郊区住宅、校园、国家纪念建筑和现代博物馆构成多种空间符号。',
      music: '爵士、蓝调、摇滚、嘻哈、乡村音乐等流派均对全球音乐产生巨大影响。',
      lifestyle: '汽车文化、校园体育、咖啡连锁、户外露营和多元社区构成日常生活特点。'
    },
    timeline: ['独立战争建立现代国家', '工业化推动城市发展', '20世纪电影音乐产业扩张', '互联网时代科技公司影响全球'],
    facts: ['美国国家公园体系保护了大量自然景观。', '嘻哈文化从街区表达发展为全球流行文化。'],
    gallery: [
      { title: '纽约天际线', desc: '摩天楼与现代城市速度。', gradient: 'linear-gradient(135deg,#020617,#1e40af,#e0f2fe)' },
      { title: '大峡谷', desc: '地质时间与自然尺度。', gradient: 'linear-gradient(135deg,#431407,#b45309,#fecaca)' },
      { title: '西海岸公路', desc: '汽车文化与海岸风景。', gradient: 'linear-gradient(135deg,#082f49,#0ea5e9,#fef3c7)' }
    ]
  },
  {
    id: 'brazil',
    slug: 'brazil',
    name: '巴西',
    type: '国家',
    continent: '南美洲',
    lat: -14.235,
    lng: -51.9253,
    bounds: [{ minLat: -34, maxLat: 6, minLng: -74, maxLng: -34 }],
    coverGradient: 'linear-gradient(135deg,#064e3b,#16a34a 45%,#fde047)',
    intro: '巴西以亚马孙雨林、桑巴、足球、狂欢节、海滩城市和多元族群文化闻名。',
    keywords: ['亚马孙', '桑巴', '足球', '狂欢节', '里约'],
    stats: [
      { label: '文化标签', value: '热烈与节奏' },
      { label: '代表活动', value: '狂欢节' },
      { label: '自然符号', value: '亚马孙' }
    ],
    sections: {
      geography: '巴西拥有亚马孙雨林、巴西高原、大西洋海岸和广阔河流系统，自然资源非常丰富。',
      history: '巴西历史包含原住民文化、葡萄牙殖民、非洲移民与奴隶制历史，以及现代国家发展。',
      food: '黑豆饭、烤肉、木薯、热带水果和咖啡构成巴西饮食的常见元素。',
      festival: '里约狂欢节以花车、桑巴、服饰和街头欢庆闻名，是城市文化的集中爆发。',
      clothing: '狂欢节服饰色彩强烈，日常服饰则受热带气候和海滩生活影响。',
      architecture: '殖民老城、现代主义建筑、海滨城市和贫民区空间共同呈现复杂城市景观。',
      music: '桑巴、波萨诺瓦、热带主义和现代流行音乐体现强烈节奏感。',
      lifestyle: '足球、海滩、街头音乐、家庭聚会和社区活动构成巴西日常文化的重要部分。'
    },
    timeline: ['葡萄牙殖民影响语言和宗教', '非洲文化深刻塑造音乐舞蹈', '现代主义建筑推动国家形象', '足球和狂欢节成为全球文化符号'],
    facts: ['巴西葡萄牙语与欧洲葡萄牙语在口音和用法上有差异。', '桑巴学校在狂欢节中承担表演和社区组织功能。'],
    gallery: [
      { title: '里约海湾', desc: '山海城市与节庆舞台。', gradient: 'linear-gradient(135deg,#052e16,#0891b2,#fde68a)' },
      { title: '亚马孙雨林', desc: '生物多样性和生态议题中心。', gradient: 'linear-gradient(135deg,#022c22,#16a34a,#bbf7d0)' },
      { title: '桑巴大道', desc: '节奏、服饰与城市能量。', gradient: 'linear-gradient(135deg,#7e22ce,#ef4444,#facc15)' }
    ]
  },
  {
    id: 'australia',
    slug: 'australia',
    name: '澳大利亚',
    type: '国家',
    continent: '大洋洲',
    lat: -25.2744,
    lng: 133.7751,
    bounds: [{ minLat: -44, maxLat: -10, minLng: 112, maxLng: 154 }],
    coverGradient: 'linear-gradient(135deg,#431407,#ea580c,#0ea5e9)',
    intro: '澳大利亚以广阔内陆、海岸城市、原住民文化、珊瑚礁和户外生活方式著称。',
    keywords: ['悉尼歌剧院', '大堡礁', '袋鼠', '原住民艺术', '冲浪'],
    stats: [
      { label: '文化标签', value: '自然与户外' },
      { label: '代表景观', value: '大堡礁' },
      { label: '代表城市', value: '悉尼' }
    ],
    sections: {
      geography: '澳大利亚内陆干旱，人口多集中在海岸城市，拥有大堡礁、沙漠、热带雨林和草原。',
      history: '原住民文化历史悠久，欧洲殖民以后形成现代国家结构，多元移民继续改变社会面貌。',
      food: '烧烤、海鲜、咖啡文化、肉派和多元移民饮食共同构成城市饮食。',
      festival: '澳新军团日、悉尼跨年、音乐节和海滩活动体现国家记忆与户外生活。',
      clothing: '休闲、运动和户外服饰常见，也受到海滩与冲浪文化影响。',
      architecture: '悉尼歌剧院、现代海滨住宅、城市高楼和原住民艺术空间共同构成视觉符号。',
      music: '原住民乐器迪吉里杜管、摇滚、电子和独立音乐共同构成澳大利亚声音。',
      lifestyle: '冲浪、露营、咖啡馆、体育运动和户外烧烤是非常重要的生活场景。'
    },
    timeline: ['原住民文化长期延续', '欧洲殖民改变社会结构', '现代移民形成多元城市', '生态保护和海洋旅游成为重要议题'],
    facts: ['大堡礁是全球著名的珊瑚礁生态系统。', '澳大利亚城市咖啡文化非常发达。'],
    gallery: [
      { title: '悉尼海港', desc: '歌剧院与海湾城市轮廓。', gradient: 'linear-gradient(135deg,#082f49,#0ea5e9,#f8fafc)' },
      { title: '红色内陆', desc: '荒漠、岩石和辽阔尺度。', gradient: 'linear-gradient(135deg,#431407,#ea580c,#fed7aa)' },
      { title: '大堡礁', desc: '海洋生态与旅游想象。', gradient: 'linear-gradient(135deg,#164e63,#06b6d4,#cffafe)' }
    ]
  },
  {
    id: 'pacific-ocean',
    slug: 'pacific-ocean',
    name: '太平洋',
    type: '海洋',
    continent: '全球海域',
    lat: 0,
    lng: -150,
    bounds: [
      { minLat: -60, maxLat: 65, minLng: 120, maxLng: 180 },
      { minLat: -60, maxLat: 65, minLng: -180, maxLng: -70 }
    ],
    coverGradient: 'linear-gradient(135deg,#020617,#075985,#38bdf8)',
    intro: '太平洋是世界最大海洋，连接亚洲、大洋洲和美洲，也承载岛屿文化、航海传统与海洋生态。',
    keywords: ['岛屿文化', '航海', '珊瑚礁', '火山岛', '海洋生态'],
    stats: [
      { label: '类型', value: '最大海洋' },
      { label: '文化关键词', value: '航海' },
      { label: '自然关键词', value: '珊瑚礁' }
    ],
    sections: {
      geography: '太平洋面积巨大，包含大量岛屿、海沟、火山带和珊瑚礁，是环太平洋地震带的重要区域。',
      history: '南岛语族航海、太平洋岛屿迁徙、近现代海上贸易与战争都与这片海域密切相关。',
      food: '岛屿饮食常依赖海鲜、椰子、芋头、面包果和热带水果。',
      festival: '许多岛屿节庆与海洋、祖先、舞蹈、丰收和宗教仪式有关。',
      clothing: '草裙、花环、纹身和轻便织物常与气候、仪式和身份表达有关。',
      architecture: '岛屿聚落常适应海风、湿热气候和木材、棕榈等本地材料。',
      music: '鼓点、合唱、舞蹈和口述传统在太平洋岛屿文化中非常重要。',
      lifestyle: '渔业、航海、社区互助、海滩生活和生态保护构成海岛日常。'
    },
    timeline: ['古代航海者通过星象与海流迁徙', '近代太平洋成为全球贸易与军事通道', '当代岛屿国家面临气候变化挑战', '海洋保护逐渐成为共同议题'],
    facts: ['太平洋海沟包含地球上最深的海域。', '许多太平洋岛屿文化拥有复杂的航海知识。'],
    gallery: [
      { title: '深蓝海面', desc: '巨大的水域尺度。', gradient: 'linear-gradient(135deg,#020617,#075985,#7dd3fc)' },
      { title: '火山岛链', desc: '地质活动与岛屿形成。', gradient: 'linear-gradient(135deg,#111827,#7c2d12,#38bdf8)' },
      { title: '珊瑚礁环礁', desc: '脆弱而绚丽的海洋生态。', gradient: 'linear-gradient(135deg,#164e63,#06b6d4,#fef3c7)' }
    ]
  },
  {
    id: 'atlantic-ocean',
    slug: 'atlantic-ocean',
    name: '大西洋',
    type: '海洋',
    continent: '全球海域',
    lat: 10,
    lng: -35,
    bounds: [{ minLat: -60, maxLat: 65, minLng: -70, maxLng: 20 }],
    coverGradient: 'linear-gradient(135deg,#030712,#1e3a8a,#93c5fd)',
    intro: '大西洋连接欧洲、非洲与美洲，是航海贸易、殖民历史、移民流动和音乐文化交流的重要通道。',
    keywords: ['航海贸易', '移民', '海港', '跨大西洋交流', '海风'],
    stats: [
      { label: '类型', value: '海洋通道' },
      { label: '历史关键词', value: '跨洋交流' },
      { label: '代表空间', value: '海港城市' }
    ],
    sections: {
      geography: '大西洋位于美洲与欧非之间，海流、风带和海岸线影响了沿岸气候与航线。',
      history: '从大航海时代到跨洋贸易和移民，大西洋长期是世界历史的重要舞台。',
      food: '沿岸饮食重视鳕鱼、贝类、海盐、海鲜炖菜和港口贸易带来的香料。',
      festival: '沿岸港口城市常有海洋节、音乐节和移民社区庆典。',
      clothing: '水手服、渔民服饰、防风外套等都与海洋劳动和气候有关。',
      architecture: '灯塔、港口仓库、海滨要塞和殖民城市街区构成典型海岸景观。',
      music: '跨大西洋交流影响了爵士、蓝调、加勒比音乐和多种流行音乐。',
      lifestyle: '港口贸易、渔业、海滨休闲和跨文化社区共同塑造大西洋沿岸生活。'
    },
    timeline: ['大航海时代改变世界联系', '跨洋贸易塑造港口城市', '移民潮推动文化混合', '当代海洋运输仍极其重要'],
    facts: ['许多世界级港口沿大西洋分布。', '大西洋海流会影响欧洲西部气候。'],
    gallery: [
      { title: '海港灯塔', desc: '方向、守望与航海记忆。', gradient: 'linear-gradient(135deg,#020617,#1d4ed8,#f8fafc)' },
      { title: '风暴海面', desc: '北大西洋的力量感。', gradient: 'linear-gradient(135deg,#030712,#334155,#93c5fd)' },
      { title: '港口仓库', desc: '贸易和移民留下的城市纹理。', gradient: 'linear-gradient(135deg,#1e293b,#7c2d12,#cbd5e1)' }
    ]
  },
  {
    id: 'indian-ocean',
    slug: 'indian-ocean',
    name: '印度洋',
    type: '海洋',
    continent: '全球海域',
    lat: -20,
    lng: 80,
    bounds: [{ minLat: -60, maxLat: 30, minLng: 20, maxLng: 120 }],
    coverGradient: 'linear-gradient(135deg,#082f49,#0f766e,#fde68a)',
    intro: '印度洋连接东非、南亚、东南亚和澳洲，是季风贸易、香料路线和海岛文化的重要海域。',
    keywords: ['季风', '香料贸易', '海岛', '珊瑚礁', '港口'],
    stats: [
      { label: '文化关键词', value: '季风贸易' },
      { label: '代表资源', value: '香料' },
      { label: '代表景观', value: '热带岛屿' }
    ],
    sections: {
      geography: '印度洋受季风系统影响显著，沿岸包含东非海岸、阿拉伯海、孟加拉湾和热带岛屿。',
      history: '阿拉伯、印度、东非和东南亚商人长期通过印度洋进行香料、纺织品和宗教文化交流。',
      food: '椰奶、咖喱、海鲜、香料和米饭在许多印度洋沿岸饮食中常见。',
      festival: '沿岸节庆常融合宗教仪式、海洋贸易传统和地方族群文化。',
      clothing: '轻薄织物、头巾、纱丽、蜡染和海岛服饰体现气候与贸易影响。',
      architecture: '港口清真寺、殖民建筑、木结构海岛民居和贸易街区十分常见。',
      music: '印度洋沿岸音乐常融合阿拉伯、非洲、南亚与东南亚节奏。',
      lifestyle: '航海、渔业、香料市场、海岛旅游和宗教交流构成独特海域生活。'
    },
    timeline: ['古代季风航线促进贸易', '香料贸易连接欧亚非', '殖民时期港口体系重组', '当代海岛旅游与海洋保护并行'],
    facts: ['季风风向变化曾帮助古代船只往返航行。', '许多香料路线都经过印度洋。'],
    gallery: [
      { title: '季风航线', desc: '风向与贸易网络。', gradient: 'linear-gradient(135deg,#083344,#0f766e,#fef3c7)' },
      { title: '香料港口', desc: '市场、气味与远洋交换。', gradient: 'linear-gradient(135deg,#431407,#ea580c,#facc15)' },
      { title: '热带岛屿', desc: '珊瑚礁与海岛生活。', gradient: 'linear-gradient(135deg,#164e63,#22d3ee,#ecfeff)' }
    ]
  },
  {
    id: 'arctic-ocean',
    slug: 'arctic-region',
    name: '北极地区',
    type: '极地',
    continent: '极地',
    lat: 75,
    lng: 0,
    bounds: [{ minLat: 66.5, maxLat: 90, minLng: -180, maxLng: 180 }],
    coverGradient: 'linear-gradient(135deg,#020617,#155e75,#e0f2fe)',
    intro: '北极地区以冰雪海洋、极昼极夜、原住民生活、极地生态和气候变化议题为核心。',
    keywords: ['极昼极夜', '因纽特文化', '海冰', '极光', '气候变化'],
    stats: [
      { label: '类型', value: '极地' },
      { label: '自然现象', value: '极光' },
      { label: '核心议题', value: '海冰变化' }
    ],
    sections: {
      geography: '北极主要是被海冰覆盖的海洋和周边陆地，冬季漫长寒冷，夏季短暂。',
      history: '北极原住民长期适应寒冷环境，近现代极地探险、资源开发和科学考察持续发生。',
      food: '传统饮食依赖鱼类、海豹、鲸类、驯鹿等高能量食物，同时现代补给逐渐改变饮食。',
      festival: '极地社区节庆常与狩猎季、日照变化、族群传统和现代城市活动相关。',
      clothing: '皮毛、防风保暖层和现代极地装备体现对寒冷气候的适应。',
      architecture: '冰屋是标志性意象，现代北极社区则更多使用保温建筑和模块化设施。',
      music: '喉唱、鼓舞和原住民口述传统在一些北极社群中具有重要意义。',
      lifestyle: '狩猎、渔业、雪地交通、极地科研和生态保护构成北极生活与议题。'
    },
    timeline: ['原住民形成寒地适应知识', '极地探险时代扩展地理认知', '现代科研站监测气候变化', '北极航道和生态保护成为国际议题'],
    facts: ['北极不是大陆，而主要是海洋和海冰。', '极昼极夜由地轴倾斜造成。'],
    gallery: [
      { title: '极光天幕', desc: '高纬度夜空的光带。', gradient: 'linear-gradient(135deg,#020617,#0f766e,#a7f3d0)' },
      { title: '海冰裂缝', desc: '极地生态和气候变化的现场。', gradient: 'linear-gradient(135deg,#0f172a,#67e8f9,#f8fafc)' },
      { title: '雪地村落', desc: '寒地社区的生活适应。', gradient: 'linear-gradient(135deg,#111827,#94a3b8,#ffffff)' }
    ]
  },
  {
    id: 'antarctica',
    slug: 'antarctica',
    name: '南极洲',
    type: '极地',
    continent: '极地',
    lat: -82.8628,
    lng: 135,
    bounds: [{ minLat: -90, maxLat: -60, minLng: -180, maxLng: 180 }],
    coverGradient: 'linear-gradient(135deg,#020617,#64748b,#f8fafc)',
    intro: '南极洲是冰盖覆盖的大陆，拥有科学考察站、企鹅生态、极端气候和全球气候研究价值。',
    keywords: ['冰盖', '企鹅', '科研站', '极寒', '南极条约'],
    stats: [
      { label: '类型', value: '冰雪大陆' },
      { label: '核心活动', value: '科学考察' },
      { label: '代表动物', value: '企鹅' }
    ],
    sections: {
      geography: '南极洲被巨大冰盖覆盖，是地球最寒冷、干燥、风力强烈的大陆。',
      history: '人类对南极的系统探索较晚，20世纪以来科学考察和国际条约成为主要主题。',
      food: '南极没有传统农业饮食，科研站依赖补给、冻干食品和严格后勤系统。',
      festival: '科研站内会庆祝节日和极地纪念活动，形成特殊的驻站文化。',
      clothing: '极地服装强调分层保暖、防风、防水和安全识别。',
      architecture: '南极建筑以科研站为主，需要抗风、保温、模块化和低环境影响。',
      music: '驻站人员会通过音乐、电影和集体活动调节漫长极夜生活。',
      lifestyle: '科研、后勤、生态观察、严格安全制度和封闭社区生活构成南极日常。'
    },
    timeline: ['19至20世纪极地探险推进认知', '南极条约确立和平科研原则', '现代科研站持续监测气候与生态', '冰芯研究帮助理解地球气候历史'],
    facts: ['南极洲是地球上平均海拔最高的大陆。', '南极冰芯可保存古代气候信息。'],
    gallery: [
      { title: '冰盖地平线', desc: '纯净、寒冷和巨大尺度。', gradient: 'linear-gradient(135deg,#020617,#94a3b8,#f8fafc)' },
      { title: '企鹅群落', desc: '极地生命的适应。', gradient: 'linear-gradient(135deg,#111827,#334155,#facc15)' },
      { title: '科研站灯光', desc: '极夜中的人类据点。', gradient: 'linear-gradient(135deg,#0f172a,#1d4ed8,#e0f2fe)' }
    ]
  }
]

export const sectionMeta = [
  { key: 'geography', title: '地理概况', icon: '🛰️' },
  { key: 'history', title: '历史文明', icon: '🏛️' },
  { key: 'food', title: '饮食文化', icon: '🍽️' },
  { key: 'festival', title: '节日习俗', icon: '🎉' },
  { key: 'clothing', title: '传统服饰', icon: '🧵' },
  { key: 'architecture', title: '建筑风格', icon: '🏙️' },
  { key: 'music', title: '音乐艺术', icon: '🎧' },
  { key: 'lifestyle', title: '生活方式', icon: '🌏' }
]

export function getPlaceBySlug(slug) {
  return places.find((place) => place.slug === slug)
}

export function searchPlaces(keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) return places
  return places.filter((place) => {
    const haystack = [
      place.name,
      place.type,
      place.continent,
      place.intro,
      ...place.keywords
    ].join(' ').toLowerCase()
    return haystack.includes(text)
  })
}
