<template>
  <section class="dynamics-earth-panel glass-card">
    <div class="panel-label">
      <span>地球动态</span>
      <small>{{ activeMode?.label }}</small>
    </div>

    <article class="dynamics-panel-hero">
      <span>{{ activeCopy.eyebrow }}</span>
      <h2>{{ activeCopy.title }}</h2>
      <p>{{ activeCopy.description }}</p>
    </article>

    <div class="dynamics-layer-tabs">
      <button
        v-for="mode in orderedModes"
        :key="mode.id"
        :class="{ active: mode.id === activeLayer }"
        @click="$emit('select-layer', mode.id)"
      >
        <span>{{ modeShortLabel(mode.id) }}</span>
        <strong>{{ mode.label }}</strong>
      </button>
    </div>

    <div v-if="activeLayer === 'earthquakes'" class="dynamics-window-tabs">
      <button
        v-for="window in earthquakeWindows"
        :key="window.id"
        :class="{ active: window.id === activeWindow }"
        @click="$emit('select-window', window.id)"
      >
        {{ window.label }}
      </button>
    </div>

    <div class="dynamics-legend">
      <span v-for="item in legend" :key="item.label">
        <i :style="{ background: item.color }"></i>
        {{ item.label }}
      </span>
    </div>

    <article v-if="selected" class="dynamics-feature-card">
      <div class="feature-card-topline">
        <span>{{ selectedKindLabel }}</span>
        <small>{{ selectedMeta }}</small>
      </div>
      <h3>{{ selectedFeature.name }}</h3>
      <p>{{ selectedSummary }}</p>
      <div class="dynamics-fact-grid">
        <span v-for="fact in selectedFacts" :key="fact.label">
          <small>{{ fact.label }}</small>
          <strong>{{ fact.value }}</strong>
        </span>
      </div>
      <div class="preview-actions">
        <button class="primary-btn" @click="$emit('focus-feature', selected)">聚焦此处</button>
        <button
          v-if="terrainTarget"
          class="ghost-btn"
          @click="$emit('open-terrain', terrainTarget)"
        >
          查看地形
        </button>
      </div>
    </article>
    <article v-else class="dynamics-empty-card">
      <span>{{ activeCopy.eyebrow }}</span>
      <h3>先浏览当前图层，再选择一个案例定位。</h3>
      <p>切换板块、地震或火山只会打开对应图层；点击下方具体案例后，地球才会聚焦到该位置。</p>
    </article>

    <div class="dynamics-feature-list">
      <button
        v-for="item in featureItems"
        :key="`${item.kind}-${item.feature.id}`"
        :class="{ active: selectedKey === `${item.kind}-${item.feature.id}` }"
        @click="$emit('focus-feature', item)"
      >
        <i :style="{ background: itemColor(item) }"></i>
        <strong>{{ item.feature.name }}</strong>
        <small>{{ itemLine(item) }}</small>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modes: { type: Array, default: () => [] },
  activeLayer: { type: String, default: 'plates' },
  earthquakeWindows: { type: Array, default: () => [] },
  activeWindow: { type: String, default: '24h' },
  earthquakes: { type: Array, default: () => [] },
  volcanoes: { type: Array, default: () => [] },
  plates: { type: Array, default: () => [] },
  selectedFeature: { type: Object, default: null }
})

defineEmits(['select-layer', 'select-window', 'focus-feature', 'open-terrain'])

const layerOrder = ['plates', 'earthquakes', 'volcanoes']
const copy = {
  plates: {
    eyebrow: 'Planet engine',
    title: '看见大陆如何漂移、碰撞与撕裂。',
    description: '板块边界、运动箭头和能量带共同揭示山脉、海沟、火山岛弧的深层结构。'
  },
  earthquakes: {
    eyebrow: 'Seismic pulse',
    title: '让震源像能量波一样从地壳里浮现。',
    description: '不同时间窗口内的震源用脉冲圈和强度色阶呈现，帮助理解板块边缘释放能量的位置。'
  },
  volcanoes: {
    eyebrow: 'Magma columns',
    title: '沿火山光柱追踪地球内部的热量出口。',
    description: '活火山、休眠火山和超级火山用不同高度与色温显示，连接地貌档案与板块背景。'
  }
}

const terrainLinks = {
  fuji: 'mount-fuji',
  kilimanjaro: 'kilimanjaro-volcano',
  etna: 'etna-volcano',
  'mauna-loa': 'hawaiian-islands',
  yellowstone: 'yellowstone-caldera'
}

