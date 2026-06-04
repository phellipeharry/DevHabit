import { AppError } from '../errors/app-error.js'
import {
  findLanguages,
  findLanguageById,
  findUserLanguages,
  enrollUserInLanguage,
  findModulesWithLessons,
  findCompletedLessonIds,
  findLessonById,
  findExercisesByLesson,
  checkLessonCompleted,
  completeLessonForUser
} from '../repositories/learning.repository.js'
import { updateUser } from '../repositories/user.repository.js'
import { calculateLevel } from '../utils/level.util.js'
import { calculateStreak } from '../utils/streak.util.js'

// Listagem de linguagens com status de inscrição do usuário
export async function getLanguagesList(userId) {
  const allLanguages = await findLanguages()
  const userLangs = await findUserLanguages(userId)
  const userLangIds = new Set(userLangs.map(l => l.id))

  return allLanguages.map(lang => ({
    ...lang,
    enrolled: userLangIds.has(lang.id)
  }))
}

// Inscrição em uma linguagem
export async function enrollLanguage(userId, languageId) {
  const lang = await findLanguageById(languageId)
  if (!lang) {
    throw new AppError('Linguagem não encontrada', 404)
  }

  await enrollUserInLanguage(userId, languageId)
  return lang
}

// Retorna a trilha de aprendizado (módulos e aulas) com status de conclusão
export async function getLanguageTrail(userId, languageId) {
  const lang = await findLanguageById(languageId)
  if (!lang) {
    throw new AppError('Linguagem não encontrada', 404)
  }

  const modules = await findModulesWithLessons(languageId)
  const completedLessonIds = new Set(await findCompletedLessonIds(userId))

  // Mapeia o status completed para as aulas
  const trail = modules.map(mod => {
    const lessons = mod.lessons.map(les => ({
      ...les,
      completed: completedLessonIds.has(les.id)
    }))
    return {
      ...mod,
      lessons
    }
  })

  return {
    language: lang,
    modules: trail
  }
}

// Busca exercícios de uma aula
export async function getLessonDetails(lessonId) {
  const lesson = await findLessonById(lessonId)
  if (!lesson) {
    throw new AppError('Aula não encontrada', 404)
  }

  const exercises = await findExercisesByLesson(lessonId)
  
  // Remove as respostas corretas do retorno para evitar trapaças no frontend
  const safeExercises = exercises.map(ex => {
    const { correct_answer, ...safeEx } = ex
    return safeEx
  })

  return {
    lesson,
    exercises: safeExercises
  }
}

// Submissão de respostas
export async function submitLessonAnswers(user, lessonId, answers) {
  // 1. Verifica se o usuário tem vidas
  if (user.lives <= 0) {
    throw new AppError('Você está sem vidas! Espere a recuperação automática ou pratique mais.', 400)
  }

  const lesson = await findLessonById(lessonId)
  if (!lesson) {
    throw new AppError('Aula não encontrada', 404)
  }

  const exercises = await findExercisesByLesson(lessonId)
  if (exercises.length === 0) {
    throw new AppError('Esta aula não possui exercícios cadastrados.', 400)
  }

  const incorrectExercises = []
  const answersMap = new Map(answers.map(ans => [ans.exerciseId, ans.answer]))

  // 2. Valida cada exercício
  for (const ex of exercises) {
    const userAnswer = answersMap.get(ex.id)
    const isCorrect = userAnswer && userAnswer.trim().toLowerCase() === ex.correct_answer.trim().toLowerCase()

    if (!isCorrect) {
      incorrectExercises.push({
        exerciseId: ex.id,
        questionText: ex.question_text,
        userAnswer: userAnswer || '',
        correctAnswer: ex.correct_answer, // retorna a correta para correção no frontend
        explanation: ex.explanation
      })
    }
  }

  // 3. Se houver erros, desconta vida
  if (incorrectExercises.length > 0) {
    const originalLives = user.lives
    
    // Se estava com a vida cheia (5), marcamos o tempo da primeira perda
    if (originalLives === 5) {
      user.last_life_loss_time = new Date()
    }
    
    user.lives = Math.max(0, user.lives - 1)
    
    // Se ficou sem vidas, garante que o timer de regeneração está ativo
    if (user.lives === 0 && !user.last_life_loss_time) {
      user.last_life_loss_time = new Date()
    }

    await updateUser(user)

    return {
      success: false,
      message: `Você errou ${incorrectExercises.length} exercício(s) e perdeu 1 vida.`,
      incorrectExercises,
      lives: user.lives
    }
  }

  // 4. Se tudo correto, registra progresso
  const alreadyCompleted = await checkLessonCompleted(user.id, lessonId)
  const today = new Date().toISOString().split('T')[0]
  let xpEarned = 0

  if (!alreadyCompleted) {
    await completeLessonForUser(user.id, lessonId)
    
    // Auto-inscreve o usuário na linguagem da aula se ele não estiver inscrito
    await enrollUserInLanguage(user.id, lesson.language_id)

    xpEarned = Number(lesson.xp_reward)
    user.current_xp += xpEarned
    user.level = calculateLevel(user.current_xp)
    user.streak_count = calculateStreak(user, today)
    user.last_activity_date = today

    await updateUser(user)
  }

  return {
    success: true,
    message: alreadyCompleted 
      ? 'Respostas corretas! Aula revisada.' 
      : 'Parabéns! Você completou a aula com sucesso e ganhou XP.',
    xp_earned: xpEarned,
    new_level: user.level,
    streak: user.streak_count,
    lives: user.lives
  }
}
