import { pool } from './pool.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const languagesData = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'HTML/CSS',
    slug: 'html-css',
    description: 'Aprenda a estruturar e estilizar suas páginas web do zero absoluto.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    topics: [
      'Tags Estruturais Básicas (html, head, body)',
      'Elementos de Texto (h1, p, span, br)',
      'Links e Âncoras (a href, target)',
      'Imagens e Mídia (img src, alt)',
      'Listas Ordenadas e Desordenadas (ul, ol, li)',
      'Tabelas e Dados (table, tr, td)',
      'Formulários e Inputs (form, input, label)',
      'Introdução ao CSS (color, background, font)',
      'Box Model (margin, padding, border)',
      'Flexbox Layout (display flex, justify, align)'
    ]
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'Domine a linguagem que dá vida e interatividade à web moderna.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    topics: [
      'Variáveis e Constantes (let, const)',
      'Tipos de Dados (string, number, boolean)',
      'Operadores Aritméticos e Comparação',
      'Estruturas Condicionais (if, else if, else)',
      'Arrays e Listas (push, pop, length)',
      'Estruturas de Repetição (for, while)',
      'Declaração de Funções (function, return)',
      'Arrow Functions e Callbacks',
      'Objetos e Propriedades (key, value)',
      'Manipulação Básica do DOM'
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'React',
    slug: 'react',
    description: 'Aprenda a criar interfaces de usuário reativas com componentes.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    topics: [
      'Componentes e Elementos (Conceito)',
      'JSX: Sintaxe e Regras Básicas',
      'Propriedades e Props (Passagem de dados)',
      'Renderização Condicional no JSX',
      'Listas e a Propriedade key',
      'Introdução ao Hook useState (State)',
      'Manipulação de Eventos (onClick, onChange)',
      'Introdução ao Hook useEffect (Lifecycle)',
      'Regras dos Hooks e Boas Práticas',
      'Estado Global e Context API (Conceito)'
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Java',
    slug: 'java',
    description: 'Domine a linguagem corporativa e orientada a objetos mais usada no mundo.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    topics: [
      'Estrutura Básica (class, public static void main)',
      'Tipos Primitivos (int, double, char, boolean)',
      'Operadores e Condicionais (if, else, switch)',
      'Loops e Repetição (for, while, loop controls)',
      'Arrays de Tamanho Fixo',
      'Métodos, Parâmetros e Retorno',
      'Classes, Atributos e Construtores',
      'Encapsulamento (private, getters, setters)',
      'Herança de Classes (extends)',
      'Tratamento de Erros (try, catch)'
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Python',
    slug: 'python',
    description: 'Aprenda a linguagem mais popular para ciência de dados, IA e automação.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    topics: [
      'Sintaxe e Comando print()',
      'Variáveis e Tipos (str, int, float, bool)',
      'Condicionais (if, elif, else)',
      'Loops e Repetição (for, while, range)',
      'Listas em Python (append, len, slice)',
      'Dicionários e Chaves (dict, key-value)',
      'Funções com def e Argumentos',
      'Manipulação Básica de Arquivos (open, read, write)',
      'Orientação a Objetos (class, def __init__, self)',
      'Tratamento de Exceções (try, except)'
    ]
  }
];

