
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// FIX: __dirname is not available in ES modules.
// We can define it using `import.meta.url` to enable path resolution for aliases.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0'
  }
});