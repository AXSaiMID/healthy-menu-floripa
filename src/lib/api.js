import * as staticApi from './static/api.js';

/**
 * Modo estático x modo servidor.
 *
 * - `npm run build`          → API HTTP (Express + SQLite, /api/…)
 * - `npm run build:netlify`  → API local no navegador (host só de arquivos)
 *
 * Fora do build estático a constante vira `false` e o bundle descarta o ramo.
 */
const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === 'true';

export const isStaticMode = STATIC_MODE;

/** Contador de pedidos/estoque vive no navegador: dá para voltar ao exemplo. */
export const resetDemoData = STATIC_MODE ? staticApi.resetDemoData : null;

const BASE = '/api';

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const isJSON = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJSON ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || 'Não foi possível completar a solicitação.');
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

const httpPublicApi = {
  bootstrap: () => api.get('/public/bootstrap'),
  settings: () => api.get('/public/settings'),
  products: () => api.get('/public/products'),
  createOrder: (payload) => api.post('/public/orders', payload),
};

const httpAuthApi = {
  me: () => api.get('/auth/me'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

const httpAdminApi = {
  dashboard: (range = {}) => {
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    const qs = params.toString();
    return api.get(`/admin/dashboard${qs ? `?${qs}` : ''}`);
  },
  orders: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  order: (id) => api.get(`/admin/orders/${id}`),
  updateOrder: (id, payload) => api.put(`/admin/orders/${id}`, payload),
  deleteOrder: (id) => api.del(`/admin/orders/${id}`),
  customers: () => api.get('/admin/customers'),
  products: () => api.get('/admin/products'),
  createProduct: (payload) => api.post('/admin/products', payload),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload),
  deleteProduct: (id) => api.del(`/admin/products/${id}`),
  expenses: (range = {}) => {
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    const qs = params.toString();
    return api.get(`/admin/expenses${qs ? `?${qs}` : ''}`);
  },
  createExpense: (payload) => api.post('/admin/expenses', payload),
  updateExpense: (id, payload) => api.put(`/admin/expenses/${id}`, payload),
  deleteExpense: (id) => api.del(`/admin/expenses/${id}`),
  settings: () => api.get('/admin/settings'),
  saveSettings: (payload) => api.put('/admin/settings', payload),
};

async function httpDownloadOrdersCSV() {
  const response = await fetch(`${BASE}/admin/orders/export.csv`, { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Não foi possível exportar os pedidos.');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pedidos-healthy-menu-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------------- */
/* Despacho: API HTTP (servidor) ou API local (host estático)             */
/* ---------------------------------------------------------------------- */
export const publicApi = STATIC_MODE ? staticApi.publicApi : httpPublicApi;
export const authApi = STATIC_MODE ? staticApi.authApi : httpAuthApi;
export const adminApi = STATIC_MODE ? staticApi.adminApi : httpAdminApi;
export const downloadOrdersCSV = STATIC_MODE ? staticApi.downloadOrdersCSV : httpDownloadOrdersCSV;
