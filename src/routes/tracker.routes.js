import { Router } from 'express'
import { toggleHabit, getHabits } from '../controllers/tracker.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validation.middleware.js'
import { toggleHabitSchema } from '../validations/tracker.schema.js'

const router = Router()

router.get(
  '/',
  authMiddleware,
  getHabits
)

router.post(
  '/toggle',
  authMiddleware,
  validate(toggleHabitSchema),
  toggleHabit
)

export default router
