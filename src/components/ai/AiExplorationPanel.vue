<template>
  <section
    class="ai-exploration-panel"
    :class="`mission-${activeModule.layout}`"
    :style="{ '--active-accent': activeModule.accent }"
  >
    <header class="ai-panel-header">
      <div>
        <span>WorldLens AI</span>
        <strong>探索中心</strong>
      </div>
      <small>Globe Linked</small>
    </header>

    <div class="ai-module-grid" role="tablist" aria-label="AI探索模块">
      <button
        v-for="module in aiExplorationModules"
        :key="module.id"
        type="button"
        class="ai-module-card"
        :class="{ active: activeModuleId === module.id }"
        :style="{ '--module-accent': module.accent }"
        @click="selectModule(module.id)"
      >
        <i>{{ module.icon }}</i>
        <strong>{{ module.shortTitle }}</strong>
        <small>{{ module.shortDesc }}</small>
      </button>
    </div>

    <article class="ai-mission-card">
      <div class="ai-mission-visual" :class="`visual-${activeModule.layout}`" aria-hidden="true">
        <template v-if="activeModule.layout === 'life'">
          <span>出生</span>
          <i></i>
          <span>教育</span>
          <i></i>
          <span>生活</span>
        </template>
        <template v-else-if="activeModule.layout === 'compass'">
          <b>N</b><i></i><em></em>
        </template>
        <template v-else-if="activeModule.layout === 'blindbox'">
          <b>?</b><span>随机坐标</span>
        </template>
        <template v-else-if="activeModule.layout === 'advisor'">
          <span></span><span></span><span></span>
        </template>
        <template v-else-if="activeModule.layout === 'timeline'">
          <i></i><i></i><i></i><i></i>
        </template>
        <template v-else-if="activeModule.layout === 'route'">
          <i></i><span></span><i></i><span></span><i></i>
        </template>
        <template v-else>
          <span></span><span></span><span></span>
        </template>
      </div>
      <div class="ai-mission-copy">
        <span>{{ activeModule.tag }}</span>
        <h2>{{ activeModule.shortTitle }}</h2>
        <p>{{ activeModule.description }}</p>
      </div>
      <form class="ai-command-form" @submit.prevent="submitExploration()">
        <label>
          <span>探索指令</span>
          <textarea
            v-model="message"
            :placeholder="activeModule.promptPlaceholder"
            rows="3"
          ></textarea>
        </label>
        <button type="submit" :disabled="loading">
          {{ loading ? '正在驱动地球...' : activeModule.actionLabel }}
        </button>
      </form>
    </article>

    <div class="ai-example-row">
      <button
        v-for="example in activeModule.examples"
        :key="example"
        type="button"
        @click="submitExploration(example)"
      >
        {{ example }}
      </button>
    </div>

    <div class="ai-pipeline" aria-label="AI探索流程">
      <span
        v-for="step in aiPipelineSteps"
        :key="step.id"
        :class="{ active: pipelineStep === step.id, done: doneSteps.includes(step.id) }"
      >
        {{ step.label }}
      </span>
    </div>

    <article v-if="intentResult" class="ai-target-card">
      <div>
        <span>目标地点</span>
        <strong>{{ intentResult.country || intentResult.target }}</strong>
      </div>
      <small v-if="intentResult.coordinates.length">
        {{ intentResult.coordinates[0].toFixed(2) }}° / {{ intentResult.coordinates[1].toFixed(2) }}°
      </small>
    </article>

    <p v-if="errorMessage" class="ai-error">{{ errorMessage }}</p>

    <article v-if="routeResult" class="ai-report ai-route-report">
      <span>动态航线</span>
      <h2>{{ routeResult.title }}</h2>
      <p class="ai-report-subtitle">{{ routeResult.theme }} · {{ routeResult.stops.length }} 站自动巡航</p>
      <div class="ai-route-stop-preview">
        <span v-for="(stop, index) in routeResult.stops" :key="stop.id">
          <b>{{ index + 1 }}</b>
          {{ stop.name }}
        </span>
      </div>
      <div class="ai-follow-actions">
        <button type="button" @click="emitRoute(routeResult)">重新播放航线</button>
        <button type="button" @click="submitExploration()">换一条路线</button>
      </div>
    </article>

    <article v-if="exploreResult" class="ai-report">
      <span>探索报告</span>
      <h2>{{ exploreResult.title }}</h2>
      <p class="ai-report-subtitle">{{ exploreResult.subtitle || exploreResult.summary }}</p>
      <div class="ai-report-sections">
        <section v-for="section in exploreResult.sections" :key="section.heading">
          <h3>{{ section.heading }}</h3>
          <p>{{ section.body }}</p>
        </section>
      </div>
      <div class="ai-follow-actions">
        <button type="button" @click="submitExploration()">继续探索</button>
        <button type="button" @click="selectModule('world_blindbox'); submitExploration('今天去哪？')">世界盲盒</button>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  aiExplorationModules,
  aiPipelineSteps,
  detectAiIntent,
  exploreWithAi,
  generateAiRoute
} from '../../api/aiApi'

