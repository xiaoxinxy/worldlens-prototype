import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const appHeader = await readFile('src/components/AppHeader.vue', 'utf8')
const earthView = await readFile('src/views/EarthView.vue', 'utf8')
const earthScene = await readFile('src/components/EarthScene.vue', 'utf8')
const baseCss = await readFile('src/assets/styles/base.css', 'utf8')

describe('dynamics and ocean exploration modes', () => {
  it('exposes dynamics and ocean modes in the main explorer menu', () => {
    assert.match(appHeader, /mode=dynamics/)
    assert.match(appHeader, /mode=ocean/)
    assert.match(appHeader, /dynamicsMode/)
    assert.match(appHeader, /oceanMode/)
  })

  it('wires dynamics and ocean panels through EarthView', () => {
    assert.match(earthView, /EarthDynamicsPanel/)
    assert.match(earthView, /OceanPanel/)
    assert.match(earthView, /earth-dynamic-mode/)
    assert.match(earthView, /ocean-mode/)
    assert.match(earthView, /handleDynamicSelect/)
    assert.match(earthView, /handleOceanSelect/)
  })

  it('builds rich scene layers instead of static decorative lines', () => {
    assert.match(earthScene, /function addDynamicLayer/)
    assert.match(earthScene, /function updateDynamicLayer/)
    assert.match(earthScene, /function animateDynamicLayer/)
    assert.match(earthScene, /function addOceanLayer/)
    assert.match(earthScene, /function updateOceanLayer/)
    assert.match(earthScene, /function animateOceanLayer/)
    assert.match(earthScene, /dynamicFeature/)
    assert.match(earthScene, /oceanFeature/)
  })

  it('gives dynamics and ocean modes an immersive visual stage', () => {
    assert.match(earthScene, /function createFeatureBeacon/)
    assert.match(earthScene, /dynamicFeatureBeacon/)
    assert.match(earthScene, /oceanFeatureBeacon/)
    assert.match(earthScene, /modeFocusDistance/)
    assert.match(baseCss, /\.dynamics-mode \.scene-vignette/)
    assert.match(baseCss, /\.ocean-mode \.scene-vignette/)
    assert.match(baseCss, /\.dynamics-mode \.layer-switcher/)
    assert.match(baseCss, /\.ocean-mode \.layer-switcher/)
  })

  it('renders ocean currents as layered atlas visuals', () => {
    assert.match(earthScene, /function createCurrentInfluenceField/)
    assert.match(earthScene, /oceanCurrentWake/)
    assert.match(earthScene, /oceanCurrentImpact/)
    assert.match(earthScene, /currentParticleCount/)
  })

  it('does not keep the rejected earth system causal chain mode', () => {
    assert.doesNotMatch(appHeader, /mode=system/)
    assert.doesNotMatch(earthView, /systemMode/)
    assert.doesNotMatch(earthView, /EarthSystemPanel/)
    assert.doesNotMatch(earthScene, /createSystemChainLayer/)
    assert.doesNotMatch(earthScene, /earthSystemNode/)
  })

  it('wires the seasonal timeline through EarthView', () => {
    assert.match(earthView, /seasonalMode/)
    assert.match(earthView, /SeasonalTimelinePanel/)
    assert.match(earthView, /mode === 'seasonal'/)
  })

  it('renders the seasonal system as strong logical atlas primitives', () => {
    assert.match(earthScene, /createSeasonalLayer/)
    assert.match(earthScene, /seasonalSunBeltGlow/)
    assert.match(earthScene, /seasonalRainBeltMass/)
    assert.match(earthScene, /seasonalPressureBelt/)
    assert.match(earthScene, /seasonalMonsoonWindBand/)
    assert.match(earthScene, /seasonalImpactPatch/)
    assert.match(earthScene, /seasonalParticleCount/)
  })
})
