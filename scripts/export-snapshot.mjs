#!/usr/bin/env node
/**
 * Exporta o catálogo real (banco SQLite) para src/lib/static/snapshot.json.
 *
 * Esse arquivo é usado pelo "modo estático": quando o site é publicado em um
 * host que só serve arquivos (Netlify, GitHub Pages, Vercel estático…) não
 * existe servidor Node nem SQLite. O snapshot entra no lugar do banco para que
 * o cardápio, o painel e o financeiro continuem funcionando.
 *
 * Rodar com:  node scripts/export-snapshot.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'healthy-menu.db');
const OUT = path.join(ROOT, 'src', 'lib', 'static', 'snapshot.json');

if (!fs.existsSync(DB_PATH)) {
  console.error(`✖ Banco não encontrado em ${DB_PATH}`);
  console.error('  Rode "npm run seed" antes de gerar o snapshot.');
  process.exit(1);
}

/* Somente leitura: nunca alteramos o banco de trabalho ao exportar. */
const db = new DatabaseSync(DB_PATH, { readOnly: true });
const all = (sql) => db.prepare(sql).all();
const money = (n) => Math.round(Number(n || 0) * 100) / 100;

const parseJSON = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const products = all('SELECT * FROM products ORDER BY id').map((row) => ({
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
}));

const settings = Object.fromEntries(all('SELECT key, value FROM settings').map((r) => [r.key, r.value]));

const itemRows = all('SELECT * FROM order_items ORDER BY id');
const orders = all('SELECT * FROM orders ORDER BY id').map((row) => ({
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
  items: itemRows
    .filter((i) => i.order_id === row.id)
    .map((i) => ({
      id: i.id,
      productId: i.product_id,
      name: i.name,
      unit: i.unit,
      unitPrice: i.unit_price,
      unitCost: i.unit_cost,
      qty: i.qty,
      total: i.total,
    })),
}));

const expenses = all('SELECT * FROM expenses ORDER BY id').map((row) => ({
  id: row.id,
  date: row.date,
  description: row.description,
  category: row.category,
  amount: row.amount,
  notes: row.notes,
  orderId: row.order_id,
}));

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'data/healthymenu.db',
  settings,
  products,
  orders,
  expenses,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log('✔ Snapshot estático gerado');
console.log(`  ${products.length} produtos · ${orders.length} pedidos · ${expenses.length} despesas · ${Object.keys(settings).length} configurações`);
console.log(`  → ${path.relative(ROOT, OUT)} (${kb} kB)`);
