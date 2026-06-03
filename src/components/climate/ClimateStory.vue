<template>
  <section class="climate-story glass-card">
    <div class="climate-story-heading">
      <p class="eyebrow">Climate Story</p>
      <h2>为什么会形成这种气候</h2>
      <p>{{ climate.formation_reason }}</p>
    </div>

    <div class="climate-story-flow">
      <article
        v-for="(step, index) in climate.story_steps"
        :key="`${step.title}-${index}`"
        class="climate-story-step"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.text }}</p>
        <small>{{ factorLabel(step.factor) }}</small>
      </article>
    </div>
  </section>
</template>

<script setup>
import { climateFactors } from '../../data/climate'

defineProps({
  climate: { type: Object, required: true }
})

function factorLabel(code) {
  return climateFactors.find((factor) => factor.code === code)?.label || code
}
</script>

<style scoped>
.climate-story {
  overflow: hidden;
  border-radius: 8px;
  padding: clamp(22px, 4vw, 34px);
}

.climate-story-heading {
  display: grid;
  grid-template-columns: minmax(0, .56fr) minmax(280px, .44fr);
  gap: 24px;
  align-items: end;
}

.climate-story-heading h2 {
  grid-column: 1;
  margin: 0;
  font-size: clamp(32px, 4vw, 54px);
  line-height: 1;
}

.climate-story-heading p:not(.eyebrow) {
  grid-column: 2;
  grid-row: 1 / span 2;
  margin: 0;
  color: rgba(237, 244, 242, 0.72);
  line-height: 1.9;
}

.climate-story-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.climate-story-step {
  position: relative;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(217, 244, 235, 0.12);
  border-radius: 8px;
  background:
    radial-gradient(circle at 12% 0%, rgba(130, 216, 255, 0.14), transparent 36%),
    rgba(5, 13, 17, 0.52);
  padding: 18px;
}

.climate-story-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -12px;
  width: 12px;
  height: 1px;
  background: rgba(231, 196, 107, 0.48);
}

.climate-story-step span {
  color: rgba(231, 196, 107, 0.86);
  font-size: 12px;
  font-weight: 760;
  letter-spacing: .16em;
}

.climate-story-step h3 {
  margin: 20px 0 10px;
  font-size: 22px;
  line-height: 1.12;
}

.climate-story-step p {
  margin: 0;
  color: rgba(237, 244, 242, 0.72);
  line-height: 1.7;
}

.climate-story-step small {
  width: fit-content;
  margin-top: auto;
  border: 1px solid rgba(130, 216, 255, 0.18);
  border-radius: 999px;
  color: #c8f0ff;
  padding: 6px 9px;
}

@media (max-width: 980px) {
  .climate-story-heading,
  .climate-story-flow {
    grid-template-columns: 1fr;
  }

  .climate-story-heading p:not(.eyebrow),
  .climate-story-heading h2 {
    grid-column: auto;
    grid-row: auto;
  }

  .climate-story-step {
    min-height: 0;
  }

  .climate-story-step:not(:last-child)::after {
    display: none;
  }
}
</style>
