<template>
  <section class="gallery-rail">
    <button
      v-for="item in gallery"
      :key="item.title"
      class="gallery-card"
      :style="{ background: item.gradient }"
      v-lazy-bg="{ image: item.image, variable: '--gallery-image', width: 900 }"
      @click="active = item"
    >
      <span>{{ item.title }}</span>
      <small>{{ item.desc }}</small>
    </button>
  </section>

  <Transition name="modal-fade">
    <div v-if="active" class="modal-backdrop" @click.self="active = null">
      <div class="gallery-modal" :style="{ background: `linear-gradient(180deg, rgba(2,4,7,.1), rgba(2,4,7,.76)), url('${active.image}') center / cover` }">
        <button class="modal-close" @click="active = null">×</button>
        <h3>{{ active.title }}</h3>
        <p>{{ active.desc }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

defineProps({
  gallery: { type: Array, default: () => [] }
})

const active = ref(null)
</script>
