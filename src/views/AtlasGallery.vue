<template>
  <main class="content-view page-view">
    <section class="content-hero glass-card gallery-hero">
      <p class="eyebrow">探索索引</p>
      <h1>{{ heroTitle }}</h1>
      <p>{{ heroText }}</p>
      <div class="wide-search archive-search">
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索国家、大洲、大洋、文化关键词"
          @keyup.enter="syncSearch"
        />
        <button class="primary-btn" @click="syncSearch">搜索</button>
      </div>
    </section>

    <section v-if="isSearching" class="country-index">
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

    <section v-else-if="!section" class="archive-category-grid">
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

    <section v-else-if="section && !activeGroup" class="archive-category-grid">
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

    <section v-else class="country-index">
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
    intro: '先按大洲进入，再浏览各国家与地区的地球探索档案。'
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
  if (isSearching.value) return '搜索文化档案'
  if (activeGroup.value) return activeGroup.value.name
  if (section.value === 'continents') return '按大洲浏览'
  if (section.value === 'oceans') return '按大洋浏览'
  return '探索索引'
})

const heroText = computed(() => {
  if (isSearching.value) return '从国家、大洲、大洋与文化关键词进入对应档案。'
  if (activeGroup.value) return activeGroup.value.intro
  if (section.value === 'continents') return '选择一个大洲，再进入国家、社会、自然与文化档案。'
  if (section.value === 'oceans') return '选择一个大洋，查看相关海域、海岸文化与海上路线。'
  return '先从国家或海洋进入，也可以直接搜索自然、文化、路线与地理关键词。'
})

function syncSearch() {
  const q = keyword.value.trim()
  router.push({ path: '/gallery', query: q ? { q } : {} })
}
</script>
