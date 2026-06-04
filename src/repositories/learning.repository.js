import { pool } from '../database/pool.js'

// --- LANGUAGES ---

export async function findLanguages() {
  const result = await pool.query(
    'SELECT * FROM languages ORDER BY name ASC'
  )
  return result.rows
}

export async function findLanguageById(id) {
  const result = await pool.query(
    'SELECT * FROM languages WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

export async function findLanguageBySlug(slug) {
  const result = await pool.query(
    'SELECT * FROM languages WHERE slug = $1',
    [slug]
  )
  return result.rows[0] || null
}

// --- MODULES & LESSONS ---

export async function findModulesWithLessons(languageId) {
  // Busca módulos
  const modulesResult = await pool.query(
    'SELECT * FROM modules WHERE language_id = $1 ORDER BY order_index ASC',
    [languageId]
  )
  const modules = modulesResult.rows

  // Busca aulas para cada módulo
  for (const mod of modules) {
    const lessonsResult = await pool.query(
      'SELECT id, name, description, xp_reward, order_index FROM lessons WHERE module_id = $1 ORDER BY order_index ASC',
      [mod.id]
    )
    mod.lessons = lessonsResult.rows
  }

  return modules
}

export async function findLessonById(id) {
  const result = await pool.query(
    `SELECT l.*, m.language_id 
     FROM lessons l
     JOIN modules m ON l.module_id = m.id
     WHERE l.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

// --- EXERCISES ---

export async function findExercisesByLesson(lessonId) {
  const result = await pool.query(
    'SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY order_index ASC',
    [lessonId]
  )
  return result.rows
}

export async function findExerciseById(id) {
  const result = await pool.query(
    'SELECT * FROM exercises WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

// --- USER PROGRESS ---

export async function findUserLanguages(userId) {
  const result = await pool.query(
    `SELECT l.* 
     FROM languages l
     JOIN user_languages ul ON l.id = ul.language_id
     WHERE ul.user_id = $1`,
    [userId]
  )
  return result.rows
}

export async function findUserLanguage(userId, languageId) {
  const result = await pool.query(
    'SELECT * FROM user_languages WHERE user_id = $1 AND language_id = $2',
    [userId, languageId]
  )
  return result.rows[0] || null
}

export async function enrollUserInLanguage(userId, languageId) {
  const result = await pool.query(
    `INSERT INTO user_languages (user_id, language_id) 
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [userId, languageId]
  )
  return result.rows[0]
}

export async function findCompletedLessonIds(userId) {
  const result = await pool.query(
    'SELECT lesson_id FROM user_progress WHERE user_id = $1',
    [userId]
  )
  return result.rows.map(row => row.lesson_id)
}

export async function checkLessonCompleted(userId, lessonId) {
  const result = await pool.query(
    'SELECT 1 FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
    [userId, lessonId]
  )
  return result.rowCount > 0
}

export async function completeLessonForUser(userId, lessonId) {
  const result = await pool.query(
    `INSERT INTO user_progress (user_id, lesson_id) 
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [userId, lessonId]
  )
  return result.rows[0]
}
