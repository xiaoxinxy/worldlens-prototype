<template>
  <main class="earth-view page-view" :class="{ 'route-mode': routeMode, 'cosmos-mode': cosmosMode }">
    <EarthScene
      :places="places"
      :active-feature="activeFeature"
      :focus-place="focusPlace"
      :focus-command="focusCommand"
      :free-focus-token="freeFocusToken"
      :route-mode="routeMode"
      :active-route="routeMode ? selectedRoute : null"
      :active-route-node-index="activeRouteNodeIndex"
      :terrain-mode="terrainMode"
      :terrain-features="terrainFeatures"
      :active-terrain-feature="activeTerrainFeature"
      :terrain-tectonics-mode="terrainTectonicsMode"
      :climate-mode="climateMode"
      :climate-zones="climateZones"
      :active-climate-zone="activeClimateZone"
      :cosmos-mode="cosmosMode"
      :cosmos-state="cosmosState"
      @globe-click="handleGlobeClick"
      @marker-select="handleMarkerSelect"
      @route-node-select="handleRouteNodeSelect"
      @terrain-select="handleTerrainSelect"
      @climate-select="handleClimateSelect"
      @cosmos-polar-select="handleCosmosPolarSelect"
    />

    <section class="hero-copy" v-if="!routeMode && !terrainMode && !climateMode && !cosmosMode">
      <p class="eyebrow">WorldLens</p>
      <h1>从地球表面进入完整的探索平台。</h1>
      <p>通过国家、自然、文化、海洋、路线与昼夜季节图层，理解这颗星球的地理与文明。</p>
    </section>

    <section class="hero-copy route-copy" v-else-if="routeMode">
      <p class="eyebrow">Earth Routes</p>
      <h1>沿着路线看见地球如何被连接。</h1>
      <p>从文明传播到海上港口，观察思想、商品、信仰与地理边界如何彼此塑形。</p>
    </section>

    <section class="hero-copy terrain-copy" v-else-if="terrainMode">
      <p class="eyebrow">地形图层</p>
      <h1>观察地球形态如何生成。</h1>
      <p>山脉、河流、沙漠、冰川和海沟不是孤立资料，它们共同解释气候、生态和文明分布。</p>
    </section>

    <section class="hero-copy climate-copy" v-else-if="climateMode">
      <p class="eyebrow">气候图层</p>
      <h1>观察气候如何塑造地球环境。</h1>
      <p>雨林、沙漠、季风、高山与极地不是孤立名称，它们是太阳、海洋、山脉和大气环流共同作用的结果。</p>
    </section>

    <section class="hero-copy cosmos-copy" v-else-if="cosmosMode">
      <p class="eyebrow">地球与宇宙</p>
      <h1>观察宇宙如何驱动这颗行星。</h1>
      <p>拖动时间、切换季节与月相，直接观察昼夜、晨昏线、极昼极夜和潮汐方向如何在地球上发生。</p>
    </section>

    <aside class="earth-side-panel" :class="{ 'route-panel-wrap': routeMode, 'cosmos-panel-wrap': cosmosMode }">
      <RoutePanel
        v-if="routeMode"
        :routes="culturalRoutes"
        :selected-route="selectedRoute"
        :active-node-index="activeRouteNodeIndex"
        :is-playing="routePlaying"
        @select-route="selectRoute"
        @start="startRouteJourney"
        @pause="pauseRouteJourney"
        @resume="resumeRouteJourney"
        @previous="previousRouteNode"
        @next="nextRouteNode"
        @select-node="selectRouteNode"
      />

      <CosmosPanel
        v-else-if="cosmosMode"
        :state="cosmosState"
        @update="updateCosmosState"
      />

      <section v-else-if="terrainMode" class="terrain-earth-panel glass-card">
        <div class="panel-label">
          <span>地形探索</span>
          <RouterLink to="/terrain">打开模块</RouterLink>
        </div>
        <form class="terrain-earth-search" @submit.prevent="searchTerrainOnEarth">
          <input
            v-model="terrainKeyword"
            type="search"
            placeholder="搜索喜马拉雅、撒哈拉、富士山、马里亚纳..."
            aria-label="搜索地形"
          >
          <button type="submit">定位</button>
        </form>
        <article v-if="activeTerrainFeature" class="terrain-earth-card">
          <span>{{ activeTerrainFeature.type_label }} · {{ activeTerrainFeature.continent }}</span>
          <h2>{{ activeTerrainFeature.name }}</h2>
          <p>{{ activeTerrainFeature.summary }}</p>
          <dl class="terrain-earth-facts">
            <div v-if="activeTerrainFeature.highest_point">
              <dt>最高点 / 深度</dt>
              <dd>{{ activeTerrainFeature.highest_point }}</dd>
            </div>
            <div v-if="activeTerrainFeature.length">
              <dt>长度</dt>
              <dd>{{ activeTerrainFeature.length }}</dd>
            </div>
            <div v-if="activeTerrainFeature.area">
              <dt>面积</dt>
              <dd>{{ activeTerrainFeature.area }}</dd>
            </div>
            <div>
              <dt>覆盖</dt>
              <dd>{{ activeTerrainFeature.country_codes.join(' / ') || '海洋区域' }}</dd>
            </div>
          </dl>
          <div class="terrain-process-block">
            <strong>形成过程</strong>
            <p>{{ activeTerrainFeature.formation_reason }}</p>
          </div>
          <div class="terrain-impact-tags">
            <small v-for="tag in activeTerrainFeature.tags.slice(0, 4)" :key="tag">{{ tag }}</small>
          </div>
          <div class="preview-actions">
            <RouterLink class="primary-btn" :to="`/terrain/${activeTerrainFeature.id}`">查看详情</RouterLink>
            <button
              v-if="activeTerrainFeature.tectonics"
              class="ghost-btn"
              @click="toggleTerrainTectonics(activeTerrainFeature)"
            >
              {{ terrainTectonicsMode ? '关闭板块构造' : '查看形成原因' }}
            </button>
            <button class="ghost-btn" @click="focusTerrain(activeTerrainFeature)">重新定位</button>
          </div>
        </article>
        <div v-else class="terrain-earth-card empty">
          <h2>选择一条地球骨架</h2>
          <p>点击山脉轮廓、沙漠色带、冰盖区域或海沟线，观察地貌如何塑造气候、生态和文明。</p>
        </div>
        <div class="terrain-earth-list">
          <button
            v-for="feature in terrainEarthResults"
            :key="feature.id"
            :class="{ active: feature.id === activeTerrainFeature?.id }"
            @click="selectTerrainFeature(feature)"
          >
            <span>{{ feature.type_label }}</span>
            <strong>{{ feature.name }}</strong>
            <small>{{ feature.region }}</small>
          </button>
        </div>
      </section>

      <section v-else-if="climateMode" class="climate-earth-panel glass-card">
        <div class="panel-label">
          <span>气候图层</span>
          <RouterLink to="/climate">打开模块</RouterLink>
        </div>
        <article v-if="activeClimateZone" class="climate-earth-card">
          <span>{{ activeClimateZone.type_label }} · {{ activeClimateZone.continent }}</span>
          <h2>{{ activeClimateZone.name }}</h2>
          <p>{{ activeClimateZone.summary }}</p>
          <div class="terrain-impact-tags">
            <small v-for="tag in activeClimateZone.tags.slice(0, 4)" :key="tag">{{ tag }}</small>
          </div>
          <div class="preview-actions">
            <RouterLink class="primary-btn" :to="`/climate/${activeClimateZone.id}`">查看详情</RouterLink>
            <button class="ghost-btn" @click="focusClimate(activeClimateZone)">重新定位</button>
          </div>
        </article>
        <div v-else class="climate-earth-card empty">
          <h2>选择一个气候区域</h2>
          <p>点击地球上的气候色块，或从下方列表选择一个气候系统，观察它如何被海洋、地形和大气环流塑造。</p>
        </div>
        <div class="climate-earth-list">
          <button
            v-for="zone in climateZones.slice(0, 8)"
            :key="zone.id"
            :class="{ active: zone.id === activeClimateZone?.id }"
            @click="selectClimateZone(zone)"
          >
            <span>{{ zone.type_label }}</span>
            <strong>{{ zone.name }}</strong>
          </button>
        </div>
      </section>

      <template v-else>
        <SearchPanel :places="places" @select="selectPlace" />
        <Transition name="slide-up" mode="out-in">
          <PlacePreviewCard
            v-if="selectedPlace"
            :key="selectedPlace.id + String(selectedPlace.coordinates?.lat)"
            :place="selectedPlace"
            :is-favorite="favoriteStore.has(selectedPlace.id)"
            @detail="goDetail"
            @favorite="toggleFavorite"
            @focus="focusSelectedPlace"
          />
          <div v-else class="empty-card glass-card">
            <span class="scan-line"></span>
            <p class="empty-kicker">地球探索</p>
            <h2>选择一处坐标，打开它的地球图层。</h2>
            <p>每一片陆地与海洋，都可以从国家、自然、文化和路线继续深入。</p>
          </div>
        </Transition>

        <section v-if="historyStore.items.length" class="recent-panel glass-card">
          <div class="panel-label">
            <span>最近探索</span>
            <button @click="historyStore.clear()">清空</button>
          </div>
          <button
            v-for="item in historyStore.items.slice(0, 4)"
            :key="item.id"
            class="recent-item"
            @click="selectPlace(item)"
          >
            <span>{{ item.name }}</span>
            <small>{{ item.continent }}</small>
          </button>
        </section>
      </template>
    </aside>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getClimateZoneById, getClimateZones } from '../api/climateApi'
