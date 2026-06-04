import { pool } from './pool.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Starting database seed...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Clean tables
    console.log('Cleaning existing learning data...')
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
      INSERT INTO users (name, email, password_hash, current_xp, level, lives)
      VALUES ('Usuário Comum', 'user@devhabit.com', $1, 0, 1, 5)
    `, [passwordHash])

    // 1. SEED DATA STRUCTURE
    const seedData = [
      {
        name: 'HTML/CSS',
        slug: 'html-css',
        description: 'Aprenda a estruturar e estilizar suas páginas web do zero absoluto.',
        icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        modules: [
          {
            name: 'Fase 1: Estrutura Básica e HTML5',
            lesson: {
              name: 'Estrutura Inicial de um Documento HTML',
              description: 'Aprenda a estruturar suas páginas com tags básicas do HTML5.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual elemento HTML define a estrutura principal do cabeçalho da página onde ficam metadados e o título da aba?',
                  options: ['<body>', '<head>', '<title>', '<html>'],
                  correct_answer: '<head>',
                  explanation: 'O elemento <head> contém metadados, links para CSS e o título da aba do navegador, enquanto <body> contém o conteúdo visual.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a tag que envolve todo o conteúdo visível de um site:',
                  code_snippet: '<html>\n  <head><title>Meu site</title></head>\n  [blank] \n    <h1>Olá, Mundo!</h1>\n  </body>\n</html>',
                  options: ['<body>', '<header>', '<main>', '<section>'],
                  correct_answer: '<body>',
                  explanation: 'O corpo visual do documento é representado pela tag <body>.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual tag HTML é a mais apropriada para representar o título principal e mais importante de uma página?',
                  options: ['<h6>', '<h1>', '<title>', '<p>'],
                  correct_answer: '<h1>',
                  explanation: 'A tag <h1> deve ser usada para representar o título principal do documento. Deve haver apenas um h1 por página.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a tag que inicia um parágrafo no HTML:',
                  code_snippet: '<[blank]>Olá Mundo</p>',
                  options: ['p', 'div', 'span', 'text'],
                  correct_answer: 'p',
                  explanation: 'Parágrafos em HTML são criados usando a tag <p>.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual tag é usada para inserir uma quebra de linha em um texto HTML?',
                  options: ['<lb>', '<br>', '<break>', '<hr>'],
                  correct_answer: '<br>',
                  explanation: 'A tag <br> (break line) insere uma quebra de linha direta sem criar novos parágrafos.'
                }
              ]
            }
          },
          {
            name: 'Fase 2: Estilização com CSS3',
            lesson: {
              name: 'Introdução à Estilização com CSS',
              description: 'Dê vida e cores às suas páginas aplicando regras de CSS3.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade CSS deve ser usada para alterar a cor do texto de um elemento?',
                  options: ['text-color', 'color', 'background-color', 'font-color'],
                  correct_answer: 'color',
                  explanation: 'Em CSS, a propriedade "color" altera a cor do texto, enquanto "background-color" altera o fundo.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Mude a cor de fundo de um botão para azul no CSS:',
                  code_snippet: 'button {\n  [blank]: blue;\n}',
                  options: ['background', 'background-color', 'color', 'border-color'],
                  correct_answer: 'background-color',
                  explanation: 'A propriedade "background-color" define especificamente a cor de fundo do elemento.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como aplicamos uma classe CSS chamada "destaque" a uma tag de parágrafo HTML?',
                  options: ['class="destaque"', 'id="destaque"', 'style="destaque"', 'css="destaque"'],
                  correct_answer: 'class="destaque"',
                  explanation: 'O atributo HTML "class" é usado para associar uma ou mais classes de estilização ao elemento.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade CSS altera o tamanho do texto?',
                  options: ['text-size', 'font-size', 'size', 'font-width'],
                  correct_answer: 'font-size',
                  explanation: 'A propriedade "font-size" define a dimensão dos caracteres do texto.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a cor do texto do parágrafo com as regras CSS aplicadas abaixo?',
                  code_snippet: 'p {\n  color: red;\n}\n.texto {\n  color: blue;\n}\n\nHTML:\n<p class="texto">Olá</p>',
                  options: ['red', 'blue', 'preto', 'rgb(0,0,0)'],
                  correct_answer: 'blue',
                  explanation: 'O seletor de classe (.texto) tem maior especificidade do que o seletor de tag (p), logo o texto fica azul.'
                }
              ]
            }
          },
          {
            name: 'Fase 3: Box Model e Layouts',
            lesson: {
              name: 'Compreendendo o Box Model',
              description: 'Domine as margens, preenchimentos e bordas no CSS.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'No CSS Box Model, qual área fica entre o conteúdo e a borda interna do elemento?',
                  options: ['margin', 'padding', 'border', 'outline'],
                  correct_answer: 'padding',
                  explanation: 'O "padding" define o espaço interno do elemento, entre seu conteúdo e sua borda.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a propriedade para definir uma margem externa de 20px ao redor do elemento:',
                  code_snippet: 'div {\n  [blank]: 20px;\n}',
                  options: ['margin', 'padding', 'border', 'outer-space'],
                  correct_answer: 'margin',
                  explanation: 'A propriedade "margin" cria um espaço transparente ao redor do elemento, fora de suas bordas.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade define a largura total do conteúdo de um elemento no CSS?',
                  options: ['height', 'width', 'max-width', 'size'],
                  correct_answer: 'width',
                  explanation: '"width" define a largura do elemento.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será o valor do preenchimento esquerdo (padding-left) baseado na regra abaixo?',
                  code_snippet: 'div {\n  padding: 10px 20px 15px 5px;\n}',
                  options: ['10px', '20px', '15px', '5px'],
                  correct_answer: '5px',
                  explanation: 'Quando declaramos 4 valores no padding/margin, a ordem segue o sentido horário: topo (10px), direita (20px), baixo (15px), esquerda (5px).'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade CSS define a borda de um elemento especificando largura, estilo e cor em uma única declaração?',
                  options: ['border-style', 'border', 'border-width', 'border-color'],
                  correct_answer: 'border',
                  explanation: 'A propriedade atalho "border" (ex: border: 1px solid black) define espessura, tipo de linha e cor de uma vez.'
                }
              ]
            }
          },
          {
            name: 'Fase 4: Flexbox e Grid',
            lesson: {
              name: 'Layouts Flexíveis com Flexbox',
              description: 'Posicione elementos com facilidade usando Flexbox.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade CSS deve ser aplicada ao elemento pai para iniciar um contexto de layout Flexbox?',
                  options: ['flex: true', 'display: flex', 'align: flex', 'position: flex'],
                  correct_answer: 'display: flex',
                  explanation: 'Ao definir display: flex, o elemento vira um flex container e seus filhos viram flex items.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a propriedade usada para alinhar itens ao longo do eixo principal (horizontal) no Flexbox:',
                  code_snippet: '.container {\n  display: flex;\n  [blank]: center;\n}',
                  options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
                  correct_answer: 'justify-content',
                  explanation: 'A propriedade "justify-content" alinha flex items no eixo de direção principal.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade alinha os itens do flex container ao longo do eixo transversal (vertical)?',
                  options: ['justify-content', 'align-items', 'flex-flow', 'align-content'],
                  correct_answer: 'align-items',
                  explanation: '"align-items" define o alinhamento padrão para os itens ao longo do eixo transversal.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual valor da propriedade flex-direction empilha os itens verticalmente em vez de horizontalmente?',
                  options: ['row', 'column', 'vertical', 'stack'],
                  correct_answer: 'column',
                  explanation: 'O valor "column" muda a direção principal do layout para o eixo vertical.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Qual propriedade define o espaçamento direto entre itens em um container flex ou grid?',
                  code_snippet: '.grid {\n  display: grid;\n  [blank]: 16px;\n}',
                  options: ['gap', 'margin', 'padding', 'spacing'],
                  correct_answer: 'gap',
                  explanation: 'A propriedade "gap" cria espaços entre linhas e colunas em layouts flex e grid.'
                }
              ]
            }
          },
          {
            name: 'Fase 5: Responsividade e Media Queries',
            lesson: {
              name: 'Design Responsivo para Dispositivos Móveis',
              description: 'Aprenda a deixar seu site perfeito em qualquer tamanho de tela.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual regra CSS é utilizada para aplicar estilos apenas quando a tela atende a certas condições de tamanho?',
                  options: ['@import', '@media', '@keyframes', '@supports'],
                  correct_answer: '@media',
                  explanation: 'As media queries (@media) permitem aplicar blocos de estilos CSS condicionados ao tamanho do dispositivo (ex: max-width: 768px).'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Escreva a propriedade CSS necessária para garantir que uma imagem nunca ultrapasse a largura do seu container:',
                  code_snippet: 'img {\n  [blank]: 100%;\n  height: auto;\n}',
                  options: ['width', 'max-width', 'min-width', 'flex-basis'],
                  correct_answer: 'max-width',
                  explanation: 'Usar "max-width: 100%" garante que a largura da imagem seja no máximo a largura do pai, escalando proporcionalmente.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual unidade CSS é baseada em 1% da largura total da janela do navegador?',
                  options: ['vh', 'vw', 'rem', 'em'],
                  correct_answer: 'vw',
                  explanation: 'A unidade "vw" significa viewport width. 100vw equivale a 100% da largura da janela.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual o conceito principal por trás da estratégia "Mobile-First" no desenvolvimento web?',
                  options: [
                    'Criar o app desktop primeiro e depois remover partes',
                    'Escrever os estilos para telas menores e ir adicionando media queries para telas maiores',
                    'Desenvolver apenas para celulares e ignorar computadores',
                    'Usar frameworks pesados no celular'
                  ],
                  correct_answer: 'Escrever os estilos para telas menores e ir adicionando media queries para telas maiores',
                  explanation: 'O design Mobile-First foca na otimização de performance e usabilidade móvel inicial, expandindo para telas maiores gradualmente.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a tag meta essencial no head para que o site renderize corretamente em celulares:',
                  code_snippet: '<meta name="[blank]" content="width=device-width, initial-scale=1.0">',
                  options: ['viewport', 'description', 'robots', 'theme-color'],
                  correct_answer: 'viewport',
                  explanation: 'A meta tag "viewport" configura como navegadores móveis controlam as dimensões e escalas da página.'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Domine a linguagem que dá vida e interatividade à web moderna.',
        icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        modules: [
          {
            name: 'Fase 1: Variáveis e Tipos de Dados',
            lesson: {
              name: 'Declaração de Variáveis e Tipos no JavaScript',
              description: 'Entenda os tipos básicos de dados e declaração de variáveis.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual palavra-chave do JavaScript deve ser usada para declarar uma variável cujo valor PODE ser reatribuído?',
                  options: ['const', 'let', 'var', 'immutable'],
                  correct_answer: 'let',
                  explanation: 'A palavra-chave "let" declara uma variável com escopo de bloco que pode ter seu valor modificado.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a linha para declarar uma constante chamada PI com o valor 3.14:',
                  code_snippet: '[blank] PI = 3.14;',
                  options: ['const', 'let', 'var', 'constant'],
                  correct_answer: 'const',
                  explanation: 'Variáveis imutáveis (constantes) são declaradas com a palavra-chave "const".'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual tipo de dados representa apenas os valores verdadeiro (true) ou falso (false)?',
                  options: ['String', 'Number', 'Boolean', 'Undefined'],
                  correct_answer: 'Boolean',
                  explanation: 'Booleanos representam valores lógicos binários: true ou false.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será o valor impresso após tentar reatribuir uma constante?',
                  code_snippet: 'const nome = "DevHabit";\nnome = "Estudo";\nconsole.log(nome);',
                  options: ['DevHabit', 'Estudo', 'Erro (TypeError)', 'undefined'],
                  correct_answer: 'Erro (TypeError)',
                  explanation: 'Tentar reatribuir valor a uma variável do tipo "const" lança um erro do tipo TypeError (Assignment to constant variable).'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será o resultado da soma de uma string "10" com o número 5?',
                  code_snippet: 'const res = "10" + 5;\nconsole.log(res);',
                  options: ['15', '105', 'TypeError', 'undefined'],
                  correct_answer: '105',
                  explanation: 'O operador + faz concatenação quando um dos operandos é uma String, convertendo implicitamente o 5 em "5".'
                }
              ]
            }
          },
          {
            name: 'Fase 2: Operadores e Condicionais',
            lesson: {
              name: 'Estruturas Condicionais no Javascript',
              description: 'Tome decisões no fluxo do seu código usando if, else e switch.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual operador do JavaScript verifica a igualdade estrita de valor E tipo de duas variáveis?',
                  options: ['==', '===', '=', '!='],
                  correct_answer: '===',
                  explanation: 'O operador === compara valor e tipo sem fazer conversão implícita. O operador == compara apenas valores fazendo coação.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual valor será impresso no console com a nota 85?',
                  code_snippet: 'const nota = 85;\nif (nota >= 90) {\n  console.log("A");\n} else if (nota >= 80) {\n  console.log("B");\n} else {\n  console.log("C");\n}',
                  options: ['A', 'B', 'C', 'undefined'],
                  correct_answer: 'B',
                  explanation: '85 não é >= 90, mas é >= 80. Logo, o bloco do "else if" é executado, imprimindo B.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a condicional para verificar se a idade é maior ou igual a 18:',
                  code_snippet: 'const idade = 20;\nif (idade [blank] 18) {\n  console.log("Maior");\n}',
                  options: ['>=', '>', '==', '<='],
                  correct_answer: '>=',
                  explanation: 'O operador ">=" verifica se o valor à esquerda é maior ou igual ao da direita.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual operador lógico representa a conjunção E (AND) no JavaScript?',
                  options: ['||', '&&', '!', '??'],
                  correct_answer: '&&',
                  explanation: 'O operador && retorna verdadeiro se e somente se ambas as condições comparadas forem verdadeiras.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual o resultado do código a seguir?',
                  code_snippet: 'console.log(!true || false);',
                  options: ['true', 'false', 'undefined', 'null'],
                  correct_answer: 'false',
                  explanation: '!true vira false. Então a operação lógica é "false || false", cujo resultado final é false.'
                }
              ]
            }
          },
          {
            name: 'Fase 3: Laços de Repetição e Arrays',
            lesson: {
              name: 'Trabalhando com Repetições e Listas',
              description: 'Gerencie listas e automatize repetições com loops.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual método de Array insere um ou mais elementos no FINAL do array no JavaScript?',
                  options: ['pop()', 'push()', 'shift()', 'unshift()'],
                  correct_answer: 'push()',
                  explanation: 'O método push() adiciona elementos ao final de um array e retorna o novo tamanho dele.'
                },
                {
                  type: 'code_output',
                  question_text: 'Quantas vezes a mensagem será exibida no console?',
                  code_snippet: 'for (let i = 0; i < 3; i++) {\n  console.log("Olá");\n}',
                  options: ['2', '3', '4', '0'],
                  correct_answer: '3',
                  explanation: 'O loop inicia em i = 0, roda para 0, 1 e 2. Quando i vira 3, a condição i < 3 falha. Rodando exatamente 3 vezes.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o laço while para rodar enquanto o contador for menor que 5:',
                  code_snippet: 'let c = 0;\nwhile (c [blank] 5) {\n  c++;\n}',
                  options: ['<', '<=', '>', '=='],
                  correct_answer: '<',
                  explanation: 'O operador menor que "<" mantém o loop até que c chegue a 5.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como acessamos o primeiro item (índice 0) de um array chamado "frutas"?',
                  options: ['frutas(0)', 'frutas.0', 'frutas[0]', 'frutas{0}'],
                  correct_answer: 'frutas[0]',
                  explanation: 'Em Javascript, arrays são indexados por números inteiros dentro de colchetes, iniciando do 0.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será o valor impresso no console após remover o último elemento com pop()?',
                  code_snippet: 'const numeros = [10, 20, 30];\nnumeros.pop();\nconsole.log(numeros.length);',
                  options: ['3', '2', '1', '0'],
                  correct_answer: '2',
                  explanation: 'O método pop() remove o último elemento ([30]). O array passa a ter tamanho 2.'
                }
              ]
            }
          },
          {
            name: 'Fase 4: Funções e Objetos',
            lesson: {
              name: 'Organizando Código com Funções e Objetos',
              description: 'Reutilize lógica e agrupe propriedades com objetos.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a sintaxe correta para criar uma função simples que retorna o quadrado de um número?',
                  options: ['function quad(x) { return x * x; }', 'function quad(x) { return x ^ 2; }', 'create quad(x) = x * x', 'let quad = x * x'],
                  correct_answer: 'function quad(x) { return x * x; }',
                  explanation: 'A sintaxe padrão de função usa a palavra "function", nome, parâmetros entre parênteses e bloco com return.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a declaração do objeto com a propriedade "idade" igual a 25:',
                  code_snippet: 'const pessoa = {\n  nome: "Ana",\n  [blank]: 25\n};',
                  options: ['idade', 'age', 'years', 'number'],
                  correct_answer: 'idade',
                  explanation: 'Chaves em objetos são separadas de seus valores por dois pontos (:).'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como acessamos a propriedade "nome" do objeto "usuario" usando notação de ponto?',
                  options: ['usuario->nome', 'usuario.nome', 'usuario(nome)', 'usuario[nome]'],
                  correct_answer: 'usuario.nome',
                  explanation: 'A notação de ponto (objeto.propriedade) é a forma mais direta de acessar dados estruturados.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual o retorno da função "somar" ao rodar o seguinte código?',
                  code_snippet: 'function somar(a, b) {\n  return a + b;\n}\nconst res = somar(3, 4);\nconsole.log(res);',
                  options: ['7', '12', '34', 'NaN'],
                  correct_answer: '7',
                  explanation: 'A função somar recebe a=3 e b=4, retornando 3 + 4 que é 7.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a arrow function que retorna o dobro de um valor x:',
                  code_snippet: 'const dobro = (x) [blank] x * 2;',
                  options: ['=>', '->', '=', 'return'],
                  correct_answer: '=>',
                  explanation: 'Arrow functions utilizam o operador de seta "=>" para indicar a expressão de retorno.'
                }
              ]
            }
          },
          {
            name: 'Fase 5: Manipulação do DOM',
            lesson: {
              name: 'Interação com Páginas Web via DOM',
              description: 'Altere textos, cores e escute eventos na página HTML.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual método do objeto document é usado para selecionar um elemento HTML pelo seu ID?',
                  options: ['document.getElementByName()', 'document.getElementById()', 'document.querySelectorId()', 'document.select()'],
                  correct_answer: 'document.getElementById()',
                  explanation: 'O método getElementById retorna o elemento da DOM que possui o ID correspondente.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o código para escutar o clique em um botão:',
                  code_snippet: 'const btn = document.getElementById("btn");\nbtn.[blank]("click", () => {\n  alert("Clicou!");\n});',
                  options: ['addEventListener', 'onclick', 'listenEvent', 'addListener'],
                  correct_answer: 'addEventListener',
                  explanation: 'Usar "addEventListener" permite adicionar múltiplos callbacks para monitorar eventos do navegador.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual propriedade do elemento DOM usamos para alterar o texto interno dele?',
                  options: ['innerText', 'style', 'className', 'src'],
                  correct_answer: 'innerText',
                  explanation: 'A propriedade innerText (ou textContent) representa o conteúdo textual visível do nó.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como alteramos a cor de fundo de um elemento DOM armazenado na variável "box" para vermelho?',
                  options: ["box.color = 'red'", "box.style.backgroundColor = 'red'", "box.style.background = 'red'", "box.css = 'background: red'"],
                  correct_answer: "box.style.backgroundColor = 'red'",
                  explanation: 'Em Javascript, propriedades CSS com traço são mapeadas para camelCase no objeto style: backgroundColor.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o método para criar uma nova tag "div" dinamicamente no JavaScript:',
                  code_snippet: 'const novaDiv = document.[blank]("div");',
                  options: ['createElement', 'newElement', 'createTag', 'makeElement'],
                  correct_answer: 'createElement',
                  explanation: 'O método document.createElement() cria um elemento do tipo especificado.'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'React',
        slug: 'react',
        description: 'Aprenda a criar interfaces de usuário reativas e modernas com componentes.',
        icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        modules: [
          {
            name: 'Fase 1: Componentes e JSX',
            lesson: {
              name: 'Fundamentos de Componentes e JSX',
              description: 'Aprenda o básico de componentes React e a sintaxe XML integrada.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'O que é JSX no React?',
                  options: [
                    'Uma extensão de sintaxe que permite escrever código HTML dentro de arquivos JavaScript',
                    'Uma linguagem de banco de dados',
                    'Um estilo CSS',
                    'Uma ferramenta de build'
                  ],
                  correct_answer: 'Uma extensão de sintaxe que permite escrever código HTML dentro de arquivos JavaScript',
                  explanation: 'JSX significa JavaScript XML, e é transpilado para chamadas normais de funções do React que geram a estrutura de renderização.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a exportação padrão do componente MeuComponente:',
                  code_snippet: 'function MeuComponente() {\n  return <h1>Olá</h1>;\n}\n[blank] default MeuComponente;',
                  options: ['export', 'import', 'package', 'module'],
                  correct_answer: 'export',
                  explanation: 'Usamos a palavra-chave "export" para compartilhar o componente com outros módulos.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual atributo HTML deve ser substituído por "className" ao escrever JSX?',
                  options: ['class', 'id', 'style', 'href'],
                  correct_answer: 'class',
                  explanation: 'Como "class" é uma palavra reservada no JavaScript, o JSX utiliza "className" para referenciar classes de estilo CSS.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual o elemento obrigatório que deve envolver múltiplos elementos JSX caso não queiramos adicionar uma tag real na DOM?',
                  options: ['<Fragment> (ou <></>)', '<div>', '<span>', '<container>'],
                  correct_answer: '<Fragment> (ou <></>)',
                  explanation: 'Os Fragments (<></>) servem para agrupar uma lista de filhos sem adicionar nós extras à árvore da DOM.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o retorno de um componente React com a tag h1:',
                  code_snippet: 'function App() {\n  [blank] (\n    <h1>Olá React</h1>\n  );\n}',
                  options: ['return', 'render', 'show', 'output'],
                  correct_answer: 'return',
                  explanation: 'Componentes funcionais no React são simples funções JavaScript que retornam elementos visuais.'
                }
              ]
            }
          },
          {
            name: 'Fase 2: Props e Renderização',
            lesson: {
              name: 'Passando Dados com Props',
              description: 'Aprenda a transferir dados de forma unidirecional entre componentes.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Para que servem as "props" em um componente React?',
                  options: [
                    'Para passar dados e propriedades de um componente pai para um filho',
                    'Para gerenciar o estado interno do componente',
                    'Para conectar com o banco de dados',
                    'Para instalar novas dependências'
                  ],
                  correct_answer: 'Para passar dados e propriedades de um componente pai para um filho',
                  explanation: 'Props (propriedades) funcionam como argumentos de uma função, permitindo parametrizar componentes.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Acesse a prop "nome" recebida no componente:',
                  code_snippet: 'function Saudacao(props) {\n  return <h1>Olá, {props.[blank]}</h1>;\n}',
                  options: ['nome', 'name', 'value', 'user'],
                  correct_answer: 'nome',
                  explanation: 'As propriedades vêm agrupadas em um único objeto geralmente chamado "props".'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como são representadas as propriedades dinâmicas e expressões JavaScript dentro do JSX?',
                  options: ['Entre chaves: {expressao}', 'Entre aspas: "expressao"', 'Entre parênteses: (expressao)', 'Entre colchetes: [expressao]'],
                  correct_answer: 'Entre chaves: {expressao}',
                  explanation: 'As chaves sinalizam ao interpretador do JSX que o conteúdo interno deve ser executado como JavaScript puro.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a saída do componente se passarmos <Saudacao nome="Maria"/>?',
                  code_snippet: 'function Saudacao({ nome }) {\n  return <h2>Oi {nome}</h2>;\n}',
                  options: ['Oi {nome}', 'Oi Maria', 'Oi undefined', 'Erro de compilação'],
                  correct_answer: 'Oi Maria',
                  explanation: 'A desestruturação de argumentos ({ nome }) extrai diretamente a propriedade do objeto props.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'As props recebidas por um componente são:',
                  options: ['Somente leitura (imutáveis)', 'Mutáveis diretamente', 'Salvas no banco de dados', 'Compartilhadas globalmente'],
                  correct_answer: 'Somente leitura (imutáveis)',
                  explanation: 'No React, um componente nunca deve modificar as suas próprias props de forma direta.'
                }
              ]
            }
          },
          {
            name: 'Fase 3: Estado e useState',
            lesson: {
              name: 'Gerenciamento de Estado com useState',
              description: 'Torne sua interface viva controlando estados internos.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual hook do React é utilizado para adicionar estado interno a um componente funcional?',
                  options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                  correct_answer: 'useState',
                  explanation: 'O useState é o hook básico para armazenar dados mutáveis que controlam o ciclo de vida e a interface.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a declaração do estado "contador" iniciando com o valor 0:',
                  code_snippet: 'const [contador, setContador] = [blank](0);',
                  options: ['useState', 'state', 'createState', 'hookState'],
                  correct_answer: 'useState',
                  explanation: 'Chamamos o hook useState passando o valor inicial do estado como argumento.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a maneira correta de atualizar o estado "contador" somando 1?',
                  options: ['contador++', 'contador = contador + 1', 'setContador(contador + 1)', 'updateContador(1)'],
                  correct_answer: 'setContador(contador + 1)',
                  explanation: 'Deves usar a função modificadora (setContador) retornada pelo hook para atualizar o valor corretamente e disparar re-render.'
                },
                {
                  type: 'code_output',
                  question_text: 'O que acontece na interface do usuário quando o estado de um componente é atualizado?',
                  options: [
                    'O componente é renderizado novamente',
                    'A página inteira recarrega',
                    'O banco de dados é atualizado',
                    'Nada acontece'
                  ],
                  correct_answer: 'O componente é renderizado novamente',
                  explanation: 'O React monitora atualizações de estado e redesenha na tela apenas a porção do componente afetada.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o import do hook useState a partir do pacote "react":',
                  code_snippet: 'import { [blank] } from \'react\';',
                  options: ['useState', 'ReactState', 'state', 'useStateHook'],
                  correct_answer: 'useState',
                  explanation: 'Hooks são exportados como named exports a partir da biblioteca principal.'
                }
              ]
            }
          },
          {
            name: 'Fase 4: Efeitos e useEffect',
            lesson: {
              name: 'Efeitos Colaterais com useEffect',
              description: 'Controle requisições e eventos do ciclo de vida.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a função do hook useEffect no React?',
                  options: [
                    'Executar efeitos colaterais, como buscar dados ou assinar timers',
                    'Estilizar elementos dinamicamente',
                    'Criar rotas na aplicação',
                    'Apenas gerenciar formulários'
                  ],
                  correct_answer: 'Executar efeitos colaterais, como buscar dados ou assinar timers',
                  explanation: 'O useEffect permite sincronizar seu componente com sistemas externos (operações fora da renderização pura).'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o array de dependências para que o useEffect execute apenas UMA vez (no mount):',
                  code_snippet: 'useEffect(() => {\n  console.log("Montou!");\n}, [blank]);',
                  options: ['[]', 'undefined', '[props]', 'null'],
                  correct_answer: '[]',
                  explanation: 'Passar uma lista vazia [] informa ao React que o efeito não depende de nenhum valor da renderização, rodando apenas uma vez.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Se passarmos uma variável no array de dependências do useEffect, quando ele será executado?',
                  options: [
                    'Apenas na primeira renderização',
                    'Toda vez que a variável em questão sofrer alguma alteração de valor',
                    'Nunca',
                    'Apenas quando a variável for excluída'
                  ],
                  correct_answer: 'Toda vez que a variável em questão sofrer alguma alteração de valor',
                  explanation: 'O React re-executa a callback sempre que detecta mudanças na lista de dependências por comparação rasa.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como realizamos uma limpeza (cleanup) em um efeito criado com useEffect?',
                  options: [
                    'Retornando uma função de limpeza de dentro do callback do useEffect',
                    'Chamando useEffect.cleanup()',
                    'Passando null no array de dependências',
                    'Chamando clearEffect()'
                  ],
                  correct_answer: 'Retornando uma função de limpeza de dentro do callback do useEffect',
                  explanation: 'O React executa a função retornada antes de desmontar o componente ou rodar o efeito de novo.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o import do hook useEffect a partir da biblioteca React:',
                  code_snippet: 'import { [blank] } from \'react\';',
                  options: ['useEffect', 'useState', 'Effect', 'ReactEffect'],
                  correct_answer: 'useEffect',
                  explanation: 'useEffect é um hook padrão importável da mesma biblioteca "react".'
                }
              ]
            }
          },
          {
            name: 'Fase 5: Requisições e Formulários',
            lesson: {
              name: 'Formulários e Integração com API',
              description: 'Crie inputs controlados e faça requisições HTTP em sua aplicação.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Como tratamos o envio de um formulário no React para evitar o recarregamento automático da página?',
                  options: ['Chamando event.preventDefault()', 'Chamando event.stop()', 'Usando method="post"', 'Isso é impossível no React'],
                  correct_answer: 'Chamando event.preventDefault()',
                  explanation: 'preventDefault impede o comportamento nativo do navegador de recarregar a tela inteira após o envio.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a associação da variável "email" ao valor digitado no input:',
                  code_snippet: '<input type="text" value={email} onChange={(e) => setEmail(e.target.[blank])} />',
                  options: ['value', 'text', 'content', 'data'],
                  correct_answer: 'value',
                  explanation: 'e.target.value captura o valor atualizado digitado dentro da caixa de texto.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'No padrão do React, o que é um "Controlled Component" (Componente Controlado)?',
                  options: [
                    'Um componente cuja fonte da verdade para o valor do input é o estado do React',
                    'Um componente que não aceita interações do usuário',
                    'Um componente que roda apenas no servidor',
                    'Um componente importado de bibliotecas externas'
                  ],
                  correct_answer: 'Um componente cuja fonte da verdade para o valor do input é o estado do React',
                  explanation: 'Controlados têm seu valor atrelado a um estado e manipulado por funções onChange, centralizando a lógica.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual método Javascript padrão é comumente usado para realizar chamadas HTTP no useEffect?',
                  options: ['fetch()', 'http()', 'get()', 'ajax()'],
                  correct_answer: 'fetch()',
                  explanation: 'O fetch() nativo do Javascript lida com requisições HTTP retornando promises de forma nativa e moderna.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a renderização condicional de uma mensagem de carregamento se a variável "loading" for verdadeira:',
                  code_snippet: '{loading [blank] <span>Carregando...</span>}',
                  options: ['&&', '||', '?', 'if'],
                  correct_answer: '&&',
                  explanation: 'O operador curto-circuito && renderiza o JSX da direita se a condição esquerda for verdadeira.'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'Java',
        slug: 'java',
        description: 'Desenvolva aplicações robustas e seguras com uma das linguagens corporativas mais usadas do mundo.',
        icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
        modules: [
          {
            name: 'Fase 1: Sintaxe Básica e Variáveis',
            lesson: {
              name: 'Fundamentos do Java e Variáveis',
              description: 'Escreva seus primeiros comandos em Java e declare variáveis fortemente tipadas.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual é o ponto de entrada principal de execução em qualquer programa escrito em Java?',
                  options: ['public static void main(String[] args)', 'public void run()', 'static void start()', 'class Main'],
                  correct_answer: 'public static void main(String[] args)',
                  explanation: 'A JVM (Java Virtual Machine) busca especificamente pelo método "main" estático e público para iniciar a execução do código.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Declare uma variável inteira chamada idade com valor 18:',
                  code_snippet: '[blank] idade = 18;',
                  options: ['int', 'double', 'Integer', 'var'],
                  correct_answer: 'int',
                  explanation: 'Em Java, o tipo primitivo para inteiros é "int".'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual tipo primitivo em Java é usado para armazenar um único caractere envolto em aspas simples?',
                  options: ['String', 'char', 'Character', 'byte'],
                  correct_answer: 'char',
                  explanation: 'O tipo primitivo "char" armazena um caractere simples de 16 bits Unicode.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a saída no console do código Java abaixo?',
                  code_snippet: 'int x = 5;\ndouble y = x;\nSystem.out.println(y);',
                  options: ['5', '5.0', 'Erro de compilação', 'null'],
                  correct_answer: '5.0',
                  explanation: 'Ocorre uma conversão implícita de inteiro para double (widening casting), imprimindo 5.0.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o comando padrão do Java usado para imprimir texto com quebra de linha:',
                  code_snippet: 'System.out.[blank]("Olá!");',
                  options: ['println', 'print', 'console.log', 'printf'],
                  correct_answer: 'println',
                  explanation: 'O método println() imprime a mensagem e pula uma linha na saída do console.'
                }
              ]
            }
          },
          {
            name: 'Fase 2: Controle de Fluxo (if/else, switch)',
            lesson: {
              name: 'Tomada de Decisão em Java',
              description: 'Crie lógicas de controle de fluxo de execução em sua aplicação.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual palavra-chave usamos para verificar múltiplas condições de forma encadeada caso o primeiro "if" seja falso?',
                  options: ['elif', 'else if', 'otherwise', 'switch'],
                  correct_answer: 'else if',
                  explanation: 'Diferente de Python (elif), Java usa a estrutura explícita "else if" para blocos encadeados.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o bloco switch para o caso em que a variável seja igual a 1:',
                  code_snippet: 'switch(opcao) {\n  [blank] 1:\n    System.out.println("Opção 1");\n    break;\n}',
                  options: ['case', 'default', 'when', 'if'],
                  correct_answer: 'case',
                  explanation: 'Usamos a palavra "case" seguida do valor literal no bloco switch.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Para que serve a palavra-chave "break" dentro de um bloco switch em Java?',
                  options: [
                    'Para parar a execução da classe',
                    'Para interromper a execução do switch impedindo que continue executando os próximos cases',
                    'Para gerar um erro controlado',
                    'Para reiniciar o programa'
                  ],
                  correct_answer: 'Para interromper a execução do switch impedindo que continue executando os próximos cases',
                  explanation: 'Sem a instrução "break", a execução "escorrega" (fall-through) e executa todos os cases subsequentes automaticamente.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual valor será impresso pelo código abaixo?',
                  code_snippet: 'int idade = 15;\nif (idade >= 18) {\n  System.out.println("Adulto");\n} else {\n  System.out.println("Menor");\n}',
                  options: ['Adulto', 'Menor', 'Erro de compilação', 'null'],
                  correct_answer: 'Menor',
                  explanation: 'Como 15 não é maior nem igual a 18, o bloco "else" é acionado, imprimindo "Menor".'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a palavra-chave que define o comportamento padrão em um switch caso nenhum case seja correspondido:',
                  code_snippet: 'switch(opcao) {\n  case 1:\n    System.out.println("Um");\n    break;\n  [blank]:\n    System.out.println("Outro");\n}',
                  options: ['default', 'else', 'break', 'other'],
                  correct_answer: 'default',
                  explanation: 'O bloco "default" é acionado se nenhum dos literais de case for compatível.'
                }
              ]
            }
          },
          {
            name: 'Fase 3: Estruturas de Repetição (for/while)',
            lesson: {
              name: 'Laços e Loops no Java',
              description: 'Repita instruções com loops controlados em Java.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a estrutura de repetição mais recomendada quando sabemos exatamente o número de iterações a realizar?',
                  options: ['while', 'for', 'do-while', 'foreach'],
                  correct_answer: 'for',
                  explanation: 'O laço "for" possui inicializador, condição de parada e incremento declarados juntos no cabeçalho.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a declaração do laço for para ir de 0 até 9:',
                  code_snippet: 'for (int i = 0; i [blank] 10; i++) {\n  System.out.println(i);\n}',
                  options: ['<', '<=', '>', '=='],
                  correct_answer: '<',
                  explanation: 'A condição "i < 10" faz o laço parar quando i atinge 10 (imprimindo de 0 a 9).'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a diferença principal entre o laço "while" e o laço "do-while"?',
                  options: [
                    'O do-while executa o seu bloco de código pelo menos uma vez antes de avaliar a condição',
                    'O while executa pelo menos uma vez',
                    'O do-while roda em background',
                    'Não há diferença alguma'
                  ],
                  correct_answer: 'O do-while executa o seu bloco de código pelo menos uma vez antes de avaliar a condição',
                  explanation: 'A condição do "do-while" é testada no fim do bloco, assegurando que o código execute uma vez independente da condição ser verdadeira de início.'
                },
                {
                  type: 'code_output',
                  question_text: 'Quantas vezes a mensagem "Java" será impressa?',
                  code_snippet: 'int c = 0;\nwhile (c < 3) {\n  System.out.println("Java");\n  c++;\n}',
                  options: ['2', '3', '4', '0'],
                  correct_answer: '3',
                  explanation: 'Roda para c=0, c=1 e c=2. C incrementa em cada loop. Após c=2, c vira 3 e sai do loop.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a instrução usada para pular a iteração atual do laço e ir para a próxima imediatamente:',
                  code_snippet: 'for(int i=0; i<5; i++) {\n  if(i == 2) [blank];\n  System.out.println(i);\n}',
                  options: ['continue', 'break', 'skip', 'return'],
                  correct_answer: 'continue',
                  explanation: 'A instrução "continue" desvia o fluxo da execução de volta para a avaliação condicional do loop.'
                }
              ]
            }
          },
          {
            name: 'Fase 4: Classes e Objetos',
            lesson: {
              name: 'Programação Orientada a Objetos em Java',
              description: 'Aprenda a estruturar classes e criar objetos reais em Java.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Como instanciamos um novo objeto da classe "Carro" em Java?',
                  options: ['Carro meuCarro = new Carro();', 'Carro meuCarro = Carro.create();', 'Carro meuCarro = Carro();', 'new Carro meuCarro;'],
                  correct_answer: 'Carro meuCarro = new Carro();',
                  explanation: 'A palavra-chave "new" aloca memória para uma nova instância e chama o construtor da classe.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a palavra-chave que representa a própria instância para diferenciar atributos de variáveis locais:',
                  code_snippet: 'public void setNome(String nome) {\n  [blank].nome = nome;\n}',
                  options: ['this', 'self', 'super', 'me'],
                  correct_answer: 'this',
                  explanation: 'A palavra-chave "this" aponta para o próprio objeto em contexto de execução.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'O que é um "construtor" em uma classe Java?',
                  options: [
                    'Um método especial com o mesmo nome da classe, executado ao criar um objeto para inicializar seus atributos',
                    'Um validador de código',
                    'Um compilador em tempo de execução',
                    'Um gerenciador de memória do Java'
                  ],
                  correct_answer: 'Um método especial com o mesmo nome da classe, executado ao criar um objeto para inicializar seus atributos',
                  explanation: 'Construtores definem como instanciar novos objetos, não possuem tipo de retorno e são declarados com o exato nome da classe.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual modificador de acesso permite que um atributo seja visível apenas dentro da própria classe?',
                  options: ['public', 'private', 'protected', 'default'],
                  correct_answer: 'private',
                  explanation: 'Atributos ou métodos privados ("private") não podem ser acessados diretamente por outras classes externas.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a definição da classe Pessoa:',
                  code_snippet: 'public [blank] Pessoa {\n  private String nome;\n}',
                  options: ['class', 'interface', 'enum', 'object'],
                  correct_answer: 'class',
                  explanation: 'Uma classe em Java é declarada com a palavra-chave "class".'
                }
              ]
            }
          },
          {
            name: 'Fase 5: Encapsulamento e Herança',
            lesson: {
              name: 'Conceitos de Encapsulamento e Herança',
              description: 'Reutilize código com herança e proteja seus dados com encapsulamento.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual palavra-chave do Java é utilizada para declarar que uma classe filha herda de uma classe pai?',
                  options: ['implements', 'extends', 'inherits', 'super'],
                  correct_answer: 'extends',
                  explanation: 'Uma subclasse estende ("extends") a funcionalidade e comportamento de uma superclasse.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a palavra-chave que invoca o construtor da classe pai (superclasse):',
                  code_snippet: 'public Cachorro() {\n  [blank](); // chama Animal\n}',
                  options: ['super', 'this', 'parent', 'base'],
                  correct_answer: 'super',
                  explanation: 'A chamada "super()" aciona o construtor correspondente na superclasse imediata.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a convenção de nomenclatura mais comum em Java para métodos usados para obter e alterar valores de atributos privados?',
                  options: ['getters e setters (ex: getNome e setNome)', 'fetchers e savers', 'readers e writers', 'updaters'],
                  correct_answer: 'getters e setters (ex: getNome e setNome)',
                  explanation: 'Os getters retornam o valor e setters o alteram de forma controlada mantendo o encapsulamento.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a saída do código abaixo se chamarmos emitirSom() em um Cachorro?',
                  code_snippet: 'class Animal { void emitirSom() { System.out.println("Som"); } }\nclass Cachorro extends Animal { @Override void emitirSom() { System.out.println("Au"); } }\nAnimal a = new Cachorro();\na.emitirSom();',
                  options: ['Som', 'Au', 'Erro de compilação', 'Som Au'],
                  correct_answer: 'Au',
                  explanation: 'Como o objeto criado em memória é do tipo Cachorro, o polimorfismo chama o método sobrescrito de Cachorro.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a anotação usada em Java para indicar explicitamente que um método está sobrescrevendo um método da superclasse:',
                  code_snippet: '[blank]\npublic void emitirSom() {\n  System.out.println("Au");\n}',
                  options: ['@Override', '@Overwrite', '@Inherited', '@Super'],
                  correct_answer: '@Override',
                  explanation: 'A anotação @Override avisa ao compilador para validar se o método de fato existe na classe pai.'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'Python',
        slug: 'python',
        description: 'Domine a sintaxe limpa e o alto poder de produtividade da linguagem mais popular para ciência de dados e automação.',
        icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        modules: [
          {
            name: 'Fase 1: Variáveis e Tipos Básicos',
            lesson: {
              name: 'Introdução à Sintaxe Python e Tipos',
              description: 'Escreva comandos em Python e conheça seus tipos de dados altamente dinâmicos.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual a sintaxe correta para criar uma variável numérica e atribuir o valor 5 no Python?',
                  options: ['int x = 5', 'x = 5', 'x := 5', 'const x = 5'],
                  correct_answer: 'x = 5',
                  explanation: 'Python é uma linguagem dinamicamente tipada, então basta declarar o nome da variável e atribuir o valor diretamente.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com a função usada para descobrir o tipo de um dado em Python:',
                  code_snippet: 'x = 10\nprint([blank](x))',
                  options: ['type', 'typeof', 'class', 'kind'],
                  correct_answer: 'type',
                  explanation: 'A função type() retorna a classe do objeto fornecido como argumento.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como criamos uma string contendo quebras de linha em Python sem usar caracteres de escape?',
                  options: [
                    'Utilizando três aspas simples ou duplas (\'\'\' ou """)',
                    'Utilizando colchetes',
                    'Utilizando parênteses',
                    'Utilizando a palavra-chave multiline'
                  ],
                  correct_answer: 'Utilizando três aspas simples ou duplas (\'\'\' ou "")',
                  explanation: 'Strings multilinha (docstrings ou literais normais) são definidas usando aspas triplas.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será o resultado impresso ao rodar o seguinte código Python?',
                  code_snippet: 'a = "Py"\nb = "thon"\nprint(a + b)',
                  options: ['Py thon', 'Python', 'Erro de tipo', 'undefined'],
                  correct_answer: 'Python',
                  explanation: 'O operador + concatena as duas strings sem adicionar espaços adicionais.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a função embutida do Python usada para exibir mensagens no terminal:',
                  code_snippet: '[blank]("Olá do Python")',
                  options: ['print', 'echo', 'console.log', 'printf'],
                  correct_answer: 'print',
                  explanation: 'A função print() é o método embutido padrão para saída padrão.'
                }
              ]
            }
          },
          {
            name: 'Fase 2: Condicionais e Operações',
            lesson: {
              name: 'Estruturas Condicionais no Python',
              description: 'Controle o fluxo com if, elif e else aproveitando a identação do Python.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual palavra-chave o Python usa em substituição ao "else if" de outras linguagens?',
                  options: ['elif', 'elseif', 'else_if', 'switch'],
                  correct_answer: 'elif',
                  explanation: '"elif" é a abreviação padrão de "else if" para evitar múltiplos níveis de indentação desnecessários.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a condicional para verificar se a idade é maior ou igual a 18:',
                  code_snippet: 'idade = 20\nif idade [blank] 18:\n    print("Maior")',
                  options: ['>=', '>', '==', '<='],
                  correct_answer: '>=',
                  explanation: 'Assim como em outras linguagens, >= é usado para verificar se o valor é maior ou igual.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como o Python delimita blocos de código em estruturas de controle (como if, for, funções) em vez de chaves ({})?',
                  options: [
                    'Usando parênteses',
                    'Usando indentação (espaços ou tabs)',
                    'Usando palavras-chave como end',
                    'Usando ponto e vírgula'
                  ],
                  correct_answer: 'Usando indentação (espaços ou tabs)',
                  explanation: 'A indentação é parte da sintaxe e obrigatoriedade do Python para definir escopos de blocos de execução.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a saída do código a seguir?',
                  code_snippet: 'x = 10\nif x > 5 and x < 15:\n    print("Sim")\nelse:\n    print("Não")',
                  options: ['Sim', 'Não', 'Erro de sintaxe', 'None'],
                  correct_answer: 'Sim',
                  explanation: 'Como 10 > 5 e 10 < 15, ambas as condições são verdadeiras, ativando a ramificação do "if".'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete com o operador lógico de negação em Python:',
                  code_snippet: 'ativo = True\nif [blank] ativo:\n    print("Inativo")',
                  options: ['not', '!', 'inverse', 'false'],
                  correct_answer: 'not',
                  explanation: 'O operador "not" é a palavra-chave textual que nega uma expressão booleana no Python.'
                }
              ]
            }
          },
          {
            name: 'Fase 3: Listas e Dicionários',
            lesson: {
              name: 'Listas e Dicionários em Python',
              description: 'Trabalhe com coleções ordenadas e mapeamentos de chave-valor.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual método é utilizado para adicionar um novo elemento no FINAL de uma lista em Python?',
                  options: ['add()', 'append()', 'push()', 'insert()'],
                  correct_answer: 'append()',
                  explanation: 'O método append() insere o objeto fornecido no final da lista atual.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual valor será impresso no console?',
                  code_snippet: 'frutas = ["maçã", "banana", "uva"]\nprint(frutas[1])',
                  options: ['maçã', 'banana', 'uva', 'IndexError'],
                  correct_answer: 'banana',
                  explanation: 'Listas em Python são indexadas a partir de 0. Portanto frutas[1] é "banana".'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Acesse a chave "idade" do dicionário "pessoa" no código Python:',
                  code_snippet: 'pessoa = {"nome": "Lucas", "idade": 30}\nprint(pessoa[[blank]])',
                  options: ["'idade'", 'idade', '0', "['idade']"],
                  correct_answer: "'idade'",
                  explanation: 'Acessamos valores de dicionários usando colchetes contendo a chave literal desejada (neste caso, a string \'idade\').'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como representamos um Dicionário vazio em Python?',
                  options: ['[]', '{}', '()', 'dict() ou {}'],
                  correct_answer: 'dict() ou {}',
                  explanation: 'Dicionários utilizam chaves ({}). Podemos instanciar usando chaves vazias ou o construtor dict().'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual o comprimento da lista após a remoção do elemento no índice 1?',
                  code_snippet: 'valores = [10, 20, 30]\nvalores.pop(1)\nprint(len(valores))',
                  options: ['3', '2', '1', '0'],
                  correct_answer: '2',
                  explanation: 'pop(1) remove o elemento "20" (índice 1). A lista encolhe, ficando com comprimento 2.'
                }
              ]
            }
          },
          {
            name: 'Fase 4: Funções e Def',
            lesson: {
              name: 'Declaração de Funções com def',
              description: 'Crie e organize trechos reutilizáveis de código em Python.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual palavra-chave é usada para definir uma função no Python?',
                  options: ['function', 'def', 'func', 'define'],
                  correct_answer: 'def',
                  explanation: 'A palavra-chave "def" inicia a definição de um bloco de função.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a definição de uma função que retorna a soma de dois parâmetros:',
                  code_snippet: '[blank] somar(a, b):\n    return a + b',
                  options: ['def', 'function', 'create', 'fn'],
                  correct_answer: 'def',
                  explanation: '"def" define o cabeçalho da função.'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como definimos um valor padrão para um argumento em uma função Python?',
                  options: [
                    "def saudacao(nome = 'Visitante'):",
                    "def saudacao(nome : 'Visitante'):",
                    "def saudacao(nome || 'Visitante'):",
                    "def saudacao(nome ? 'Visitante'):"
                  ],
                  correct_answer: "def saudacao(nome = 'Visitante'):",
                  explanation: 'O operador = no parâmetro atribui um valor padrão caso nenhum seja fornecido na chamada.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual o valor impresso no console ao executar o código abaixo?',
                  code_snippet: 'def quadrado(x):\n    return x * x\nprint(quadrado(4))',
                  options: ['8', '16', 'quadrado(4)', 'None'],
                  correct_answer: '16',
                  explanation: 'quadrado(4) calcula 4 * 4 que resulta no valor retornado 16.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a linha para retornar o valor resultante do cálculo da função:',
                  code_snippet: 'def calcular(x):\n    [blank] x * 2',
                  options: ['return', 'give', 'output', 'send'],
                  correct_answer: 'return',
                  explanation: '"return" devolve o resultado de volta para o chamador da função.'
                }
              ]
            }
          },
          {
            name: 'Fase 5: Orientação a Objetos',
            lesson: {
              name: 'Orientação a Objetos no Python',
              description: 'Aprenda a estruturar classes e métodos com self.',
              xp_reward: 20,
              exercises: [
                {
                  type: 'multiple_choice',
                  question_text: 'Qual o nome do método construtor padrão em uma classe Python?',
                  options: ['__init__', 'constructor', 'new', '__new__'],
                  correct_answer: '__init__',
                  explanation: 'O método mágico __init__ inicializa a nova instância recém-criada.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete o primeiro parâmetro convencional de um método, que referencia o próprio objeto:',
                  code_snippet: 'class Gato:\n    def miar([blank]):\n        print("Miau")',
                  options: ['self', 'this', 'gato', 'me'],
                  correct_answer: 'self',
                  explanation: 'Por convenção, o primeiro argumento de qualquer método de instância deve ser o "self".'
                },
                {
                  type: 'multiple_choice',
                  question_text: 'Como herdamos uma classe "Animal" em uma nova classe "Cachorro" no Python?',
                  options: ['class Cachorro(Animal):', 'class Cachorro extends Animal:', 'class Cachorro implements Animal:', 'class Cachorro : Animal'],
                  correct_answer: 'class Cachorro(Animal):',
                  explanation: 'Em Python, a herança é indicada passando a classe pai entre parênteses logo após a declaração do nome da subclasse.'
                },
                {
                  type: 'code_output',
                  question_text: 'Qual será a saída do código Python a seguir?',
                  code_snippet: 'class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\np = Pessoa("Maria")\nprint(p.nome)',
                  options: ['Maria', 'Pessoa', 'self.nome', 'Erro de tipo'],
                  correct_answer: 'Maria',
                  explanation: 'O construtor guarda "Maria" em self.nome, que é acessado depois em p.nome.'
                },
                {
                  type: 'fill_in_the_blank',
                  question_text: 'Complete a inicialização do atributo "idade" com o valor recebido no construtor:',
                  code_snippet: 'class Usuario:\n    def __init__(self, idade):\n        [blank].idade = idade',
                  options: ['self', 'this', 'user', 'me'],
                  correct_answer: 'self',
                  explanation: 'Atributos do objeto são criados ligando-os ao parâmetro "self".'
                }
              ]
            }
          }
        ]
      }
    ]

    console.log('Seeding languages, modules, lessons, and exercises...')
    for (const langData of seedData) {
      console.log(`Seeding language: ${langData.name}...`)
      
      const langResult = await client.query(`
        INSERT INTO languages (name, slug, description, icon_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [langData.name, langData.slug, langData.description, langData.icon_url])
      
      const languageId = langResult.rows[0].id

      for (let mIdx = 0; mIdx < langData.modules.length; mIdx++) {
        const modData = langData.modules[mIdx]
        const orderIndexModule = mIdx + 1
        console.log(`  Seeding module: ${modData.name}...`)

        const modResult = await client.query(`
          INSERT INTO modules (language_id, name, order_index)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [languageId, modData.name, orderIndexModule])
        
        const moduleId = modResult.rows[0].id

        // Seed single lesson per module
        const lessonData = modData.lesson
        console.log(`    Seeding lesson: ${lessonData.name}...`)
        const lessonResult = await client.query(`
          INSERT INTO lessons (module_id, name, description, xp_reward, order_index)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [moduleId, lessonData.name, lessonData.description, lessonData.xp_reward, 1])
        
        const lessonId = lessonResult.rows[0].id

        // Seed 5 exercises per lesson
        for (let exIdx = 0; exIdx < lessonData.exercises.length; exIdx++) {
          const exData = lessonData.exercises[exIdx]
          const orderIndexExercise = exIdx + 1
          
          await client.query(`
            INSERT INTO exercises (lesson_id, type, question_text, code_snippet, options, correct_answer, explanation, order_index)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
          `, [
            lessonId,
            exData.type,
            exData.question_text,
            exData.code_snippet || null,
            JSON.stringify(exData.options),
            exData.correct_answer,
            exData.explanation,
            orderIndexExercise
          ])
        }
      }
    }

    await client.query('COMMIT')
    console.log('Database seeded successfully with 5 languages, 5 phases per language, and 5 exercises per phase!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to seed database:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
