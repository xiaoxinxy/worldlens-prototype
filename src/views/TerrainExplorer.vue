<template>
  <main class="content-view page-view terrain-view">
    <section class="content-hero glass-card terrain-hero">
      <p class="eyebrow">地形探索</p>
      <h1>探索地球的地貌形状</h1>
      <p>探索塑造地球的山脉、河流、沙漠、冰川与高原，理解它们如何影响气候、文明、生态和人类活动。</p>
      <div class="terrain-hero-actions">
        <RouterLink class="primary-btn" :to="{ path: '/', query: { layer: 'terrain' } }">进入地形地球模式</RouterLink>
        <RouterLink class="ghost-btn" :to="{ path: '/', query: { layer: 'terrain', terrain: 'himalayas', tectonics: '1' } }">查看板块构造示例</RouterLink>
      </div>
      <div class="terrain-search-row">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索地形、国家、成因或影响关键词"
        />
        <select v-model="continent">
          <option value="">全部大洲</option>
          <option v-for="item in continents" :key="item" :value="item">{{ item }}</option>
        </select>
        <select v-model="sortBy">
          <option value="featured">推荐排序</option>
          <option value="name">名称</option>
          <option value="type">类型</option>
          <option value="continent">大洲</option>
        </select>
      </div>
    </section>

    <section class="terrain-type-tabs">
      <button :class="{ active: !type }" @click="type = ''">全部</button>
      <button
        v-for="item in terrainTypes"
        :key="item.code"
        :class="{ active: type === item.code }"
        @click="type = item.code"
      >
        <span>{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </section>

    <section class="result-toolbar terrain-toolbar">
      <span>{{ sortedTerrain.length }} 个地形地貌</span>
      <div class="filter-buttons">
        <button
          v-for="tag in quickTags"
          :key="tag"
          :class="{ active: activeTag === tag }"
          @click="activeTag = activeTag === tag ? '' : tag"
        >
          {{ tag }}
        </button>
      </div>
    </section>

    <section class="terrain-card-grid">
      <article
        v-for="feature in sortedTerrain"
        :key="feature.id"
        class="terrain-card glass-card"
        v-lazy-bg="{ image: feature.cover_image, overlay: 'linear-gradient(180deg, rgba(2,4,7,.1), rgba(2,4,7,.88))', width: 900 }"
      >
        <div class="terrain-card-topline">
          <span>{{ feature.type_label }}</span>
          <small>{{ feature.continent }}</small>
        </div>
        <h2>{{ feature.name }}</h2>
        <p>{{ feature.summary }}</p>
        <div class="terrain-impact-tags">
          <span v-for="tag in feature.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
        </div>
        <div class="terrain-card-actions">
          <RouterLink class="primary-btn" :to="`/terrain/${feature.id}`">查看地貌</RouterLink>
          <RouterLink class="ghost-btn" :to="{ path: '/', query: { layer: 'terrain', terrain: feature.id } }">
            地球定位
          </RouterLink>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getTerrainFeatures, getTerrainTypes } from '../api/terrainApi'
import { filterTerrainFeatures } from '../data/terrain'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const terrain = ref([])
const terrainTypes = ref([])
const keyword = ref('')
const type = ref('')
const continent = ref('')
const sortBy = ref('featured')
const activeTag = ref('')

const quickTags = ['板块碰撞', '季风', '水资源', '文明河流', '生态系统', '气候变化']

onMounted(async () => {
  const [features, types] = await Promise.all([
    getTerrainFeatures(),
    getTerrainTypes()
  ])
  terrain.value = features
  terrainTypes.value = types
})

const continents = computed(() =>
  [...new Set(terrain.value.map((item) => item.continent).filter(Boolean))].sort((a, b) => a.localeCompare(b))
)

const filteredTerrain = computed(() =>
  filterTerrainFeatures(terrain.value, {
    keyword: keyword.value,
    type: type.value,
    continent: continent.value,
    tag: activeTag.value
  })
)

const sortedTerrain = computed(() => {
  const items = [...filteredTerrain.value]
  if (sortBy.value === 'name') return items.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy.value === 'type') return items.sort((a, b) => a.type_label.localeCompare(b.type_label) || a.name.localeCompare(b.name))
  if (sortBy.value === 'continent') return items.sort((a, b) => a.continent.localeCompare(b.continent) || a.name.localeCompare(b.name))
  return items
})
</script>
