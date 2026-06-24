import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { describe, it } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  getOceanFeature,
  oceanFeatures,
  oceanLayerTypes
} from '../src/data/ocean.js'
import {
  earthDynamicModes,
  majorPlates,
  volcanoFeatures
} from '../src/data/earthDynamics.js'
import { climateZones } from '../src/data/climate.js'
import { culturalRoutes } from '../src/data/culturalRoutes.js'
import { detailProfileForPlace } from '../src/data/detailProfiles.js'
import { coverForPlace, galleryForPlace, placeImages, sectionImageForPlace } from '../src/data/placeImages.js'
import { regions } from '../src/data/regions.js'
import { terrainFeatures } from '../src/data/terrain.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const majorCountryCodes = [
  'CHN',
  'USA',
  'JPN',
  'GBR',
  'FRA',
  'DEU',
  'RUS',
  'ITA',
  'ESP',
  'IND',
  'KOR',
  'AUS',
  'BRA',
  'EGY',
  'TUR',
  'ZAF'
]

const detailSectionKeys = ['geography', 'history', 'food', 'festival', 'architecture', 'lifestyle']
const keyDetailImageTargets = [
  ...majorCountryCodes.map((code) => ({ id: code, place: { geoFeatureId: code, intro: code } })),
  ...regions.map((place) => ({
    id: place.id,
    place: { ...place, geoFeatureId: place.geoFeatureId || place.id, slug: place.slug || place.id }
  })),
  ...oceanFeatures.map((feature) => ({
    id: feature.id,
    place: { ...feature, geoFeatureId: feature.id, slug: feature.id, intro: feature.description || feature.name }
  }))
]

