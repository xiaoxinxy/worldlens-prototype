<template>
  <main
    class="earth-view page-view"
    :class="{
      'route-mode': routeMode,
      'cosmos-mode': cosmosMode,
      'civilization-mode': civilizationMode,
      'dynamics-mode': dynamicsMode,
      'ocean-mode': oceanMode,
      'seasonal-mode': seasonalMode,
      'ai-route-mode': aiRouteActive
    }"
  >
    <EarthScene
      :places="places"
      :active-feature="activeFeature"
      :focus-place="focusPlace"
      :focus-command="focusCommand"
      :free-focus-token="freeFocusToken"
      :reset-view-token="resetViewToken"
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
      :civilization-mode="civilizationMode"
      :civilization-layer="civilizationLayerId"
      :civilization-metrics="civilizationMetrics"
      :cosmos-mode="cosmosMode"
      :cosmos-state="cosmosState"
      :earth-dynamic-mode="dynamicsMode"
      :dynamic-layer="activeDynamicLayer"
      :earthquake-events="visibleEarthquakes"
      :volcano-features="volcanoFeatures"
      :plate-features="majorPlates"
      :active-dynamic-feature="activeDynamicFeature"
      :ocean-mode="oceanMode"
      :ocean-layer="activeOceanLayer"
      :ocean-features="oceanFeatures"
      :ocean-overlays="oceanOverlays"
      :active-ocean-feature="activeOceanFeature"
      :seasonal-mode="seasonalMode"
      :seasonal-state="activeSeasonalState"
      @globe-click="handleGlobeClick"
      @marker-select="handleMarkerSelect"
      @route-node-select="handleRouteNodeSelect"
      @terrain-select="handleTerrainSelect"
      @climate-select="handleClimateSelect"
      @cosmos-polar-select="handleCosmosPolarSelect"
      @dynamic-select="handleDynamicSelect"
      @ocean-select="handleOceanSelect"
    />

    <section class="hero-copy" v-if="!civilizationMode && !terrainMode && !climateMode && !cosmosMode && !dynamicsMode && !oceanMode && !seasonalMode">
      <p class="eyebrow">WorldLens</p>
      <h1>从地球表面进入完整的探索平台。</h1>
      <p>通过国家、自然、文化、海洋、路线与昼夜季节图层，理解这颗星球的地理与文明。</p>
    </section>

    <section class="hero-copy civilization-copy" v-else-if="civilizationMode">
      <p class="eyebrow">文明探索</p>
      <h1>把路线、人口、语言和肤色分布放回同一颗地球。</h1>
      <p>从迁徙通道到人口规模，从语言圈到白、黄、黑三类色带，观察文明如何在地理空间中展开。</p>
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

    <section class="hero-copy dynamics-copy" v-else-if="dynamicsMode">
      <p class="eyebrow">地球动态</p>
      <h1>把板块、地震和火山变成一套会呼吸的地球引擎。</h1>
      <p>从板块边界的厚重能量带，到震源脉冲和火山光柱，观察地球内部力量如何塑造表面。</p>
    </section>

    <section class="hero-copy ocean-copy" v-else-if="oceanMode">
      <p class="eyebrow">海洋探索</p>
      <h1>让洋流、海沟、海岭和珊瑚礁在海面下浮现。</h1>
      <p>海洋不是蓝色背景，而是热量运输、地壳扩张、生态边界和文明航路共同交织的系统。</p>
    </section>

    <section class="hero-copy seasonal-copy" v-else-if="seasonalMode">
      <p class="eyebrow">季节系统模拟</p>
      <h1>把太阳直射、雨带气压、季风洋流和区域气候放到同一颗地球上。</h1>
      <p>每个月都按“受热中心移动 → 气压雨带重排 → 季风洋流响应 → 区域后果”展开。</p>
    </section>

    <aside
      class="earth-side-panel"
      :class="{
        collapsed: sidePanelCollapsed,
        'route-panel-wrap': routeMode,
        'cosmos-panel-wrap': cosmosMode,
        'civilization-panel-wrap': civilizationMode,
        'dynamics-panel-wrap': dynamicsMode,
        'ocean-panel-wrap': oceanMode,
        'seasonal-panel-wrap': seasonalMode,
        'home-console-mode': homeConsoleMode,
        pinned: sidePanelPinned
      }"
      @mouseenter="revealHomeConsole"
      @mouseleave="softCollapseHomeConsole"
    >
      <button
        class="side-panel-toggle"
        type="button"
        :aria-expanded="String(!sidePanelCollapsed)"
        @click="toggleSidePanel"
      >
        <span>{{ sidePanelToggleLabel }}</span>
      </button>
      <div class="side-panel-content" v-show="!sidePanelCollapsed">
      <CivilizationPanel
        v-if="civilizationMode"
        :layers="civilizationLayers"
        :active-layer-id="civilizationLayerId"
        :metrics="civilizationMetrics"
        :routes="culturalRoutes"
        :selected-route="selectedRoute"
        :active-node-index="activeRouteNodeIndex"
        :is-playing="routePlaying"
        @select-layer="selectCivilizationLayer"
        @focus-country="focusCivilizationCountry"
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

      <EarthDynamicsPanel
        v-else-if="dynamicsMode"
        :modes="earthDynamicModes"
        :active-layer="activeDynamicLayer"
        :earthquake-windows="earthquakeWindows"
        :active-window="activeEarthquakeWindow"
        :earthquakes="visibleEarthquakes"
        :volcanoes="volcanoFeatures"
        :plates="majorPlates"
        :selected-feature="activeDynamicFeature"
        @select-layer="selectDynamicLayer"
        @select-window="selectEarthquakeWindow"
        @focus-feature="focusDynamicFeature"
        @open-terrain="openDynamicTerrain"
      />

      <OceanPanel
        v-else-if="oceanMode"
        :layers="oceanLayerTypes"
        :active-layer="activeOceanLayer"
        :features="oceanFeatures"
        :overlays="oceanOverlays"
        :selected-feature="activeOceanFeature"
        @select-layer="selectOceanLayer"
        @focus-feature="focusOceanFeature"
      />

      <SeasonalTimelinePanel
        v-else-if="seasonalMode"
        :months="seasonalMonths"
        :active-month="selectedSeasonalMonth"
        @select-month="selectSeasonalMonth"
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
          <div
            v-if="terrainTectonicsMode && activeTerrainFeature.tectonics"
            class="terrain-tectonic-diagram"
            :class="`mode-${terrainTectonicModeClass(activeTerrainFeature.tectonics.mode)}`"
          >
            <div class="tectonic-diagram-head">
              <span>{{ terrainTectonicModeLabel(activeTerrainFeature.tectonics.mode) }}</span>
              <strong>{{ activeTerrainFeature.tectonics.title }}</strong>
            </div>
            <div class="tectonic-flow">
              <div
                v-for="plate in activeTerrainFeature.tectonics.plates.slice(0, 2)"
                :key="plate.name"
                class="plate-node"
              >
                <small>板块</small>
                <b>{{ plate.name }}</b>
              </div>
              <div class="boundary-core">
                <i></i>
                <em>{{ terrainTectonicModeLabel(activeTerrainFeature.tectonics.mode) }}</em>
              </div>
            </div>
            <ol class="tectonic-steps">
              <li v-for="step in activeTerrainFeature.tectonics.steps.slice(0, 4)" :key="step">{{ step }}</li>
            </ol>
          </div>
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
          <div class="climate-global-panel">
            <div class="climate-global-heading">
              <span>{{ activeClimateZone.global_distribution_label }}</span>
              <strong>纬度气候带</strong>
            </div>
            <p>{{ activeClimateZone.global_distribution }}</p>
            <div class="climate-control-row">
              <small v-for="control in activeClimateZone.global_controls" :key="control">{{ control }}</small>
            </div>
            <div class="climate-example-row">
              <span>典型案例</span>
              <b>{{ activeClimateZone.global_examples.join(' / ') }}</b>
            </div>
          </div>
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
            v-for="zone in climateEarthResults"
            :key="zone.id"
            :class="{ active: zone.id === activeClimateZone?.id }"
            @click="selectClimateZone(zone)"
          >
            <span>{{ zone.type_label }}</span>
            <strong>{{ zone.name }}</strong>
            <small>{{ zone.global_distribution_label }}</small>
          </button>
        </div>
      </section>

      <template v-else>
        <section class="exploration-console glass-card">
          <div class="console-orbit-header">
            <span>WorldLens Console</span>
            <b>{{ selectedPlace ? selectedPlace.name : '自由视角' }}</b>
          </div>

          <form class="console-search" @submit.prevent="searchHomeConsole">
            <input
              v-model="exploreKeyword"
              type="search"
              placeholder="搜索地球、国家、地形、气候"
              aria-label="搜索地球、国家、地形、气候"
            >
            <button type="submit">定位</button>
          </form>

          <div class="console-section">
            <div class="console-section-head">
              <span>热门探索</span>
              <small>{{ popularExplorePlaces.length }} TARGETS</small>
            </div>
            <div class="console-target-grid">
              <button
                v-for="place in popularExplorePlaces"
                :key="place.id"
                :class="{ active: place.id === selectedPlace?.id }"
                @click="selectPlace(place)"
              >
                <span>{{ place.name }}</span>
                <small>{{ place.continent }}</small>
              </button>
            </div>
          </div>

          <div class="console-section">
            <div class="console-section-head">
              <span>最近探索</span>
              <button v-if="historyStore.items.length" type="button" @click="historyStore.clear()">清空</button>
            </div>
            <div class="console-recent-list" :class="{ empty: !historyStore.items.length }">
              <button
                v-for="item in historyStore.items.slice(0, 4)"
                :key="item.id"
                @click="selectPlace(item)"
              >
                <span>{{ item.name }}</span>
                <small>{{ item.continent || item.type || 'WorldLens' }}</small>
              </button>
              <span v-if="!historyStore.items.length">暂无轨迹</span>
            </div>
          </div>

          <div class="console-section console-position">
            <div class="console-section-head">
              <span>当前位置</span>
              <small>{{ currentPositionLabel }}</small>
            </div>
            <div class="console-coordinate-grid">
              <span>
                <small>LAT</small>
                <b>{{ currentCoordinates ? formatCoordinate(currentCoordinates.lat, 'lat') : '--' }}</b>
              </span>
              <span>
                <small>LNG</small>
                <b>{{ currentCoordinates ? formatCoordinate(currentCoordinates.lng, 'lng') : '--' }}</b>
              </span>
            </div>
            <div v-if="selectedPlace" class="console-focus-card">
              <span>{{ selectedPlace.type }} · {{ selectedPlace.continent }}</span>
              <strong>{{ selectedPlace.name }}</strong>
              <p>{{ selectedPlace.intro }}</p>
              <div class="console-action-row">
                <button type="button" @click="goDetail(selectedPlace)">详情</button>
                <button type="button" @click="focusSelectedPlace(selectedPlace)">聚焦</button>
                <button type="button" @click="toggleFavorite(selectedPlace)">
                  {{ favoriteStore.has(selectedPlace.id) ? '已收藏' : '收藏' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
      </div>
    </aside>

    <aside
      class="ai-orbit-console"
      :class="{ open: aiPanelOpen, pinned: aiPanelPinned }"
      @mouseenter="openAiConsole"
      @mouseleave="softCloseAiConsole"
    >
      <button
        class="ai-orbit-toggle"
        type="button"
        :aria-expanded="String(aiPanelOpen)"
        @click="toggleAiConsole"
      >
        <b class="ai-orbit-ai-mark">AI</b>
        <span>探索</span>
      </button>
      <div class="ai-orbit-content" v-show="aiPanelOpen">
        <AiExplorationPanel
          @target-focus="focusAiTarget"
          @route-start="handleAiRouteStart"
        />
      </div>
    </aside>

    <article v-if="aiRoute && currentAiRouteStop" class="ai-route-flight-card">
      <div class="ai-route-flight-head">
        <span>AI ROUTE</span>
        <strong>{{ aiRoute.title }}</strong>
        <small>{{ aiRouteActiveIndex + 1 }} / {{ aiRoute.stops.length }}</small>
      </div>
      <div class="ai-route-stop-body">
        <span>{{ aiRoute.theme }}</span>
        <h2>{{ currentAiRouteStop.name }}</h2>
        <p>{{ currentAiRouteStop.intro }}</p>
        <p>{{ currentAiRouteStop.culture }}</p>
        <div v-if="currentAiRouteStop.highlights.length" class="ai-route-highlight-row">
          <small v-for="highlight in currentAiRouteStop.highlights" :key="highlight">{{ highlight }}</small>
        </div>
      </div>
      <div class="ai-route-progress">
        <i
          v-for="(stop, index) in aiRoute.stops"
          :key="stop.id"
          :class="{ active: index === aiRouteActiveIndex, done: index < aiRouteActiveIndex }"
        ></i>
      </div>
      <div class="ai-route-actions">
        <button type="button" @click="toggleAiRoutePlayback">
          {{ aiRoutePlaying ? '暂停' : aiRouteFinished ? '重播' : '继续' }}
        </button>
        <button type="button" :disabled="!hasNextAiRouteStop" @click="nextAiRouteStop">下一站</button>
        <button type="button" @click="saveAiRoute">
          {{ aiRouteSaved ? '已收藏航线' : aiRouteFinished ? '收藏这条路线' : '收藏航线' }}
        </button>
        <button type="button" @click="closeAiRoute">退出</button>
      </div>
      <p v-if="aiRouteFinished" class="ai-route-finish-prompt">航线播放完成，是否将这条路线加入收藏？</p>
    </article>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getClimateZoneById, getClimateZones } from '../api/climateApi'
import { getCivilizationCountryMetrics, getCivilizationLayers } from '../api/civilizationApi'
import { getOceanOverlays } from '../api/oceanApi'
import { filterPlaces, getPlaces } from '../api/placeApi'
import { getTerrainFeatureById, getTerrainFeatures } from '../api/terrainApi'
import {
  buildCivilizationCountryMetrics,
  civilizationLayerTypes
} from '../data/civilizationLayers'
import { culturalRoutes } from '../data/culturalRoutes'
import {
  earthquakeWindows,
  earthDynamicModes,
  getEarthquakes,
  majorPlates,
  volcanoFeatures
} from '../data/earthDynamics'
import { oceanFeatures as defaultOceanFeatures, oceanLayerTypes, oceanOverlays as defaultOceanOverlays } from '../data/ocean'
import { clampSeasonalMonth, seasonalMonthByNumber, seasonalMonths } from '../data/seasonalSystems'
import { filterTerrainFeatures } from '../data/terrain'
import { formatCoordinate, normalizeLng } from '../utils/geo'
import { getHighlightIds } from '../utils/geoLookup'
import { useFavoriteStore } from '../stores/favorite'
import { useHistoryStore } from '../stores/history'

const EarthScene = defineAsyncComponent(() => import('../components/EarthScene.vue'))
const AiExplorationPanel = defineAsyncComponent(() => import('../components/ai/AiExplorationPanel.vue'))
const CivilizationPanel = defineAsyncComponent(() => import('../components/civilization/CivilizationPanel.vue'))
const CosmosPanel = defineAsyncComponent(() => import('../components/cosmos/CosmosPanel.vue'))
const EarthDynamicsPanel = defineAsyncComponent(() => import('../components/dynamics/EarthDynamicsPanel.vue'))
const OceanPanel = defineAsyncComponent(() => import('../components/ocean/OceanPanel.vue'))
const SeasonalTimelinePanel = defineAsyncComponent(() => import('../components/seasonal/SeasonalTimelinePanel.vue'))
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
const resetViewToken = ref(0)
const sidePanelCollapsed = ref(true)
const sidePanelPinned = ref(false)
const aiPanelOpen = ref(false)
const aiPanelPinned = ref(false)
const exploreKeyword = ref('')
const selectedRouteId = ref(culturalRoutes[0]?.routeId || '')
const activeRouteNodeIndex = ref(-1)
const routePlaying = ref(false)
const aiRoute = ref(null)
const aiRouteActiveIndex = ref(-1)
const aiRoutePlaying = ref(false)
const aiRouteFinished = ref(false)
const aiRouteSaved = ref(false)
const terrainFeatures = shallowRef([])
const oceanFeatures = shallowRef(defaultOceanFeatures)
const oceanOverlays = shallowRef(defaultOceanOverlays)
const activeTerrainFeature = ref(null)
const terrainKeyword = ref('')
const terrainTectonicsMode = ref(false)
const climateZones = shallowRef([])
const activeClimateZone = ref(null)
const countryMeta = shallowRef([])
const civilizationLayers = shallowRef(civilizationLayerTypes)
const remoteCivilizationMetrics = shallowRef(null)
const cosmosState = reactive({
  time: 12,
  season: 'june-solstice',
  moonPhase: 'full',
  polarFocus: 'north'
})
const activeEarthquakeWindow = ref('24h')
const activeDynamicFeature = ref(null)
const activeOceanFeature = ref(null)
const selectedSeasonalMonth = ref(7)
let routeTimer = null
let aiRouteTimer = null
let aiCloseTimer = null

const civilizationLayerIds = computed(() => new Set(civilizationLayers.value.map((layer) => layer.id)))
const dynamicLayerIds = new Set(earthDynamicModes.map((mode) => mode.id))
const oceanLayerIds = new Set(oceanLayerTypes.map((layer) => layer.id))
const legacyRouteMode = computed(() => route.query.mode === 'routes')
const civilizationMode = computed(() => route.query.mode === 'civilization' || legacyRouteMode.value)
const civilizationLayerId = computed(() => {
  if (legacyRouteMode.value) return 'routes'
  const layer = String(route.query.civilization || 'routes')
  return civilizationLayerIds.value.has(layer) ? layer : 'routes'
})
const routeMode = computed(() => civilizationMode.value && civilizationLayerId.value === 'routes')
const cosmosMode = computed(() => route.query.mode === 'cosmos')
const dynamicsMode = computed(() => route.query.mode === 'dynamics')
const oceanMode = computed(() => route.query.mode === 'ocean')
const seasonalMode = computed(() => route.query.mode === 'seasonal')
const aiMode = computed(() => route.query.mode === 'ai')
const terrainMode = computed(() => route.query.layer === 'terrain')
const climateMode = computed(() => route.query.layer === 'climate')
const homeConsoleMode = computed(() => !civilizationMode.value && !terrainMode.value && !climateMode.value && !cosmosMode.value && !dynamicsMode.value && !oceanMode.value && !seasonalMode.value)
const sidePanelToggleLabel = computed(() => {
  if (!homeConsoleMode.value) return sidePanelCollapsed.value ? '显示信息栏' : '隐藏信息栏'
  return sidePanelCollapsed.value ? '探索终端' : '收起终端'
})
const activeDynamicLayer = computed(() => {
  const layer = String(route.query.dynamic || 'plates')
  return dynamicLayerIds.has(layer) ? layer : 'plates'
})
const activeOceanLayer = computed(() => {
  const layer = String(route.query.ocean || 'currents')
  return oceanLayerIds.has(layer) ? layer : 'currents'
})
const selectedRoute = computed(() => culturalRoutes.find((item) => item.routeId === selectedRouteId.value) || culturalRoutes[0])
const aiRouteActive = computed(() => Boolean(aiRoute.value))
const currentAiRouteStop = computed(() => {
  if (!aiRoute.value || aiRouteActiveIndex.value < 0) return null
  return aiRoute.value.stops[aiRouteActiveIndex.value] || null
})
const hasNextAiRouteStop = computed(() => Boolean(aiRoute.value && aiRouteActiveIndex.value < aiRoute.value.stops.length - 1))
const fallbackCivilizationMetrics = computed(() => buildCivilizationCountryMetrics(countryMeta.value, places.value))
const civilizationMetrics = computed(() => remoteCivilizationMetrics.value || fallbackCivilizationMetrics.value)
const visibleEarthquakes = computed(() => getEarthquakes(activeEarthquakeWindow.value))
const activeSeasonalState = computed(() => seasonalMonthByNumber(selectedSeasonalMonth.value))
const terrainShowcaseIds = [
  'himalayas',
  'andes',
  'san-andreas-fault',
  'east-african-rift',
  'mid-atlantic-ridge',
  'mariana-trench',
  'yellowstone-caldera',
  'hawaiian-islands',
  'mount-fuji',
  'sahara-desert',
  'atacama-desert',
  'australian-outback',
  'amazon-river',
  'great-lakes',
  'greenland-ice-sheet',
  'great-barrier-reef',
  'grand-canyon',
  'tibetan-plateau'
]
const terrainTectonicModeLabels = {
  collision: '碰撞隆升',
  subduction: '俯冲消减',
  'volcanic-arc': '火山弧',
  divergence: '大陆张裂',
  spreading: '海底扩张',
  transform: '转换断层',
  hotspot: '热点火山'
}
const terrainEarthResults = computed(() => {
  const results = filterTerrainFeatures(terrainFeatures.value, { keyword: terrainKeyword.value })
  if (terrainKeyword.value.trim()) return results.slice(0, 18)
  const byId = new Map(results.map((item) => [item.id, item]))
  const showcase = terrainShowcaseIds.map((id) => byId.get(id)).filter(Boolean)
  const rest = results.filter((item) => !terrainShowcaseIds.includes(item.id))
  return [...showcase, ...rest].slice(0, 18)
})
const climateShowcaseIds = [
  'amazon-rainforest-climate',
  'congo-basin-rainforest-climate',
  'indian-monsoon-climate',
  'east-asian-monsoon-climate',
  'sahara-desert-climate',
  'arabian-desert-climate',
  'mediterranean-climate',
  'western-europe-oceanic-climate',
  'british-oceanic-climate',
  'north-american-continental-climate',
  'siberian-subarctic-climate',
  'greenland-polar-climate',
  'tibetan-highland-climate',
  'andes-highland-climate',
  'australian-interior-arid-climate'
]
const climateEarthResults = computed(() => {
  const byId = new Map(climateZones.value.map((item) => [item.id, item]))
  const showcase = climateShowcaseIds.map((id) => byId.get(id)).filter(Boolean)
  const rest = climateZones.value.filter((item) => !climateShowcaseIds.includes(item.id))
  return [...showcase, ...rest].slice(0, 15)
})
const popularExplorePlaces = computed(() => filterPlaces(places.value, exploreKeyword.value).slice(0, 6))
const currentCoordinates = computed(() => {
  const place = selectedPlace.value || activeFeature.value
  if (place?.coordinates) return place.coordinates
  if (Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) {
    return { lat: place.lat, lng: place.lng }
  }
  return null
})
const currentPositionLabel = computed(() => selectedPlace.value?.name || activeFeature.value?.name || 'FREE VIEW')

function terrainTectonicModeLabel(mode) {
  return terrainTectonicModeLabels[mode] || '板块构造'
}

function terrainTectonicModeClass(mode) {
  return String(mode || 'collision').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'collision'
}

function toggleSidePanel() {
  if (sidePanelCollapsed.value) {
    sidePanelCollapsed.value = false
    sidePanelPinned.value = true
    return
  }
  sidePanelCollapsed.value = true
  sidePanelPinned.value = false
}

function revealHomeConsole() {
  if (!homeConsoleMode.value || sidePanelPinned.value) return
  sidePanelCollapsed.value = false
}

function softCollapseHomeConsole() {
  if (!homeConsoleMode.value || sidePanelPinned.value) return
  sidePanelCollapsed.value = true
}

function openAiConsole() {
  if (aiCloseTimer) {
    clearTimeout(aiCloseTimer)
    aiCloseTimer = null
  }
  aiPanelOpen.value = true
}

function softCloseAiConsole() {
  if (aiPanelPinned.value || aiMode.value) return
  if (aiCloseTimer) clearTimeout(aiCloseTimer)
  aiCloseTimer = setTimeout(() => {
    aiPanelOpen.value = false
    aiCloseTimer = null
  }, 220)
}

function toggleAiConsole() {
  if (aiCloseTimer) {
    clearTimeout(aiCloseTimer)
    aiCloseTimer = null
  }
  if (aiPanelOpen.value && aiPanelPinned.value) {
    aiPanelPinned.value = false
    if (!aiMode.value) aiPanelOpen.value = false
    return
  }
  aiPanelOpen.value = true
  aiPanelPinned.value = true
}

function openHomeConsole() {
  if (!homeConsoleMode.value) return
  sidePanelCollapsed.value = false
  sidePanelPinned.value = true
}

function searchHomeConsole() {
  const target = popularExplorePlaces.value[0]
  if (target) {
    selectPlace(target)
    return
  }
  router.push({ path: '/gallery', query: { q: exploreKeyword.value } })
}

function isPlainHomeRoute() {
  return route.path === '/' && !route.query.mode && !route.query.layer && !route.query.focus
}

function resetMainEarthView() {
  selectedPlace.value = null
  activeFeature.value = null
  focusPlace.value = null
  focusCommand.value = null
  activeTerrainFeature.value = null
  terrainTectonicsMode.value = false
  activeClimateZone.value = null
  activeDynamicFeature.value = null
  activeOceanFeature.value = null
  activeRouteNodeIndex.value = -1
  routePlaying.value = false
  sidePanelPinned.value = false
  sidePanelCollapsed.value = true
  aiPanelPinned.value = false
  aiPanelOpen.value = false
  resetViewToken.value += 1
  clearRouteTimer()
  closeAiRoute()
}

onMounted(async () => {
  const [
    loadedPlaces,
    loadedTerrain,
    loadedClimate,
    loadedCountryMeta,
    loadedOceanOverlays,
    loadedCivilizationLayers,
    loadedCivilizationMetrics
  ] = await Promise.all([
    getPlaces(),
    getTerrainFeatures(),
    getClimateZones(),
    loadCountryMeta(),
    getOceanOverlays(),
    getCivilizationLayers(),
    getCivilizationCountryMetrics()
  ])
  places.value = loadedPlaces
  terrainFeatures.value = loadedTerrain
  climateZones.value = loadedClimate
  countryMeta.value = loadedCountryMeta
  oceanOverlays.value = loadedOceanOverlays
  civilizationLayers.value = loadedCivilizationLayers
  remoteCivilizationMetrics.value = loadedCivilizationMetrics
  const focusSlug = String(route.query.focus || '')
  if (focusSlug && !civilizationMode.value) {
    const place = places.value.find((item) => item.slug === focusSlug)
    if (place) selectPlace(place)
  }
  await syncTerrainFromRoute()
  await syncClimateFromRoute()
})

onBeforeUnmount(() => {
  clearRouteTimer()
  clearAiRouteTimer()
  if (aiCloseTimer) clearTimeout(aiCloseTimer)
})

async function loadCountryMeta() {
  try {
    const response = await fetch('/geo/country-meta.json')
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

watch(
  () => route.fullPath,
  () => {
    if (isPlainHomeRoute()) resetMainEarthView()
  }
)

watch(
  homeConsoleMode,
  (enabled) => {
    sidePanelPinned.value = false
    sidePanelCollapsed.value = enabled
  },
  { immediate: true }
)

watch(
  aiMode,
  (enabled) => {
    if (!enabled) return
    aiPanelOpen.value = true
    aiPanelPinned.value = true
  },
  { immediate: true }
)

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

watch(
  () => [dynamicsMode.value, activeDynamicLayer.value, activeEarthquakeWindow.value],
  () => syncDynamicSelection(),
  { immediate: true }
)

watch(
  () => [oceanMode.value, activeOceanLayer.value],
  () => syncOceanSelection(),
  { immediate: true }
)

watch(
  () => [seasonalMode.value, route.query.month],
  () => syncSeasonalSelection(),
  { immediate: true }
)

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
  openHomeConsole()
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
  openHomeConsole()
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
  openHomeConsole()
  historyStore.add(feature)
}

function goDetail(place) {
  if (place.slug) router.push(`/place/${place.slug}`)
  else router.push({ path: '/search', query: { q: place.name } })
}

function toggleFavorite(place) {
  favoriteStore.toggle(place.id, {
    itemType: 'place',
    title: place.name,
    coverImage: place.coverImage || ''
  })
}

function focusSelectedPlace(place) {
  focusCommand.value = { place, at: Date.now() }
}

function focusAiTarget(target) {
  const coordinates = Array.isArray(target?.coordinates) ? target.coordinates : []
  const lat = Number(coordinates[0])
  const lng = Number(coordinates[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

  const countryCode = String(target.countryCode || '').toUpperCase()
  const matchedPlace = places.value.find((place) => {
    const geoId = String(place.geoFeatureId || '').toUpperCase()
    const id = String(place.id || '').toUpperCase()
    return (countryCode && (geoId === countryCode || id === `COUNTRY-${countryCode}`)) ||
      place.name === target.country ||
      place.name === target.target
  })
  const geoId = countryCode || matchedPlace?.geoFeatureId || matchedPlace?.id || target.target || target.country || 'ai-target'
  const place = {
    ...(matchedPlace || {}),
    id: matchedPlace?.id || `ai-${String(geoId).toLowerCase()}`,
    slug: matchedPlace?.slug || `ai-${String(geoId).toLowerCase()}`,
    name: target.country || target.target || matchedPlace?.name || 'AI探索目标',
    type: matchedPlace?.type || 'AI探索',
    continent: matchedPlace?.continent || 'WorldLens AI',
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    geoFeatureId: geoId,
    coordinates: {
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4))
    },
    highlightFeatureIds: getHighlightIds(geoId),
    matchLayer: 'ai',
    matchMethod: target.moduleId || 'ai-exploration'
  }

  activeFeature.value = place
  selectedPlace.value = place
  focusCommand.value = { place, at: Date.now() }
  historyStore.add(place)
}

function handleAiRouteStart(routePayload) {
  if (!routePayload?.stops?.length) return
  clearAiRouteTimer()
  aiRoute.value = routePayload
  aiRouteActiveIndex.value = 0
  aiRoutePlaying.value = true
  aiRouteFinished.value = false
  aiRouteSaved.value = favoriteStore.has(routePayload.routeId)
  aiPanelOpen.value = false
  aiPanelPinned.value = false
  focusAiRouteStop(0)
  scheduleAiRouteStep()
}

function focusAiRouteStop(index) {
  const stop = aiRoute.value?.stops?.[index]
  if (!stop) return
  focusAiTarget({
    moduleId: 'ai_route',
    target: stop.name,
    country: stop.country || stop.name,
    countryCode: stop.countryCode,
    coordinates: stop.coordinates
  })
}

function selectAiRouteStop(index, shouldSchedule = true) {
  if (!aiRoute.value?.stops?.[index]) return
  aiRouteActiveIndex.value = index
  aiRouteFinished.value = false
  focusAiRouteStop(index)
  if (shouldSchedule && aiRoutePlaying.value) scheduleAiRouteStep()
}

function scheduleAiRouteStep() {
  clearAiRouteTimer()
  if (!aiRoutePlaying.value || !currentAiRouteStop.value) return
  const stayMs = Math.max(5000, Number(currentAiRouteStop.value.staySeconds || 8) * 1000)
  aiRouteTimer = setTimeout(() => {
    if (!aiRoutePlaying.value) return
    if (!hasNextAiRouteStop.value) {
      finishAiRoute()
      return
    }
    selectAiRouteStop(aiRouteActiveIndex.value + 1)
  }, stayMs)
}

function toggleAiRoutePlayback() {
  if (!aiRoute.value) return
  if (aiRouteFinished.value) {
    aiRouteActiveIndex.value = 0
    aiRouteFinished.value = false
    aiRoutePlaying.value = true
    focusAiRouteStop(0)
    scheduleAiRouteStep()
    return
  }
  aiRoutePlaying.value = !aiRoutePlaying.value
  if (aiRoutePlaying.value) scheduleAiRouteStep()
  else clearAiRouteTimer()
}

function nextAiRouteStop() {
  if (!aiRoute.value) return
  if (!hasNextAiRouteStop.value) {
    finishAiRoute()
    return
  }
  aiRoutePlaying.value = true
  selectAiRouteStop(aiRouteActiveIndex.value + 1)
}

async function saveAiRoute() {
  if (!aiRoute.value || aiRouteSaved.value) return
  const routePayload = {
    ...aiRoute.value,
    savedAt: new Date().toISOString()
  }
  await favoriteStore.save(aiRoute.value.routeId, {
    itemType: 'ai_route',
    title: aiRoute.value.title,
    coverImage: '',
    payload: JSON.stringify(routePayload)
  })
  aiRouteSaved.value = true
}

function finishAiRoute() {
  clearAiRouteTimer()
  aiRoutePlaying.value = false
  aiRouteFinished.value = true
}

function closeAiRoute() {
  clearAiRouteTimer()
  aiRoute.value = null
  aiRouteActiveIndex.value = -1
  aiRoutePlaying.value = false
  aiRouteFinished.value = false
  aiRouteSaved.value = false
}

function clearAiRouteTimer() {
  if (!aiRouteTimer) return
  clearTimeout(aiRouteTimer)
  aiRouteTimer = null
}

async function syncTerrainFromRoute() {
  if (!terrainMode.value) return
  const terrainId = String(route.query.terrain || '')
  if (!terrainId) {
    activeTerrainFeature.value = null
    terrainTectonicsMode.value = false
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
    activeClimateZone.value = null
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

function syncSeasonalSelection() {
  if (!seasonalMode.value) return
  selectedSeasonalMonth.value = clampSeasonalMonth(route.query.month || selectedSeasonalMonth.value)
}

function selectSeasonalMonth(month) {
  selectedSeasonalMonth.value = clampSeasonalMonth(month)
  router.replace({
    path: '/',
    query: { mode: 'seasonal', month: selectedSeasonalMonth.value }
  })
}

function syncDynamicSelection() {
  if (!dynamicsMode.value) {
    activeDynamicFeature.value = null
    return
  }
  const items = dynamicItemsForLayer(activeDynamicLayer.value)
  const current = activeDynamicFeature.value
  if (current && current.kind === dynamicKindForLayer(activeDynamicLayer.value) && items.some((item) => item.id === current.feature.id)) return
  activeDynamicFeature.value = null
}

function syncOceanSelection() {
  if (!oceanMode.value) {
    activeOceanFeature.value = null
    return
  }
  const items = oceanItemsForLayer(activeOceanLayer.value)
  const current = activeOceanFeature.value
  if (current && current.layer === activeOceanLayer.value) {
    const matching = items.find((item) => item.id === current.feature.id)
    if (matching) {
      if (matching !== current.feature) {
        activeOceanFeature.value = { ...current, feature: matching }
      }
      return
    }
  }
  activeOceanFeature.value = null
}

function dynamicItemsForLayer(layer) {
  if (layer === 'earthquakes') return visibleEarthquakes.value
  if (layer === 'volcanoes') return volcanoFeatures
  return majorPlates
}

function dynamicKindForLayer(layer) {
  if (layer === 'earthquakes') return 'earthquake'
  if (layer === 'volcanoes') return 'volcano'
  return 'plate'
}

function oceanItemsForLayer(layer) {
  if (layer === 'depth') return oceanFeatures.value
  return oceanOverlays.value[layer] || []
}

function selectDynamicLayer(layerId) {
  if (!dynamicLayerIds.has(layerId)) return
  activeDynamicFeature.value = null
  router.replace({ path: '/', query: { mode: 'dynamics', dynamic: layerId } })
}

function selectEarthquakeWindow(windowId) {
  if (!earthquakeWindows.some((item) => item.id === windowId)) return
  activeEarthquakeWindow.value = windowId
  activeDynamicFeature.value = null
}

function focusDynamicFeature(item) {
  const payload = normalizeDynamicPayload(item)
  if (!payload) return
  activeDynamicFeature.value = payload
  const center = dynamicFeatureCenter(payload)
  if (!center) return
  focusCommand.value = {
    place: {
      id: payload.feature.id,
      name: payload.feature.name,
      lat: center.lat,
      lng: center.lng
    },
    at: Date.now()
  }
}

function handleDynamicSelect(item) {
  focusDynamicFeature(item)
}

function normalizeDynamicPayload(item) {
  if (!item) return null
  if (item.kind && item.feature) return item
  const layer = activeDynamicLayer.value
  return { kind: dynamicKindForLayer(layer), feature: item }
}

function dynamicFeatureCenter(item) {
  const feature = item?.feature
  if (!feature) return null
  if (item.kind === 'plate' && feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  if (Number.isFinite(feature.lat) && Number.isFinite(feature.lng)) return { lat: feature.lat, lng: feature.lng }
  if (feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  return null
}

function openDynamicTerrain(terrainId) {
  if (!terrainId) return
  router.push(`/terrain/${terrainId}`)
}

function selectOceanLayer(layerId) {
  if (!oceanLayerIds.has(layerId)) return
  activeOceanFeature.value = null
  router.replace({ path: '/', query: { mode: 'ocean', ocean: layerId } })
}

function focusOceanFeature(item) {
  const payload = normalizeOceanPayload(item)
  if (!payload) return
  activeOceanFeature.value = payload
  const center = oceanFeatureCenter(payload)
  if (!center) return
  focusCommand.value = {
    place: {
      id: payload.feature.id,
      name: payload.feature.name,
      lat: center.lat,
      lng: center.lng
    },
    at: Date.now()
  }
}

function handleOceanSelect(item) {
  focusOceanFeature(item)
}

function normalizeOceanPayload(item) {
  if (!item) return null
  if (item.kind && item.feature) return item
  return {
    kind: activeOceanLayer.value === 'depth' ? 'ocean' : 'overlay',
    layer: activeOceanLayer.value,
    feature: item
  }
}

function oceanFeatureCenter(item) {
  const feature = item?.feature
  if (!feature) return null
  if (feature.center) return { lat: feature.center[0], lng: feature.center[1] }
  const path = feature.path || []
  if (path.length) {
    const middle = path[Math.floor(path.length / 2)]
    return { lat: middle[0], lng: middle[1] }
  }
  return null
}

function selectCivilizationLayer(layerId) {
  if (!civilizationLayerIds.value.has(layerId)) return
  const nextQuery = {
    mode: 'civilization',
    civilization: layerId
  }
  router.replace({ path: '/', query: nextQuery })
}

function focusCivilizationCountry(metric) {
  if (!metric) return
  focusCommand.value = {
    place: {
      id: metric.id,
      name: metric.name,
      lat: metric.lat,
      lng: metric.lng
    },
    at: Date.now()
  }
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
