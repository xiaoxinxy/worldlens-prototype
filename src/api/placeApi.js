import { places as localPlaces } from '../data/places'
import { enhancePlace, enhancePlaces } from '../data/placeMedia'
import { regions } from '../data/regions'
import { buildCountryCatalog } from '../data/countryCatalog'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const TIMEOUT_MS = 800
let localCatalogCache = null

async function request(path, options = {}) {
  if (!API_BASE) throw new Error('API base is not configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export function filterPlaces(places, keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) return places
  return places
    .map((place) => ({ place, score: placeSearchScore(place, text) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .map((item) => item.place)
}

function placeSearchScore(place, text) {
  const name = String(place.name || '').toLowerCase()
  const geoId = String(place.geoFeatureId || '').toLowerCase()
  const slug = String(place.slug || '').toLowerCase()
  if (name === text || geoId === text || slug === text) return 100
  if (name.startsWith(text) || slug.startsWith(text)) return 80
  if (name.includes(text) || slug.includes(text) || geoId.includes(text)) return 60
  const keywordHit = (place.keywords || []).some((keyword) => String(keyword).toLowerCase().includes(text))
  if (keywordHit) return 40
  const metaHit = [place.type, place.continent, place.intro]
    .join(' ')
    .toLowerCase()
    .includes(text)
  return metaHit ? 10 : 0
}

async function loadJson(path) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

function uniquePlaces(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

async function getLocalCatalog() {
  if (localCatalogCache) return localCatalogCache
  const [countriesGeo, countryMeta] = await Promise.all([
    loadJson('/geo/countries.geojson'),
    loadJson('/geo/country-meta.json')
  ])
  const curatedCountries = enhancePlaces(localPlaces.filter((place) => place.type === '国家'))
  const countryCatalog = buildCountryCatalog(countriesGeo, countryMeta, curatedCountries)
  const extraPlaces = enhancePlaces([
    ...localPlaces.filter((place) => place.type !== '国家' && place.id !== 'taiwan'),
    ...regions
  ])
  localCatalogCache = enhancePlaces(uniquePlaces([...countryCatalog, ...extraPlaces]))
  return localCatalogCache
}

export async function getPlaces() {
  try {
    const remote = await request('/places')
    if (!Array.isArray(remote) || remote.length < 200) return getLocalCatalog()
    return enhancePlaces(remote)
  } catch {
    return getLocalCatalog()
  }
}

export async function getPlace(idOrSlug) {
  try {
    const remote = await request(`/places/${encodeURIComponent(idOrSlug)}`)
    return enhancePlace(remote)
  } catch {
    const localCatalog = await getLocalCatalog()
    const local = localCatalog.find((place) => place.id === idOrSlug || place.slug === idOrSlug)
    return local ? enhancePlace(local) : null
  }
}

export async function searchPlaces(keyword) {
  try {
    const remote = await request(`/search?q=${encodeURIComponent(keyword || '')}`)
    if (!Array.isArray(remote) || remote.length === 0) {
      return filterPlaces(await getLocalCatalog(), keyword)
    }
    return enhancePlaces(remote)
  } catch {
    return filterPlaces(await getLocalCatalog(), keyword)
  }
}
