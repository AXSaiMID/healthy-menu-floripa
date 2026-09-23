#!/usr/bin/env node
/**
 * Teste rápido de ponta a ponta da API.
 *
 *   1. Suba o servidor em outro terminal:  npm run dev
 *   2. Rode os testes:                     npm run smoke
 *
 * Verifica catálogo, criação de pedido, login do painel e as rotas do financeiro.
 */
const BASE = process.env.SMOKE_URL || 'http://localhost:3001';

let cookie = '';
let passed = 0;
let failed = 0;

const ok = (label, condition, extra = '') => {
  if (condition) {
    passed += 1;
    console.log(`  ✅ ${label}`);
  } else {
    failed += 1;
    console.log(`  ❌ ${label}${extra ? ` — ${extra}` : ''}`);
  }
};

async function call(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = response.headers.getSetCookie?.() ?? [];
  if (setCookie.length) cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* resposta não-JSON */
  }
  return { status: response.status, json };
}

console.log(`\n🍫  Testes da API · ${BASE}\n`);

/* ------------------------------- plataforma ------------------------------- */
console.log('Plataforma');
const health = await call('/api/health');
ok('Servidor respondendo em /api/health', health.status === 200 && health.json?.ok);

const bootstrap = await call('/api/public/bootstrap');
ok('Bootstrap entrega site + configurações', bootstrap.status === 200 && !!bootstrap.json?.settings?.whatsapp);
ok(
  'Catálogo com produtos ativos',
  Array.isArray(bootstrap.json?.products) && bootstrap.json.products.length > 0,
  `${bootstrap.json?.products?.length ?? 0} produtos`,
);
ok(
  'Produtos com preço e custo definidos',
  bootstrap.json.products.every((p) => p.price > 0 && p.cost >= 0),
);

const missing = await call('/api/public/products/nao-existe-esse-produto');
ok('Produto inexistente responde 404', missing.status === 404);

/* --------------------------------- pedidos --------------------------------- */
console.log('\nPedido pelo site');
const products = bootstrap.json.products;
const sample = products.filter((p) => p.shippingScope === 'nacional').slice(0, 2);

const created = await call('/api/public/orders', {
  method: 'POST',
  body: {
    customer: { name: 'Teste Smoke', phone: '48999990000', email: 'smoke@teste.com', cpf: '' },
    address: {
      zip: '88060000', address: 'Rua de Teste', addressNumber: '10',
      complement: '', district: 'Rio Vermelho', city: 'Florianópolis', state: 'SC',
    },
    deliveryType: 'delivery',
    paymentMethod: 'pix',
    notes: 'Pedido de teste automatizado',
    items: sample.map((p) => ({ productId: p.id, qty: 2 })),
  },
});

ok('Pedido criado com código sequencial', created.status === 201 && /^HM-\d{4}$/.test(created.json?.order?.code ?? ''), created.json?.order?.code);
ok('Total recalculado no servidor', created.json?.order?.total > 0, String(created.json?.order?.total));

const rejected = await call('/api/public/orders', {
  method: 'POST',
  body: { customer: { name: 'X', phone: '1' }, items: [] },
});
ok('Pedido inválido é recusado (400)', rejected.status === 400);

const belowMin = await call('/api/public/orders', {
  method: 'POST',
  body: {
    customer: { name: 'Teste Mínimo', phone: '48999990000' },
    address: { zip: '88060000', address: 'Rua', addressNumber: '1', district: 'Rio Vermelho', city: 'Florianópolis', state: 'SC' },
    deliveryType: 'delivery',
    items: [{ productId: products.find((p) => p.shippingScope === 'nacional').id, qty: 1 }],
  },
});
ok('Pedido mínimo de R$ 25 é respeitado', belowMin.status === 400, belowMin.json?.error);

/* ---------------------------------- admin ---------------------------------- */
console.log('\nPainel administrativo');
const badLogin = await call('/api/auth/login', { method: 'POST', body: { email: 'admin@healthymenufloripa.com.br', password: 'errada' } });
ok('Login com senha errada é recusado', badLogin.status === 401);

const login = await call('/api/auth/login', {
  method: 'POST',
  body: {
    email: process.env.ADMIN_EMAIL || 'admin@healthymenufloripa.com.br',
    password: process.env.ADMIN_PASSWORD || 'healthy2024',
  },
});
ok('Login do administrador funciona', login.status === 200 && !!login.json?.admin);

const guard = await fetch(`${BASE}/api/admin/dashboard`);
ok('Rotas administrativas exigem sessão', guard.status === 401);

const dashboard = await call('/api/admin/dashboard');
ok('Dashboard retorna KPIs', dashboard.status === 200 && typeof dashboard.json?.kpi?.revenue === 'number');
ok('Dashboard traz série por dia', Array.isArray(dashboard.json?.byDay));

const orders = await call('/api/admin/orders');
ok('Lista de pedidos carrega', orders.status === 200 && orders.json.length > 0);
ok('Pedido do teste aparece na lista', orders.json.some((o) => o.customerName === 'Teste Smoke'));

const testOrder = orders.json.find((o) => o.customerName === 'Teste Smoke');
const updated = await call(`/api/admin/orders/${testOrder.id}`, { method: 'PUT', body: { status: 'confirmado', notes: 'ok' } });
ok('Status do pedido é atualizado', updated.json?.status === 'confirmado');

const csv = await fetch(`${BASE}/api/admin/orders/export.csv`, { headers: { cookie } });
const csvText = await csv.text();
ok('Exportação CSV de pedidos', csv.status === 200 && csvText.includes('codigo'));

const product = products[0];
const before = product.price;
const edited = await call(`/api/admin/products/${product.id}`, { method: 'PUT', body: { price: before + 1 } });
ok('Edição de produto persiste', edited.json?.price === before + 1);
await call(`/api/admin/products/${product.id}`, { method: 'PUT', body: { price: before } });

const expense = await call('/api/admin/expenses', {
  method: 'POST',
  body: { description: 'Despesa de teste', category: 'Outros', amount: 12.5, date: new Date().toISOString().slice(0, 10) },
});
ok('Lançamento de despesa', expense.status === 201);
if (expense.json?.id) await call(`/api/admin/expenses/${expense.json.id}`, { method: 'DELETE' });

const customers = await call('/api/admin/customers');
ok('Lista de clientes com total gasto', customers.status === 200 && customers.json.every((c) => typeof c.spent === 'number'));

const settings = await call('/api/admin/settings');
ok('Configurações da empresa carregam', settings.status === 200 && !!settings.json?.whatsapp);

const wa = await call('/api/admin/settings', { method: 'PUT', body: { whatsapp: settings.json.whatsapp } });
ok('Configurações podem ser salvas', wa.status === 200 && wa.json.whatsapp === settings.json.whatsapp);

/* --------------------------------- limpeza --------------------------------- */
const removed = await call(`/api/admin/orders/${testOrder.id}`, { method: 'DELETE' });
ok('Pedido de teste removido', removed.status === 200);

const logout = await call('/api/auth/logout', { method: 'POST' });
ok('Logout encerra a sessão', logout.status === 200);

console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} verificações passaram, ${failed} falharam.\n`);
process.exit(failed === 0 ? 0 : 1);
