<template>
  <header class="app-header" :class="{ 'earth-hud-header': isEarthSurface }">
    <div class="header-shell">
    <RouterLink class="brand" to="/" aria-label="WorldLens 首页">
      <span class="brand-orb"></span>
      <span>
        <strong>WorldLens</strong>
        <small>地球探索平台</small>
      </span>
    </RouterLink>

    <button class="mobile-menu-btn" @click="menuOpen = !menuOpen" aria-label="打开导航">
      <span></span>
      <span></span>
    </button>

    <div class="nav-cluster" :class="{ open: menuOpen }">
      <div class="explore-menu mode-command" :class="{ open: exploreOpen }">
        <button
          class="explore-menu-trigger"
          :class="{ active: modeItems.some(isNavActive) }"
          type="button"
          aria-haspopup="true"
          :aria-expanded="String(exploreOpen)"
          @click="exploreOpen = !exploreOpen"
        >
          <span>{{ currentModeLabel }}</span>
          <span class="explore-chevron" aria-hidden="true"></span>
        </button>
        <nav v-if="exploreOpen" class="explore-menu-popover" aria-label="探索模式">
          <RouterLink
            v-for="item in modeItems"
            :key="item.to"
            :to="item.to"
            active-class=""
            exact-active-class=""
            :class="{ active: isNavActive(item) }"
            @click="closeMenus"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <nav class="nav-links secondary-nav" aria-label="项目导航">
        <RouterLink
          v-for="item in secondaryItems"
          :key="item.to"
          :to="item.to"
          class="header-search-link"
          active-class=""
          exact-active-class=""
          :class="{ active: isNavActive(item) }"
          @click="closeMenus"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>

    <div class="header-actions">
      <div class="account-menu" :class="{ open: accountOpen }">
        <button
          class="account-trigger"
          type="button"
          :aria-expanded="String(accountOpen)"
          @click="handleAccountClick"
        >
          <span class="icon-action" aria-hidden="true"></span>
          <span class="account-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="" />
            <b v-if="!isEarthSurface && !avatarUrl">{{ initials }}</b>
          </span>
          <span v-if="!isEarthSurface" class="account-copy">
            <strong>{{ authStore.isAuthenticated ? nickname : '个人' }}</strong>
            <small>{{ authStore.isAuthenticated ? '个人中心' : '登录 / 注册' }}</small>
          </span>
        </button>
        <div v-if="accountOpen && authStore.isAuthenticated" class="account-popover">
          <button type="button" @click="openProfile">个人中心</button>
          <RouterLink v-if="isAdmin" to="/admin/ocean" @click="closeMenus">内容管理</RouterLink>
          <RouterLink to="/favorites" @click="closeMenus">我的收藏</RouterLink>
          <button type="button" @click="logout">退出登录</button>
        </div>
      </div>
    </div>
    </div>
  </header>

  <AccountModal />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AccountModal from './account/AccountModal.vue'
import { useAuthStore } from '../stores/auth'
import { useFavoriteStore } from '../stores/favorite'
import { useHistoryStore } from '../stores/history'

const route = useRoute()
const authStore = useAuthStore()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()
const menuOpen = ref(false)
const exploreOpen = ref(false)
const accountOpen = ref(false)

const modeItems = [
  { to: '/', label: '地球探索', earthMode: true },
  { to: '/?layer=terrain', label: '地形探索', terrainMode: true },
  { to: '/?layer=climate', label: '气候探索', climateMode: true },
  { to: '/?mode=dynamics', label: '地球动态', dynamicsMode: true },
  { to: '/?mode=ocean', label: '海洋探索', oceanMode: true },
  { to: '/?mode=seasonal', label: '季节时间轴', seasonalMode: true },
  { to: '/?mode=cosmos', label: '地球与宇宙', cosmosMode: true },
  { to: '/?mode=civilization&civilization=routes', label: '文明探索', civilizationMode: true }
]

const isAdmin = computed(() => Boolean(authStore.currentUser?.isAdmin))
const isEarthSurface = computed(() => route.path === '/')
const secondaryItems = computed(() => [
  { to: '/gallery', label: '索引' },
  { to: '/favorites', label: favoriteStore.count ? `收藏 ${favoriteStore.count}` : '收藏' }
])

const currentModeLabel = computed(() => (isEarthSurface.value ? '探索' : modeItems.find(isNavActive)?.label || '探索'))
const avatarUrl = computed(() => authStore.avatarUrl)
const nickname = computed(() => authStore.nickname)
const initials = computed(() => {
  const source = nickname.value || authStore.currentUser?.username || 'WL'
  return source.slice(0, 2).toUpperCase()
})

watch(
  () => route.fullPath,
  () => closeMenus()
)

function closeMenus() {
  menuOpen.value = false
  exploreOpen.value = false
  accountOpen.value = false
}

function handleAccountClick() {
  if (!authStore.isAuthenticated) {
    authStore.openAuth('login')
    return
  }
  accountOpen.value = !accountOpen.value
}

function openProfile() {
  accountOpen.value = false
  authStore.openAuth('profile')
}

async function logout() {
  await authStore.logout()
  await favoriteStore.hydrate()
  await historyStore.hydrate()
  closeMenus()
}

function isNavActive(item) {
  if (item.civilizationMode) return route.path === '/' && (route.query.mode === 'civilization' || route.query.mode === 'routes')
  if (item.cosmosMode) return route.path === '/' && route.query.mode === 'cosmos'
  if (item.dynamicsMode) return route.path === '/' && route.query.mode === 'dynamics'
  if (item.oceanMode) return route.path === '/' && route.query.mode === 'ocean'
  if (item.seasonalMode) return route.path === '/' && route.query.mode === 'seasonal'
  if (item.terrainMode) return route.path === '/' && route.query.layer === 'terrain'
  if (item.climateMode) return route.path === '/' && route.query.layer === 'climate'
  if (item.earthMode) return route.path === '/' && !route.query.mode && !route.query.layer
  return route.path === item.to
}
</script>
