import { defineStore } from 'pinia'
import { addHistory, clearHistory, getHistory } from '../api/historyApi'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: []
  }),
  actions: {
    async hydrate() {
      this.items = await getHistory()
    },
    async add(place) {
      this.items = await addHistory(place)
    },
    async clear() {
      this.items = await clearHistory()
    }
  }
})
