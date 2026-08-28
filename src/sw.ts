/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

/**
 * O SERVICE WORKER DO THE JOSHUA VISION.
 *
 * Ele já existia para o site funcionar instalado (PWA). Agora também recebe as
 * notificações: no iPhone, uma notificação só chega se um service worker do
 * app instalado na tela de início estiver escutando — não existe caminho por
 * fora disso.
 *
 * Este arquivo é o "código do carteiro": ele fica dormindo, e quando o
 * servidor manda uma mensagem, ele acorda e mostra o aviso.
 */

declare const self: ServiceWorkerGlobalScope

// Arquivos do site, injetados pelo plugin no momento do build.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Assume o controle das abas abertas assim que a versão nova instala, para o
// Joshua não precisar fechar e abrir o app depois de cada atualização.
self.skipWaiting()
clientsClaim()

type Aviso = {
  titulo: string
  corpo: string
  /** Para onde levar quando o Joshua tocar no aviso. */
  url?: string
  /** Junta avisos do mesmo assunto em vez de empilhar vários. */
  grupo?: string
}

self.addEventListener('push', (evento) => {
  let aviso: Aviso = { titulo: 'THE JOSHUA VISION', corpo: 'Você tem novidades.' }

  try {
    if (evento.data) aviso = { ...aviso, ...(evento.data.json() as Aviso) }
  } catch {
    // Mensagem sem JSON (ou vazia): mostra o texto cru em vez de engolir o aviso.
    if (evento.data) aviso.corpo = evento.data.text()
  }

  evento.waitUntil(
    self.registration.showNotification(aviso.titulo, {
      body: aviso.corpo,
      icon: '/logos/avenger.png',
      badge: '/icon.svg',
      tag: aviso.grupo ?? 'tjv',
      data: { url: aviso.url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const destino = (evento.notification.data as { url?: string })?.url ?? '/'

  evento.waitUntil(
    (async () => {
      const abas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

      // Se o app já está aberto, leva a aba existente até a tela certa em vez
      // de abrir uma segunda cópia.
      for (const aba of abas) {
        if ('focus' in aba) {
          await aba.focus()
          if ('navigate' in aba) await aba.navigate(destino)
          return
        }
      }
      await self.clients.openWindow(destino)
    })(),
  )
})
