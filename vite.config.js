import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_COLLAB_SERVER_URL': JSON.stringify(env.VITE_COLLAB_SERVER_URL),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './jest.setup.ts',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  }
})
