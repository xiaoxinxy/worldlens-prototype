<template>
  <header class="app-header">
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
      <div class="explore-menu" :class="{ open: exploreOpen }">
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
      <RouterLink class="icon-action" to="/gallery" aria-label="搜索">搜</RouterLink>
      <RouterLink class="saved-pill" to="/favorites">
        <span>{{ favoriteStore.count }}</span>
        已收藏
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoriteStore } from '../stores/favorite'

const route = useRoute()
const favoriteStore = useFavoriteStore()
const menuOpen = ref(false)
const exploreOpen = ref(false)

const modeItems = [
  { to: '/', label: '地球探索', earthMode: true },
  { to: '/?layer=terrain', label: '地形探索', terrainMode: true },
  { to: '/?layer=climate', label: '气候探索', climateMode: true },
  { to: '/?mode=cosmos', label: '地球与宇宙', cosmosMode: true },
  { to: '/?mode=routes', label: '路线探索', routeMode: true }
]

const secondaryItems = [
  { to: '/gallery', label: '探索索引' },
  { to: '/favorites', label: '我的探索' },
  { to: '/about', label: '关于' }
]

const currentModeLabel = computed(() => modeItems.find(isNavActive)?.label || '探索模式')

watch(
  () => route.fullPath,
  () => closeMenus()
)

function closeMenus() {
  menuOpen.value = false
  exploreOpen.value = false
}

function isNavActive(item) {
  if (item.routeMode) return route.path === '/' && route.query.mode === 'routes'
  if (item.cosmosMode) return route.path === '/' && route.query.mode === 'cosmos'
  if (item.terrainMode) return route.path === '/' && route.query.layer === 'terrain'
  if (item.climateMode) return route.path === '/' && route.query.layer === 'climate'
  if (item.earthMode) return route.path === '/' && !route.query.mode && !route.query.layer
  return route.path === item.to
}
</script>
