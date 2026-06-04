import { toggleHabitService, getHabitsService } from '../services/tracker.service.js'
import { successResponse } from '../utils/response.js'

export const getHabits = async (req, res, next) => {
  try {
    const habits = await getHabitsService(req.user.id)
    return successResponse(res, 'Hábitos obtidos com sucesso', habits)
  } catch (err) {
    return next(err)
  }
}

export const toggleHabit = async (req, res, next) => {
  try {
    const { date, type } = req.body

    const updatedUser = await toggleHabitService(req.user, { date, type })

    return successResponse(
      res,
      'Hábito atualizado com sucesso',
      {
        current_xp: updatedUser.current_xp,
        level: updatedUser.level,
        streak: updatedUser.streak_count
      }
    )
  } catch (err) {
    return next(err)
  }
}