function generateExercises(lessonId, langSlug, phaseNum, phaseTopic) {
  const exercises = [];
  
  // Exercise 1: Multiple choice
  exercises.push({
    id: crypto.randomUUID(),
    lesson_id: lessonId,
    type: 'multiple_choice',
    question_text: `[Fase ${phaseNum}] Qual é o objetivo principal de: "${phaseTopic}"?`,
    options: JSON.stringify([
      `Definir regras de sintaxe e estrutura para ${phaseTopic}`,
      `Manipular o banco de dados diretamente`,
      `Compilar o código binário da aplicação`,
      `Nenhuma das alternativas`
    ]),
    correct_answer: `Definir regras de sintaxe e estrutura para ${phaseTopic}`,
    explanation: `O conceito de "${phaseTopic}" é fundamental para entender a base e a aplicação dessa funcionalidade no desenvolvimento com ${langSlug.toUpperCase()}.`,
    order_index: 1
  });

  // Exercise 2: Fill in the blank
  const isHtml = langSlug === 'html-css';
  const isPy = langSlug === 'python';
  const codeSnippetEx2 = isHtml 
    ? `<!-- Exemplo de ${phaseTopic} -->\n<[blank]>Conteúdo de teste</...>`
    : isPy
    ? `# Exemplo de ${phaseTopic}\n[blank] valor = 10`
    : `// Exemplo de ${phaseTopic}\n[blank] valor = 10;`;
  
  const optionsEx2 = isHtml 
    ? ['div', 'body', 'html', 'p'] 
    : isPy
    ? ['def', 'class', 'import', 'val'] 
    : ['let', 'const', 'function', 'class'];
  
  const answerEx2 = isHtml ? 'div' : isPy ? 'def' : 'let';

  exercises.push({
    id: crypto.randomUUID(),
    lesson_id: lessonId,
    type: 'fill_in_the_blank',
    question_text: `Complete a lacuna com a palavra-chave correta para aplicar "${phaseTopic}":`,
    code_snippet: codeSnippetEx2,
    options: JSON.stringify(optionsEx2),
    correct_answer: answerEx2,
    explanation: `A palavra-chave correta inicia o bloco de declaração ou estrutura de ${phaseTopic} nesta linguagem.`,
    order_index: 2
  });

  // Exercise 3: Code output
  const codeSnippetEx3 = isHtml
    ? `<div class="box">\n  <!-- ${phaseTopic} -->\n</div>`
    : isPy
    ? `def teste():\n    print("${phaseTopic}")\nteste()`
    : `console.log("${phaseTopic}");`;

  exercises.push({
    id: crypto.randomUUID(),
    lesson_id: lessonId,
    type: 'code_output',
    question_text: `Qual será o comportamento ou resultado do código a seguir relacionado a "${phaseTopic}"?`,
    code_snippet: codeSnippetEx3,
    options: JSON.stringify([
      `Renderiza ou executa "${phaseTopic}" com sucesso`,
      `Gera um erro de sintaxe impeditivo`,
      `Exibe um aviso de depreciação`,
      `Não faz nada`
    ]),
    correct_answer: `Renderiza ou executa "${phaseTopic}" com sucesso`,
    explanation: `O código está estruturado corretamente e executa o comportamento esperado de ${phaseTopic}.`,
    order_index: 3
  });

  // Exercise 4: Multiple choice
  exercises.push({
    id: crypto.randomUUID(),
    lesson_id: lessonId,
    type: 'multiple_choice',
    question_text: `[${langSlug.toUpperCase()}] Sobre "${phaseTopic}", assinale a alternativa VERDADEIRA:`,
    options: JSON.stringify([
      `É uma prática altamente recomendada no desenvolvimento moderno.`,
      `Foi descontinuada nas versões mais recentes.`,
      `Só deve ser usada em ambientes de testes locais.`,
      `Gera lentidão excessiva na execução da página.`
    ]),
    correct_answer: `É uma prática altamente recomendada no desenvolvimento moderno.`,
    explanation: `A utilização correta de ${phaseTopic} garante legibilidade, performance e segue os padrões da comunidade.`,
    order_index: 4
  });

  // Exercise 5: Fill in the blank
  exercises.push({
    id: crypto.randomUUID(),
    lesson_id: lessonId,
    type: 'fill_in_the_blank',
    question_text: `Complete a lacuna do comentário para finalizar a lição sobre "${phaseTopic}":`,
    code_snippet: isPy
      ? `# Fim da fase ${phaseNum}: [blank]\nprint("Concluído!")`
      : `// Fim da fase ${phaseNum}: [blank]\nconsole.log("Concluído!");`,
    options: JSON.stringify(['Estudo', 'Erro', 'Parar', 'Pular']),
    correct_answer: 'Estudo',
    explanation: `Completar o comentário marca a conclusão bem-sucedida do estudo de ${phaseTopic}.`,
    order_index: 5
  });

  return exercises;
}

async function seed() {
  console.log('Starting database seed...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Clean tables
    console.log('Cleaning existing database data...')
    await client.query('DELETE FROM user_progress')
    await client.query('DELETE FROM user_languages')
    await client.query('DELETE FROM habits')
    await client.query('DELETE FROM users')
    await client.query('DELETE FROM exercises')
    await client.query('DELETE FROM lessons')
    await client.query('DELETE FROM modules')
    await client.query('DELETE FROM languages')

    // 0. COMMON USER
    console.log('Inserting common user...')
    const passwordHash = await bcrypt.hash('password123', 10)
    await client.query(`
      INSERT INTO users (id, name, email, password_hash, current_xp, level, lives)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Usuário Comum', 'user@devhabit.com', $1, 0, 1, 5)
    `, [passwordHash])

    // Loop through languages
    for (const lang of languagesData) {
      console.log(`Inserting language: ${lang.name}...`)
      await client.query(`
        INSERT INTO languages (id, name, slug, description, icon_url)
        VALUES ($1, $2, $3, $4, $5)
      `, [lang.id, lang.name, lang.slug, lang.description, lang.icon_url])

      // Generate 10 phases (each phase has 1 module, 1 lesson, 5 exercises)
      for (let i = 0; i < 10; i++) {
        const phaseNum = i + 1;
        const topic = lang.topics[i];
        
        const moduleId = crypto.randomUUID()
        const lessonId = crypto.randomUUID()

        // Insert module
        await client.query(`
          INSERT INTO modules (id, language_id, name, order_index)
          VALUES ($1, $2, $3, $4)
        `, [moduleId, lang.id, `Fase ${phaseNum}: ${topic.split(' (')[0]}`, phaseNum])

        // Insert lesson
        await client.query(`
          INSERT INTO lessons (id, module_id, name, description, xp_reward, order_index)
          VALUES ($1, $2, $3, $4, 20, 1)
        `, [lessonId, moduleId, `${phaseNum}. ${topic}`, `Domine o assunto de ${topic} com exercícios interativos.`, phaseNum])

        // Generate and insert exercises
        const exercises = generateExercises(lessonId, lang.slug, phaseNum, topic)
        for (const ex of exercises) {
          if (ex.code_snippet) {
            await client.query(`
              INSERT INTO exercises (id, lesson_id, type, question_text, code_snippet, options, correct_answer, explanation, order_index)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [ex.id, ex.lesson_id, ex.type, ex.question_text, ex.code_snippet, ex.options, ex.correct_answer, ex.explanation, ex.order_index])
          } else {
            await client.query(`
              INSERT INTO exercises (id, lesson_id, type, question_text, options, correct_answer, explanation, order_index)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [ex.id, ex.lesson_id, ex.type, ex.question_text, ex.options, ex.correct_answer, ex.explanation, ex.order_index])
          }
        }
      }
    }

    await client.query('COMMIT')
    console.log('Database seeded successfully!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to seed database:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
