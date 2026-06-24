import assert from 'node:assert/strict'
import test from 'node:test'
import { monthNames, seasonalMonths } from '../src/data/seasonalSystems.js'

test('seasonal timeline covers all twelve months', () => {
  assert.equal(seasonalMonths.length, 12)
  assert.equal(monthNames.length, 12)
  seasonalMonths.forEach((month, index) => {
    assert.equal(month.month, index + 1)
    assert.ok(month.label)
    assert.ok(Number.isFinite(month.solarDirectLatitude))
    assert.ok(month.sunBelt?.latRange?.length === 2, `${month.label} needs a visible sun belt`)
    assert.ok(month.rainBelt?.latRange?.length === 2, `${month.label} needs a rain belt`)
    assert.ok(month.pressureBelts?.length >= 2, `${month.label} needs subtropical high belts`)
    assert.ok(month.logicSteps?.length >= 4, `${month.label} needs cause-to-effect logic steps`)
    assert.deepEqual(
      month.logicSteps.map((step) => step.kind),
      ['solar', 'belts', 'monsoon', 'impact'],
      `${month.label} should explain solar -> belts -> monsoon -> impact`
    )
    assert.ok(month.regionalImpacts?.length >= 3, `${month.label} needs concrete regional impacts`)
    month.regionalImpacts.forEach((impact) => {
      assert.ok(impact.area?.latRange?.length === 2 || impact.path?.length >= 2)
      assert.ok(impact.effect)
    })
  })
})

test('representative months include monsoon arrows and seasonal currents', () => {
  const january = seasonalMonths.find((item) => item.month === 1)
  const july = seasonalMonths.find((item) => item.month === 7)
  assert.ok(january.monsoonSystems.some((arrow) => arrow.role === 'winter-monsoon'))
  assert.ok(july.monsoonSystems.some((arrow) => arrow.role === 'summer-monsoon'))
  assert.ok(july.seasonalCurrents.some((current) => current.id === 'somali-current'))
  assert.ok(january.polarCaps.some((cap) => cap.role === 'polar-night'))
  assert.ok(january.rainBelt.latRange[1] < july.rainBelt.latRange[1], 'rain belt should shift north by July')
  assert.ok(january.sunBelt.latRange[1] < july.sunBelt.latRange[1], 'sun belt should shift north by July')
})
