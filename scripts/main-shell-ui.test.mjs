import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const appHeader = await readFile('src/components/AppHeader.vue', 'utf8')
const earthView = await readFile('src/views/EarthView.vue', 'utf8')
const earthScene = await readFile('src/components/EarthScene.vue', 'utf8')
const favoriteView = await readFile('src/views/FavoriteView.vue', 'utf8')
const baseStyles = await readFile('src/assets/styles/base.css', 'utf8')

describe('main shell and globe interaction polish', () => {
  it('uses a redesigned top navigation shell with clear grouped controls', () => {
    assert.match(appHeader, /class="header-shell"/)
    assert.match(appHeader, /class="brand"/)
    assert.match(appHeader, /class="explore-menu mode-command"/)
    assert.match(appHeader, /class="icon-action"/)
    assert.match(baseStyles, /\.header-shell/)
    assert.match(baseStyles, /\.mode-command/)
    assert.match(baseStyles, /\.header-search-link/)
  })

  it('lets the right earth information panel collapse without removing the current mode', () => {
    assert.match(earthView, /sidePanelCollapsed/)
    assert.match(earthView, /toggleSidePanel/)
    assert.match(earthView, /side-panel-toggle/)
    assert.match(earthView, /side-panel-content/)
    assert.match(baseStyles, /\.earth-side-panel\.collapsed/)
    assert.match(baseStyles, /\.side-panel-toggle/)
    assert.match(baseStyles, /\.side-panel-content/)
  })

  it('resets the globe camera when returning to the plain home earth view', () => {
    assert.match(earthView, /resetViewToken/)
    assert.match(earthView, /resetMainEarthView/)
    assert.match(earthView, /:reset-view-token="resetViewToken"/)
    assert.match(earthScene, /resetViewToken/)
    assert.match(earthScene, /resetCameraHome/)
    assert.match(earthScene, /CAMERA_HOME\.clone\(\)/)
  })

  it('supports AI route playback controls and a horizontal AI mark on the vertical toggle', () => {
    assert.match(earthView, /handleAiRouteStart/)
    assert.match(earthView, /ai-route-flight-card/)
    assert.match(earthView, /saveAiRoute/)
    assert.match(earthView, /class="ai-orbit-ai-mark"/)
    assert.match(baseStyles, /\.ai-orbit-ai-mark/)
  })

  it('renders saved AI routes separately from saved places', () => {
    assert.match(favoriteView, /favoriteRouteItems/)
    assert.match(favoriteView, /ai_route/)
    assert.match(favoriteView, /收藏航线/)
  })
})
