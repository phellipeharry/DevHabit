import jwt from 'jsonwebtoken'
import { AppError } from '../errors/app-error.js'
import { findUserById, updateUser } from '../repositories/user.repository.js'
import { recoverLivesIfNeeded } from '../utils/lives.util.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next(new AppError('Token required', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await findUserById(decoded.id)

    if (!user) {
      return next(new AppError('User not found', 404))
    }

    // Processa a recuperação automática de vidas baseado no tempo decorrido
    const livesUpdated = recoverLivesIfNeeded(user)
    if (livesUpdated) {
      await updateUser(user)
    }

    req.user = user
    next()

  } catch (err) {
    return next(new AppError('Invalid token', 401))
  }
}