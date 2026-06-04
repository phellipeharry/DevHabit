import request from 'supertest'
import app from './app.js'
import { pool } from './database/db.js'

async function runVerification() {
  console.log('=== INICIANDO VERIFICAÇÃO DO DEVHABIT API ===\n')

  // 1. Testa Conexão com o Banco de Dados
  try {
    const dbCheck = await pool.query('SELECT NOW()')
    console.log('✅ Conexão com PostgreSQL: OK (' + dbCheck.rows[0].now + ')')
  } catch (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL. Certifique-se de que o Postgres está rodando e as variáveis no arquivo .env estão corretas.')
    console.error('Erro detalhado:', err.message)
    process.exit(1)
  }

  try {
    const email = `test-${Math.floor(Math.random() * 100000)}@devhabit.com`
    const password = 'password123'
    const name = 'Verify User'

    // 2. Registro de Usuário
    console.log('\n--- 1. Registrar novo usuário ---')
    const regRes = await request(app)
      .post('/auth/register')
      .send({ name, email, password })
    
    if (regRes.statusCode !== 201) {
      throw new Error(`Falha ao registrar: ${JSON.stringify(regRes.body)}`)
    }
    console.log('✅ Usuário registrado com sucesso!')

    // 3. Login
    console.log('\n--- 2. Fazer Login ---')
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email, password })
    
    if (loginRes.statusCode !== 200) {
      throw new Error(`Falha no login: ${JSON.stringify(loginRes.body)}`)
    }
    const token = loginRes.body.data.token
    console.log('✅ Login realizado com sucesso! Token JWT gerado.')

    // 4. Perfil Inicial
    console.log('\n--- 3. Obter Perfil Inicial ---')
    const profileRes = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
    
    if (profileRes.statusCode !== 200) {
      throw new Error(`Falha ao obter perfil: ${JSON.stringify(profileRes.body)}`)
    }
    const userProfile = profileRes.body.data
    console.log(`✅ Perfil obtido! Vidas: ${userProfile.lives}/5, XP: ${userProfile.current_xp}, Nível: ${userProfile.level}`)
    
    if (userProfile.lives !== 5) {
      throw new Error('Vidas padrão deveriam ser 5!')
    }

    // 5. Listar Linguagens
    console.log('\n--- 4. Listar Linguagens/Trilhas Disponíveis ---')
    const langsRes = await request(app)
      .get('/learning/languages')
      .set('Authorization', `Bearer ${token}`)
    
    if (langsRes.statusCode !== 200) {
      throw new Error(`Falha ao listar linguagens: ${JSON.stringify(langsRes.body)}`)
    }
    const languages = langsRes.body.data
    console.log(`✅ Linguagens encontradas: ${languages.length}`)
    languages.forEach(l => console.log(`  - [${l.enrolled ? 'X' : ' '}] ${l.name} (${l.slug})`))

    const jsLang = languages.find(l => l.slug === 'javascript')
    if (!jsLang) {
      throw new Error('Linguagem JavaScript não encontrada nas trilhas! Rodou o seed?')
    }

    // 6. Matricular em JavaScript
    console.log(`\n--- 5. Matricular na trilha de JavaScript (${jsLang.name}) ---`)
    const enrollRes = await request(app)
      .post(`/learning/languages/${jsLang.id}/enroll`)
      .set('Authorization', `Bearer ${token}`)
    
    if (enrollRes.statusCode !== 201) {
      throw new Error(`Falha na matrícula: ${JSON.stringify(enrollRes.body)}`)
    }
    console.log('✅ Matrícula concluída!')

    // 7. Obter Trilha de JavaScript
    console.log('\n--- 6. Obter Trilha de Módulos e Aulas ---')
    const trailRes = await request(app)
      .get(`/learning/languages/${jsLang.id}/trail`)
      .set('Authorization', `Bearer ${token}`)
    
    if (trailRes.statusCode !== 200) {
      throw new Error(`Falha ao obter trilha: ${JSON.stringify(trailRes.body)}`)
    }
    const modules = trailRes.body.data.modules
    console.log(`✅ Trilha obtida! Encontrados ${modules.length} módulo(s).`)
    
    let firstLesson = null
    modules.forEach(m => {
      console.log(`  Módulo: ${m.name}`)
      m.lessons.forEach(l => {
        console.log(`    - Aula: ${l.name} [Concluída: ${l.completed}] (XP: ${l.xp_reward})`)
        if (!firstLesson) firstLesson = l
      })
    })

    if (!firstLesson) {
      throw new Error('Nenhuma aula encontrada na trilha!')
    }

    // 8. Pegar detalhes da primeira aula
    console.log(`\n--- 7. Obter Exercícios da Aula "${firstLesson.name}" ---`)
    const lessonRes = await request(app)
      .get(`/learning/lessons/${firstLesson.id}`)
      .set('Authorization', `Bearer ${token}`)
    
    if (lessonRes.statusCode !== 200) {
      throw new Error(`Falha ao obter aula: ${JSON.stringify(lessonRes.body)}`)
    }
    const { exercises } = lessonRes.body.data
    console.log(`✅ Detalhes obtidos! Encontrados ${exercises.length} exercício(s).`)
    exercises.forEach(ex => {
      console.log(`    [${ex.type}] Pergunta: ${ex.question_text}`)
    })

    // 9. Enviar resposta incorreta (testar perda de vida)
    console.log('\n--- 8. Submeter Resposta Incorreta (Simular Erro) ---')
    const wrongAnswers = exercises.map(ex => ({
      exerciseId: ex.id,
      answer: 'RESPOSTA_ERRADA_QUALQUER'
    }))

    const submitWrongRes = await request(app)
      .post(`/learning/lessons/${firstLesson.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: wrongAnswers })
    
    if (submitWrongRes.statusCode !== 200) {
      throw new Error(`Falha ao submeter resposta incorreta: ${JSON.stringify(submitWrongRes.body)}`)
    }
    const wrongResult = submitWrongRes.body.data
    console.log(`✅ Submissão processada! Sucesso: ${wrongResult.success}`)
    console.log(`✅ Vidas restantes: ${wrongResult.lives}/5 (deveria ser 4)`)
    console.log('Mensagem da API:', wrongResult.message)
    
    if (wrongResult.lives !== 4) {
      throw new Error(`Vidas deveriam ser 4, mas é ${wrongResult.lives}`)
    }

    // 10. Enviar resposta correta (testar conclusão e ganho de XP)
    console.log('\n--- 9. Submeter Resposta Correta (Simular Sucesso) ---')
    // Nota: Como limpamos as respostas no GET, nós precisamos saber a resposta real do banco
    // para essa simulação. Vamos buscar no banco diretamente para fins de teste.
    const realExercises = await pool.query(
      'SELECT id, correct_answer FROM exercises WHERE lesson_id = $1',
      [firstLesson.id]
    )
    
    const correctAnswers = realExercises.rows.map(ex => ({
      exerciseId: ex.id,
      answer: ex.correct_answer
    }))

    const submitRightRes = await request(app)
      .post(`/learning/lessons/${firstLesson.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: correctAnswers })
    
    if (submitRightRes.statusCode !== 200) {
      throw new Error(`Falha ao submeter resposta correta: ${JSON.stringify(submitRightRes.body)}`)
    }
    const rightResult = submitRightRes.body.data
    console.log(`✅ Submissão processada! Sucesso: ${rightResult.success}`)
    console.log(`✅ XP Ganho: ${rightResult.xp_earned}, Novo Nível: ${rightResult.new_level}, Ofensiva (Streak): ${rightResult.streak}`)
    console.log('Mensagem da API:', rightResult.message)

    if (!rightResult.success) {
      throw new Error('Deveria ter concluído a aula com sucesso!')
    }

    // 11. Verificar perfil atualizado
    console.log('\n--- 10. Obter Perfil Atualizado ---')
    const finalProfileRes = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${token}`)
    
    const finalProfile = finalProfileRes.body.data
    console.log(`✅ Perfil atual: Vidas: ${finalProfile.lives}/5, XP: ${finalProfile.current_xp}, Nível: ${finalProfile.level}, Streak: ${finalProfile.streak}`)

    // 12. Testar o Habit Tracker
    console.log('\n--- 11. Testar Habit Tracker (Toggle Habit) ---')
    const todayStr = new Date().toISOString().split('T')[0]
    const habitRes = await request(app)
      .post('/tracker/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: todayStr, type: 'leitura' })
    
    if (habitRes.statusCode !== 200) {
      throw new Error(`Falha no habit tracker: ${JSON.stringify(habitRes.body)}`)
    }
    console.log('✅ Hábito registrado com sucesso!')

    // 13. Testar os Stats do Gráfico
    console.log('\n--- 12. Obter Dados do Gráfico de Evolução (Stats) ---')
    const chartRes = await request(app)
      .get('/stats/chart')
      .set('Authorization', `Bearer ${token}`)
    
    if (chartRes.statusCode !== 200) {
      throw new Error(`Falha ao obter gráfico: ${JSON.stringify(chartRes.body)}`)
    }
    console.log('✅ Dados do gráfico obtidos!')
    console.log('Rótulos (Dias):', chartRes.body.data.labels)
    console.log('Valores (XP):', chartRes.body.data.data)

    console.log('\n🎉 ============================================== 🎉')
    console.log('🎉 VERIFICAÇÃO CONCLUÍDA COM SUCESSO! TUDO FUNCIONA! 🎉')
    console.log('🎉 ============================================== 🎉')

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A VERIFICAÇÃO:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runVerification()
