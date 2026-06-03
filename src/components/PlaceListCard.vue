<template>
  <article class="place-list-card">
    <RouterLink
      :to="`/place/${place.slug}`"
      :class="['place-card-media', { 'text-cover-media': !place.coverImage }]"
      v-lazy-bg="{ image: place.coverImage, width: 720 }"
    >
      <strong v-if="!place.coverImage">{{ place.name }}</strong>
      <span>{{ place.type }}</span>
    </RouterLink>
    <div class="place-card-body">
      <div class="place-card-kicker">{{ place.continent }}</div>
      <h3>{{ place.name }}</h3>
      <p>{{ place.intro }}</p>
      <div class="keyword-list compact">
        <span v-for="keyword in place.keywords.slice(0, 4)" :key="keyword">{{ keyword }}</span>
      </div>
      <div class="card-actions-row">
        <RouterLink class="text-link" :to="`/place/${place.slug}`">查看详情</RouterLink>
        <button class="mini-btn favorite-action" @click="favoriteStore.toggle(place.id)">
          {{ favoriteStore.has(place.id) ? '已收藏' : '收藏' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useFavoriteStore } from '../stores/favorite'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

defineProps({
  place: { type: Object, required: true }
})

const favoriteStore = useFavoriteStore()
</script>
