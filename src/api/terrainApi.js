import {
  featuredTerrainFeatures,
  filterTerrainFeatures,
  getTerrainFeature,
  relatedTerrainFeatures,
  terrainFeatures,
  terrainForCountry,
  terrainTypes
} from '../data/terrain'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const TIMEOUT_MS = 900

async function request(path) {
  if (!API_BASE) throw new Error('API base is not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
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

export async function getTerrainFeatures(filters = {}) {
  try {
    const remote = await request(`/terrain${queryString(filters)}`)
    return Array.isArray(remote) ? remote : filterTerrainFeatures(terrainFeatures, filters)
  } catch {
    return filterTerrainFeatures(terrainFeatures, filters)
  }
}

export async function getTerrainFeatureById(id) {
  try {
    return await request(`/terrain/${encodeURIComponent(id)}`)
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
