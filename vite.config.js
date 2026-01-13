import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // アプリ更新時に自動で反映
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // キャッシュしたい静的資産
      manifest: {
        name: '担当者別スケジュール管理',
        short_name: 'スケ管',
        description: 'チームの予定をモバイルとPCで管理',
        theme_color: '#3b82f6', // アプリのテーマカラー（Blue-500付近）
        background_color: '#ffffff',
        display: 'standalone', // ブラウザのURLバーを隠してアプリ風に表示
        screenshots: [
          {
            src: "screenshot-desktop.png", // publicフォルダに置いた画像名
            sizes: "1280x720",            // 実際の画像サイズに合わせる
            type: "image/png",
            form_factor: "wide",          // デスクトップ用
            label: "Desktop Schedule View"
          },
          {
            src: "screenshot-mobile.png",
            sizes: "750x1334",
            type: "image/png",
            form_factor: "narrow",        // モバイル用
            label: "Mobile Schedule View"
          }
        ],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any' // これを 'any' または 'maskable' に調整
          },
          // ...
        ]
      }
      }
    })
  ]
})