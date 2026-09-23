import express from 'express';
import { all, get, run } from '../db.js';

const router = express.Router();

const parseJSON = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    shortDesc: row.short_desc,
    description: row.description,
    price: row.price,
    promoPrice: row.promo_price,
    finalPrice: row.promo_price && row.promo_price > 0 ? row.promo_price : row.price,
    cost: row.cost,
    unit: row.unit,
    image: row.image_url,
    gallery: parseJSON(row.gallery),
    tags: parseJSON(row.tags),
    shippingScope: row.shipping_scope,
    stock: row.stock,
    active: !!row.active,
    featured: !!row.featured,
    sortOrder: row.sort_order,
  };
}

export function getSettings() {
  const rows = all('SELECT key, value FROM settings');
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  return out;
}

export const money = (n) => Math.round(Number(n) * 100) / 100;

/* ---------------------- GET /api/public/bootstrap ---------------------- */
/** Um único request entrega configurações + categorias + vitrine. */
router.get('/bootstrap', (_req, res) => {
  const products = all(
    'SELECT * FROM products WHERE active = 1 ORDER BY category, sort_order, id',
  ).map(mapProduct);

  res.json({ settings: getSettings(), products: [...products].sort((a, b) => a.id - b.id) });
});

router.get('/products', (req, res) => {
  const { category } = req.query;
  const rows = category
    ? all('SELECT * FROM products WHERE active = 1 AND category = ? ORDER BY sort_order, id', [category])
    : all('SELECT * FROM products WHERE active = 1 ORDER BY category, sort_order, id');
  res.json(rows.map(mapProduct));
});

router.get('/products/:slug', (req, res) => {
  const row = get('SELECT * FROM products WHERE slug = ? AND active = 1', [req.params.slug]);
  if (!row) return res.status(404).json({ error: 'Produto não encontrado.' });
  res.json(mapProduct(row));
});

router.get('/settings', (_req, res) => res.json(getSettings()));

/* --------------------------- POST /api/orders --------------------------- */
const STATUSES = ['novo', 'confirmado', 'producao', 'enviado', 'entregue', 'cancelado'];
const PAYMENTS = ['pix', 'dinheiro', 'cartao', 'link'];

function nextOrderCode() {
  const row = get('SELECT COUNT(*) AS n FROM orders');
  const seq = (row?.n ?? 0) + 1;
  return `HM-${String(seq).padStart(4, '0')}`;
}

router.post('/orders', (req, res) => {
  const body = req.body ?? {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) {
    return res.status(400).json({ error: 'Seu carrinho está vazio.' });
  }

  const name = String(body.customer?.name ?? '').trim();
  const phone = String(body.customer?.phone ?? '').replace(/\D/g, '');

  if (name.length < 3) return res.status(400).json({ error: 'Informe o nome completo.' });
  if (phone.length < 10) return res.status(400).json({ error: 'Informe um WhatsApp válido com DDD.' });

  const deliveryType = body.deliveryType === 'pickup' ? 'pickup' : 'delivery';
  if (deliveryType === 'delivery') {
    const required = ['zip', 'address', 'addressNumber', 'district', 'city'];
    for (const field of required) {
      if (!String(body.address?.[field] ?? '').trim()) {
        return res.status(400).json({ error: 'Preencha o endereço de entrega completo.' });
      }
    }
  }

  /* Preços sempre recalculados no servidor — nunca confiamos no cliente. */
  const resolved = [];
  for (const item of items) {
    const product = get('SELECT * FROM products WHERE id = ? AND active = 1', [Number(item.productId)]);
    if (!product) continue;
    const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
    const unitPrice = money(
      product.promo_price && product.promo_price > 0 ? product.promo_price : product.price,
    );
    resolved.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      unitPrice,
      unitCost: money(product.cost),
      qty,
      total: money(unitPrice * qty),
      shippingScope: product.shipping_scope,
    });
  }

  if (!resolved.length) {
    return res.status(400).json({ error: 'Os produtos do carrinho não estão mais disponíveis.' });
  }

  const settings = getSettings();
  const subtotal = money(resolved.reduce((sum, i) => sum + i.total, 0));
  const cost = money(resolved.reduce((sum, i) => sum + i.unitCost * i.qty, 0));

  const onlyLocal = resolved.every((i) => i.shippingScope === 'local');
  const freeFrom = Number(settings.free_delivery_from || 0);
  const baseFee = Number(settings.delivery_fee || 0);

  let deliveryFee = 0;
  if (deliveryType === 'delivery' && !onlyLocal) {
    deliveryFee = freeFrom > 0 && subtotal >= freeFrom ? 0 : baseFee;
  }

  const discount = money(Math.max(0, Number(body.discount) || 0));
  const total = money(Math.max(0, subtotal + deliveryFee - discount));

  const minOrder = Number(settings.min_order || 0);
  if (deliveryType === 'delivery' && !onlyLocal && subtotal < minOrder) {
    return res.status(400).json({
      error: `O pedido mínimo para entrega é ${minOrder.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`,
    });
  }

  const payment = PAYMENTS.includes(body.paymentMethod) ? body.paymentMethod : 'pix';
  const status = 'novo';
  const code = nextOrderCode();

  const result = run(
    `INSERT INTO orders (
       code, customer_name, customer_phone, customer_email, customer_cpf,
       delivery_type, zip, address, address_number, complement, district, city, state,
       notes, payment_method, subtotal, delivery_fee, discount, total, cost, status,
       items_json, source
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      code,
      name,
      phone,
      String(body.customer?.email ?? '').trim(),
      String(body.customer?.cpf ?? '').replace(/\D/g, ''),
      deliveryType,
      String(body.address?.zip ?? '').replace(/\D/g, ''),
      String(body.address?.address ?? '').trim(),
      String(body.address?.addressNumber ?? '').trim(),
      String(body.address?.complement ?? '').trim(),
      String(body.address?.district ?? '').trim(),
      String(body.address?.city ?? '').trim(),
      String(body.address?.state ?? '').trim().toUpperCase().slice(0, 2),
      String(body.notes ?? '').trim().slice(0, 600),
      payment,
      subtotal,
      deliveryFee,
      discount,
      total,
      cost,
      status,
      JSON.stringify(resolved),
      'site',
    ],
  );

  const orderId = Number(result.lastInsertRowid);
  for (const item of resolved) {
    run(
      `INSERT INTO order_items (order_id, product_id, name, unit, unit_price, unit_cost, qty, total)
       VALUES (?,?,?,?,?,?,?,?)`,
      [orderId, item.productId, item.name, item.unit, item.unitPrice, item.unitCost, item.qty, item.total],
    );
  }

  const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);

  res.status(201).json({
    order: {
      id: order.id,
      code: order.code,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      status: order.status,
      createdAt: order.created_at,
    },
  });
});

export { STATUSES, PAYMENTS };
export default router;
