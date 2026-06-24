import { authHeaders } from './authApi'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders()
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {}

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }

  return payload?.data ?? payload
}

function queryString(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(key, String(value).trim())
    }
  })
  const text = params.toString()
  return text ? `?${text}` : ''
}

export function listAdminContentEntries(module, filters = {}) {
  return request(`/admin/content/${encodeURIComponent(module)}${queryString(filters)}`)
}

export function listAdminContentEntriesPage(module, filters = {}) {
  return request(`/admin/content/${encodeURIComponent(module)}/page${queryString(filters)}`)
}

export function createContentEntry(module, payload) {
  return request(`/admin/content/${encodeURIComponent(module)}`, { method: 'POST', body: payload })
}

export function updateContentEntry(module, entryId, payload) {
  return request(`/admin/content/${encodeURIComponent(module)}/${encodeURIComponent(entryId)}`, { method: 'PUT', body: payload })
}

export function setContentEntryStatus(module, entryId, enabled) {
  return request(`/admin/content/${encodeURIComponent(module)}/${encodeURIComponent(entryId)}/status`, {
    method: 'PATCH',
    body: { enabled }
  })
}

export function deleteContentEntry(module, entryId) {
  return request(`/admin/content/${encodeURIComponent(module)}/${encodeURIComponent(entryId)}`, { method: 'DELETE' })
}
