import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: '世界の窓',
        short_name: '世界の窓',
        description: '今日の地球を、そっと覗くアプリ',
        lang: 'ja',
        theme_color: '#2f9e9e',
        background_color: '#f7f4ee',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
