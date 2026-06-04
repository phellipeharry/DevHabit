import dotenv from 'dotenv'
import app from './app.js'
import { pool } from './database/db.js'

dotenv.config()

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    await pool.query('SELECT NOW()')
    console.log('PostgreSQL connected successfully')


    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error)
    process.exit(1)
  }
}

startServer()