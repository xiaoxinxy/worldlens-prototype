import { authHeaders, currentUser } from './authApi'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const STORAGE_KEY = 'worldlens:history'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12)))
}

function hasRemoteSession() {
  return Boolean(currentUser() && authHeaders().Authorization)
}

function normalizeRemote(item) {
  return {
    id: item.itemId,
    slug: item.slug || item.itemId,
    name: item.title,
    type: item.itemType,
    coverImage: item.coverImage || '',
    viewedAt: item.lastVisitedAt || new Date().toISOString(),
    visitedCount: item.visitedCount || 1
  }
}

function normalizeRemoteList(items) {
  return Array.isArray(items) ? items.map(normalizeRemote) : []
}

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
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const payload = await response.json()
  if (payload?.success === false) throw new Error(payload.message || '历史同步失败')
  return payload?.data ?? payload
}

export async function getHistory() {
  if (hasRemoteSession()) {
    try {
      const remote = normalizeRemoteList(await request('/history'))
      writeLocal(remote)
      return remote
    } catch {}
  }
  return readLocal()
}

export async function addHistory(place) {
  const entry = {
    id: place.id,
    slug: place.slug || place.id,
    name: place.name || place.id,
    type: place.type || 'place',
    continent: place.continent,
    lat: place.lat,
    lng: place.lng,
    coverImage: place.coverImage || place.image || '',
    viewedAt: new Date().toISOString()
  }
  const next = [entry, ...readLocal().filter((item) => item.id !== place.id)].slice(0, 12)
  writeLocal(next)

  if (hasRemoteSession()) {
    try {
      const remote = normalizeRemoteList(
        await request('/history', {
          method: 'POST',
          body: {
            itemId: entry.id,
            itemType: entry.type,
            title: entry.name,
            slug: entry.slug,
            coverImage: entry.coverImage
          }
        })
      )
      if (remote.length) {
        writeLocal(remote)
        return remote
      }
    } catch {}
  }

  return next
}

export async function clearHistory() {
  writeLocal([])
  if (hasRemoteSession()) {
    try {
      await request('/history', { method: 'DELETE' })
    } catch {}
  }
  return []
}
