<template>
  <aside class="detail-local-ai" :class="{ open }">
    <button
      type="button"
      class="detail-local-ai-toggle"
      :aria-expanded="String(open)"
      aria-label="打开 AI 助手"
      @click="open = !open"
    >
      <span>AI</span>
      <strong>助手</strong>
    </button>

    <section v-if="open" class="detail-local-ai-panel" aria-label="详情页 AI 助手">
      <header>
        <div>
          <small>WORLDLENS</small>
          <strong>AI 助手 · {{ subjectName }}</strong>
        </div>
        <div class="detail-local-ai-head-actions">
          <button type="button" @click="clearConversation">清空</button>
          <button type="button" aria-label="关闭 AI 助手" @click="open = false">×</button>
        </div>
      </header>

      <div ref="messageList" class="detail-local-ai-messages">
        <article
          v-for="(message, index) in messages"
          :key="`${message.role}-${index}`"
          :class="message.role"
        >
          <span>{{ message.role === 'assistant' ? 'AI 助手' : '你' }}</span>
          <p>{{ message.content }}</p>
        </article>
        <article v-if="loading" class="assistant pending">
          <span>AI 助手</span>
          <p>正在读取当前详情并思考...</p>
        </article>
      </div>

      <div class="detail-local-ai-suggestions">
        <button
          v-for="question in suggestedQuestions"
          :key="question"
          type="button"
          :disabled="loading"
          @click="sendQuestion(question)"
        >
          {{ question }}
        </button>
      </div>

      <form @submit.prevent="sendQuestion(draft)">
        <textarea
          v-model="draft"
          rows="2"
          :placeholder="`询问关于${subjectName}的问题...`"
          :disabled="loading"
          @keydown.ctrl.enter.prevent="sendQuestion(draft)"
        ></textarea>
        <button type="submit" :disabled="loading || !draft.trim()">
          {{ loading ? '生成中' : '发送' }}
        </button>
      </form>
    </section>
  </aside>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { askDetailAi } from '../../api/detailAiApi'

const props = defineProps({
  subjectType: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  context: {
    type: Object,
    required: true
  }
})

const open = ref(false)
const loading = ref(false)
const draft = ref('')
const messageList = ref(null)
const messages = ref([])

const suggestedQuestions = computed(() => {
  if (props.subjectType === 'terrain') {
    return ['它是怎样形成的？', '它如何影响气候？', '它与人类活动有什么关系？']
  }
  if (props.subjectType === 'climate') {
    return ['这种气候为什么形成？', '它适合哪些农业？', '季节变化有什么特点？']
  }
  return ['这里最值得了解什么？', '地理如何影响当地文化？', '用简单时间线介绍它']
})

watch(
  () => `${props.subjectType}:${props.subjectId}`,
  clearConversation,
  { immediate: true }
)

async function sendQuestion(value) {
  const question = String(value || '').trim()
  if (!question || loading.value) return
  messages.value.push({ role: 'user', content: question })
  draft.value = ''
  loading.value = true
  await scrollToLatest()

  try {
    const result = await askDetailAi({
      subjectType: props.subjectType,
      subjectId: props.subjectId,
      subjectName: props.subjectName,
      context: props.context,
      messages: messages.value
    })
    messages.value.push({
      role: 'assistant',
      content: result.answer || 'AI 助手没有返回内容。'
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: String(error?.message || 'AI 助手暂时无法回答，请稍后再试。')
    })
  } finally {
    loading.value = false
    await scrollToLatest()
  }
}

function clearConversation() {
  draft.value = ''
  messages.value = [{
    role: 'assistant',
    content: `你好，我是当前详情页的 AI 助手。你可以继续问我关于“${props.subjectName}”的问题。`
  }]
}

async function scrollToLatest() {
  await nextTick()
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}
</script>

<style scoped>
.detail-local-ai {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 90;
  display: grid;
  justify-items: end;
  gap: 12px;
  pointer-events: none;
}

