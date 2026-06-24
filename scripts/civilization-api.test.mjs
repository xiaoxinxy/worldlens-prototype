import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeCivilizationMetrics } from '../src/api/civilizationApi.js'

describe('civilization backend api normalization', () => {
  it('normalizes backend country metrics for the earth scene', () => {
    const metrics = normalizeCivilizationMetrics({
      chn: {
        name: '中国',
        population: '1408280000',
        populationIntensity: 2,
        populationColor: 'bad-color',
        languageColor: '#facc15',
        toneColor: '#ffd43b'
      }
    })

    assert.equal(metrics.CHN.id, 'CHN')
    assert.equal(metrics.CHN.population, 1408280000)
    assert.equal(metrics.CHN.populationIntensity, 1)
    assert.equal(metrics.CHN.populationColor, '#94a3b8')
    assert.equal(metrics.CHN.languageColor, '#facc15')
    assert.equal(metrics.CHN.toneColor, '#ffd43b')
  })

  it('rejects empty or malformed metric payloads', () => {
    assert.equal(normalizeCivilizationMetrics(null), null)
    assert.equal(normalizeCivilizationMetrics([]), null)
    assert.equal(normalizeCivilizationMetrics({ bad: null }), null)
  })
})
