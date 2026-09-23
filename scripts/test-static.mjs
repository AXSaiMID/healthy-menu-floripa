#!/usr/bin/env node
/**
 * Testa o modo estático (o que roda no Netlify) sem navegador.
 *
 * Carrega src/lib/static/api.js pelo Vite, com um localStorage de memória, e
 * confere as regras de negócio: catálogo, criação de pedido com frete e pedido
 * mínimo, painel financeiro, produtos, despesas, clientes, sessão e CSV.
 *
 * Rodar com:  npm run test:static
 */
import { createServer } from 'vite';

/* ------------------------- localStorage de mentira ------------------------- */
const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
};

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

let passed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✔ ${label}`);
  } else {
    failures.push(label);
    console.log(`  ✖ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function expectError(label, fn, status) {
  try {
    await fn();
    check(label, false, 'não deu erro');
  } catch (error) {
    check(label, error.status === status, `status ${error.status} ≠ ${status}`);
  }
}

try {
  const { publicApi, authApi, adminApi } = await server.ssrLoadModule('/src/lib/static/api.js');

  console.log('\n▸ Catálogo público');
  const bootstrap = await publicApi.bootstrap();
  check('18 produtos ativos', bootstrap.products.length === 18, `achei ${bootstrap.products.length}`);
  check('WhatsApp da empresa', bootstrap.settings.whatsapp === '5548920008689');
  check('preços em número', typeof bootstrap.products[0].price === 'number');
  check('catálogo ordenado por id', bootstrap.products.every((p, i, a) => i === 0 || a[i - 1].id <= p.id));

  console.log('\n▸ Pedido pelo site');
  const delivery = await publicApi.createOrder({
    customer: { name: 'Cliente Teste Estático', phone: '(48) 99123-4567', email: 'teste@email.com', cpf: '123.456.789-00' },
    address: { zip: '88060-000', address: 'Rua das Conchas', addressNumber: '77', district: 'Ingleses', city: 'Florianópolis', state: 'sc' },
    deliveryType: 'delivery',
    paymentMethod: 'pix',
    items: [{ productId: 2, qty: 3 }],
  });
  check('pedido criado com código HM-0007', delivery.order.code === 'HM-0007', delivery.order.code);
  check('subtotal = 3 × 13,99', delivery.order.subtotal === 41.97, String(delivery.order.subtotal));
  check('frete cobrado abaixo de R$80', delivery.order.deliveryFee === 8, String(delivery.order.deliveryFee));
  check('total = subtotal + frete sem erro de ponto flutuante', delivery.order.total === 49.97, String(delivery.order.total));

  const freeShipping = await publicApi.createOrder({
    customer: { name: 'Cliente Frete Grátis', phone: '48988887777' },
    address: { zip: '88060000', address: 'Rua A', addressNumber: '1', district: 'Jurerê', city: 'Florianópolis' },
    items: [{ productId: 9, qty: 1 }],
  });
  check('frete grátis acima de R$80', freeShipping.order.deliveryFee === 0, String(freeShipping.order.deliveryFee));

  await expectError('recusa carrinho vazio', () => publicApi.createOrder({ items: [] }), 400);
  await expectError(
    'recusa nome curto',
    () => publicApi.createOrder({ customer: { name: 'Ab', phone: '48999999999' }, items: [{ productId: 1, qty: 1 }] }),
    400,
  );
  await expectError(
    'recusa entrega sem endereço',
    () => publicApi.createOrder({ customer: { name: 'Fulano de Tal', phone: '48999999999' }, items: [{ productId: 1, qty: 1 }] }),
    400,
  );
  await expectError(
    'recusa abaixo do pedido mínimo',
    () =>
      publicApi.createOrder({
        customer: { name: 'Fulano de Tal', phone: '48999999999' },
        address: { zip: '88060000', address: 'Rua B', addressNumber: '2', district: 'Centro', city: 'Florianópolis' },
        items: [{ productId: 1, qty: 1 }],
      }),
    400,
  );

  const pickup = await publicApi.createOrder({
    customer: { name: 'Cliente Retirada', phone: '48977776666' },
    deliveryType: 'pickup',
    items: [{ productId: 1, qty: 3 }],
  });
  check('retirada não cobra frete', pickup.order.deliveryFee === 0);
  check('retirada dispensa endereço e mínimo', pickup.order.total === 36);

  /* Integração com o WhatsApp: é o mesmo caminho que o CartDrawer usa. */
  console.log('\n▸ Mensagem enviada ao WhatsApp da loja');
  const { buildOrderMessage, whatsappLink } = await server.ssrLoadModule('/src/lib/whatsapp.js');
  const message = buildOrderMessage({
    order: delivery.order,
    cart: [{ name: 'Brownie Castanha de Caju', qty: 3, price: 13.99 }],
    settings: bootstrap.settings,
    customer: { name: 'Cliente Teste Estático', phone: '(48) 99123-4567', email: 'teste@email.com', cpf: '' },
    address: { zip: '88060-000', address: 'Rua das Conchas', addressNumber: '77', district: 'Ingleses', city: 'Florianópolis', state: 'SC' },
    deliveryType: 'delivery',
    notes: '',
    paymentMethod: 'pix',
  });
  const link = whatsappLink(bootstrap.settings.whatsapp, message);
  check('link aponta para o WhatsApp da empresa', link.startsWith('https://wa.me/5548920008689'), link.slice(0, 60));
  check('mensagem traz o código do pedido', message.includes('HM-0007'));
  check('mensagem traz o total', message.includes('49,97'));
  check('mensagem traz o endereço de entrega', message.includes('Rua das Conchas'));
  check('mensagem traz os dados do cliente', message.includes('Cliente Teste Estático'));
  check('link pronto para abrir (URL codificada)', !link.includes(' ') && link.length > 120);

  console.log('\n▸ Painel: pedidos, clientes e financeiro');
  const orders = await adminApi.orders();
  check('9 pedidos listados (6 demo + 3 novos)', orders.length === 9, String(orders.length));
  check('pedido traz itens resolvidos', orders[0].items.length > 0);
  check('lucro calculado por pedido', typeof orders[0].profit === 'number');

  const latest = await adminApi.order(orders[0].id);
  check('busca de pedido por id', latest.code === orders[0].code);
  const updated = await adminApi.updateOrder(latest.id, { status: 'entregue', discount: 5 });
  check('status atualizado', updated.status === 'entregue');
  check('desconto recalcula o total', updated.total === Math.round((updated.subtotal + updated.deliveryFee - 5) * 100) / 100);

  const customers = await adminApi.customers();
  check('clientes agrupados por telefone', customers.some((c) => c.phone === '48991234567'));
  check('cliente com ticket médio', customers.every((c) => typeof c.avgTicket === 'number'));

  const dashboard = await adminApi.dashboard();
  check('financeiro soma os pedidos', dashboard.kpi.revenue > 0);
  check('lucro bruto = receita − custo', dashboard.kpi.grossProfit === Math.round((dashboard.kpi.revenue - dashboard.kpi.productCost) * 100) / 100);
  check('lucro líquido desconta despesas', dashboard.kpi.netProfit === Math.round((dashboard.kpi.grossProfit - dashboard.kpi.expenses) * 100) / 100);
  check('pendentes contam novo/confirmado/produção', dashboard.kpi.pending >= 0);
  check('top produtos preenchido', dashboard.topProducts.length > 0);
  check('vendas por dia preenchidas', dashboard.byDay.length > 0);
  check('status contados por chave', Object.keys(dashboard.statusCounts).length === 6);
  check('margem em %', typeof dashboard.kpi.margin === 'number');

  console.log('\n▸ Painel: produtos');
  const catalog = await adminApi.products();
  check('painel lista os 18 produtos + categorias', catalog.products.length === 18 && catalog.categories.length === 6);

  const edited = await adminApi.updateProduct(1, { name: 'Brownie 50% Cacau Clássico', price: 12.5, cost: 3.8, promoPrice: 11.9, category: 'brownies' });
  check('preço promocional vira finalPrice', edited.finalPrice === 11.9, String(edited.finalPrice));
  const afterEdit = await publicApi.bootstrap();
  check('mudança no painel aparece na loja', afterEdit.products.find((p) => p.id === 1).finalPrice === 11.9);

  const created = await adminApi.createProduct({ name: 'Brownie de Pistache', price: 19.9, cost: 6, category: 'brownies', shortDesc: 'Novo sabor de teste' });
  check('produto criado com slug gerado', created.slug === 'brownie-de-pistache', created.slug);
  check('loja passa a ter 19 produtos', (await publicApi.bootstrap()).products.length === 19);
  await adminApi.deleteProduct(created.id);
  check('produto removido volta para 18', (await publicApi.bootstrap()).products.length === 18);

  console.log('\n▸ Painel: despesas e configurações');
  const before = await adminApi.expenses();
  const expense = await adminApi.createExpense({ description: 'Embalagens biodegradáveis', category: 'Embalagens', amount: 130.5, date: new Date().toISOString().slice(0, 10) });
  const after = await adminApi.expenses();
  check('despesa criada soma no total', after.total === Math.round((before.total + 130.5) * 100) / 100, `${before.total} → ${after.total}`);
  const categoryBefore = before.byCategory['Embalagens'] ?? 0;
  check(
    'despesa aparece por categoria',
    after.byCategory['Embalagens'] === Math.round((categoryBefore + 130.5) * 100) / 100,
    `${categoryBefore} → ${after.byCategory['Embalagens']}`,
  );
  await adminApi.updateExpense(expense.id, { description: 'Embalagens biodegradáveis', category: 'Embalagens', amount: 100, date: new Date().toISOString().slice(0, 10) });
  check(
    'despesa editada',
    (await adminApi.expenses()).byCategory['Embalagens'] === Math.round((categoryBefore + 100) * 100) / 100,
  );
  await adminApi.deleteExpense(expense.id);
  check('despesa removida', (await adminApi.expenses()).total === before.total);
  check('edição sobrescreve o valor (não acumula)', (await adminApi.expenses()).byCategory['Embalagens'] === categoryBefore);
  await expectError('despesa sem descrição é recusada', () => adminApi.createExpense({ amount: 10 }), 400);

  const savedSettings = await adminApi.saveSettings({ min_order: '30', delivery_fee: '9' });
  check('configuração salva', savedSettings.min_order === '30' && savedSettings.delivery_fee === '9');
  check('configuração vale na loja', (await publicApi.settings()).delivery_fee === '9');
  await adminApi.saveSettings({ min_order: '25', delivery_fee: '8' });

  console.log('\n▸ Sessão do painel');
  await expectError('senha errada é recusada', () => authApi.login('admin@healthymenufloripa.com.br', 'errada'), 401);
  const session = await authApi.login('admin@healthymenufloripa.com.br', 'healthy2024');
  check('login devolve o admin', session.admin.email === 'admin@healthymenufloripa.com.br');
  check('sessão persiste no navegador', (await authApi.me()).admin.name === 'Equipe Healthy Menu');
  await authApi.logout();
  await expectError('logout encerra a sessão', () => authApi.me(), 401);

  console.log('\n▸ Exportação CSV');
  const { ordersCSV } = await server.ssrLoadModule('/src/lib/static/store.js');
  const csv = ordersCSV();
  check('CSV com cabeçalho em português', csv.includes('codigo;data;status;cliente'));
  check('CSV com os pedidos', csv.includes('HM-0001') && csv.includes('HM-0007'));
  check('CSV com valores em vírgula decimal', /"\d+,\d{2}"/.test(csv));

  console.log(`\n${failures.length === 0 ? '✅' : '❌'} modo estático: ${passed} verificações ok, ${failures.length} falha(s)`);
  if (failures.length) {
    console.log('   falhas:', failures.join(' | '));
    process.exitCode = 1;
  }
} catch (error) {
  console.error('\n✖ Erro inesperado no teste:', error);
  process.exitCode = 1;
} finally {
  await server.close();
}
