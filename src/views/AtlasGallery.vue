<template>
  <main class="content-view page-view atlas-index-view">
    <section class="atlas-command-shell atlas-search-panel glass-card">
      <div class="atlas-search-copy">
        <span class="atlas-mini-label">探索索引</span>
        <h1>{{ heroTitle }}</h1>
        <p>{{ heroText }}</p>
        <div class="atlas-signal-row">
          <span>地球图层</span>
          <span>自然系统</span>
          <span>文明线索</span>
          <span>海洋与季节</span>
        </div>
      </div>
      <form class="atlas-command-search archive-search" @submit.prevent="syncSearch">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索国家、大洲、大洋、地形、气候或文化关键词"
        />
        <button class="primary-btn" type="submit">搜索</button>
      </form>

      <div v-if="!isSearching && !section" class="atlas-orbit-map" aria-label="探索模块轨道">
        <div class="atlas-orbit-core">
          <span>WorldLens</span>
          <strong>从地球进入</strong>
        </div>
        <RouterLink
          v-for="entry in quickLinks"
          :key="`orbit-${entry.id}`"
          class="atlas-orbit-node"
          :class="`node-${entry.id}`"
          :to="entry.to"
          :style="{ '--entry-accent': entry.accent }"
        >
          <span>{{ entry.short }}</span>
        </RouterLink>
      </div>
    </section>

    <section v-if="!isSearching && !section" class="atlas-entry-grid">
      <RouterLink
        v-for="entry in quickLinks"
        :key="entry.id"
        class="atlas-entry-card glass-card"
        :to="entry.to"
        :style="{ '--entry-accent': entry.accent }"
      >
        <span>{{ entry.kicker }}</span>
        <strong>{{ entry.name }}</strong>
        <p>{{ entry.intro }}</p>
        <div class="atlas-entry-meta">
          <small>{{ entry.meta }}</small>
          <b>进入</b>
        </div>
      </RouterLink>
    </section>

    <section v-if="isSearching" class="country-index atlas-results">
      <div class="result-toolbar">
        <span>{{ filteredResults.length }} 个结果</span>
        <div class="filter-buttons">
          <button :class="{ active: filterType === '全部' }" @click="filterType = '全部'">全部</button>
          <button :class="{ active: filterType === '国家' }" @click="filterType = '国家'">国家</button>
          <button :class="{ active: filterType === '大洲' }" @click="filterType = '大洲'">大洲</button>
          <button :class="{ active: filterType === '大洋' }" @click="filterType = '大洋'">大洋</button>
          <button :class="{ active: filterType === '海域' }" @click="filterType = '海域'">海域</button>
        </div>
      </div>
      <div class="country-index-grid">
        <RouterLink
          v-for="place in filteredResults"
          :key="place.id"
          :class="['country-index-card', { 'has-cover-image': place.coverImage, 'text-cover-card': !place.coverImage }]"
          :to="`/place/${place.slug}`"
          v-lazy-bg="{ image: place.coverImage, overlay: 'linear-gradient(180deg, rgba(2,4,7,.08), rgba(2,4,7,.76))', width: 720 }"
        >
          <span>{{ place.type }} · {{ place.continent }}</span>
          <strong>{{ place.name }}</strong>
          <p>{{ place.intro }}</p>
          <div class="keyword-list compact">
            <small v-for="tag in place.keywords.slice(0, 3)" :key="tag">{{ tag }}</small>
          </div>
          <b class="mini-btn">查看档案</b>
        </RouterLink>
      </div>
    </section>

    <section v-else-if="!section" class="archive-category-grid atlas-browse-grid">
      <RouterLink
        v-for="entry in rootSections"
        :key="entry.id"
        class="archive-category-card"
        :to="{ path: '/gallery', query: { section: entry.id } }"
      >
        <span>{{ entry.kicker }}</span>
        <strong>{{ entry.name }}</strong>
        <p>{{ entry.intro }}</p>
        <b class="mini-btn">进入分类</b>
      </RouterLink>
    </section>

    <section v-else-if="section && !activeGroup" class="archive-category-grid atlas-browse-grid">
      <RouterLink class="archive-back mini-btn" to="/gallery">返回分类</RouterLink>
      <article
        v-for="entry in sectionEntries"
        :key="entry.id"
        class="archive-category-card"
      >
        <span>{{ entry.type }}</span>
        <strong>{{ entry.name }}</strong>
        <p>{{ entry.intro }}</p>
        <div class="keyword-list compact">
          <small v-for="tag in entry.keywords.slice(0, 3)" :key="tag">{{ tag }}</small>
        </div>
        <div class="archive-card-actions">
          <RouterLink class="mini-btn" :to="{ path: '/gallery', query: { section, group: entry.id } }">
            查看列表
          </RouterLink>
          <RouterLink class="mini-btn" :to="`/place/${entry.slug}`">
            了解此区域
          </RouterLink>
        </div>
      </article>
    </section>

    <section v-else class="country-index atlas-results">
      <RouterLink class="archive-back mini-btn" :to="{ path: '/gallery', query: { section } }">返回上一级</RouterLink>
      <article class="continent-block">
        <h2>{{ activeGroup.name }}</h2>
        <div class="country-index-grid">
          <RouterLink
            v-for="place in activeItems"
            :key="place.id"
            :class="['country-index-card', { 'has-cover-image': place.coverImage, 'text-cover-card': !place.coverImage }]"
            :to="`/place/${place.slug}`"
            v-lazy-bg="{ image: place.coverImage, overlay: 'linear-gradient(180deg, rgba(2,4,7,.08), rgba(2,4,7,.76))', width: 720 }"
          >
            <span>{{ place.continent || place.type }}</span>
            <strong>{{ place.name }}</strong>
            <p>{{ place.intro }}</p>
            <div class="keyword-list compact">
              <small v-for="tag in place.keywords.slice(0, 3)" :key="tag">{{ tag }}</small>
            </div>
            <b class="mini-btn">查看档案</b>
          </RouterLink>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterPlaces, getPlaces } from '../api/placeApi'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const route = useRoute()
