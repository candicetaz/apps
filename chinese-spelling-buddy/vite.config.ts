import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built app works whether it's served from
  // the domain root or a sub-path (e.g. a GitHub Pages project page).
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chinese Spelling Buddy',
        short_name: 'Spelling Buddy',
        description:
          'Learn Chinese pinyin, meanings, and handwriting — paste a phrase, hear it read aloud, and practise writing each character.',
        theme_color: '#5b6ee8',
        background_color: '#f6f7fb',
        display: 'standalone',
        // Relative (no leading slash) so they resolve correctly under
        // whatever sub-path the app is deployed at.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The dictionary (~7MB), per-character stroke data (~9.5k small
        // JSON files), and OCR models (~16MB) are fetched on demand at
        // runtime, not bundled into the app — so they're deliberately left
        // out of the precache list (which would force everyone to download
        // tens of MB before the app is usable) and instead cached lazily as
        // the user actually visits words/characters/scans a photo, via the
        // runtime caching rules below.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // The OCR feature's JS chunk bundles onnxruntime-web + the OCR
        // pipeline and is multiple MB by itself — like the dictionary/stroke
        // data, it should only be fetched when someone actually uses the
        // camera-scan feature, not precached for every visitor.
        globIgnores: ['**/ocr-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/dictionary\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cedict-dictionary',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/decomposition\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'char-decomposition',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/hanzi-data\/.+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hanzi-stroke-data',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/ocr\/.+\.(onnx|txt)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-models',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/ort\/.+\.(wasm|mjs)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnxruntime-wasm',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/assets\/ocr-.+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-feature-chunk',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
