import { Router } from 'express'
import {
  getClimate,
  listClimate,
  listClimateForCountry,
  listClimateForTerrain,
  listClimateGroups,
  listClimateTypes,
  listFeaturedClimate,
  listRelatedClimate
} from '../services/climateService.js'

const router = Router()

router.get('/climate/types', (req, res) => {
  res.json(listClimateTypes())
})

router.get('/climate/groups', (req, res) => {
  res.json(listClimateGroups())
})

router.get('/climate/featured', (req, res) => {
  res.json(listFeaturedClimate())
})

router.get('/climate/:id/related', (req, res) => {
  const climate = getClimate(req.params.id)
  if (!climate) {
    res.status(404).json({ message: 'Climate zone not found' })
    return
  }
  res.json(listRelatedClimate(req.params.id))
})

router.get('/climate/:id', (req, res) => {
  const climate = getClimate(req.params.id)
  if (!climate) {
    res.status(404).json({ message: 'Climate zone not found' })
    return
  }
  res.json(climate)
})

router.get('/climate', (req, res) => {
  res.json(listClimate(req.query))
})

router.get('/countries/:code/climate', (req, res) => {
  res.json(listClimateForCountry(req.params.code))
})

router.get('/terrain/:id/climate', (req, res) => {
  res.json(listClimateForTerrain(req.params.id))
})

export default router
