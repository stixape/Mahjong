import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const repoBase = '/Mahjong/';

export default defineConfig(({ command }) => {
  const base = command === 'build' ? repoBase : '/';

  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          id: repoBase,
          name: 'Mahjong',
          short_name: 'Mahjong',
          description: 'Classic Mahjong tile-matching game',
          start_url: repoBase,
          scope: repoBase,
          display: 'fullscreen',
          orientation: 'any',
          theme_color: '#1a472a',
          background_color: '#1a472a',
          icons: [
            { src: `${repoBase}icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${repoBase}icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
            { src: `${repoBase}icons/icon-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,webp,svg,ico,woff2,mp3}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        },
      }),
    ],
  };
});
