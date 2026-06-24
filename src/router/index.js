import { createRouter, createWebHistory } from 'vue-router'
import { currentUser } from '../api/authApi'

const EarthView = () => import('../views/EarthView.vue')
const PlaceDetail = () => import('../views/PlaceDetail.vue')
const FavoriteView = () => import('../views/FavoriteView.vue')
const AboutView = () => import('../views/AboutView.vue')
const AtlasGallery = () => import('../views/AtlasGallery.vue')
const TerrainExplorer = () => import('../views/TerrainExplorer.vue')
const TerrainDetail = () => import('../views/TerrainDetail.vue')
const ClimateExplorer = () => import('../views/ClimateExplorer.vue')
const ClimateDetail = () => import('../views/ClimateDetail.vue')
const AdminOceanCurrents = () => import('../views/AdminOceanCurrents.vue')

const routes = [
  { path: '/', name: 'earth', component: EarthView, meta: { title: 'WorldLens' } },
  { path: '/place/:slug', name: 'place-detail', component: PlaceDetail, meta: { title: '地点记忆' } },
  { path: '/search', redirect: (to) => ({ path: '/gallery', query: to.query }) },
  { path: '/gallery', name: 'gallery', component: AtlasGallery, meta: { title: '探索索引' } },
  { path: '/terrain', name: 'terrain', component: TerrainExplorer, meta: { title: '地形探索' } },
  { path: '/terrain/:id', name: 'terrain-detail', component: TerrainDetail, meta: { title: '地形档案' } },
  { path: '/climate', name: 'climate', component: ClimateExplorer, meta: { title: '气候探索' } },
  { path: '/climate/:id', name: 'climate-detail', component: ClimateDetail, meta: { title: '气候档案' } },
  { path: '/admin/ocean', name: 'admin-ocean', component: AdminOceanCurrents, meta: { title: '洋流管理', requiresAdmin: true } },
  { path: '/favorites', name: 'favorites', component: FavoriteView, meta: { title: '收藏' } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: '关于' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true
  if (currentUser()?.isAdmin) return true
  return { path: '/', query: { admin: 'required' } }
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'WorldLens'} | WorldLens`
})

export default router
