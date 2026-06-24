<template>
  <Teleport to="body">
    <div v-if="authStore.authOpen" class="account-modal-backdrop" @click.self="authStore.closeAuth">
      <section
        class="account-modal"
        :class="{ 'explorer-dashboard-mode': authStore.isAuthenticated }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
      >
        <button class="account-modal-close" type="button" aria-label="关闭" @click="authStore.closeAuth">×</button>

        <template v-if="!authStore.isAuthenticated">
          <div class="account-modal-visual">
            <div class="account-scanline"></div>
            <div class="account-orbit-stack">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="account-identity-badge">
              <span class="account-avatar large">
                <img v-if="activeAvatar" :src="activeAvatar" alt="" />
                <b v-if="!activeAvatar">{{ initials }}</b>
              </span>
              <div>
                <small>WorldLens ID</small>
                <strong>{{ authStore.nickname }}</strong>
              </div>
            </div>

            <div class="auth-proof-panel">
              <strong>同步你的地球探索</strong>
              <span>登录后保存收藏、足迹、AI探索记录和头像昵称。</span>
            </div>
          </div>

          <div class="account-modal-content">
            <header class="account-modal-heading">
              <p>{{ authStore.authMode === 'register' ? 'Create Explorer' : 'Explorer Access' }}</p>
              <h2 id="account-modal-title">{{ modalTitle }}</h2>
            </header>

            <div class="auth-tabs" role="tablist" aria-label="账户模式">
              <button type="button" :class="{ active: authStore.authMode === 'login' }" @click="authStore.authMode = 'login'">
                登录
              </button>
              <button type="button" :class="{ active: authStore.authMode === 'register' }" @click="authStore.authMode = 'register'">
                注册
              </button>
            </div>

            <div class="auth-benefit-grid">
              <span>探索进度</span>
              <span>收藏世界</span>
              <span>AI历史</span>
            </div>

            <form v-if="authStore.authMode === 'login'" class="auth-form premium" @submit.prevent="submitLogin">
              <label>
                <span>用户名</span>
                <input v-model.trim="loginForm.username" autocomplete="username" required />
              </label>
              <label>
                <span>密码</span>
                <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
              </label>
              <button class="primary-btn full" type="submit" :disabled="authStore.loading">
                {{ authStore.loading ? '登录中' : '进入探索档案' }}
              </button>
            </form>

            <form v-else class="auth-form premium" @submit.prevent="submitRegister">
              <div class="auth-field-grid">
                <label>
                  <span>用户名</span>
                  <input v-model.trim="registerForm.username" autocomplete="username" required />
                </label>
                <label>
                  <span>昵称</span>
                  <input v-model.trim="registerForm.nickname" autocomplete="nickname" placeholder="例如：海洋观察员" />
                </label>
              </div>

              <label>
                <span>密码</span>
                <input v-model="registerForm.password" type="password" autocomplete="new-password" required />
              </label>

              <div class="avatar-file-picker">
                <span class="account-avatar large">
                  <img v-if="registerForm.avatarUrl" :src="registerForm.avatarUrl" alt="" />
                  <b v-if="!registerForm.avatarUrl">{{ registerInitials }}</b>
                </span>
                <div>
                  <strong>{{ registerForm.avatarFileName || '选择本地头像文件' }}</strong>
                  <small>支持 PNG / JPG / WebP，自动压缩成账号头像。</small>
                  <label class="ghost-btn avatar-upload-btn">
                    选择文件
                    <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleAvatarFile($event, 'register')" />
                  </label>
                </div>
              </div>

              <button class="primary-btn full" type="submit" :disabled="authStore.loading">
                {{ authStore.loading ? '创建中' : '创建账户' }}
              </button>
            </form>

            <p v-if="authStore.error" class="account-error">{{ authStore.error }}</p>
          </div>
        </template>

        <template v-else>
          <aside class="explorer-archive-panel">
            <div class="archive-grid-field"></div>
            <header class="archive-hero">
              <span>Explorer Dashboard</span>
              <h2 id="account-modal-title">我的世界探索档案馆</h2>
              <p>这里记录你在 WorldLens 中抵达过的国家、收藏的地点和 AI 带你开启的世界线。</p>
            </header>

            <section class="explorer-level-card">
              <div class="level-orbit" aria-hidden="true">
                <span>{{ explorerLevel.level }}</span>
              </div>
              <div>
                <small>探索等级</small>
                <strong>{{ explorerLevel.title }}</strong>
                <p>{{ explorerLevel.description }}</p>
              </div>
            </section>

            <section class="world-progress-card">
              <div class="archive-section-head">
                <span>世界探索进度</span>
                <strong>{{ worldProgress }}%</strong>
              </div>
              <div class="archive-progress-track">
                <i :style="{ width: `${worldProgress}%` }"></i>
              </div>
              <small>{{ exploredCountryCount }} / 195 个国家档案已点亮</small>
            </section>

            <section class="continent-unlock-card">
              <div class="archive-section-head">
                <span>已解锁大洲</span>
                <strong>{{ unlockedContinentCount }}/6</strong>
              </div>
              <div class="continent-grid">
                <span
                  v-for="continent in continentUnlocks"
                  :key="continent.name"
                  :class="{ unlocked: continent.unlocked }"
                >
                  <i></i>
                  {{ continent.name }}
                  <b>{{ continent.unlocked ? '已解锁' : '待探索' }}</b>
                </span>
              </div>
            </section>

            <section class="archive-stats-grid" aria-label="探索统计">
              <div v-for="stat in archiveStats" :key="stat.label">
                <small>{{ stat.label }}</small>
                <strong>{{ stat.value }}</strong>
                <span>{{ stat.hint }}</span>
              </div>
            </section>

            <section class="archive-recent-card">
              <div class="archive-section-head">
                <span>最近探索</span>
                <strong>{{ recentArchiveItems.length }}</strong>
              </div>
              <div class="archive-chip-list" :class="{ empty: !recentArchiveItems.length }">
                <RouterLink
                  v-for="item in recentArchiveItems"
                  :key="item.key"
                  :to="focusRouteFor(item)"
                  @click="authStore.closeAuth"
                >
                  {{ item.title }}
                </RouterLink>
                <span v-if="!recentArchiveItems.length">还没有探索记录</span>
              </div>
            </section>
          </aside>

          <section class="explorer-dashboard-content">
            <header class="explorer-profile-strip">
              <div class="profile-summary explorer-profile-summary">
                <span class="account-avatar large">
                  <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" alt="" />
                  <b v-if="!profileForm.avatarUrl">{{ initials }}</b>
                </span>
                <div>
                  <small>@{{ authStore.currentUser?.username }}</small>
                  <strong>{{ authStore.currentUser?.nickname }}</strong>
                  <span>WorldLens Explorer · Explorer Since 2025</span>
                  <em v-if="authStore.currentUser?.isAdmin">管理员权限</em>
                </div>
              </div>
              <button class="ghost-btn compact-logout" type="button" :disabled="authStore.loading" @click="logout">
                退出登录
              </button>
            </header>

            <div class="explorer-dashboard-scroll">
              <section class="dashboard-module ai-history-module">
                <div class="dashboard-module-head">
                  <div>
                    <span>AI探索历史</span>
                    <h3>AI 带你去过哪里</h3>
                  </div>
                  <small>{{ aiHistory.length }} 次</small>
                </div>
                <div class="ai-history-list" :class="{ empty: !recentAiHistory.length }">
                  <article v-for="entry in recentAiHistory" :key="entry.id">
                    <small>{{ entry.moduleTitle || 'WorldLens AI' }}</small>
                    <strong>{{ entry.question }}</strong>
                    <span>{{ entry.country || entry.target || entry.title }}</span>
                  </article>
                  <p v-if="!recentAiHistory.length">完成一次 AI 探索后，这里会生成你的探索轨迹。</p>
                </div>
              </section>

              <section class="dashboard-module favorite-world-module">
                <div class="dashboard-module-head">
                  <div>
                    <span>我的收藏世界</span>
                    <h3>可以再次定位的地点</h3>
                  </div>
                  <small>{{ favoriteEntries.length }} 个</small>
                </div>
                <div class="favorite-world-grid" :class="{ empty: !favoriteEntries.length }">
                  <RouterLink
                    v-for="item in favoriteEntries"
                    :key="item.key"
                    :to="focusRouteFor(item)"
                    @click="authStore.closeAuth"
                  >
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.subtitle || '收藏地点' }}</span>
                  </RouterLink>
                  <p v-if="!favoriteEntries.length">收藏国家、海洋或地形后，它们会成为你的个人世界地图。</p>
                </div>
              </section>

              <section class="dashboard-module achievements-module">
                <div class="dashboard-module-head">
                  <div>
                    <span>探索成就</span>
                    <h3>你的成长轨迹</h3>
                  </div>
                  <small>{{ unlockedAchievementCount }}/{{ achievements.length }}</small>
                </div>
                <div class="achievement-grid">
                  <article
                    v-for="achievement in achievements"
                    :key="achievement.title"
                    :class="{ unlocked: achievement.unlocked }"
                  >
                    <i></i>
                    <strong>{{ achievement.title }}</strong>
                    <span>{{ achievement.description }}</span>
                  </article>
                </div>
              </section>

              <form class="dashboard-module account-settings-card" @submit.prevent="submitProfile">
                <div class="dashboard-module-head">
                  <div>
                    <span>账户信息</span>
                    <h3>轻量维护身份</h3>
                  </div>
                </div>

                <div class="auth-field-grid">
                  <label>
                    <span>昵称</span>
                    <input v-model.trim="profileForm.nickname" autocomplete="nickname" required />
                  </label>
                  <div class="avatar-file-picker compact">
                    <span class="account-avatar">
                      <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" alt="" />
                      <b v-if="!profileForm.avatarUrl">{{ initials }}</b>
                    </span>
                    <div>
                      <strong>{{ profileForm.avatarFileName || '更换头像' }}</strong>
                      <label class="ghost-btn avatar-upload-btn">
                        选择文件
                        <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleAvatarFile($event, 'profile')" />
                      </label>
                    </div>
                  </div>
                </div>

                <div class="account-form-actions">
                  <button class="primary-btn full" type="submit" :disabled="authStore.loading">
                    {{ authStore.loading ? '保存中' : '保存资料' }}
                  </button>
                  <button class="ghost-btn full" type="button" :disabled="authStore.loading" @click="logout">
                    退出登录
                  </button>
                </div>
              </form>

              <p v-if="authStore.error" class="account-error">{{ authStore.error }}</p>
            </div>
          </section>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { uploadAvatar } from '../../api/fileApi'
