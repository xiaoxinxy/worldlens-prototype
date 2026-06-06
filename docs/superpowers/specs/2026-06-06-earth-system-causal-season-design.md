# Earth System Causal Chain and Seasonal Timeline Design

Date: 2026-06-06
Status: Draft for user review

## Goal

Add two connected upgrades to the existing WorldLens globe:

- Earth System Causal Chain: explain why a place or phenomenon exists by linking ocean currents, climate, terrain, ecosystems, and civilization effects.
- Seasonal Timeline: let the user scrub through the year and watch solar position, pressure belts, monsoon behavior, rain belts, and selected seasonal ocean-current changes reshape the globe.

The goal is not to add more isolated menu items. These features should make the existing Earth, ocean, climate, terrain, and civilization modules feel like one explanatory system.

## Product Fit

WorldLens already has rich layers for ocean currents, climate zones, terrain formation, civilization routes, earth dynamics, and cosmos. The next step should connect those layers:

- Ocean currents explain coastal climate, fisheries, fog, deserts, and routes.
- Seasons explain monsoons, rain-belt migration, polar day/night, and seasonal current behavior.
- Terrain explains rain shadows, highland climate, hazards, and settlement corridors.

The features should remain inside the existing `EarthView.vue` globe experience and reuse the current `EarthScene.vue` layer architecture. No backend, live data feed, login, or separate classroom page belongs in this scope.

## Feature 1: Earth System Causal Chain

### User Experience

Add a new explanatory overlay mode that can be reached from the main globe mode menu or from relevant feature cards. The initial entry should be a focused panel called `系统因果链`.

The panel shows a small set of curated cases. The first implementation should include cases that are visually strong and easy to understand:

- Peru / Humboldt Current -> cooling and drying -> Atacama Desert -> upwelling nutrients -> Peru fishing grounds.
- Benguela Current -> cold stable air -> Namib coastal desert -> upwelling ecosystem.
- North Atlantic Drift -> warm moist air -> Western Europe oceanic climate -> milder winters.
- Himalaya / Tibetan Plateau -> uplift and barrier -> monsoon rain concentration -> rain shadow and major rivers.
- Mid-Atlantic Ridge -> seafloor spreading -> new ocean crust -> basin shape and volcanic islands.

Selecting a case updates the panel and globe together. The selected case card should show:

- A concise headline.
- A chain of 4-6 nodes.
- One-sentence explanation per node.
- Source layers used by the chain, such as current, climate, terrain, route, reef, or dynamic layer.
- A `聚焦下一环` control that steps through the chain one node at a time.

### Globe Visuals

The chain should be dramatic and readable:

- Current or wind paths appear as animated ribbons.
- Climate effects appear as translucent regional washes.
- Desert or rainforest zones appear as surface texture patches.
- Fisheries or reef/ecosystem nodes appear as dense particle fields.
- Terrain nodes appear as raised ridges, barriers, or fissure accents.
- Active chain step receives a halo, beacon, and camera focus.

The selected chain should feel like a cause-and-effect light path crossing the Earth, not a static diagram pasted over the UI.

### Data Model

Add `src/data/earthSystems.js` with curated chain definitions:

- `id`
- `title`
- `summary`
- `theme`
- `center`
- `heroLayer`
- `nodes`
- `links`
- `relatedFeatureIds`

Each node should include:

- `id`
- `label`
- `kind`: `current`, `climate`, `terrain`, `ecosystem`, `civilization`, `dynamic`, or `effect`
- `coordinates` or `area`
- `description`
- `visual`: color, radius, line path, particle style, or area role
- optional `target`: existing feature id in ocean, climate, terrain, or dynamic data

Links should describe causal direction:

- `from`
- `to`
- `verb`, such as `cools`, `dries`, `feeds`, `blocks`, `uplifts`, `connects`
- optional `path`

## Feature 2: Seasonal Timeline

### User Experience

Add a month slider that can be shown in a `季节时间轴` panel. It should connect naturally to the existing cosmos controls instead of replacing them.

The panel should include:

- Month slider from January to December.
- Four quick season buttons.
- Active solar direct-latitude readout.
- Active pressure/rain belt explanation.
- Monsoon state card for South Asia and East Asia.
- Optional seasonal-current note for Somali Current and equatorial rain-belt behavior.

This should be accessible as a globe mode, for example `?mode=seasonal`, or as a focused state inside cosmos. I recommend `?mode=seasonal` because the feature combines cosmos, climate, ocean, and civilization; it is broader than the current cosmos-only panel.

### Globe Visuals

The seasonal layer should show:

