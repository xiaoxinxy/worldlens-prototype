<template>
  <main v-if="place" class="detail-view page-view" :style="heroStyle">
    <RouterLink class="floating-back" to="/">返回地球</RouterLink>

    <section class="detail-hero" :style="heroStyle">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <p class="eyebrow">{{ place.type }} · {{ place.continent }}</p>
        <h1>{{ place.name }}</h1>
        <p class="detail-intro">{{ place.intro }}</p>
        <div class="keyword-list">
          <span v-for="keyword in place.keywords" :key="keyword">{{ keyword }}</span>
        </div>
        <div class="place-facts-row">
          <span>{{ place.type }}</span>
          <span>{{ place.continent }}</span>
          <span>{{ coordinateText }}</span>
        </div>
        <div class="detail-actions">
          <button class="primary-btn favorite-action" @click="favoriteStore.toggle(place.id, favoriteMeta)">
            {{ favoriteStore.has(place.id) ? '已收藏' : '收藏地点' }}
          </button>
          <RouterLink class="ghost-btn" :to="{ path: '/', query: { focus: place.slug } }">
            回到地球定位
          </RouterLink>
          <RouterLink class="ghost-btn" :to="{ path: '/gallery', query: { q: place.continent } }">
            探索附近
          </RouterLink>
          <a class="ghost-btn" :href="wikiHref" target="_blank" rel="noreferrer">
            维基百科
          </a>
        </div>
      </div>

      <div class="stat-strip glass-card">
        <div v-for="item in place.stats" :key="item.label">
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section v-if="isDetailedPlace" class="detail-section detail-overview">
      <article class="overview-lede glass-card">
        <p class="eyebrow">档案概览</p>
        <h2>{{ place.name }} 的文化剖面</h2>
        <p>{{ place.intro }}</p>
        <div class="overview-tags">
          <span v-for="keyword in place.keywords.slice(0, 5)" :key="keyword">{{ keyword }}</span>
        </div>
      </article>
      <aside class="overview-panel glass-card">
        <div v-for="item in place.stats.slice(0, 4)" :key="item.label">
          <small>{{ item.label }}</small>
          <strong>{{ item.value }}</strong>
        </div>
        <a class="mini-btn wiki-link" :href="wikiHref" target="_blank" rel="noreferrer">维基百科</a>
      </aside>
    </section>

    <section v-if="isDetailedPlace && !signatureStories.length" class="detail-section detail-focus-grid">
      <article
        v-for="card in focusCards"
        :key="card.title"
        class="focus-card glass-card"
        v-lazy-bg="{ image: card.imageUrl, overlay: 'linear-gradient(180deg, rgba(2,6,10,.12), rgba(2,6,10,.82))', width: 900 }"
      >
        <span>{{ card.kicker }}</span>
        <h3>{{ card.title }}</h3>
        <p>{{ card.content }}</p>
      </article>
    </section>

    <section v-if="isDetailedPlace && signatureStories.length" class="detail-section signature-section">
      <div class="section-heading signature-heading">
        <p class="eyebrow">国家特写</p>
        <h2>{{ detailProfile.label }}</h2>
        <p>{{ detailProfile.summary }}</p>
      </div>

      <div class="signature-grid">
        <article
          v-for="(story, index) in signatureStories"
          :key="story.title"
          :class="['signature-card', `signature-card-${index}`]"
        >
          <div class="signature-image" v-lazy-bg="{ image: story.imageUrl, width: 900 }"></div>
          <div class="signature-copy">
            <span>{{ story.kicker }}</span>
            <h3>{{ story.title }}</h3>
            <p>{{ story.content }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-else-if="isDetailedPlace" class="detail-section">
      <div class="section-heading">
        <p class="eyebrow">文化层次</p>
        <h2>从地理、历史与日常进入 {{ place.name }}</h2>
        <p>通过文化、地理与记忆理解一个地方。</p>
      </div>

      <nav class="detail-jumpbar glass-card" aria-label="文化模块">
        <a v-for="section in cultureSections" :key="section.title" :href="`#${section.id}`">
          {{ section.title }}
        </a>
      </nav>

      <div class="culture-story-list">
        <CulturalSection
          v-for="section in cultureSections"
          :key="section.title"
          :id="section.id"
          :title="section.title"
          :content="section.content"
          :image-url="section.imageUrl"
        />
      </div>
    </section>

    <section v-else class="detail-section brief-country-section">
      <article class="brief-country-card glass-card">
        <div
          :class="['brief-country-image', { 'text-cover-media': !place.coverImage }]"
          v-lazy-bg="{ image: place.coverImage, width: 900 }"
        >
          <strong v-if="!place.coverImage">{{ place.name }}</strong>
        </div>
        <div>
          <p class="eyebrow">国家档案</p>
          <h2>{{ place.name }}</h2>
          <p>{{ place.intro }}</p>
          <div class="brief-facts">
            <span v-for="item in place.stats" :key="item.label">
              <small>{{ item.label }}</small>
              <strong>{{ item.value }}</strong>
            </span>
          </div>
          <a class="primary-btn wiki-link" :href="wikiHref" target="_blank" rel="noreferrer">
            查看维基百科
          </a>
        </div>
      </article>
    </section>

    <section v-if="isDetailedPlace" class="detail-section two-column-section">
      <article class="glass-card narrative-card">
        <p class="eyebrow">时间线</p>
        <h2>文明时间线</h2>
        <ol class="timeline-list">
          <li v-for="item in place.timeline" :key="item">{{ item }}</li>
        </ol>
      </article>
      <article class="glass-card narrative-card">
        <p class="eyebrow">地方札记</p>
        <h2>文化札记</h2>
        <ul class="fact-list">
          <li v-for="fact in place.facts" :key="fact">{{ fact }}</li>
        </ul>
      </article>
    </section>

    <section v-if="isDetailedPlace" class="detail-section gallery-section">
      <div class="section-heading">
        <p class="eyebrow">图像记忆</p>
        <h2>图像中的地方记忆</h2>
      </div>
      <GalleryGrid :gallery="place.gallery" />
    </section>

    <section v-if="countryTerrain.length" class="detail-section related-section country-terrain-section">
      <div class="section-heading">
        <p class="eyebrow">Related Terrain</p>
        <h2>{{ place.name }} 的地球骨架</h2>
        <p>从山脉、高原、沙漠、河流和海岸地貌理解这个国家为什么长成今天这样。</p>
      </div>
      <div class="related-grid">
        <RouterLink
          v-for="item in countryTerrain"
          :key="item.id"
          class="related-card glass-card"
          :to="`/terrain/${item.id}`"
          v-lazy-bg="{ image: item.cover_image, overlay: 'linear-gradient(180deg, rgba(2,4,7,.18), rgba(2,4,7,.8))', width: 720 }"
        >
          <span>{{ item.type_label }}</span>
          <strong>{{ item.name }}</strong>
        </RouterLink>
      </div>
    </section>

    <section v-if="relatedPlaces.length" class="detail-section related-section">
      <div class="section-heading">
        <p class="eyebrow">相关地点</p>
        <h2>相关地点推荐</h2>
      </div>
      <div class="related-grid">
        <RouterLink
          v-for="item in relatedPlaces"
          :key="item.id"
          class="related-card glass-card"
          :to="`/place/${item.slug}`"
          v-lazy-bg="{ image: item.coverImage, overlay: 'linear-gradient(180deg, rgba(2,4,7,.18), rgba(2,4,7,.78))', width: 720 }"
        >
          <span>{{ item.continent }}</span>
          <strong>{{ item.name }}</strong>
        </RouterLink>
      </div>
    </section>

    <DetailAiAssistant
      subject-type="place"
      :subject-id="place.id"
      :subject-name="place.name"
      :context="detailAiContext"
    />
  </main>

  <main v-else class="not-found page-view">
    <div class="glass-card">
      <h1>没有找到这个地点</h1>
      <p>回到地球，选择另一处文明纹理。</p>
      <RouterLink class="primary-btn" to="/">返回地球</RouterLink>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPlace, getPlaces } from '../api/placeApi'
