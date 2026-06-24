# Dynamics and Ocean Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build visually rich Earth Dynamics and Ocean Exploration modes directly into the existing WorldLens 3D globe.

**Architecture:** Reuse the current `EarthView.vue` route-driven mode system and `EarthScene.vue` Three.js layer architecture. Add two focused side-panel components and fill the already-reserved `oceanMode` / `earthDynamicMode` scene props with real render groups, hit testing, animation, and focus behavior.

**Tech Stack:** Vue 3, Vue Router, Three.js, Vite, existing static data modules in `src/data`.

---

## File Structure

- Create: `src/components/dynamics/EarthDynamicsPanel.vue`
  - Owns Earth Dynamics panel UI, tabs, event/window controls, legends, featured lists, and selected-card presentation.
- Create: `src/components/ocean/OceanPanel.vue`
  - Owns Ocean Exploration panel UI, layer tabs, legends, ocean feature cards, selected feature details, and focus controls.
- Create: `scripts/dynamics-ocean-data.test.mjs`
  - Validates the static data contracts used by the new panels and globe layers.
- Modify: `src/components/AppHeader.vue`
  - Adds navigation entries and active-state checks for `/?mode=dynamics` and `/?mode=ocean`.
- Modify: `src/views/EarthView.vue`
  - Adds route state, selected state, computed filtered data, panel wiring, focus handlers, and scene props/events.
- Modify: `src/components/EarthScene.vue`
  - Adds dynamics and ocean render groups, surface overlays, feature geometry, hit testing, animation, cleanup, and mode visibility rules.
- Modify: `src/assets/styles/base.css`
  - Adds polished panel styling and mode-specific visual treatments.

## Task 1: Data Contract Test

**Files:**
- Create: `scripts/dynamics-ocean-data.test.mjs`

- [ ] **Step 1: Write data assertions**

```js
import assert from 'node:assert/strict'
import {
  earthquakeEvents,
  earthquakeWindows,
  earthDynamicModes,
  majorPlates,
  volcanoFeatures
} from '../src/data/earthDynamics.js'
import { oceanFeatures, oceanLayerTypes, oceanOverlays } from '../src/data/ocean.js'

assert.deepEqual(earthDynamicModes.map((mode) => mode.id), ['earthquakes', 'volcanoes', 'plates'])
assert.ok(earthquakeWindows.length >= 3)
assert.ok(earthquakeEvents.every((event) =>
  event.id && event.name && Number.isFinite(event.lat) && Number.isFinite(event.lng) && Number.isFinite(event.magnitude)
))
assert.ok(volcanoFeatures.every((feature) =>
  feature.id && feature.name && Number.isFinite(feature.lat) && Number.isFinite(feature.lng) && feature.status
))
assert.ok(majorPlates.every((plate) =>
  plate.id && plate.name && Array.isArray(plate.center) && plate.center.length === 2 && Array.isArray(plate.boundary)
))

assert.deepEqual(oceanLayerTypes.map((layer) => layer.id), ['depth', 'currents', 'trenches', 'ridges', 'basins', 'reefs'])
assert.ok(oceanFeatures.length >= 8)
assert.ok(oceanFeatures.every((feature) =>
  feature.id && feature.name && Array.isArray(feature.center) && feature.center.length === 2 && Number.isFinite(feature.radius)
))
for (const layer of ['currents', 'trenches', 'ridges', 'basins', 'reefs']) {
  assert.ok(Array.isArray(oceanOverlays[layer]), `${layer} overlay must be an array`)
  assert.ok(oceanOverlays[layer].length > 0, `${layer} overlay must have visible features`)
}

console.log('dynamics-ocean-data ok')
```

- [ ] **Step 2: Run the test**

Run: `node scripts/dynamics-ocean-data.test.mjs`

Expected: prints `dynamics-ocean-data ok`.

## Task 2: Mode Routing and Panels

**Files:**
- Modify: `src/components/AppHeader.vue`
- Modify: `src/views/EarthView.vue`
- Create: `src/components/dynamics/EarthDynamicsPanel.vue`
- Create: `src/components/ocean/OceanPanel.vue`

- [ ] **Step 1: Add navigation modes**

In `src/components/AppHeader.vue`, add two `modeItems` entries:

```js
{ to: '/?mode=dynamics', label: '地球动态', dynamicsMode: true },
{ to: '/?mode=ocean', label: '海洋探索', oceanMode: true }
```

Add active-state checks:

