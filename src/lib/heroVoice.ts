import { useLocation } from 'react-router-dom'
import type { BangKind } from './fx'

/**
 * A VOZ DOS HERÓIS
 *
 * Cada módulo tem um herói que "recebe" o Joshua na tela: uma arte do
 * personagem e falas escritas do jeito que ele falaria. É o que dá a graça do
 * site — não é só decoração, é o herói conversando.
 *
 * `portraits` aponta para arquivos em `public/herois/`. Se um arquivo sumir, o
 * componente cai no emblema desenhado sem quebrar a tela.
 *
 * Para trocar/adicionar arte: salve o .jpg em `public/herois/` e acrescente o
 * caminho na lista do herói. O site sorteia uma das artes a cada visita.
 */
export type HeroVoice = {
  /** Como o herói se apresenta ao falar. */
  name: string
  /** Artes disponíveis; uma é sorteada por visita. */
  portraits: string[]
  /** Primeira fala, de boas-vindas ao módulo. */
  greeting: string
  /** Falas seguintes — o Joshua clica no balão para ouvir outra. */
  lines: string[]
  /** Texto da tela vazia, na voz do herói. */
  empty: string
  /** Rótulo do botão de criar, na voz do herói. */
  action: string
  /** Onomatopeia que estoura na tela quando o Joshua cria algo aqui. */
  bang: string
  /** Som que acompanha o estouro. */
  bangKind: BangKind
  /**
   * Como este herói soa quando fala em voz alta.
   *
   * O aparelho costuma ter só duas vozes em português, então o que separa um
   * herói do outro é o tom (`pitch`) e a velocidade (`rate`): o Thor sai
   * grave e pausado, o Aranha agudo e acelerado.
   */
  voz: { genero: 'm' | 'f'; pitch: number; rate: number }
}

