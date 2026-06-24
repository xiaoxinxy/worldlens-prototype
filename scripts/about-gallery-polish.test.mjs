import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const aboutView = await readFile('src/views/AboutView.vue', 'utf8')
const atlasView = await readFile('src/views/AtlasGallery.vue', 'utf8')
const baseCss = await readFile('src/assets/styles/base.css', 'utf8')

describe('visitor-facing about page and atlas index polish', () => {
  it('explains WorldLens to visitors instead of project makers', () => {
    assert.match(aboutView, /WorldLens 能帮助你/)
    assert.match(aboutView, /适合谁使用/)
    assert.match(aboutView, /你可以怎样探索/)
    assert.match(aboutView, /登录后/)
    assert.doesNotMatch(aboutView, /制作/)
    assert.doesNotMatch(aboutView, /项目原型/)
  })

  it('uses a calmer atlas index layout with compact headings and richer entry points', () => {
    assert.match(atlasView, /atlas-index-view/)
    assert.match(atlasView, /atlas-search-panel/)
    assert.match(atlasView, /atlas-entry-grid/)
    assert.match(atlasView, /quickLinks/)
    assert.match(atlasView, /terrain/)
    assert.match(atlasView, /climate/)
  })

  it('moves content pages toward a bright clear starfield background', () => {
    assert.match(baseCss, /--page-space-bright/)
    assert.match(baseCss, /\.atlas-index-view/)
    assert.match(baseCss, /\.about-view/)
    assert.match(baseCss, /content-hero h1[\s\S]*clamp\(28px/)
  })
})