const emit = defineEmits(['target-focus', 'route-start'])
const AI_HISTORY_KEY = 'worldlens:ai-exploration-history'

const activeModuleId = ref('parallel_life')
const message = ref(aiExplorationModules[0].examples[0])
const loading = ref(false)
const errorMessage = ref('')
const intentResult = ref(null)
const exploreResult = ref(null)
const routeResult = ref(null)
const pipelineStep = ref('input')
const doneSteps = ref([])

const activeModule = computed(() => aiExplorationModules.find((module) => module.id === activeModuleId.value) || aiExplorationModules[0])

function selectModule(moduleId) {
  const next = aiExplorationModules.find((module) => module.id === moduleId)
  if (!next) return
  activeModuleId.value = moduleId
  message.value = next.examples[0] || next.promptPlaceholder
  errorMessage.value = ''
}

async function submitExploration(overrideMessage) {
  const question = String(overrideMessage || message.value || activeModule.value.promptPlaceholder).trim()
  if (!question || loading.value) return

  if (activeModuleId.value === 'ai_route') {
    await submitRoute(question)
    return
  }

  message.value = question
  loading.value = true
  errorMessage.value = ''
  exploreResult.value = null
  routeResult.value = null
  intentResult.value = null
  setPipeline('intent', ['input'])

  try {
    const intent = await detectAiIntent(question)
    const effectiveIntent = activeModuleId.value
    intentResult.value = { ...intent, intent: effectiveIntent }
    setPipeline('flight', ['input', 'intent', 'locate'])
    emitFocus(intentResult.value)

    setPipeline('content', ['input', 'intent', 'locate', 'flight', 'highlight'])
    const result = await exploreWithAi({
      intent: effectiveIntent,
      target: intent.target || intent.country,
      message: question
    })
    exploreResult.value = result
    recordAiExploration(question, intentResult.value, result, effectiveIntent)
    emitFocus(result)
    setPipeline('content', ['input', 'intent', 'locate', 'flight', 'highlight', 'content'])
  } catch (error) {
    errorMessage.value = readableError(error)
    setPipeline('input', [])
  } finally {
    loading.value = false
  }
}

async function submitRoute(question) {
  message.value = question
  loading.value = true
  errorMessage.value = ''
  exploreResult.value = null
  routeResult.value = null
  intentResult.value = null
  setPipeline('intent', ['input'])

  try {
    setPipeline('locate', ['input', 'intent'])
    const route = await generateAiRoute(question)
    if (!route.stops.length) throw new Error('AI 没有生成可播放的路线站点')
    routeResult.value = route
    setPipeline('flight', ['input', 'intent', 'locate'])
    emitRoute(route)
    setPipeline('content', ['input', 'intent', 'locate', 'flight', 'highlight', 'content'])
  } catch (error) {
    errorMessage.value = readableError(error)
    setPipeline('input', [])
  } finally {
    loading.value = false
  }
}