export const HERO_VOICES: Record<string, HeroVoice> = {
  '/hoje': {
    name: 'Vingadores',
    portraits: [
      '/herois/avengerjuntos-1.jpg',
      '/herois/avengerjuntos-2.jpg',
      '/herois/avengerjuntos-3.jpg',
    ],
    empty: 'Nada pendente. Dia limpo — aproveite antes que apareça missão.',
    action: 'Reunir',
    bang: 'AVANTE!',
    bangKind: 'impact',
    voz: { genero: 'm', pitch: 0.9, rate: 1 },
    greeting: 'Vingadores reunidos, Joshua. Este é o painel do seu dia — a gente cobre o resto.',
    lines: [
      'Um dia de cada vez. Hoje a missão é só esta aqui.',
      'Ninguém salva o mundo sozinho. Por isso somos todos nós neste módulo.',
      'Se a lista estiver grande, começa pela primeira. O resto a gente resolve.',
      'Vingadores... avante. Bom dia, Joshua.',
    ],
  },
  '/agenda': {
    name: 'Doutor Estranho',
    portraits: [
      '/herois/doutorestranho-1.jpg',
      '/herois/doutorestranho-2.jpg',
      '/herois/doutorestranho-3.jpg',
    ],
    empty: 'A linha do tempo está vazia. Marque o primeiro compromisso.',
    action: 'Abrir portal',
    bang: 'VOOSH!',
    bangKind: 'tech',
    voz: { genero: 'm', pitch: 0.85, rate: 0.92 },
    greeting: 'Olá, Joshua. Doutor Estranho. Eu cuido do tempo — e o seu está todo aqui.',
    lines: [
      'Vi catorze milhões de agendas possíveis. Nesta você chega no horário.',
      'O tempo é o único recurso que nem eu consigo devolver. Marque com cuidado.',
      'Abra o portal: cada compromisso no seu lugar exato.',
      'Nada de improviso hoje. O futuro agradece.',
    ],
  },
  '/financas': {
    name: 'Capitão América',
    // capitao-1.jpg saiu da lista: o Joshua não gostou dessa arte.
    portraits: [
      '/herois/capitao-2.jpg',
      '/herois/capitao-3.jpg',
      '/herois/capitao-4.jpg',
      '/herois/capitao-5.jpg',
    ],
    empty: 'Nenhum lançamento ainda. Anote o primeiro e assuma o comando.',
    action: 'Registrar',
    bang: 'CLANG!',
    bangKind: 'shield',
    voz: { genero: 'm', pitch: 0.82, rate: 0.95 },
    greeting: 'Olá, Joshua. Capitão América falando. Vamos controlar suas finanças.',
    lines: [
      'Disciplina não é castigo, é escudo. Todo mês ele te protege um pouco mais.',
      'Eu posso fazer isso o dia todo — e você também: um lançamento de cada vez.',
      'Orçamento é plano de batalha. Sem plano, a gente só reage.',
      'Gasto anotado é gasto sob controle. Vamos manter a linha.',
    ],
  },
  '/tarefas': {
    name: 'Homem de Ferro',
    portraits: [
      '/herois/homemdeferro-1.jpg',
      '/herois/homemdeferro-2.jpg',
      '/herois/homemdeferro-3.jpg',
    ],
    empty: 'Lista zerada. Até eu preciso de um plano — adicione a primeira.',
    action: 'Executar',
    bang: 'BLAM!',
    bangKind: 'tech',
    voz: { genero: 'm', pitch: 1.08, rate: 1.18 },
    greeting: 'E aí, Joshua. Tony Stark. Sua lista de tarefas — vamos executar isso com estilo.',
    lines: [
      'Gênio, bilionário, playboy, filantropo. E organizado. Principalmente organizado.',
      'Não é sobre fazer tudo. É sobre fazer o que importa primeiro.',
      'Marca uma como feita. Vai por mim, é a melhor parte do dia.',
      'Se está na lista, tem solução. Se não tem solução, tira da lista.',
    ],
  },
  '/metas': {
    name: 'Homem-Aranha',
    portraits: [
      '/herois/homemaranha-1.jpg',
      '/herois/homemaranha-2.jpg',
      '/herois/homemaranha-3.jpg',
    ],
    empty: 'Nenhuma meta ainda. Escolha um prédio e mire no topo.',
    action: 'Lançar teia',
    bang: 'THWIP!',
    bangKind: 'web',
    voz: { genero: 'm', pitch: 1.35, rate: 1.2 },
    greeting: 'Oi, Joshua! Peter Parker aqui. Bora mirar longe? Estas são as suas metas.',
    lines: [
      'Com grandes metas vêm grandes responsabilidades. Mas a gente dá conta.',
      'Cada teia precisa de um ponto de apoio. Divide a meta em pedaços.',
      'Já caí muito mais vezes do que acertei. O truque é levantar rápido.',
      'Olha o progresso aí! Está subindo.',
    ],
  },
  '/habitos': {
    name: 'Thor',
    portraits: ['/herois/thor-1.jpg', '/herois/thor-2.jpg', '/herois/thor-3.jpg'],
    empty: 'Nenhum hábito forjado ainda. Erga o primeiro.',
    action: 'Forjar',
    bang: 'KRAKOOM!',
    bangKind: 'thunder',
    voz: { genero: 'm', pitch: 0.68, rate: 0.88 },
    greeting: 'Saudações, Joshua! Thor, filho de Odin. Aqui forjamos os seus hábitos.',
    lines: [
      'O martelo só obedece a quem é digno. A constância é o que te torna digno.',
      'Um dia perdido não quebra a corrente. Dois começam a quebrar.',
      'Repetição é trovão: parece pequeno de longe, mas move montanhas.',
      'Erga o martelo hoje, mesmo que só por cinco minutos.',
    ],
  },
  '/projetos': {
    name: 'Pantera Negra',
    portraits: [
      '/herois/panteranegra-1.jpg',
      '/herois/panteranegra-2.jpg',
      '/herois/panteranegra-3.jpg',
    ],
    empty: 'Wakanda não nasceu pronta. Comece o primeiro projeto.',
    action: 'Fundar',
    bang: 'SHRAK!',
    bangKind: 'impact',
    voz: { genero: 'm', pitch: 0.78, rate: 0.9 },
    greeting:
      'Bem-vindo, Joshua. Aqui é o Pantera Negra. Todo grande projeto se constrói como Wakanda: com paciência.',
    lines: [
      'Wakanda para sempre — e o seu projeto também, se você cuidar dele.',
      'Um rei não faz tudo sozinho. Delegue o que puder.',
      'A tecnologia mais avançada nasceu de gente que insistiu por gerações.',
      'Avance em silêncio. Deixe o resultado fazer o barulho.',
    ],
  },
  '/estudos': {
    name: 'Bruce Banner',
    portraits: ['/herois/hulk-1.jpg', '/herois/hulk-2.jpg', '/herois/hulk-3.jpg'],
    empty: 'Nenhuma matéria ainda. Conhecimento se acumula — comece por uma.',
    action: 'Estudar',
    bang: 'SMASH!',
    bangKind: 'impact',
    voz: { genero: 'm', pitch: 0.95, rate: 0.86 },
    greeting: 'Oi, Joshua. Bruce Banner. Conhecimento é a força que eu escolhi controlar.',
    lines: [
      'Meu segredo? Eu estudo sempre. É assim que eu não perco o controle.',
      'Sete doutorados não vieram de talento. Vieram de horas sentado.',
      'Se travou, respira. Cérebro cansado não aprende.',
      'Estudo é força bruta aplicada com paciência.',
    ],
  },
  '/saude': {
    name: 'Guardiões da Galáxia',
    portraits: [
      '/herois/guardioesdagalaxia-1.jpg',
      '/herois/guardioesdagalaxia-2.jpg',
      '/herois/guardioesdagalaxia-3.jpg',
    ],
    empty: 'Nada registrado hoje. Corpo em dia, missão em dia.',
    action: 'Registrar',
    bang: 'WHOOSH!',
    bangKind: 'tech',
    voz: { genero: 'm', pitch: 1.18, rate: 1.16 },
    greeting: 'Fala, Joshua! Guardiões na área. Corpo em dia, missão em dia — é essa a regra.',
    lines: [
      'Eu sou Groot. (Ele disse: bebe água.)',
      'A gente é um bando de desajustados, mas se cuida. Faça o mesmo.',
      'Coloca uma música boa e se mexe. Funciona sempre.',
      'Dormir também é treino, não esqueça disso.',
    ],
  },
  '/notas': {
    name: 'Visão',
    portraits: ['/herois/visao-1.jpg', '/herois/visao-2.jpg', '/herois/visao-3.jpg'],
    empty: 'Nenhuma nota ainda. Escreva — eu guardo para sempre.',
    action: 'Guardar',
    bang: 'ZAP!',
    bangKind: 'tech',
    voz: { genero: 'f', pitch: 0.9, rate: 0.84 },
    greeting: 'Olá, Joshua. Sou a Visão. Aquilo que você anota aqui, eu guardo por você.',
    lines: [
      'A memória humana é frágil e bela. A minha é apenas confiável.',
      'Uma ideia não anotada é uma ideia perdida.',
      'Guardo tudo sem julgamento. Escreva à vontade.',
      'O que é feito de dados pode ser recuperado. Anote.',
    ],
  },
  '/assistente': {
    name: 'F.R.I.D.A.Y.',
    portraits: ['/herois/friday-1.jpg'],
    empty: 'Sem conversas ainda. Chame um herói do esquadrão.',
    action: 'Chamar',
    bang: 'BIP!',
    bangKind: 'tech',
    voz: { genero: 'f', pitch: 1.12, rate: 1.06 },
    greeting: 'Olá, chefe. F.R.I.D.A.Y. online. Seu esquadrão de IA está pronto.',
    lines: [
      'Escolha um herói do esquadrão e me diga o que precisa.',
      'Sistemas em plena capacidade. Pode perguntar.',
      'Estou monitorando tudo, como sempre.',
      'Se precisar do mais forte da equipe, chame o Capitão.',
    ],
  },
  '/configuracoes': {
    name: 'Quarteto Fantástico',
    portraits: ['/herois/quarteto-1.jpg', '/herois/quarteto-2.jpg', '/herois/quarteto-3.jpg'],
    empty: 'Nada para ajustar por aqui ainda.',
    action: 'Ajustar',
    bang: 'CHAMAS!',
    bangKind: 'impact',
    voz: { genero: 'f', pitch: 1, rate: 1.08 },
    greeting: 'Olá, Joshua. Quarteto Fantástico. É aqui que a gente ajusta a máquina toda.',
    lines: [
      'Tudo pode ser melhorado. Inclusive as configurações.',
      'Mexeu, quebrou, conserta. É assim que a ciência funciona.',
      'Flexibilidade é a nossa especialidade. Deixe o sistema com a sua cara.',
      'Cuidado com os botões — a gente já explodiu um foguete assim.',
    ],
  },
}

export function heroVoiceFor(path: string): HeroVoice | undefined {
  return HERO_VOICES[path]
}

/**
 * Voz do herói da tela em que o Joshua está agora.
 *
 * Serve para as primitivas de `ui.tsx` falarem como o herói sem cada página
 * precisar repassar isso. Fora dos módulos (Home, login) devolve `undefined`
 * e os componentes usam o texto neutro.
 */
export function useHeroVoice(): HeroVoice | undefined {
  const { pathname } = useLocation()
  const key = Object.keys(HERO_VOICES).find(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
  return key ? HERO_VOICES[key] : undefined
}
