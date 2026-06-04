import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logsDir = path.join(__dirname, '../../logs')

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}


const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' } 
)


const jsonFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: Number(tokens['response-time'](req, res)),
    ip: tokens['remote-addr'](req, res),
    userAgent: tokens['user-agent'](req, res)
  })
}


export const logger = morgan(jsonFormat, {
  stream: accessLogStream
})