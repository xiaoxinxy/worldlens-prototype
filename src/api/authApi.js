const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const TOKEN_KEY = 'worldlens:auth-token'
const USER_KEY = 'worldlens:auth-user'
const TOKEN_COOKIE = 'worldlens_auth_token'

function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readJson(key) {
  try {
    return JSON.parse(storage()?.getItem(key) || 'null')
  } catch {
    return null
  }
}

function saveUser(user) {
  if (!user) {
    storage()?.removeItem(USER_KEY)
    return
  }
  storage()?.setItem(USER_KEY, JSON.stringify(user))
}

function readCookieToken() {
  if (typeof document === 'undefined') return ''
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${TOKEN_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=') || ''
}

function writeCookieToken(token) {
  if (typeof document === 'undefined') return
  const maxAge = token ? 60 * 60 * 24 * 7 : 0
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function withStatus(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

async function request(path, options = {}) {
  const token = options.token ?? getStoredToken()
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {}

  if (!response.ok || payload?.success === false) {
    throw withStatus(payload?.message || `HTTP ${response.status}`, response.status)
  }

  return payload?.data ?? payload
}

function persistAuth(auth) {
  if (!auth?.token || !auth?.user) return auth
  storage()?.setItem(TOKEN_KEY, auth.token)
  writeCookieToken(auth.token)
  saveUser(auth.user)
  return auth
}

export function getStoredToken() {
  return storage()?.getItem(TOKEN_KEY) || decodeURIComponent(readCookieToken()) || ''
}

export function currentUser() {
  return readJson(USER_KEY)
}

export function authHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function clearStoredAuth() {
  storage()?.removeItem(TOKEN_KEY)
  storage()?.removeItem(USER_KEY)
  writeCookieToken('')
}

export async function registerAccount(payload) {
  return persistAuth(await request('/auth/register', { method: 'POST', body: payload, token: '' }))
}

export async function loginAccount(payload) {
  return persistAuth(await request('/auth/login', { method: 'POST', body: payload, token: '' }))
}

export async function getProfile() {
  const user = await request('/auth/me')
  saveUser(user)
  return user
}

export async function updateProfile(payload) {
  const user = await request('/auth/profile', { method: 'PUT', body: payload })
  saveUser(user)
  return user
}

export async function getAccountDashboard() {
  return request('/account/dashboard')
}

export async function logoutAccount() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    clearStoredAuth()
  }
}