function emitRoute(route) {
  emit('route-start', {
    ...route,
    sourceQuestion: message.value
  })
}

function emitFocus(payload) {
  if (!payload?.coordinates?.length) return
  emit('target-focus', {
    ...payload,
    moduleId: activeModuleId.value,
    target: payload.target || payload.country,
    coordinates: payload.coordinates
  })
}

function setPipeline(step, done) {
  pipelineStep.value = step
  doneSteps.value = done
}

function recordAiExploration(question, intent, result, effectiveIntent) {
  if (typeof window === 'undefined') return
  const module = aiExplorationModules.find((item) => item.id === effectiveIntent) || activeModule.value
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    moduleId: effectiveIntent,
    moduleTitle: module?.shortTitle || module?.title || 'WorldLens AI',
    title: result?.title || '',
    country: result?.country || intent?.country || '',
    target: intent?.target || result?.country || '',
    coordinates: result?.coordinates || intent?.coordinates || [],
    createdAt: new Date().toISOString()
  }
  try {
    const previous = JSON.parse(window.localStorage.getItem(AI_HISTORY_KEY) || '[]')
    const next = [entry, ...(Array.isArray(previous) ? previous : [])].slice(0, 24)
    window.localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('worldlens:ai-history-updated'))
  } catch {}
}

function readableError(error) {
  const messageText = String(error?.message || 'AI探索失败')
  if (messageText.includes('DEEPSEEK_API_KEY')) {
    return '后端没有读取到 DeepSeek Key，已无法发起在线生成。'
  }
  if (messageText.includes('DeepSeek')) {
    return 'DeepSeek 服务暂时不可用，请稍后再试。'
  }
  return messageText
}
</script>

<style scoped>
.ai-exploration-panel {
  width: 100%;
  max-height: min(74vh, 700px);
  overflow-y: auto;
  padding: 20px;
  border: 1px solid rgba(125, 211, 252, 0.24);
  border-radius: 8px;
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--active-accent) 22%, transparent), transparent 36%),
    linear-gradient(180deg, rgba(8, 29, 45, 0.9), rgba(3, 13, 24, 0.84)),
    rgba(4, 18, 29, 0.78);
  color: #eaf7ff;
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.34),
    0 0 42px color-mix(in srgb, var(--active-accent) 14%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(26px) saturate(1.25);
}

.ai-exploration-panel::-webkit-scrollbar {
  width: 6px;
}

.ai-exploration-panel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 220, 255, 0.34);
}

.ai-panel-header,
.ai-target-card,
.ai-follow-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.ai-panel-header {
  margin-bottom: 16px;
}

.ai-panel-header div,
.ai-mission-copy {
  display: grid;
  gap: 4px;
}

.ai-panel-header span,
.ai-target-card span,
.ai-report > span,
.ai-command-form span,
.ai-mission-copy span {
  color: var(--active-accent);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ai-panel-header strong {
  font-size: 28px;
  line-height: 1;
}

.ai-panel-header small {
  padding: 7px 9px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 999px;
  color: rgba(226, 246, 255, 0.7);
  background: rgba(2, 12, 22, 0.42);
}

.ai-module-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.ai-module-card {
  display: grid;
  place-items: center;
  gap: 5px;
  min-height: 76px;
  padding: 9px 6px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-radius: 8px;
  text-align: left;
  color: #eef8ff;
  background: linear-gradient(180deg, rgba(5, 21, 34, 0.72), rgba(2, 12, 22, 0.62));
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.ai-module-card i {
  font-style: normal;
  font-size: 20px;
  line-height: 1;
}

.ai-module-card small {
  color: var(--module-accent);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: none;
}

.ai-module-card strong {
  font-size: 13px;
  text-align: center;
}

.ai-module-card:hover,
.ai-module-card.active {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--module-accent) 68%, rgba(125, 211, 252, 0.26));
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--module-accent) 18%, transparent), transparent 46%),
    rgba(7, 30, 46, 0.72);
}

