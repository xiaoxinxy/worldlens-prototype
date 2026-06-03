import { normalizeLng } from './geo.js'

const CHINA_RELATED_IDS = ['CHN', 'TWN', 'HKG', 'MAC']

export async function loadGeoLayers() {
  const [countries, continents, oceans] = await Promise.all([
    fetch('/geo/countries.geojson').then((res) => res.json()),
    fetch('/geo/continents.geojson').then((res) => res.json()),
    fetch('/geo/oceans.geojson').then((res) => res.json())
  ])
  return { countries, continents, oceans }
}

export function getFeatureId(feature) {
  return feature?.id || feature?.properties?.adm0_a3 || feature?.properties?.iso_a3 || feature?.properties?.name
}

export function featureName(feature) {
  return feature?.properties?.name || feature?.properties?.NAME_ZH || feature?.properties?.NAME || getFeatureId(feature)
}

export function featureType(feature, layer) {
  if (layer === 'countries') return '国家'
  return feature?.properties?.type || (layer === 'oceans' ? '大洋' : '大洲')
}

export function getHighlightIds(geoFeatureId) {
  if (CHINA_RELATED_IDS.includes(geoFeatureId)) return CHINA_RELATED_IDS
  return geoFeatureId ? [geoFeatureId] : []
}

function pointInRing(point, ring) {
  const [lng, lat] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-9) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function pointInPolygon(point, polygon) {
  if (!polygon?.length || !pointInRing(point, polygon[0])) return false
  return !polygon.slice(1).some((hole) => pointInRing(point, hole))
}

export function pointInGeometry(lat, lng, geometry) {
  if (!geometry) return false
  const point = [normalizeLng(lng), lat]
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates)
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon))
  }
  return false
}

function normalizeCountryHit(feature) {
  const rawId = getFeatureId(feature)
  if (CHINA_RELATED_IDS.includes(rawId)) {
    return {
      id: 'CHN',
      name: '中国',
      rawId,
      highlightFeatureIds: CHINA_RELATED_IDS,
      continent: '亚洲'
    }
  }
  return {
    id: rawId,
    name: featureName(feature),
    rawId,
    highlightFeatureIds: getHighlightIds(rawId),
    continent: feature.properties?.continent || ''
  }
}

function resultFor(feature, layer) {
  if (!feature) return null
  if (layer === 'countries') {
    const country = normalizeCountryHit(feature)
    return {
      feature,
      layer,
      id: country.id,
      rawId: country.rawId,
      name: country.name,
      type: '国家',
      continent: country.continent,
      highlightFeatureIds: country.highlightFeatureIds
    }
  }

  const id = getFeatureId(feature)
  return {
    feature,
    layer,
    id,
    rawId: id,
    name: featureName(feature),
    type: featureType(feature, layer),
    continent: feature.properties?.continent || '',
    highlightFeatureIds: getHighlightIds(id)
  }
}

export function findFeatureAt(lat, lng, layers) {
  if (!layers) return null

  const country = layers.countries?.features?.find((feature) =>
    pointInGeometry(lat, lng, feature.geometry)
  )
  if (country) return resultFor(country, 'countries')

  const ocean = layers.oceans?.features?.find((feature) =>
    pointInGeometry(lat, lng, feature.geometry)
  )
  if (ocean) return resultFor(ocean, 'oceans')

  const continent = layers.continents?.features?.find((feature) =>
    pointInGeometry(lat, lng, feature.geometry)
  )
  if (continent) return resultFor(continent, 'continents')

  return null
}

export function continentForLatLng(lat, lng, layers) {
  const continent = layers?.continents?.features?.find((feature) =>
    pointInGeometry(lat, lng, feature.geometry)
  )
  return continent ? resultFor(continent, 'continents') : null
}

export function featureRings(feature) {
  if (!feature?.geometry) return []
  if (feature.geometry.type === 'Polygon') return feature.geometry.coordinates
  if (feature.geometry.type === 'MultiPolygon') return feature.geometry.coordinates.flat()
  return []
}
