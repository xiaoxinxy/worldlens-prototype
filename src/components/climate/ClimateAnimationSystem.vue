<template>
  <section class="climate-animation" :class="[mode, { paused: !motionEnabled }]">
    <div class="climate-animation-header">
      <div>
        <span>{{ climate.type_label }}</span>
        <strong>{{ animationTitle }}</strong>
      </div>
      <button class="mini-btn" @click="motionEnabled = !motionEnabled">
        {{ motionEnabled ? '关闭动画' : '开启动画' }}
      </button>
    </div>

    <div class="climate-stage" aria-hidden="true">
      <svg v-if="mode === 'monsoon'" viewBox="0 0 900 420" role="img">
        <path class="landmass" d="M0 296 C150 250 225 298 338 245 C462 186 560 220 668 172 C760 132 816 178 900 148 L900 420 L0 420 Z" />
        <path class="warm-sea" d="M0 320 C154 286 277 330 412 282 C542 237 684 282 900 230 L900 420 L0 420 Z" />
        <path class="wind-line line-a" d="M90 328 C230 264 326 255 468 206 C586 164 672 143 806 104" />
        <path class="wind-line line-b" d="M56 372 C202 324 350 320 500 270 C636 226 716 192 852 166" />
        <path class="wind-line dry-line" d="M760 80 C620 118 540 126 430 104 C336 86 240 108 150 146" />
        <g class="rain-cluster">
          <line x1="515" y1="170" x2="500" y2="214" />
          <line x1="568" y1="152" x2="550" y2="202" />
          <line x1="625" y1="135" x2="606" y2="188" />
          <line x1="680" y1="118" x2="660" y2="176" />
        </g>
      </svg>

      <svg v-else-if="mode === 'rainfall'" viewBox="0 0 900 420" role="img">
        <path class="forest-canopy canopy-back" d="M0 278 C80 190 155 260 230 182 C310 98 390 226 470 132 C560 28 642 216 735 124 C810 54 850 160 900 116 L900 420 L0 420 Z" />
        <path class="forest-canopy canopy-front" d="M0 320 C88 232 164 304 252 228 C344 148 420 286 520 198 C630 98 690 276 800 202 C848 170 882 190 900 182 L900 420 L0 420 Z" />
        <path class="cloud mass-one" d="M180 110 C210 64 278 68 302 114 C342 102 390 128 392 176 L134 176 C132 136 150 114 180 110 Z" />
        <path class="cloud mass-two" d="M488 90 C528 40 604 54 628 110 C680 98 720 132 724 180 L432 180 C430 130 456 96 488 90 Z" />
        <g class="rain-cluster rain-long">
          <line x1="220" y1="186" x2="198" y2="264" />
          <line x1="280" y1="186" x2="256" y2="284" />
          <line x1="525" y1="190" x2="504" y2="276" />
          <line x1="600" y1="190" x2="576" y2="292" />
          <line x1="672" y1="188" x2="650" y2="262" />
        </g>
        <path class="evap-line evap-one" d="M236 330 C214 292 258 270 238 230" />
        <path class="evap-line evap-two" d="M486 338 C456 294 512 272 494 224" />
        <path class="evap-line evap-three" d="M688 332 C660 288 720 260 698 214" />
      </svg>

      <svg v-else-if="mode === 'ocean'" viewBox="0 0 900 420" role="img">
        <path class="continent-shape" d="M508 54 C628 84 682 170 650 250 C624 314 548 350 468 332 C384 312 328 252 340 166 C350 92 420 34 508 54 Z" />
        <path class="current warm-current" d="M96 304 C192 224 250 188 338 166 C430 142 518 114 630 68" />
        <path class="current cold-current" d="M796 68 C716 116 680 188 708 254 C734 314 690 354 606 386" />
        <path class="wind-line line-a" d="M72 116 C214 90 334 112 468 92 C588 74 690 78 836 50" />
        <path class="wind-line line-b" d="M58 164 C216 136 340 160 490 134 C620 112 718 118 852 92" />
        <circle class="marine-dot dot-one" cx="308" cy="174" r="10" />
        <circle class="marine-dot dot-two" cx="646" cy="86" r="8" />
      </svg>

      <svg v-else-if="mode === 'pressure'" viewBox="0 0 900 420" role="img">
        <path class="desert-ground" d="M0 300 C120 236 234 330 356 270 C478 210 600 306 724 246 C802 210 854 224 900 206 L900 420 L0 420 Z" />
        <ellipse class="pressure-ring ring-one" cx="450" cy="142" rx="250" ry="80" />
        <ellipse class="pressure-ring ring-two" cx="450" cy="142" rx="165" ry="52" />
        <ellipse class="pressure-ring ring-three" cx="450" cy="142" rx="84" ry="26" />
        <path class="down-air air-one" d="M365 92 C344 150 376 188 352 246" />
        <path class="down-air air-two" d="M452 70 C430 144 468 194 446 266" />
        <path class="down-air air-three" d="M535 92 C512 150 548 198 522 250" />
        <path class="dust-line dust-a" d="M86 284 C194 256 250 294 348 270 C454 244 540 272 638 246 C720 226 778 230 850 210" />
        <path class="dust-line dust-b" d="M52 336 C174 306 260 330 386 302 C536 270 636 304 806 260" />
      </svg>

      <svg v-else-if="mode === 'polar'" viewBox="0 0 900 420" role="img">
        <path class="polar-sky" d="M0 0 H900 V420 H0 Z" />
        <path class="ice-sheet" d="M0 268 C146 218 242 286 370 232 C520 168 640 266 772 210 C826 188 868 190 900 178 L900 420 L0 420 Z" />
        <path class="ice-line line-one" d="M110 276 C230 250 320 268 440 244 C570 216 682 232 806 198" />
        <path class="ice-line line-two" d="M162 328 C296 298 408 318 536 286 C654 258 752 270 850 238" />
        <circle class="low-sun" cx="174" cy="112" r="44" />
        <path class="katabatic wind-line" d="M650 176 C594 204 548 238 494 284 C446 324 382 350 300 366" />
      </svg>

      <svg v-else-if="mode === 'highland'" viewBox="0 0 900 420" role="img">
        <path class="highland-base" d="M0 330 L120 310 L230 240 L350 270 L480 116 L640 252 L760 198 L900 302 L900 420 L0 420 Z" />
        <path class="snowcap" d="M480 116 L414 220 L532 186 Z" />
        <path class="snowcap small" d="M760 198 L716 240 L804 232 Z" />
        <path class="wind-line moist-rise" d="M74 324 C178 286 246 268 326 226 C382 196 426 164 472 124" />
        <path class="dry-shadow" d="M552 184 C640 228 702 256 846 270" />
        <g class="rain-cluster">
          <line x1="348" y1="214" x2="326" y2="270" />
          <line x1="402" y1="178" x2="378" y2="244" />
          <line x1="452" y1="146" x2="430" y2="220" />
        </g>
      </svg>

      <svg v-else viewBox="0 0 900 420" role="img">
        <path class="season-land" d="M0 280 C116 238 214 292 338 246 C452 204 544 266 664 220 C762 182 832 214 900 178 L900 420 L0 420 Z" />
        <path class="season-band spring" d="M96 104 C220 54 348 88 450 122 C560 158 668 156 806 98" />
        <path class="season-band summer" d="M72 174 C208 120 326 152 450 190 C582 230 694 222 832 158" />
        <path class="season-band winter" d="M92 246 C230 202 342 232 462 270 C594 310 700 304 842 232" />
        <circle class="season-sun" cx="700" cy="86" r="40" />
      </svg>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  climate: { type: Object, required: true }
})

