import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchAccounts,
  fetchCategories,
  fetchFinancialGoals,
  fetchInvestmentEntries,
  fetchInvestments,
  fetchTransactions,
} from './data'
import type {
  Account,
  Category,
  FinancialGoal,
  Investment,
  InvestmentEntry,
  Transaction,
} from './types'
import { useFx } from './fx'

/**
 * O CÉREBRO DAS FINANÇAS.
 *
 * Todas as telas do módulo (resumo, lançamentos, contas, investimentos, metas)
 * leem daqui em vez de cada uma buscar os próprios dados. Isso resolve três
 * coisas de uma vez:
 *
 *  - o mês escolhido vale para o módulo inteiro — trocar de mês no resumo já
 *    troca nos lançamentos;
 *  - os números batem entre as telas, porque a conta é feita num lugar só;
 *  - salvar em qualquer tela recarrega tudo (`recarregar`).
 *
 * As tabelas novas (contas, investimentos, metas) podem ainda não existir no
 * Supabase. Nesse caso elas vêm vazias e o módulo continua funcionando com o
 * que já existia — quem avisa o Joshua é a própria tela.
 */

export type MesSelecionado = { ano: number; mes: number } // mes: 0-11

type FinancasValue = {
  mes: MesSelecionado
  irParaMes: (m: MesSelecionado) => void
  mesAnterior: () => void
  proximoMes: () => void
  /** Rótulo pronto: "agosto de 2026". */
  rotuloDoMes: string
  /** `true` quando o mês escolhido é o mês corrente. */
  eMesAtual: boolean

  transacoes: Transaction[]
  categorias: Category[]
  contas: Account[]
  investimentos: Investment[]
  aportes: InvestmentEntry[]
  metas: FinancialGoal[]

  /** Lançamentos apenas do mês escolhido, do mais recente para o mais antigo. */
  doMes: Transaction[]

  carregando: boolean
  /** Erro das tabelas antigas (categorias/lançamentos) — esse é grave. */
  erro: string | null
  /** As tabelas novas ainda não foram criadas no Supabase. */
  faltaSchemaNovo: boolean
  recarregar: () => Promise<void>
}

const FinancasContext = createContext<FinancasValue | undefined>(undefined)

/** "2026-08-15" -> pertence ao mês {ano:2026, mes:7}? */
function ehDoMes(dataISO: string, { ano, mes }: MesSelecionado) {
  return Number(dataISO.slice(0, 4)) === ano && Number(dataISO.slice(5, 7)) - 1 === mes
}

