<template>
  <main v-if="climate" class="terrain-detail-view climate-detail-view page-view">
    <section
      class="terrain-detail-hero climate-detail-hero"
      :style="{ backgroundImage: `linear-gradient(90deg, rgba(2,4,7,.78), rgba(2,4,7,.2), rgba(2,4,7,.76)), url('${climate.cover_image}')` }"
    >
      <div class="terrain-detail-copy climate-detail-copy">
        <p class="eyebrow">气候探索</p>
        <h1>{{ climate.name }}</h1>
        <p>{{ climate.summary }}</p>
        <div class="terrain-impact-tags">
          <span v-for="tag in climate.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="detail-actions">
          <RouterLink class="primary-btn" :to="{ path: '/', query: { layer: 'climate', climate: climate.id } }">
            在地球上查看
          </RouterLink>
          <RouterLink class="ghost-btn" to="/climate">返回气候探索</RouterLink>
        </div>
      </div>
    </section>

    <section class="detail-section climate-story-section">
      <ClimateStory :climate="climate" />
    </section>

    <section class="detail-section terrain-detail-grid climate-detail-grid">
      <div class="terrain-detail-main">
        <component :is="ClimateAnimationSystem" :climate="climate" />

        <article
          v-for="section in explanationSections"
          :key="section.title"
          class="terrain-explain-card climate-explain-card glass-card"
        >
          <span>{{ section.kicker }}</span>
          <h2>{{ section.title }}</h2>
          <p>{{ section.content }}</p>
        </article>
      </div>

      <aside class="terrain-fact-panel climate-fact-panel glass-card">
        <p class="eyebrow">基础信息</p>
        <h2>气候位置</h2>
        <div class="terrain-fact-list">
          <span><small>类型</small><strong>{{ climate.type_label }}</strong></span>
          <span><small>大洲</small><strong>{{ climate.continent }}</strong></span>
          <span><small>主要分布</small><strong>{{ climate.region }}</strong></span>
          <span><small>坐标中心</small><strong>{{ climate.latitude.toFixed(2) }}° / {{ climate.longitude.toFixed(2) }}°</strong></span>
          <span><small>气温</small><strong>{{ climate.temperature }}</strong></span>
          <span><small>降水</small><strong>{{ climate.precipitation }}</strong></span>
        </div>

        <div class="terrain-related-block">
          <h3>形成因素</h3>
          <div class="terrain-code-row climate-code-row">
            <span v-for="factor in climate.factors" :key="factor">{{ factorLabel(factor) }}</span>
          </div>
        </div>

        <div class="terrain-related-block">
          <h3>相关国家</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="code in climate.related_countries"
              :key="code"
              :to="{ path: '/gallery', query: { q: code } }"
            >
              {{ code }}
            </RouterLink>
          </div>
        </div>

        <div v-if="climate.related_terrain.length" class="terrain-related-block">
          <h3>相关地形</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="terrainId in climate.related_terrain"
              :key="terrainId"
              :to="`/terrain/${terrainId}`"
            >
              {{ terrainId }}
            </RouterLink>
          </div>
        </div>

        <div v-if="climate.related_oceans.length" class="terrain-related-block">
          <h3>相关海洋</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="oceanId in climate.related_oceans"
              :key="oceanId"
              :to="{ path: '/gallery', query: { section: 'oceans', q: oceanId } }"
            >
              {{ oceanId }}
            </RouterLink>
          </div>
        </div>

        <div v-if="climate.related_routes.length" class="terrain-related-block">
          <h3>相关路线</h3>
          <div class="terrain-code-row">
            <RouterLink
              v-for="routeId in climate.related_routes"
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
        <p class="eyebrow">相关气候</p>
        <h2>相关气候系统</h2>
      </div>
      <div class="related-grid">
        <RouterLink
          v-for="item in related"
          :key="item.id"
          class="related-card glass-card"
          :to="`/climate/${item.id}`"
          v-lazy-bg="{ image: item.cover_image, overlay: 'linear-gradient(180deg, rgba(2,4,7,.12), rgba(2,4,7,.84))', width: 720 }"
        >
          <span>{{ item.type_label }}</span>
          <strong>{{ item.name }}</strong>
        </RouterLink>
      </div>
    </section>
  </main>

  <main v-else class="not-found page-view">
    <div class="glass-card">
      <h1>没有找到这个气候系统</h1>
      <p>返回气候探索，选择另一处气候区域继续探索。</p>
      <RouterLink class="primary-btn" to="/climate">返回气候探索</RouterLink>
    </div>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ClimateStory from '../components/climate/ClimateStory.vue'
import { getClimateZoneById, getRelatedClimate } from '../api/climateApi'
import { climateFactors } from '../data/climate'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const ClimateAnimationSystem = defineAsyncComponent(() =>
  import('../components/climate/ClimateAnimationSystem.vue')
)

const route = useRoute()
const climate = ref(null)
const related = ref([])

onMounted(loadClimate)

watch(
  () => route.params.id,
  loadClimate
)

async function loadClimate() {
  climate.value = await getClimateZoneById(route.params.id)
  related.value = climate.value ? await getRelatedClimate(climate.value.id) : []
}

function factorLabel(code) {
  return climateFactors.find((factor) => factor.code === code)?.label || code
}

const explanationSections = computed(() => {
  if (!climate.value) return []
  return [
    { kicker: '机制', title: '形成机制', content: climate.value.formation_reason },
    { kicker: '气温', title: '气温特征', content: climate.value.temperature },
    { kicker: '降水', title: '降水特征', content: climate.value.precipitation },
    { kicker: '季节', title: '季节变化', content: climate.value.seasonality },
    { kicker: '植被', title: '典型植被', content: climate.value.vegetation },
    { kicker: '动物', title: '典型动物', content: climate.value.wildlife },
    { kicker: '农业', title: '农业影响', content: climate.value.agriculture },
    { kicker: '聚落', title: '城市与聚落影响', content: climate.value.human_settlement },
    { kicker: '文明', title: '文明影响', content: climate.value.civilization_impact }
  ]
})
</script>