const motionEnabled = ref(true)

onMounted(() => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || window.innerWidth < 720) motionEnabled.value = false
})

const mode = computed(() => {
  const type = props.climate?.type || ''
  const factors = props.climate?.factors || []
  if (type.includes('monsoon') || factors.includes('monsoon')) return 'monsoon'
  if (type === 'tropical_rainforest') return 'rainfall'
  if (type === 'oceanic' || type === 'mediterranean') return 'ocean'
  if (type.includes('desert')) return 'pressure'
  if (type === 'polar' || type === 'subarctic') return 'polar'
  if (type === 'highland') return 'highland'
  return 'seasonal'
})

const animationTitle = computed(() => {
  const titles = {
    monsoon: '风场如何把海洋水汽带上大陆',
    rainfall: '云层、雨林蒸散与降雨反馈',
    ocean: '洋流和西风如何调节气候',
    pressure: '高压下沉如何制造干旱',
    polar: '冰雪反照率如何锁住寒冷',
    highland: '海拔与山地屏障如何重排水汽',
    seasonal: '四季变化如何塑造环境'
  }
  return titles[mode.value]
})
</script>

<style scoped>
.climate-animation {
  overflow: hidden;
  border: 1px solid rgba(217, 244, 235, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(7, 20, 22, 0.88), rgba(2, 6, 10, 0.94)),
    radial-gradient(circle at 18% 12%, rgba(130, 216, 255, 0.14), transparent 34%);
}

.climate-animation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 0;
}

.climate-animation-header span,
.climate-animation-header strong {
  display: block;
}

