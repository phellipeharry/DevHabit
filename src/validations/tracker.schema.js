import { z } from 'zod'

export const toggleHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  type: z.enum(['aula', 'exercicio', 'leitura'])
})
