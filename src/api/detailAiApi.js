const API_BASE = import.meta.env?.VITE_API_BASE || '/api'

export async function askDetailAi(payload) {
  const response = await fetch(`${API_BASE}/local-ai/detail-chat`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subjectType: String(payload?.subjectType || '').trim(),
      subjectId: String(payload?.subjectId || '').trim(),
      subjectName: String(payload?.subjectName || '').trim(),
      context: payload?.context && typeof payload.context === 'object' ? payload.context : {},
      messages: normalizeMessages(payload?.messages)
    })
  })

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || readableStatus(response.status))
  }
  const data = result?.data ?? result
  return {
    answer: String(data?.answer || '').trim(),
    model: String(data?.model || 'qwen2:7b').trim(),
    provider: String(data?.provider || 'ollama').trim()
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim()
    }))
    .filter((message) => message.content)
    .slice(-12)
}

function readableStatus(status) {
  if (status === 503) return '无法连接本地模型，请先启动 Ollama 并确认已安装 qwen2:7b'
  if (status === 400) return '问题或详情资料不完整'
  return `本地 AI 请求失败（HTTP ${status}）`
}
