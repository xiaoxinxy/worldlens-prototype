import { Router } from 'express'
import { addHistory, clearHistory, listHistory } from '../services/historyService.js'

const router = Router()

router.get('/history', async (req, res) => {
  res.json(await listHistory())
})

router.post('/history', async (req, res) => {
  if (!req.body?.id) {
    res.status(400).json({ message: 'id is required' })
    return
  }
  res.json(await addHistory(req.body))
})

router.delete('/history', async (req, res) => {
  res.json(await clearHistory())
})

export default router
