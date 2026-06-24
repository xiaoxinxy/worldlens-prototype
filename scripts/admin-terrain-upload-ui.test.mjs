import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const terrainApi = await readFile('src/api/terrainApi.js', 'utf8').catch(() => '')
const adminTerrainApi = await readFile('src/api/adminTerrainApi.js', 'utf8').catch(() => '')
const fileApi = await readFile('src/api/fileApi.js', 'utf8').catch(() => '')
const adminView = await readFile('src/views/AdminOceanCurrents.vue', 'utf8').catch(() => '')

describe('admin terrain and upload UI wiring', () => {
  it('merges remote terrain records into the local terrain library', () => {
    assert.match(terrainApi, /const API_BASE = import\.meta\.env\.VITE_API_BASE \|\| '\/api'/)
    assert.match(terrainApi, /mergeTerrainFeatures/)
    assert.match(terrainApi, /filterTerrainFeatures\(mergeTerrainFeatures/)
  })

  it('exposes admin terrain CRUD APIs', () => {
    assert.match(adminTerrainApi, /\/admin\/terrain/)
    assert.match(adminTerrainApi, /listAdminTerrainFeatures/)
    assert.match(adminTerrainApi, /createTerrainFeature/)
    assert.match(adminTerrainApi, /updateTerrainFeature/)
    assert.match(adminTerrainApi, /setTerrainFeatureStatus/)
    assert.match(adminTerrainApi, /deleteTerrainFeature/)
  })

  it('exposes authenticated upload APIs', () => {
    assert.match(fileApi, /\/admin\/files\/content-image/)
    assert.match(fileApi, /\/files\/avatar/)
    assert.match(fileApi, /FormData/)
    assert.doesNotMatch(fileApi, /Content-Type['"]:\s*['"]multipart\/form-data/)
  })

  it('turns the admin page into a multi-module console', () => {
    assert.match(adminView, /activeAdminTab/)
    assert.match(adminView, /loadTerrainFeatures/)
    assert.match(adminView, /saveTerrainFeature/)
    assert.match(adminView, /uploadContentImage/)
    assert.match(adminView, /contentImageUrl/)
  })
})
