<template>
  <section class="terrain-formation" :class="[animationType, { paused: !motionEnabled }]">
    <div class="formation-header">
      <span>{{ terrain?.type_label || '地貌' }}</span>
      <button class="mini-btn" @click="motionEnabled = !motionEnabled">
        {{ motionEnabled ? '关闭动画' : '开启动画' }}
      </button>
    </div>

    <svg viewBox="0 0 900 420" role="img" :aria-label="`${terrain?.name || '地形'}形成动画`">
      <defs>
        <linearGradient id="earthLine" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#9be7ff" />
          <stop offset="55%" stop-color="#7dd3fc" />
          <stop offset="100%" stop-color="#e7c46b" />
        </linearGradient>
        <linearGradient id="greenLayer" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#134e4a" />
          <stop offset="100%" stop-color="#6ee7b7" />
        </linearGradient>
        <linearGradient id="iceLayer" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#e0f2fe" />
          <stop offset="100%" stop-color="#67e8f9" />
        </linearGradient>
      </defs>

      <rect class="formation-sky" x="0" y="0" width="900" height="420" rx="22" />
      <path class="ground-line" d="M70 315 C190 292 315 326 450 306 C590 284 710 304 830 286" />

      <g v-if="animationType === 'mountain'" class="mountain-scene">
        <path class="mass primary" d="M120 318 L260 126 L386 318 Z" />
        <path class="mass secondary" d="M310 318 L474 94 L662 318 Z" />
        <path class="mass tertiary" d="M560 318 L684 166 L800 318 Z" />
        <path class="ridge" d="M260 126 L314 220 L346 186 L386 318" />
        <path class="ridge" d="M474 94 L520 190 L566 148 L662 318" />
      </g>

      <g v-else-if="animationType === 'plateau'" class="plateau-scene">
        <path class="plateau-base" d="M110 318 L174 244 L352 244 L410 186 L688 186 L794 318 Z" />
        <path class="plateau-top" d="M176 244 L352 244 L410 186 L688 186" />
        <path class="strata" d="M162 284 C308 268 472 280 750 246" />
        <path class="strata" d="M206 304 C368 292 540 296 784 272" />
      </g>

      <g v-else-if="animationType === 'river'" class="river-scene">
        <path class="river-bed" d="M126 136 C210 154 196 232 314 220 C434 208 404 308 528 298 C646 288 670 210 792 236" />
        <path class="river-flow" d="M126 136 C210 154 196 232 314 220 C434 208 404 308 528 298 C646 288 670 210 792 236" />
        <circle class="water-pulse" r="8">
          <animateMotion dur="6s" repeatCount="indefinite" path="M126 136 C210 154 196 232 314 220 C434 208 404 308 528 298 C646 288 670 210 792 236" />
        </circle>
      </g>

      <g v-else-if="animationType === 'desert'" class="desert-scene">
        <path class="dune" d="M92 312 C188 220 284 220 378 312" />
        <path class="dune" d="M312 314 C430 188 548 204 688 314" />
        <path class="dune" d="M594 314 C682 242 752 246 820 314" />
        <path class="sand-wind" d="M118 188 C230 170 278 198 384 174" />
        <path class="sand-wind delay" d="M470 146 C560 128 640 164 762 136" />
      </g>

      <g v-else-if="animationType === 'glacier'" class="glacier-scene">
        <path class="ice-sheet" d="M98 304 C184 180 302 206 394 160 C510 104 644 148 800 286 L800 334 L98 334 Z" />
        <path class="crack" d="M330 198 L360 238 L346 284" />
        <path class="crack delay" d="M556 164 L526 226 L578 294" />
        <path class="ice-flow" d="M190 284 C330 250 482 278 708 236" />
      </g>

      <g v-else-if="animationType === 'volcano'" class="volcano-scene">
        <path class="volcano" d="M224 318 L386 124 L482 226 L544 124 L704 318 Z" />
        <path class="lava" d="M458 168 C470 210 442 236 462 282" />
        <path class="lava delay" d="M512 168 C492 212 536 246 516 296" />
        <ellipse class="crater" cx="466" cy="148" rx="76" ry="19" />
      </g>

      <g v-else-if="animationType === 'rainforest'" class="rainforest-scene">
        <path class="canopy wide" d="M112 284 C180 210 244 228 302 188 C372 142 458 190 512 158 C604 102 690 182 802 138 L802 318 L112 318 Z" />
        <path class="canopy mid" d="M150 300 C226 244 300 254 380 218 C484 172 568 224 760 188" />
        <path class="trunks" d="M242 296 L242 214 M380 302 L380 220 M548 304 L548 184 M688 300 L688 190" />
      </g>

      <g v-else-if="animationType === 'canyon'" class="canyon-scene">
        <path class="canyon-wall left" d="M106 140 L320 196 L254 318 L106 318 Z" />
        <path class="canyon-wall right" d="M794 126 L568 198 L636 318 L794 318 Z" />
        <path class="canyon-river" d="M288 318 C390 282 474 344 616 306" />
        <path class="strata" d="M124 190 L304 234 M594 230 L776 178" />
        <path class="strata delay" d="M138 246 L286 272 M612 274 L772 224" />
      </g>

      <g v-else-if="animationType === 'trench'" class="trench-scene">
        <path class="sea-layer" d="M88 170 C244 136 344 188 450 168 C596 140 688 156 814 132 L814 332 L88 332 Z" />
        <path class="trench-depth" d="M254 194 C330 242 372 326 452 338 C548 348 584 236 666 184" />
        <path class="contour" d="M306 224 C400 272 522 272 618 210" />
        <path class="contour delay" d="M344 268 C420 308 512 306 584 252" />
      </g>

      <g v-else class="lake-scene">
        <path class="basin" d="M116 286 C220 218 308 298 420 232 C540 164 650 264 792 198 L792 326 L116 326 Z" />
        <path class="water" d="M166 266 C296 232 390 274 510 232 C626 190 704 226 762 206 L762 304 L166 304 Z" />
        <path class="waterline" d="M180 266 C300 238 398 270 514 234 C620 202 704 226 756 210" />
      </g>
    </svg>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  terrain: { type: Object, default: null }
})

