import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.join(__dirname, '..');
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');

fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'healthy-menu.db'));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    slug           TEXT    NOT NULL UNIQUE,
    category       TEXT    NOT NULL DEFAULT 'brownies',
    short_desc     TEXT    NOT NULL DEFAULT '',
    description    TEXT    NOT NULL DEFAULT '',
    price          REAL    NOT NULL DEFAULT 0,
    promo_price    REAL,
    cost           REAL    NOT NULL DEFAULT 0,
    unit           TEXT    NOT NULL DEFAULT 'unidade',
    image_url      TEXT    NOT NULL DEFAULT '',
    gallery        TEXT    NOT NULL DEFAULT '[]',
    tags           TEXT    NOT NULL DEFAULT '[]',
    shipping_scope TEXT    NOT NULL DEFAULT 'nacional',
    stock          INTEGER,
    active         INTEGER NOT NULL DEFAULT 1,
    featured       INTEGER NOT NULL DEFAULT 0,
    sort_order     INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT    NOT NULL UNIQUE,
    customer_name   TEXT    NOT NULL,
    customer_phone  TEXT    NOT NULL,
    customer_email  TEXT    NOT NULL DEFAULT '',
    customer_cpf    TEXT    NOT NULL DEFAULT '',
    delivery_type   TEXT    NOT NULL DEFAULT 'delivery',
    zip             TEXT    NOT NULL DEFAULT '',
    address         TEXT    NOT NULL DEFAULT '',
    address_number  TEXT    NOT NULL DEFAULT '',
    complement      TEXT    NOT NULL DEFAULT '',
    district        TEXT    NOT NULL DEFAULT '',
    city            TEXT    NOT NULL DEFAULT '',
    state           TEXT    NOT NULL DEFAULT '',
    notes           TEXT    NOT NULL DEFAULT '',
    payment_method  TEXT    NOT NULL DEFAULT 'pix',
    subtotal        REAL    NOT NULL DEFAULT 0,
    delivery_fee    REAL    NOT NULL DEFAULT 0,
    discount        REAL    NOT NULL DEFAULT 0,
    total           REAL    NOT NULL DEFAULT 0,
    cost            REAL    NOT NULL DEFAULT 0,
    status          TEXT    NOT NULL DEFAULT 'novo',
    items_json      TEXT    NOT NULL DEFAULT '[]',
    source          TEXT    NOT NULL DEFAULT 'site',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    name       TEXT    NOT NULL,
    unit       TEXT    NOT NULL DEFAULT '',
    unit_price REAL    NOT NULL DEFAULT 0,
    unit_cost  REAL    NOT NULL DEFAULT 0,
    qty        INTEGER NOT NULL DEFAULT 1,
    total      REAL    NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    category    TEXT    NOT NULL DEFAULT 'Insumos',
    amount      REAL    NOT NULL DEFAULT 0,
    notes       TEXT    NOT NULL DEFAULT '',
    order_id    INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
`);

/* ------------------------------------------------------------------ */
/* Migrações leves (adiciona colunas novas em bancos já existentes)     */
/* ------------------------------------------------------------------ */
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('products', 'cost', 'REAL NOT NULL DEFAULT 0');
ensureColumn('orders', 'cost', 'REAL NOT NULL DEFAULT 0');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** node:sqlite não aceita `undefined` nem booleanos como bind. */
export function bind(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params.map(bind));
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params.map(bind));
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params.map(bind));
}

export default db;