```js
if (item.dynamicsMode) return route.path === '/' && route.query.mode === 'dynamics'
if (item.oceanMode) return route.path === '/' && route.query.mode === 'ocean'
```

- [ ] **Step 2: Add panel components**

`EarthDynamicsPanel.vue` props and emits:

```js
const props = defineProps({
  modes: { type: Array, default: () => [] },
  activeLayer: { type: String, default: 'plates' },
  earthquakeWindows: { type: Array, default: () => [] },
  activeWindow: { type: String, default: '24h' },
  earthquakes: { type: Array, default: () => [] },
  volcanoes: { type: Array, default: () => [] },
  plates: { type: Array, default: () => [] },
  selectedFeature: { type: Object, default: null }
})
defineEmits(['select-layer', 'select-window', 'focus-feature', 'open-terrain'])
```

`OceanPanel.vue` props and emits:

```js
const props = defineProps({
  layers: { type: Array, default: () => [] },
  activeLayer: { type: String, default: 'currents' },
  features: { type: Array, default: () => [] },
  overlays: { type: Object, default: () => ({}) },
  selectedFeature: { type: Object, default: null }
})
defineEmits(['select-layer', 'focus-feature'])
```

- [ ] **Step 3: Wire `EarthView.vue` state**

Add imports:

```js
import {
  earthquakeEvents,
  earthquakeWindows,
  earthDynamicModes,
  getEarthquakes,
  majorPlates,
  volcanoFeatures
} from '../data/earthDynamics'
import { oceanFeatures, oceanLayerTypes, oceanOverlays } from '../data/ocean'
```

Add async components:

```js
const EarthDynamicsPanel = defineAsyncComponent(() => import('../components/dynamics/EarthDynamicsPanel.vue'))
const OceanPanel = defineAsyncComponent(() => import('../components/ocean/OceanPanel.vue'))
```

Add state:

```js
const activeDynamicLayer = ref('plates')
const activeEarthquakeWindow = ref('24h')
const activeDynamicFeature = ref(null)
const activeOceanLayer = ref('currents')
const activeOceanFeature = ref(null)
```

Add computed values:

```js
const dynamicsMode = computed(() => route.query.mode === 'dynamics')
const oceanMode = computed(() => route.query.mode === 'ocean')
const visibleEarthquakes = computed(() => getEarthquakes(activeEarthquakeWindow.value))
```

- [ ] **Step 4: Pass scene props and events**

Add to `EarthScene` in the template:

```vue
:earth-dynamic-mode="dynamicsMode"
:dynamic-layer="activeDynamicLayer"
:earthquake-events="visibleEarthquakes"
:volcano-features="volcanoFeatures"
:plate-features="majorPlates"
:active-dynamic-feature="activeDynamicFeature"
:ocean-mode="oceanMode"
:ocean-layer="activeOceanLayer"
:ocean-features="oceanFeatures"
:ocean-overlays="oceanOverlays"
:active-ocean-feature="activeOceanFeature"
@dynamic-select="handleDynamicSelect"
@ocean-select="handleOceanSelect"
```

Update the default hero guard:

```vue
v-if="!civilizationMode && !terrainMode && !climateMode && !cosmosMode && !dynamicsMode && !oceanMode"
```

Add dynamics/ocean hero copy and side panel branches.

## Task 3: Earth Dynamics Scene Layer

**Files:**
- Modify: `src/components/EarthScene.vue`

- [ ] **Step 1: Create and update render groups**

Call after `addCosmosLayer()` in `onMounted`:

```js
addDynamicLayer()
addOceanLayer()
```

Add watchers:

```js
watch(
  () => [props.earthDynamicMode, props.dynamicLayer, props.earthquakeEvents, props.volcanoFeatures, props.plateFeatures, props.activeDynamicFeature],
  () => updateDynamicLayer(),
  { deep: true }
)

watch(
  () => [props.oceanMode, props.oceanLayer, props.oceanFeatures, props.oceanOverlays, props.activeOceanFeature],
  () => updateOceanLayer(),
  { deep: true }
)
```

- [ ] **Step 2: Build rich dynamics visuals**

Implement:

```js
function addDynamicLayer() {
  if (!earthGroup) return
  dynamicGroup = new Group()
  dynamicGroup.visible = false
  earthGroup.add(dynamicGroup)
  updateDynamicLayer()
}
```

`updateDynamicLayer()` clears children and adds:

- plate surface patches and boundary tubes for `dynamicLayer === 'plates'`
- magnitude-scaled epicenter groups for `dynamicLayer === 'earthquakes'`
- cone/plume markers for `dynamicLayer === 'volcanoes'`

Every clickable group must set:

```js
group.userData.dynamicFeature = { kind: 'plate', feature }
group.userData.dynamicFeature = { kind: 'earthquake', feature }
group.userData.dynamicFeature = { kind: 'volcano', feature }
```

- [ ] **Step 3: Add hit testing**

Add:

```js
function getDynamicHit() {
  if (!props.earthDynamicMode || !dynamicGroup?.visible || !dynamicGroup.children.length) return null
  const hit = raycaster.intersectObjects(dynamicGroup.children, true)
    .find((item) => findDynamicFeature(item.object))
  return hit ? findDynamicFeature(hit.object) : null
}
```

Check dynamic hit before climate/terrain hits in both hover and click handlers.

- [ ] **Step 4: Animate dynamics**

Add `animateDynamicLayer(time)` to pulse earthquake rings, modulate plate arrow opacity, and breathe volcano plume opacity. Call it inside `animate()` after `animateCosmosLayer(time)`.

## Task 4: Ocean Scene Layer

**Files:**
- Modify: `src/components/EarthScene.vue`

- [ ] **Step 1: Build ocean base mood**

Create an ocean overlay shader sphere with deep blue wash, coast-readable alpha, and subtle animated latitude/longitude texture. This is separate from feature geometry and visible only when `props.oceanMode`.

- [ ] **Step 2: Build feature visuals**

Implement distinct visuals:

- Currents: tube ribbons plus animated particle spheres along paths.
- Trenches: dark thick fissure tube, violet glow, and thin white inner edge.
- Ridges: cyan raised spine line plus perpendicular spreading ticks.
- Basins: soft elliptical patches with 2-3 contour rings.
- Reefs: aqua/gold patches with small sparkle points.

Every clickable group must set:

```js
group.userData.oceanFeature = { kind: 'overlay', layer: props.oceanLayer, feature }
group.userData.oceanFeature = { kind: 'ocean', layer: 'depth', feature }
```

- [ ] **Step 3: Add hit testing and animation**

Add `getOceanHit()`, `findOceanFeature()`, and `animateOceanLayer(time)`. Check ocean hit before base globe hit when ocean mode is active.

## Task 5: Styling and Responsive Polish

**Files:**
- Modify: `src/assets/styles/base.css`

- [ ] **Step 1: Add shared panel styles**

Add grouped selectors for:

```css
.dynamics-earth-panel,
.ocean-earth-panel {
  max-height: calc(100vh - 132px);
  overflow: auto;
  border-radius: 8px;
  padding: 16px;
}
```

- [ ] **Step 2: Add mode-specific mood**

Dynamics panel uses amber, lava, icy blue, and dark graphite accents. Ocean panel uses deep blue, cyan, teal, violet, and reef gold accents. Lists, cards, legends, tabs, selected states, and compact mobile layout must be styled.

## Task 6: Verification

**Files:**
- No code changes unless verification reveals defects.

- [ ] **Step 1: Run data test**

Run: `node scripts/dynamics-ocean-data.test.mjs`

Expected: `dynamics-ocean-data ok`.

- [ ] **Step 2: Run existing known data tests**

Run:

```bash
node scripts/worldlens2-data.test.mjs
node scripts/civilization-layers.test.mjs
```

Expected: both complete without assertion failures. If one fails because of unrelated pre-existing workspace changes, capture the exact failure and continue with build.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: Vite build succeeds. Chunk-size warnings are acceptable.

- [ ] **Step 4: Browser QA**

Start dev server and check:

- `http://localhost:5173/?mode=dynamics`
- `http://localhost:5173/?mode=ocean`
- `http://localhost:5173/?layer=terrain`
- `http://localhost:5173/?layer=climate`
- `http://localhost:5173/?mode=cosmos`
- `http://localhost:5173/?mode=civilization&civilization=routes`

Expected: dynamics and ocean modes show rich, animated, clickable globe layers; existing modes still load.

## Self-Review

- Spec coverage: navigation, panels, Earth Dynamics tabs, Ocean layers, data flow, error handling, visual completion, and testing are covered.
- Placeholder scan: no task relies on TBD/TODO/fill-later wording.
- Type consistency: `activeDynamicLayer`, `activeEarthquakeWindow`, `activeOceanLayer`, `dynamicFeature`, and `oceanFeature` are consistently named across tasks.
