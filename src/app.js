import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import trackerRoutes from './routes/tracker.routes.js'
import statsRoutes from './routes/stats.routes.js'
import learningRoutes from './routes/learning.routes.js'
import { logger } from './utils/logger.js'
import { rateLimiter } from './middlewares/rate-limit.middleware.js'
import { errorMiddleware } from './middlewares/error.middleware.js'

dotenv.config()
const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(logger)
app.use(rateLimiter)


app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/tracker', trackerRoutes)
app.use('/stats', statsRoutes)
app.use('/learning', learningRoutes)


app.get('/', (req, res) => {
  res.json({ message: 'DevHabit API running...' })
})

app.use(errorMiddleware)

export default app