const API_BASE = import.meta.env.VITE_API_BASE || ''
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

export async function getHistory() {
  return readLocal()
}

export async function addHistory(place) {
  const entry = {
    id: place.id,
    slug: place.slug,
    name: place.name,
    type: place.type,
    continent: place.continent,
    lat: place.lat,
    lng: place.lng,
    viewedAt: new Date().toISOString()
  }
  const next = [entry, ...readLocal().filter((item) => item.id !== place.id)].slice(0, 12)
  writeLocal(next)
  try {
    if (API_BASE) {
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    }
  } catch {}
  return next
}

export async function clearHistory() {
  writeLocal([])
  return []
}
