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

export function listAdminCountries(filters = {}) {
  return request(`/admin/countries${queryString(filters)}`)
}

export function listAdminCountriesPage(filters = {}) {
  return request(`/admin/countries/page${queryString(filters)}`)
}

export function createCountryProfile(payload) {
  return request('/admin/countries', { method: 'POST', body: payload })
}

export function updateCountryProfile(code, payload) {
  return request(`/admin/countries/${encodeURIComponent(code)}`, { method: 'PUT', body: payload })
}

export function setCountryProfileStatus(code, enabled) {
  return request(`/admin/countries/${encodeURIComponent(code)}/status`, {
    method: 'PATCH',
    body: { enabled }
  })
}

export function deleteCountryProfile(code) {
  return request(`/admin/countries/${encodeURIComponent(code)}`, { method: 'DELETE' })
}
