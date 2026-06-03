import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.js'
import favoriteRoutes from './routes/favorites.js'
import historyRoutes from './routes/history.js'
import climateRoutes from './routes/climate.js'
import placeRoutes from './routes/places.js'
import terrainRoutes from './routes/terrain.js'

const app = express()
const port = Number(process.env.PORT || 4174)

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'worldlens-api' })
})

app.use('/api', placeRoutes)
app.use('/api', terrainRoutes)
app.use('/api', climateRoutes)
app.use('/api', favoriteRoutes)
app.use('/api', historyRoutes)
app.use('/api', authRoutes)

app.listen(port, () => {
  console.log(`WorldLens API listening on http://localhost:${port}`)
})
