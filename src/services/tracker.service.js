import crypto from 'crypto'
import { AppError } from '../errors/app-error.js'
import {
  findHabit,
  createHabit,
  deleteHabit,
  findHabitsByUser
} from '../repositories/tracker.repository.js'
import { updateUser } from '../repositories/user.repository.js'
import { calculateLevel } from '../utils/level.util.js'
import { calculateStreak } from '../utils/streak.util.js'

export async function getHabitsService(userId) {
  return await findHabitsByUser(userId)
}

const XP_VALUE = 20

export async function toggleHabitService(user, { date, type }) {

  if (!date || !type) {
    throw new AppError('Date and type are required', 400)
  }

  const existing = await findHabit(user.id, date, type)

  if (!existing) {

    await createHabit({
      id: crypto.randomUUID(),
      user_id: user.id,
      date,
      type,
      xp_earned: XP_VALUE,
      completed: true
    })

    user.current_xp += XP_VALUE
    user.level = calculateLevel(user.current_xp)
    user.streak_count = calculateStreak(user, date)
    user.last_activity_date = date

  } else {

    await deleteHabit(existing.id)

    user.current_xp -= XP_VALUE
    user.level = calculateLevel(user.current_xp)
  }

  const updatedUser = await updateUser(user)

  return updatedUser
}