.ai-mission-card {
  display: grid;
  grid-template-columns: 172px minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    rgba(2, 12, 22, 0.38);
}

.ai-mission-visual {
  position: relative;
  min-height: 190px;
  border: 1px solid color-mix(in srgb, var(--active-accent) 42%, rgba(125, 211, 252, 0.14));
  border-radius: 8px;
  background:
    radial-gradient(circle at 50% 22%, color-mix(in srgb, var(--active-accent) 22%, transparent), transparent 38%),
    rgba(2, 12, 22, 0.46);
  overflow: hidden;
}

.visual-life {
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 20px;
}

.visual-life span {
  width: fit-content;
  padding: 7px 10px;
  border-radius: 999px;
  color: #fff7cc;
  background: rgba(255, 255, 255, 0.08);
}

.visual-life i {
  width: 2px;
  height: 18px;
  margin-left: 18px;
  border-radius: 999px;
  background: var(--active-accent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--active-accent) 70%, transparent);
}

.visual-compass {
  display: grid;
  place-items: center;
}

.visual-compass::before {
  content: '';
  width: 118px;
  height: 118px;
  border: 1px solid color-mix(in srgb, var(--active-accent) 56%, transparent);
  border-radius: 50%;
  box-shadow: inset 0 0 34px rgba(255, 255, 255, 0.05);
}

.visual-compass b {
  position: absolute;
  top: 26px;
  color: var(--active-accent);
  font-size: 13px;
}

.visual-compass i {
  position: absolute;
  width: 3px;
  height: 72px;
  border-radius: 999px;
  background: linear-gradient(var(--active-accent), transparent);
  transform: rotate(36deg);
  transform-origin: 50% 80%;
}

.visual-compass em {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--active-accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--active-accent) 70%, transparent);
}

.visual-blindbox {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
}

.visual-blindbox b {
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  border: 1px solid color-mix(in srgb, var(--active-accent) 60%, transparent);
  border-radius: 18px;
  color: #fff;
  font-size: 44px;
  transform: rotate(-8deg);
  background: rgba(255, 255, 255, 0.08);
}

.visual-blindbox span {
  color: rgba(239, 247, 255, 0.68);
  font-size: 12px;
}

.visual-advisor {
  display: grid;
  align-content: center;
  gap: 16px;
  padding: 24px;
}

.visual-advisor span {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--active-accent), rgba(255, 255, 255, 0.08));
}

.visual-advisor span:nth-child(2) {
  width: 76%;
}

.visual-advisor span:nth-child(3) {
  width: 58%;
}

.visual-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
}

.visual-timeline::before {
  content: '';
  position: absolute;
  left: 28px;
  right: 28px;
  height: 1px;
  background: color-mix(in srgb, var(--active-accent) 48%, transparent);
}

.visual-timeline i {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--active-accent);
  box-shadow: 0 0 18px color-mix(in srgb, var(--active-accent) 66%, transparent);
}

.visual-route {
  display: grid;
  grid-template-columns: 22px 1fr 22px 1fr 22px;
  align-items: center;
  padding: 28px;
}

.visual-route i {
  position: relative;
  z-index: 1;
  width: 20px;
  height: 20px;
  border: 2px solid var(--active-accent);
  border-radius: 50%;
  background: rgba(2, 12, 22, 0.9);
  box-shadow: 0 0 22px color-mix(in srgb, var(--active-accent) 58%, transparent);
}

.visual-route span {
  height: 2px;
  background: linear-gradient(90deg, var(--active-accent), rgba(255, 255, 255, 0.12));
}

.visual-story {
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 24px;
}

.visual-story span {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}

.visual-story span:nth-child(2) {
  width: 78%;
}

