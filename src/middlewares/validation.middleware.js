import { ZodError } from 'zod'
import { AppError } from '../errors/app-error.js'

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))

      return next(
        new AppError(
          'Erro de validação',
          400,
          formattedErrors
        )
      )
    }

    next(err)
  }
}