import { getPlaces } from '../api/placeApi'
import { getTerrainFeatureById, getTerrainFeatures } from '../api/terrainApi'
import { culturalRoutes } from '../data/culturalRoutes'
import { filterTerrainFeatures } from '../data/terrain'
import { normalizeLng } from '../utils/geo'
import { getHighlightIds } from '../utils/geoLookup'
import { useFavoriteStore } from '../stores/favorite'
import { useHistoryStore } from '../stores/history'

const EarthScene = defineAsyncComponent(() => import('../components/EarthScene.vue'))
const CosmosPanel = defineAsyncComponent(() => import('../components/cosmos/CosmosPanel.vue'))
const PlacePreviewCard = defineAsyncComponent(() => import('../components/PlacePreviewCard.vue'))
const RoutePanel = defineAsyncComponent(() => import('../components/routes/RoutePanel.vue'))
const SearchPanel = defineAsyncComponent(() => import('../components/SearchPanel.vue'))

const router = useRouter()
const route = useRoute()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()
const places = shallowRef([])
const selectedPlace = ref(null)
const activeFeature = ref(null)
const focusPlace = ref(null)
const focusCommand = ref(null)
const freeFocusToken = ref(0)
const selectedRouteId = ref(culturalRoutes[0]?.routeId || '')
const activeRouteNodeIndex = ref(-1)
const routePlaying = ref(false)
const terrainFeatures = shallowRef([])
const activeTerrainFeature = ref(null)
const terrainKeyword = ref('')
const terrainTectonicsMode = ref(false)
const climateZones = shallowRef([])
const activeClimateZone = ref(null)
const cosmosState = reactive({
  time: 12,
  season: 'june-solstice',
  moonPhase: 'full',
  polarFocus: 'north'
})
let routeTimer = null

