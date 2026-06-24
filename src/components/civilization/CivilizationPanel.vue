<template>
  <section class="civilization-panel glass-card">
    <div class="panel-label">
      <span>文明探索</span>
      <small>{{ activeLayer?.label }}</small>
    </div>

    <div class="civilization-layer-tabs">
      <button
        v-for="layer in layers"
        :key="layer.id"
        :class="{ active: layer.id === activeLayerId }"
        @click="$emit('select-layer', layer.id)"
      >
        <span>{{ layer.shortLabel }}</span>
        <strong>{{ layer.label }}</strong>
      </button>
    </div>

    <RoutePanel
      v-if="activeLayerId === 'routes'"
      embedded
      :routes="routes"
      :selected-route="selectedRoute"
      :active-node-index="activeNodeIndex"
      :is-playing="isPlaying"
      @select-route="$emit('select-route', $event)"
      @start="$emit('start')"
      @pause="$emit('pause')"
      @resume="$emit('resume')"
      @previous="$emit('previous')"
      @next="$emit('next')"
      @select-node="$emit('select-node', $event)"
    />

    <template v-else>
      <article class="civilization-summary">
        <span>{{ activeLayer?.eyebrow }}</span>
        <h2>{{ activeLayer?.title }}</h2>
        <p>{{ activeLayer?.description }}</p>
      </article>

      <div class="civilization-legend" :class="{ compact: activeLayerId === 'language' }">
        <span
          v-for="item in legend"
          :key="item.label"
        >
          <i :style="{ background: item.color }"></i>
          {{ item.label }}
        </span>
      </div>

      <div class="civilization-country-list">
        <button
          v-for="metric in featuredMetrics"
          :key="metric.id"
          @click="$emit('focus-country', metric)"
        >
          <i :style="{ background: metricColor(metric) }"></i>
          <strong>{{ metric.name }}</strong>
          <small>{{ metricLine(metric) }}</small>
        </button>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  civilizationStyleForCountry,
  getCivilizationLayerLegend,
  topCivilizationCountries
} from '../../data/civilizationLayers'
import RoutePanel from '../routes/RoutePanel.vue'

const props = defineProps({
  layers: { type: Array, default: () => [] },
  activeLayerId: { type: String, default: 'routes' },
  metrics: { type: Object, default: () => ({}) },
  routes: { type: Array, default: () => [] },
  selectedRoute: { type: Object, default: null },
  activeNodeIndex: { type: Number, default: -1 },
  isPlaying: { type: Boolean, default: false }
})

defineEmits([
  'select-layer',
  'focus-country',
  'select-route',
  'start',
  'pause',
  'resume',
  'previous',
  'next',
  'select-node'
])

const activeLayer = computed(() =>
  props.layers.find((layer) => layer.id === props.activeLayerId) || props.layers[0]
)

const legend = computed(() => getCivilizationLayerLegend(props.activeLayerId))
const featuredMetrics = computed(() => topCivilizationCountries(props.metrics, props.activeLayerId, props.activeLayerId === 'language' ? 10 : 8))

function metricLine(metric) {
  if (props.activeLayerId === 'population') return metric.populationLabel
  if (props.activeLayerId === 'language') return `${metric.languageGroupLabel} · ${metric.languageName}`
  if (props.activeLayerId === 'skin-tone') return metric.toneLabel
  return ''
}

function metricColor(metric) {
  return civilizationStyleForCountry(metric, props.activeLayerId).color
}
</script>
