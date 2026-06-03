import {
  climateForCountry,
  climateForTerrain,
  climateGroups,
  climateRelations,
  climateTypes,
  climateZones,
  featuredClimateZones,
  filterClimateZones,
  getClimateZone,
  relatedClimateZones
} from '../../../src/data/climate.js'

export function listClimate(filters = {}) {
  return filterClimateZones(climateZones, filters)
}

export function getClimate(id) {
  return getClimateZone(id)
}

export function listClimateTypes() {
  return climateTypes
}

export function listClimateGroups() {
  return climateGroups
}

export function listFeaturedClimate() {
  return featuredClimateZones(8)
}

export function listRelatedClimate(id) {
  return relatedClimateZones(id)
}

export function listClimateForCountry(code) {
  return climateForCountry(code)
}

export function listClimateForTerrain(id) {
  return climateForTerrain(id)
}

export function listClimateRelations() {
  return climateRelations
}
