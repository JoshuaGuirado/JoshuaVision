import type { VercelRequest, VercelResponse } from '@vercel/node'
import webpush from 'web-push'

/**
 * ENVIA UMA NOTIFICAÇÃO PARA OS APARELHOS DO JOSHUA.
 *
 * Roda no servidor da Vercel porque a chave privada VAPID (a assinatura que
 * prova para a Apple e para o Google que a mensagem é mesmo do nosso site)
 * não pode aparecer no navegador.
 *
 * Usa a assinatura `(req, res)` do Node, e não o formato `Request`/`Response`
 * de `api/chat.ts`: aquele é do runtime edge, e a biblioteca `web-push`
 * precisa da criptografia do Node. Com o formato errado a função nem chegava a
 * rodar — respondia FUNCTION_INVOCATION_FAILED.
 */

type Inscricao = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

/** Confirma que quem chamou é o usuário logado e devolve o id dele. */
async function usuarioDoToken(token: string): Promise<string | null> {
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!token || !url || !anonKey) return null

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
async function enviarParaUsuario(
  userId: string,
  aviso: { titulo: string; corpo: string; url?: string; grupo?: string },
  token: string,
) {
  const url = process.env.VITE_SUPABASE_URL!
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const publica = process.env.VAPID_PUBLIC_KEY
  const privada = process.env.VAPID_PRIVATE_KEY

  if (!publica || !privada) {
    throw new Error('Faltam VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas variáveis da Vercel.')
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })

  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '')
  const userId = await usuarioDoToken(token)
  if (!userId) return res.status(401).json({ error: 'Não autorizado.' })

  const corpo = (req.body ?? {}) as { titulo?: string; corpo?: string; url?: string }

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
      return res.status(400).json({ error: 'Nenhum aparelho cadastrado para receber.' })
    }
    return res.status(200).json(resultado)
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Falha ao enviar.' })
  }
}
