<template>
  <article v-if="place" class="preview-card glass-card">
    <div class="preview-topline">
      <span>{{ place.type }} · {{ place.continent }}</span>
      <button
        class="favorite-dot"
        :class="{ active: isFavorite }"
        :aria-label="isFavorite ? '取消收藏' : '收藏地点'"
        @click="$emit('favorite', place)"
      >
        <span></span>
      </button>
    </div>
    <div v-if="place.parentCountry" class="parent-country">所属国家：{{ place.parentCountry }}</div>
    <h2>{{ place.name }}</h2>
    <p class="intro">{{ place.intro }}</p>

    <div class="coordinate-row" v-if="place.coordinates">
      <span>{{ formatCoordinate(place.coordinates.lat, 'lat') }}</span>
      <span>{{ formatCoordinate(place.coordinates.lng, 'lng') }}</span>
    </div>

    <div class="keyword-list">
      <span v-for="keyword in place.keywords" :key="keyword">{{ keyword }}</span>
    </div>

    <div class="preview-actions">
      <button class="primary-btn" @click="$emit('detail', place)">查看详情</button>
      <button class="ghost-btn" @click="$emit('focus', place)">聚焦此处</button>
      <button class="ghost-btn" @click="$emit('favorite', place)">
        {{ isFavorite ? '已收藏' : '收藏地点' }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { formatCoordinate } from '../utils/geo'

defineProps({
  place: { type: Object, default: null },
  isFavorite: { type: Boolean, default: false }
})

defineEmits(['detail', 'favorite', 'focus'])
</script>
