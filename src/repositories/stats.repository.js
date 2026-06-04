import { pool } from '../database/pool.js'

export async function findHabitsByUserAndDate(userId, date) {
  const result = await pool.query(
    `
    SELECT xp_earned
    FROM habits
    WHERE user_id = $1
      AND date = $2
    `,
    [userId, date]
  )

  return result.rows
}