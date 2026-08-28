import { supabase } from './supabase'

/**
 * NOTIFICAÇÕES NO CELULAR.
 *
 * O caminho é sempre o mesmo: o navegador pede permissão, gera um endereço
 * único daquele aparelho, e o servidor usa esse endereço para entregar o
 * aviso. Guardamos o endereço no Supabase para o servidor achá-lo depois.
 *
 * NO IPHONE existe uma regra que não dá para contornar: notificação só chega
 * se o site estiver **instalado na tela de início**. Aberto pelo Safari como
 * uma aba comum, a Apple não entrega nada. Por isso `diagnostico()` verifica
 * isso antes de tudo e devolve o motivo em português.
 */

export type Diagnostico =
  | { ok: true }
  | { ok: false; motivo: string; comoResolver: string }

/** iPhone ou iPad? */
function ehApple() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
}

/** O site está rodando instalado (tela de início) e não numa aba do navegador? */
export function estaInstalado() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // o Safari do iPhone usa esta propriedade antiga
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Diz se dá para ativar notificações neste aparelho — e o que fazer se não der. */
export function diagnostico(): Diagnostico {
  if (!('serviceWorker' in navigator)) {
    return {
      ok: false,
      motivo: 'Este navegador não sabe receber notificações.',
      comoResolver: 'Tente pelo Chrome, Edge ou Safari atualizado.',
    }
  }
  if (!('PushManager' in window)) {
    return {
      ok: false,
      motivo: 'Este navegador não sabe receber notificações.',
      comoResolver: ehApple()
        ? 'No iPhone, atualize para iOS 16.4 ou mais novo.'
        : 'Atualize o navegador.',
    }
  }
  if (ehApple() && !estaInstalado()) {
    return {
      ok: false,
      motivo: 'No iPhone, o site precisa estar instalado na tela de início.',
      comoResolver:
        'Abra no Safari, toque no botão de compartilhar (o quadrado com a seta), escolha "Adicionar à Tela de Início" e abra o app por lá. Depois volte aqui e ative.',
    }
  }
  if (Notification.permission === 'denied') {
    return {
      ok: false,
      motivo: 'Você bloqueou as notificações deste site.',
      comoResolver: ehApple()
        ? 'No iPhone: Ajustes > Notificações > THE JOSHUA VISION > permitir.'
        : 'Clique no cadeado ao lado do endereço do site e libere as notificações.',
    }
  }
  return { ok: true }
}

/** A chave pública do servidor precisa virar bytes para o navegador aceitar. */
function base64ParaBytes(base64: string) {
  const preenchido = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const cru = atob(preenchido)
  return Uint8Array.from(rawToArray(cru))
}

function rawToArray(cru: string) {
  const saida = new Array<number>(cru.length)
  for (let i = 0; i < cru.length; i++) saida[i] = cru.charCodeAt(i)
  return saida
}

/** Converte um pedaço da inscrição (ArrayBuffer) em texto para salvar no banco. */
function chaveParaTexto(buffer: ArrayBuffer | null) {
  if (!buffer) return ''
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

/**
 * Espera o service worker ficar pronto, mas desiste depois de alguns segundos.
 *
 * No preview local ele nem é registrado, e `serviceWorker.ready` fica esperando
 * para sempre — sem este limite a tela travava em "Verificando...".
 */
async function registroPronto(limiteMs = 4000): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((r) => setTimeout(() => r(null), limiteMs)),
  ])
}

/** Já existe uma inscrição ativa neste aparelho? */
export async function estaAtivo(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return false
  const registro = await registroPronto()
  if (!registro) return false
  return (await registro.pushManager.getSubscription()) !== null
}

/**
 * Pede permissão, inscreve este aparelho e guarda no Supabase.
 *
 * Precisa ser chamada a partir de um toque do Joshua: o navegador ignora o
 * pedido de permissão que não vem de um gesto.
 */
export async function ativar(apelido: string): Promise<Diagnostico> {
  const check = diagnostico()
  if (!check.ok) return check

  const chavePublica = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!chavePublica) {
    return {
      ok: false,
      motivo: 'Falta a chave de notificações no servidor.',
      comoResolver: 'Cadastre VITE_VAPID_PUBLIC_KEY nas variáveis da Vercel e publique de novo.',
    }
  }

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') {
    return {
      ok: false,
      motivo: 'Você não permitiu as notificações.',
      comoResolver: 'Toque de novo e escolha "Permitir".',
    }
  }

  const registro = await registroPronto(8000)
  if (!registro) {
    return {
      ok: false,
      motivo: 'O app ainda não está instalado neste navegador.',
      comoResolver:
        'No preview local isso não funciona mesmo — teste em joshuavision.vercel.app, com o app instalado.',
    }
  }

  const inscricao =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({
      // sem isto o navegador recusa: toda mensagem tem que ser visível para o
      // usuário, não dá para usar push silencioso
      userVisibleOnly: true,
      applicationServerKey: base64ParaBytes(chavePublica),
    }))

  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    return {
      ok: false,
      motivo: 'Sua sessão expirou.',
      comoResolver: 'Entre de novo e tente outra vez.',
    }
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: data.user.id,
      endpoint: inscricao.endpoint,
      p256dh: chaveParaTexto(inscricao.getKey('p256dh')),
      auth: chaveParaTexto(inscricao.getKey('auth')),
      apelido,
    },
    { onConflict: 'endpoint' },
  )

  if (error) {
    return {
      ok: false,
      motivo: 'Não consegui guardar este aparelho.',
      comoResolver: 'A tabela push_subscriptions já foi criada no Supabase?',
    }
  }

  return { ok: true }
}

/** Desliga as notificações neste aparelho. */
export async function desativar() {
  const registro = await registroPronto()
  const inscricao = await registro?.pushManager.getSubscription()
  if (!inscricao) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', inscricao.endpoint)
  await inscricao.unsubscribe()
}

/** Manda uma notificação de teste para este aparelho, pelo servidor. */
export async function enviarTeste(): Promise<{ ok: boolean; erro?: string }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, erro: 'Sua sessão expirou. Entre de novo.' }

  const resposta = await fetch('/api/push', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      titulo: 'Capitão América',
      corpo: 'Teste recebido, Joshua. As notificações estão funcionando.',
      url: '/',
    }),
  })

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}))
    return { ok: false, erro: corpo.error ?? 'O servidor não conseguiu enviar.' }
  }
  return { ok: true }
}

/** Um nome para o Joshua reconhecer o aparelho na lista. */
export function nomeDoAparelho() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Celular Android'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'Computador'
  return 'Este aparelho'
}
