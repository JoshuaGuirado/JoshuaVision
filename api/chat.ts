/**
 * Proxy de IA do THE JOSHUA VISION.
 *
 * As chaves da Anthropic e do Google NUNCA podem ir para o navegador — qualquer
 * pessoa que abrisse o site conseguiria lê-las e gastar na conta do Joshua.
 * Esta função roda no servidor da Vercel, guarda as chaves e só responde a
 * requisições que apresentem um token válido do Supabase (ou seja, ao Joshua
 * logado).
 */

export const config = { runtime: 'edge' }

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `Você é o assistente pessoal do Joshua dentro do THE JOSHUA VISION,
o sistema que ele usa para organizar a própria vida (agenda, finanças, tarefas,
metas, hábitos, projetos, estudos, saúde, diário, notas e planejamento de futuro).

Fale português do Brasil, de forma direta e prática. Seja conciso: responda o que
foi perguntado, sem enrolação nem repetir a pergunta. Você conhece o contexto do
sistema e pode ajudar Joshua a pensar, planejar e organizar. Quando ele pedir algo
que ainda não está implementado no sistema, diga isso com clareza em vez de fingir
que executou.`

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Confirma que quem chamou é o usuário logado no Supabase. */
async function authenticate(request: Request): Promise<boolean> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!token) return false

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return false

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  })
  return res.ok
}

async function streamAnthropic(model: string, messages: ChatMessage[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' }, 500)

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text()
    return json({ error: `Anthropic respondeu ${upstream.status}`, detail }, 502)
  }

  // Converte o SSE da Anthropic num fluxo de texto puro para o app consumir.
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          } catch {
            // linha parcial ou keep-alive — ignorar
          }
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

async function streamGoogle(model: string, messages: ChatMessage[]) {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) return json({ error: 'GOOGLE_API_KEY não configurada no servidor.' }, 500)

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent` +
    `?alt=sse&key=${apiKey}`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
  })

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text()
    return json({ error: `Google respondeu ${upstream.status}`, detail }, 502)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            const text = event.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) controller.enqueue(encoder.encode(text))
          } catch {
            // ignorar linhas incompletas
          }
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405)
  }

  if (!(await authenticate(request))) {
    return json({ error: 'Não autorizado' }, 401)
  }

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
    ? streamGoogle(model, messages)
    : streamAnthropic(model, messages)
}