const router = useRouter()
const places = ref([])
const keyword = ref(String(route.query.q || ''))
const filterType = ref('全部')
const continentOrder = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲', '南极洲']
const oceanOrder = [
  'pacific-ocean',
  'atlantic-ocean',
  'indian-ocean',
  'arctic-ocean',
  'southern-ocean',
  'mediterranean-sea',
  'red-sea',
  'black-sea',
  'caribbean-sea',
  'south-china-sea',
  'baltic-sea',
  'arabian-sea'
]
const oceanRelations = {
  'pacific-ocean': ['south-china-sea'],
  'atlantic-ocean': ['mediterranean-sea', 'caribbean-sea', 'black-sea', 'baltic-sea'],
  'indian-ocean': ['arabian-sea', 'red-sea'],
  'arctic-ocean': [],
  'southern-ocean': []
}

const quickLinks = [
  {
    id: 'terrain',
    short: '地形',
    kicker: '自然骨架',
    name: '地形探索',
    intro: '山脉、沙漠、河流、冰川、海沟等地貌案例。',
    meta: '地貌案例 · 板块成因',
    accent: '#f4d06f',
    to: { path: '/', query: { layer: 'terrain' } }
  },
  {
    id: 'climate',
    short: '气候',
    kicker: '大气系统',
    name: '气候探索',
    intro: '热带雨林、沙漠、季风、高山、极地等气候类型。',
    meta: '纬度带 · 大气环流',
    accent: '#9ae6ff',
    to: { path: '/', query: { layer: 'climate' } }
  },
  {
    id: 'ocean',
    short: '海洋',
    kicker: '蓝色动力',
    name: '海洋探索',
    intro: '洋流、海沟、海岭、海盆和珊瑚礁图层。',
    meta: '洋流 · 海底结构',
    accent: '#62e6d5',
    to: { path: '/', query: { mode: 'ocean' } }
  },
  {
    id: 'dynamics',
    short: '动态',
    kicker: '行星引擎',
    name: '地球动态',
    intro: '板块、地震和火山如何共同塑造地表。',
    meta: '板块 · 地震 · 火山',
    accent: '#ffb36c',
    to: { path: '/', query: { mode: 'dynamics' } }
  },
  {
    id: 'seasonal',
    short: '季节',
    kicker: '年度节律',
    name: '季节系统',
    intro: '直射点、雨带、季风和区域气候随月份变化。',
    meta: '12 个月 · 季风雨带',
    accent: '#b5f78d',
    to: { path: '/', query: { mode: 'seasonal' } }
  },
  {
    id: 'cosmos',
    short: '宇宙',
    kicker: '天文驱动',
    name: '地球与宇宙',
    intro: '昼夜、晨昏线、极昼极夜和潮汐方向的可视化。',
    meta: '太阳 · 月相 · 潮汐',
    accent: '#c7b8ff',
    to: { path: '/', query: { mode: 'cosmos' } }
  },
  {
    id: 'civilization',
    short: '文明',
    kicker: '人文线索',
    name: '文明探索',
    intro: '路线、人口、语言和区域文化如何沿地理展开。',
    meta: '路线 · 人口 · 语言',
    accent: '#ff9ecb',
    to: { path: '/', query: { mode: 'civilization' } }
  }
]