.detail-local-ai button,
.detail-local-ai textarea,
.detail-local-ai-panel {
  pointer-events: auto;
}

.detail-local-ai-toggle {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border: 1px solid rgba(125, 211, 252, 0.48);
  border-radius: 50%;
  color: #effaff;
  background:
    radial-gradient(circle at 35% 28%, rgba(125, 211, 252, 0.34), transparent 34%),
    linear-gradient(145deg, rgba(8, 47, 73, 0.98), rgba(3, 18, 31, 0.98));
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.38), 0 0 30px rgba(56, 189, 248, 0.22);
  cursor: pointer;
}

.detail-local-ai-toggle span {
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
}

.detail-local-ai-toggle strong {
  color: #7dd3fc;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.detail-local-ai-panel {
  width: min(420px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 130px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 18px;
  overflow: hidden;
  color: #eaf8ff;
  background:
    radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.2), transparent 34%),
    rgba(2, 14, 25, 0.97);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(24px);
}

.detail-local-ai-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(125, 211, 252, 0.16);
}

.detail-local-ai-panel header div:first-child {
  display: grid;
  gap: 4px;
}

.detail-local-ai-panel header small {
  color: #7dd3fc;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.detail-local-ai-panel header strong {
  font-size: 15px;
}

.detail-local-ai-head-actions {
  display: flex;
  gap: 6px;
}

.detail-local-ai-head-actions button,
.detail-local-ai-suggestions button {
  border: 1px solid rgba(125, 211, 252, 0.2);
  border-radius: 999px;
  padding: 6px 9px;
  color: #dff6ff;
  background: rgba(8, 47, 73, 0.5);
  cursor: pointer;
}

.detail-local-ai-messages {
  display: grid;
  align-content: start;
  gap: 12px;
  overflow-y: auto;
  padding: 18px;
}

.detail-local-ai-messages article {
  display: grid;
  gap: 5px;
  max-width: 88%;
}

.detail-local-ai-messages article.user {
  justify-self: end;
}

.detail-local-ai-messages span {
  color: rgba(215, 241, 255, 0.58);
  font-size: 10px;
}

.detail-local-ai-messages p {
  margin: 0;
  padding: 11px 13px;
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 14px 14px 14px 4px;
  color: rgba(239, 249, 255, 0.9);
  background: rgba(8, 47, 73, 0.46);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.detail-local-ai-messages article.user p {
  border-radius: 14px 14px 4px 14px;
  color: #062033;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8);
}

.detail-local-ai-messages article.pending p {
  color: #bae6fd;
  animation: local-ai-pulse 1.1s ease-in-out infinite alternate;
}

.detail-local-ai-suggestions {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 16px 12px;
}

.detail-local-ai-suggestions button {
  flex: 0 0 auto;
  font-size: 11px;
}

.detail-local-ai-panel form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(125, 211, 252, 0.14);
}

.detail-local-ai-panel textarea {
  resize: none;
  min-height: 48px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  color: #effaff;
  background: rgba(1, 9, 17, 0.84);
  outline: none;
  font: inherit;
  font-size: 13px;
}

.detail-local-ai-panel form button {
  min-width: 64px;
  border: 0;
  border-radius: 12px;
  color: #062033;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8);
  font-weight: 900;
  cursor: pointer;
}

.detail-local-ai-panel button:disabled {
  cursor: wait;
  opacity: 0.56;
}

@keyframes local-ai-pulse {
  from { opacity: 0.58; }
  to { opacity: 1; }
}

@media (max-width: 680px) {
  .detail-local-ai {
    right: 14px;
    bottom: 14px;
  }

  .detail-local-ai-toggle {
    width: 58px;
    height: 58px;
  }

  .detail-local-ai-panel {
    width: calc(100vw - 28px);
    height: min(72vh, 590px);
  }
}
</style>