describe('WorldLens 2.0 data foundations', () => {
  it('contains five oceans and the requested major seas', () => {
    const ids = oceanFeatures.map((feature) => feature.id)
    assert.ok(['pacific-ocean', 'atlantic-ocean', 'indian-ocean', 'arctic-ocean', 'southern-ocean'].every((id) => ids.includes(id)))
    assert.ok(['mediterranean-sea', 'caribbean-sea', 'south-china-sea', 'baltic-sea', 'black-sea', 'red-sea', 'arabian-sea', 'bering-sea'].every((id) => ids.includes(id)))
    assert.equal(getOceanFeature('pacific-ocean')?.max_depth, '10,984 m')
  })

  it('defines ocean layer types for currents, depth, trenches, ridges, basins and reefs', () => {
    assert.ok(['currents', 'trenches', 'ridges', 'basins', 'reefs', 'depth'].every((id) => oceanLayerTypes.some((layer) => layer.id === id)))
  })

  it('defines dynamic earth modes, seven major plates and volcano categories', async () => {
    assert.deepEqual(earthDynamicModes.map((mode) => mode.id), ['earthquakes', 'volcanoes', 'plates'])
    assert.ok(['eurasian', 'pacific', 'indo-australian', 'african', 'north-american', 'south-american', 'antarctic'].every((id) => majorPlates.some((plate) => plate.id === id)))
    assert.ok(['active', 'dormant', 'supervolcano'].every((type) => volcanoFeatures.some((volcano) => volcano.status === type)))
    assertRequiredUniqueCovers(majorPlates, 'plate')
    assertRequiredUniqueCovers(volcanoFeatures, 'volcano')
    await assertCoverFilesExist([...majorPlates, ...volcanoFeatures])
    await assertUniqueImageContent([...majorPlates, ...volcanoFeatures], 'dynamic earth cover')
  })

  it('keeps terrain and climate covers local, unique and available', async () => {
    assertRequiredUniqueCovers(terrainFeatures, 'terrain')
    assertRequiredUniqueCovers(climateZones, 'climate')
    await assertCoverFilesExist([...terrainFeatures, ...climateZones])
    await assertUniqueImageContent(terrainFeatures, 'terrain cover')
    await assertUniqueImageContent(climateZones, 'climate cover')
  })

  it('models climate exploration as latitude bands plus typical cases', () => {
    const requiredTypes = new Set(['tropical_rainforest', 'tropical_monsoon', 'temperate_monsoon', 'hot_desert', 'mediterranean', 'oceanic', 'continental', 'subarctic', 'polar', 'highland'])
    const availableTypes = new Set(climateZones.map((zone) => zone.type))
    for (const type of requiredTypes) assert.ok(availableTypes.has(type), `missing climate type ${type}`)

    for (const zone of climateZones) {
      assert.ok(zone.global_distribution?.length > 24, `${zone.id} needs a broad global distribution`)
      assert.ok(zone.global_distribution_label?.length > 2, `${zone.id} needs a distribution label`)
      assert.ok(zone.global_examples?.length >= 3, `${zone.id} needs global examples`)
      assert.ok(zone.global_controls?.length >= 3, `${zone.id} needs global controls`)
      if (zone.type === 'highland') assert.ok(zone.distribution_pattern?.lines?.length >= 1, `${zone.id} needs mountain line geometry`)
      else assert.ok(zone.distribution_pattern?.bands?.length >= 1, `${zone.id} needs latitude band geometry`)
      for (const band of zone.distribution_pattern?.bands || []) {
        assert.ok(Array.isArray(band.lat) && band.lat.length === 2, `${zone.id} band needs lat range`)
        assert.ok(band.lat[0] >= -90 && band.lat[1] <= 90 && band.lat[0] < band.lat[1], `${zone.id} has invalid lat range`)
      }
    }
  })

  it('broadens terrain exploration with typical examples and tectonic modes', () => {
    const ids = terrainFeatures.map((feature) => feature.id)
    assert.ok([
      'san-andreas-fault',
      'yellowstone-caldera',
      'hawaiian-islands',
      'great-lakes',
      'atacama-desert',
      'australian-outback'
    ].every((id) => ids.includes(id)))
    assert.ok(terrainFeatures.length >= 35)

    const tectonicModes = new Set(terrainFeatures.map((feature) => feature.tectonics?.mode).filter(Boolean))
    assert.ok(['collision', 'subduction', 'divergence', 'spreading', 'transform', 'hotspot'].every((mode) => tectonicModes.has(mode)))
  })

  it('keeps required country, region and ocean covers real, local and available', async () => {
    const [countryMeta, countriesGeo] = await Promise.all([
      readJson('public/geo/country-meta.json'),
      readJson('public/geo/countries.geojson')
    ])
    const targets = new Map()
    for (const meta of countryMeta) {
      if (meta.cca3) targets.set(meta.cca3, { geoFeatureId: meta.cca3, name: meta.name?.common || meta.cca3 })
    }
    for (const feature of countriesGeo.features) {
      if (feature.id) targets.set(feature.id, { geoFeatureId: feature.id, name: feature.properties?.name_en || feature.properties?.name || feature.id })
    }

    const majorCountryCovers = majorCountryCodes.map((code) => ({
      id: code,
      cover_image: coverForPlace(targets.get(code) || { geoFeatureId: code })
    }))
    const allCountryCovers = [...targets.values()].map((place) => ({
      id: place.geoFeatureId,
      cover_image: coverForPlace(place)
    }))
    const atlasCovers = uniqueById([
      ...regions.map((place) => ({ id: place.id, cover_image: coverForPlace(place) })),
      ...oceanFeatures.map((place) => ({ id: place.id, cover_image: coverForPlace({ ...place, geoFeatureId: place.id, slug: place.id }) }))
    ])

    assertRequiredCovers(majorCountryCovers, 'major country')
    assertOptionalCovers(allCountryCovers, 'country')
    assertRequiredUniqueCovers(atlasCovers, 'region/ocean')
    await assertCoverFilesExist([...majorCountryCovers, ...allCountryCovers.filter((item) => item.cover_image), ...atlasCovers])
    await assertUniqueImageContent(majorCountryCovers, 'major country cover')
    await assertUniqueImageContent(atlasCovers, 'region/ocean cover')
  })

  it('keeps generated cover fallbacks out of visible data sources', async () => {
    const [countryMeta, countriesGeo] = await Promise.all([
      readJson('public/geo/country-meta.json'),
      readJson('public/geo/countries.geojson')
    ])
    const countryTargets = new Map()
    for (const meta of countryMeta) {
      if (meta.cca3) countryTargets.set(meta.cca3, { geoFeatureId: meta.cca3, name: meta.name?.common || meta.cca3 })
    }
    for (const feature of countriesGeo.features) {
      if (feature.id) countryTargets.set(feature.id, { geoFeatureId: feature.id, name: feature.properties?.name_en || feature.properties?.name || feature.id })
    }

    const explicitPaths = [
      ...Object.values(placeImages).flatMap((set) => Object.values(set)),
      ...terrainFeatures.flatMap((item) => [item.cover_image, ...(item.gallery_images || [])]),
      ...climateZones.flatMap((item) => [item.cover_image, ...(item.gallery_images || [])]),
      ...majorPlates.flatMap((item) => [item.cover_image]),
      ...volcanoFeatures.flatMap((item) => [item.cover_image]),
      ...culturalRoutes.flatMap((route) => route.nodes.map((node) => node.image)),
      ...[...countryTargets.values()].flatMap((place) => [
        coverForPlace(place),
        ...galleryForPlace({ ...place, intro: place.name }).map((item) => item.image)
      ])
    ].filter(Boolean)

    const generatedPaths = explicitPaths.filter(isGeneratedImage)
    assert.deepEqual(generatedPaths, [], 'Visible images must not use generated fallback covers')
  })

  it('builds non-reused major country detail galleries from real local images', async () => {
    for (const code of majorCountryCodes) {
      const gallery = galleryForPlace({ geoFeatureId: code, intro: code })
      assert.ok(gallery.length >= 2, `${code} should have at least two detail gallery images`)
      const paths = gallery.map((item) => item.image)
      assert.equal(new Set(paths).size, paths.length, `${code} gallery should not reuse an image`)
      for (const imagePath of paths) {
        assertRealLocalImagePath(imagePath, `country gallery ${code}`)
        await assertImageFileExists(imagePath)
      }
    }
  })

  it('keeps key detail section images unique by content and separate from the hero cover', async () => {
    for (const target of keyDetailImageTargets) {
      const cover = coverForPlace(target.place)
      const sectionImages = detailSectionKeys.map((key) => sectionImageForPlace(target.place, key))
      assert.equal(new Set(sectionImages).size, detailSectionKeys.length, `${target.id} detail section images should not repeat`)
      for (const imagePath of sectionImages) {
        assertRealLocalImagePath(imagePath, `detail section ${target.id}`)
        await assertImageFileExists(imagePath)
      }
      const coverDigest = await imageDigest(cover)
      const sectionDigests = await Promise.all(sectionImages.map((imagePath) => imageDigest(imagePath)))
      assert.equal(new Set(sectionDigests).size, detailSectionKeys.length, `${target.id} detail section image files should not duplicate content`)
      assert.ok(!sectionDigests.includes(coverDigest), `${target.id} detail section images should not reuse the hero cover content`)
    }
  })

  it('keeps major signature story images distinct', async () => {
    for (const code of majorCountryCodes) {
      const place = { geoFeatureId: code, intro: code }
      const profile = detailProfileForPlace(place)
      assert.ok(profile, `${code} should have a detail profile`)
      const storyImages = profile.stories.map((story) => sectionImageForPlace(place, story.imageKey))
      assert.equal(new Set(storyImages).size, storyImages.length, `${code} signature stories should not repeat images`)
      for (const imagePath of storyImages) {
        assertRealLocalImagePath(imagePath, `signature story ${code}`)
        await assertImageFileExists(imagePath)
      }
      const storyDigests = await Promise.all(storyImages.map((imagePath) => imageDigest(imagePath)))
      assert.equal(new Set(storyDigests).size, storyImages.length, `${code} signature story image files should not duplicate content`)
    }
  })

  it('keeps explicit atlas and route images local and available', async () => {
    const paths = [
      ...Object.values(placeImages).flatMap((set) => Object.values(set)),
      ...culturalRoutes.flatMap((route) => route.nodes.map((node) => node.image))
    ].filter(Boolean)
    assert.ok(paths.length > 0)
    for (const imagePath of paths) {
      assertRealLocalImagePath(imagePath, imagePath)
      await assertImageFileExists(imagePath)
    }
    const routeImages = culturalRoutes.flatMap((route) => route.nodes.map((node) => ({
      id: `${route.routeId}/${node.id}`,
      cover_image: node.image
    })))
    await assertUniqueImageContent(routeImages, 'route node image')
  })
})

