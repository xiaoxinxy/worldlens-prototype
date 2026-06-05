# WorldLens Earth Dynamics and Ocean Exploration Design

Date: 2026-06-05
Status: Approved direction, pending implementation plan

## Goal

Add two high-impact exploration modes to the existing 3D globe:

- Earth Dynamics: plate motion, earthquakes, and volcanoes.
- Ocean Exploration: currents, trenches, ridges, basins, and reefs.

Both modes must feel like native WorldLens layers, not separate demo pages. The visual bar is high: the globe should show layered phenomena with surface patches, motion, depth, pulses, directional traces, labels, and story panels. A few simple glowing lines are not enough.

## Product Fit

WorldLens already combines Earth, culture, terrain, climate, civilization, and cosmos layers. These two modes extend the same idea:

- Earth Dynamics explains why terrain and hazards exist.
- Ocean Exploration explains how oceans shape climate, routes, ecosystems, and civilization.

The modes should reuse current routes, data files, Three.js globe infrastructure, and right-side panels. No account system, AI features, database migration, or unrelated redesign belongs in this scope.

## Navigation

Add two entries to the existing exploration mode menu:

- Earth Dynamics user-facing label: `/?mode=dynamics`
- Ocean Exploration user-facing label: `/?mode=ocean`

Final UI labels should follow the app's Chinese product language, but this design document keeps labels in English to avoid adding encoding noise while the repository still has mixed terminal rendering behavior.

The existing Earth, terrain, climate, civilization, and cosmos modes keep their current behavior. Only one major mode should dominate the globe at a time, so dynamics and ocean mode should suppress unrelated terrain, climate, civilization, and hotspot overlays unless explicitly reused inside their own visuals.

## Earth Dynamics Mode

### Panel

Create an Earth Dynamics side panel with three tabs:

- Plate motion
- Earthquakes
- Volcanoes

The panel shows a strong header story, a compact legend, a featured item list, and a selected detail card. The selected card should explain the phenomenon and offer deep links when available:

- Volcano entries link to related terrain detail when an id matches terrain data.
- Plate entries can focus the globe on the plate center.
- Earthquake entries focus the quake epicenter and show magnitude/depth context.

### Globe Visuals

Plate motion should include:

- Semi-transparent plate surface regions or broad tinted boundary bands.
- Thick boundary curves with varied color/opacity for collision, subduction, spreading, or transform context where data allows.
- Motion arrows that feel attached to the plate surface, not floating UI decals.
- A subtle slow drift/pulse animation so the layer feels alive.

Earthquakes should include:

- Epicenter cores scaled by magnitude.
- Expanding pulse rings on the globe surface.
- Depth/magnitude color differences.
- Window filters for 24h, 7d, and 30d using existing `earthquakeWindows`.

Volcanoes should include:

- Cone or plume markers with height/halo based on active, dormant, or supervolcano status.
- Warm atmospheric glow at active/supervolcano sites.
- Clickable markers with photo-backed story cards.

## Ocean Exploration Mode

### Panel

Create an Ocean Exploration side panel with layer tabs:

- Currents
- Trenches
- Ridges
- Basins
- Reefs

The panel shows the active layer story, a legend, featured ocean/sea cards, and selected feature details. Clicking a feature focuses the globe and surfaces the story in the panel.

### Globe Visuals

The ocean mode should change the mood of the Earth without hiding land completely:

- Add a deep blue ocean wash or bathymetry-like shader overlay.
- Keep coastlines readable with restrained land dimming.
- Make active ocean features look embedded in the water surface.

Layer visuals:

- Currents: flowing animated ribbons with warm/cold color contrast and directional particles.
- Trenches: dark violet/blue fissure lines with inner glow and local shadow.
- Ridges: cyan raised spine lines with small spreading ticks.
- Basins: soft dark-blue elliptical depth patches with subtle contour rings.
- Reefs: shallow aqua/gold luminous patches with smaller sparkle or texture points.

## Data Flow

Use existing data first:

- `src/data/earthDynamics.js`
- `src/data/ocean.js`
- `src/data/terrain.js` for optional volcano-to-terrain links

Expected front-end flow:

1. `EarthView.vue` reads `route.query.mode`.
2. It derives `dynamicsMode` and `oceanMode`.
3. It owns selected tab/item state for both modes.
4. It passes the relevant data and selected state into `EarthScene.vue`.
5. `EarthScene.vue` renders and hit-tests dynamic/ocean groups.
6. Click events update the side panel and focus the globe.

No new backend endpoints are required for the first implementation.

## Component Plan

New components:

- `src/components/dynamics/EarthDynamicsPanel.vue`
- `src/components/ocean/OceanPanel.vue`

Likely edits:

- `src/components/AppHeader.vue`: add menu entries and active-state logic.
- `src/views/EarthView.vue`: add mode state, panels, focus handlers, and event handlers.
- `src/components/EarthScene.vue`: add dynamics/ocean render groups, animation, hit testing, and visibility rules.
- `src/assets/styles/base.css`: add polished panel and mode styling.

## Error Handling

If data is missing or a feature cannot be linked:

- The panel should show a graceful empty card, not break the globe.
- Missing image assets should fall back to existing space/earth texture or local cover helpers.
- Invalid layer ids should fall back to the first tab in that mode.
- Click hit testing should never block base globe interaction outside the active mode.

## Visual Completion Standard

The implementation is not done until:

- Dynamics mode has at least one rich visual for each tab: plates, earthquakes, volcanoes.
- Ocean mode has distinct visuals for currents, trenches, ridges, basins, and reefs.
- Each mode has a coherent color/material mood, not isolated neon strokes.
- Animations are visible but controlled: no noisy flashing, no unreadable clutter.
- Markers and paths are clickable where the panel implies they are clickable.
- Desktop and mobile layouts keep the side panel usable and the globe visible.

## Testing

Run:

- `npm run build`
- Existing data validation scripts if they still pass in the current workspace.

Visual QA:

- Open the app in the browser.
- Check `/?mode=dynamics` and switch all three tabs.
- Check `/?mode=ocean` and switch all five tabs.
- Verify the globe is nonblank, animated, and framed correctly.
- Verify clicking a dynamic or ocean feature updates the right-side panel.
- Verify existing terrain, climate, civilization, cosmos, gallery, and detail routes still load.

## Out of Scope

- AI-generated guide or chatbot.
- Real-time USGS/NOAA data.
- Backend database migration.
- User login and multi-user persistence.
- Full mobile redesign beyond keeping the panels usable.
