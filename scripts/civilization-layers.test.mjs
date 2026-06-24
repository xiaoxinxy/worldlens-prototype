import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import {
  buildCivilizationCountryMetrics,
  civilizationLayerTypes,
  civilizationStyleForCountry,
  getCivilizationLayerLegend
} from '../src/data/civilizationLayers.js'

const countryMeta = JSON.parse(await readFile('public/geo/country-meta.json', 'utf8'))

describe('civilization exploration layers', () => {
  it('defines routes plus population, language and skin-tone distribution layers', () => {
    assert.deepEqual(
      civilizationLayerTypes.map((layer) => layer.id),
      ['routes', 'population', 'language', 'skin-tone']
    )
  })

  it('builds readable population intensity from local country metadata', () => {
    const metrics = buildCivilizationCountryMetrics(countryMeta)
    assert.ok(metrics.CHN.populationIntensity > metrics.USA.populationIntensity)
    assert.ok(metrics.IND.populationIntensity > metrics.JPN.populationIntensity)
    assert.ok(metrics.USA.populationIntensity > metrics.ISL.populationIntensity)
    assert.match(metrics.IND.populationLabel, /亿|万/)
  })

  it('classifies language layers into stable visual groups', () => {
    const metrics = buildCivilizationCountryMetrics(countryMeta)
    assert.equal(metrics.JPN.languageGroup, 'japanese-korean')
    assert.equal(metrics.KOR.languageGroup, 'japanese-korean')
    assert.equal(metrics.BRA.languageGroup, 'romance')
    assert.equal(metrics.EGY.languageGroup, 'arabic')
    assert.equal(metrics.CHN.languageGroup, 'sinitic')
  })

  it('creates a three-color skin-tone layer with valid layer styles', () => {
    const metrics = buildCivilizationCountryMetrics(countryMeta)
    assert.equal(metrics.CHN.toneGroupLabel, '黄色')
    assert.equal(metrics.JPN.toneGroupLabel, '黄色')
    assert.equal(metrics.IND.toneGroupLabel, '黄色')
    assert.equal(metrics.NGA.toneGroupLabel, '黑色')
    assert.equal(metrics.NOR.toneGroupLabel, '白色')
    assert.equal(metrics.GBR.toneGroupLabel, '白色')
    assert.deepEqual(getCivilizationLayerLegend('skin-tone').map((item) => item.label), ['白色', '黄色', '黑色'])

    for (const layerId of ['population', 'language', 'skin-tone']) {
      const style = civilizationStyleForCountry(metrics.IND, layerId)
      assert.match(style.color, /^#[0-9a-f]{6}$/i)
      assert.equal(style.opacity, 1)
      assert.ok(style.label)
      assert.ok(style.value)
      assert.ok(getCivilizationLayerLegend(layerId).length >= (layerId === 'skin-tone' ? 3 : 4))
    }
  })
})
