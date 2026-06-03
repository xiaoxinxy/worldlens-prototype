<template>
  <section class="route-panel glass-card">
    <div class="panel-label">
      <span>文化路线</span>
      <small>文明传播路径</small>
    </div>

    <div class="route-tabs">
      <button
        v-for="route in routes"
        :key="route.routeId"
        :class="{ active: selectedRoute?.routeId === route.routeId }"
        @click="$emit('select-route', route.routeId)"
      >
        {{ route.name }}
      </button>
    </div>

    <article v-if="selectedRoute" class="route-summary">
      <p class="route-period">{{ selectedRoute.period }}</p>
      <h2>{{ selectedRoute.name }}</h2>
      <p>{{ selectedRoute.intro }}</p>

      <div class="route-meta">
        <span v-for="country in selectedRoute.countries" :key="country">{{ country }}</span>
      </div>
      <div class="keyword-row">
        <span v-for="keyword in selectedRoute.keywords" :key="keyword">{{ keyword }}</span>
      </div>
    </article>

    <RoutePlayer
      :is-playing="isPlaying"
      :active-index="activeNodeIndex"
      :total="selectedRoute?.nodes.length || 0"
      :has-previous="activeNodeIndex > 0"
      :has-next="selectedRoute ? activeNodeIndex < selectedRoute.nodes.length - 1 : false"
      @start="$emit('start')"
      @pause="$emit('pause')"
      @resume="$emit('resume')"
      @previous="$emit('previous')"
      @next="$emit('next')"
    />

    <RouteNodeCard :node="activeNode" />

    <div v-if="selectedRoute" class="route-node-list">
      <button
        v-for="(node, index) in selectedRoute.nodes"
        :key="node.id"
        :class="{ active: index === activeNodeIndex }"
        @click="$emit('select-node', index)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <strong>{{ node.name }}</strong>
        <small>{{ node.country }}</small>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import RouteNodeCard from './RouteNodeCard.vue'
import RoutePlayer from './RoutePlayer.vue'

const props = defineProps({
  routes: { type: Array, default: () => [] },
  selectedRoute: { type: Object, default: null },
  activeNodeIndex: { type: Number, default: -1 },
  isPlaying: { type: Boolean, default: false }
})

defineEmits(['select-route', 'start', 'pause', 'resume', 'previous', 'next', 'select-node'])

const activeNode = computed(() => {
  if (!props.selectedRoute || props.activeNodeIndex < 0) return null
  return props.selectedRoute.nodes[props.activeNodeIndex] || null
})
</script>