import { getCountryTerrain } from '../api/terrainApi'
import { formatCoordinate } from '../utils/geo'
import { optimizedImageUrl } from '../utils/imageUrl'
import { useFavoriteStore } from '../stores/favorite'
import { useHistoryStore } from '../stores/history'
import CulturalSection from '../components/CulturalSection.vue'
import GalleryGrid from '../components/GalleryGrid.vue'
import DetailAiAssistant from '../components/ai/DetailAiAssistant.vue'
import { detailProfileForPlace } from '../data/detailProfiles'
import { lazyBackground as vLazyBg } from '../directives/lazyBackground'

const route = useRoute()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()
const place = ref(null)
const relatedPlaces = ref([])
const countryTerrain = ref([])
const detailedCountryIds = new Set(['CHN', 'USA', 'JPN', 'GBR', 'FRA', 'DEU', 'RUS', 'ITA', 'ESP', 'IND', 'KOR', 'AUS', 'BRA', 'EGY', 'TUR', 'ZAF'])
const countryCodeByPlaceId = {
  china: 'CHN',
  japan: 'JPN',
  india: 'IND',
  france: 'FRA',
  italy: 'ITA',
  uk: 'GBR',
  egypt: 'EGY',
  'south-africa': 'ZAF',
  usa: 'USA',
  brazil: 'BRA',
  australia: 'AUS'
}

