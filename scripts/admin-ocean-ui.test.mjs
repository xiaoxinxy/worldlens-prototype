import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const accountModal = await readFile('src/components/account/AccountModal.vue', 'utf8')
const appHeader = await readFile('src/components/AppHeader.vue', 'utf8')
const router = await readFile('src/router/index.js', 'utf8')
const adminApi = await readFile('src/api/adminOceanApi.js', 'utf8').catch(() => '')
const adminView = await readFile('src/views/AdminOceanCurrents.vue', 'utf8').catch(() => '')

describe('admin ocean management UI wiring', () => {
  it('does not expose administrator privileges through public registration', () => {
    assert.doesNotMatch(accountModal, /registerForm\.isAdmin/)
    assert.doesNotMatch(accountModal, /admin-register-toggle/)
    assert.doesNotMatch(accountModal, /isAdmin:\s*registerForm\.isAdmin/)
  })

  it('adds an admin-only route and navigation entry', () => {
    assert.match(router, /AdminOceanCurrents/)
    assert.match(router, /requiresAdmin:\s*true/)
    assert.match(router, /currentUser\(\)\?\.isAdmin/)
    assert.match(appHeader, /\/admin\/ocean/)
    assert.match(appHeader, /isAdmin/)
  })

  it('calls admin ocean backend APIs from the management page', () => {
    assert.match(adminApi, /\/admin\/ocean\/currents/)
    assert.match(adminApi, /createOceanCurrent/)
    assert.match(adminApi, /updateOceanCurrent/)
    assert.match(adminApi, /deleteOceanCurrent/)
    assert.match(adminApi, /setOceanCurrentStatus/)
    assert.match(adminView, /AdminOceanCurrents/)
    assert.match(adminView, /loadCurrents/)
    assert.match(adminView, /saveCurrent/)
    assert.match(adminView, /removeCurrent/)
  })
})
