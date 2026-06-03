import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { places as rawPlaces } from '../../../src/data/places.js'
import { enhancePlaces, enhancePlace } from '../../../src/data/placeMedia.js'
import { regions } from '../../../src/data/regions.js'
import { buildCountryCatalog } from '../../../src/data/countryCatalog.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')

function readJson(relativePath) {
  const text = fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, '')
  return JSON.parse(text)
}

function uniquePlaces(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

const countriesGeo = readJson('public/geo/countries.geojson')
const countryMeta = readJson('public/geo/country-meta.json')
const curatedCountries = enhancePlaces(rawPlaces.filter((place) => place.type === '国家'))
const countryPlaces = buildCountryCatalog(countriesGeo, countryMeta, curatedCountries)
const extraPlaces = enhancePlaces([
  ...rawPlaces.filter((place) => place.type !== '国家' && place.id !== 'taiwan'),
  ...regions
])
const places = enhancePlaces(uniquePlaces([...countryPlaces, ...extraPlaces]))

export function listPlaces() {
  return places
}

export function getPlace(idOrSlug) {
  return places.find((place) =>
    place.id === idOrSlug ||
    place.slug === idOrSlug ||
    place.geoFeatureId === idOrSlug ||
    place.name === idOrSlug
  ) || null
}

export function searchPlaces(keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) return places
  return places
    .map((place) => ({ place, score: placeSearchScore(place, text) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .map((item) => enhancePlace(item.place))
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
  const haystack = [
    place.type,
    place.continent,
    place.intro,
    ...(place.stats || []).flatMap((item) => [item.label, item.value])
  ].join(' ').toLowerCase()
  return haystack.includes(text) ? 10 : 0
}
