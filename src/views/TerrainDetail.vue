<template>
  <main v-if="terrain" class="terrain-detail-view page-view">
    <section
      class="terrain-detail-hero"
      :style="{ backgroundImage: `linear-gradient(90deg, rgba(2,4,7,.76), rgba(2,4,7,.18), rgba(2,4,7,.72)), url('${terrain.cover_image}')` }"
    >
      <div class="terrain-detail-copy">
        <p class="eyebrow">地形探索</p>
        <h1>{{ terrain.name }}</h1>
        <p>{{ terrain.summary }}</p>
        <div class="terrain-impact-tags">
          <span v-for="tag in terrain.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="detail-actions">
          <RouterLink class="primary-btn" :to="{ path: '/', query: { layer: 'terrain', terrain: terrain.id } }">
            在地球上查看
          </RouterLink>
          <RouterLink
            v-if="terrain.tectonics"
            class="ghost-btn"
            :to="{ path: '/', query: { layer: 'terrain', terrain: terrain.id, tectonics: '1' } }"
          >
            查看形成原因
          </RouterLink>
          <RouterLink class="ghost-btn" to="/terrain">返回地形探索</RouterLink>
        </div>
      </div>
    </section>

    <section class="detail-section terrain-detail-grid">
      <div class="terrain-detail-main">
        <component :is="TerrainFormationAnimation" :terrain="terrain" />

        <article
          v-for="section in explanationSections"
          :key="section.title"
          class="terrain-explain-card glass-card"
        >
          <span>{{ section.kicker }}</span>
          <h2>{{ section.title }}</h2>
          <p>{{ section.content }}</p>
        </article>
      </div>

      <aside class="terrain-fact-panel glass-card">
        <p class="eyebrow">基础信息</p>
        <h2>地理位置</h2>
        <div class="terrain-fact-list">
          <span><small>类型</small><strong>{{ terrain.type_label }}</strong></span>
          <span><small>大洲</small><strong>{{ terrain.continent }}</strong></span>
          <span><small>区域</small><strong>{{ terrain.region }}</strong></span>
          <span><small>坐标</small><strong>{{ terrain.latitude.toFixed(2) }}° / {{ terrain.longitude.toFixed(2) }}°</strong></span>
          <span v-if="terrain.highest_point"><small>最高点 / 深度</small><strong>{{ terrain.highest_point }}</strong></span>
          <span v-if="terrain.elevation"><small>海拔 / 深度</small><strong>{{ terrain.elevation }}</strong></span>
          <span v-if="terrain.area"><small>面积</small><strong>{{ terrain.area }}</strong></span>
          <span v-if="terrain.length"><small>长度</small><strong>{{ terrain.length }}</strong></span>
        </div>

        <div v-if="terrain.tectonics" class="terrain-related-block tectonic-story-block">
          <h3>板块构造</h3>
          <p>{{ terrain.tectonics.title }}</p>
          <ol>
            <li v-for="step in terrain.tectonics.steps" :key="step">{{ step }}</li>
          </ol>
        </div>

        <div class="terrain-related-block">
          <h3>相关国家</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="code in terrain.country_codes"
              :key="code"
              :to="{ path: '/gallery', query: { q: code } }"
            >
              {{ code }}
            </RouterLink>
          </div>
        </div>

        <div v-if="terrain.related_routes.length" class="terrain-related-block">
          <h3>相关路线</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="routeId in terrain.related_routes"
              :key="routeId"
              :to="{ path: '/', query: { mode: 'routes' } }"
            >
              {{ routeId }}
            </RouterLink>
          </div>
        </div>
      </aside>
    </section>

    <section v-if="related.length" class="detail-section related-section">
      <div class="section-heading">
        <p class="eyebrow">Related Terrain</p>
        <h2>相关地形</h2>
      </div>
      <div class="related-grid">
        <RouterLink
          v-for="item in related"
          :key="item.id"
          class="related-card glass-card"
          :to="`/terrain/${item.id}`"
          v-lazy-bg="{ image: item.cover_image, overlay: 'linear-gradient(180deg, rgba(2,4,7,.16), rgba(2,4,7,.82))', width: 720 }"
        >
          <span>{{ item.type_label }}</span>
          <strong>{{ item.name }}</strong>
        </RouterLink>
      </div>
    </section>
  </main>

  <main v-else class="not-found page-view">
    <div class="glass-card">
      <h1>没有找到这个地形</h1>
      <p>返回地形探索，选择另一处地球形态。</p>
      <RouterLink class="primary-btn" to="/terrain">返回地形探索</RouterLink>
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRelatedTerrain, getTerrainFeatureById } from '../api/terrainApi'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const TerrainFormationAnimation = defineAsyncComponent(() =>
  import('../components/terrain/TerrainFormationAnimation.vue')
)

const route = useRoute()
const terrain = ref(null)
const related = ref([])

onMounted(loadTerrain)

watch(
  () => route.params.id,
  loadTerrain
)

async function loadTerrain() {
  terrain.value = await getTerrainFeatureById(route.params.id)
  related.value = terrain.value ? await getRelatedTerrain(terrain.value.id) : []
}

const explanationSections = computed(() => {
  if (!terrain.value) return []
  return [
    { kicker: '形成', title: '为什么形成', content: terrain.value.formation_reason },
    { kicker: '地貌', title: '地貌特征', content: terrain.value.summary },
    { kicker: '气候', title: '如何影响气候', content: terrain.value.climate_impact },
    { kicker: '生态', title: '如何影响生态系统', content: terrain.value.ecology },
    { kicker: '文明', title: '如何影响文明与国家发展', content: terrain.value.civilization_impact },
    { kicker: '人类活动', title: '如何影响人类活动', content: terrain.value.human_activity }
  ]
})
</script>
