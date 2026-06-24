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

export function listAdminTerrainFeatures(filters = {}) {
  return request(`/admin/terrain${queryString(filters)}`)
}

export function createTerrainFeature(payload) {
  return request('/admin/terrain', { method: 'POST', body: payload })
}

export function updateTerrainFeature(id, payload) {
  return request(`/admin/terrain/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
}

export function setTerrainFeatureStatus(id, enabled) {
  return request(`/admin/terrain/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { enabled }
  })
}

export function deleteTerrainFeature(id) {
  return request(`/admin/terrain/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
