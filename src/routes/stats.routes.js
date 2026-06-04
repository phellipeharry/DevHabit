import { Router } from 'express'
import { getChart } from '../controllers/stats.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/chart', authMiddleware, getChart)

export default router
