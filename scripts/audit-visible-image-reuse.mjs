import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { climateZones } from '../src/data/climate.js'
import { culturalRoutes } from '../src/data/culturalRoutes.js'
import { majorPlates, volcanoFeatures } from '../src/data/earthDynamics.js'
import { oceanFeatures } from '../src/data/ocean.js'
import { coverForPlace, sectionImageForPlace } from '../src/data/placeImages.js'
import { regions } from '../src/data/regions.js'
import { terrainFeatures } from '../src/data/terrain.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sectionKeys = ['geography', 'history', 'food', 'festival', 'architecture', 'lifestyle']
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

const placeDetailTargets = [
  ...majorCountryCodes.map((code) => ({ id: code, place: { geoFeatureId: code, intro: code } })),
  ...regions.map((place) => ({
    id: place.id,
    place: { ...place, geoFeatureId: place.geoFeatureId || place.id, slug: place.slug || place.id }
  })),
  ...oceanFeatures.map((place) => ({
    id: place.id,
    place: { ...place, geoFeatureId: place.id, slug: place.id }
  }))
]

await auditDetailSections()
await auditCollection('country covers', majorCountryCodes.map((code) => ({ id: code, image: coverForPlace({ geoFeatureId: code }) })))
await auditCollection('region covers', regions.map((place) => ({ id: place.id, image: coverForPlace({ ...place, geoFeatureId: place.geoFeatureId || place.id, slug: place.slug || place.id }) })))
await auditCollection('ocean covers', oceanFeatures.map((place) => ({ id: place.id, image: coverForPlace({ ...place, geoFeatureId: place.id, slug: place.id }) })))
await auditCollection('terrain covers', terrainFeatures.map((item) => ({ id: item.id, image: item.cover_image })))
await auditCollection('climate covers', climateZones.map((item) => ({ id: item.id, image: item.cover_image })))
await auditCollection('plate covers', majorPlates.map((item) => ({ id: item.id, image: item.cover_image })))
await auditCollection('volcano covers', volcanoFeatures.map((item) => ({ id: item.id, image: item.cover_image })))
await auditCollection('route node images', culturalRoutes.flatMap((route) =>
  route.nodes.map((node) => ({ id: `${route.id}/${node.id}`, image: node.image }))
))

async function auditDetailSections() {
  const problems = []
  for (const target of placeDetailTargets) {
    const cover = coverForPlace(target.place)
    const coverDigest = await digestFor(cover)
    const entries = await Promise.all(sectionKeys.map(async (key) => {
      const image = sectionImageForPlace(target.place, key)
      return { key, image, digest: await digestFor(image) }
    }))
    const missing = entries.filter((entry) => !entry.image || entry.digest === 'missing')
    const duplicatePaths = duplicateGroups(entries, (entry) => entry.image)
    const duplicateDigests = duplicateGroups(entries, (entry) => entry.digest).filter((group) => group.key !== 'missing')
    const coverReused = entries.filter((entry) => entry.image === cover || entry.digest === coverDigest)
    if (missing.length || duplicatePaths.length || duplicateDigests.length || coverReused.length) {
      problems.push({
        id: target.id,
        missing: missing.map((entry) => entry.key),
        duplicatePaths,
        duplicateDigests,
        coverReused: coverReused.map((entry) => entry.key)
      })
    }
  }
  printDetailProblems('detail section images', problems)
}

async function auditCollection(label, items) {
  const entries = await Promise.all(items.filter((item) => item.image).map(async (item) => ({
    ...item,
    digest: await digestFor(item.image)
  })))
  const duplicatePaths = duplicateGroups(entries, (entry) => entry.image)
  const duplicateDigests = duplicateGroups(entries, (entry) => entry.digest).filter((group) => group.key !== 'missing')
  const missing = entries.filter((entry) => entry.digest === 'missing')
  if (!duplicatePaths.length && !duplicateDigests.length && !missing.length) {
    console.log(`OK ${label}: ${entries.length} images`)
    return
  }
  console.log(`\nISSUES ${label}`)
  if (missing.length) console.log(`  missing: ${missing.map((entry) => entry.id).join(', ')}`)
  for (const group of duplicatePaths) console.log(`  duplicate path ${group.key}: ${group.ids.join(', ')}`)
  for (const group of duplicateDigests) console.log(`  duplicate content ${group.key.slice(0, 10)}: ${group.ids.join(', ')}`)
}

function printDetailProblems(label, problems) {
  if (!problems.length) {
    console.log(`OK ${label}: ${placeDetailTargets.length} entries`)
    return
  }
  console.log(`\nISSUES ${label}: ${problems.length} entries`)
  for (const problem of problems) {
    console.log(`  ${problem.id}`)
    if (problem.missing.length) console.log(`    missing: ${problem.missing.join(', ')}`)
    if (problem.coverReused.length) console.log(`    cover reused: ${problem.coverReused.join(', ')}`)
    for (const group of problem.duplicatePaths) console.log(`    duplicate path ${group.key}: ${group.ids.join(', ')}`)
    for (const group of problem.duplicateDigests) console.log(`    duplicate content ${group.key.slice(0, 10)}: ${group.ids.join(', ')}`)
  }
}

function duplicateGroups(entries, keyFor) {
  const groups = new Map()
  for (const entry of entries) {
    const key = keyFor(entry)
    if (!key) continue
    const ids = groups.get(key) || []
    ids.push(entry.key || entry.id)
    groups.set(key, ids)
  }
  return [...groups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, ids]) => ({ key, ids }))
}

async function digestFor(imagePath = '') {
  if (!imagePath || /^https?:\/\//i.test(imagePath)) return 'missing'
  const file = path.join(root, 'public', imagePath.replace(/^\//, ''))
  try {
    await stat(file)
    return createHash('sha1').update(await readFile(file)).digest('hex')
  } catch {
    return 'missing'
  }
}
