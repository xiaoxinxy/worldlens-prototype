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

export function listAdminOceanCurrents(filters = {}) {
  return request(`/admin/ocean/currents${queryString(filters)}`)
}

export function createOceanCurrent(payload) {
  return request('/admin/ocean/currents', { method: 'POST', body: payload })
}

export function updateOceanCurrent(id, payload) {
  return request(`/admin/ocean/currents/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
}

export function deleteOceanCurrent(id) {
  return request(`/admin/ocean/currents/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function setOceanCurrentStatus(id, enabled) {
  return request(`/admin/ocean/currents/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { enabled }
  })
}

export function setOceanCurrentSort(id, sortOrder) {
  return request(`/admin/ocean/currents/${encodeURIComponent(id)}/sort`, {
    method: 'PATCH',
    body: { sortOrder }
  })
}
