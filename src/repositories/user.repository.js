import { pool } from '../database/pool.js'

export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  return result.rows[0] || null
}

export async function findUserById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  )

  return result.rows[0] || null
}

export async function createUser(userData) {
  const {
    id,
    name,
    email,
    password_hash,
    avatar_url,
    current_xp,
    level,
    lives,
    streak_count,
    last_activity_date
  } = userData

  const result = await pool.query(
    `INSERT INTO users (
      id,
      name,
      email,
      password_hash,
      avatar_url,
      current_xp,
      level,
      lives,
      streak_count,
      last_activity_date
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      id,
      name,
      email,
      password_hash,
      avatar_url,
      current_xp,
      level,
      lives,
      streak_count,
      last_activity_date
    ]
  )

  return result.rows[0]
}

export async function updateUser(user) {
  const result = await pool.query(
    `UPDATE users SET
      name = $1,
      email = $2,
      password_hash = $3,
      avatar_url = $4,
      current_xp = $5,
      level = $6,
      lives = $7,
      streak_count = $8,
      last_activity_date = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *`,
    [
      user.name,
      user.email,
      user.password_hash,
      user.avatar_url,
      user.current_xp,
      user.level,
      user.lives,
      user.streak_count,
      user.last_activity_date,
      user.id
    ]
  )

  return result.rows[0] || null
}