export const MAX_LIVES = 5
export const RECOVERY_INTERVAL_MS = 2 * 60 * 60 * 1000 // 2 horas em milissegundos

/**
 * Atualiza as vidas do usuário se ele tiver menos do que 5 vidas
 * e o tempo necessário de regeneração tiver passado.
 * 
 * @param {object} user - O objeto do usuário obtido do banco de dados
 * @returns {boolean} - Retorna true se o objeto foi modificado e precisa ser persistido no banco
 */
export function recoverLivesIfNeeded(user) {
  if (user.lives >= MAX_LIVES) {
    if (user.last_life_loss_time !== null) {
      user.last_life_loss_time = null
      return true
    }
    return false
  }

  if (!user.last_life_loss_time) {
    // Se o usuário tem menos que 5 vidas mas não tem marcador de perda,
    // iniciamos o marcador agora
    user.last_life_loss_time = new Date()
    return true
  }

  const now = new Date()
  const lastLoss = new Date(user.last_life_loss_time)
  const msElapsed = now.getTime() - lastLoss.getTime()

  if (msElapsed >= RECOVERY_INTERVAL_MS) {
    const recovered = Math.floor(msElapsed / RECOVERY_INTERVAL_MS)
    const newLives = user.lives + recovered

    if (newLives >= MAX_LIVES) {
      user.lives = MAX_LIVES
      user.last_life_loss_time = null
    } else {
      user.lives = newLives
      // Incrementa o timestamp apenas pelo tempo regenerado, mantendo a sobra de minutos/segundos
      user.last_life_loss_time = new Date(lastLoss.getTime() + (recovered * RECOVERY_INTERVAL_MS))
    }
    return true
  }

  return false
}
