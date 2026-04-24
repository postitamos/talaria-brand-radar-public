import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_PUBLIC_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