import { useAuthStore } from '../../stores/auth'
import { useFavoriteStore } from '../../stores/favorite'
import { useHistoryStore } from '../../stores/history'

const AI_HISTORY_KEY = 'worldlens:ai-exploration-history'

const authStore = useAuthStore()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  avatarUrl: '',
  avatarFileName: '',
  password: ''
})

const profileForm = reactive({
  nickname: '',
  avatarUrl: '',
  avatarFileName: ''
})

const aiHistory = ref([])

const emptyDashboard = {
  favoriteCount: 0,
  historyCount: 0,
  recentFavorites: [],
  recentHistory: [],
  typeStats: []
}

const levelTiers = [
  { min: 80, level: 'Lv.5', title: 'World Master', description: '你已经拥有一份成熟的世界观察档案。' },
  { min: 40, level: 'Lv.4', title: 'Pathfinder', description: '你正在把不同大陆连接成自己的路线。' },
  { min: 18, level: 'Lv.3', title: 'Navigator', description: '你的探索开始形成清晰的方向感。' },
  { min: 6, level: 'Lv.2', title: 'Explorer', description: '你已经不只是浏览，而是在持续发现世界。' },
  { min: 0, level: 'Lv.1', title: 'Traveler', description: '第一条足迹会点亮你的 WorldLens 档案。' }
]

