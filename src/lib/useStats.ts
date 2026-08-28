import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * OS NÚMEROS DA VIDA DO JOSHUA, EM UMA CONSULTA SÓ.
 *
 * Serve para duas coisas:
 *  - os quadradinhos da Home deixarem de ser mudos ("Tarefas — 3 pendentes");
 *  - os heróis falarem sobre o que ele realmente fez, e não frase fixa.
 *
 * Cada número é um `count` (o Postgres conta sem trazer as linhas), então
 * mesmo com o banco cheio isso continua leve.
 */
export type Stats = {
  tarefasPendentes: number
  compromissosHoje: number
  habitosFeitosHoje: number
  habitosTotal: number
  metasMedia: number
  projetosAtivos: number
  materias: number
  notas: number
  saldoDoMes: number
  saudeRegistradaHoje: boolean
}

const VAZIO: Stats = {
  tarefasPendentes: 0,
  compromissosHoje: 0,
  habitosFeitosHoje: 0,
  habitosTotal: 0,
  metasMedia: 0,
  projetosAtivos: 0,
  materias: 0,
  notas: 0,
  saldoDoMes: 0,
  saudeRegistradaHoje: false,
}

/** Data de hoje no formato do banco (AAAA-MM-DD), no fuso local. */
export function hojeISO(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(VAZIO)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const hoje = hojeISO()
    const primeiroDoMes = hoje.slice(0, 8) + '01'

    /** Conta linhas sem trazê-las; `coluna`/`valor` filtram quando passados. */
    async function contar(tabela: string, coluna?: string, valor?: unknown): Promise<number> {
      const consulta = supabase.from(tabela).select('*', { count: 'exact', head: true })
      const { count } = await (coluna ? consulta.eq(coluna, valor) : consulta)
      return count ?? 0
    }

    const [
      tarefas,
      eventos,
      habitos,
      logs,
      metas,
      projetos,
      materias,
      notas,
      lancamentos,
      saude,
    ] = await Promise.all([
      contar('tasks', 'done', false),
      contar('events', 'date', hoje),
      contar('habits'),
      contar('habit_logs', 'date', hoje),
      supabase.from('goals').select('progress'),
      contar('projects', 'status', 'ativo'),
      contar('studies'),
      contar('notes'),
      supabase.from('transactions').select('type, amount').gte('date', primeiroDoMes),
      contar('health_logs', 'date', hoje),
    ])

    const progressos = (metas.data ?? []).map((g: { progress: number }) => g.progress)
    const saldo = (lancamentos.data ?? []).reduce(
      (soma: number, t: { type: string; amount: number }) =>
        soma + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
      0,
    )

    setStats({
      tarefasPendentes: tarefas,
      compromissosHoje: eventos,
      habitosFeitosHoje: logs,
      habitosTotal: habitos,
      metasMedia: progressos.length
        ? Math.round(progressos.reduce((a, b) => a + b, 0) / progressos.length)
        : 0,
      projetosAtivos: projetos,
      materias: materias,
      notas: notas,
      saldoDoMes: saldo,
      saudeRegistradaHoje: saude > 0,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    // Um erro aqui não pode derrubar a tela: números são enfeite informativo,
    // não o conteúdo principal.
    load().catch(() => setLoading(false))
  }, [load])

  return { stats, loading, reload: load }
}

const dinheiro = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