const routeMode = computed(() => route.query.mode === 'routes')
const cosmosMode = computed(() => route.query.mode === 'cosmos')
const terrainMode = computed(() => route.query.layer === 'terrain')
const climateMode = computed(() => route.query.layer === 'climate')
const selectedRoute = computed(() => culturalRoutes.find((item) => item.routeId === selectedRouteId.value) || culturalRoutes[0])
const terrainEarthResults = computed(() =>
  filterTerrainFeatures(terrainFeatures.value, { keyword: terrainKeyword.value }).slice(0, 10)
)

onMounted(async () => {
  const [loadedPlaces, loadedTerrain, loadedClimate] = await Promise.all([getPlaces(), getTerrainFeatures(), getClimateZones()])
  places.value = loadedPlaces
  terrainFeatures.value = loadedTerrain
  climateZones.value = loadedClimate
  const focusSlug = String(route.query.focus || '')
  if (focusSlug && !routeMode.value) {
    const place = places.value.find((item) => item.slug === focusSlug)
    if (place) selectPlace(place)
  }
  await syncTerrainFromRoute()
  await syncClimateFromRoute()
})

onBeforeUnmount(() => {
  clearRouteTimer()
})

watch(routeMode, (enabled) => {
  if (!enabled) {
    clearRouteTimer()
    routePlaying.value = false
    activeRouteNodeIndex.value = -1
  }
})

