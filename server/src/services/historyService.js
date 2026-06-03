import { readCollection, writeCollection } from '../db/jsonDb.js'

export async function listHistory() {
  return readCollection('history', [])
}

export async function addHistory(entry) {
  const history = await listHistory()
  const nextEntry = {
    ...entry,
    viewedAt: entry.viewedAt || new Date().toISOString()
  }
  const next = [nextEntry, ...history.filter((item) => item.id !== entry.id)].slice(0, 40)
  return writeCollection('history', next)
}

export async function clearHistory() {
  return writeCollection('history', [])
}
