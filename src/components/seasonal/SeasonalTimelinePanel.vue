<template>
  <section class="seasonal-earth-panel glass-card">
    <div class="panel-label">
      <span>季节系统模拟</span>
      <small>{{ active.label }} · {{ active.seasonLabel }}</small>
    </div>

    <article class="seasonal-panel-hero">
      <span>{{ active.directPointLabel }}直射</span>
      <h2>太阳直射 → 雨带气压 → 季风洋流 → 区域结果</h2>
      <p>{{ active.logicSteps[3].description }}</p>
      <div class="seasonal-hero-metrics">
        <b>{{ active.solarDirectLatitude }}°</b>
        <small>直射纬度</small>
        <b>{{ active.rainBelt.latRange[0] }}° - {{ active.rainBelt.latRange[1] }}°</b>
        <small>雨带范围</small>
      </div>
    </article>

    <section class="seasonal-control-block">
      <input
        class="seasonal-month-slider"
        type="range"
        min="1"
        max="12"
        step="1"
        :value="active.month"
        aria-label="选择月份"
        @input="$emit('select-month', Number($event.target.value))"
      >
      <div class="seasonal-month-track">
        <button
          v-for="month in panelMonths"
          :key="month.month"
          :class="{ active: active.month === month.month }"
          @click="$emit('select-month', month.month)"
        >
          {{ month.label }}
        </button>
      </div>
    </section>

    <section class="seasonal-logic-steps">
      <article v-for="(step, index) in active.logicSteps" :key="step.kind" :class="`step-${step.kind}`">
        <span>{{ index + 1 }}</span>
        <strong>{{ step.title }}</strong>
        <p>{{ step.description }}</p>
      </article>
    </section>

    <section class="seasonal-belt-board">
      <article>
        <span>太阳能量带</span>
        <strong>{{ active.sunBelt.label }}</strong>
        <small>{{ active.sunBelt.latRange[0] }}° 至 {{ active.sunBelt.latRange[1] }}°</small>
      </article>
      <article>
        <span>热带雨带</span>
        <strong>{{ active.rainBelt.label }}</strong>
        <small>{{ active.rainBelt.latRange[0] }}° 至 {{ active.rainBelt.latRange[1] }}°</small>
      </article>
      <article v-for="belt in active.pressureBelts.slice(0, 2)" :key="belt.id">
        <span>气压带</span>
        <strong>{{ belt.label }}</strong>
        <small>{{ belt.latRange[0] }}° 至 {{ belt.latRange[1] }}°</small>
      </article>
    </section>

    <section class="seasonal-flow-list">
      <article v-for="wind in active.monsoonSystems" :key="wind.id">
        <span>{{ wind.role === 'summer-monsoon' ? '夏季风' : '冬季风' }}</span>
        <strong>{{ wind.label }}</strong>
        <small>{{ directionLabel(wind.direction) }} · {{ wind.effect }}</small>
      </article>
      <article v-for="current in active.seasonalCurrents" :key="current.id">
        <span>{{ current.kind === 'cold' ? '寒流/上升流' : '暖流' }}</span>
        <strong>{{ current.label }}</strong>
        <small>{{ current.note }}</small>
      </article>
    </section>

    <section class="seasonal-impact-grid">
      <article v-for="impact in active.regionalImpacts" :key="impact.id">
        <i :style="{ background: impact.color }"></i>
        <strong>{{ impact.label }}</strong>
        <p>{{ impact.effect }}</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { seasonalMonthByNumber, seasonalMonths } from '../../data/seasonalSystems'

const props = defineProps({
  months: { type: Array, default: () => [] },
  activeMonth: { type: Number, default: 7 }
})

defineEmits(['select-month'])

const active = computed(() => {
  const month = props.months.find((item) => item.month === props.activeMonth)
  return month?.sunBelt && month?.rainBelt && month?.logicSteps?.length ? month : seasonalMonthByNumber(props.activeMonth)
})
const panelMonths = computed(() => {
  const completeMonths = props.months.filter((month) => month?.sunBelt && month?.rainBelt)
  return completeMonths.length === 12 ? completeMonths : seasonalMonths
})

function directionLabel(direction) {
  if (direction === 'ocean-to-land') return '海洋吹向陆地'
  if (direction === 'land-to-ocean') return '陆地吹向海洋'
  return '风向转换'
}
</script>
