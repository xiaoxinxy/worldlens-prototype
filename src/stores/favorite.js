import { defineStore } from 'pinia'
import { clearFavoriteIds, getFavoriteIds, removeFavoriteId, saveFavoriteId } from '../api/favoriteApi'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    ids: []
  }),
  getters: {
    count: (state) => state.ids.length,
    has: (state) => (id) => state.ids.includes(id)
  },
  actions: {
    async hydrate() {
      this.ids = await getFavoriteIds()
    },
    async toggle(id) {
      if (this.ids.includes(id)) {
        this.ids = await removeFavoriteId(id)
      } else {
        this.ids = await saveFavoriteId(id)
      }
    },
    async remove(id) {
      this.ids = await removeFavoriteId(id)
    },
    async clear() {
      this.ids = await clearFavoriteIds()
    }
  }
})