function assertRequiredUniqueCovers(items, label) {
  assertRequiredCovers(items, label)
  const byCover = new Map()
  for (const item of items) {
    const list = byCover.get(item.cover_image) || []
    list.push(item.id)
    byCover.set(item.cover_image, list)
  }
  const duplicates = [...byCover.entries()].filter(([, ids]) => ids.length > 1)
  assert.deepEqual(duplicates, [], `${label} covers should not be reused across different entries`)
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}

function assertRequiredCovers(items, label) {
  for (const item of items) {
    assert.ok(item.cover_image, `${label} ${item.id} is missing cover_image`)
    assertRealLocalImagePath(item.cover_image, `${label} ${item.id}`)
  }
}

function assertOptionalCovers(items, label) {
  for (const item of items) {
    if (!item.cover_image) continue
    assertRealLocalImagePath(item.cover_image, `${label} ${item.id}`)
  }
}

async function assertCoverFilesExist(items) {
  for (const item of items) {
    if (item.cover_image) await assertImageFileExists(item.cover_image)
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function assertRealLocalImagePath(imagePath, label) {
  assert.ok(!/^https?:\/\//i.test(imagePath), `${label} still uses a remote image`)
  assert.ok(!isGeneratedImage(imagePath), `${label} still uses a generated fallback image`)
  assert.ok(imagePath.startsWith('/images/'), `${label} should be cached under /images/`)
}

function isGeneratedImage(imagePath = '') {
  return String(imagePath).includes('/images/generated/')
}

async function assertImageFileExists(imagePath) {
  const file = path.join(root, 'public', imagePath.replace(/^\//, ''))
  await stat(file)
}

async function imageDigest(imagePath) {
  const file = path.join(root, 'public', imagePath.replace(/^\//, ''))
  return createHash('sha1').update(await readFile(file)).digest('hex')
}

async function assertUniqueImageContent(items, label) {
  const withDigests = []
  for (const item of items) {
    if (!item.cover_image) continue
    withDigests.push({ id: item.id, digest: await imageDigest(item.cover_image) })
  }
  const byDigest = new Map()
  for (const item of withDigests) {
    const ids = byDigest.get(item.digest) || []
    ids.push(item.id)
    byDigest.set(item.digest, ids)
  }
  const duplicates = [...byDigest.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([digest, ids]) => [digest.slice(0, 10), ids])
  assert.deepEqual(duplicates, [], `${label} images should not duplicate file content`)
}
