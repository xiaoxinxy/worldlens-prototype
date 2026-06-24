<template>
  <main class="admin-ocean-view page-view">
    <div class="admin-dynamic-bg" aria-hidden="true">
      <span class="admin-bg-stars"></span>
      <span class="admin-bg-aurora"></span>
    </div>

    <section class="admin-ocean-hero">
      <div>
        <p class="eyebrow">Admin Console</p>
        <h1>内容后台</h1>
      </div>
      <p>统一维护会影响地球图层的知识内容：国家、文明路线、气候、地球动态、季节系统、宇宙图层、洋流、地形和素材都从这里进入后端。</p>
    </section>

    <section v-if="!authStore.isAuthenticated" class="admin-state-panel">
      <h2>需要登录</h2>
      <p>请先登录管理员账号，再进入内容管理。</p>
      <button class="primary-btn" type="button" @click="authStore.openAuth('login')">登录 / 注册</button>
    </section>

    <section v-else-if="!isAdmin" class="admin-state-panel danger">
      <h2>没有管理员权限</h2>
      <p>后端管理接口只允许管理员用户访问，普通账号可以浏览内容，但不能修改数据库。</p>
    </section>

    <section v-else class="admin-ocean-workspace admin-console-workspace">
      <aside class="admin-ocean-sidebar">
        <div class="admin-module-search">
          <span>内容模块</span>
          <input v-model.trim="moduleFilter" type="search" placeholder="搜索模块：板块、气候、文明..." />
        </div>
        <div class="admin-module-tabs" role="tablist" aria-label="内容模块">
          <button
            v-for="tab in visibleAdminTabs"
            :key="tab.id"
            :class="{ active: activeAdminTab === tab.id }"
            type="button"
            @click="switchAdminTab(tab.id)"
          >
            <span>{{ tab.metric }}</span>
            <strong>{{ tab.label }}</strong>
            <small>{{ tab.caption }}</small>
          </button>
        </div>

        <div v-if="adminSummary" class="admin-summary-strip">
          <span><b>{{ adminSummary.totalUsers }}</b><small>用户</small></span>
          <span><b>{{ adminSummary.countryCount }}</b><small>国家</small></span>
          <span><b>{{ adminSummary.oceanCurrentCount }}</b><small>洋流</small></span>
          <span><b>{{ adminSummary.terrainFeatureCount }}</b><small>地形</small></span>
          <span><b>{{ adminSummary.contentEntryCount }}</b><small>内容</small></span>
        </div>

        <template v-if="activeAdminTab === 'ocean'">
          <div class="admin-toolbar">
            <div>
              <span>{{ currents.length }}</span>
              <small>数据库洋流</small>
            </div>
            <button class="ghost-btn" type="button" @click="startCreate">新建</button>
          </div>

          <div class="admin-filter-row">
            <input v-model.trim="filters.q" placeholder="搜索 ID / 名称 / 海域" @keyup.enter="searchCurrents" />
            <select v-model="filters.kind" @change="searchCurrents">
              <option value="">全部类型</option>
              <option value="warm">暖流</option>
              <option value="cold">寒流</option>
              <option value="seasonal">季风洋流</option>
            </select>
            <button type="button" @click="searchCurrents">筛选</button>
          </div>

          <div class="admin-current-list">
            <button
              v-for="current in pagedCurrents"
              :key="current.id"
              :class="{ active: current.id === selectedId, disabled: current.enabled === false }"
              type="button"
              @click="selectCurrent(current)"
            >
              <span>{{ current.kind }}</span>
              <strong>{{ current.name }}</strong>
              <small>{{ current.id }} · {{ current.basin }}</small>
            </button>
          </div>
          <div class="admin-pagination" v-if="oceanPageInfo.totalPages > 1">
            <button type="button" :disabled="listPages.ocean <= 1" @click="changeLocalPage('ocean', listPages.ocean - 1)">上一页</button>
            <span>第 {{ listPages.ocean }} / {{ oceanPageInfo.totalPages }} 页 · 共 {{ oceanPageInfo.total }} 条</span>
            <button type="button" :disabled="listPages.ocean >= oceanPageInfo.totalPages" @click="changeLocalPage('ocean', listPages.ocean + 1)">下一页</button>
          </div>
        </template>

        <template v-else-if="activeAdminTab === 'terrain'">
          <div class="admin-toolbar">
            <div>
              <span>{{ terrainFeatures.length }}</span>
              <small>可管理地形</small>
            </div>
            <button class="ghost-btn" type="button" @click="startCreateTerrain">新建</button>
          </div>

          <div class="admin-filter-row">
            <input v-model.trim="terrainFilters.q" placeholder="搜索 ID / 名称 / 区域" @keyup.enter="searchTerrainFeatures" />
            <select v-model="terrainFilters.type" @change="searchTerrainFeatures">
              <option value="">全部地形</option>
              <option v-for="type in terrainTypeOptions" :key="type" :value="type">{{ type }}</option>
            </select>
            <button type="button" @click="searchTerrainFeatures">筛选</button>
          </div>

          <div class="admin-current-list">
            <button
              v-for="feature in pagedTerrainFeatures"
              :key="feature.id"
              :class="{ active: feature.id === selectedTerrainId, disabled: feature.enabled === false }"
              type="button"
              @click="selectTerrainFeature(feature)"
            >
              <span>{{ feature.type }}</span>
              <strong>{{ feature.name }}</strong>
              <small>{{ feature.id }} · {{ feature.region || feature.continent }}</small>
            </button>
          </div>
          <div class="admin-pagination" v-if="terrainPageInfo.totalPages > 1">
            <button type="button" :disabled="listPages.terrain <= 1" @click="changeLocalPage('terrain', listPages.terrain - 1)">上一页</button>
            <span>第 {{ listPages.terrain }} / {{ terrainPageInfo.totalPages }} 页 · 共 {{ terrainPageInfo.total }} 条</span>
            <button type="button" :disabled="listPages.terrain >= terrainPageInfo.totalPages" @click="changeLocalPage('terrain', listPages.terrain + 1)">下一页</button>
          </div>
        </template>

        <template v-else-if="activeAdminTab === 'country'">
          <div class="admin-toolbar">
            <div>
              <span>{{ countryPage.total }}</span>
              <small>国家文明档案</small>
            </div>
            <button class="ghost-btn" type="button" @click="startCreateCountry">新建</button>
          </div>

          <div class="admin-filter-row">
            <input v-model.trim="countryFilters.q" placeholder="搜索代码 / 国家 / 首都 / 区域" @keyup.enter="searchCountries" />
            <select v-model="countryFilters.continent" @change="searchCountries">
              <option value="">全部洲别</option>
              <option v-for="continent in countryContinentOptions" :key="continent" :value="continent">{{ continent }}</option>
            </select>
            <button type="button" @click="searchCountries">筛选</button>
          </div>

          <div class="admin-current-list">
            <button
              v-for="country in countries"
              :key="country.code"
              :class="{ active: country.code === selectedCountryCode, disabled: country.enabled === false }"
              type="button"
              @click="selectCountry(country)"
            >
              <span>{{ country.continent }}</span>
              <strong>{{ country.name }}</strong>
              <small>{{ country.code }} · {{ country.capital || country.region }}</small>
            </button>
          </div>
          <div class="admin-pagination" v-if="countryPage.totalPages > 1">
            <button type="button" :disabled="countryPage.page <= 1" @click="changeCountryPage(countryPage.page - 1)">上一页</button>
            <span>第 {{ countryPage.page }} / {{ countryPage.totalPages }} 页 · 共 {{ countryPage.total }} 条</span>
            <button type="button" :disabled="countryPage.page >= countryPage.totalPages" @click="changeCountryPage(countryPage.page + 1)">下一页</button>
          </div>
        </template>

        <template v-else-if="activeContentModule">
          <div class="admin-toolbar">
            <div>
              <span>{{ contentPage.total }}</span>
              <small>{{ activeContentModule.caption }}</small>
            </div>
            <button class="ghost-btn" type="button" @click="startCreateContent">新建</button>
          </div>

          <div class="admin-filter-row simple">
            <input v-model.trim="contentFilters.q" placeholder="搜索 ID / 标题 / 摘要" @keyup.enter="searchContentEntries" />
            <button type="button" @click="searchContentEntries">筛选</button>
          </div>

          <div class="admin-current-list">
            <button
              v-for="entry in contentEntries"
              :key="entry.entryId"
              :class="{ active: entry.entryId === selectedContentEntryId, disabled: entry.enabled === false }"
              type="button"
              @click="selectContentEntry(entry)"
            >
              <span>{{ activeContentModule.label }}</span>
              <strong>{{ entry.title }}</strong>
              <small>{{ entry.entryId }} · {{ entry.subtitle || '通用内容' }}</small>
            </button>
          </div>
          <div class="admin-pagination" v-if="contentPage.totalPages > 1">
            <button type="button" :disabled="contentPage.page <= 1" @click="changeContentPage(contentPage.page - 1)">上一页</button>
            <span>第 {{ contentPage.page }} / {{ contentPage.totalPages }} 页 · 共 {{ contentPage.total }} 条</span>
            <button type="button" :disabled="contentPage.page >= contentPage.totalPages" @click="changeContentPage(contentPage.page + 1)">下一页</button>
          </div>
        </template>

        <template v-else>
          <div class="admin-upload-sidebar">
            <span>素材上传</span>
            <h2>内容图片库</h2>
            <p>上传后的图片会获得一个可直接写入地形封面或其它内容字段的后端 URL。</p>
          </div>
        </template>
      </aside>

      <form v-if="activeAdminTab === 'ocean'" class="admin-current-editor" @submit.prevent="saveCurrent">
        <div class="admin-editor-head">
          <div>
            <p>{{ selectedId ? '编辑洋流' : '新建洋流' }}</p>
            <h2>{{ form.name || '未命名洋流' }}</h2>
          </div>
          <label class="admin-status-switch">
            <input v-model="form.enabled" type="checkbox" />
            <span>{{ form.enabled ? '启用' : '停用' }}</span>
          </label>
        </div>

        <div class="admin-form-grid">
          <label>
            <span>ID</span>
            <input v-model.trim="form.id" :disabled="Boolean(selectedId)" required />
          </label>
          <label>
            <span>排序</span>
            <input v-model.number="form.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>中文名</span>
            <input v-model.trim="form.name" required />
          </label>
          <label>
            <span>英文名</span>
            <input v-model.trim="form.name_en" required />
          </label>
          <label>
            <span>类型</span>
            <select v-model="form.kind" required>
              <option value="warm">暖流</option>
              <option value="cold">寒流</option>
              <option value="seasonal">季风洋流</option>
            </select>
          </label>
          <label>
            <span>所属海域</span>
            <input v-model.trim="form.basin" required />
          </label>
          <label>
            <span>环流系统</span>
            <input v-model.trim="form.system" required />
          </label>
          <label>
            <span>影响标签</span>
            <input v-model.trim="tagText" placeholder="增温增湿, 渔场, 海雾" />
          </label>
        </div>

        <label>
          <span>流向</span>
          <input v-model.trim="form.direction" />
        </label>
        <label>
          <span>来源</span>
          <input v-model.trim="form.source" />
        </label>
        <label>
          <span>影响说明</span>
          <textarea v-model.trim="form.effect" rows="3" required></textarea>
        </label>
        <label>
          <span>课本提示</span>
          <textarea v-model.trim="form.textbookNote" rows="2"></textarea>
        </label>

        <div class="admin-form-grid compact">
          <label>
            <span>影响纬度</span>
            <input v-model.number="form.influenceLat" type="number" step="0.1" min="-90" max="90" />
          </label>
          <label>
            <span>影响经度</span>
            <input v-model.number="form.influenceLng" type="number" step="0.1" min="-180" max="180" />
          </label>
          <label>
            <span>影响半径</span>
            <input v-model.number="form.influenceRadius" type="number" step="0.01" min="0.01" />
          </label>
          <label>
            <span>影响角色</span>
            <input v-model.trim="form.influenceRole" />
          </label>
        </div>

        <label>
          <span>路径坐标</span>
          <textarea v-model.trim="pathText" rows="5" placeholder="每行一个点，例如：24,-82"></textarea>
        </label>

        <div class="admin-editor-actions">
          <button class="primary-btn" type="submit" :disabled="saving">
            {{ saving ? '保存中' : '保存到后端' }}
          </button>
          <button class="ghost-btn" type="button" :disabled="!selectedId || saving" @click="toggleCurrentStatus">
            {{ form.enabled ? '停用' : '启用' }}
          </button>
          <button class="ghost-btn danger" type="button" :disabled="!selectedId || saving" @click="removeCurrent">
            删除
          </button>
        </div>

        <p v-if="message" class="admin-message">{{ message }}</p>
        <p v-if="error" class="admin-message error">{{ error }}</p>
      </form>

      <form v-else-if="activeAdminTab === 'terrain'" class="admin-current-editor" @submit.prevent="saveTerrainFeature">
        <div class="admin-editor-head">
          <div>
            <p>{{ selectedTerrainId ? '编辑地形' : '新建地形' }}</p>
            <h2>{{ terrainForm.name || '未命名地形' }}</h2>
          </div>
          <label class="admin-status-switch terrain">
            <input v-model="terrainForm.enabled" type="checkbox" />
            <span>{{ terrainForm.enabled ? '启用' : '停用' }}</span>
          </label>
        </div>

        <div class="admin-form-grid">
          <label>
            <span>ID</span>
            <input v-model.trim="terrainForm.id" :disabled="Boolean(selectedTerrainId)" required />
          </label>
          <label>
            <span>排序</span>
            <input v-model.number="terrainForm.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>中文名</span>
            <input v-model.trim="terrainForm.name" required />
          </label>
          <label>
            <span>英文名</span>
            <input v-model.trim="terrainForm.name_en" />
          </label>
          <label>
            <span>地形类型</span>
            <input v-model.trim="terrainForm.type" required placeholder="mountain / desert / trench" />
          </label>
          <label>
            <span>类型标签</span>
            <input v-model.trim="terrainForm.type_label" required placeholder="山脉 / 沙漠 / 海沟" />
          </label>
          <label>
            <span>大洲</span>
            <input v-model.trim="terrainForm.continent" />
          </label>
          <label>
            <span>区域</span>
            <input v-model.trim="terrainForm.region" />
          </label>
        </div>

        <div class="admin-form-grid compact">
          <label>
            <span>纬度</span>
            <input v-model.number="terrainForm.latitude" type="number" step="0.1" min="-90" max="90" required />
          </label>
          <label>
            <span>经度</span>
            <input v-model.number="terrainForm.longitude" type="number" step="0.1" min="-180" max="180" required />
          </label>
          <label>
            <span>长度</span>
            <input v-model.trim="terrainForm.length" />
          </label>
          <label>
            <span>面积</span>
            <input v-model.trim="terrainForm.area" />
          </label>
        </div>

        <label>
          <span>国家代码</span>
          <input v-model.trim="countryCodeText" placeholder="CHN, NPL, IND" />
        </label>
        <label>
          <span>标签</span>
          <input v-model.trim="terrainTagText" placeholder="板块碰撞, 高山气候, 河流源区" />
        </label>
        <label>
          <span>封面图 URL</span>
          <input v-model.trim="terrainForm.cover_image" placeholder="/uploads/content/xxx.jpg" />
        </label>
        <label>
          <span>最高点 / 深度</span>
          <input v-model.trim="terrainForm.highest_point" />
        </label>
        <label>
          <span>摘要</span>
          <textarea v-model.trim="terrainForm.summary" rows="3" required></textarea>
        </label>
        <label>
          <span>形成原因</span>
          <textarea v-model.trim="terrainForm.formation_reason" rows="3"></textarea>
        </label>

        <div class="admin-editor-actions">
          <button class="primary-btn" type="submit" :disabled="saving">
            {{ saving ? '保存中' : '保存地形' }}
          </button>
          <button class="ghost-btn" type="button" :disabled="!selectedTerrainId || saving" @click="toggleTerrainStatus">
            {{ terrainForm.enabled ? '停用' : '启用' }}
          </button>
          <button class="ghost-btn danger" type="button" :disabled="!selectedTerrainId || saving" @click="removeTerrainFeature">
            删除
          </button>
        </div>

        <p v-if="message" class="admin-message">{{ message }}</p>
        <p v-if="error" class="admin-message error">{{ error }}</p>
      </form>

      <form v-else-if="activeAdminTab === 'country'" class="admin-current-editor" @submit.prevent="saveCountry">
        <div class="admin-editor-head">
          <div>
            <p>{{ selectedCountryCode ? '编辑国家文明' : '新建国家文明' }}</p>
            <h2>{{ countryForm.name || '未命名国家' }}</h2>
          </div>
          <label class="admin-status-switch country">
            <input v-model="countryForm.enabled" type="checkbox" />
            <span>{{ countryForm.enabled ? '启用' : '停用' }}</span>
          </label>
        </div>

        <div class="admin-form-grid">
          <label>
            <span>ISO3 代码</span>
            <input v-model.trim="countryForm.code" :disabled="Boolean(selectedCountryCode)" maxlength="3" required placeholder="CHN" />
          </label>
          <label>
            <span>排序</span>
            <input v-model.number="countryForm.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>中文名</span>
            <input v-model.trim="countryForm.name" required />
          </label>
          <label>
            <span>英文名</span>
            <input v-model.trim="countryForm.name_en" required />
          </label>
          <label>
            <span>洲别</span>
            <input v-model.trim="countryForm.continent" required placeholder="亚洲 / 欧洲 / 非洲" />
          </label>
          <label>
            <span>区域</span>
            <input v-model.trim="countryForm.region" placeholder="东亚 / 西欧 / 北美" />
          </label>
          <label>
            <span>首都</span>
            <input v-model.trim="countryForm.capital" />
          </label>
          <label>
            <span>封面图 URL</span>
            <input v-model.trim="countryForm.coverImage" placeholder="/images/places/china-cover.jpg" />
          </label>
        </div>

        <div class="admin-form-grid compact">
          <label>
            <span>纬度</span>
            <input v-model.number="countryForm.latitude" type="number" step="0.1" min="-90" max="90" required />
          </label>
          <label>
            <span>经度</span>
            <input v-model.number="countryForm.longitude" type="number" step="0.1" min="-180" max="180" required />
          </label>
          <label>
            <span>人口</span>
            <input v-model.number="countryForm.population" type="number" min="0" />
          </label>
          <label>
            <span>面积 km²</span>
            <input v-model.number="countryForm.areaKm2" type="number" min="0" step="0.1" />
          </label>
        </div>

        <label>
          <span>主要语言</span>
          <input v-model.trim="countryLanguageText" placeholder="汉语, 英语, 法语" />
        </label>

        <div class="admin-form-grid compact">
          <label>
            <span>语言圈</span>
            <select v-model="countryForm.languageGroup" @change="applyLanguagePreset">
              <option v-for="group in languageGroupOptions" :key="group.id" :value="group.id">{{ group.label }}</option>
            </select>
          </label>
          <label>
            <span>语言圈名称</span>
            <input v-model.trim="countryForm.languageGroupLabel" required />
          </label>
          <label>
            <span>语言颜色</span>
            <input v-model.trim="countryForm.languageColor" required />
          </label>
          <label class="admin-color-field">
            <span>预览</span>
            <input v-model="countryForm.languageColor" type="color" />
          </label>
        </div>

        <div class="admin-form-grid compact">
          <label>
            <span>肤色图层</span>
            <select v-model="countryForm.toneGroup" @change="applyTonePreset">
              <option v-for="tone in toneGroupOptions" :key="tone.id" :value="tone.id">{{ tone.label }}</option>
            </select>
          </label>
          <label>
            <span>肤色名称</span>
            <input v-model.trim="countryForm.toneGroupLabel" required />
          </label>
          <label>
            <span>肤色颜色</span>
            <input v-model.trim="countryForm.toneColor" required />
          </label>
          <label class="admin-color-field">
            <span>预览</span>
            <input v-model="countryForm.toneColor" type="color" />
          </label>
        </div>

        <label>
          <span>文明标签</span>
          <input v-model.trim="civilizationTagText" placeholder="中华文明, 季风农业, 丝绸之路" />
        </label>
        <label>
          <span>国家简介</span>
          <textarea v-model.trim="countryForm.summary" rows="3" required></textarea>
        </label>
        <label>
          <span>文明 / 文化说明</span>
          <textarea v-model.trim="countryForm.cultureNote" rows="3"></textarea>
        </label>

        <div class="admin-editor-actions">
          <button class="primary-btn" type="submit" :disabled="saving">
            {{ saving ? '保存中' : '保存国家文明' }}
          </button>
          <button class="ghost-btn" type="button" :disabled="!selectedCountryCode || saving" @click="toggleCountryStatus">
            {{ countryForm.enabled ? '停用' : '启用' }}
          </button>
          <button class="ghost-btn danger" type="button" :disabled="!selectedCountryCode || saving" @click="removeCountry">
            删除
          </button>
        </div>

        <p v-if="message" class="admin-message">{{ message }}</p>
        <p v-if="error" class="admin-message error">{{ error }}</p>
      </form>

      <form v-else-if="activeContentModule" class="admin-current-editor" @submit.prevent="saveContentEntry">
        <div class="admin-editor-head">
          <div>
            <p>{{ selectedContentEntryId ? `编辑${activeContentModule.label}` : `新建${activeContentModule.label}` }}</p>
            <h2>{{ contentForm.title || '未命名内容' }}</h2>
          </div>
          <label class="admin-status-switch content">
            <input v-model="contentForm.enabled" type="checkbox" />
            <span>{{ contentForm.enabled ? '启用' : '停用' }}</span>
          </label>
        </div>

        <div class="admin-form-grid">
          <label>
            <span>条目 ID</span>
            <input v-model.trim="contentForm.entryId" :disabled="Boolean(selectedContentEntryId)" required placeholder="pacific-plate" />
          </label>
          <label>
            <span>排序</span>
            <input v-model.number="contentForm.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>标题</span>
            <input v-model.trim="contentForm.title" required />
          </label>
          <label>
            <span>副标题</span>
            <input v-model.trim="contentForm.subtitle" />
          </label>
        </div>

        <label>
          <span>摘要</span>
          <textarea v-model.trim="contentForm.summary" rows="3"></textarea>
        </label>

        <label>
          <span>结构化内容 JSON</span>
          <textarea v-model.trim="contentPayloadText" rows="12" spellcheck="false" placeholder='{"kind":"plate","lat":2,"lng":-165}'></textarea>
        </label>

        <div class="admin-editor-actions">
          <button class="primary-btn" type="submit" :disabled="saving">
            {{ saving ? '保存中' : `保存${activeContentModule.label}` }}
          </button>
          <button class="ghost-btn" type="button" :disabled="!selectedContentEntryId || saving" @click="toggleContentStatus">
            {{ contentForm.enabled ? '停用' : '启用' }}
          </button>
          <button class="ghost-btn danger" type="button" :disabled="!selectedContentEntryId || saving" @click="removeContentEntry">
            删除
          </button>
        </div>

        <p class="admin-message subtle">模块：{{ activeContentModule.label }}。这里保存的是后端通用内容，适合管理板块、气候说明、季节节点、宇宙图层和文明路线。</p>
        <p v-if="message" class="admin-message">{{ message }}</p>
        <p v-if="error" class="admin-message error">{{ error }}</p>
      </form>

      <section v-else class="admin-current-editor admin-upload-workspace">
        <div class="admin-editor-head">
          <div>
            <p>图片上传</p>
            <h2>内容素材</h2>
          </div>
          <span class="admin-upload-badge">Admin only</span>
        </div>

        <div class="admin-upload-drop">
          <input id="content-image-file" type="file" accept="image/*" @change="handleContentImageFile" />
          <label for="content-image-file">
            <strong>{{ uploadFileName || '选择一张内容图片' }}</strong>
            <span>支持 JPG、PNG、WebP、GIF，后端限制 5MB。上传后可直接复制 URL。</span>
          </label>
        </div>

        <div v-if="contentImageUrl" class="admin-upload-result">
          <img :src="contentImageUrl" alt="" />
          <div>
            <span>上传完成</span>
            <input :value="contentImageUrl" readonly />
            <button class="ghost-btn" type="button" @click="useUploadedImageForTerrain">写入当前地形封面</button>
            <button class="ghost-btn" type="button" @click="useUploadedImageForCountry">写入当前国家封面</button>
          </div>
        </div>

        <p v-if="uploading" class="admin-message">正在上传图片...</p>
        <p v-if="message" class="admin-message">{{ message }}</p>
        <p v-if="error" class="admin-message error">{{ error }}</p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  createCountryProfile,
  deleteCountryProfile,
  listAdminCountriesPage,
  setCountryProfileStatus,
  updateCountryProfile
} from '../api/adminCountryApi'
import {
  createContentEntry,
  deleteContentEntry,
  listAdminContentEntriesPage,
  setContentEntryStatus,
  updateContentEntry
} from '../api/adminContentApi'
import {
  createOceanCurrent,
  deleteOceanCurrent,
  listAdminOceanCurrents,
  setOceanCurrentStatus,
  updateOceanCurrent
} from '../api/adminOceanApi'
import {
  createTerrainFeature,
  deleteTerrainFeature,
  listAdminTerrainFeatures,
  setTerrainFeatureStatus,
  updateTerrainFeature
} from '../api/adminTerrainApi'
import { getAdminSummary } from '../api/adminSummaryApi'
import { uploadContentImage } from '../api/fileApi'
import { useAuthStore } from '../stores/auth'

