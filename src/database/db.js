import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

pool.on('connect', () => {
  console.log('PostgreSQL connected')
})

pool.on('error', (err) => {
  console.error('PostgreSQL error:', err)
  process.exit(1)
})