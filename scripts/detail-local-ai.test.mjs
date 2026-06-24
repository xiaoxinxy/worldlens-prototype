import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const detailAiApi = readFileSync('src/api/detailAiApi.js', 'utf8')
const assistant = readFileSync('src/components/ai/DetailAiAssistant.vue', 'utf8')
const placeDetail = readFileSync('src/views/PlaceDetail.vue', 'utf8')
const terrainDetail = readFileSync('src/views/TerrainDetail.vue', 'utf8')
const climateDetail = readFileSync('src/views/ClimateDetail.vue', 'utf8')
const earthView = readFileSync('src/views/EarthView.vue', 'utf8')

test('detail assistant uses a separate local endpoint with a natural user-facing name', () => {
  assert.match(detailAiApi, /\/local-ai\/detail-chat/)
  assert.match(assistant, /AI 助手/)
  assert.doesNotMatch(assistant, />[^<]*(本地 AI|Ollama|qwen2:7b)[^<]*</i)
  assert.match(assistant, /askDetailAi/)
  assert.doesNotMatch(detailAiApi, /\/ai\/explore|\/ai\/intent|DeepSeek/)
})

test('detail assistant is rendered only by the three existing detail views', () => {
  for (const source of [placeDetail, terrainDetail, climateDetail]) {
    assert.match(source, /DetailAiAssistant/)
    assert.match(source, /:context=/)
    assert.match(source, /:subject-name=/)
  }
  assert.doesNotMatch(earthView, /DetailAiAssistant/)
})

test('assistant supports contextual multi-turn chat and reset behavior', () => {
  assert.match(assistant, /messages/)
  assert.match(assistant, /role:\s*'user'/)
  assert.match(assistant, /role:\s*'assistant'/)
  assert.match(assistant, /clearConversation/)
  assert.match(assistant, /watch\(/)
  assert.match(assistant, /suggestedQuestions/)
})
