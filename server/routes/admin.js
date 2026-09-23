import express from 'express';
import { all, get, run } from '../db.js';
import { requireAdmin } from '../auth.js';
import { mapProduct, money, STATUSES, PAYMENTS } from './public.js';

const router = express.Router();
router.use(requireAdmin);

const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || `produto-${Date.now()}`;

const parseJSON = (value) => {
  try {
    return JSON.parse(value ?? '[]');
  } catch {
    return [];
  }
};

function mapOrder(row, { withItems = true } = {}) {
  if (!row) return null;
  const order = {
    id: row.id,
    code: row.code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    customerCpf: row.customer_cpf,
    deliveryType: row.delivery_type,
    address: {
      zip: row.zip,
      address: row.address,
      addressNumber: row.address_number,
      complement: row.complement,
      district: row.district,
      city: row.city,
      state: row.state,
    },
    notes: row.notes,
    paymentMethod: row.payment_method,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discount: row.discount,
    total: row.total,
    cost: row.cost,
    profit: money(row.total - row.cost),
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (withItems) {
    order.items = all(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
      [row.id],
    ).map((i) => ({
      id: i.id,
      productId: i.product_id,
      name: i.name,
      unit: i.unit,
      unitPrice: i.unit_price,
      unitCost: i.unit_cost,
      qty: i.qty,
      total: i.total,
    }));
  }
  return order;
}

function resolveRange(query) {
  const now = new Date();
  const to = query.to || now.toISOString().slice(0, 10);
  let from = query.from;
  if (!from) {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    from = d.toISOString().slice(0, 10);
  }
  return { from, to };
}

const validStatus = (s) => STATUSES.includes(s);

/* ------------------------------ GET /dashboard ------------------------------ */
router.get('/dashboard', (req, res) => {
  const { from, to } = resolveRange(req.query);
  const range = [`${from} 00:00:00`, `${to} 23:59:59`];

  const scope = "status != 'cancelado'";
  const totals = get(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue,
            COALESCE(SUM(cost),0) AS productCost, COALESCE(SUM(discount),0) AS discount,
            COALESCE(SUM(delivery_fee),0) AS fees
       FROM orders WHERE ${scope} AND created_at BETWEEN ? AND ?`,
    range,
  );

  const expenses = get(
    'SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE date BETWEEN ? AND ?',
    [from, to],
  );

  const itemsSold = get(
    `SELECT COALESCE(SUM(oi.qty),0) AS qty
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.${scope} AND o.created_at BETWEEN ? AND ?`,
    range,
  );

  const revenue = money(totals.revenue);
  const productCost = money(totals.productCost);
  const expenseTotal = money(expenses.total);
  const grossProfit = money(revenue - productCost);
  const netProfit = money(grossProfit - expenseTotal);
  const orderCount = totals.orders || 0;

  const byDay = all(
    `SELECT substr(created_at,1,10) AS day, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
       FROM orders WHERE ${scope} AND created_at BETWEEN ? AND ?
      GROUP BY day ORDER BY day`,
    range,
  ).map((r) => ({ day: r.day, orders: r.orders, revenue: money(r.revenue) }));

  const topProducts = all(
    `SELECT oi.name, SUM(oi.qty) AS qty, SUM(oi.total) AS revenue, SUM(oi.total - oi.unit_cost*oi.qty) AS profit
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.${scope} AND o.created_at BETWEEN ? AND ?
      GROUP BY oi.name ORDER BY qty DESC LIMIT 8`,
    range,
  ).map((r) => ({ name: r.name, qty: r.qty, revenue: money(r.revenue), profit: money(r.profit) }));

  const byCategory = all(
    `SELECT p.category AS category, SUM(oi.qty) AS qty, SUM(oi.total) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.${scope} AND o.created_at BETWEEN ? AND ?
      GROUP BY p.category ORDER BY revenue DESC`,
    range,
  ).map((r) => ({ category: r.category || 'outros', qty: r.qty, revenue: money(r.revenue) }));

  const byPayment = all(
    `SELECT payment_method AS method, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
       FROM orders WHERE ${scope} AND created_at BETWEEN ? AND ?
      GROUP BY method ORDER BY revenue DESC`,
    range,
  ).map((r) => ({ method: r.method, orders: r.orders, revenue: money(r.revenue) }));

  const byStatus = all(
    `SELECT status, COUNT(*) AS n FROM orders WHERE created_at BETWEEN ? AND ? GROUP BY status`,
    range,
  );

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const row of byStatus) statusCounts[row.status] = row.n;

  const pending = get(
    "SELECT COUNT(*) AS n FROM orders WHERE status IN ('novo','confirmado','producao')",
  )?.n ?? 0;

  const recentOrders = all(
    'SELECT * FROM orders ORDER BY id DESC LIMIT 8',
  ).map((r) => mapOrder(r, { withItems: false }));

  res.json({
    range: { from, to },
    kpi: {
      revenue,
      productCost,
      expenses: expenseTotal,
      grossProfit,
      netProfit,
      margin: revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0,
      orders: orderCount,
      itemsSold: itemsSold.qty || 0,
      avgTicket: orderCount ? money(revenue / orderCount) : 0,
      pending,
    },
    byDay,
    topProducts,
    byCategory,
    byPayment,
    statusCounts,
    recentOrders,
  });
});

/* --------------------------- GET /orders/export.csv -------------------------- */
router.get('/orders/export.csv', (req, res) => {
  const rows = all('SELECT * FROM orders ORDER BY id DESC');
  const header = [
    'codigo', 'data', 'status', 'cliente', 'telefone', 'email',
    'entrega', 'endereco', 'bairro', 'cidade', 'pagamento',
    'subtotal', 'frete', 'desconto', 'total', 'custo', 'lucro',
  ].join(';');

  const lines = rows.map((r) =>
    [
      r.code,
      r.created_at,
      r.status,
      r.customer_name,
      r.customer_phone,
      r.customer_email,
      r.delivery_type === 'pickup' ? 'Retirada' : 'Entrega',
      `${r.address} ${r.address_number} ${r.complement}`.trim(),
      r.district,
      `${r.city}/${r.state}`,
      r.payment_method,
      r.subtotal.toFixed(2).replace('.', ','),
      r.delivery_fee.toFixed(2).replace('.', ','),
      r.discount.toFixed(2).replace('.', ','),
      r.total.toFixed(2).replace('.', ','),
      r.cost.toFixed(2).replace('.', ','),
      (r.total - r.cost).toFixed(2).replace('.', ','),
    ]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(';'),
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="pedidos-healthy-menu-${Date.now()}.csv"`);
  res.send('\uFEFF' + [header, ...lines].join('\n'));
});

/* -------------------------------- GET /orders ------------------------------- */
router.get('/orders', (req, res) => {
  const { status, search, from, to } = req.query;
  const where = [];
  const params = [];

  if (status && validStatus(status)) {
    where.push('status = ?');
    params.push(status);
  }
  if (from) {
    where.push('created_at >= ?');
    params.push(`${from} 00:00:00`);
  }
  if (to) {
    where.push('created_at <= ?');
    params.push(`${to} 23:59:59`);
  }
  if (search) {
    where.push('(customer_name LIKE ? OR customer_phone LIKE ? OR code LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = all(`SELECT * FROM orders ${clause} ORDER BY id DESC LIMIT 500`, params);
  res.json(rows.map((r) => mapOrder(r)));
});

router.get('/orders/:id', (req, res) => {
  const row = get('SELECT * FROM orders WHERE id = ?', [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json(mapOrder(row));
});

router.put('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = get('SELECT * FROM orders WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const body = req.body ?? {};
  const status = validStatus(body.status) ? body.status : existing.status;
  const notes = body.notes !== undefined ? String(body.notes).slice(0, 600) : existing.notes;
  const paymentMethod = PAYMENTS.includes(body.paymentMethod)
    ? body.paymentMethod
    : existing.payment_method;
  const deliveryFee =
    body.deliveryFee !== undefined ? money(Math.max(0, Number(body.deliveryFee) || 0)) : existing.delivery_fee;
  const discount =
    body.discount !== undefined ? money(Math.max(0, Number(body.discount) || 0)) : existing.discount;
  const total = money(Math.max(0, existing.subtotal + deliveryFee - discount));

  run(
    `UPDATE orders
        SET status = ?, notes = ?, payment_method = ?, delivery_fee = ?, discount = ?, total = ?,
            updated_at = datetime('now')
      WHERE id = ?`,
    [status, notes, paymentMethod, deliveryFee, discount, total, id],
  );

  res.json(mapOrder(get('SELECT * FROM orders WHERE id = ?', [id])));
});

router.delete('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  run('DELETE FROM orders WHERE id = ?', [id]);
  res.json({ ok: true });
});

/* ------------------------------- GET /customers ------------------------------ */
router.get('/customers', (_req, res) => {
  const rows = all(`
    SELECT customer_name AS name, customer_phone AS phone, customer_email AS email,
           COUNT(*) AS orders, COALESCE(SUM(total),0) AS spent, MAX(created_at) AS lastOrder,
           COALESCE(SUM(cost),0) AS cost
      FROM orders
     WHERE status != 'cancelado'
     GROUP BY customer_phone
     ORDER BY spent DESC
     LIMIT 300
  `);
  res.json(
    rows.map((r) => ({
      ...r,
      spent: money(r.spent),
      cost: money(r.cost),
      profit: money(r.spent - r.cost),
      avgTicket: r.orders ? money(r.spent / r.orders) : 0,
    })),
  );
});

/* -------------------------------- Categorias -------------------------------- */
const CATEGORIES = [
  { id: 'brownies', label: 'Brownies' },
  { id: 'combos', label: 'Combos & Presentes' },
  { id: 'salgados', label: 'Salgados & Wraps' },
  { id: 'refeicoes', label: 'Refeições Fit' },
  { id: 'zero-acucar', label: 'Zero Açúcar' },
  { id: 'bebidas', label: 'Bebidas' },
];

/* ------------------------------- Produtos CRUD ------------------------------- */
router.get('/products', (_req, res) => {
  const rows = all('SELECT * FROM products ORDER BY category, sort_order, id');
  res.json({ products: rows.map(mapProduct), categories: CATEGORIES });
});

function readProductBody(body, existing = {}) {
  const name = String(body.name ?? existing.name ?? '').trim();
  const slug = String(body.slug ?? '').trim() || slugify(name);
  const price = Math.max(0, Number(body.price ?? existing.price ?? 0) || 0);
  const rawPromo = body.promoPrice ?? existing.promo_price;
  const promo = rawPromo === '' || rawPromo === null || rawPromo === undefined ? null : Math.max(0, Number(rawPromo) || 0);
  const rawStock = body.stock ?? existing.stock;
  const stock = rawStock === '' || rawStock === null || rawStock === undefined ? null : Math.max(0, Number(rawStock) || 0);
  const gallery = Array.isArray(body.gallery) ? body.gallery.filter(Boolean).slice(0, 6) : [];

  return {
    name,
    slug,
    category: String(body.category ?? existing.category ?? 'brownies'),
    short_desc: String(body.shortDesc ?? existing.short_desc ?? '').slice(0, 220),
    description: String(body.description ?? existing.description ?? ''),
    price,
    promo_price: promo,
    cost: Math.max(0, Number(body.cost ?? existing.cost ?? 0) || 0),
    unit: String(body.unit ?? existing.unit ?? 'unidade').slice(0, 80),
    image_url: String(body.image ?? existing.image_url ?? '').slice(0, 500),
    gallery: JSON.stringify(gallery),
    tags: JSON.stringify(Array.isArray(body.tags) ? body.tags.filter(Boolean).slice(0, 8) : []),
    shipping_scope: body.shippingScope === 'local' ? 'local' : 'nacional',
    stock,
    active: body.active === undefined ? (existing.active ?? 1) : body.active ? 1 : 0,
    featured: body.featured === undefined ? (existing.featured ?? 0) : body.featured ? 1 : 0,
    sort_order: Number(body.sortOrder ?? existing.sort_order ?? 0) || 0,
  };
}

router.post('/products', (req, res) => {
  const data = readProductBody(req.body ?? {});
  if (!data.name) return res.status(400).json({ error: 'Informe o nome do produto.' });
  if (data.price <= 0) return res.status(400).json({ error: 'Informe um preço maior que zero.' });

  const dupe = get('SELECT id FROM products WHERE slug = ?', [data.slug]);
  if (dupe) data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;

  const result = run(
    `INSERT INTO products
      (name, slug, category, short_desc, description, price, promo_price, cost, unit,
       image_url, gallery, tags, shipping_scope, stock, active, featured, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.name, data.slug, data.category, data.short_desc, data.description, data.price,
      data.promo_price, data.cost, data.unit, data.image_url, data.gallery, data.tags,
      data.shipping_scope, data.stock, data.active, data.featured, data.sort_order,
    ],
  );

  const row = get('SELECT * FROM products WHERE id = ?', [Number(result.lastInsertRowid)]);
  res.status(201).json(mapProduct(row));
});

router.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = get('SELECT * FROM products WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ error: 'Produto não encontrado.' });

  const data = readProductBody(req.body ?? {}, existing);
  if (!data.name) return res.status(400).json({ error: 'Informe o nome do produto.' });

  const dupe = get('SELECT id FROM products WHERE slug = ? AND id != ?', [data.slug, id]);
  if (dupe) data.slug = `${data.slug}-${id}`;

  run(
    `UPDATE products SET
        name = ?, slug = ?, category = ?, short_desc = ?, description = ?, price = ?,
        promo_price = ?, cost = ?, unit = ?, image_url = ?, gallery = ?, tags = ?,
        shipping_scope = ?, stock = ?, active = ?, featured = ?, sort_order = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
    [
      data.name, data.slug, data.category, data.short_desc, data.description, data.price,
      data.promo_price, data.cost, data.unit, data.image_url, data.gallery, data.tags,
      data.shipping_scope, data.stock, data.active, data.featured, data.sort_order, id,
    ],
  );

  res.json(mapProduct(get('SELECT * FROM products WHERE id = ?', [id])));
});

router.delete('/products/:id', (req, res) => {
  run('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
  res.json({ ok: true });
});

/* --------------------------------- Despesas --------------------------------- */
router.get('/expenses', (req, res) => {
  const { from, to } = req.query;
  const where = [];
  const params = [];
  if (from) {
    where.push('date >= ?');
    params.push(from);
  }
  if (to) {
    where.push('date <= ?');
    params.push(to);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = all(`SELECT * FROM expenses ${clause} ORDER BY date DESC, id DESC`, params);

  const byCategory = {};
  for (const row of rows) byCategory[row.category] = money((byCategory[row.category] || 0) + row.amount);

  res.json({
    expenses: rows.map((r) => ({
      id: r.id,
      date: r.date,
      description: r.description,
      category: r.category,
      amount: r.amount,
      notes: r.notes,
      orderId: r.order_id,
    })),
    total: money(rows.reduce((s, r) => s + r.amount, 0)),
    byCategory,
  });
});

router.post('/expenses', (req, res) => {
  const body = req.body ?? {};
  const description = String(body.description ?? '').trim();
  const amount = Math.max(0, Number(body.amount) || 0);
  if (!description) return res.status(400).json({ error: 'Descreva a despesa.' });
  if (amount <= 0) return res.status(400).json({ error: 'Informe um valor maior que zero.' });

  const result = run(
    'INSERT INTO expenses (date, description, category, amount, notes) VALUES (?,?,?,?,?)',
    [
      String(body.date ?? new Date().toISOString().slice(0, 10)),
      description,
      String(body.category ?? 'Insumos'),
      amount,
      String(body.notes ?? ''),
    ],
  );
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

router.put('/expenses/:id', (req, res) => {
  const body = req.body ?? {};
  run('UPDATE expenses SET date = ?, description = ?, category = ?, amount = ?, notes = ? WHERE id = ?', [
    String(body.date ?? new Date().toISOString().slice(0, 10)),
    String(body.description ?? '').trim(),
    String(body.category ?? 'Insumos'),
    Math.max(0, Number(body.amount) || 0),
    String(body.notes ?? ''),
    Number(req.params.id),
  ]);
  res.json({ ok: true });
});

router.delete('/expenses/:id', (req, res) => {
  run('DELETE FROM expenses WHERE id = ?', [Number(req.params.id)]);
  res.json({ ok: true });
});

/* ------------------------------- Configurações ------------------------------ */
router.get('/settings', (_req, res) => {
  const rows = all('SELECT key, value FROM settings');
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  res.json(out);
});

router.put('/settings', (req, res) => {
  const body = req.body ?? {};
  for (const [key, value] of Object.entries(body)) {
    if (!/^[a-z0-9_]{2,50}$/i.test(key)) continue;
    const exists = get('SELECT key FROM settings WHERE key = ?', [key]);
    if (exists) run('UPDATE settings SET value = ? WHERE key = ?', [String(value ?? ''), key]);
    else run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, String(value ?? '')]);
  }
  const rows = all('SELECT key, value FROM settings');
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  res.json(out);
});

export { CATEGORIES };
export default router;