onMounted(loadPlace)

watch(
  () => route.params.slug,
  loadPlace
)

async function loadPlace() {
  place.value = await getPlace(route.params.slug)
  countryTerrain.value = []
  if (place.value) {
    historyStore.add(place.value)
    const places = await getPlaces()
    relatedPlaces.value = places
      .filter((item) => item.id !== place.value.id && item.continent === place.value.continent)
      .slice(0, 3)
    const countryCode = place.value.geoFeatureId || countryCodeByPlaceId[place.value.id]
    if (countryCode) {
      countryTerrain.value = (await getCountryTerrain(countryCode)).slice(0, 6)
    }
  }
}

const heroStyle = computed(() => {
  const coverImage = place.value?.coverImage
  return {
    '--hero-image': coverImage
      ? `url('${optimizedImageUrl(coverImage, { width: 1440, quality: 78, wikiWidth: 1600 })}')`
      : 'none'
  }
})

const isDetailedPlace = computed(() => {
  if (!place.value) return false
  if (place.value.type !== '国家') return true
  return place.value.detailLevel === 'full' || detailedCountryIds.has(place.value.geoFeatureId)
})

const coordinateText = computed(() => {
  if (!place.value) return ''
  return `${formatCoordinate(place.value.lat, 'lat')} · ${formatCoordinate(place.value.lng, 'lng')}`
})

const wikiHref = computed(() => {
  const name = place.value?.nameEn || place.value?.name || ''
  return place.value?.wikiUrl || `https://zh.wikipedia.org/wiki/${encodeURIComponent(name.replaceAll(' ', '_'))}`
})

const favoriteMeta = computed(() => ({
  itemType: 'place',
  title: place.value?.name || '',
  coverImage: place.value?.coverImage || ''
}))

const detailAiContext = computed(() => {
  if (!place.value) return {}
  return {
    type: place.value.type,
    continent: place.value.continent,
    coordinates: [place.value.lat, place.value.lng],
    introduction: place.value.intro,
    keywords: place.value.keywords,
    statistics: place.value.stats,
    sections: place.value.sections,
    timeline: place.value.timeline,
    facts: place.value.facts
  }
})

const detailProfile = computed(() => (place.value ? detailProfileForPlace(place.value) : null))

const signatureStories = computed(() => {
  if (!detailProfile.value) return []
  return detailProfile.value.stories.map((story) => ({
    ...story,
    imageUrl: story.imageUrl || sectionImage(story.imageKey || 'geography')
  }))
})

const cultureSections = computed(() => {
  if (!place.value) return []
  const sections = place.value.sections
  return [
    {
      id: 'geography',
      title: '地理与环境',
      content: sections.geography,
      imageUrl: sectionImage('geography')
    },
    {
      id: 'history',
      title: '历史与文明',
      content: sections.history,
      imageUrl: sectionImage('history')
    },
    {
      id: 'food',
      title: '饮食与生活',
      content: `${sections.food} ${sections.lifestyle}`,
      imageUrl: sectionImage('food')
    },
    {
      id: 'festival',
      title: '节日与信仰',
      content: sections.festival,
      imageUrl: sectionImage('festival')
    },
    {
      id: 'architecture',
      title: '建筑与艺术',
      content: `${sections.architecture} ${sections.clothing}`,
      imageUrl: sectionImage('architecture')
    },
    {
      id: 'music',
      title: '音乐与日常',
      content: sections.music,
      imageUrl: sectionImage('lifestyle')
    }
  ]
})

const focusCards = computed(() => {
  if (!place.value) return []
  const sections = place.value.sections
  return [
    {
      kicker: '地貌线索',
      title: '地理如何塑造生活',
      content: sectionSnippet(sections.geography),
      imageUrl: sectionImage('geography')
    },
    {
      kicker: '文明脉络',
      title: '历史留下的城市纹理',
      content: sectionSnippet(sections.history),
      imageUrl: sectionImage('history')
    },
    {
      kicker: '日常现场',
      title: '饮食、街道与当代节奏',
      content: sectionSnippet(`${sections.food} ${sections.lifestyle}`),
      imageUrl: sectionImage('food')
    }
  ]
})

function sectionSnippet(text = '') {
  return String(text).replace(/\s+/g, ' ').slice(0, 86)
}

function sectionImage(key) {
  return place.value?.sectionImages?.[key]
    || place.value?.gallery?.find((item) => item.image)?.image
    || place.value?.coverImage
    || ''
}
</script>
