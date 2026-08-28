import webpush from 'web-push'

/**
 * ENVIA UMA NOTIFICAÇÃO PARA OS APARELHOS DO JOSHUA.
 *
 * Roda no servidor da Vercel porque a chave privada VAPID (a assinatura que
 * prova para a Apple e para o Google que a mensagem é mesmo do nosso site)
 * não pode aparecer no navegador.
 *
 * Runtime Node, não edge: a biblioteca `web-push` usa criptografia do Node.
 */
export const config = { runtime: 'nodejs' }

type Inscricao = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Confirma que quem chamou é o usuário logado e devolve o id dele. */
async function usuarioDoToken(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!token) return null

  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const user = (await res.json()) as { id?: string }
  return user.id ?? null
}

/**
 * Envia para todos os aparelhos do usuário.
 *
 * Aparelhos que responderem 404 ou 410 foram desinstalados ou tiveram a
 * permissão revogada: eles são apagados, senão a lista só cresce com endereços
 * mortos.
 */
export async function enviarParaUsuario(
  userId: string,
  aviso: { titulo: string; corpo: string; url?: string; grupo?: string },
  token: string,
) {
  const url = process.env.VITE_SUPABASE_URL!
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const publica = process.env.VAPID_PUBLIC_KEY
  const privada = process.env.VAPID_PRIVATE_KEY

  if (!publica || !privada) {
    throw new Error('Faltam VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no servidor.')
  }
  webpush.setVapidDetails('mailto:joshuafguirado@gmail.com', publica, privada)

  const res = await fetch(
    `${url}/rest/v1/push_subscriptions?user_id=eq.${userId}&select=id,endpoint,p256dh,auth`,
    { headers: { apikey: anonKey, authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Não consegui ler os aparelhos cadastrados.')

  const inscricoes = (await res.json()) as Inscricao[]
  const mortos: string[] = []
  let entregues = 0

  await Promise.all(
    inscricoes.map(async (i) => {
      try {
        await webpush.sendNotification(
          { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
          JSON.stringify(aviso),
        )
        entregues++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) mortos.push(i.id)
      }
    }),
  )

  if (mortos.length) {
    await fetch(`${url}/rest/v1/push_subscriptions?id=in.(${mortos.join(',')})`, {
      method: 'DELETE',
      headers: { apikey: anonKey, authorization: `Bearer ${token}` },
    })
  }

  return { entregues, aparelhos: inscricoes.length, removidos: mortos.length }
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405)

  const token = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const userId = await usuarioDoToken(request)
  if (!userId) return json({ error: 'Não autorizado.' }, 401)

  const corpo = (await request.json().catch(() => ({}))) as {
    titulo?: string
    corpo?: string
    url?: string
  }

  try {
    const resultado = await enviarParaUsuario(
      userId,
      {
        titulo: corpo.titulo ?? 'THE JOSHUA VISION',
        corpo: corpo.corpo ?? 'Você tem novidades.',
        url: corpo.url ?? '/',
      },
      token,
    )

    if (resultado.aparelhos === 0) {
      return json({ error: 'Nenhum aparelho cadastrado para receber.' }, 400)
    }
    return json(resultado, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Falha ao enviar.' }, 500)
  }
}
