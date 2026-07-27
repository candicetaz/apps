import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Deployed as a GitHub Pages *project* page at
  // https://candicetaz.github.io/chinesespelling/ — an absolute base
  // matching that path is required so every asset/chunk/fetch URL resolves
  // correctly regardless of whether the page is hit with or without a
  // trailing slash (a relative base like './' breaks — silently, with a
  // blank page — the moment the URL is missing its trailing slash, since
  // the browser then resolves "./assets/x.js" one directory too high).
  base: '/chinesespelling/',
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
