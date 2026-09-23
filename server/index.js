import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';

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

/* Comprime as respostas (HTML, JS, CSS, JSON) — deixa o site bem mais leve. */
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  /* Fotos do catálogo: em desenvolvimento nunca deixamos cachear.
     Assim um 404 de uma imagem recém-adicionada não fica preso no navegador
     nem no proxy do preview. Em produção valem as regras do express.static. */
  if (!IS_PROD && (req.path.startsWith('/images/') || req.path === '/logo.svg' || req.path === '/favicon.svg')) {
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  /* O painel não deve aparecer em buscadores. */
  if (req.path === '/admin' || req.path.startsWith('/admin/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

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

/* -------------------------------- SEO -------------------------------- */
function siteUrl(req) {
  /* Permite fixar o endereço final do site em produção. */
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/$/, '');

  const host = req.get('host') || `localhost:${PORT}`;
  const forwarded = req.get('x-forwarded-proto');
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host);
  const protocol = forwarded ? forwarded.split(',')[0].trim() : isLocal ? 'http' : 'https';

  return `${protocol}://${host}`;
}

app.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        '',
        `Sitemap: ${siteUrl(req)}/sitemap.xml`,
        '',
      ].join('\n'),
    );
});

app.get('/sitemap.xml', (req, res) => {
  const base = siteUrl(req);
  const staticRoutes = [
    ['/', '1.0', 'weekly'],
    ['/cardapio', '0.9', 'weekly'],
    ['/sobre', '0.7', 'monthly'],
    ['/entregas', '0.7', 'monthly'],
    ['/contato', '0.6', 'monthly'],
  ];

  let products = [];
  try {
    products = all("SELECT slug, updated_at FROM products WHERE active = 1 ORDER BY sort_order");
  } catch {
    products = [];
  }

  const entries = [
    ...staticRoutes.map(
      ([path, priority, freq]) =>
        `  <url><loc>${base}${path}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
    ),
    ...products.map(
      (product) =>
        `  <url><loc>${base}/produto/${product.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    ),
  ];

  res
    .type('application/xml')
    .send(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
        '',
      ].join('\n'),
    );
});

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
  console.log(`      Ambiente ........ ${process.env.NODE_ENV || 'development'}`);
  console.log(`      Modo ............ ${IS_PROD ? 'produção' : 'desenvolvimento (Vite middleware)'}`);
  console.log(`      Banco ........... ${path.join(DATA_DIR, 'healthy-menu.db')}`);
  console.log(`      Catálogo ........ ${products} produtos · ${orders} pedidos`);
  console.log('');
});

export { app, server };