- Subsolar latitude marker and a bright direct-sun band.
- ITCZ / rain belt as a moving humid ribbon.
- Subtropical high-pressure belts as dry amber bands.
- Summer monsoon arrows moving from ocean to land.
- Winter monsoon arrows moving from land to ocean.
- Polar day/night cap emphasis that follows the selected month.
- Seasonal Somali Current direction change as a highlighted ocean ribbon.

The visuals should be strong but not noisy. Month changes should interpolate smoothly where practical.

### Data Model

Add seasonal metadata to `src/data/seasonalSystems.js`:

- month number
- Chinese label
- solar direct latitude
- northern and southern season labels
- ITCZ latitude range
- subtropical high latitude ranges
- monsoon arrows
- seasonal current notes
- example cases

The seasonal model can be deterministic and educational. It does not need live meteorological data.

## Components

New files:

- `src/data/earthSystems.js`
- `src/data/seasonalSystems.js`
- `src/components/systems/EarthSystemPanel.vue`
- `src/components/seasonal/SeasonalTimelinePanel.vue`

Likely edits:

- `src/components/AppHeader.vue`: add menu entries or grouped access.
- `src/views/EarthView.vue`: add `systemMode`, `seasonalMode`, selected chain, selected step, selected month, and focus handlers.
- `src/components/EarthScene.vue`: add system-chain and seasonal render groups, hit testing, animation, focus behavior, and visibility rules.
- `src/assets/styles/base.css`: add panel styling and responsive layout.

## Routing

Use query-based routing consistent with existing modes:

- `/?mode=system` for Earth System Causal Chain.
- `/?mode=seasonal` for Seasonal Timeline.

The existing ocean, dynamics, cosmos, climate, terrain, and civilization modes should continue working.

## Interaction Flow

System mode:

1. User opens `/?mode=system`.
2. Panel selects the first curated chain.
3. EarthScene renders all nodes and causal links for that chain.
4. User clicks a chain node or presses `聚焦下一环`.
5. Camera focuses the node and panel explanation updates.

Seasonal mode:

1. User opens `/?mode=seasonal`.
2. Default month is the current educational baseline, preferably June for strong monsoon contrast.
3. User drags the month slider.
4. Globe updates solar band, rain belt, high-pressure belts, monsoon arrows, and seasonal current highlights.
5. Panel explains the active month with concrete geography examples.

## Error Handling

- Invalid mode falls back to the normal globe.
- Invalid chain id falls back to the first chain.
- Invalid chain step falls back to the first node.
- Invalid month clamps to 1-12.
- Missing linked feature ids should not break rendering; the node still renders from its own coordinates or area.
- If a seasonal visual has no coordinates, the panel shows the explanation and skips that object.

## Visual Completion Standard

The implementation is not done until:

- System mode shows at least five curated chains.
- Each chain has a visible multi-step path on the globe.
- Active chain step has clear focus, not just a selected row in the panel.
- Seasonal mode visibly changes the globe between January, April, July, and October.
- Monsoon arrows, rain belt, pressure belts, polar caps, and solar direct band are all visually distinct.
- The page remains usable on desktop and mobile viewports.
- The visuals look like layered Earth-system phenomena, not simple line decoration.

## Testing

Add focused data and mode tests:

- Validate every system chain has at least four nodes and directed links.
- Validate node targets either resolve to existing data or provide standalone geometry.
- Validate seasonal data covers all 12 months.
- Validate monsoon arrows and seasonal-current notes exist for representative months.
- Validate `EarthView.vue` exposes `system` and `seasonal` modes.
- Validate `EarthScene.vue` includes render primitives for causal links, active nodes, rain belts, monsoon arrows, and solar bands.

Run:

- `node scripts/earth-system-data.test.mjs`
- `node scripts/seasonal-systems.test.mjs`
- Existing WorldLens data tests.
- `npm run build`

Browser QA:

- Open `/?mode=system`, switch through all curated chains, and step through nodes.
- Open `/?mode=seasonal`, test January, April, July, and October.
- Capture screenshots for one system chain and one seasonal state.
- Confirm console has no app errors and the globe stays nonblank.

## Out of Scope

- Live weather, climate, earthquake, or ocean data.
- Full scientific simulation.
- AI tutor or chatbot.
- Separate lesson pages.
- Account sync or database persistence.
- Exact particle-physics accuracy for winds and currents.

## Recommendation

Implement in two phases:

1. Earth System Causal Chain first. It reuses the newly upgraded ocean currents and immediately makes the project feel more explanatory.
2. Seasonal Timeline second. It is visually strong but touches cosmos, climate, and ocean at once, so it should build on the first phase's shared layer patterns.

## Spec Self-Review

- No placeholder sections remain.
- Scope is limited to two connected globe features.
- The design reuses the existing query-mode and panel architecture.
- The visual requirements explicitly reject simple line-only decoration.
- The data model allows curated educational explanations without requiring live external data.
