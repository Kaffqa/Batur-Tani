import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/midtrans': {
          target: 'https://app.sandbox.midtrans.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/midtrans/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const serverKey = env.MIDTRANS_SERVER_KEY;
              if (serverKey) {
                const encodedKey = Buffer.from(serverKey + ':').toString('base64');
                proxyReq.setHeader('Authorization', `Basic ${encodedKey}`);
              }
            });
          }
        }
      }
    }
  }
})
