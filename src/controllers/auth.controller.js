import { registerUser, loginUser } from '../services/auth.service.js'
import { successResponse } from '../utils/response.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    await registerUser({ name, email, password })

    return successResponse(
      res,
      'Usuário criado com sucesso',
      null,
      201
    )
  } catch (err) {
    return next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const { user, token } = await loginUser({ email, password })

    const { password_hash, ...safeUser } = user

    return successResponse(res, 'Login realizado com sucesso', {
      token,
      user: safeUser
    })
  } catch (err) {
    return next(err)
  }
}