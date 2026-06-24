import { authHeaders } from './authApi'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function getAdminSummary() {
  const response = await fetch(`${API_BASE}/admin/summary`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders()
    }
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return payload?.data ?? payload
}
