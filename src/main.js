import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/base.css'
import './assets/styles/animations.css'
import { useFavoriteStore } from './stores/favorite'
import { useHistoryStore } from './stores/history'
import { lazyBackground } from './directives/lazyBackground'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('lazy-bg', lazyBackground)
useFavoriteStore().hydrate()
useHistoryStore().hydrate()
app.mount('#app')
