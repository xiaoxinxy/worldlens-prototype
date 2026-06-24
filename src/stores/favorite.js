import { defineStore } from 'pinia'
import { clearFavoriteIds, getFavoriteItems, removeFavoriteId, saveFavoriteId } from '../api/favoriteApi'

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    ids: [],
    items: []
  }),
  getters: {
    count: (state) => state.ids.length,
    has: (state) => (id) => state.ids.includes(id)
  },
  actions: {
    async hydrate() {
      this.items = await getFavoriteItems()
      this.ids = this.items.map((item) => item.itemId).filter(Boolean)
    },
    async toggle(id, meta = {}) {
      if (this.ids.includes(id)) {
        this.ids = await removeFavoriteId(id)
        this.items = this.items.filter((item) => item.itemId !== id)
      } else {
        this.ids = await saveFavoriteId(id, meta)
        await this.hydrate()
      }
    },
    async save(id, meta = {}) {
      this.ids = await saveFavoriteId(id, meta)
      await this.hydrate()
    },
    async remove(id) {
      this.ids = await removeFavoriteId(id)
      this.items = this.items.filter((item) => item.itemId !== id)
    },
    async clear() {
      this.ids = await clearFavoriteIds()
      this.items = []
    }
  }
})
