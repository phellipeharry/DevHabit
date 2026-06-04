import { findHabitsByUserAndDate } from '../repositories/stats.repository.js'

export async function getChartData(userId) {

  const days = [...Array(15)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (14 - i))
    return d.toISOString().split('T')[0]
  })

  const data = []

  for (const date of days) {
    const logs = await findHabitsByUserAndDate(userId, date)

    const totalXP = logs.reduce(
      (sum, log) => sum + Number(log.xp_earned),
      0
    )

    data.push(totalXP)
  }

  return {
    labels: days.map(d => d.slice(-2)),
    data
  }
}