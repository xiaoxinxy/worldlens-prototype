import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appHeader = readFileSync('src/components/AppHeader.vue', 'utf8')
const accountModal = readFileSync('src/components/account/AccountModal.vue', 'utf8')
const main = readFileSync('src/main.js', 'utf8')
const authApi = readFileSync('src/api/authApi.js', 'utf8')
const favoriteApi = readFileSync('src/api/favoriteApi.js', 'utf8')
const historyApi = readFileSync('src/api/historyApi.js', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

test('frontend wires an authenticated account menu into the global header', () => {
  assert.match(appHeader, /useAuthStore/)
  assert.match(appHeader, /AccountModal/)
  assert.match(appHeader, /account-menu/)
  assert.match(appHeader, /avatarUrl/)
  assert.match(appHeader, /nickname/)
})

test('frontend hydrates auth before favorites and sends token-backed favorites', () => {
  assert.match(main, /useAuthStore/)
  assert.match(main, /authStore\.hydrate/)
  assert.match(favoriteApi, /Authorization/)
  assert.match(favoriteApi, /currentUser/)
  assert.match(packageJson, /backend:dev/)
})

test('auth persistence survives reload through a same-origin token fallback', () => {
  assert.match(authApi, /worldlens_auth_token/)
  assert.match(authApi, /document\.cookie/)
  assert.match(authApi, /readCookieToken/)
  assert.match(authApi, /writeCookieToken/)
})

test('account center exposes dashboard metrics and file-based avatar selection', () => {
  assert.match(accountModal, /type="file"/)
  assert.match(accountModal, /accept="image/)
  assert.match(accountModal, /handleAvatarFile/)
  assert.match(accountModal, /explorer-dashboard-mode/)
  assert.match(accountModal, /Explorer Dashboard/)
  assert.match(accountModal, /archiveStats/)
  assert.match(accountModal, /dashboard\.value\.favoriteCount/)
  assert.match(accountModal, /recentHistory/)
  assert.doesNotMatch(accountModal, /头像 URL/)
})

test('account avatar hides text initials when an uploaded avatar image exists', () => {
  assert.match(accountModal, /v-if="!profileForm\.avatarUrl"\s*>\{\{ initials \}\}/)
  assert.match(accountModal, /v-if="!registerForm\.avatarUrl"\s*>\{\{ registerInitials \}\}/)
})

test('history sync and account dashboard use authenticated backend APIs', () => {
  assert.match(authApi, /account\/dashboard/)
  assert.match(historyApi, /Authorization/)
  assert.match(historyApi, /currentUser/)
  assert.match(historyApi, /\/history/)
  assert.match(main, /useHistoryStore\(\)\.hydrate/)
})
