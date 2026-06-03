<template>
  <main class="content-view page-view climate-view">
    <section class="content-hero glass-card climate-hero">
      <p class="eyebrow">气候探索</p>
      <h1>探索地球气候系统</h1>
      <p>探索塑造地球环境的气候力量：风、雨、洋流、山脉、纬度与季节如何共同决定雨林、沙漠、农业和文明的分布。</p>
      <div class="climate-search-row">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索气候、地区、国家、形成因素或影响关键词"
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

    <section class="terrain-type-tabs climate-type-tabs">
      <button :class="{ active: !group }" @click="group = ''">全部</button>
      <button
        v-for="item in climateGroups"
        :key="item.code"
        :class="{ active: group === item.code }"
        @click="group = item.code"
      >
        {{ item.label }}
      </button>
    </section>

    <section class="result-toolbar terrain-toolbar climate-toolbar">
      <span>{{ sortedClimate.length }} 个气候系统</span>
      <div class="filter-buttons">
        <button
          v-for="factor in quickFactors"
          :key="factor.code"
          :class="{ active: activeFactor === factor.code }"
          @click="activeFactor = activeFactor === factor.code ? '' : factor.code"
        >
          {{ factor.label }}
        </button>
      </div>
    </section>

    <section class="terrain-card-grid climate-card-grid">
      <article
        v-for="zone in sortedClimate"
        :key="zone.id"
        class="terrain-card climate-card glass-card"
        v-lazy-bg="{ image: zone.cover_image, overlay: 'linear-gradient(180deg, rgba(2,4,7,.08), rgba(2,4,7,.9))', width: 900 }"
      >
        <div class="terrain-card-topline">
          <span>{{ zone.type_label }}</span>
          <small>{{ zone.continent }}</small>
        </div>
        <h2>{{ zone.name }}</h2>
        <p>{{ zone.summary }}</p>
        <div class="climate-factor-row">
          <small v-for="factor in zone.factors.slice(0, 3)" :key="factor">{{ factorLabel(factor) }}</small>
        </div>
        <div class="terrain-impact-tags">
          <span v-for="tag in zone.tags.slice(0, 4)" :key="tag">{{ tag }}</span>
        </div>
        <div class="terrain-card-actions">
          <RouterLink class="primary-btn" :to="`/climate/${zone.id}`">查看气候</RouterLink>
          <RouterLink class="ghost-btn" :to="{ path: '/', query: { layer: 'climate', climate: zone.id } }">
            地球定位
          </RouterLink>
        </div>
      </article>
    </section>

    <section v-if="!sortedClimate.length" class="empty-state glass-card">
      <h2>没有找到匹配的气候系统</h2>
      <p>换一个关键词、气候组或形成因素继续探索。</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getClimateGroups, getClimateTypes, getClimateZones } from '../api/climateApi'
import { climateFactors, filterClimateZones } from '../data/climate'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const climate = ref([])
const climateGroups = ref([])
const climateTypes = ref([])
const keyword = ref('')
const group = ref('')
const continent = ref('')
const sortBy = ref('featured')
const activeFactor = ref('')

const quickFactors = climateFactors.filter((factor) =>
  ['latitude', 'altitude', 'ocean_current', 'mountain_barrier', 'monsoon', 'pressure_system'].includes(factor.code)
)

onMounted(async () => {
  const [zones, groups, types] = await Promise.all([
    getClimateZones(),
    getClimateGroups(),
    getClimateTypes()
  ])
  climate.value = zones
  climateGroups.value = groups
  climateTypes.value = types
})

const continents = computed(() =>
  [...new Set(climate.value.map((item) => item.continent).filter(Boolean))].sort((a, b) => a.localeCompare(b))
)

const filteredClimate = computed(() =>
  filterClimateZones(climate.value, {
    keyword: keyword.value,
    group: group.value,
    continent: continent.value,
    factor: activeFactor.value
  })
)

const sortedClimate = computed(() => {
  const items = [...filteredClimate.value]
  if (sortBy.value === 'name') return items.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy.value === 'type') return items.sort((a, b) => a.type_label.localeCompare(b.type_label) || a.name.localeCompare(b.name))
  if (sortBy.value === 'continent') return items.sort((a, b) => a.continent.localeCompare(b.continent) || a.name.localeCompare(b.name))
  return items
})

function factorLabel(code) {
  return climateFactors.find((factor) => factor.code === code)?.label || code
}
</script>