const continentRules = [
  { name: '亚洲', keywords: ['亚洲', '中国', '日本', '印度', '韩国', '新加坡', '蒙古', '不丹', '阿曼', '格鲁吉亚', '土耳其', '泰国', '越南'] },
  { name: '欧洲', keywords: ['欧洲', '冰岛', '芬兰', '挪威', '英国', '法国', '德国', '意大利', '西班牙', '俄罗斯'] },
  { name: '北美洲', keywords: ['北美', '美国', '加拿大', '墨西哥', '格陵兰'] },
  { name: '南美洲', keywords: ['南美', '巴西', '秘鲁', '阿根廷', '智利', '马丘比丘'] },
  { name: '非洲', keywords: ['非洲', '埃及', '南非', '摩洛哥', '马达加斯加', '撒哈拉'] },
  { name: '大洋洲', keywords: ['大洋洲', '澳大利亚', '新西兰', '图瓦卢', '太平洋'] }
]

const dashboard = computed(() => authStore.dashboard || emptyDashboard)
const recentHistory = computed(() => dashboard.value.recentHistory || [])
const recentFavorites = computed(() => dashboard.value.recentFavorites || [])

const historyEntries = computed(() => uniqueEntries([
  ...historyStore.items.map(normalizeHistoryItem),
  ...recentHistory.value.map(normalizeHistoryItem)
]))

