<template>
  <div class="route-player">
    <button class="ghost-btn" :disabled="!hasPrevious" @click="$emit('previous')">上一步</button>
    <button v-if="isPlaying" class="primary-btn" @click="$emit('pause')">暂停</button>
    <button v-else class="primary-btn" @click="$emit(activeIndex >= 0 ? 'resume' : 'start')">
      {{ activeIndex >= 0 ? '继续' : '开始旅程' }}
    </button>
    <button class="ghost-btn" :disabled="!hasNext" @click="$emit('next')">下一步</button>
    <span class="route-step">{{ activeIndex + 1 > 0 ? activeIndex + 1 : 0 }} / {{ total }}</span>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: { type: Boolean, default: false },
  activeIndex: { type: Number, default: -1 },
  total: { type: Number, default: 0 },
  hasPrevious: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false }
})

defineEmits(['start', 'pause', 'resume', 'previous', 'next'])
</script>
