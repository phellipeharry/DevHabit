import { nextLevelXP } from '../utils/level.util.js'

export function getUserProfile(user) {
  if (!user) {
    throw new Error('Usuário inválido ao gerar perfil')
  }

  const {
    name,
    level,
    current_xp,
    lives,
    streak_count,
    avatar_url
  } = user

  return {
    name,
    level,
    current_xp,
    next_level_xp: nextLevelXP(level),
    lives,
    streak: streak_count,
    avatar: avatar_url
  }
}