const motionEnabled = ref(true)
const animationType = computed(() => {
  const type = props.terrain?.type || 'lake'
  if (['mountain'].includes(type)) return 'mountain'
  if (type === 'plateau') return 'plateau'
  if (type === 'river') return 'river'
  if (type === 'desert') return 'desert'
  if (type === 'glacier') return 'glacier'
  if (type === 'volcano') return 'volcano'
  if (type === 'rainforest' || type === 'reef') return 'rainforest'
  if (type === 'canyon' || type === 'rift') return 'canyon'
  if (type === 'trench') return 'trench'
  return 'lake'
})

onMounted(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced || window.innerWidth < 720) motionEnabled.value = false
})
</script>

<style scoped>
.terrain-formation {
  overflow: hidden;
  border: 1px solid rgba(217, 244, 235, 0.14);
  border-radius: 8px;
  background:
    radial-gradient(circle at 20% 12%, rgba(130, 216, 255, 0.14), transparent 36%),
    rgba(4, 10, 14, 0.72);
  padding: 14px;
}

.formation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.formation-header span {
  color: #e7c46b;
  font-size: 12px;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

svg {
  width: 100%;
  min-height: 320px;
  display: block;
}

.formation-sky {
  fill: rgba(2, 6, 10, 0.3);
}

.ground-line,
.ridge,
.plateau-top,
.river-bed,
.river-flow,
.dune,
.sand-wind,
.crack,
.ice-flow,
.lava,
.canyon-river,
.strata,
.trench-depth,
.contour,
.waterline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ground-line {
  stroke: rgba(237, 244, 242, 0.2);
  stroke-width: 2;
}

.mass,
.plateau-base,
.ice-sheet,
.volcano,
.canopy,
.canyon-wall,
.sea-layer,
.basin,
.water {
  transform-origin: 450px 320px;
}

.mass,
.volcano {
  fill: rgba(145, 120, 86, 0.34);
  stroke: rgba(231, 196, 107, 0.52);
  stroke-width: 2;
  animation: rise 2.8s cubic-bezier(.2,.7,.2,1) both;
}

.secondary { animation-delay: .18s; }
.tertiary { animation-delay: .32s; }
.ridge {
  stroke: url(#earthLine);
  stroke-width: 3;
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  animation: draw 2.8s 1s ease forwards;
}

.plateau-base {
  fill: rgba(143, 111, 74, 0.34);
  stroke: rgba(231, 196, 107, 0.45);
  stroke-width: 2;
  animation: lift 3.2s cubic-bezier(.18,.8,.2,1) both;
}

.plateau-top,
.strata {
  stroke: rgba(231, 196, 107, 0.56);
  stroke-width: 2;
  stroke-dasharray: 520;
  stroke-dashoffset: 520;
  animation: draw 3s .8s ease forwards;
}

.river-bed {
  stroke: rgba(130, 216, 255, 0.18);
  stroke-width: 22;
}

.river-flow,
.canyon-river {
  stroke: #82d8ff;
  stroke-width: 7;
  stroke-dasharray: 820;
  stroke-dashoffset: 820;
  animation: draw 5.2s ease forwards;
}

.water-pulse {
  fill: #e0f2fe;
  filter: drop-shadow(0 0 12px rgba(130,216,255,.55));
}

.dune {
  stroke: rgba(231, 196, 107, 0.62);
  stroke-width: 3;
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  animation: draw 3.4s ease forwards;
}

.sand-wind {
  stroke: rgba(244, 219, 145, 0.32);
  stroke-width: 2;
  stroke-dasharray: 120 22;
  animation: drift 6s linear infinite;
}

.ice-sheet {
  fill: url(#iceLayer);
  opacity: .45;
  stroke: rgba(224, 242, 254, .7);
  stroke-width: 2;
  animation: fadeIn 2.4s ease both;
}

.crack,
.ice-flow {
  stroke: rgba(8, 47, 73, .7);
  stroke-width: 2;
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: draw 3.6s 1s ease forwards;
}

.crater {
  fill: rgba(2, 6, 10, .55);
  stroke: rgba(248, 220, 143, .66);
  stroke-width: 2;
}

.lava {
  stroke: rgba(248, 180, 94, .72);
  stroke-width: 4;
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  animation: draw 3s 1s ease forwards, pulse 2.4s 3s ease-in-out infinite;
}

.canopy {
  fill: url(#greenLayer);
  opacity: .42;
  stroke: rgba(110, 231, 183, .54);
  stroke-width: 2;
  animation: spread 3.4s ease both;
}

.canopy.mid {
  fill: none;
  opacity: 1;
  stroke: rgba(190, 242, 100, .38);
  stroke-dasharray: 560;
  stroke-dashoffset: 560;
  animation: draw 3s 1s ease forwards;
}

.trunks {
  stroke: rgba(94, 234, 212, .28);
  stroke-width: 4;
}

.canyon-wall {
  fill: rgba(132, 84, 56, .34);
  stroke: rgba(231, 196, 107, .48);
  stroke-width: 2;
  animation: revealWall 3s ease both;
}

.sea-layer {
  fill: rgba(14, 116, 144, .32);
  stroke: rgba(130, 216, 255, .42);
  stroke-width: 2;
}

.trench-depth {
  stroke: rgba(224, 242, 254, .66);
  stroke-width: 5;
  stroke-dasharray: 620;
  stroke-dashoffset: 620;
  animation: sink 3.4s ease both, draw 4s ease forwards;
}

.contour {
  stroke: rgba(130, 216, 255, .32);
  stroke-width: 2;
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  animation: draw 4.4s 1s ease forwards;
}

.basin {
  fill: rgba(94, 83, 62, .26);
  stroke: rgba(231, 196, 107, .35);
  stroke-width: 2;
}

.water {
  fill: rgba(14, 165, 233, .28);
  stroke: rgba(130, 216, 255, .56);
  stroke-width: 2;
  animation: fadeIn 2.6s ease both;
}

.waterline {
  stroke: rgba(224, 242, 254, .5);
  stroke-width: 2;
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  animation: draw 3.2s ease forwards;
}

.delay {
  animation-delay: 1.5s;
}

.paused * {
  animation-play-state: paused !important;
}

@keyframes rise {
  from { transform: translateY(160px) scaleY(.18); opacity: 0; }
  to { transform: translateY(0) scaleY(1); opacity: 1; }
}

@keyframes lift {
  from { transform: translateY(80px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spread {
  from { transform: scaleX(.2); opacity: 0; }
  to { transform: scaleX(1); opacity: .42; }
}

@keyframes revealWall {
  from { transform: translateY(-20px) scaleY(.2); opacity: 0; }
  to { transform: translateY(0) scaleY(1); opacity: 1; }
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
}

@keyframes drift {
  from { stroke-dashoffset: 160; opacity: .15; }
  to { stroke-dashoffset: 0; opacity: .5; }
}

@keyframes pulse {
  50% { opacity: .35; }
}

@keyframes sink {
  from { transform: translateY(-34px); }
  to { transform: translateY(0); }
}
</style>
