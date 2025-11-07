import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      host: true, // Разрешить доступ с внешних устройств (например, с телефона в той же сети)
      allowedHosts: [
        ".cloudpub.ru", // Разрешает все поддомены CloudPub
        "localhost"     // Для локального тестирования
      ],
      // Дополнительно: если нужен HTTPS (например, для VK Tunnel)
      https: false, // CloudPub обычно работает без HTTPS
    },
    optimizeDeps: {
      // Для избежания ошибок с полифиллами
      exclude: ['@ethersproject/hash']
    }
})