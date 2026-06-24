const API_BASE = import.meta.env?.VITE_API_BASE || '/api'

export const aiExplorationModules = [
  {
    id: 'parallel_life',
    title: '🌎 平行人生',
    shortTitle: '平行人生',
    icon: '🌎',
    tag: 'Life',
    description: '另一种人生',
    shortDesc: '人生模拟',
    layout: 'life',
    accent: '#f6d84f',
    actionLabel: '生成平行人生',
    promptPlaceholder: '如果我出生在冰岛',
    examples: ['如果我出生在冰岛', '如果我出生在日本', '如果我出生在印度', '如果我出生在芬兰']
  },
  {
    id: 'ai_guide',
    title: '🧭 AI导游',
    shortTitle: 'AI导游',
    icon: '🧭',
    tag: 'Guide',
    description: '目的地推荐',
    shortDesc: '带路',
    layout: 'compass',
    accent: '#70d6ff',
    actionLabel: '让 AI 带路',
    promptPlaceholder: '带我去一个冷门但有趣的国家',
    examples: ['带我去一个冷门国家', '带我去看极光', '带我去一个神秘地方', '带我去适合独自旅行的国家']
  },
  {
    id: 'world_blindbox',
    title: '🎲 世界盲盒',
    shortTitle: '世界盲盒',
    icon: '🎲',
    tag: 'Random',
    description: '随机抵达',
    shortDesc: '随机',
    layout: 'blindbox',
    accent: '#c7a6ff',
    actionLabel: '今天去哪？',
    promptPlaceholder: '今天去哪？',
    examples: ['今天去哪？', '随机带我去一个岛屿', '随机探索一个国家']
  },
  {
    id: 'ai_route',
    title: '🛰 AI航线',
    shortTitle: 'AI航线',
    icon: '🛰',
    tag: 'Route',
    description: '动态路线',
    shortDesc: '巡航',
    layout: 'route',
    accent: '#ffd166',
    actionLabel: '生成并巡航',
    promptPlaceholder: '给我一条欧洲国家旅行路线',
    examples: ['给我一条欧洲国家旅行路线', '给我一条适合摄影的路线', '给我一条冷门小国路线', '给我一条古文明探索路线']
  },
  {
    id: 'world_advisor',
    title: '🌍 世界顾问',
    shortTitle: '世界顾问',
    icon: '🌍',
    tag: 'Advisor',
    description: '国家建议',
    shortDesc: '评估',
    layout: 'advisor',
    accent: '#7ee7c8',
    actionLabel: '分析推荐',
    promptPlaceholder: '哪个国家最适合程序员',
    examples: ['哪个国家最适合程序员', '哪个国家适合养老', '哪个国家适合摄影', '哪个国家适合远程办公']
  },
  {
    id: 'civilization',
    title: '🏛 文明探索',
    shortTitle: '文明探索',
    icon: '🏛',
    tag: 'History',
    description: '文明区域',
    shortDesc: '历史',
    layout: 'timeline',
    accent: '#ffbf69',
    actionLabel: '探索文明',
    promptPlaceholder: '古埃及',
    examples: ['古罗马', '古埃及', '玛雅文明', '丝绸之路', '蒙古帝国']
  },
  {
    id: 'world_story',
    title: '📖 世界故事',
    shortTitle: '世界故事',
    icon: '📖',
    tag: 'Story',
    description: '地点故事',
    shortDesc: '叙事',
    layout: 'story',
    accent: '#f0a6ca',
    actionLabel: '生成故事',
    promptPlaceholder: '讲一个冰岛的故事',
    examples: ['讲一个冰岛的故事', '讲一个关于极光的故事', '讲一个关于丝绸之路的故事']
  }
]

export const aiPipelineSteps = [
  { id: 'input', label: '用户输入' },
  { id: 'intent', label: 'AI理解意图' },
  { id: 'locate', label: '定位目标' },
  { id: 'flight', label: '地球飞行' },
  { id: 'highlight', label: '目标高亮' },
  { id: 'content', label: '生成内容' }
]

async function request(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body || {})
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `HTTP ${response.status}`)
  }
  return payload?.data ?? payload
}

export async function detectAiIntent(message) {
  return normalizeAiIntent(await request('/ai/intent', { message }))
}

export async function exploreWithAi(payload) {
  return normalizeAiExploreResult(await request('/ai/explore', payload))
}

export async function generateAiRoute(message) {
  return normalizeAiRouteResult(await request('/ai/route', { message }))
}

export function normalizeAiIntent(input) {
  const coordinates = normalizeCoordinates(input?.coordinates)
  return {
    intent: normalizeIntent(input?.intent),
    target: String(input?.target || input?.country || '').trim(),
    targetType: String(input?.targetType || 'country').trim() || 'country',
    country: String(input?.country || input?.target || '').trim(),
    countryCode: String(input?.countryCode || '').trim().toUpperCase(),
    coordinates,
    provider: input?.provider || 'deepseek'
  }
}

export function normalizeAiExploreResult(input) {
  const sections = Array.isArray(input?.sections)
    ? input.sections
        .map((section) => ({
          heading: String(section?.heading || section?.title || '').trim(),
          body: String(section?.body || section?.content || '').trim()
        }))
        .filter((section) => section.heading && section.body)
    : []

  return {
    title: String(input?.title || 'AI探索结果').trim(),
    subtitle: String(input?.subtitle || '').trim(),
    country: String(input?.country || '').trim(),
    countryCode: String(input?.countryCode || '').trim().toUpperCase(),
    coordinates: normalizeCoordinates(input?.coordinates),
    summary: String(input?.summary || '').trim(),
    sections,
    provider: input?.provider || 'deepseek'
  }
}

export function normalizeAiRouteResult(input) {
  const stops = Array.isArray(input?.stops)
    ? input.stops
        .map((stop, index) => ({
          id: String(stop?.id || `${input?.routeId || 'ai-route'}-${index}`).trim(),
          name: String(stop?.name || stop?.title || '').trim(),
          country: String(stop?.country || '').trim(),
          countryCode: String(stop?.countryCode || '').trim().toUpperCase(),
          coordinates: normalizeCoordinates(stop?.coordinates),
          intro: String(stop?.intro || '').trim(),
          culture: String(stop?.culture || '').trim(),
          highlights: Array.isArray(stop?.highlights)
            ? stop.highlights.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 4)
            : [],
          staySeconds: Number.isFinite(Number(stop?.staySeconds)) ? Math.max(5, Number(stop.staySeconds)) : 8
        }))
        .filter((stop) => stop.name && stop.coordinates.length === 2)
    : []

  return {
    routeId: String(input?.routeId || `ai-route-${Date.now()}`).trim(),
    title: String(input?.title || 'AI 动态探索航线').trim(),
    theme: String(input?.theme || '根据你的指令临时生成的世界路线').trim(),
    summary: String(input?.summary || '').trim(),
    stops,
    provider: input?.provider || 'deepseek'
  }
}

function normalizeIntent(value) {
  const id = String(value || '').trim()
  return aiExplorationModules.some((module) => module.id === id) ? id : 'country_intro'
}

function normalizeCoordinates(value) {
  if (!Array.isArray(value) || value.length < 2) return []
  const lat = Number(value[0])
  const lng = Number(value[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return []
  return [Number(lat.toFixed(4)), Number(lng.toFixed(4))]
}
