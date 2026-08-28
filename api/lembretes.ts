import webpush from 'web-push'

/**
 * O RESUMO DIÁRIO.
 *
 * A Vercel chama este endereço uma vez por dia (ver `vercel.json`). Ele olha o
 * que o Joshua tem para hoje e manda uma notificação só, com o essencial.
 *
 * Por que não dá para fazer isso no navegador: um site fechado não roda nada.
 * No iPhone então nem o app instalado roda em segundo plano. A única forma de
 * um aviso chegar com o app fechado é o servidor empurrar — que é o que
 * acontece aqui.
 *
 * Precisa de SUPABASE_SERVICE_ROLE_KEY: sem um usuário logado, é a única
 * chave que enxerga as tabelas.
 */
export const config = { runtime: 'nodejs' }

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Data de hoje em Brasília, no formato do banco. */
function hojeEmBrasilia() {
  const agora = new Date()
  const brasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const mes = String(brasilia.getMonth() + 1).padStart(2, '0')
  const dia = String(brasilia.getDate()).padStart(2, '0')
  return `${brasilia.getFullYear()}-${mes}-${dia}`
}

export default async function handler(request: Request) {
  // A Vercel manda este cabeçalho nas chamadas agendadas. O segredo cobre o
  // caso de alguém descobrir o endereço e tentar disparar avisos à toa.
  const segredo = process.env.CRON_SECRET
  const autorizado =
    request.headers.get('user-agent')?.includes('vercel-cron') ||
    (segredo && request.headers.get('authorization') === `Bearer ${segredo}`)
  if (!autorizado) return json({ error: 'Não autorizado.' }, 401)

  const url = process.env.VITE_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publica = process.env.VAPID_PUBLIC_KEY
  const privada = process.env.VAPID_PRIVATE_KEY

  if (!url || !service || !publica || !privada) {
    return json({ error: 'Faltam variáveis de ambiente no servidor.' }, 500)
  }

  const cabecalhos = { apikey: service, authorization: `Bearer ${service}` }
  const buscar = async <T>(caminho: string): Promise<T[]> => {
    const r = await fetch(`${url}/rest/v1/${caminho}`, { headers: cabecalhos })
    return r.ok ? ((await r.json()) as T[]) : []
  }

  const hoje = hojeEmBrasilia()

  const [tarefas, eventos, inscricoes] = await Promise.all([
    buscar<{ id: string; title: string }>('tasks?done=eq.false&select=id,title'),
    buscar<{ id: string; title: string; time: string | null }>(
      `events?date=eq.${hoje}&select=id,title,time&order=time`,
    ),
    buscar<{ id: string; endpoint: string; p256dh: string; auth: string; user_id: string }>(
      'push_subscriptions?select=id,endpoint,p256dh,auth,user_id',
    ),
  ])

  if (inscricoes.length === 0) return json({ ok: true, aviso: 'Nenhum aparelho cadastrado.' }, 200)

  // ---- monta a frase, na voz dos Vingadores ----
  const partes: string[] = []
  if (eventos.length) {
    const primeiro = eventos[0]
    const hora = primeiro.time ? primeiro.time.slice(0, 5) + ' ' : ''
    partes.push(
      eventos.length === 1
        ? `${hora}${primeiro.title}`
        : `${eventos.length} compromissos (primeiro: ${hora}${primeiro.title})`,
    )
  }
  if (tarefas.length) {
    partes.push(`${tarefas.length} tarefa${tarefas.length === 1 ? '' : 's'} pendente${tarefas.length === 1 ? '' : 's'}`)
  }

  const corpo = partes.length
    ? `Hoje: ${partes.join(' · ')}.`
    : 'Nada marcado para hoje, Joshua. Dia livre.'

  webpush.setVapidDetails('mailto:joshuafguirado@gmail.com', publica, privada)

  const mortos: string[] = []
  let entregues = 0

  await Promise.all(
    inscricoes.map(async (i) => {
      try {
        await webpush.sendNotification(
          { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
          JSON.stringify({
            titulo: 'Vingadores reunidos',
            corpo,
            url: '/hoje',
            grupo: 'resumo-diario',
          }),
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
      headers: cabecalhos,
    })
  }

  return json({ ok: true, entregues, removidos: mortos.length, corpo }, 200)
}
