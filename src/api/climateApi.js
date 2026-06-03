import {
  climateForCountry,
  climateForTerrain,
  climateGroups,
  climateTypes,
  climateZones,
  featuredClimateZones,
  filterClimateZones,
  getClimateZone,
  relatedClimateZones
} from '../data/climate'

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

export async function getClimateZones(filters = {}) {
  try {
    const remote = await request(`/climate${queryString(filters)}`)
    return Array.isArray(remote) ? remote : filterClimateZones(climateZones, filters)
  } catch {
    return filterClimateZones(climateZones, filters)
  }
}

export async function getClimateZoneById(id) {
  try {
    return await request(`/climate/${encodeURIComponent(id)}`)
  } catch {
    return getClimateZone(id)
  }
}

export async function getClimateTypes() {
  try {
    const remote = await request('/climate/types')
    return Array.isArray(remote) ? remote : climateTypes
  } catch {
    return climateTypes
  }
}

export async function getClimateGroups() {
  return climateGroups
}

export async function getFeaturedClimate() {
  try {
    const remote = await request('/climate/featured')
    return Array.isArray(remote) ? remote : featuredClimateZones()
  } catch {
    return featuredClimateZones()
  }
}

export async function getRelatedClimate(id) {
  try {
    const remote = await request(`/climate/${encodeURIComponent(id)}/related`)
    return Array.isArray(remote) ? remote : relatedClimateZones(id)
  } catch {
    return relatedClimateZones(id)
  }
}

export async function getCountryClimate(code) {
  try {
    const remote = await request(`/countries/${encodeURIComponent(code)}/climate`)
    return Array.isArray(remote) ? remote : climateForCountry(code)
  } catch {
    return climateForCountry(code)
  }
}

export async function getTerrainClimate(id) {
  try {
    const remote = await request(`/terrain/${encodeURIComponent(id)}/climate`)
    return Array.isArray(remote) ? remote : climateForTerrain(id)
  } catch {
    return climateForTerrain(id)
  }
}
