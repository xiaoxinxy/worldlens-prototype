import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const earthView = await readFile('src/views/EarthView.vue', 'utf8')
const dynamicsPanel = await readFile('src/components/dynamics/EarthDynamicsPanel.vue', 'utf8')
const oceanPanel = await readFile('src/components/ocean/OceanPanel.vue', 'utf8')

describe('exploration entry behavior', () => {
  it('does not auto-select the first terrain or climate case when entering an exploration mode', () => {
    assert.doesNotMatch(earthView, /selectTerrainFeature\(terrainFeatures\.value\[0\]/)
    assert.doesNotMatch(earthView, /selectClimateZone\(climateZones\.value\[0\]/)
    assert.match(earthView, /activeTerrainFeature\.value = null/)
    assert.match(earthView, /activeClimateZone\.value = null/)
  })

  it('does not focus the first dynamic or ocean case when switching only the layer', () => {
    assert.doesNotMatch(earthView, /const first = dynamicItemsForLayer\(layerId\)\[0\]/)
    assert.doesNotMatch(earthView, /const first = oceanItemsForLayer\(layerId\)\[0\]/)
    assert.doesNotMatch(earthView, /selectDynamicLayer[\s\S]*focusDynamicFeature\(activeDynamicFeature\.value\)/)
    assert.doesNotMatch(earthView, /selectOceanLayer[\s\S]*focusOceanFeature\(activeOceanFeature\.value\)/)
  })

  it('keeps side panels in introduction mode until the user selects a case', () => {
    assert.doesNotMatch(dynamicsPanel, /props\.selectedFeature \|\| featureItems\.value\[0\]/)
    assert.doesNotMatch(oceanPanel, /props\.selectedFeature \|\| featureItems\.value\[0\]/)
    assert.match(dynamicsPanel, /v-else.*dynamics-empty-card/s)
    assert.match(oceanPanel, /v-else.*ocean-empty-card/s)
  })
})
