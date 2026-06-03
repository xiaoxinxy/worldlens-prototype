import { Router } from 'express'
import {
  getTerrain,
  listFeaturedTerrain,
  listRelatedTerrain,
  listTerrain,
  listTerrainForCountry,
  listTerrainTypes
} from '../services/terrainService.js'

const router = Router()

router.get('/terrain/types', (req, res) => {
  res.json(listTerrainTypes())
})

router.get('/terrain/featured', (req, res) => {
  res.json(listFeaturedTerrain())
})

router.get('/terrain/:id/related', (req, res) => {
  const terrain = getTerrain(req.params.id)
  if (!terrain) {
    res.status(404).json({ message: 'Terrain feature not found' })
    return
  }
  res.json(listRelatedTerrain(req.params.id))
})

router.get('/terrain/:id', (req, res) => {
  const terrain = getTerrain(req.params.id)
  if (!terrain) {
    res.status(404).json({ message: 'Terrain feature not found' })
    return
  }
  res.json(terrain)
})

router.get('/terrain', (req, res) => {
  res.json(listTerrain(req.query))
})

router.get('/countries/:code/terrain', (req, res) => {
  res.json(listTerrainForCountry(req.params.code))
})

export default router
