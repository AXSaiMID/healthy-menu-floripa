/**
 * API do "modo estático".
 *
 * Mesmas funções e mesmos formatos de resposta da API HTTP (src/lib/api.js),
 * mas resolvidas no próprio navegador. É isso que permite publicar o site em
 * um host que só serve arquivos (Netlify, GitHub Pages…) sem que nenhuma tela
 * precise ser reescrita.
 */
import * as store from './store.js';

const tick = () => new Promise((resolve) => setTimeout(resolve, 60));

export const publicApi = {
  bootstrap: async () => {
    await tick();
    return { settings: store.getSettings(), products: store.listPublicProducts() };
  },
  settings: async () => {
    await tick();
    return store.getSettings();
  },
  products: async () => {
    await tick();
    return store.listPublicProducts();
  },
  createOrder: async (payload) => {
    await tick();
    return store.createOrder(payload);
  },
};

export const authApi = {
  me: async () => {
    const admin = store.currentAdmin();
    if (!admin) {
      const error = new Error('Não autenticado.');
      error.status = 401;
      throw error;
    }
    return { admin };
  },
  login: async (email, password) => {
    await tick();
    return store.login(email, password);
  },
  logout: async () => {
    await tick();
    return store.logout();
  },
  changePassword: async (currentPassword, newPassword) => {
    await tick();
    return store.changePassword(currentPassword, newPassword);
  },
};

export const adminApi = {
  dashboard: async (range = {}) => {
    await tick();
    return store.getDashboard(range);
  },
  orders: async (filters = {}) => {
    await tick();
    return store.listOrders(filters);
  },
  order: async (id) => {
    await tick();
    const order = store.getOrder(id);
    if (!order) {
      const error = new Error('Pedido não encontrado.');
      error.status = 404;
      throw error;
    }
    return order;
  },
  updateOrder: async (id, payload) => {
    await tick();
    return store.updateOrder(id, payload);
  },
  deleteOrder: async (id) => {
    await tick();
    return store.deleteOrder(id);
  },
  customers: async () => {
    await tick();
    return store.listCustomers();
  },
  products: async () => {
    await tick();
    return store.listAdminProducts();
  },
  createProduct: async (payload) => {
    await tick();
    return store.createProduct(payload);
  },
  updateProduct: async (id, payload) => {
    await tick();
    return store.updateProduct(id, payload);
  },
  deleteProduct: async (id) => {
    await tick();
    return store.deleteProduct(id);
  },
  expenses: async (range = {}) => {
    await tick();
    return store.listExpenses(range);
  },
  createExpense: async (payload) => {
    await tick();
    return store.createExpense(payload);
  },
  updateExpense: async (id, payload) => {
    await tick();
    return store.updateExpense(id, payload);
  },
  deleteExpense: async (id) => {
    await tick();
    return store.deleteExpense(id);
  },
  settings: async () => {
    await tick();
    return store.getSettings();
  },
  saveSettings: async (payload) => {
    await tick();
    return store.saveSettings(payload);
  },
};

export async function downloadOrdersCSV() {
  const csv = store.ordersCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pedidos-healthy-menu-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const resetDemoData = () => store.resetStore();
