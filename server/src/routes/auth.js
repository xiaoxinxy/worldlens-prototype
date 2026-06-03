import { Router } from 'express'

const router = Router()

router.get('/auth/me', (req, res) => {
  res.json({
    id: 'guest',
    name: 'Guest Explorer',
    avatar: 'WL'
  })
})

export default router
