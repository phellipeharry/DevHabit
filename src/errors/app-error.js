export class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message)

    this.statusCode = statusCode
    this.status = statusCode >= 500 ? 'error' : 'fail'
    this.isOperational = true
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}
