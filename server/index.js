import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';

import { all, get, run, DATA_DIR, ROOT } from './db.js';
import { seed } from './seed.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.SERVE_DIST === '1';
const DIST = path.join(ROOT, 'dist');

/* Popula banco na primeira execução. */
seed();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

/* --------------------------------- API --------------------------------- */
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    service: 'Healthy Menu Floripa',
    mode: IS_PROD ? 'production' : 'development',
    time: new Date().toISOString(),
  }),
);

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

/* ------------------------------ Front-end ------------------------------ */
const server = http.createServer(app);

if (!IS_PROD) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: ROOT,
    appType: 'custom',
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true,
    },
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    try {
      const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      next(error);
    }
  });
} else {
  app.use(
    express.static(DIST, {
      setHeaders(res, filePath) {
        if (/\.(js|css|woff2?|jpg|jpeg|png|svg|webp)$/.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

/* ------------------------------ Error handler ------------------------------ */
app.use((error, _req, res, _next) => {
  console.error('[erro]', error);
  res.status(500).json({ error: 'Algo deu errado no servidor. Tente novamente.' });
});

server.listen(PORT, HOST, () => {
  const products = get('SELECT COUNT(*) AS n FROM products')?.n ?? 0;
  const orders = get('SELECT COUNT(*) AS n FROM orders')?.n ?? 0;
  console.log('');
  console.log('  🍫  Healthy Menu Floripa');
  console.log(`      Site ............ http://localhost:${PORT}`);
  console.log(`      Painel admin .... http://localhost:${PORT}/admin`);
  console.log(`      Modo ............ ${IS_PROD ? 'produção' : 'desenvolvimento (Vite middleware)'}`);
  console.log(`      Banco ........... ${path.join(DATA_DIR, 'healthy-menu.db')}`);
  console.log(`      Catálogo ........ ${products} produtos · ${orders} pedidos`);
  console.log('');
});

export { app, server };
