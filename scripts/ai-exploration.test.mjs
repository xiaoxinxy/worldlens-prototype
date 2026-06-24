import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  aiExplorationModules,
  normalizeAiExploreResult,
  normalizeAiIntent,
  normalizeAiRouteResult
} from '../src/api/aiApi.js'

const aiPanel = readFileSync('src/components/ai/AiExplorationPanel.vue', 'utf8')

describe('AI exploration center data contract', () => {
  it('exposes focused exploration modules including dynamic route playback', () => {
    assert.deepEqual(
      aiExplorationModules.map((module) => module.id),
      ['parallel_life', 'ai_guide', 'world_blindbox', 'ai_route', 'world_advisor', 'civilization', 'world_story']
    )
    aiExplorationModules.forEach((module) => {
      assert.ok(module.title)
      assert.ok(module.promptPlaceholder)
      assert.ok(module.examples.length >= 3)
    })
  })

  it('normalizes AI intent with target coordinates for globe flight', () => {
    const intent = normalizeAiIntent({
      intent: 'parallel_life',
      target: '冰岛',
      targetType: 'country',
      countryCode: 'isl',
      coordinates: ['64.9631', '-19.0208']
    })

    assert.equal(intent.intent, 'parallel_life')
    assert.equal(intent.target, '冰岛')
    assert.equal(intent.targetType, 'country')
    assert.equal(intent.countryCode, 'ISL')
    assert.deepEqual(intent.coordinates, [64.9631, -19.0208])
  })

  it('normalizes structured exploration results for panel rendering', () => {
    const result = normalizeAiExploreResult({
      title: '如果你出生在冰岛',
      subtitle: '一条更靠近海风、火山与高纬社区的生活线索',
      country: '冰岛',
      coordinates: [64.9631, -19.0208],
      sections: [
        { heading: '成长环境', body: '大概率会更熟悉小规模社区、海洋气候和户外自然。' }
      ]
    })

    assert.equal(result.title, '如果你出生在冰岛')
    assert.equal(result.country, '冰岛')
    assert.deepEqual(result.coordinates, [64.9631, -19.0208])
    assert.equal(result.sections[0].heading, '成长环境')
  })

  it('normalizes dynamic AI route results for globe playback and saving', () => {
    const route = normalizeAiRouteResult({
      routeId: 'ai-route-europe',
      title: '欧洲国家旅行航线',
      theme: '城市文化与经典景点',
      summary: '一条动态生成的欧洲路线。',
      stops: [
        {
          name: '巴黎',
          country: '法国',
          countryCode: 'fra',
          coordinates: ['48.8566', '2.3522'],
          intro: '巴黎适合作为欧洲文化旅行的起点。',
          culture: '咖啡馆、博物馆和街区漫步构成这里的日常气质。',
          highlights: ['卢浮宫', '塞纳河']
        }
      ]
    })

    assert.equal(route.routeId, 'ai-route-europe')
    assert.equal(route.stops[0].countryCode, 'FRA')
    assert.deepEqual(route.stops[0].coordinates, [48.8566, 2.3522])
    assert.equal(route.stops[0].staySeconds, 8)
  })

  it('keeps the user-selected exploration module instead of silently changing modes', () => {
    assert.match(aiPanel, /const effectiveIntent = activeModuleId\.value/)
    assert.doesNotMatch(aiPanel, /activeModuleId\.value === 'world_blindbox' \? 'world_blindbox' : intent\.intent/)
  })
})
