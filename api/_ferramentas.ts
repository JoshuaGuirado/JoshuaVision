/**
 * FERRAMENTAS DO ASSISTENTE.
 *
 * O que o esquadrão pode fazer nos dados do Joshua além de conversar: criar
 * tarefa, lançar despesa, marcar compromisso, escrever nota, e consultar o que
 * já existe.
 *
 * Tudo passa pelo Supabase com o token DELE — nunca com a chave de serviço.
 * Assim o banco continua aplicando as mesmas regras de segurança das telas: se
 * a linha não for dele, não entra e não sai.
 */

export type Ferramenta = {
  nome: string
  descricao: string
  /** Schema dos parâmetros no formato JSON Schema (aceito pelos dois provedores). */
  parametros: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export const FERRAMENTAS: Ferramenta[] = [
  {
    nome: 'criar_tarefa',
    descricao:
      'Cria uma tarefa na lista do Joshua. Use quando ele pedir para anotar, lembrar de fazer ' +
      'algo, ou disser que precisa fazer alguma coisa.',
    parametros: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'O que precisa ser feito' },
        prioridade: {
          type: 'string',
          enum: ['baixa', 'media', 'alta'],
          description: 'Padrão media. Use alta só se ele indicar urgência.',
        },
        prazo: {
          type: 'string',
          description: 'Data limite no formato AAAA-MM-DD. Omita se ele não disser.',
        },
      },
      required: ['titulo'],
    },
  },
  {
    nome: 'criar_evento',
    descricao:
      'Marca um compromisso na agenda. Use para reuniões, consultas, aulas — qualquer coisa ' +
      'com data marcada.',
    parametros: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Nome do compromisso' },
        data: { type: 'string', description: 'Data no formato AAAA-MM-DD' },
        hora: { type: 'string', description: 'Hora no formato HH:MM, se ele disser' },
        observacoes: { type: 'string', description: 'Detalhes extras' },
      },
      required: ['titulo', 'data'],
    },
  },
  {
    nome: 'criar_lancamento',
    descricao:
      'Registra uma receita ou despesa nas finanças. Use quando ele contar que gastou ou ' +
      'recebeu dinheiro.',
    parametros: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['income', 'expense'],
          description: 'income para receita, expense para despesa',
        },
        valor: { type: 'number', description: 'Valor em reais, sempre positivo' },
        descricao: { type: 'string', description: 'Do que se trata' },
        data: { type: 'string', description: 'AAAA-MM-DD. Omita para hoje.' },
      },
      required: ['tipo', 'valor'],
    },
  },
  {
    nome: 'criar_nota',
    descricao: 'Guarda uma anotação. Use quando ele pedir para anotar uma informação.',
    parametros: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título curto' },
        conteudo: { type: 'string', description: 'O texto da nota' },
      },
      required: ['titulo', 'conteudo'],
    },
  },
  {
    nome: 'criar_meta',
    descricao: 'Cria uma meta de longo prazo, com progresso acompanhável.',
    parametros: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'O objetivo' },
        prazo: { type: 'string', description: 'AAAA-MM-DD, se houver' },
        detalhes: { type: 'string', description: 'Observações' },
      },
      required: ['titulo'],
    },
  },
  {
    nome: 'consultar',
    descricao:
      'Lê os dados atuais do Joshua para responder perguntas como "o que tenho hoje?", ' +
      '"quanto gastei este mês?", "quais minhas tarefas?". Chame antes de responder ' +
      'qualquer pergunta sobre a vida dele — nunca invente números.',
    parametros: {
      type: 'object',
      properties: {
        o_que: {
          type: 'string',
          enum: ['tarefas', 'agenda_hoje', 'financas_mes', 'metas', 'habitos_hoje'],
          description: 'Qual conjunto de dados buscar',
        },
      },
      required: ['o_que'],
    },
  },
]

const hoje = () => new Date().toISOString().slice(0, 10)

function inicioEFimDoMes() {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { inicio: iso(inicio), fim: iso(fim) }
}

/** Cliente REST mínimo do Supabase, autenticado como o próprio Joshua. */
function criarCliente(supabaseUrl: string, anonKey: string, token: string, userId: string) {
  const base = `${supabaseUrl}/rest/v1`
  const headers = {
    apikey: anonKey,
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  }

  return {
    async inserir(tabela: string, valores: Record<string, unknown>) {
      const res = await fetch(`${base}/${tabela}`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ ...valores, user_id: userId }),
      })
      if (!res.ok) throw new Error(await res.text())
      const linhas = await res.json()
      return linhas[0]
    },
    async buscar(tabela: string, query: string) {
      const res = await fetch(`${base}/${tabela}?${query}`, { headers })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  }
}

export type ResultadoFerramenta = {
  /** Texto que volta para o modelo descrevendo o que aconteceu. */
  saida: string
  /** Se a ação alterou dados — a interface usa isso para recarregar as telas. */
  alterou: boolean
}

/**
 * Executa uma ferramenta pedida pelo modelo.
 *
 * Nunca lança: qualquer falha vira texto para o modelo poder explicar ao Joshua
 * o que deu errado, em vez de a conversa morrer.
 */
