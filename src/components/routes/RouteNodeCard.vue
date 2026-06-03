<template>
  <article v-if="node" class="route-node-card">
    <img v-if="node.image" :src="node.image" :alt="node.name" loading="lazy" />
    <div>
      <p>{{ node.country }}</p>
      <h3>{{ node.name }}</h3>
      <span>{{ formatLatLng(node.lat, node.lng) }}</span>
      <p class="node-description">{{ node.description }}</p>
      <a v-if="node.wikiUrl" :href="node.wikiUrl" target="_blank" rel="noreferrer">维基百科</a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  node: { type: Object, default: null }
})

function formatLatLng(lat, lng) {
  const latSuffix = lat >= 0 ? 'N' : 'S'
  const lngSuffix = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${latSuffix} · ${Math.abs(lng).toFixed(2)}°${lngSuffix}`
}
</script>
