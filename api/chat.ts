/**
 * Proxy de IA do THE JOSHUA VISION.
 *
 * As chaves da Anthropic e do Google NUNCA podem ir para o navegador — qualquer
 * pessoa que abrisse o site conseguiria lê-las e gastar na conta do Joshua.
 * Esta função roda no servidor da Vercel, guarda as chaves e só responde a
 * requisições que apresentem um token válido do Supabase.
 *
 * Além de conversar, o assistente MEXE nos dados (criar tarefa, lançar despesa,
 * marcar compromisso...) através das ferramentas em `_ferramentas.ts`. Como isso
 * exige uma ida e volta com o modelo — ele pede a ferramenta, nós executamos,
 * ele responde —, a chamada é feita sem streaming e o texto final é enviado em
 * pedaços. A tela continua vendo a resposta "sendo digitada".
 */

import { FERRAMENTAS, executarFerramenta } from './_ferramentas.js'

export const config = { runtime: 'edge' }

type ChatMessage = { role: 'user' | 'assistant'; content: string }

/** Quantas vezes o modelo pode pedir ferramentas antes de precisar concluir. */
const MAX_VOLTAS = 5

function promptDoSistema() {
  const hoje = new Date().toISOString().slice(0, 10)
  return `Você é o assistente pessoal do Joshua dentro do THE JOSHUA VISION,
o sistema que ele usa para organizar a própria vida (resumo do dia, agenda,
finanças, tarefas, metas, hábitos, projetos, estudos, saúde e notas).

Hoje é ${hoje}. Use essa data para interpretar "hoje", "amanhã", "sexta que vem".

O sistema tem identidade Marvel e você faz parte do esquadrão dele. Pode usar
esse tom com leveza, sem forçar a piada: você é útil primeiro, temático depois.

Fale português do Brasil, de forma direta e prática. Seja conciso.

VOCÊ TEM ACESSO AOS DADOS DELE através das ferramentas. Regras:
- Para responder qualquer pergunta sobre a vida dele (o que tem hoje, quanto
  gastou, quais tarefas), CHAME a ferramenta "consultar" antes. Nunca invente
  números nem chute o que está cadastrado.
- Quando ele pedir para anotar, lembrar, marcar ou registrar algo, CHAME a
  ferramenta correspondente de verdade. Não diga que fez sem ter chamado.
- Depois de executar, confirme em uma frase curta o que foi feito.
- Se faltar informação essencial (uma data, por exemplo), pergunte antes de criar.`
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Confirma o login e devolve o id do usuário, necessário para gravar dados. */
async function autenticar(
  request: Request,
): Promise<{ token: string; userId: string; supabaseUrl: string; anonKey: string } | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!token) return null

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return null

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null

  const user = await res.json()
  if (!user?.id) return null

  return { token, userId: user.id, supabaseUrl, anonKey }
}

/** Envia o texto final em pedaços, para a tela mostrar a resposta surgindo. */
function respostaEmPedacos(texto: string, alterouDados: boolean) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Pedaços por palavra dão um ritmo parecido com o streaming de verdade.
      const partes = texto.match(/\S+\s*/g) ?? [texto]
      for (const parte of partes) {
        controller.enqueue(encoder.encode(parte))
        await new Promise((r) => setTimeout(r, 12))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // A tela usa isso para recarregar os módulos quando algo mudou no banco.
      'x-dados-alterados': alterouDados ? '1' : '0',
    },
  })
}

type Ctx = { token: string; userId: string; supabaseUrl: string; anonKey: string }

/* ------------------------------------------------------------------ */
/* Anthropic                                                           */
/* ------------------------------------------------------------------ */

async function conversarAnthropic(model: string, messages: ChatMessage[], ctx: Ctx) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }, 500)

  const tools = FERRAMENTAS.map((f) => ({
    name: f.nome,
    description: f.descricao,
    input_schema: f.parametros,
  }))

  const historico: unknown[] = messages.map((m) => ({ role: m.role, content: m.content }))
  let alterou = false

  for (let volta = 0; volta < MAX_VOLTAS; volta++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        system: promptDoSistema(),
        messages: historico,
        tools,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      return json({ error: `Anthropic respondeu ${res.status}`, detail }, 502)
    }

    const data = await res.json()
    const blocos: { type: string; text?: string; id?: string; name?: string; input?: unknown }[] =
      data.content ?? []

    const pedidos = blocos.filter((b) => b.type === 'tool_use')

    if (pedidos.length === 0) {
      const texto = blocos
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('')
      return respostaEmPedacos(texto || '(sem resposta)', alterou)
    }

    historico.push({ role: 'assistant', content: blocos })

    const resultados = []
    for (const p of pedidos) {
      const r = await executarFerramenta(
        p.name ?? '',
        (p.input ?? {}) as Record<string, unknown>,
        ctx,
      )
      if (r.alterou) alterou = true
      resultados.push({ type: 'tool_result', tool_use_id: p.id, content: r.saida })
    }
    historico.push({ role: 'user', content: resultados })
  }

  return respostaEmPedacos(
    'Fiz várias tentativas mas não consegui concluir. Pode reformular o pedido?',
    alterou,
  )
}

/* ------------------------------------------------------------------ */
/* Google Gemini                                                       */
/* ------------------------------------------------------------------ */

async function conversarGoogle(model: string, messages: ChatMessage[], ctx: Ctx) {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) return json({ error: 'GOOGLE_API_KEY não configurada no servidor.' }, 500)

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const tools = [
    {
      functionDeclarations: FERRAMENTAS.map((f) => ({
        name: f.nome,
        description: f.descricao,
        parameters: f.parametros,
      })),
    },
  ]

  const contents: unknown[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  let alterou = false

  for (let volta = 0; volta < MAX_VOLTAS; volta++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: promptDoSistema() }] },
        contents,
        tools,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      return json({ error: `Google respondeu ${res.status}`, detail }, 502)
    }

    const data = await res.json()
    const partes: { text?: string; functionCall?: { name: string; args: Record<string, unknown> } }[] =
      data.candidates?.[0]?.content?.parts ?? []

    const chamadas = partes.filter((p) => p.functionCall)

    if (chamadas.length === 0) {
      const texto = partes
        .map((p) => p.text ?? '')
        .join('')
        .trim()
      return respostaEmPedacos(texto || '(sem resposta)', alterou)
    }

    contents.push({ role: 'model', parts: partes })

    const respostas = []
    for (const c of chamadas) {
      const fc = c.functionCall!
      const r = await executarFerramenta(fc.name, fc.args ?? {}, ctx)
      if (r.alterou) alterou = true
      respostas.push({
        functionResponse: { name: fc.name, response: { resultado: r.saida } },
      })
    }
    contents.push({ role: 'user', parts: respostas })
  }

  return respostaEmPedacos(
    'Fiz várias tentativas mas não consegui concluir. Pode reformular o pedido?',
    alterou,
  )
}

/* ------------------------------------------------------------------ */

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405)
  }

  const ctx = await autenticar(request)
  if (!ctx) return json({ error: 'Não autorizado' }, 401)

  let body: { model?: string; messages?: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Corpo inválido' }, 400)
  }

  const { model, messages } = body
  if (!model || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'Informe "model" e "messages".' }, 400)
  }

  return model.startsWith('gemini')
    ? conversarGoogle(model, messages, ctx)
    : conversarAnthropic(model, messages, ctx)
}