export async function executarFerramenta(
  nome: string,
  args: Record<string, unknown>,
  ctx: { supabaseUrl: string; anonKey: string; token: string; userId: string },
): Promise<ResultadoFerramenta> {
  const db = criarCliente(ctx.supabaseUrl, ctx.anonKey, ctx.token, ctx.userId)

  try {
    switch (nome) {
      case 'criar_tarefa': {
        const linha = await db.inserir('tasks', {
          title: String(args.titulo ?? '').trim(),
          priority: ['baixa', 'media', 'alta'].includes(String(args.prioridade))
            ? args.prioridade
            : 'media',
          due_date: args.prazo ?? null,
        })
        return { saida: `Tarefa criada: "${linha.title}".`, alterou: true }
      }

      case 'criar_evento': {
        const linha = await db.inserir('events', {
          title: String(args.titulo ?? '').trim(),
          date: args.data,
          time: args.hora ?? null,
          notes: args.observacoes ?? '',
        })
        return {
          saida: `Compromisso marcado: "${linha.title}" em ${linha.date}${
            linha.time ? ` às ${String(linha.time).slice(0, 5)}` : ''
          }.`,
          alterou: true,
        }
      }

      case 'criar_lancamento': {
        const valor = Number(args.valor)
        if (!Number.isFinite(valor) || valor <= 0) {
          return { saida: 'Valor inválido: precisa ser um número maior que zero.', alterou: false }
        }
        const linha = await db.inserir('transactions', {
          type: args.tipo === 'income' ? 'income' : 'expense',
          amount: valor,
          description: args.descricao ?? '',
          date: args.data ?? hoje(),
          is_recurring: false,
        })
        const rotulo = linha.type === 'income' ? 'Receita' : 'Despesa'
        return {
          saida: `${rotulo} de R$ ${valor.toFixed(2)} registrada${
            linha.description ? ` (${linha.description})` : ''
          }.`,
          alterou: true,
        }
      }

      case 'criar_nota': {
        const linha = await db.inserir('notes', {
          title: String(args.titulo ?? '').trim(),
          content: String(args.conteudo ?? ''),
        })
        return { saida: `Nota guardada: "${linha.title}".`, alterou: true }
      }

      case 'criar_meta': {
        const linha = await db.inserir('goals', {
          title: String(args.titulo ?? '').trim(),
          notes: args.detalhes ?? '',
          deadline: args.prazo ?? null,
          progress: 0,
        })
        return { saida: `Meta criada: "${linha.title}".`, alterou: true }
      }

      case 'consultar': {
        const o_que = String(args.o_que)

        if (o_que === 'tarefas') {
          const linhas = await db.buscar(
            'tasks',
            'select=title,priority,due_date&done=is.false&order=created_at.desc&limit=25',
          )
          if (linhas.length === 0) return { saida: 'Nenhuma tarefa pendente.', alterou: false }
          return {
            saida:
              `${linhas.length} tarefa(s) pendente(s):\n` +
              linhas
                .map(
                  (t: { title: string; priority: string; due_date: string | null }) =>
                    `- ${t.title} (${t.priority}${t.due_date ? `, prazo ${t.due_date}` : ''})`,
                )
                .join('\n'),
            alterou: false,
          }
        }

        if (o_que === 'agenda_hoje') {
          const linhas = await db.buscar(
            'events',
            `select=title,time,notes&date=eq.${hoje()}&order=time`,
          )
          if (linhas.length === 0) return { saida: 'Nada marcado para hoje.', alterou: false }
          return {
            saida:
              'Hoje:\n' +
              linhas
                .map(
                  (e: { title: string; time: string | null }) =>
                    `- ${e.time ? String(e.time).slice(0, 5) + ' ' : ''}${e.title}`,
                )
                .join('\n'),
            alterou: false,
          }
        }

        if (o_que === 'financas_mes') {
          const { inicio, fim } = inicioEFimDoMes()
          const linhas = await db.buscar(
            'transactions',
            `select=type,amount,description&date=gte.${inicio}&date=lte.${fim}`,
          )
          const receita = linhas
            .filter((t: { type: string }) => t.type === 'income')
            .reduce((s: number, t: { amount: string }) => s + Number(t.amount), 0)
          const despesa = linhas
            .filter((t: { type: string }) => t.type === 'expense')
            .reduce((s: number, t: { amount: string }) => s + Number(t.amount), 0)
          return {
            saida:
              `Mês atual: receitas R$ ${receita.toFixed(2)}, despesas R$ ${despesa.toFixed(2)}, ` +
              `saldo R$ ${(receita - despesa).toFixed(2)} (${linhas.length} lançamentos).`,
            alterou: false,
          }
        }

        if (o_que === 'metas') {
          const linhas = await db.buscar('goals', 'select=title,progress,deadline&order=created_at.desc')
          if (linhas.length === 0) return { saida: 'Nenhuma meta cadastrada.', alterou: false }
          return {
            saida: linhas
              .map(
                (g: { title: string; progress: number; deadline: string | null }) =>
                  `- ${g.title}: ${g.progress}%${g.deadline ? ` (até ${g.deadline})` : ''}`,
              )
              .join('\n'),
            alterou: false,
          }
        }

        if (o_que === 'habitos_hoje') {
          const [habitos, feitos] = await Promise.all([
            db.buscar('habits', 'select=id,name'),
            db.buscar('habit_logs', `select=habit_id&date=eq.${hoje()}`),
          ])
          if (habitos.length === 0) return { saida: 'Nenhum hábito cadastrado.', alterou: false }
          const ids = new Set(feitos.map((f: { habit_id: string }) => f.habit_id))
          return {
            saida:
              `${ids.size}/${habitos.length} hábitos feitos hoje:\n` +
              habitos
                .map((h: { id: string; name: string }) => `- ${h.name}: ${ids.has(h.id) ? 'feito' : 'pendente'}`)
                .join('\n'),
            alterou: false,
          }
        }

        return { saida: `Não sei consultar "${o_que}".`, alterou: false }
      }

      default:
        return { saida: `Ferramenta desconhecida: ${nome}.`, alterou: false }
    }
  } catch (err) {
    const detalhe = err instanceof Error ? err.message : String(err)
    return { saida: `Falhou ao executar ${nome}: ${detalhe}`, alterou: false }
  }
}
