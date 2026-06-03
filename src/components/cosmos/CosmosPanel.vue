<template>
  <section class="cosmos-earth-panel glass-card">
    <div class="panel-label">
      <span>地球与宇宙</span>
      <RouterLink to="/gallery">探索索引</RouterLink>
    </div>

    <div class="cosmos-panel-hero">
      <span>{{ activeSeason.directPoint }}直射</span>
      <h2>{{ displayTime }} 北京时间</h2>
      <p>
        太阳直射点位于 {{ activeSeason.directPoint }}，晨昏线会随时间滑过地表，昼夜与季节共同塑造气候节律。
      </p>
    </div>

    <section class="cosmos-control-block">
      <div class="cosmos-control-title">
        <strong>昼夜</strong>
        <small>拖动时间观察受光区</small>
      </div>
      <input
        class="cosmos-time-slider"
        type="range"
        min="0"
        max="24"
        step="0.25"
        :value="stateValue.time"
        aria-label="北京时间"
        @input="update({ time: Number($event.target.value) })"
      >
      <div class="cosmos-time-buttons">
        <button
          v-for="mark in timeMarks"
          :key="mark"
          :class="{ active: Math.round(stateValue.time) === mark }"
          @click="update({ time: mark })"
        >
          {{ formatBeijingTime(mark) }}
        </button>
      </div>
      <p class="cosmos-note">
        直射经度约 {{ sunLongitudeText }}，地球上与太阳方向相对的一侧进入夜晚。
      </p>
    </section>

    <section class="cosmos-control-block">
      <div class="cosmos-control-title">
        <strong>四季</strong>
        <small>地轴倾角决定太阳直射纬度</small>
      </div>
      <div class="cosmos-segment-grid">
        <button
          v-for="season in cosmosSeasons"
          :key="season.id"
          :class="{ active: stateValue.season === season.id }"
          @click="update({ season: season.id })"
        >
          <span>{{ season.label }}</span>
          <small>{{ season.directPoint }}</small>
        </button>
      </div>
      <div class="cosmos-fact-row">
        <span>{{ activeSeason.northernSeason }}</span>
        <span>{{ activeSeason.southernSeason }}</span>
      </div>
      <p class="cosmos-note">{{ activeSeason.climateLink }}</p>
    </section>

    <section class="cosmos-control-block">
      <div class="cosmos-control-title">
        <strong>极昼极夜</strong>
        <small>点击极圈查看原因</small>
      </div>
      <div class="cosmos-segment-grid two">
        <button
          v-for="region in polarRegions"
          :key="region.id"
          :class="{ active: stateValue.polarFocus === region.id }"
          @click="update({ polarFocus: region.id })"
        >
          <span>{{ region.label }}</span>
          <small>{{ Math.abs(region.latitude).toFixed(2) }}°</small>
        </button>
      </div>
      <article class="cosmos-mini-story">
        <strong>{{ activePolar.label }}</strong>
        <p>{{ polarStatus }}</p>
        <small>{{ activePolar.summary }}</small>
      </article>
    </section>

    <section class="cosmos-control-block">
      <div class="cosmos-control-title">
        <strong>月相与潮汐</strong>
        <small>以地球为中心观察引潮方向</small>
      </div>
      <div class="cosmos-segment-grid">
        <button
          v-for="phase in moonPhases"
          :key="phase.id"
          :class="{ active: stateValue.moonPhase === phase.id }"
          @click="update({ moonPhase: phase.id })"
        >
          <span>{{ phase.label }}</span>
          <small>{{ phase.tideLabel }}</small>
        </button>
      </div>
      <article class="cosmos-mini-story tide">
        <strong>{{ activeMoon.label }} · {{ activeTide.label }}</strong>
        <p>{{ activeMoon.summary }}</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  cosmosSeasons,
  formatBeijingTime,
  getSunPositionForState,
  getTideForMoonPhase,
  moonPhaseById,
  moonPhases,
  polarRegionById,
  polarRegions,
  seasonById
} from '../../data/cosmos'

const props = defineProps({
  state: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update'])
const timeMarks = [0, 6, 12, 18]

const stateValue = computed(() => ({
  time: 12,
  season: 'june-solstice',
  moonPhase: 'full',
  polarFocus: 'north',
  ...props.state
}))

const activeSeason = computed(() => seasonById(stateValue.value.season))
const activeMoon = computed(() => moonPhaseById(stateValue.value.moonPhase))
const activeTide = computed(() => getTideForMoonPhase(stateValue.value.moonPhase))
const activePolar = computed(() => polarRegionById(stateValue.value.polarFocus))
const sunPosition = computed(() => getSunPositionForState(stateValue.value))
const displayTime = computed(() => formatBeijingTime(stateValue.value.time))
const sunLongitudeText = computed(() => {
  const longitude = sunPosition.value.subsolarLongitude
  const direction = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(longitude).toFixed(0)}°${direction}`
})
const polarStatus = computed(() => {
  if (stateValue.value.polarFocus === 'north') return activeSeason.value.northPolar
  return activeSeason.value.southPolar
})

function update(patch) {
  emit('update', patch)
}
</script>
