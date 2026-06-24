import {
  featuredTerrainFeatures,
  filterTerrainFeatures,
  getTerrainFeature,
  relatedTerrainFeatures,
  terrainFeatures,
  terrainForCountry,
  terrainTypes
} from '../data/terrain'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const TIMEOUT_MS = 900

async function request(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
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

export function mergeTerrainFeatures(localFeatures = terrainFeatures, remoteFeatures = []) {
  const merged = new Map(localFeatures.map((feature) => [feature.id, { ...feature }]))
  remoteFeatures
    .map(normalizeTerrainFeature)
    .filter((feature) => feature?.id)
    .forEach((feature) => {
      merged.set(feature.id, { ...(merged.get(feature.id) || {}), ...feature })
    })
  return [...merged.values()].sort((a, b) => {
    const sortA = a.sortOrder ?? a.sort_order ?? 100
    const sortB = b.sortOrder ?? b.sort_order ?? 100
    if (sortA !== sortB) return sortA - sortB
    return String(a.name || a.id).localeCompare(String(b.name || b.id), 'zh-Hans')
  })
}

function normalizeTerrainFeature(feature) {
  if (!feature || typeof feature !== 'object') return null
  const normalized = { ...feature }
  normalized.name_en = feature.name_en ?? feature.nameEn
  normalized.type_label = feature.type_label ?? feature.typeLabel
  normalized.country_codes = feature.country_codes ?? feature.countryCodes
  normalized.formation_reason = feature.formation_reason ?? feature.formationReason
  normalized.highest_point = feature.highest_point ?? feature.highestPoint
  normalized.cover_image = feature.cover_image ?? feature.coverImage
  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined && value !== null)
  )
}

export async function getTerrainFeatures(filters = {}) {
  try {
    const remote = await request(`/terrain${queryString(filters)}`)
    return filterTerrainFeatures(mergeTerrainFeatures(terrainFeatures, Array.isArray(remote) ? remote : []), filters)
  } catch {
    return filterTerrainFeatures(terrainFeatures, filters)
  }
}

export async function getTerrainFeatureById(id) {
  try {
    const remote = await request(`/terrain/${encodeURIComponent(id)}`)
    const local = getTerrainFeature(id)
    const merged = mergeTerrainFeatures(local ? [local] : [], remote ? [remote] : [])
    return merged[0] || local
  } catch {
    return getTerrainFeature(id)
  }
}

export async function getTerrainTypes() {
  try {
    const remote = await request('/terrain/types')
    return Array.isArray(remote) ? remote : terrainTypes
  } catch {
    return terrainTypes
  }
}

export async function getFeaturedTerrain() {
  try {
    const remote = await request('/terrain/featured')
    return Array.isArray(remote) ? remote : featuredTerrainFeatures()
  } catch {
    return featuredTerrainFeatures()
  }
}

export async function getRelatedTerrain(id) {
  try {
    const remote = await request(`/terrain/${encodeURIComponent(id)}/related`)
    return Array.isArray(remote) ? remote : relatedTerrainFeatures(id)
  } catch {
    return relatedTerrainFeatures(id)
  }
}

export async function getCountryTerrain(code) {
  try {
    const remote = await request(`/countries/${encodeURIComponent(code)}/terrain`)
    return Array.isArray(remote) ? remote : terrainForCountry(code)
  } catch {
    return terrainForCountry(code)
  }
}
