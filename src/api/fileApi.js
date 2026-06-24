import { authHeaders } from './authApi'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function upload(path, file) {
  const data = new FormData()
  data.set('file', file)

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...authHeaders()
    },
    body: data
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

export function uploadAvatar(file) {
  return upload('/files/avatar', file)
}

export function uploadContentImage(file) {
  return upload('/admin/files/content-image', file)
}
