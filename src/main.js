import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/base.css'
import './assets/styles/animations.css'
import { useFavoriteStore } from './stores/favorite'
import { useHistoryStore } from './stores/history'
import { lazyBackground } from './directives/lazyBackground'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('lazy-bg', lazyBackground)
const authStore = useAuthStore()
authStore.hydrate().finally(() => {
  useFavoriteStore().hydrate()
  useHistoryStore().hydrate()
})
app.mount('#app')
