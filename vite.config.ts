import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  // Respeita a porta pedida pelo ambiente (PORT); sem ela, usa a padrão do Vite.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // `injectManifest` em vez do service worker automático: precisamos do
      // nosso próprio (src/sw.ts) para receber as notificações push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // as artes dos heróis e as vozes são grandes e não precisam ficar
        // guardadas offline; o resto do site sim
        globPatterns: ['**/*.{js,css,html,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false, type: 'module' },
      manifest: {
        name: 'THE JOSHUA VISION',
        short_name: 'TJV',
        description: 'Life OS pessoal — sua vida, sua visão',
        theme_color: '#060d1c',
        background_color: '#060d1c',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
})