defineOptions({ name: 'AdminOceanCurrents' })

const authStore = useAuthStore()
const isAdmin = computed(() => Boolean(authStore.currentUser?.isAdmin))
const activeAdminTab = ref('ocean')
const moduleFilter = ref('')
const currents = ref([])
const terrainFeatures = ref([])
const countries = ref([])
const contentEntries = ref([])
const selectedId = ref('')
const selectedTerrainId = ref('')
const selectedCountryCode = ref('')
const selectedContentEntryId = ref('')
const listPageSize = 8
const listPages = reactive({ ocean: 1, terrain: 1 })
const countryPage = reactive({ page: 1, pageSize: 12, total: 0, totalPages: 1 })
const contentPage = reactive({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const error = ref('')
const filters = reactive({ q: '', kind: '' })
const terrainFilters = reactive({ q: '', type: '' })
const countryFilters = reactive({ q: '', continent: '' })
const contentFilters = reactive({ q: '' })
const adminSummary = ref(null)
const tagText = ref('')
const pathText = ref('')
const terrainTagText = ref('')
const countryCodeText = ref('')
const countryLanguageText = ref('')
const civilizationTagText = ref('')
const uploadFileName = ref('')
const contentImageUrl = ref('')
const form = reactive(defaultForm())
const terrainForm = reactive(defaultTerrainForm())
const countryForm = reactive(defaultCountryForm())
const contentForm = reactive(defaultContentForm())
const contentPayloadText = ref('{}')

const terrainTypeOptions = ['mountain', 'plateau', 'plain', 'basin', 'river', 'desert', 'glacier', 'volcano', 'lake', 'rainforest', 'island', 'canyon', 'reef', 'trench', 'ridge', 'rift', 'fault']
const genericContentModules = [
  { id: 'climate', label: '气候', caption: '气候探索内容' },
  { id: 'dynamics', label: '地球动态', caption: '板块 / 地震 / 火山' },
  { id: 'seasonal', label: '季节时间轴', caption: '月份和季风节点' },
  { id: 'cosmos', label: '地球与宇宙', caption: '昼夜 / 四季 / 月相' },
  { id: 'routes', label: '文明路线', caption: '文明探索线路' }
]
const countryContinentOptions = ['亚洲', '欧洲', '非洲', '北美洲', '南美洲', '大洋洲', '南极洲']
const languageGroupOptions = [
  { id: 'sinitic', label: '汉语圈', color: '#facc15' },
  { id: 'japanese-korean', label: '日语 / 韩语', color: '#38bdf8' },
  { id: 'indo-iranian', label: '印度-伊朗语支', color: '#22c55e' },
  { id: 'arabic', label: '阿拉伯语圈', color: '#f59e0b' },
  { id: 'romance', label: '罗曼语族', color: '#fb7185' },
  { id: 'germanic', label: '日耳曼语族', color: '#60a5fa' },
  { id: 'slavic', label: '斯拉夫语族', color: '#a855f7' },
  { id: 'turkic', label: '突厥语族', color: '#f97316' },
  { id: 'austronesian', label: '南岛语族', color: '#06b6d4' },
  { id: 'african', label: '非洲本地语群', color: '#84cc16' },
  { id: 'other', label: '多语 / 本地语', color: '#94a3b8' }
]
const toneGroupOptions = [
  { id: 'white', label: '白色', color: '#f8f4e8' },
  { id: 'yellow', label: '黄色', color: '#ffd43b' },
  { id: 'black', label: '黑色', color: '#111111' }
]
const adminTabs = computed(() => [
  { id: 'ocean', label: '洋流', caption: '海洋探索图层', metric: currents.value.length || 'OC' },
  { id: 'terrain', label: '地形', caption: '地貌内容库', metric: terrainFeatures.value.length || 'TF' },
  { id: 'climate', label: '气候', caption: '气候探索内容', metric: 'CL' },
  { id: 'dynamics', label: '地球动态', caption: '板块地震火山', metric: 'DY' },
  { id: 'seasonal', label: '季节时间轴', caption: '月份系统', metric: 'SS' },
  { id: 'cosmos', label: '地球与宇宙', caption: '天文图层', metric: 'UV' },
  { id: 'routes', label: '文明路线', caption: '文明探索线路', metric: 'RT' },
  { id: 'country', label: '国家文明', caption: '人口语言文化图层', metric: countryPage.total || 'CV' },
  { id: 'files', label: '素材', caption: '图片上传', metric: contentImageUrl.value ? 'URL' : 'IMG' }
])
const activeContentModule = computed(() => genericContentModules.find((module) => module.id === activeAdminTab.value))
const visibleAdminTabs = computed(() => {
  const keyword = moduleFilter.value.toLowerCase()
  if (!keyword) return adminTabs.value
  return adminTabs.value.filter((tab) =>
    [tab.id, tab.label, tab.caption].some((value) => String(value).toLowerCase().includes(keyword))
  )
})
const oceanPageInfo = computed(() => pageInfo(currents.value.length, listPages.ocean, listPageSize))
const terrainPageInfo = computed(() => pageInfo(terrainFeatures.value.length, listPages.terrain, listPageSize))
const pagedCurrents = computed(() => paginate(currents.value, listPages.ocean, listPageSize))
const pagedTerrainFeatures = computed(() => paginate(terrainFeatures.value, listPages.terrain, listPageSize))

onMounted(async () => {
  if (authStore.token && !authStore.currentUser) await authStore.hydrate()
  if (isAdmin.value) {
    await loadAdminSummary()
    await loadActiveAdminTab()
  }
})

watch(isAdmin, async (allowed) => {
  if (allowed) {
    await loadAdminSummary()
    await loadActiveAdminTab()
  }
})

watch(activeAdminTab, async () => {
  clearNotices()
  if (isAdmin.value) await loadActiveAdminTab()
})

async function loadActiveAdminTab() {
  if (activeAdminTab.value === 'ocean' && currents.value.length === 0) await loadCurrents()
  if (activeAdminTab.value === 'terrain' && terrainFeatures.value.length === 0) await loadTerrainFeatures()
  if (activeAdminTab.value === 'country' && countries.value.length === 0) await loadCountries()
  if (activeContentModule.value) await loadContentEntries()
}

function switchAdminTab(tab) {
  activeAdminTab.value = tab
}

async function loadAdminSummary() {
  try {
    adminSummary.value = await getAdminSummary()
  } catch {
    adminSummary.value = null
  }
}

function paginate(items, page, pageSize) {
  const safePage = Math.max(1, Number(page) || 1)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

function pageInfo(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return {
    total,
    page: clampPage(page, totalPages),
    pageSize,
    totalPages
  }
}

function clampPage(page, totalPages) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1)
  return Math.min(Math.max(1, Number(page) || 1), safeTotalPages)
}

function applyPage(target, page) {
  target.total = page.total || 0
  target.pageSize = page.pageSize || target.pageSize
  target.totalPages = Math.max(1, page.totalPages || 1)
  target.page = clampPage(page.page || 1, target.totalPages)
}

function changeLocalPage(key, page) {
  const info = key === 'ocean' ? oceanPageInfo.value : terrainPageInfo.value
  listPages[key] = clampPage(page, info.totalPages)
}

async function changeCountryPage(page) {
  countryPage.page = clampPage(page, countryPage.totalPages)
  await loadCountries()
}

async function changeContentPage(page) {
  contentPage.page = clampPage(page, contentPage.totalPages)
  await loadContentEntries()
}

async function loadCurrents() {
  error.value = ''
  try {
    currents.value = await listAdminOceanCurrents(filters)
    listPages.ocean = clampPage(listPages.ocean, oceanPageInfo.value.totalPages)
    if (!selectedId.value && currents.value[0]) selectCurrent(currents.value[0])
  } catch (err) {
    error.value = err.message || '加载失败'
  }
}

async function searchCurrents() {
  listPages.ocean = 1
  await loadCurrents()
}

function selectCurrent(current) {
  selectedId.value = current.id
  Object.assign(form, {
    id: current.id,
    name: current.name || '',
    name_en: current.name_en || current.nameEn || '',
    kind: current.kind || 'warm',
    basin: current.basin || '',
    system: current.system || '',
    direction: current.direction || '',
    source: current.source || '',
    effect: current.effect || '',
    textbookNote: current.textbookNote || '',
    enabled: current.enabled !== false,
    sortOrder: current.sortOrder ?? 100,
    influenceLat: current.influence?.center?.[0] ?? 0,
    influenceLng: current.influence?.center?.[1] ?? 0,
    influenceRadius: current.influence?.radius ?? 0.12,
    influenceRole: current.influence?.role || 'ocean-current'
  })
  tagText.value = (current.impactTags || []).join(', ')
  pathText.value = (current.path || []).map((point) => point.join(',')).join('\n')
  clearNotices()
}

function startCreate() {
  selectedId.value = ''
  Object.assign(form, defaultForm())
  tagText.value = ''
  pathText.value = '10,30\n12,34\n15,38'
  clearNotices()
}

async function saveCurrent() {
  saving.value = true
  clearNotices()
  try {
    const payload = buildPayload()
    const saved = selectedId.value
      ? await updateOceanCurrent(selectedId.value, payload)
      : await createOceanCurrent(payload)
    message.value = '已保存到后端数据库'
    await loadCurrents()
    selectCurrent(saved)
    message.value = '已保存到后端数据库'
  } catch (err) {
    error.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function toggleCurrentStatus() {
  if (!selectedId.value) return
  saving.value = true
  error.value = ''
  try {
    const saved = await setOceanCurrentStatus(selectedId.value, !form.enabled)
    await loadCurrents()
    selectCurrent(saved)
    message.value = saved.enabled ? '已启用' : '已停用'
  } catch (err) {
    error.value = err.message || '状态更新失败'
  } finally {
    saving.value = false
  }
}

async function removeCurrent() {
  if (!selectedId.value) return
  saving.value = true
  error.value = ''
  try {
    await deleteOceanCurrent(selectedId.value)
    message.value = '已删除'
    selectedId.value = ''
    Object.assign(form, defaultForm())
    await loadCurrents()
  } catch (err) {
    error.value = err.message || '删除失败'
  } finally {
    saving.value = false
  }
}

async function loadTerrainFeatures() {
  error.value = ''
  try {
    terrainFeatures.value = await listAdminTerrainFeatures(terrainFilters)
    listPages.terrain = clampPage(listPages.terrain, terrainPageInfo.value.totalPages)
    if (!selectedTerrainId.value && terrainFeatures.value[0]) selectTerrainFeature(terrainFeatures.value[0])
  } catch (err) {
    error.value = err.message || '地形加载失败'
  }
}

async function searchTerrainFeatures() {
  listPages.terrain = 1
  await loadTerrainFeatures()
}

function selectTerrainFeature(feature) {
  selectedTerrainId.value = feature.id
  Object.assign(terrainForm, {
    id: feature.id,
    name: feature.name || '',
    name_en: feature.name_en || feature.nameEn || '',
    type: feature.type || 'mountain',
    type_label: feature.type_label || feature.typeLabel || '',
    continent: feature.continent || '',
    region: feature.region || '',
    latitude: feature.latitude ?? 0,
    longitude: feature.longitude ?? 0,
    summary: feature.summary || '',
    formation_reason: feature.formation_reason || feature.formationReason || '',
    highest_point: feature.highest_point || feature.highestPoint || '',
    length: feature.length || '',
    area: feature.area || '',
    cover_image: feature.cover_image || feature.coverImage || '',
    enabled: feature.enabled !== false,
    sortOrder: feature.sortOrder ?? 100
  })
  countryCodeText.value = (feature.country_codes || feature.countryCodes || []).join(', ')
  terrainTagText.value = (feature.tags || []).join(', ')
  clearNotices()
}

function startCreateTerrain() {
  selectedTerrainId.value = ''
  Object.assign(terrainForm, defaultTerrainForm())
  countryCodeText.value = ''
  terrainTagText.value = ''
  clearNotices()
}

async function saveTerrainFeature() {
  saving.value = true
  clearNotices()
  try {
    const payload = buildTerrainPayload()
    const saved = selectedTerrainId.value
      ? await updateTerrainFeature(selectedTerrainId.value, payload)
      : await createTerrainFeature(payload)
    message.value = '地形内容已保存'
    await loadTerrainFeatures()
    selectTerrainFeature(saved)
    message.value = '地形内容已保存'
  } catch (err) {
    error.value = err.message || '地形保存失败'
  } finally {
    saving.value = false
  }
}

async function toggleTerrainStatus() {
  if (!selectedTerrainId.value) return
  saving.value = true
  error.value = ''
  try {
    const saved = await setTerrainFeatureStatus(selectedTerrainId.value, !terrainForm.enabled)
    await loadTerrainFeatures()
    selectTerrainFeature(saved)
    message.value = saved.enabled ? '地形已启用' : '地形已停用'
  } catch (err) {
    error.value = err.message || '地形状态更新失败'
  } finally {
    saving.value = false
  }
}

async function removeTerrainFeature() {
  if (!selectedTerrainId.value) return
  saving.value = true
  error.value = ''
  try {
    await deleteTerrainFeature(selectedTerrainId.value)
    message.value = '地形已删除'
    selectedTerrainId.value = ''
    Object.assign(terrainForm, defaultTerrainForm())
    await loadTerrainFeatures()
  } catch (err) {
    error.value = err.message || '地形删除失败'
  } finally {
    saving.value = false
  }
}

async function loadCountries() {
  error.value = ''
  try {
    const page = await listAdminCountriesPage({
      ...countryFilters,
      page: countryPage.page,
      pageSize: countryPage.pageSize
    })
    applyPage(countryPage, page)
    countries.value = page.items || []
    if (!selectedCountryCode.value && countries.value[0]) selectCountry(countries.value[0])
  } catch (err) {
    error.value = err.message || '国家文明加载失败'
  }
}

async function searchCountries() {
  countryPage.page = 1
  await loadCountries()
}

function selectCountry(country) {
  selectedCountryCode.value = country.code
  Object.assign(countryForm, {
    code: country.code || '',
    name: country.name || '',
    name_en: country.name_en || country.nameEn || '',
    continent: country.continent || '',
    region: country.region || '',
    capital: country.capital || '',
    latitude: country.latitude ?? 0,
    longitude: country.longitude ?? 0,
    population: country.population ?? 0,
    areaKm2: country.areaKm2 ?? 0,
    languageGroup: country.languageGroup || 'other',
    languageGroupLabel: country.languageGroupLabel || '多语 / 本地语',
    languageColor: country.languageColor || '#94a3b8',
    toneGroup: country.toneGroup || 'yellow',
    toneGroupLabel: country.toneGroupLabel || '黄色',
    toneColor: country.toneColor || '#ffd43b',
    summary: country.summary || '',
    cultureNote: country.cultureNote || '',
    coverImage: country.coverImage || '',
    enabled: country.enabled !== false,
    sortOrder: country.sortOrder ?? 100
  })
  countryLanguageText.value = (country.languages || []).join(', ')
  civilizationTagText.value = (country.civilizationTags || []).join(', ')
  clearNotices()
}

function startCreateCountry() {
  selectedCountryCode.value = ''
  Object.assign(countryForm, defaultCountryForm())
  countryLanguageText.value = ''
  civilizationTagText.value = ''
  clearNotices()
}

async function saveCountry() {
  saving.value = true
  clearNotices()
  try {
    const payload = buildCountryPayload()
    const saved = selectedCountryCode.value
      ? await updateCountryProfile(selectedCountryCode.value, payload)
      : await createCountryProfile(payload)
    message.value = '国家文明内容已保存'
    await loadCountries()
    selectCountry(saved)
    message.value = '国家文明内容已保存'
  } catch (err) {
    error.value = err.message || '国家文明保存失败'
  } finally {
    saving.value = false
  }
}

async function toggleCountryStatus() {
  if (!selectedCountryCode.value) return
  saving.value = true
  error.value = ''
  try {
    const saved = await setCountryProfileStatus(selectedCountryCode.value, !countryForm.enabled)
    await loadCountries()
    selectCountry(saved)
    message.value = saved.enabled ? '国家文明已启用' : '国家文明已停用'
  } catch (err) {
    error.value = err.message || '国家文明状态更新失败'
  } finally {
    saving.value = false
  }
}

async function removeCountry() {
  if (!selectedCountryCode.value) return
  saving.value = true
  error.value = ''
  try {
    await deleteCountryProfile(selectedCountryCode.value)
    message.value = '国家文明已删除'
    selectedCountryCode.value = ''
    Object.assign(countryForm, defaultCountryForm())
    await loadCountries()
  } catch (err) {
    error.value = err.message || '国家文明删除失败'
  } finally {
    saving.value = false
  }
}

async function loadContentEntries() {
  if (!activeContentModule.value) return
  error.value = ''
  try {
    const page = await listAdminContentEntriesPage(activeContentModule.value.id, {
      ...contentFilters,
      page: contentPage.page,
      pageSize: contentPage.pageSize
    })
    applyPage(contentPage, page)
    contentEntries.value = page.items || []
    const stillSelected = contentEntries.value.find((entry) => entry.entryId === selectedContentEntryId.value)
    if (stillSelected) selectContentEntry(stillSelected)
    else if (contentEntries.value[0]) selectContentEntry(contentEntries.value[0])
    else startCreateContent()
  } catch (err) {
    error.value = err.message || '通用内容加载失败'
  }
}

async function searchContentEntries() {
  contentPage.page = 1
  await loadContentEntries()
}

function selectContentEntry(entry) {
  selectedContentEntryId.value = entry.entryId
  Object.assign(contentForm, {
    entryId: entry.entryId || '',
    title: entry.title || '',
    subtitle: entry.subtitle || '',
    summary: entry.summary || '',
    enabled: entry.enabled !== false,
    sortOrder: entry.sortOrder ?? 100
  })
  contentPayloadText.value = JSON.stringify(entry.payload || {}, null, 2)
  clearNotices()
}

function startCreateContent() {
  selectedContentEntryId.value = ''
  Object.assign(contentForm, defaultContentForm())
  contentPayloadText.value = '{}'
  clearNotices()
}

async function saveContentEntry() {
  if (!activeContentModule.value) return
  saving.value = true
  clearNotices()
  try {
    const payload = buildContentPayload()
    const saved = selectedContentEntryId.value
      ? await updateContentEntry(activeContentModule.value.id, selectedContentEntryId.value, payload)
      : await createContentEntry(activeContentModule.value.id, payload)
    message.value = `${activeContentModule.value.label}内容已保存`
    await loadContentEntries()
    selectContentEntry(saved)
    message.value = `${activeContentModule.value.label}内容已保存`
  } catch (err) {
    error.value = err.message || '通用内容保存失败'
  } finally {
    saving.value = false
  }
}

async function toggleContentStatus() {
  if (!activeContentModule.value || !selectedContentEntryId.value) return
  saving.value = true
  error.value = ''
  try {
    const saved = await setContentEntryStatus(activeContentModule.value.id, selectedContentEntryId.value, !contentForm.enabled)
    await loadContentEntries()
    selectContentEntry(saved)
    message.value = saved.enabled ? '内容已启用' : '内容已停用'
  } catch (err) {
    error.value = err.message || '通用内容状态更新失败'
  } finally {
    saving.value = false
  }
}

async function removeContentEntry() {
  if (!activeContentModule.value || !selectedContentEntryId.value) return
  saving.value = true
  error.value = ''
  try {
    await deleteContentEntry(activeContentModule.value.id, selectedContentEntryId.value)
    message.value = '内容已删除'
    selectedContentEntryId.value = ''
    Object.assign(contentForm, defaultContentForm())
    await loadContentEntries()
  } catch (err) {
    error.value = err.message || '通用内容删除失败'
  } finally {
    saving.value = false
  }
}

async function handleContentImageFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploading.value = true
  clearNotices()
  try {
    const uploaded = await uploadContentImage(file)
    uploadFileName.value = uploaded.originalName || file.name
    contentImageUrl.value = uploaded.url
    message.value = '图片已上传，可复制 URL 或写入地形封面'
  } catch (err) {
    error.value = err.message || '图片上传失败'
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

function useUploadedImageForTerrain() {
  if (!contentImageUrl.value) return
  activeAdminTab.value = 'terrain'
  terrainForm.cover_image = contentImageUrl.value
  message.value = '已写入当前地形封面 URL'
}

function useUploadedImageForCountry() {
  if (!contentImageUrl.value) return
  activeAdminTab.value = 'country'
  countryForm.coverImage = contentImageUrl.value
  message.value = '已写入当前国家封面 URL'
}

function buildPayload() {
  return {
    id: form.id,
    name: form.name,
    name_en: form.name_en,
    kind: form.kind,
    basin: form.basin,
    system: form.system,
    direction: form.direction,
    source: form.source,
    effect: form.effect,
    impactTags: splitList(tagText.value),
    textbookNote: form.textbookNote,
    influence: {
      center: [Number(form.influenceLat), Number(form.influenceLng)],
      radius: Number(form.influenceRadius),
      role: form.influenceRole
    },
    path: parsePathText(pathText.value),
    enabled: form.enabled,
    sortOrder: Number(form.sortOrder) || 0
  }
}

function buildTerrainPayload() {
  return {
    id: terrainForm.id,
    name: terrainForm.name,
    name_en: terrainForm.name_en,
    type: terrainForm.type,
    type_label: terrainForm.type_label,
    continent: terrainForm.continent,
    region: terrainForm.region,
    country_codes: splitList(countryCodeText.value),
    latitude: Number(terrainForm.latitude),
    longitude: Number(terrainForm.longitude),
    summary: terrainForm.summary,
    formation_reason: terrainForm.formation_reason,
    highest_point: terrainForm.highest_point,
    length: terrainForm.length,
    area: terrainForm.area,
    tags: splitList(terrainTagText.value),
    cover_image: terrainForm.cover_image,
    enabled: terrainForm.enabled,
    sortOrder: Number(terrainForm.sortOrder) || 0
  }
}

function buildCountryPayload() {
  return {
    code: String(countryForm.code || '').trim().toUpperCase(),
    name: countryForm.name,
    name_en: countryForm.name_en,
    continent: countryForm.continent,
    region: countryForm.region,
    capital: countryForm.capital,
    latitude: Number(countryForm.latitude),
    longitude: Number(countryForm.longitude),
    population: Number(countryForm.population) || 0,
    areaKm2: Number(countryForm.areaKm2) || 0,
    languages: splitList(countryLanguageText.value),
    languageGroup: countryForm.languageGroup,
    languageGroupLabel: countryForm.languageGroupLabel,
    languageColor: countryForm.languageColor,
    toneGroup: countryForm.toneGroup,
    toneGroupLabel: countryForm.toneGroupLabel,
    toneColor: countryForm.toneColor,
    summary: countryForm.summary,
    cultureNote: countryForm.cultureNote,
    civilizationTags: splitList(civilizationTagText.value),
    coverImage: countryForm.coverImage,
    enabled: countryForm.enabled,
    sortOrder: Number(countryForm.sortOrder) || 0
  }
}

function buildContentPayload() {
  return {
    entryId: contentForm.entryId,
    title: contentForm.title,
    subtitle: contentForm.subtitle,
    summary: contentForm.summary,
    payload: parseJsonPayload(contentPayloadText.value),
    enabled: contentForm.enabled,
    sortOrder: Number(contentForm.sortOrder) || 0
  }
}

function parseJsonPayload(value) {
  const text = String(value || '').trim()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('结构化内容 JSON 格式不正确')
  }
}

function applyLanguagePreset() {
  const group = languageGroupOptions.find((item) => item.id === countryForm.languageGroup)
  if (!group) return
  countryForm.languageGroupLabel = group.label
  countryForm.languageColor = group.color
}

function applyTonePreset() {
  const tone = toneGroupOptions.find((item) => item.id === countryForm.toneGroup)
  if (!tone) return
  countryForm.toneGroupLabel = tone.label
  countryForm.toneColor = tone.color
}

function parsePathText(value) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,，\s]+/).filter(Boolean).map(Number))
}