export function FinancasProvider({ children }: { children: ReactNode }) {
  const hoje = new Date()
  const [mes, setMes] = useState<MesSelecionado>({ ano: hoje.getFullYear(), mes: hoje.getMonth() })

  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [contas, setContas] = useState<Account[]>([])
  const [investimentos, setInvestimentos] = useState<Investment[]>([])
  const [aportes, setAportes] = useState<InvestmentEntry[]>([])
  const [metas, setMetas] = useState<FinancialGoal[]>([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [faltaSchemaNovo, setFaltaSchemaNovo] = useState(false)

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    // As tabelas antigas são obrigatórias: sem elas o módulo não funciona.
    try {
      const [tx, cats] = await Promise.all([fetchTransactions(), fetchCategories()])
      setTransacoes(tx)
      setCategorias(cats)
    } catch {
      setErro('Não consegui carregar. As tabelas do Supabase já foram criadas?')
    }

    // As novas são opcionais: se ainda não existem, o resto continua de pé.
    try {
      const [ct, inv, ap, mt] = await Promise.all([
        fetchAccounts(),
        fetchInvestments(),
        fetchInvestmentEntries(),
        fetchFinancialGoals(),
      ])
      setContas(ct)
      setInvestimentos(inv)
      setAportes(ap)
      setMetas(mt)
      setFaltaSchemaNovo(false)
    } catch {
      setFaltaSchemaNovo(true)
    }

    setCarregando(false)
  }, [])

  // `versaoDados` muda quando algo grava por fora desta tela — o assistente
  // criando um lançamento por voz, por exemplo. Sem isso o dinheiro entrava no
  // banco mas a lista continuava dizendo que o mês estava vazio.
  const { versaoDados } = useFx()

  useEffect(() => {
    recarregar()
  }, [recarregar, versaoDados])

  const doMes = useMemo(
    () => transacoes.filter((t) => ehDoMes(t.date, mes)),
    [transacoes, mes],
  )

  const rotuloDoMes = useMemo(
    () =>
      new Date(mes.ano, mes.mes, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
    [mes],
  )

  const valor: FinancasValue = {
    mes,
    irParaMes: setMes,
    mesAnterior: () =>
      setMes(({ ano, mes: m }) => (m === 0 ? { ano: ano - 1, mes: 11 } : { ano, mes: m - 1 })),
    proximoMes: () =>
      setMes(({ ano, mes: m }) => (m === 11 ? { ano: ano + 1, mes: 0 } : { ano, mes: m + 1 })),
    rotuloDoMes,
    eMesAtual: mes.ano === hoje.getFullYear() && mes.mes === hoje.getMonth(),
    transacoes,
    categorias,
    contas,
    investimentos,
    aportes,
    metas,
    doMes,
    carregando,
    erro,
    faltaSchemaNovo,
    recarregar,
  }

  return <FinancasContext.Provider value={valor}>{children}</FinancasContext.Provider>
}

export function useFinancas(): FinancasValue {
  const ctx = useContext(FinancasContext)
  if (!ctx) throw new Error('useFinancas precisa estar dentro de <FinancasProvider>')
  return ctx
}

// ---------------------------------------------------------------------------
// CONTAS DO RESUMO
// ---------------------------------------------------------------------------

/**
 * Os quatro números do topo.
 *
 * `saldoDisponivel` é o dinheiro que existe de verdade: o que havia nas contas
 * mais tudo que entrou menos tudo que saiu, até o fim do mês escolhido. Não é
 * "entradas menos saídas do mês" — esse número sozinho engana, porque ignora o
 * que sobrou dos meses anteriores.
 */
export function resumoDoMes(f: FinancasValue) {
  const entradas = f.doMes.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const saidas = f.doMes.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Limite do mês escolhido: dia 0 do mês seguinte é o último dia deste.
  const fimDoMes = new Date(f.mes.ano, f.mes.mes + 1, 0)
  const limite = `${fimDoMes.getFullYear()}-${String(fimDoMes.getMonth() + 1).padStart(2, '0')}-${String(fimDoMes.getDate()).padStart(2, '0')}`

  const ateAqui = f.transacoes.filter((t) => t.date <= limite)
  const saldoDisponivel =
    f.contas.reduce((s, c) => s + Number(c.initial_balance), 0) +
    ateAqui.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)

  const investido = f.aportes
    .filter((a) => a.date <= limite)
    .reduce((s, a) => s + Number(a.amount), 0)

  const valorInvestimentos = f.investimentos.reduce((s, i) => s + Number(i.current_value), 0)

  return { entradas, saidas, saldoDoMes: entradas - saidas, saldoDisponivel, investido, valorInvestimentos }
}

/** Entradas e saídas dos últimos `quantos` meses, terminando no mês escolhido. */
export function historicoMensal(f: FinancasValue, quantos = 6) {
  return Array.from({ length: quantos }, (_, i) => {
    const d = new Date(f.mes.ano, f.mes.mes - (quantos - 1 - i), 1)
    const alvo = { ano: d.getFullYear(), mes: d.getMonth() }
    const doMes = f.transacoes.filter((t) => ehDoMes(t.date, alvo))
    return {
      chave: `${alvo.ano}-${alvo.mes}`,
      rotulo: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      ano: alvo.ano,
      mes: alvo.mes,
      entradas: doMes.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      saidas: doMes.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    }
  })
}

/** Gastos do mês agrupados por categoria, do maior para o menor. */
export function gastosPorCategoria(f: FinancasValue) {
  const porId = new Map<string, number>()
  for (const t of f.doMes) {
    if (t.type !== 'expense') continue
    const chave = t.category_id ?? 'sem'
    porId.set(chave, (porId.get(chave) ?? 0) + Number(t.amount))
  }

  return [...porId.entries()]
    .map(([id, total]) => {
      const cat = f.categorias.find((c) => c.id === id)
      return {
        id,
        nome: cat?.name ?? 'Sem categoria',
        cor: cat?.color ?? '#6b7280',
        icone: cat?.icon ?? 'circle',
        total,
      }
    })
    .sort((a, b) => b.total - a.total)
}

/** Agrupa lançamentos por dia, do mais recente para o mais antigo. */
export function agruparPorDia(lista: Transaction[]) {
  const dias = new Map<string, Transaction[]>()
  for (const t of lista) {
    const atual = dias.get(t.date)
    if (atual) atual.push(t)
    else dias.set(t.date, [t])
  }
  return [...dias.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
}

/** "2026-08-28" -> "Hoje", "Ontem" ou "sexta, 28 de agosto". */
export function rotuloDoDia(dataISO: string) {
  const hoje = new Date()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  if (dataISO === iso(hoje)) return 'Hoje'
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  if (dataISO === iso(ontem)) return 'Ontem'

  // 'T00:00:00' evita o fuso jogar a data para o dia anterior
  return new Date(dataISO + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Cores dos gráficos — validadas para daltonismo contra o fundo escuro. */
export const CORES = {
  entrada: '#31a771',
  saida: '#ec1d24',
  investimento: '#4d8ff0',
} as const