onMounted(async () => {
  places.value = await getPlaces()
})

watch(
  () => route.query.q,
  (value) => {
    keyword.value = String(value || '')
  }
)

const section = computed(() => String(route.query.section || ''))
const groupId = computed(() => String(route.query.group || ''))
const isSearching = computed(() => keyword.value.trim().length > 0)

const rootSections = [
  {
    id: 'continents',
    kicker: '大陆与国家',
    name: '国家与地区',
    intro: '按大洲进入，再浏览各国家与地区的地球探索档案。'
  },
  {
    id: 'oceans',
    kicker: '海洋与海域',
    name: '海洋水文',
    intro: '从主要大洋进入，继续查看相关海域、港口航线与海上文化节点。'
  }
]

const countries = computed(() =>
  places.value
    .filter((place) => place.type === '国家')
    .sort((a, b) => a.name.localeCompare(b.name))
)

const continents = computed(() =>
  continentOrder
    .map((name) => places.value.find((place) => place.name === name && ['大洲', '极地'].includes(place.type)))
    .filter(Boolean)
)

const oceans = computed(() =>
  oceanOrder
    .map((id) => places.value.find((place) => place.id === id || place.geoFeatureId === id))
    .filter(Boolean)
)

const sectionEntries = computed(() => {
  if (section.value === 'continents') return continents.value
  if (section.value === 'oceans') return oceans.value
  return []
})

const activeGroup = computed(() =>
  sectionEntries.value.find((entry) => entry.id === groupId.value || entry.geoFeatureId === groupId.value)
)

const activeItems = computed(() => {
  if (!activeGroup.value) return []
  if (section.value === 'continents') {
    return countries.value.filter((country) => country.continent === activeGroup.value.name)
  }
  const relatedIds = [activeGroup.value.id, activeGroup.value.geoFeatureId, ...(oceanRelations[activeGroup.value.id] || [])]
  return places.value.filter((place) => relatedIds.includes(place.id) || relatedIds.includes(place.geoFeatureId))
})

const searchResults = computed(() => filterPlaces(places.value, keyword.value).slice(0, 80))

const filteredResults = computed(() => {
  if (filterType.value === '全部') return searchResults.value
  return searchResults.value.filter((place) => place.type === filterType.value)
})

const heroTitle = computed(() => {
  if (isSearching.value) return '搜索结果'
  if (activeGroup.value) return activeGroup.value.name
  if (section.value === 'continents') return '按大洲浏览'
  if (section.value === 'oceans') return '按大洋浏览'
  return '从这里进入世界线索'
})

const heroText = computed(() => {
  if (isSearching.value) return '从国家、大洲、大洋与文化关键词进入对应档案。'
  if (activeGroup.value) return activeGroup.value.intro
  if (section.value === 'continents') return '选择一个大洲，再进入国家、社会、自然与文化档案。'
  if (section.value === 'oceans') return '选择一个大洋，查看相关海域、海岸文化与海上路线。'
  return '先选择一个探索方向，也可以直接搜索自然、文化、路线与地理关键词。'
})

function syncSearch() {
  const q = keyword.value.trim()
  router.push({ path: '/gallery', query: q ? { q } : {} })
}
</script>
