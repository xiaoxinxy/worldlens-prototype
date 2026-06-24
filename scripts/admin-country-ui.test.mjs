import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const adminView = await readFile('src/views/AdminOceanCurrents.vue', 'utf8')
const adminApi = await readFile('src/api/adminCountryApi.js', 'utf8')
const adminContentApi = await readFile('src/api/adminContentApi.js', 'utf8')
const earthScene = await readFile('src/components/EarthScene.vue', 'utf8')
const baseStyles = await readFile('src/assets/styles/base.css', 'utf8')

describe('admin country civilization management UI', () => {
  it('adds country civilization as a first-class content management tab', () => {
    assert.match(adminView, /id: 'country'/)
    assert.match(adminView, /label: '国家文明'/)
    assert.match(adminView, /国家文明档案/)
    assert.match(adminView, /人口语言文化图层/)
  })

  it('exposes the expected editable country civilization fields', () => {
    for (const label of ['ISO3 代码', '首都', '人口', '面积 km²', '主要语言', '语言圈', '肤色图层', '文明标签', '国家简介', '文明 / 文化说明']) {
      assert.match(adminView, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    assert.match(adminView, /saveCountry/)
    assert.match(adminView, /toggleCountryStatus/)
    assert.match(adminView, /removeCountry/)
  })

  it('connects the admin page to backend country management endpoints', () => {
    assert.match(adminApi, /\/admin\/countries/)
    assert.match(adminApi, /\/admin\/countries\/page/)
    assert.match(adminApi, /listAdminCountries/)
    assert.match(adminApi, /listAdminCountriesPage/)
    assert.match(adminApi, /createCountryProfile/)
    assert.match(adminApi, /updateCountryProfile/)
    assert.match(adminApi, /setCountryProfileStatus/)
    assert.match(adminApi, /deleteCountryProfile/)
  })

  it('adds management tabs for every exploration module shown in the mode menu', () => {
    for (const label of ['气候', '地球动态', '季节时间轴', '地球与宇宙', '文明路线']) {
      assert.match(adminView, new RegExp(label))
    }
    assert.match(adminView, /genericContentModules/)
    assert.match(adminView, /结构化内容 JSON/)
  })

  it('connects generic exploration modules to backend content management endpoints', () => {
    assert.match(adminContentApi, /\/admin\/content/)
    assert.match(adminContentApi, /\/page/)
    assert.match(adminContentApi, /listAdminContentEntries/)
    assert.match(adminContentApi, /listAdminContentEntriesPage/)
    assert.match(adminContentApi, /createContentEntry/)
    assert.match(adminContentApi, /updateContentEntry/)
    assert.match(adminContentApi, /setContentEntryStatus/)
    assert.match(adminContentApi, /deleteContentEntry/)
  })

  it('adds searchable, paginated admin navigation instead of loading every list at once', () => {
    assert.match(adminView, /moduleFilter/)
    assert.match(adminView, /visibleAdminTabs/)
    assert.match(adminView, /admin-module-search/)
    assert.match(adminView, /admin-pagination/)
    assert.match(adminView, /changeLocalPage/)
    assert.match(adminView, /changeCountryPage/)
    assert.match(adminView, /changeContentPage/)
    assert.match(adminView, /listAdminCountriesPage/)
    assert.match(adminView, /listAdminContentEntriesPage/)
  })

  it('uses a simple clear animated orbit background for admin and the main globe scene', () => {
    assert.match(adminView, /admin-bg-stars/)
    assert.match(adminView, /admin-bg-aurora/)
    assert.match(earthScene, /space-bg-image/)
    assert.match(earthScene, /space-bg-stars/)
    assert.match(earthScene, /space-bg-glow/)
    assert.match(baseStyles, /adminImageDrift/)
    assert.match(baseStyles, /backgroundDrift/)
    assert.match(baseStyles, /starFieldDrift/)
  })
})
