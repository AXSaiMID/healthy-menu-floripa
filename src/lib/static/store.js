/**
 * Banco de dados local do "modo estático".
 *
 * Quando o site roda em um host que só entrega arquivos (Netlify, GitHub Pages,
 * Vercel estático…), não existe servidor Node nem SQLite. Esta camada assume o
 * papel do banco: os dados nascem do snapshot exportado do SQLite real e as
 * alterações ficam guardadas no localStorage do navegador.
 *
 * As regras de negócio (frete, pedido mínimo, custo, lucro, KPIs) repetem
 * exatamente o que server/routes/public.js e server/routes/admin.js fazem, para
 * que o site publicado mostre os mesmos números do painel real.
 */
import snapshot from './snapshot.json';

const STORAGE_KEY = 'hmf.demo.db.v1';

export const DEMO_ADMIN = {
  id: 1,
  name: 'Equipe Healthy Menu',
  email: 'admin@healthymenufloripa.com.br',
};
export const DEMO_PASSWORD = 'healthy2024';

export const STATUSES = ['novo', 'confirmado', 'producao', 'enviado', 'entregue', 'cancelado'];
export const PAYMENTS = ['pix', 'dinheiro', 'cartao', 'link'];
export const CATEGORIES = [
  { id: 'brownies', label: 'Brownies' },
  { id: 'combos', label: 'Combos & Presentes' },
  { id: 'salgados', label: 'Salgados & Wraps' },
  { id: 'refeicoes', label: 'Refeições Fit' },
  { id: 'zero-acucar', label: 'Zero Açúcar' },
  { id: 'bebidas', label: 'Bebidas' },
];

export const money = (n) => Math.round(Number(n || 0) * 100) / 100;

const clone = (value) => JSON.parse(JSON.stringify(value));

const freshState = () => ({
  products: clone(snapshot.products),
  settings: { ...snapshot.settings },
  orders: clone(snapshot.orders),
  expenses: clone(snapshot.expenses),
  loggedIn: false,
  password: DEMO_PASSWORD,
});

let cache = null;

function storage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Estado atual (carregado do navegador ou criado a partir do snapshot). */
function state() {
  if (cache) return cache;
  const store = storage();
  const raw = store?.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.products?.length && parsed?.settings) {
        cache = { ...freshState(), ...parsed };
        return cache;
      }
    } catch {
      /* dados corrompidos: recomeça do snapshot */
    }
  }
  cache = freshState();
  persist();
  return cache;
}

function persist() {
  const store = storage();
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* modo privado / cota cheia: segue apenas em memória */
  }
}

/** Volta tudo ao estado de demonstração original. */
export function resetStore() {
  cache = freshState();
  persist();
  return cache;
}

export function isDemo() {
  return true;
}

/* --------------------------- Data/hora no formato SQLite --------------------------- */
/** SQLite grava datetime('now') como "YYYY-MM-DD HH:MM:SS" (UTC). Mantemos igual. */
export const nowSQL = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
export const today = () => new Date().toISOString().slice(0, 10);

