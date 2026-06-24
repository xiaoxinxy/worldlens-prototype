<template>
  <section class="ocean-earth-panel glass-card">
    <div class="panel-label">
      <span>海洋探索</span>
      <small>{{ activeLayerInfo?.label }}</small>
    </div>

    <article class="ocean-panel-hero">
      <span>{{ activeCopy.eyebrow }}</span>
      <h2>{{ activeCopy.title }}</h2>
      <p>{{ activeCopy.description }}</p>
    </article>

    <div class="ocean-layer-tabs">
      <button
        v-for="layer in visibleLayers"
        :key="layer.id"
        :class="{ active: layer.id === activeLayer }"
        @click="$emit('select-layer', layer.id)"
      >
        <span>{{ shortLabel(layer.id) }}</span>
        <strong>{{ layer.label }}</strong>
      </button>
    </div>

    <div class="ocean-legend">
      <span v-for="item in legend" :key="item.label">
        <i :style="{ background: item.color }"></i>
        {{ item.label }}
      </span>
    </div>

    <article v-if="selected" class="ocean-feature-card">
      <div class="feature-card-topline">
        <span>{{ selectedKindLabel }}</span>
        <small>{{ selectedMeta }}</small>
      </div>
      <h3>{{ selectedFeature.name }}</h3>
      <p>{{ selectedSummary }}</p>
      <div class="ocean-fact-grid">
        <span v-for="fact in selectedFacts" :key="fact.label">
          <small>{{ fact.label }}</small>
          <strong>{{ fact.value }}</strong>
        </span>
      </div>
      <div v-if="currentMode && selectedFeature.impactTags?.length" class="ocean-current-tags">
        <span v-for="tag in selectedFeature.impactTags" :key="tag">{{ tag }}</span>
      </div>
      <p v-if="currentMode && selectedFeature.textbookNote" class="ocean-textbook-note">
        {{ selectedFeature.textbookNote }}
      </p>
      <div class="preview-actions">
        <button class="primary-btn" @click="$emit('focus-feature', selected)">聚焦海域</button>
      </div>
    </article>
    <article v-else class="ocean-empty-card">
      <span>{{ activeCopy.eyebrow }}</span>
      <h3>先打开海洋图层，再选择一条海洋案例。</h3>
      <p>切换洋流、海沟、海岭、海盆或珊瑚礁时只改变图层显示；点击列表中的具体对象后才会聚焦地球。</p>
    </article>

    <div class="ocean-feature-list">
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
  layers: { type: Array, default: () => [] },
  activeLayer: { type: String, default: 'currents' },
  features: { type: Array, default: () => [] },
  overlays: { type: Object, default: () => ({}) },
  selectedFeature: { type: Object, default: null }
})

defineEmits(['select-layer', 'focus-feature'])

const layerCopy = {
  depth: {
    eyebrow: 'Ocean body',
    title: '把大洋本身当成一层地貌来看。',
    description: '深海盆地、边缘海和极地海域用不同尺度的蓝色体块呈现，保留海岸线的可读性。'
  },
  currents: {
    eyebrow: 'Moving heat',
    title: '把世界主要洋流变成一张会流动的地理图。',
    description: '暖流、寒流和季风洋流共同搬运热量、水汽和营养盐，解释气候、渔场、荒漠和航线。'
  },
  trenches: {
    eyebrow: 'Deep scars',
    title: '海沟像地球表面的深色裂缝。',
    description: '俯冲边界用暗紫裂缝和内缘高光呈现，让深海地形更有厚度。'
  },
  ridges: {
    eyebrow: 'New crust',
    title: '海岭是海底扩张留下的脊线。',
    description: '青色脊线和扩张刻度让洋壳生成过程变得可见。'
  },
  basins: {
    eyebrow: 'Abyssal fields',
    title: '海盆以深蓝等深线沉入地球表面。',
    description: '软性的深海斑块和轮廓环显示大洋盆地的空间范围。'
  },
  reefs: {
    eyebrow: 'Shallow life',
    title: '珊瑚礁在浅海边缘发光。',
    description: '浅青和礁金色斑块强调暖水生态系统与海岸、岛链的关系。'
  }
}