watch(
  () => route.query.terrain,
  syncTerrainFromRoute
)

watch(terrainMode, async (enabled) => {
  if (enabled) await syncTerrainFromRoute()
  else {
    activeTerrainFeature.value = null
    terrainTectonicsMode.value = false
  }
})

watch(
  () => route.query.tectonics,
  (value) => {
    terrainTectonicsMode.value = terrainMode.value && value === '1'
  },
  { immediate: true }
)

watch(
  () => route.query.climate,
  syncClimateFromRoute
)

watch(climateMode, async (enabled) => {
  if (enabled) await syncClimateFromRoute()
  else activeClimateZone.value = null
})

watch(selectedRouteId, () => {
  clearRouteTimer()
  routePlaying.value = false
  activeRouteNodeIndex.value = -1
})

function buildSelectedFeature(geoResult, lat, lng, placesList) {
  const coordinates = {
    lat: Number(lat.toFixed(4)),
    lng: Number(normalizeLng(lng).toFixed(4))
  }

  const geoId = geoResult.id
  const geoName = geoResult.name
  const geoLayer = geoResult.layer
  const geoType = geoResult.type

  let matchedPlace = placesList.find(
    (p) => p.geoFeatureId === geoId || p.geoFeatureId === geoName || p.id === geoId
  )

  const highlightFeatureIds = geoResult.highlightFeatureIds || getHighlightIds(geoId)
  const displayType = geoLayer === 'countries' ? '国家' : geoType
  const continent = matchedPlace?.continent
    || geoResult.continent
    || geoResult.feature?.properties?.continent
    || ''

  const result = {
    id: matchedPlace?.id || `geo-${geoId}`,
    geoFeatureId: geoId,
    name: matchedPlace?.name || geoName || geoId,
    type: geoId === 'TWN' ? 'region' : displayType,
    continent,
    lat: coordinates.lat,
    lng: coordinates.lng,
    coordinates,
    highlightFeatureIds,
    place: matchedPlace || null,
    matchLayer: geoLayer,
    matchMethod: 'point-in-polygon'
  }

  if (['TWN', 'HKG', 'MAC'].includes(geoResult.rawId)) {
    result.parentCountry = '中国'
    result.parentFeatureId = 'CHN'
  }

  if (matchedPlace) {
    result.slug = matchedPlace.slug || ''
    result.intro = matchedPlace.intro || ''
    result.keywords = matchedPlace.keywords || []
    result.coverImage = matchedPlace.coverImage || ''
    result.coverGradient = matchedPlace.coverGradient || ''
    result.gallery = matchedPlace.gallery || []
    result.stats = matchedPlace.stats || []
    result.sections = matchedPlace.sections || {}
    result.timeline = matchedPlace.timeline || []
    result.facts = matchedPlace.facts || []
  } else {
    result.slug = ''
    result.intro = `${geoName} 位于 ${continent || '地球'}，这里的地理位置、海岸线和人群流动共同构成了独特的地方记忆。`
    result.keywords = [geoType, continent, '地理纹理', '文化记忆'].filter(Boolean)
    result.coverImage = ''
    result.coverGradient = 'linear-gradient(135deg,#020617,#0f766e,#e7c46b)'
    result.gallery = []
    result.stats = [{ label: '类型', value: geoType }]
    result.sections = {}
    result.timeline = []
    result.facts = []
  }

  return result
}

