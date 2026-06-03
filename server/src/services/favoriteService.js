import { readCollection, writeCollection } from '../db/jsonDb.js'

export async function listFavorites() {
  return readCollection('favorites', [])
}

export async function addFavorite(placeId) {
  const favorites = await listFavorites()
  const next = favorites.includes(placeId) ? favorites : [...favorites, placeId]
  return writeCollection('favorites', next)
}

export async function clearFavorites() {
  return writeCollection('favorites', [])
}
