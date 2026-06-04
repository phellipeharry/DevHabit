import { pool } from '../database/pool.js'

export async function findHabit(userId, date, type) {
  const result = await pool.query(
    `SELECT * FROM habits 
     WHERE user_id = $1 AND date = $2 AND type = $3`,
    [userId, date, type]
  )

  return result.rows[0] || null
}

export async function createHabit(habitData) {
  const {
    id,
    user_id,
    date,
    type,
    xp_earned,
    completed
  } = habitData

  const result = await pool.query(
    `INSERT INTO habits (
      id, user_id, date, type, xp_earned, completed
    ) VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [id, user_id, date, type, xp_earned, completed]
  )

  return result.rows[0]
}

export async function deleteHabit(habitId) {
  await pool.query(
    `DELETE FROM habits WHERE id = $1`,
    [habitId]
  )
}

export async function findHabitsByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM habits WHERE user_id = $1`,
    [userId]
  )

  return result.rows
}