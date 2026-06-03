import { Router } from 'express'
import { getPlace, listPlaces, searchPlaces } from '../services/placeService.js'

const router = Router()

router.get('/places', (req, res) => {
  res.json(listPlaces())
})

router.get('/places/:id', (req, res) => {
  const place = getPlace(req.params.id)
  if (!place) {
    res.status(404).json({ message: 'Place not found' })
    return
  }
  res.json(place)
})

router.get('/search', (req, res) => {
  res.json(searchPlaces(req.query.q))
})

export default router
