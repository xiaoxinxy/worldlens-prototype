<template>
  <main class="content-view page-view favorite-world-view">
    <section class="content-hero glass-card">
      <p class="eyebrow">My Atlas</p>
      <h1>收藏世界与 AI 探索航线。</h1>
      <p>这里保存的不只是国家，也包括 AI 为你临时生成的路线、主题和每一站。</p>
      <button v-if="favoriteStore.count" class="ghost-btn" @click="favoriteStore.clear()">Clear saved</button>
    </section>

    <section v-if="favoriteRouteItems.length" class="favorite-route-section glass-card">
      <div class="favorite-section-head">
        <span>收藏航线</span>
        <strong>{{ favoriteRouteItems.length }}</strong>
      </div>
      <div class="favorite-route-grid">
        <article v-for="item in favoriteRouteItems" :key="item.itemId" class="favorite-route-card">
          <small>{{ item.route?.theme || 'AI 动态路线' }}</small>
          <h2>{{ item.title }}</h2>
          <p>{{ item.route?.summary || '这是一条由 AI 根据你的指令生成的探索航线。' }}</p>
          <div class="favorite-route-stops">
            <span v-for="stop in item.route?.stops?.slice(0, 4) || []" :key="stop.id || stop.name">
              {{ stop.name }}
            </span>
          </div>
          <div class="favorite-route-actions">
            <RouterLink class="primary-btn" to="/?mode=ai">回到 AI 探索</RouterLink>
            <button class="ghost-btn" type="button" @click="favoriteStore.remove(item.itemId)">移除</button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="favoritePlaces.length" class="place-list-grid">
      <PlaceListCard v-for="place in favoritePlaces" :key="place.id" :place="place" />
    </section>

    <section v-if="!favoriteStore.count" class="empty-state glass-card">
      <h2>还没有收藏</h2>
      <p>回到地球，选择一处让你停留的坐标，或让 AI 生成一条可以保存的探索航线。</p>
      <RouterLink class="primary-btn" to="/">返回地球</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getPlaces } from '../api/placeApi'
import { useFavoriteStore } from '../stores/favorite'
import PlaceListCard from '../components/PlaceListCard.vue'

const favoriteStore = useFavoriteStore()
const places = ref([])
const favoriteRouteItems = computed(() => favoriteStore.items
  .filter((item) => item.itemType === 'ai_route')
  .map((item) => ({ ...item, route: parseRoutePayload(item.payload) })))
const favoritePlaceIds = computed(() => favoriteStore.ids.filter((id) => !favoriteRouteItems.value.some((item) => item.itemId === id)))
const favoritePlaces = computed(() => places.value.filter((place) => favoritePlaceIds.value.includes(place.id)))

onMounted(async () => {
  places.value = await getPlaces()
})

function parseRoutePayload(payload) {
  try {
    const parsed = JSON.parse(payload || '{}')
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}
</script>
