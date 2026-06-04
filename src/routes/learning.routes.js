import { Router } from 'express'
import {
  listLanguages,
  enroll,
  getTrail,
  getLesson,
  submitLesson
} from '../controllers/learning.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

// Trilhas / Linguagens
router.get('/languages', authMiddleware, listLanguages)
router.post('/languages/:id/enroll', authMiddleware, enroll)
router.get('/languages/:id/trail', authMiddleware, getTrail)

// Aulas e Exercícios
router.get('/lessons/:id', authMiddleware, getLesson)
router.post('/lessons/:id/submit', authMiddleware, submitLesson)

export default router
