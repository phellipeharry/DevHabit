import {
  getLanguagesList,
  enrollLanguage,
  getLanguageTrail,
  getLessonDetails,
  submitLessonAnswers
} from '../services/learning.service.js'
import { successResponse } from '../utils/response.js'

export const listLanguages = async (req, res, next) => {
  try {
    const { id } = req.user
    const languages = await getLanguagesList(id)

    return successResponse(
      res,
      'Linguagens listadas com sucesso',
      languages
    )
  } catch (err) {
    return next(err)
  }
}

export const enroll = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const { id: languageId } = req.params

    const language = await enrollLanguage(userId, languageId)

    return successResponse(
      res,
      'Inscrição realizada com sucesso',
      language,
      201
    )
  } catch (err) {
    return next(err)
  }
}

export const getTrail = async (req, res, next) => {
  try {
    const { id: userId } = req.user
    const { id: languageId } = req.params

    const trail = await getLanguageTrail(userId, languageId)

    return successResponse(
      res,
      'Trilha de aprendizado obtida com sucesso',
      trail
    )
  } catch (err) {
    return next(err)
  }
}

export const getLesson = async (req, res, next) => {
  try {
    const { id: lessonId } = req.params

    const lessonData = await getLessonDetails(lessonId)

    return successResponse(
      res,
      'Detalhes da aula e exercícios obtidos com sucesso',
      lessonData
    )
  } catch (err) {
    return next(err)
  }
}

export const submitLesson = async (req, res, next) => {
  try {
    const { id: lessonId } = req.params
    const { answers } = req.body

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        status: 'fail',
        message: 'O campo "answers" é obrigatório e deve ser uma lista.'
      })
    }

    const result = await submitLessonAnswers(req.user, lessonId, answers)

    return successResponse(
      res,
      result.success ? 'Respostas verificadas com sucesso' : 'Respostas com erros',
      result
    )
  } catch (err) {
    return next(err)
  }
}
