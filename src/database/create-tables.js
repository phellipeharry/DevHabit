import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const { Client, Pool } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.join(__dirname, 'schema.sql')

async function createDatabaseAndTables() {
  const dbName = process.env.DB_NAME || 'devhabit'
  
  // 1. Conecta ao banco de dados padrão 'postgres' para criar o banco de dados 'devhabit' se não existir
  console.log(`Connecting to default 'postgres' database to ensure database '${dbName}' exists...`)
  const defaultClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  })
  
  try {
    await defaultClient.connect()
    const checkDb = await defaultClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    )
    
    if (checkDb.rowCount === 0) {
      console.log(`Database '${dbName}' not found. Creating database '${dbName}'...`)
      await defaultClient.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✅ Database '${dbName}' created successfully!`)
    } else {
      console.log(`Database '${dbName}' already exists.`)
    }
  } catch (error) {
    console.error('⚠️ Warning connecting to default postgres database:', error.message)
    console.log('Continuing to execute schema directly on configured connection...')
  } finally {
    try {
      await defaultClient.end()
    } catch (_) {}
  }

  // 2. Conecta ao banco 'devhabit' e executa o schema.sql
  console.log(`Connecting to database '${dbName}' to create tables...`)
  const targetPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
  })

  try {
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await targetPool.query(sql)
    console.log('✅ Database schema created/updated successfully!')
  } catch (error) {
    console.error('❌ Failed to execute schema.sql on target database:', error.message)
  } finally {
    await targetPool.end()
  }
}

createDatabaseAndTables()