.visual-story span:nth-child(3) {
  width: 48%;
}

.ai-mission-copy h2 {
  margin: 0;
  font-size: 28px;
}

.ai-mission-copy p {
  margin: 0;
  color: rgba(226, 246, 255, 0.7);
  font-size: 14px;
  line-height: 1.45;
}

.ai-command-form {
  display: grid;
  gap: 10px;
}

.ai-command-form label {
  display: grid;
  gap: 8px;
}

.ai-command-form textarea {
  width: 100%;
  resize: vertical;
  min-height: 92px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 8px;
  padding: 14px;
  color: #f8fbff;
  background: rgba(1, 10, 20, 0.74);
  outline: none;
  font: inherit;
  font-weight: 700;
  line-height: 1.5;
}

.ai-command-form button,
.ai-example-row button,
.ai-follow-actions button {
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 8px;
  color: #eef8ff;
  background: rgba(5, 20, 32, 0.62);
  font-weight: 900;
  cursor: pointer;
}

.ai-command-form button {
  min-height: 48px;
  color: #061522;
  background: linear-gradient(135deg, var(--active-accent), #63d6ff);
}

.ai-command-form button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.ai-example-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.ai-example-row button {
  border-radius: 999px;
  padding: 8px 10px;
  color: #dff6ff;
  font-size: 12px;
}

.ai-pipeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.ai-pipeline span {
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 8px;
  padding: 8px;
  color: rgba(226, 246, 255, 0.54);
  background: rgba(3, 13, 24, 0.42);
  font-size: 12px;
  text-align: center;
}

.ai-pipeline span.active,
.ai-pipeline span.done {
  color: #fff;
  border-color: color-mix(in srgb, var(--active-accent) 62%, rgba(125, 211, 252, 0.2));
}

.ai-target-card {
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--active-accent) 44%, rgba(56, 189, 248, 0.16));
  border-radius: 8px;
  background: rgba(8, 47, 73, 0.42);
}

.ai-target-card div {
  display: grid;
  gap: 4px;
}

.ai-target-card strong {
  font-size: 24px;
}

.ai-target-card small {
  color: rgba(223, 242, 254, 0.72);
}

.ai-error {
  margin: 12px 0;
  padding: 12px;
  border: 1px solid rgba(248, 113, 113, 0.42);
  border-radius: 8px;
  color: #fecaca;
  background: rgba(127, 29, 29, 0.3);
}

.ai-report {
  display: grid;
  gap: 12px;
  padding-top: 4px;
}

.ai-report h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.12;
}

.ai-report-subtitle {
  margin: 0;
  color: rgba(226, 246, 255, 0.78);
  line-height: 1.65;
}

.ai-report-sections {
  display: grid;
  gap: 10px;
}

.ai-report-sections section {
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 8px;
  padding: 12px;
  background: rgba(3, 13, 24, 0.34);
}

.ai-report-sections h3 {
  margin: 0 0 6px;
  color: var(--active-accent);
  font-size: 15px;
}

.ai-report-sections p {
  margin: 0;
  color: rgba(231, 247, 255, 0.84);
  line-height: 1.65;
}

.ai-route-stop-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ai-route-stop-preview span {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 10px;
  border: 1px solid rgba(255, 209, 102, 0.18);
  border-radius: 8px;
  color: rgba(240, 249, 255, 0.88);
  background: rgba(3, 13, 24, 0.42);
  font-size: 13px;
}

.ai-route-stop-preview b {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #061522;
  background: var(--active-accent);
}

.ai-follow-actions {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.ai-follow-actions button {
  padding: 10px 12px;
}

@media (max-width: 820px) {
  .ai-exploration-panel {
    max-height: min(70vh, 660px);
    padding: 16px;
  }

  .ai-module-grid,
  .ai-pipeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ai-mission-card {
    grid-template-columns: 1fr;
  }

  .ai-mission-visual {
    min-height: 120px;
  }
}
</style>
