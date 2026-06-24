import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const earthScene = await readFile('src/components/EarthScene.vue', 'utf8')
const atlasView = await readFile('src/views/AtlasGallery.vue', 'utf8')
const baseCss = await readFile('src/assets/styles/base.css', 'utf8')

describe('orbit visual polish and graticule controls', () => {
  it('adds a dedicated graticule switch with major latitude labels', () => {
    assert.match(earthScene, /const layersVisible = reactive\([\s\S]*graticule:\s*false/)
    assert.match(earthScene, /toggleLayer\('graticule'\)/)
    assert.match(earthScene, /createGraticuleGroup/)
    assert.match(earthScene, /北回归线/)
    assert.match(earthScene, /赤道/)
    assert.match(earthScene, /南回归线/)
    assert.match(earthScene, /北极圈/)
    assert.match(earthScene, /南极圈/)
  })

  it('turns the atlas index into a clearer visual navigation console', () => {
    assert.match(atlasView, /atlas-command-shell/)
    assert.match(atlasView, /atlas-orbit-map/)
    assert.match(atlasView, /atlas-entry-meta/)
    assert.match(atlasView, /quickLinks/)
    assert.match(atlasView, /seasonal/)
    assert.match(atlasView, /cosmos/)
  })

  it('uses bright orbit background and polished side chrome styles', () => {
    assert.match(baseCss, /--orbit-daybreak/)
    assert.match(baseCss, /orbit-daybreak-bg\.png/)
    assert.doesNotMatch(baseCss, /space-horizon\.jpg/)
    assert.match(baseCss, /\.space-backdrop::before/)
    assert.match(baseCss, /\.earth-control-deck/)
    assert.match(baseCss, /\.graticule-switch/)
    assert.match(baseCss, /\.atlas-orbit-map/)
    assert.match(baseCss, /\.atlas-command-shell/)
  })
})
