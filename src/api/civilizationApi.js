import { civilizationLayerTypes } from '../data/civilizationLayers.js'

const API_BASE = import.meta.env?.VITE_API_BASE || '/api'
const TIMEOUT_MS = 1000

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
    if (payload?.success === false) throw new Error(payload.message || '文明数据加载失败')
    return payload?.data ?? payload
  } finally {
    clearTimeout(timer)
  }
}

export function normalizeCivilizationMetrics(metrics) {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) return null
  const normalized = {}
  Object.entries(metrics).forEach(([code, metric]) => {
    if (!metric || typeof metric !== 'object') return
    const id = String(metric.id || code || '').toUpperCase()
    if (!id) return
    normalized[id] = {
      ...metric,
      id,
      population: numberOr(metric.population, 0),
      populationIntensity: clamp(numberOr(metric.populationIntensity, 0), 0, 1),
      populationColor: validColor(metric.populationColor, '#94a3b8'),
      languageColor: validColor(metric.languageColor, '#94a3b8'),
      toneColor: validColor(metric.toneColor, '#f8f4e8')
    }
  })
  return Object.keys(normalized).length ? normalized : null
}

function normalizeLayers(layers) {
  if (!Array.isArray(layers) || !layers.length) return civilizationLayerTypes
  const allowed = new Set(['routes', 'population', 'language', 'skin-tone'])
  const normalized = layers
    .filter((layer) => layer?.id && allowed.has(layer.id))
    .map((layer) => ({
      id: layer.id,
      label: layer.label || layer.id,
      shortLabel: layer.shortLabel || layer.label || layer.id,
      eyebrow: layer.eyebrow || '',
      title: layer.title || '',
      description: layer.description || ''
    }))
  return normalized.length ? normalized : civilizationLayerTypes
}

export async function getCivilizationLayers() {
  try {
    return normalizeLayers(await request('/civilization/layers'))
  } catch {
    return civilizationLayerTypes
  }
}

export async function getCivilizationCountryMetrics() {
  try {
    return normalizeCivilizationMetrics(await request('/civilization/countries'))
  } catch {
    return null
  }
}

function validColor(value, fallback) {
  const text = String(value || '').trim()
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback
}

function numberOr(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
