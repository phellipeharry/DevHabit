export function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1
}

export function nextLevelXP(level) {
  return level * 100
}
