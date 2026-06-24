import assert from 'node:assert/strict'

import {
  earthquakeEvents,
  earthquakeWindows,
  earthDynamicModes,
  majorPlates,
  volcanoFeatures
} from '../src/data/earthDynamics.js'
import { oceanFeatures, oceanLayerTypes, oceanOverlays } from '../src/data/ocean.js'

assert.deepEqual(earthDynamicModes.map((mode) => mode.id), ['earthquakes', 'volcanoes', 'plates'])
assert.ok(earthquakeWindows.length >= 3)
assert.ok(earthquakeEvents.every((event) =>
  event.id && event.name && Number.isFinite(event.lat) && Number.isFinite(event.lng) && Number.isFinite(event.magnitude)
))
assert.ok(volcanoFeatures.every((feature) =>
  feature.id && feature.name && Number.isFinite(feature.lat) && Number.isFinite(feature.lng) && feature.status
))
assert.ok(majorPlates.every((plate) =>
  plate.id && plate.name && Array.isArray(plate.center) && plate.center.length === 2 && Array.isArray(plate.boundary)
))

assert.deepEqual(oceanLayerTypes.map((layer) => layer.id), ['depth', 'currents', 'trenches', 'ridges', 'basins', 'reefs'])
assert.ok(oceanFeatures.length >= 8)
assert.ok(oceanFeatures.every((feature) =>
  feature.id && feature.name && Array.isArray(feature.center) && feature.center.length === 2 && Number.isFinite(feature.radius)
))

for (const layer of ['currents', 'trenches', 'ridges', 'basins', 'reefs']) {
  assert.ok(Array.isArray(oceanOverlays[layer]), `${layer} overlay must be an array`)
  assert.ok(oceanOverlays[layer].length > 0, `${layer} overlay must have visible features`)
}

const requiredCurrents = [
  'gulf-stream',
  'north-atlantic-drift',
  'canary-current',
  'labrador-current',
  'brazil-current',
  'benguela-current',
  'kuroshio',
  'oyashio',
  'california-current',
  'humboldt',
  'east-australian-current',
  'west-australian-current',
  'agulhas-current',
  'somali-current',
  'north-equatorial-current',
  'south-equatorial-current',
  'equatorial-countercurrent',
  'antarctic-circumpolar'
]
const currents = oceanOverlays.currents
const currentIds = new Set(currents.map((current) => current.id))
for (const id of requiredCurrents) {
  assert.ok(currentIds.has(id), `${id} must be included`)
}
for (const current of currents) {
  assert.ok(['warm', 'cold', 'seasonal'].includes(current.kind), `${current.id} must classify current type`)
  assert.ok(current.basin, `${current.id} must name an ocean basin`)
  assert.ok(current.effect && current.effect.length >= 8, `${current.id} must explain its effect`)
  assert.ok(Array.isArray(current.impactTags) && current.impactTags.length >= 2, `${current.id} must include impact tags`)
  assert.ok(Array.isArray(current.path) && current.path.length >= 3, `${current.id} must have a renderable path`)
}

console.log('dynamics-ocean-data ok')