const orderedModes = computed(() =>
  layerOrder
    .map((id) => props.modes.find((mode) => mode.id === id))
    .filter(Boolean)
)

const activeMode = computed(() => props.modes.find((mode) => mode.id === props.activeLayer) || orderedModes.value[0])
const activeCopy = computed(() => copy[props.activeLayer] || copy.plates)

const featureItems = computed(() => {
  if (props.activeLayer === 'earthquakes') {
    return props.earthquakes.map((feature) => ({ kind: 'earthquake', feature }))
  }
  if (props.activeLayer === 'volcanoes') {
    return props.volcanoes.map((feature) => ({ kind: 'volcano', feature }))
  }
  return props.plates.map((feature) => ({ kind: 'plate', feature }))
})

const selected = computed(() => props.selectedFeature || null)
const selectedFeature = computed(() => selected.value?.feature || {})
const selectedKey = computed(() => selected.value ? `${selected.value.kind}-${selected.value.feature.id}` : '')
const selectedKindLabel = computed(() => {
  if (selected.value?.kind === 'earthquake') return '地震事件'
  if (selected.value?.kind === 'volcano') return '火山系统'
  return '主要板块'
})
const selectedMeta = computed(() => {
  const feature = selectedFeature.value
  if (selected.value?.kind === 'earthquake') return `M ${feature.magnitude} · ${feature.depth}`
  if (selected.value?.kind === 'volcano') return volcanoStatusLabel(feature.status)
  return feature.center ? `${feature.center[0]}° / ${feature.center[1]}°` : '板块中心'
})
const selectedSummary = computed(() =>
  selectedFeature.value.summary || selectedFeature.value.plateContext || selectedFeature.value.significance || activeCopy.value.description
)
const selectedFacts = computed(() => {
  const feature = selectedFeature.value
  if (selected.value?.kind === 'earthquake') {
    return [
      { label: '震级', value: `M ${feature.magnitude}` },
      { label: '深度', value: feature.depth },
      { label: '窗口', value: feature.window }
    ]
  }
  if (selected.value?.kind === 'volcano') {
    return [
      { label: '状态', value: volcanoStatusLabel(feature.status) },
      { label: '高度', value: feature.elevation },
      { label: '位置', value: `${feature.lat.toFixed(1)}° / ${feature.lng.toFixed(1)}°` }
    ]
  }
  return [
    { label: '中心', value: `${feature.center?.[0]}° / ${feature.center?.[1]}°` },
    { label: '边界点', value: `${feature.boundary?.length || 0}` },
    { label: '运动', value: `${feature.motion?.[0]}° / ${feature.motion?.[1]}°` }
  ]
})
const terrainTarget = computed(() => {
  if (selected.value?.kind !== 'volcano') return ''
  return terrainLinks[selectedFeature.value.id] || ''
})
const legend = computed(() => {
  if (props.activeLayer === 'earthquakes') {
    return [
      { label: '中强震', color: '#ffd27a' },
      { label: '强震脉冲', color: '#ff7a45' },
      { label: '深源阴影', color: '#7dd3fc' }
    ]
  }
  if (props.activeLayer === 'volcanoes') {
    return [
      { label: '活火山', color: '#ff8a3d' },
      { label: '休眠火山', color: '#f2d98d' },
      { label: '超级火山', color: '#ff4f8b' }
    ]
  }
  return [
    { label: '板块面', color: '#355b72' },
    { label: '运动箭头', color: '#8fd8ff' },
    { label: '边界能量', color: '#ffd27a' }
  ]
})

function modeShortLabel(id) {
  if (id === 'earthquakes') return '震'
  if (id === 'volcanoes') return '火'
  return '板'
}

function itemLine(item) {
  if (item.kind === 'earthquake') return `M ${item.feature.magnitude} · ${item.feature.depth}`
  if (item.kind === 'volcano') return volcanoStatusLabel(item.feature.status)
  return item.feature.summary
}

function itemColor(item) {
  if (item.kind === 'earthquake') return item.feature.magnitude >= 6 ? '#ff7a45' : '#ffd27a'
  if (item.kind === 'volcano') return item.feature.status === 'supervolcano' ? '#ff4f8b' : item.feature.status === 'active' ? '#ff8a3d' : '#f2d98d'
  return '#8fd8ff'
}

function volcanoStatusLabel(status) {
  if (status === 'active') return '活火山'
  if (status === 'dormant') return '休眠火山'
  if (status === 'supervolcano') return '超级火山'
  return status || '火山'
}
</script>
