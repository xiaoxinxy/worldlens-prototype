import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { oceanOverlays } from '../src/data/ocean.js'

const originalFetch = globalThis.fetch
const { getOceanCurrents, getOceanOverlays } = await import(`../src/api/oceanApi.js?test=${Date.now()}`)

describe('ocean API integration', () => {
  it('loads ocean currents from the backend content API', async () => {
    let requestedUrl = ''
    globalThis.fetch = async (url) => {
      requestedUrl = String(url)
      return new Response(JSON.stringify({
        success: true,
        data: [
          {
            id: 'brazil-current',
            name: '巴西暖流',
            name_en: 'Brazil Current',
            kind: 'warm',
            basin: 'South Atlantic',
            system: 'western boundary current',
            impactTags: ['warm', 'moist'],
            influence: { center: [-23, -38], radius: 0.18, role: 'warm-moist' },
            path: [[-5, -35], [-14, -36], [-24, -40]]
          }
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const currents = await getOceanCurrents({ kind: 'warm', q: 'Brazil' })

    assert.equal(requestedUrl, '/api/ocean/currents?kind=warm&q=Brazil')
    assert.equal(currents.length, 1)
    assert.equal(currents[0].id, 'brazil-current')
    assert.deepEqual(currents[0].influence.center, [-23, -38])
  })

  it('falls back to local currents when the backend is unavailable', async () => {
    globalThis.fetch = async () => new Response('', { status: 500 })

    const currents = await getOceanCurrents()
    const overlays = await getOceanOverlays()

    assert.equal(currents.length, oceanOverlays.currents.length)
    assert.equal(overlays.currents.length, oceanOverlays.currents.length)
    assert.ok(overlays.trenches.length > 0)
  })
})

after(() => {
  globalThis.fetch = originalFetch
})
