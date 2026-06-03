const API_BASE = import.meta.env.VITE_API_BASE || ''
const STORAGE_KEY = 'worldlens:favorites'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

async function post(path, body) {
  if (!API_BASE) return null
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

export async function getFavoriteIds() {
  return readLocal()
}

export async function saveFavoriteId(id) {
  const ids = readLocal()
  const next = ids.includes(id) ? ids : [...ids, id]
  writeLocal(next)
  try {
    await post('/favorites', { placeId: id })
  } catch {}
  return next
}

export async function removeFavoriteId(id) {
  const next = readLocal().filter((item) => item !== id)
  writeLocal(next)
  return next
}

export async function clearFavoriteIds() {
  writeLocal([])
  return []
}
