import {
  featuredTerrainFeatures,
  filterTerrainFeatures,
  getTerrainFeature,
  relatedTerrainFeatures,
  terrainFeatures,
  terrainForCountry,
  terrainRelations,
  terrainTypes
} from '../../../src/data/terrain.js'

export function listTerrain(filters = {}) {
  return filterTerrainFeatures(terrainFeatures, filters)
}

export function getTerrain(id) {
  return getTerrainFeature(id)
}

export function listTerrainTypes() {
  return terrainTypes
}

export function listFeaturedTerrain() {
  return featuredTerrainFeatures(8)
}

export function listRelatedTerrain(id) {
  return relatedTerrainFeatures(id)
}

export function listTerrainForCountry(code) {
  return terrainForCountry(code)
}

export function listTerrainRelations() {
  return terrainRelations
}