const visibleLayers = computed(() => props.layers.filter((layer) => layer.id !== 'depth'))
const activeLayerInfo = computed(() => props.layers.find((layer) => layer.id === props.activeLayer) || visibleLayers.value[0])
const activeCopy = computed(() => layerCopy[props.activeLayer] || layerCopy.currents)
const currentMode = computed(() => props.activeLayer === 'currents')
const featureItems = computed(() => {
  if (props.activeLayer === 'depth') {
    return props.features.map((feature) => ({ kind: 'ocean', layer: 'depth', feature }))
  }
  return (props.overlays[props.activeLayer] || []).map((feature) => ({
    kind: 'overlay',
    layer: props.activeLayer,
    feature
  }))
})
const selected = computed(() => props.selectedFeature || null)
const selectedFeature = computed(() => selected.value?.feature || {})
const selectedKey = computed(() => selected.value ? `${selected.value.kind}-${selected.value.feature.id}` : '')
const selectedKindLabel = computed(() => selected.value?.kind === 'ocean' ? '大洋区域' : activeLayerInfo.value?.label || '海洋图层')
const selectedMeta = computed(() => {
  const feature = selectedFeature.value
  if (selected.value?.kind === 'ocean') return feature.avg_depth || feature.area || feature.type
  if (currentMode.value) return `${currentKindLabel(feature.kind)} · ${feature.basin}`
  if (feature.kind) return feature.kind === 'warm' ? '暖流' : '寒流'
  if (feature.radius) return '面状海域'
  return '线性海底结构'
})
const selectedSummary = computed(() =>
  currentMode.value
    ? selectedFeature.value.effect || activeCopy.value.description
    : selectedFeature.value.significance || selectedFeature.value.description || activeCopy.value.description
)
const selectedFacts = computed(() => {
  const feature = selectedFeature.value
  if (selected.value?.kind === 'ocean') {
    return [
      { label: '面积', value: feature.area },
      { label: '平均深度', value: feature.avg_depth },
      { label: '最大深度', value: feature.max_depth }
    ].filter((item) => item.value)
  }
  if (currentMode.value) {
    return [
      { label: '类型', value: currentKindLabel(feature.kind) },
      { label: '洋盆', value: feature.basin },
      { label: '流向', value: feature.direction },
      { label: '来源', value: feature.source },
      { label: '节点', value: `${feature.path?.length || 0}` },
      { label: '系统', value: feature.system }
    ].filter((item) => item.value).slice(0, 6)
  }
  if (feature.path) {
    return [
      { label: '节点', value: `${feature.path.length}` },
      { label: '类型', value: selectedMeta.value },
      { label: '图层', value: activeLayerInfo.value?.label }
    ]
  }
  return [
    { label: '中心', value: `${feature.center?.[0]}° / ${feature.center?.[1]}°` },
    { label: '半径', value: `${feature.radius}` },
    { label: '图层', value: activeLayerInfo.value?.label }
  ]
})
const legend = computed(() => {
  if (props.activeLayer === 'currents') {
    return [
      { label: '暖流：增温增湿', color: '#f2d98d' },
      { label: '寒流：降温减湿 / 上升流', color: '#7dd3fc' },
      { label: '季风洋流：季节转向', color: '#b9f7ff' },
      { label: '方向粒子与影响场', color: '#ffffff' }
    ]
  }
  if (props.activeLayer === 'trenches') {
    return [
      { label: '深海裂缝', color: '#6d5dfc' },
      { label: '俯冲阴影', color: '#160f3f' }
    ]
  }
  if (props.activeLayer === 'ridges') {
    return [
      { label: '海岭脊线', color: '#63f7d6' },
      { label: '扩张刻度', color: '#d8fff6' }
    ]
  }
  if (props.activeLayer === 'basins') {
    return [
      { label: '深海盆地', color: '#143a6b' },
      { label: '等深线', color: '#7dd3fc' }
    ]
  }
  return [
    { label: '礁体浅滩', color: '#8fffe3' },
    { label: '暖水生态', color: '#f2d98d' }
  ]
})

function shortLabel(id) {
  if (id === 'currents') return '流'
  if (id === 'trenches') return '沟'
  if (id === 'ridges') return '岭'
  if (id === 'basins') return '盆'
  if (id === 'reefs') return '礁'
  return '洋'
}

function itemLine(item) {
  const feature = item.feature
  if (item.kind === 'ocean') return feature.avg_depth || feature.area
  if (item.layer === 'currents') return `${currentKindLabel(feature.kind)} · ${feature.effect}`
  if (feature.kind) return feature.kind === 'warm' ? '暖流输热' : '寒流降温'
  if (feature.path) return `${feature.path.length} 个路径节点`
  return feature.center ? `${feature.center[0]}° / ${feature.center[1]}°` : ''
}

function itemColor(item) {
  if (item.layer === 'currents') return item.feature.kind === 'warm' ? '#f2d98d' : '#7dd3fc'
  if (item.layer === 'trenches') return '#6d5dfc'
  if (item.layer === 'ridges') return '#63f7d6'
  if (item.layer === 'basins') return '#2466a8'
  if (item.layer === 'reefs') return '#8fffe3'
  return '#4aa7c7'
}

function currentKindLabel(kind) {
  if (kind === 'warm') return '暖流'
  if (kind === 'cold') return '寒流'
  if (kind === 'seasonal') return '季风洋流'
  return '洋流'
}
</script>
