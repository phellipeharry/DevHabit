import { getUserProfile } from '../services/user.service.js'
import { successResponse } from '../utils/response.js'

export const getMe = (req, res, next) => {
  try {
    const profile = getUserProfile(req.user)

    return successResponse(
      res,
      'Perfil obtido com sucesso',
      profile
    )
  } catch (err) {
    return next(err)
  }
}