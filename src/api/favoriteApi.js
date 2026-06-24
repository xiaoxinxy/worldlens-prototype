import { authHeaders, currentUser } from './authApi'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const STORAGE_KEY = 'worldlens:favorites'
const META_STORAGE_KEY = 'worldlens:favorite-items'

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

function readLocalItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_STORAGE_KEY) || '[]')
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return readLocal().map((id) => ({ itemId: id, itemType: 'place', title: id, coverImage: '', payload: '' }))
}

function writeLocalItems(items) {
  const normalized = normalizeItems(items)
  localStorage.setItem(META_STORAGE_KEY, JSON.stringify(normalized))
  writeLocal(toIds(normalized))
}

function toIds(items) {
  return Array.isArray(items) ? items.map((item) => item.itemId || item.placeId || item.id).filter(Boolean) : []
}

function normalizeItems(items) {
  return Array.isArray(items)
    ? items
        .map((item) => ({
          itemId: String(item?.itemId || item?.placeId || item?.id || '').trim(),
          itemType: String(item?.itemType || item?.type || 'place').trim(),
          title: String(item?.title || item?.name || item?.itemId || '').trim(),
          coverImage: String(item?.coverImage || item?.image || '').trim(),
          payload: typeof item?.payload === 'string' ? item.payload : ''
        }))
        .filter((item) => item.itemId)
    : []
}

function hasRemoteSession() {
  return Boolean(currentUser() && authHeaders().Authorization)
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
  if (payload?.success === false) throw new Error(payload.message || '收藏同步失败')
  return payload?.data ?? payload
}

export async function getFavoriteIds() {
  return toIds(await getFavoriteItems())
}

export async function getFavoriteItems() {
  if (hasRemoteSession()) {
    try {
      const remote = normalizeItems(await request('/favorites'))
      writeLocalItems(remote)
      return remote
    } catch {}
  }
  return readLocalItems()
}

export async function saveFavoriteId(id, meta = {}) {
  const items = readLocalItems()
  const item = {
    itemId: id,
    itemType: meta.itemType || 'place',
    title: meta.title || meta.name || id,
    coverImage: meta.coverImage || meta.image || '',
    payload: meta.payload || ''
  }
  const nextItems = [...items.filter((entry) => entry.itemId !== id), item]
  writeLocalItems(nextItems)

  if (hasRemoteSession()) {
    try {
      const remote = normalizeItems(
        await request('/favorites', {
          method: 'POST',
          body: item
        })
      )
      if (remote.length) {
        writeLocalItems(remote)
        return toIds(remote)
      }
    } catch {}
  }

  return toIds(nextItems)
}

export async function removeFavoriteId(id) {
  const next = readLocal().filter((item) => item !== id)
  writeLocal(next)
  writeLocalItems(readLocalItems().filter((item) => item.itemId !== id))

  if (hasRemoteSession()) {
    try {
      const remote = normalizeItems(await request(`/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' }))
      writeLocalItems(remote)
      return toIds(remote)
    } catch {}
  }

  return next
}

export async function clearFavoriteIds() {
  writeLocal([])
  writeLocalItems([])
  if (hasRemoteSession()) {
    try {
      await request('/favorites', { method: 'DELETE' })
    } catch {}
  }
  return []
}
