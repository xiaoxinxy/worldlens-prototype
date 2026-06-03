<template>
  <section class="search-panel glass-card">
    <div class="panel-label">
      <span>地图搜索</span>
      <small>文化 · 地理 · 记忆</small>
    </div>
    <div class="search-box">
      <input
        v-model="keyword"
        type="search"
        placeholder="搜索国家、海洋、文化关键词"
        @keyup.enter="goSearch"
      />
      <button @click="goSearch">搜索</button>
    </div>

    <div class="quick-list">
      <button
        v-for="place in filtered.slice(0, 6)"
        :key="place.id"
        @click="$emit('select', place)"
      >
        <span>{{ place.name }}</span>
        <small>{{ place.continent }}</small>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { filterPlaces } from '../api/placeApi'

defineEmits(['select'])
const props = defineProps({
  places: { type: Array, default: () => [] }
})
const router = useRouter()
const keyword = ref('')

const filtered = computed(() => filterPlaces(props.places, keyword.value))

function goSearch() {
  router.push({ path: '/search', query: { q: keyword.value } })
}
</script>
