import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/*
 * Em desenvolvimento o Vite roda em modo middleware dentro do Express
 * (server/index.js), então um único processo serve API + front-end.
 * `npm run build` gera o bundle de produção em /dist.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    watch: {
      /* o banco SQLite fica dentro do projeto: evita reload a cada escrita */
      ignored: ['**/data/**', '**/.git/**'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
