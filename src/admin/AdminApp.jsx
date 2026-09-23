import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { authApi } from '../lib/api.js';
import Login from './Login.jsx';
import AdminLayout from './AdminLayout.jsx';
import Dashboard from './Dashboard.jsx';
import Orders from './Orders.jsx';
import Products from './Products.jsx';
import Finance from './Finance.jsx';
import Customers from './Customers.jsx';
import Settings from './Settings.jsx';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro do painel administrativo');
  return context;
}

export default function AdminApp() {
  const [state, setState] = useState({ status: 'loading', admin: null });
  const navigate = useNavigate();

  const check = useCallback(async () => {
    try {
      const data = await authApi.me();
      setState({ status: 'ready', admin: data.admin });
    } catch {
      setState({ status: 'anon', admin: null });
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({ status: 'anon', admin: null });
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const value = useMemo(
    () => ({ admin: state.admin, logout, refresh: check }),
    [state.admin, logout, check],
  );

  if (state.status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-100">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-leaf-300 border-t-cacao-900" />
          <p className="text-sm text-leaf-500">Carregando painel…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'anon') {
    return (
      <Routes>
        <Route
          path="*"
          element={<Login onSuccess={(admin) => setState({ status: 'ready', admin })} />}
        />
      </Routes>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="produtos" element={<Products />} />
          <Route path="financeiro" element={<Finance />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="config" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}
