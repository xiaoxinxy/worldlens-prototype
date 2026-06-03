import { Router } from 'express'
import { addFavorite, clearFavorites, listFavorites } from '../services/favoriteService.js'

const router = Router()

router.get('/favorites', async (req, res) => {
  res.json(await listFavorites())
})

router.post('/favorites', async (req, res) => {
  if (!req.body?.placeId) {
    res.status(400).json({ message: 'placeId is required' })
    return
  }
  res.json(await addFavorite(req.body.placeId))
})

router.delete('/favorites', async (req, res) => {
  res.json(await clearFavorites())
})

export default router