function splitList(value) {
  return String(value || '')
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function clearNotices() {
  message.value = ''
  error.value = ''
}

function defaultForm() {
  return {
    id: '',
    name: '',
    name_en: '',
    kind: 'warm',
    basin: '',
    system: '',
    direction: '',
    source: '',
    effect: '',
    textbookNote: '',
    enabled: true,
    sortOrder: 100,
    influenceLat: 0,
    influenceLng: 0,
    influenceRadius: 0.12,
    influenceRole: 'warm-moist'
  }
}

function defaultTerrainForm() {
  return {
    id: '',
    name: '',
    name_en: '',
    type: 'mountain',
    type_label: '山脉',
    continent: '',
    region: '',
    latitude: 0,
    longitude: 0,
    summary: '',
    formation_reason: '',
    highest_point: '',
    length: '',
    area: '',
    cover_image: '',
    enabled: true,
    sortOrder: 100
  }
}

function defaultCountryForm() {
  return {
    code: '',
    name: '',
    name_en: '',
    continent: '亚洲',
    region: '',
    capital: '',
    latitude: 0,
    longitude: 0,
    population: 0,
    areaKm2: 0,
    languageGroup: 'other',
    languageGroupLabel: '多语 / 本地语',
    languageColor: '#94a3b8',
    toneGroup: 'yellow',
    toneGroupLabel: '黄色',
    toneColor: '#ffd43b',
    summary: '',
    cultureNote: '',
    coverImage: '',
    enabled: true,
    sortOrder: 100
  }
}

function defaultContentForm() {
  return {
    entryId: '',
    title: '',
    subtitle: '',
    summary: '',
    enabled: true,
    sortOrder: 100
  }
}
</script>
