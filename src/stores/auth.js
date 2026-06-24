import { defineStore } from 'pinia'
import {
  clearStoredAuth,
  currentUser,
  getAccountDashboard,
  getProfile,
  getStoredToken,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateProfile
} from '../api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken(),
    currentUser: currentUser(),
    dashboard: null,
    loading: false,
    error: '',
    authOpen: false,
    authMode: 'login'
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.currentUser),
    nickname: (state) => state.currentUser?.nickname || state.currentUser?.username || '探索者',
    avatarUrl: (state) => state.currentUser?.avatarUrl || ''
  },
  actions: {
    openAuth(mode = this.isAuthenticated ? 'profile' : 'login') {
      this.authMode = mode
      this.authOpen = true
      this.error = ''
      if (this.isAuthenticated) this.hydrateDashboard()
    },
    closeAuth() {
      this.authOpen = false
      this.error = ''
    },
    async hydrate() {
      this.token = getStoredToken()
      this.currentUser = currentUser()
      if (!this.token) return

      this.loading = true
      try {
        this.currentUser = await getProfile()
        await this.hydrateDashboard()
      } catch (error) {
        if (error.status === 401) {
          clearStoredAuth()
          this.token = ''
          this.currentUser = null
          this.dashboard = null
        }
      } finally {
        this.loading = false
      }
    },
    async hydrateDashboard() {
      if (!this.token) {
        this.dashboard = null
        return null
      }
      try {
        this.dashboard = await getAccountDashboard()
      } catch (error) {
        if (error.status === 401) this.dashboard = null
      }
      return this.dashboard
    },
    async login(payload) {
      this.loading = true
      this.error = ''
      try {
        const auth = await loginAccount(payload)
        this.token = auth.token
        this.currentUser = auth.user
        this.authMode = 'profile'
        await this.hydrateDashboard()
        return auth
      } catch (error) {
        this.error = error.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true
      this.error = ''
      try {
        const auth = await registerAccount(payload)
        this.token = auth.token
        this.currentUser = auth.user
        this.authMode = 'profile'
        await this.hydrateDashboard()
        return auth
      } catch (error) {
        this.error = error.message || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async updateProfile(payload) {
      this.loading = true
      this.error = ''
      try {
        this.currentUser = await updateProfile(payload)
        await this.hydrateDashboard()
        return this.currentUser
      } catch (error) {
        this.error = error.message || '保存失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      this.loading = true
      try {
        await logoutAccount()
      } finally {
        this.token = ''
        this.currentUser = null
        this.dashboard = null
        this.authMode = 'login'
        this.loading = false
      }
    }
  }
})
