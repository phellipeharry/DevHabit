export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500

  const response = {
    status: 'error',
    message: err.message || 'Internal server error',
    errors: err.errors || null
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}