const favoriteEntries = computed(() => uniqueEntries([
  ...recentFavorites.value.map(normalizeFavoriteItem),
  ...favoriteStore.ids.map((id) => normalizeFavoriteItem({ itemId: id, title: id, itemType: '收藏地点' }))
]).slice(0, 6))

const recentArchiveItems = computed(() => historyEntries.value.slice(0, 5))
const recentAiHistory = computed(() => aiHistory.value.slice(0, 4))

const exploredCountryCount = computed(() => {
  const uniqueCount = new Set(historyEntries.value.map((item) => item.key)).size
  return Math.min(195, Math.max(uniqueCount, Number(dashboard.value.historyCount) || 0))
})

const explorationCount = computed(() => {
  const visited = historyEntries.value.reduce((total, item) => total + (Number(item.visitedCount) || 1), 0)
  return Math.max(visited, Number(dashboard.value.historyCount) || 0)
})

const worldProgress = computed(() => Math.min(100, Math.round((exploredCountryCount.value / 195) * 100)))

const explorerScore = computed(() => (
  explorationCount.value +
  Number(dashboard.value.favoriteCount || 0) * 2 +
  aiHistory.value.length * 2
))

const explorerLevel = computed(() => levelTiers.find((tier) => explorerScore.value >= tier.min) || levelTiers.at(-1))

const unlockedContinents = computed(() => {
  const text = [
    ...historyEntries.value,
    ...favoriteEntries.value,
    ...aiHistory.value
  ].map(searchableText).join(' ')
  return new Set(
    continentRules
      .filter((continent) => continent.keywords.some((keyword) => text.includes(keyword)))
      .map((continent) => continent.name)
  )
})

const continentUnlocks = computed(() => continentRules.map((continent) => ({
  name: continent.name,
  unlocked: unlockedContinents.value.has(continent.name)
})))

const unlockedContinentCount = computed(() => continentUnlocks.value.filter((item) => item.unlocked).length)

const archiveStats = computed(() => [
  { label: '已探索国家', value: exploredCountryCount.value, hint: 'Country Logs' },
  { label: '探索次数', value: explorationCount.value, hint: 'Flights' },
  { label: '收藏地点', value: Number(dashboard.value.favoriteCount) || favoriteEntries.value.length, hint: 'Saved' },
  { label: 'AI探索次数', value: aiHistory.value.length, hint: 'AI Runs' }
])

const achievements = computed(() => [
  { title: '首次探索', description: '完成第一条地球足迹', unlocked: exploredCountryCount.value > 0 },
  { title: '探索10个国家', description: '形成稳定的探索习惯', unlocked: exploredCountryCount.value >= 10 },
  { title: '解锁亚洲', description: '点亮第一块文明大陆', unlocked: unlockedContinents.value.has('亚洲') },
  { title: '首次使用AI探索', description: '让 AI 带你抵达目标', unlocked: aiHistory.value.length > 0 },
  { title: '完成100次探索', description: '成为深度世界观察者', unlocked: explorationCount.value >= 100 }
])

const unlockedAchievementCount = computed(() => achievements.value.filter((item) => item.unlocked).length)

const modalTitle = computed(() => (
  authStore.authMode === 'register' ? '创建新的探索档案' : '登录后同步收藏与足迹'
))

const activeAvatar = computed(() => profileForm.avatarUrl || registerForm.avatarUrl || authStore.avatarUrl)
const initials = computed(() => makeInitials(authStore.nickname || authStore.currentUser?.username || 'WL'))
const registerInitials = computed(() => makeInitials(registerForm.nickname || registerForm.username || 'WL'))