/* --------------------------------- Helpers --------------------------------- */
const parseJSON = (value, fallback = []) => {
  try {
    if (Array.isArray(value)) return value;
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || `produto-${Date.now()}`;

export const mapProduct = (row) => ({
  ...row,
  finalPrice: row.promoPrice && row.promoPrice > 0 ? row.promoPrice : row.price,
  gallery: parseJSON(row.gallery),
  tags: parseJSON(row.tags),
});

const mapOrder = (order, { withItems = true } = {}) => {
  if (!order) return null;
  const out = {
    ...clone(order),
    profit: money(order.total - order.cost),
  };
  if (!withItems) delete out.items;
  return out;
};

const nextId = (rows) => (rows.length ? Math.max(...rows.map((r) => Number(r.id) || 0)) + 1 : 1);

function nextOrderCode() {
  /* Mesma regra do servidor: sequencial pelo total de pedidos. */
  const seq = state().orders.length + 1;
  return `HM-${String(seq).padStart(4, '0')}`;
}

/* ---------------------------------------------------------------------- */
/* Vitrine pública                                                        */
/* ---------------------------------------------------------------------- */
export function getSettings() {
  return { ...state().settings };
}

export function listPublicProducts() {
  return state()
    .products.filter((p) => p.active)
    .sort((a, b) => a.id - b.id)
    .map(mapProduct);
}

export function getProductBySlug(slug) {
  const found = state().products.find((p) => p.slug === slug && p.active);
  return found ? mapProduct(found) : null;
}

/* ---------------------------------------------------------------------- */
/* Pedidos                                                                */
/* ---------------------------------------------------------------------- */
export function createOrder(body = {}) {
  const { products, settings } = state();
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) throw httpError(400, 'Seu carrinho está vazio.');

  const name = String(body.customer?.name ?? '').trim();
  const phone = String(body.customer?.phone ?? '').replace(/\D/g, '');
  if (name.length < 3) throw httpError(400, 'Informe o nome completo.');
  if (phone.length < 10) throw httpError(400, 'Informe um WhatsApp válido com DDD.');

  const deliveryType = body.deliveryType === 'pickup' ? 'pickup' : 'delivery';
  if (deliveryType === 'delivery') {
    for (const field of ['zip', 'address', 'addressNumber', 'district', 'city']) {
      if (!String(body.address?.[field] ?? '').trim()) {
        throw httpError(400, 'Preencha o endereço de entrega completo.');
      }
    }
  }

  /* Preço e custo vêm sempre do catálogo — nunca do que o navegador enviou. */
  const resolved = [];
  for (const item of items) {
    const product = products.find((p) => p.id === Number(item.productId) && p.active);
    if (!product) continue;
    const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
    const unitPrice = money(product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price);
    resolved.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      unitPrice,
      unitCost: money(product.cost),
      qty,
      total: money(unitPrice * qty),
      shippingScope: product.shippingScope,
    });
  }
  if (!resolved.length) throw httpError(400, 'Os produtos do carrinho não estão mais disponíveis.');

  const subtotal = money(resolved.reduce((sum, i) => sum + i.total, 0));
  const cost = money(resolved.reduce((sum, i) => sum + i.unitCost * i.qty, 0));

  const onlyLocal = resolved.every((i) => i.shippingScope === 'local');
  const freeFrom = Number(settings.free_delivery_from || 0);
  const baseFee = Number(settings.delivery_fee || 0);
  const minOrder = Number(settings.min_order || 0);

  let deliveryFee = 0;
  if (deliveryType === 'delivery' && !onlyLocal) {
    deliveryFee = freeFrom > 0 && subtotal >= freeFrom ? 0 : baseFee;
  }

  if (deliveryType === 'delivery' && !onlyLocal && subtotal < minOrder) {
    throw httpError(
      400,
      `O pedido mínimo para entrega é ${minOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
    );
  }

  const discount = money(Math.max(0, Number(body.discount) || 0));
  const total = money(Math.max(0, subtotal + deliveryFee - discount));
  const payment = PAYMENTS.includes(body.paymentMethod) ? body.paymentMethod : 'pix';
  const stamp = nowSQL();

  const order = {
    id: nextId(state().orders),
    code: nextOrderCode(),
    customerName: name,
    customerPhone: phone,
    customerEmail: String(body.customer?.email ?? '').trim(),
    customerCpf: String(body.customer?.cpf ?? '').replace(/\D/g, ''),
    deliveryType,
    address: {
      zip: String(body.address?.zip ?? '').replace(/\D/g, ''),
      address: String(body.address?.address ?? '').trim(),
      addressNumber: String(body.address?.addressNumber ?? '').trim(),
      complement: String(body.address?.complement ?? '').trim(),
      district: String(body.address?.district ?? '').trim(),
      city: String(body.address?.city ?? '').trim(),
      state: String(body.address?.state ?? '').trim().toUpperCase().slice(0, 2),
    },
    notes: String(body.notes ?? '').trim().slice(0, 600),
    paymentMethod: payment,
    subtotal,
    deliveryFee,
    discount,
    total,
    cost,
    profit: money(total - cost),
    status: 'novo',
    source: 'site',
    createdAt: stamp,
    updatedAt: stamp,
    items: resolved.map((item, index) => ({ id: index + 1, ...item })),
  };

  state().orders.push(order);
  persist();

  return {
    order: {
      id: order.id,
      code: order.code,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      status: order.status,
      createdAt: order.createdAt,
    },
  };
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/* ---------------------------------------------------------------------- */
/* Painel: pedidos                                                        */
/* ---------------------------------------------------------------------- */
export function listOrders(filters = {}) {
  const { status, search, from, to } = filters;
  let rows = state().orders.slice();

  if (status && STATUSES.includes(status)) rows = rows.filter((o) => o.status === status);
  if (from) rows = rows.filter((o) => o.createdAt >= `${from} 00:00:00`);
  if (to) rows = rows.filter((o) => o.createdAt <= `${to} 23:59:59`);
  if (search) {
    const term = String(search).toLowerCase();
    rows = rows.filter(
      (o) =>
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.code.toLowerCase().includes(term),
    );
  }

  return rows
    .sort((a, b) => b.id - a.id)
    .slice(0, 500)
    .map((o) => mapOrder(o));
}

export function getOrder(id) {
  return mapOrder(state().orders.find((o) => o.id === Number(id)));
}

export function updateOrder(id, payload = {}) {
  const order = state().orders.find((o) => o.id === Number(id));
  if (!order) throw httpError(404, 'Pedido não encontrado.');

  if (STATUSES.includes(payload.status)) order.status = payload.status;
  if (payload.notes !== undefined) order.notes = String(payload.notes).slice(0, 600);
  if (PAYMENTS.includes(payload.paymentMethod)) order.paymentMethod = payload.paymentMethod;
  if (payload.deliveryFee !== undefined) order.deliveryFee = money(Math.max(0, Number(payload.deliveryFee) || 0));
  if (payload.discount !== undefined) order.discount = money(Math.max(0, Number(payload.discount) || 0));

  order.subtotal = money(order.subtotal);
  order.total = money(Math.max(0, order.subtotal + order.deliveryFee - order.discount));
  order.profit = money(order.total - order.cost);
  order.updatedAt = nowSQL();

  persist();
  return mapOrder(order);
}

export function deleteOrder(id) {
  const rows = state().orders;
  const index = rows.findIndex((o) => o.id === Number(id));
  if (index >= 0) rows.splice(index, 1);
  persist();
  return { ok: true };
}

export function listCustomers() {
  const groups = new Map();
  for (const order of state().orders) {
    if (order.status === 'cancelado') continue;
    const key = order.customerPhone;
    const current = groups.get(key) ?? {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      orders: 0,
      spent: 0,
      cost: 0,
      lastOrder: '',
    };
    current.orders += 1;
    current.spent += order.total;
    current.cost += order.cost;
    if (order.createdAt > current.lastOrder) {
      current.lastOrder = order.createdAt;
      current.name = order.customerName;
      current.email = order.customerEmail || current.email;
    }
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((c) => ({
      ...c,
      spent: money(c.spent),
      cost: money(c.cost),
      profit: money(c.spent - c.cost),
      avgTicket: c.orders ? money(c.spent / c.orders) : 0,
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 300);
}

/* ---------------------------------------------------------------------- */
/* Painel: financeiro                                                     */
/* ---------------------------------------------------------------------- */
const resolveRange = (query = {}) => {
  const now = new Date();
  const to = query.to || today();
  let from = query.from;
  if (!from) {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    from = d.toISOString().slice(0, 10);
  }
  return { from, to };
};

export function getDashboard(query = {}) {
  const { from, to } = resolveRange(query);
  const orders = state().orders.filter(
    (o) => o.status !== 'cancelado' && o.createdAt >= `${from} 00:00:00` && o.createdAt <= `${to} 23:59:59`,
  );

  const revenue = money(orders.reduce((s, o) => s + o.total, 0));
  const productCost = money(orders.reduce((s, o) => s + o.cost, 0));
  const expenseTotal = money(
    state().expenses.filter((e) => e.date >= from && e.date <= to).reduce((s, e) => s + e.amount, 0),
  );
  const grossProfit = money(revenue - productCost);
  const netProfit = money(grossProfit - expenseTotal);
  const orderCount = orders.length;
  const itemsSold = orders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0);

  const dayMap = new Map();
  for (const order of orders) {
    const day = order.createdAt.slice(0, 10);
    const current = dayMap.get(day) ?? { day, orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.total;
    dayMap.set(day, current);
  }

  const productMap = new Map();
  const categoryMap = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      const current = productMap.get(item.name) ?? { name: item.name, qty: 0, revenue: 0, profit: 0 };
      current.qty += item.qty;
      current.revenue += item.total;
      current.profit += item.total - item.unitCost * item.qty;
      productMap.set(item.name, current);

      const product = state().products.find((p) => p.id === item.productId);
      const category = product?.category || 'outros';
      const cat = categoryMap.get(category) ?? { category, qty: 0, revenue: 0 };
      cat.qty += item.qty;
      cat.revenue += item.total;
      categoryMap.set(category, cat);
    }
  }

  const paymentMap = new Map();
  for (const order of orders) {
    const current = paymentMap.get(order.paymentMethod) ?? { method: order.paymentMethod, orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.total;
    paymentMap.set(order.paymentMethod, current);
  }

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const order of state().orders) {
    if (order.createdAt >= `${from} 00:00:00` && order.createdAt <= `${to} 23:59:59`) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }
  }

  return {
    range: { from, to },
    kpi: {
      revenue,
      productCost,
      expenses: expenseTotal,
      grossProfit,
      netProfit,
      margin: revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0,
      orders: orderCount,
      itemsSold,
      avgTicket: orderCount ? money(revenue / orderCount) : 0,
      pending: state().orders.filter((o) => ['novo', 'confirmado', 'producao'].includes(o.status)).length,
    },
    byDay: [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day)).map((d) => ({ ...d, revenue: money(d.revenue) })),
    topProducts: [...productMap.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)
      .map((p) => ({ ...p, revenue: money(p.revenue), profit: money(p.profit) })),
    byCategory: [...categoryMap.values()].sort((a, b) => b.revenue - a.revenue).map((c) => ({ ...c, revenue: money(c.revenue) })),
    byPayment: [...paymentMap.values()].sort((a, b) => b.revenue - a.revenue).map((p) => ({ ...p, revenue: money(p.revenue) })),
    statusCounts,
    recentOrders: state()
      .orders.slice()
      .sort((a, b) => b.id - a.id)
      .slice(0, 8)
      .map((o) => mapOrder(o, { withItems: false })),
  };
}

export function listExpenses(query = {}) {
  const { from, to } = query;
  let rows = state().expenses.slice();
  if (from) rows = rows.filter((e) => e.date >= from);
  if (to) rows = rows.filter((e) => e.date <= to);
  rows.sort((a, b) => (a.date === b.date ? b.id - a.id : b.date.localeCompare(a.date)));

  const byCategory = {};
  for (const row of rows) byCategory[row.category] = money((byCategory[row.category] || 0) + row.amount);

  return { expenses: clone(rows), total: money(rows.reduce((s, r) => s + r.amount, 0)), byCategory };
}

export function createExpense(body = {}) {
  const description = String(body.description ?? '').trim();
  const amount = Math.max(0, Number(body.amount) || 0);
  if (!description) throw httpError(400, 'Descreva a despesa.');
  if (amount <= 0) throw httpError(400, 'Informe um valor maior que zero.');

  const expense = {
    id: nextId(state().expenses),
    date: String(body.date ?? today()),
    description,
    category: String(body.category ?? 'Insumos'),
    amount,
    notes: String(body.notes ?? ''),
    orderId: null,
  };
  state().expenses.push(expense);
  persist();
  return { id: expense.id };
}

export function updateExpense(id, body = {}) {
  const expense = state().expenses.find((e) => e.id === Number(id));
  if (!expense) throw httpError(404, 'Despesa não encontrada.');
  expense.date = String(body.date ?? today());
  expense.description = String(body.description ?? '').trim();
  expense.category = String(body.category ?? 'Insumos');
  expense.amount = Math.max(0, Number(body.amount) || 0);
  expense.notes = String(body.notes ?? '');
  persist();
  return { ok: true };
}

export function deleteExpense(id) {
  const rows = state().expenses;
  const index = rows.findIndex((e) => e.id === Number(id));
  if (index >= 0) rows.splice(index, 1);
  persist();
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Painel: produtos e configurações                                       */
/* ---------------------------------------------------------------------- */
export function listAdminProducts() {
  return {
    products: state()
      .products.slice()
      .sort((a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder || a.id - b.id)
      .map(mapProduct),
    categories: CATEGORIES,
  };
}

function readProductBody(body = {}, existing = {}) {
  const name = String(body.name ?? existing.name ?? '').trim();
  const slug = String(body.slug ?? '').trim() || slugify(name);
  const price = Math.max(0, Number(body.price ?? existing.price ?? 0) || 0);
  const rawPromo = body.promoPrice ?? existing.promoPrice;
  const promo =
    rawPromo === '' || rawPromo === null || rawPromo === undefined ? null : Math.max(0, Number(rawPromo) || 0);
  const rawStock = body.stock ?? existing.stock;
  const stock =
    rawStock === '' || rawStock === null || rawStock === undefined ? null : Math.max(0, Number(rawStock) || 0);
  const gallery = Array.isArray(body.gallery) ? body.gallery.filter(Boolean).slice(0, 6) : [];

  return {
    name,
    slug,
    category: String(body.category ?? existing.category ?? 'brownies'),
    shortDesc: String(body.shortDesc ?? existing.shortDesc ?? '').slice(0, 220),
    description: String(body.description ?? existing.description ?? ''),
    price,
    promoPrice: promo,
    cost: Math.max(0, Number(body.cost ?? existing.cost ?? 0) || 0),
    unit: String(body.unit ?? existing.unit ?? 'unidade').slice(0, 80),
    image: String(body.image ?? existing.image ?? '').slice(0, 500),
    gallery: JSON.stringify(gallery),
    tags: JSON.stringify(Array.isArray(body.tags) ? body.tags.filter(Boolean).slice(0, 8) : []),
    shippingScope: body.shippingScope === 'local' ? 'local' : 'nacional',
    stock,
    active: body.active === undefined ? existing.active ?? true : !!body.active,
    featured: body.featured === undefined ? existing.featured ?? false : !!body.featured,
    sortOrder: Number(body.sortOrder ?? existing.sortOrder ?? 0) || 0,
  };
}

export function createProduct(body = {}) {
  const data = readProductBody(body);
  if (!data.name) throw httpError(400, 'Informe o nome do produto.');
  if (data.price <= 0) throw httpError(400, 'Informe um preço maior que zero.');

  if (state().products.some((p) => p.slug === data.slug)) {
    data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
  }

  const product = { id: nextId(state().products), ...data };
  state().products.push(product);
  persist();
  return mapProduct(product);
}

export function updateProduct(id, body = {}) {
  const index = state().products.findIndex((p) => p.id === Number(id));
  if (index < 0) throw httpError(404, 'Produto não encontrado.');

  const data = readProductBody(body, state().products[index]);
  if (!data.name) throw httpError(400, 'Informe o nome do produto.');
  if (state().products.some((p) => p.slug === data.slug && p.id !== Number(id))) {
    data.slug = `${data.slug}-${id}`;
  }

  state().products[index] = { id: Number(id), ...data };
  persist();
  return mapProduct(state().products[index]);
}

export function deleteProduct(id) {
  const rows = state().products;
  const index = rows.findIndex((p) => p.id === Number(id));
  if (index >= 0) rows.splice(index, 1);
  persist();
  return { ok: true };
}

export function saveSettings(payload = {}) {
  for (const [key, value] of Object.entries(payload)) {
    if (!/^[a-z0-9_]{2,50}$/i.test(key)) continue;
    state().settings[key] = String(value ?? '');
  }
  persist();
  return getSettings();
}

/* ---------------------------------------------------------------------- */
/* Sessão do painel (demonstração)                                        */
/* ---------------------------------------------------------------------- */
export function login(email, password) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized || !password) throw httpError(400, 'Informe e-mail e senha.');
  if (normalized !== DEMO_ADMIN.email.toLowerCase() || String(password) !== state().password) {
    throw httpError(401, 'E-mail ou senha inválidos.');
  }
  state().loggedIn = true;
  persist();
  return { admin: { ...DEMO_ADMIN } };
}

export function logout() {
  state().loggedIn = false;
  persist();
  return { ok: true };
}

export function currentAdmin() {
  return state().loggedIn ? { ...DEMO_ADMIN } : null;
}

export function changePassword(currentPassword, newPassword) {
  if (String(newPassword ?? '').length < 6) {
    throw httpError(400, 'A nova senha precisa ter ao menos 6 caracteres.');
  }
  if (String(currentPassword ?? '') !== state().password) throw httpError(401, 'Senha atual incorreta.');
  state().password = String(newPassword);
  persist();
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Exportação CSV (mesmas colunas do servidor)                            */
/* ---------------------------------------------------------------------- */
export function ordersCSV() {
  const header = [
    'codigo', 'data', 'status', 'cliente', 'telefone', 'email',
    'entrega', 'endereco', 'bairro', 'cidade', 'pagamento',
    'subtotal', 'frete', 'desconto', 'total', 'custo', 'lucro',
  ].join(';');

  const lines = state()
    .orders.slice()
    .sort((a, b) => b.id - a.id)
    .map((r) =>
      [
        r.code,
        r.createdAt,
        r.status,
        r.customerName,
        r.customerPhone,
        r.customerEmail,
        r.deliveryType === 'pickup' ? 'Retirada' : 'Entrega',
        `${r.address?.address ?? ''} ${r.address?.addressNumber ?? ''} ${r.address?.complement ?? ''}`.trim(),
        r.address?.district ?? '',
        `${r.address?.city ?? ''}/${r.address?.state ?? ''}`,
        r.paymentMethod,
        Number(r.subtotal).toFixed(2).replace('.', ','),
        Number(r.deliveryFee).toFixed(2).replace('.', ','),
        Number(r.discount).toFixed(2).replace('.', ','),
        Number(r.total).toFixed(2).replace('.', ','),
        Number(r.cost).toFixed(2).replace('.', ','),
        Number(r.total - r.cost).toFixed(2).replace('.', ','),
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    );

  return '\uFEFF' + [header, ...lines].join('\n');
}