/** Linha curta que cada quadradinho da Home mostra, com o número real. */
export function resumoDoModulo(path: string, s: Stats): string | undefined {
  switch (path) {
    case '/hoje':
      return s.tarefasPendentes + s.compromissosHoje === 0
        ? 'dia livre'
        : `${s.tarefasPendentes + s.compromissosHoje} para hoje`
    case '/agenda':
      return s.compromissosHoje === 0
        ? 'nada hoje'
        : `${s.compromissosHoje} hoje`
    case '/financas':
      return `${dinheiro(s.saldoDoMes)} no mês`
    case '/tarefas':
      return s.tarefasPendentes === 0
        ? 'tudo em dia'
        : `${s.tarefasPendentes} pendente${s.tarefasPendentes === 1 ? '' : 's'}`
    case '/metas':
      return s.metasMedia > 0 ? `${s.metasMedia}% de progresso` : undefined
    case '/habitos':
      return s.habitosTotal === 0
        ? undefined
        : `${s.habitosFeitosHoje}/${s.habitosTotal} hoje`
    case '/projetos':
      return s.projetosAtivos > 0 ? `${s.projetosAtivos} ativo${s.projetosAtivos === 1 ? '' : 's'}` : undefined
    case '/estudos':
      return s.materias > 0 ? `${s.materias} matéria${s.materias === 1 ? '' : 's'}` : undefined
    case '/saude':
      return s.saudeRegistradaHoje ? 'registrado hoje' : 'sem registro hoje'
    case '/notas':
      return s.notas > 0 ? `${s.notas} nota${s.notas === 1 ? '' : 's'}` : undefined
    default:
      return undefined
  }
}

/**
 * A fala do herói olhando os dados de verdade.
 *
 * Devolve `undefined` quando não há nada de interessante para comentar — aí o
 * herói usa a saudação normal dele.
 */
export function falaSobreOsDados(path: string, s: Stats): string | undefined {
  switch (path) {
    case '/hoje':
      if (s.tarefasPendentes === 0 && s.compromissosHoje === 0)
        return 'Nenhuma ameaça no radar hoje, Joshua. Dia livre — aproveite.'
      return `Situação de hoje: ${s.tarefasPendentes} tarefa${s.tarefasPendentes === 1 ? '' : 's'} e ${s.compromissosHoje} compromisso${s.compromissosHoje === 1 ? '' : 's'}. Vamos nessa.`
    case '/agenda':
      if (s.compromissosHoje === 0) return 'Vi o seu dia: nenhum compromisso marcado. O tempo é todo seu.'
      return `${s.compromissosHoje} compromisso${s.compromissosHoje === 1 ? '' : 's'} atravessando o seu dia. Nada de atraso.`
    case '/financas':
      if (s.saldoDoMes < 0)
        return `Saímos da formação, Joshua: ${dinheiro(s.saldoDoMes)} no mês. Vamos reagrupar.`
      if (s.saldoDoMes > 0)
        return `${dinheiro(s.saldoDoMes)} de saldo no mês. A linha está firme — mantenha assim.`
      return undefined
    case '/tarefas':
      if (s.tarefasPendentes === 0) return 'Lista limpa. Nem eu sou tão eficiente, Joshua.'
      if (s.tarefasPendentes > 8)
        return `${s.tarefasPendentes} tarefas na fila. Respira: uma de cada vez, começando pela mais chata.`
      return `${s.tarefasPendentes} tarefa${s.tarefasPendentes === 1 ? '' : 's'} na fila. Vamos executar.`
    case '/metas':
      if (s.metasMedia >= 80) return `${s.metasMedia}% de progresso! Você está quase no topo do prédio.`
      if (s.metasMedia > 0) return `Suas metas estão em ${s.metasMedia}%. Continua balançando, eu seguro.`
      return undefined
    case '/habitos':
      if (s.habitosTotal === 0) return undefined
      if (s.habitosFeitosHoje === s.habitosTotal)
        return 'Todos os hábitos do dia, cumpridos. Hoje você seria digno do martelo.'
      return `${s.habitosFeitosHoje} de ${s.habitosTotal} hábitos hoje. Ainda dá tempo de erguer o resto.`
    case '/projetos':
      if (s.projetosAtivos === 0) return undefined
      return `${s.projetosAtivos} projeto${s.projetosAtivos === 1 ? '' : 's'} em andamento. Wakanda se constrói assim: sem pressa, sem parar.`
    case '/saude':
      return s.saudeRegistradaHoje
        ? 'Já registrou o dia. Corpo em dia, missão em dia.'
        : 'Nada registrado hoje ainda. Começa pela água, é a mais fácil.'
    case '/notas':
      if (s.notas === 0) return undefined
      return `${s.notas} nota${s.notas === 1 ? '' : 's'} guardadas. Nenhuma delas se perdeu.`
    default:
      return undefined
  }
}