function handleGlobeClick({ lat, lng, geoFeature }) {
  if (!geoFeature) return
  if (climateMode.value && geoFeature.layer === 'countries') {
    const countryCode = String(geoFeature.rawId || geoFeature.id || '').toUpperCase()
    const countryClimate = climateZones.value.find((zone) => zone.related_countries.includes(countryCode))
    if (countryClimate) {
      selectClimateZone(countryClimate)
      return
    }
  }
  const feature = buildSelectedFeature(geoFeature, lat, lng, places.value)
  activeFeature.value = feature
  selectedPlace.value = feature
  historyStore.add(feature)
}

function handleMarkerSelect(place) {
  const coordinates = {
    lat: Number(place.lat.toFixed(4)),
    lng: Number(place.lng.toFixed(4))
  }
  const geoId = place.geoFeatureId || place.id
  const highlightIds = getHighlightIds(geoId)

  const feature = {
    ...place,
    geoFeatureId: geoId,
    coordinates,
    lat: coordinates.lat,
    lng: coordinates.lng,
    highlightFeatureIds: highlightIds,
    matchLayer: 'marker',
    matchMethod: 'marker-click',
    place
  }

  if (geoId === 'TWN') {
    feature.parentCountry = '中国'
    feature.parentFeatureId = 'CHN'
  }

  activeFeature.value = feature
  selectedPlace.value = feature
  historyStore.add(feature)
}

function selectPlace(place) {
  const coordinates = {
    lat: Number(place.lat.toFixed(4)),
    lng: Number(place.lng.toFixed(4))
  }
  const geoId = place.geoFeatureId || place.id
  const highlightIds = getHighlightIds(geoId)

  const feature = {
    ...place,
    geoFeatureId: geoId,
    coordinates,
    lat: coordinates.lat,
    lng: coordinates.lng,
    highlightFeatureIds: highlightIds,
    matchLayer: 'search',
    matchMethod: 'search-select',
    place
  }

  if (geoId === 'TWN') {
    feature.parentCountry = '中国'
    feature.parentFeatureId = 'CHN'
  }

  activeFeature.value = feature
  selectedPlace.value = feature
  focusPlace.value = place
  historyStore.add(feature)
}

function goDetail(place) {
  if (place.slug) router.push(`/place/${place.slug}`)
  else router.push({ path: '/search', query: { q: place.name } })
}

function toggleFavorite(place) {
  favoriteStore.toggle(place.id)
}

function focusSelectedPlace(place) {
  focusCommand.value = { place, at: Date.now() }
}

async function syncTerrainFromRoute() {
  if (!terrainMode.value) return
  const terrainId = String(route.query.terrain || '')
  if (!terrainId) {
    if (!activeTerrainFeature.value && terrainFeatures.value[0]) {
      selectTerrainFeature(terrainFeatures.value[0], false)
    }
    return
  }
  const feature = terrainFeatures.value.find((item) => item.id === terrainId) || await getTerrainFeatureById(terrainId)
  if (feature) selectTerrainFeature(feature)
}

function selectTerrainFeature(feature, shouldFocus = true) {
  activeTerrainFeature.value = feature
  if (shouldFocus) focusTerrain(feature)
  if (terrainMode.value && route.query.terrain !== feature.id) {
    terrainTectonicsMode.value = false
    const { climate, tectonics, ...query } = route.query
    router.replace({
      path: '/',
      query: { ...query, layer: 'terrain', terrain: feature.id }
    })
  }
}

