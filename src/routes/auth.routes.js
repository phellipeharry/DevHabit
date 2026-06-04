import { Router } from 'express'
import { register, login } from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validation.middleware.js'
import { registerSchema, loginSchema } from '../validations/auth.schema.js'

const router = Router()

router.post(
  '/register',
  validate(registerSchema),
  register
)

router.post(
  '/login',
  validate(loginSchema),
  login
)

export default router
