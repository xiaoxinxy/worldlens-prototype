# Global Ocean Currents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Ocean Exploration current layer into a global current atlas with textbook-style explanations and rich globe visuals.

**Architecture:** Keep the existing `?mode=ocean&ocean=currents` route and overlay contract. Extend current data in `src/data/ocean.js`, specialize the current panel in `src/components/ocean/OceanPanel.vue`, and enrich current rendering in `src/components/EarthScene.vue`.

**Tech Stack:** Vue 3, Three.js, Vite, Node test scripts.

---

### Task 1: Data Contract

**Files:**
- Modify: `scripts/dynamics-ocean-data.test.mjs`
- Modify: `src/data/ocean.js`

- [ ] **Step 1: Write failing data assertions**

Add required-current and metadata assertions to `scripts/dynamics-ocean-data.test.mjs`:

```js
const requiredCurrents = [
  'gulf-stream',
  'north-atlantic-drift',
  'canary-current',
  'labrador-current',
  'brazil-current',
  'benguela-current',
  'kuroshio',
  'oyashio',
  'california-current',
  'humboldt',
  'east-australian-current',
  'west-australian-current',
  'agulhas-current',
  'somali-current',
  'north-equatorial-current',
  'south-equatorial-current',
  'equatorial-countercurrent',
  'antarctic-circumpolar'
]

const currents = oceanOverlays.currents
const currentIds = new Set(currents.map((current) => current.id))
for (const id of requiredCurrents) assert.ok(currentIds.has(id), `${id} must be included`)
for (const current of currents) {
  assert.ok(['warm', 'cold', 'seasonal'].includes(current.kind), `${current.id} must classify current type`)
  assert.ok(current.basin, `${current.id} must name an ocean basin`)
  assert.ok(current.effect && current.effect.length >= 8, `${current.id} must explain its effect`)
  assert.ok(Array.isArray(current.impactTags) && current.impactTags.length >= 2, `${current.id} must include impact tags`)
  assert.ok(Array.isArray(current.path) && current.path.length >= 3, `${current.id} must have a renderable path`)
}
```

- [ ] **Step 2: Run red test**

Run: `node scripts/dynamics-ocean-data.test.mjs`

Expected: FAIL because the existing current dataset only has a few currents and lacks explanatory fields.

- [ ] **Step 3: Expand current data**

Replace `oceanOverlays.currents` entries with representative global currents. Each object keeps `id`, `name`, `kind`, and `path`, then adds `name_en`, `basin`, `system`, `direction`, `source`, `effect`, `impactTags`, `textbookNote`, and optional `influence`.

- [ ] **Step 4: Run green test**

Run: `node scripts/dynamics-ocean-data.test.mjs`

Expected: PASS.

### Task 2: Panel Current Atlas

**Files:**
- Modify: `src/components/ocean/OceanPanel.vue`

- [ ] **Step 1: Add current-specific panel logic**

Add computed helpers:

```js
const currentMode = computed(() => props.activeLayer === 'currents')
```

Use `effect`, `basin`, `direction`, `source`, `impactTags`, and `textbookNote` in selected summary, fact grid, legend, and list rows when `currentMode` is true.

- [ ] **Step 2: Keep other layers unchanged**

Verify non-current branches still use existing feature/path/radius display logic.

### Task 3: Rich Current Globe Layer

**Files:**
- Modify: `scripts/dynamics-ocean-modes.test.mjs`
- Modify: `src/components/EarthScene.vue`

- [ ] **Step 1: Write failing scene assertions**

Assert that current rendering includes named primitives:

```js
assert.match(earthScene, /function createCurrentInfluenceField/)
assert.match(earthScene, /oceanCurrentWake/)
assert.match(earthScene, /oceanCurrentImpact/)
assert.match(earthScene, /currentParticleCount/)
```

- [ ] **Step 2: Run red test**

Run: `node scripts/dynamics-ocean-modes.test.mjs`

Expected: FAIL because the current layer has not yet exposed those richer visual primitives.

- [ ] **Step 3: Upgrade current rendering**

In `createOceanCurrentVisual`, render each current with:

- a broad warm/cold outer tube
- an inner white or bright core tube
- a secondary wake tube
- more animated direction particles
- selected-current influence field at the path midpoint

Add helper `createCurrentInfluenceField(feature, curve, color, active)` and animate objects tagged `oceanCurrentWake` and `oceanCurrentImpact`.

- [ ] **Step 4: Run green test**

Run: `node scripts/dynamics-ocean-modes.test.mjs`

Expected: PASS.

### Task 4: Verification

**Files:**
- Test commands only.

- [ ] **Step 1: Run full tests**

Run:

```bash
node scripts/dynamics-ocean-data.test.mjs
node scripts/dynamics-ocean-modes.test.mjs
node scripts/worldlens2-data.test.mjs
node scripts/civilization-layers.test.mjs
npm run build
```

Expected: all pass.

- [ ] **Step 2: Browser QA**

Open `http://127.0.0.1:5174/?mode=ocean&ocean=currents`.

Verify:

- page loads without Vite overlay
- console has no relevant app errors
- current list includes Brazil Current, Peru/Humboldt Current, Benguela Current, and North Atlantic Drift
- clicking each current updates selected card and focuses the globe
- screenshot shows layered current ribbons, particles, and selected-current influence field