function focusTerrain(feature) {
  focusCommand.value = {
    place: {
      id: feature.id,
      name: feature.name,
      lat: feature.latitude,
      lng: feature.longitude
    },
    at: Date.now()
  }
}

function searchTerrainOnEarth() {
  const target = terrainEarthResults.value[0]
  if (target) selectTerrainFeature(target)
}

function toggleTerrainTectonics(feature) {
  if (!feature?.tectonics) return
  terrainTectonicsMode.value = !terrainTectonicsMode.value
  focusTerrain(feature)
  const nextQuery = { ...route.query, layer: 'terrain', terrain: feature.id }
  if (terrainTectonicsMode.value) nextQuery.tectonics = '1'
  else delete nextQuery.tectonics
  router.replace({ path: '/', query: nextQuery })
}

function handleTerrainSelect(feature) {
  router.push(`/terrain/${feature.id}`)
}

async function syncClimateFromRoute() {
  if (!climateMode.value) return
  const climateId = String(route.query.climate || '')
  if (!climateId) {
    if (!activeClimateZone.value && climateZones.value[0]) {
      selectClimateZone(climateZones.value[0], false)
    }
    return
  }
  const zone = climateZones.value.find((item) => item.id === climateId) || await getClimateZoneById(climateId)
  if (zone) selectClimateZone(zone)
}

function selectClimateZone(zone, shouldFocus = true) {
  activeClimateZone.value = zone
  if (shouldFocus) focusClimate(zone)
  if (climateMode.value && route.query.climate !== zone.id) {
    const { terrain, ...query } = route.query
    router.replace({
      path: '/',
      query: { ...query, layer: 'climate', climate: zone.id }
    })
  }
}

function focusClimate(zone) {
  focusCommand.value = {
    place: {
      id: zone.id,
      name: zone.name,
      lat: zone.latitude,
      lng: zone.longitude
    },
    at: Date.now()
  }
}

function handleClimateSelect(zone) {
  router.push(`/climate/${zone.id}`)
}

function updateCosmosState(patch) {
  Object.assign(cosmosState, patch)
}

function handleCosmosPolarSelect(regionId) {
  cosmosState.polarFocus = regionId
}

function selectRoute(routeId) {
  selectedRouteId.value = routeId
}

function selectRouteNode(index, shouldFocus = true) {
  if (!selectedRoute.value?.nodes[index]) return
  activeRouteNodeIndex.value = index
  if (shouldFocus) focusCommand.value = { place: selectedRoute.value.nodes[index], at: Date.now() }
}

function handleRouteNodeSelect({ index }) {
  clearRouteTimer()
  routePlaying.value = false
  selectRouteNode(index, false)
}

function startRouteJourney() {
  routePlaying.value = true
  selectRouteNode(0)
  scheduleRouteStep()
}

function pauseRouteJourney() {
  routePlaying.value = false
  clearRouteTimer()
}

function resumeRouteJourney() {
  if (activeRouteNodeIndex.value < 0) {
    startRouteJourney()
    return
  }
  routePlaying.value = true
  scheduleRouteStep()
}

function previousRouteNode() {
  pauseRouteJourney()
  selectRouteNode(Math.max(0, activeRouteNodeIndex.value - 1))
}

function nextRouteNode() {
  pauseRouteJourney()
  const maxIndex = (selectedRoute.value?.nodes.length || 1) - 1
  selectRouteNode(Math.min(maxIndex, activeRouteNodeIndex.value + 1))
}

function scheduleRouteStep() {
  clearRouteTimer()
  routeTimer = setTimeout(() => {
    if (!routePlaying.value || !selectedRoute.value) return
    const nextIndex = activeRouteNodeIndex.value + 1
    if (nextIndex >= selectedRoute.value.nodes.length) {
      routePlaying.value = false
      return
    }
    selectRouteNode(nextIndex)
    scheduleRouteStep()
  }, 4200)
}

function clearRouteTimer() {
  if (!routeTimer) return
  clearTimeout(routeTimer)
  routeTimer = null
}
</script>
