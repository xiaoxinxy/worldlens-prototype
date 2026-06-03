import {
  earthDynamicModes,
  earthquakeWindows,
  getEarthDynamicMode,
  getEarthquakes,
  majorPlates,
  volcanoFeatures
} from '../data/earthDynamics'

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

export async function getEarthDynamicModes() {
  try {
    const remote = await request('/earth-dynamics/modes')
    return Array.isArray(remote) ? remote : earthDynamicModes
  } catch {
    return earthDynamicModes
  }
}

export async function getEarthDynamicModeById(id) {
  try {
    const remote = await request(`/earth-dynamics/modes/${encodeURIComponent(id)}`)
    return remote?.id ? remote : getEarthDynamicMode(id)
  } catch {
    return getEarthDynamicMode(id)
  }
}

export async function getEarthquakeWindows() {
  try {
    const remote = await request('/earth-dynamics/earthquakes/windows')
    return Array.isArray(remote) ? remote : earthquakeWindows
  } catch {
    return earthquakeWindows
  }
}

export async function getEarthquakeEvents(windowId) {
  try {
    const remote = await request(`/earth-dynamics/earthquakes?window=${encodeURIComponent(windowId)}`)
    return Array.isArray(remote) ? remote : getEarthquakes(windowId)
  } catch {
    return getEarthquakes(windowId)
  }
}

export async function getVolcanoFeatures() {
  try {
    const remote = await request('/earth-dynamics/volcanoes')
    return Array.isArray(remote) ? remote : volcanoFeatures
  } catch {
    return volcanoFeatures
  }
}

export async function getMajorPlates() {
  try {
    const remote = await request('/earth-dynamics/plates')
    return Array.isArray(remote) ? remote : majorPlates
  } catch {
    return majorPlates
  }
}
