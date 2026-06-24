import { oceanOverlays } from '../data/ocean.js'

const API_BASE = import.meta.env?.VITE_API_BASE || '/api'
const TIMEOUT_MS = 1200

async function request(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    if (payload?.success === false) throw new Error(payload.message || '海洋数据加载失败')
    return payload?.data ?? payload
  } finally {
    clearTimeout(timer)
  }
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

function normalizeCurrent(current) {
  return {
    ...current,
    impactTags: Array.isArray(current.impactTags) ? current.impactTags : [],
    influence: current.influence && Array.isArray(current.influence.center)
      ? current.influence
      : null,
    path: Array.isArray(current.path) ? current.path : []
  }
}

function validCurrents(items) {
  return Array.isArray(items)
    && items.length > 0
    && items.every((item) => item?.id && item?.name && Array.isArray(item.path))
}

export async function getOceanCurrents(filters = {}) {
  try {
    const remote = await request(`/ocean/currents${queryString(filters)}`)
    if (validCurrents(remote)) return remote.map(normalizeCurrent)
  } catch {}
  return oceanOverlays.currents
}

export async function getOceanOverlays() {
  const currents = await getOceanCurrents()
  return {
    ...oceanOverlays,
    currents
  }
}
