# Global Ocean Currents Design

## Goal

Upgrade the existing Ocean Exploration current layer into a focused global currents experience. The feature should feel like a vivid, interactive geography lesson: major warm and cold currents are visible on the globe, selectable from the panel, and explained in terms of direction, ocean basin, nearby regions, and climate or resource effects.

The result must not look like a few simple glowing lines. Currents need layered visual mass, direction, particles, influence fields, and selected-current emphasis.

## Scope

This is an enhancement inside the existing `?mode=ocean` experience. It does not create a separate route or standalone classroom page.

The current layer will cover representative world currents commonly taught in geography contexts, including:

- Atlantic: Gulf Stream, North Atlantic Drift, Canary Current, Labrador Current, Brazil Current, Benguela Current.
- Pacific: Kuroshio Current, Oyashio Current, California Current, Peru/Humboldt Current, East Australian Current, West Australian Current.
- Indian Ocean: Agulhas Current, Somali Current, South Equatorial Current, monsoon-influenced current behavior.
- Equatorial and global system: North Equatorial Current, South Equatorial Current, Equatorial Countercurrent, Antarctic Circumpolar Current.

Each current entry should include Chinese display text, English name where useful, warm/cold classification, ocean basin, path coordinates, short textbook-style explanation, and impact tags such as warming and moistening, cooling and drying, fog, fisheries, deserts, navigation, storms, or monsoon reversal.

## User Experience

The Ocean Exploration panel keeps the existing layer tabs. When `洋流 / 洋流` is active, the panel becomes a current atlas:

- A stronger hero block explains that currents move heat, moisture, nutrients, and ships.
- The selected card shows the current name, warm/cold type, basin, source or direction, and a concise effect explanation.
- Fact cells show route nodes, type, basin, and main effect.
- The list groups visually by current type and gives readable one-line effects, for example:
  - Brazil Current: warms and moistens eastern South America.
  - Peru Current: cools and dries the west coast of South America and supports rich fishing grounds.
  - Benguela Current: cools southwest Africa and helps shape the Namib coastal desert.
  - North Atlantic Drift: carries warmth toward western Europe.

The user can click any current in the list or on the globe. Selection should focus the camera and update the selected card.

## Globe Visual Design

The current layer uses a richer visual grammar than static lines:

- Warm currents render as amber-gold broad ribbons with inner white cores and trailing heat particles.
- Cold currents render as cyan-blue ribbons with deeper outer shadow bands and mist-like particle chains.
- Each current has directional bead particles moving along the path.
- Selected current gains a large focus beacon, a thicker ribbon, brighter leading particles, and an influence field around the middle of the path.
- Important currents can include translucent impact washes:
  - Warm/moist zones for warm currents.
  - Cold/dry or upwelling zones for cold currents.
  - A stronger wraparound treatment for Antarctic Circumpolar Current.

The visual should remain readable with multiple currents on at once. Non-selected currents stay visible but subdued; selected current gets the dramatic foreground treatment.

## Data Model

Extend current overlay objects with optional fields:

- `name_en`
- `basin`
- `system`
- `kind`: `warm`, `cold`, or `seasonal`
- `direction`
- `source`
- `effect`
- `impactTags`
- `textbookNote`
- `influence`: optional center/radius/tint metadata for impact washes

The existing `path` array remains the rendering backbone so EarthScene can continue using the same overlay contract.

## Components

`src/data/ocean.js`

- Expand `oceanOverlays.currents` with the major global currents.
- Add explanatory fields and preserve existing schema compatibility.

`src/components/ocean/OceanPanel.vue`

- Specialize the selected card, facts, legend, and list row text when `activeLayer === 'currents'`.
- Keep other ocean layers unchanged.

`src/components/EarthScene.vue`

- Upgrade `createOceanCurrentVisual` to use richer current geometry:
  - wide glow tube
  - inner core
  - edge wake or secondary ribbon
  - animated directional particles
  - selected-current influence wash and beacon
- Keep hit testing through `oceanFeature` intact.

`scripts/dynamics-ocean-data.test.mjs`

- Assert the current dataset contains the required representative currents and explanatory fields.

`scripts/dynamics-ocean-modes.test.mjs`

- Assert the scene layer includes the richer current visual primitives, not only a single tube.

## Non-Goals

- No live oceanographic data.
- No exact scientific current velocity simulation.
- No new route or separate textbook page.
- No complex timeline or seasonal animation beyond metadata and optional Somali/monsoon wording.

## Testing

Verification should include:

- Data contract test for required currents and impact explanations.
- Mode contract test for current visual primitives.
- Production build.
- Browser QA for `?mode=ocean&ocean=currents`, selecting at least Brazil Current, Peru Current, Benguela Current, and North Atlantic Drift.
- Screenshot review to ensure currents have visual mass, particles, and selected-current emphasis.

## Spec Self-Review

- No unresolved markers remain.
- Scope is limited to the existing Ocean Exploration current layer.
- The data contract keeps the existing `path` field, so existing selection and rendering flow can be extended without replacing the ocean module.
- The design explicitly rejects simple line-only visuals and defines concrete visual primitives.