.climate-animation-header span {
  color: #e7c46b;
  font-size: 11px;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.climate-animation-header strong {
  margin-top: 5px;
  color: rgba(237, 244, 242, 0.88);
  font-size: 16px;
  line-height: 1.35;
}

.climate-stage {
  height: clamp(260px, 34vw, 420px);
  padding: 8px 12px 16px;
}

svg {
  width: 100%;
  height: 100%;
  display: block;
}

path,
line,
ellipse,
circle {
  vector-effect: non-scaling-stroke;
}

.landmass,
.continent-shape,
.season-land {
  fill: rgba(91, 143, 107, 0.52);
}

.warm-sea {
  fill: rgba(68, 165, 196, 0.28);
}

.forest-canopy {
  fill: rgba(20, 132, 76, 0.52);
}

.canopy-front {
  fill: rgba(42, 164, 101, 0.62);
}

.cloud {
  fill: rgba(223, 238, 238, 0.56);
}

.wind-line,
.current,
.evap-line,
.dust-line,
.ice-line,
.down-air,
.season-band,
.dry-shadow {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.wind-line {
  stroke: rgba(169, 231, 244, 0.78);
  stroke-width: 6;
  stroke-dasharray: 30 28;
  animation: lineFlow 4.8s linear infinite;
}

.dry-line,
.dry-shadow {
  stroke: rgba(231, 196, 107, 0.54);
  stroke-width: 5;
  stroke-dasharray: 18 24;
  animation: lineFlow 5.6s linear infinite reverse;
}

.rain-cluster line {
  stroke: rgba(130, 216, 255, 0.78);
  stroke-width: 5;
  stroke-linecap: round;
  animation: rainFall 1.7s ease-in-out infinite;
}

.rain-long line:nth-child(2n) {
  animation-delay: .25s;
}

.evap-line {
  stroke: rgba(158, 231, 206, 0.5);
  stroke-width: 5;
  stroke-dasharray: 12 20;
  animation: evapRise 4.4s ease-in-out infinite;
}

.current {
  stroke-width: 10;
  stroke-dasharray: 24 24;
  animation: lineFlow 4.2s linear infinite;
}

.warm-current {
  stroke: rgba(231, 144, 76, 0.82);
}

.cold-current {
  stroke: rgba(112, 196, 236, 0.74);
  animation-direction: reverse;
}

.marine-dot {
  fill: rgba(130, 216, 255, 0.8);
  animation: softPulse 2.6s ease-in-out infinite;
}

.desert-ground {
  fill: rgba(205, 160, 72, 0.46);
}

.pressure-ring {
  fill: none;
  stroke: rgba(231, 196, 107, 0.42);
  stroke-width: 4;
  animation: pressureSpin 7s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.ring-two {
  animation-duration: 5.4s;
}

.ring-three {
  animation-duration: 4.2s;
}

.down-air {
  stroke: rgba(240, 210, 140, 0.56);
  stroke-width: 6;
  stroke-dasharray: 20 20;
  animation: downFlow 3.8s linear infinite;
}

.dust-line {
  stroke: rgba(240, 214, 154, 0.42);
  stroke-width: 5;
  stroke-dasharray: 26 22;
  animation: lineFlow 6.2s linear infinite;
}

.polar-sky {
  fill: rgba(20, 56, 82, 0.24);
}

.ice-sheet {
  fill: rgba(226, 242, 246, 0.74);
}

.ice-line {
  stroke: rgba(110, 176, 211, 0.5);
  stroke-width: 4;
  stroke-dasharray: 22 18;
  animation: lineFlow 6s linear infinite;
}

.low-sun {
  fill: rgba(231, 196, 107, 0.42);
  animation: softPulse 4s ease-in-out infinite;
}

.highland-base {
  fill: rgba(119, 142, 118, 0.58);
}

.snowcap {
  fill: rgba(230, 242, 246, 0.82);
}

.snowcap.small {
  fill: rgba(218, 236, 242, 0.72);
}

.moist-rise {
  stroke: rgba(130, 216, 255, 0.74);
}

.season-band {
  stroke-width: 8;
  stroke-dasharray: 34 34;
  animation: lineFlow 6s linear infinite;
}

.spring {
  stroke: rgba(110, 231, 183, 0.64);
}

.summer {
  stroke: rgba(231, 196, 107, 0.68);
}

.winter {
  stroke: rgba(130, 216, 255, 0.58);
}

.season-sun {
  fill: rgba(231, 196, 107, 0.5);
  animation: softPulse 3.8s ease-in-out infinite;
}

.paused * {
  animation-play-state: paused !important;
}

@keyframes lineFlow {
  to {
    stroke-dashoffset: -116;
  }
}

@keyframes rainFall {
  0% {
    opacity: .15;
    transform: translateY(-10px);
  }
  45% {
    opacity: .86;
  }
  100% {
    opacity: .2;
    transform: translateY(18px);
  }
}

@keyframes evapRise {
  0% {
    opacity: .2;
    stroke-dashoffset: 44;
  }
  70% {
    opacity: .72;
  }
  100% {
    opacity: .18;
    stroke-dashoffset: -36;
  }
}

@keyframes pressureSpin {
  50% {
    transform: rotate(7deg) scale(1.025);
    opacity: .78;
  }
}

@keyframes downFlow {
  to {
    stroke-dashoffset: 80;
  }
}

@keyframes softPulse {
  50% {
    opacity: .9;
    transform: scale(1.08);
  }
}

@media (max-width: 720px) {
  .climate-animation-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
