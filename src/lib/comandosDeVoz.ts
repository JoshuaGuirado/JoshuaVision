import { MODULES } from './nav'

/**
 * COMANDOS DE VOZ.
 *
 * Traduz a frase falada em uma ação. Navegar é resolvido aqui mesmo, na hora,
 * porque é o comando mais usado e não vale gastar uma ida ao servidor para
 * "abre finanças". O resto vira pergunta para o assistente, que já sabe criar
 * tarefa, lançar despesa e marcar compromisso.
 */

export const PALAVRA_CHAVE = ['friday', 'fraidei', 'fraide', 'sexta-feira', 'freidei']

/** Tira acentos e pontuação para o reconhecimento não errar por detalhe. */
function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Se a frase começa chamando a F.R.I.D.A.Y., devolve o resto sem o nome.
 * Devolve `null` quando ela não foi chamada.
 */
export function extrairChamado(frase: string): string | null {
  const limpa = normalizar(frase)
  for (const nome of PALAVRA_CHAVE) {
    if (limpa === nome) return ''
    if (limpa.startsWith(nome + ' ')) {
      // O trim vem antes: sem ele sobra um espaço à frente e a cortesia
      // ("por favor") não é removida.
      return limpa
        .slice(nome.length)
        .trim()
        .replace(/^(por favor|pf)\s+/, '')
        .trim()
    }
  }
  return null
}

/** Apelidos falados que não batem com o nome exato do módulo. */
const APELIDOS: Record<string, string> = {
  financas: '/financas',
  financeiro: '/financas',
  dinheiro: '/financas',
  grana: '/financas',
  gastos: '/financas',
  tarefa: '/tarefas',
  tarefas: '/tarefas',
  afazeres: '/tarefas',
  agenda: '/agenda',
  compromissos: '/agenda',
  calendario: '/agenda',
  meta: '/metas',
  metas: '/metas',
  objetivos: '/metas',
  habito: '/habitos',
  habitos: '/habitos',
  rotina: '/habitos',
  projeto: '/projetos',
  projetos: '/projetos',
  estudo: '/estudos',
  estudos: '/estudos',
  materias: '/estudos',
  saude: '/saude',
  nota: '/notas',
  notas: '/notas',
  anotacoes: '/notas',
  hoje: '/hoje',
  resumo: '/hoje',
  inicio: '/',
  home: '/',
  principal: '/',
  configuracoes: '/configuracoes',
  ajustes: '/configuracoes',
  assistente: '/assistente',
}

const VERBOS_NAVEGAR = /^(abre|abrir|abra|vai para|vai pra|va para|ir para|me leva para|me leva pra|mostra|mostrar|abre o|abre a|vamos para)\s+/

export type Comando =
  | { tipo: 'navegar'; rota: string; rotulo: string }
  | { tipo: 'silenciar' }
  | { tipo: 'falar' }
  | { tipo: 'parar-escuta' }
  | { tipo: 'perguntar'; texto: string }

/**
 * Decide o que fazer com o pedido. Nunca devolve nulo: o que não for
 * reconhecido vira pergunta para o assistente, que responde melhor do que um
 * "não entendi".
 */
export function interpretar(pedido: string): Comando {
  const texto = normalizar(pedido)
  if (!texto) return { tipo: 'perguntar', texto: 'oi' }

  // Controles da própria voz
  if (/^(cala a boca|silencio|fica quieta|para de falar|muda|mute|silenciar)$/.test(texto)) {
    return { tipo: 'silenciar' }
  }
  if (/^(pode falar|volta a falar|desmuta|fala comigo|som ligado)$/.test(texto)) {
    return { tipo: 'falar' }
  }
  if (/^(para de ouvir|para de escutar|desliga o microfone|pode parar)$/.test(texto)) {
    return { tipo: 'parar-escuta' }
  }

  // Navegação: "abre finanças", "vai para tarefas"
  const semVerbo = texto.replace(VERBOS_NAVEGAR, '')
  if (semVerbo !== texto || APELIDOS[texto]) {
    const alvo = (semVerbo || texto).replace(/^(o|a|os|as|meu|minha|meus|minhas)\s+/, '').trim()
    const rota = APELIDOS[alvo]
    if (rota) {
      const modulo = MODULES.find((m) => m.path === rota)
      return { tipo: 'navegar', rota, rotulo: modulo?.label ?? 'Início' }
    }
  }

  return { tipo: 'perguntar', texto: pedido }
}
