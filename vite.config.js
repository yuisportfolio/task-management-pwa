import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Task Management App',
        short_name: 'TaskApp',
        description: 'My Awesome Task Management App',
        theme_color: '#ffffff',
        icons: [
          {
            src: "/icon-192.png",
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: "/icon-512.png",
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }) // ← ここでVitePWAを閉じる
  ], // ← ここでpluginsを閉じる
}); // ← ここでdefineConfigを閉じる