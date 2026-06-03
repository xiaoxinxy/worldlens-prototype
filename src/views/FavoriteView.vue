<template>
  <main class="content-view page-view">
    <section class="content-hero glass-card">
      <p class="eyebrow">My Atlas</p>
      <h1>收藏那些想再次抵达的地方。</h1>
      <p>把一次短暂的凝视，保存成自己的文化地图。</p>
      <button v-if="favoritePlaces.length" class="ghost-btn" @click="favoriteStore.clear()">Clear saved</button>
    </section>

    <section v-if="favoritePlaces.length" class="place-list-grid">
      <PlaceListCard v-for="place in favoritePlaces" :key="place.id" :place="place" />
    </section>

    <section v-else class="empty-state glass-card">
      <h2>还没有收藏</h2>
      <p>回到地球，选择一处让你停留的坐标。</p>
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
const favoritePlaces = computed(() => places.value.filter((place) => favoriteStore.ids.includes(place.id)))

onMounted(async () => {
  places.value = await getPlaces()
})
</script>