watch(
  () => authStore.currentUser,
  (user) => {
    profileForm.nickname = user?.nickname || ''
    profileForm.avatarUrl = user?.avatarUrl || ''
    profileForm.avatarFileName = ''
  },
  { immediate: true }
)

watch(
  () => authStore.authOpen,
  (open) => {
    if (!open) return
    loadAiHistory()
    if (authStore.isAuthenticated) authStore.hydrateDashboard()
  }
)

onMounted(() => {
  loadAiHistory()
  window.addEventListener('storage', loadAiHistory)
  window.addEventListener('worldlens:ai-history-updated', loadAiHistory)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', loadAiHistory)
  window.removeEventListener('worldlens:ai-history-updated', loadAiHistory)
})

async function submitLogin() {
  await authStore.login(loginForm)
  await hydrateAccountCollections()
}

async function submitRegister() {
  await authStore.register({
    username: registerForm.username,
    password: registerForm.password,
    nickname: registerForm.nickname || registerForm.username,
    avatarUrl: registerForm.avatarUrl
  })
  await hydrateAccountCollections()
}

async function submitProfile() {
  await authStore.updateProfile({
    nickname: profileForm.nickname,
    avatarUrl: profileForm.avatarUrl
  })
}

async function logout() {
  await authStore.logout()
  await hydrateAccountCollections()
}

async function hydrateAccountCollections() {
  await Promise.all([favoriteStore.hydrate(), historyStore.hydrate(), authStore.hydrateDashboard()])
}

async function handleAvatarFile(event, target) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    authStore.error = '请选择图片文件'
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    authStore.error = '头像文件请控制在 3MB 内'
    return
  }

  try {
    const form = target === 'profile' ? profileForm : registerForm
    if (target === 'profile' && authStore.isAuthenticated) {
      const uploaded = await uploadAvatar(file)
      form.avatarUrl = uploaded.url
      form.avatarFileName = uploaded.originalName || file.name
    } else {
      const dataUrl = await compressAvatar(file)
      form.avatarUrl = dataUrl
      form.avatarFileName = file.name
    }
    authStore.error = ''
  } catch {
    authStore.error = '头像读取失败，请换一张图片'
  } finally {
    event.target.value = ''
  }
}

function loadAiHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || '[]')
    aiHistory.value = Array.isArray(parsed) ? parsed.slice(0, 12) : []
  } catch {
    aiHistory.value = []
  }
}

function normalizeHistoryItem(item = {}, index = 0) {
  const id = item.itemId || item.id || item.slug || item.title || item.name || `history-${index}`
  return {
    key: String(id),
    title: item.title || item.name || String(id),
    subtitle: item.itemType || item.type || item.continent || '探索记录',
    slug: item.slug || slugFromItemId(id),
    visitedCount: item.visitedCount || 1,
    country: item.country || ''
  }
}

function normalizeFavoriteItem(item = {}, index = 0) {
  const id = item.itemId || item.id || item.slug || item.title || `favorite-${index}`
  return {
    key: String(id),
    title: item.title || item.name || String(id),
    subtitle: item.itemType || item.type || '收藏地点',
    slug: item.slug || slugFromItemId(id),
    country: item.country || ''
  }
}

function uniqueEntries(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (!item.key || seen.has(item.key)) return false
    seen.add(item.key)
    return true
  })
}

function focusRouteFor(item) {
  return {
    path: '/',
    query: { focus: item.slug || slugFromItemId(item.key) }
  }
}

function slugFromItemId(value) {
  const id = String(value || '').trim()
  return id || 'world'
}

function searchableText(item = {}) {
  return [
    item.title,
    item.subtitle,
    item.country,
    item.target,
    item.question,
    item.moduleTitle
  ].filter(Boolean).join(' ')
}

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const image = new Image()
      image.onerror = reject
      image.onload = () => {
        const size = 160
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('canvas unavailable'))
          return
        }
        canvas.width = size
        canvas.height = size
        const sourceSize = Math.min(image.width, image.height)
        const sourceX = (image.width - sourceSize) / 2
        const sourceY = (image.height - sourceSize) / 2
        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function makeInitials(value) {
  return String(value || 'WL').slice(0, 2).toUpperCase()
}
</script>
