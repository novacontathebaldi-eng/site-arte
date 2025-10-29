import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // A função loadEnv pode continuar aqui para futuras variáveis, se necessário.
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // A seção 'define' foi removida para não expor a chave da API no frontend.
      resolve: {
        alias: {
          // FIX: '__dirname' is not available in ES modules. Using 'import.meta.url' to get the current directory path.
          '@': fileURLToPath(new URL('./components', import.meta.url)),
        }
      }
    };
});