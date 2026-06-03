<template>
  <article class="culture-card" :id="id">
    <div class="culture-visual" v-lazy-bg="{ image: imageUrl, width: 900 }">
      <span></span>
    </div>
    <div class="culture-copy">
      <h3>{{ title }}</h3>
      <p>{{ content }}</p>
    </div>
  </article>
</template>

<script setup>
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

defineProps({
  id: { type: String, default: '' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, required: true }
})
</script>
