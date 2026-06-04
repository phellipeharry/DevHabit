export function calculateStreak(user, date) {
  const today = new Date(date)
  const last = user.last_activity_date
    ? new Date(user.last_activity_date)
    : null

  if (!last) {
    return 1
  }

  const diff =
    (today - last) / (1000 * 60 * 60 * 24)

  if (diff === 1) {
    return user.streak_count + 1
  }

  if (diff > 1) {
    return 1
  }

  return user.streak_count
}
