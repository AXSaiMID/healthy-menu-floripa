import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Package,
  Settings as SettingsIcon,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from './AdminApp.jsx';
import { adminApi } from '../lib/api.js';
import { cx } from '../lib/format.js';

const NAV = [
  { to: '/admin/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, badge: 'pending' },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/config', label: 'Configurações', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let alive = true;
    adminApi
      .dashboard()
      .then((data) => {
        if (alive) setPending(data.kpi.pending);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-cacao-900 p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100">
              <span className="font-display text-lg font-bold text-cacao-900">H</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.02rem] font-semibold text-cream-100">
                Healthy Menu
              </span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-caramel-300">
                Painel
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-cream-100/10 text-cream-100 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-9 flex-1 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx(
                  'group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.9rem] font-medium transition',
                  isActive
                    ? 'bg-cream-100/10 text-cream-100'
                    : 'text-cream-200/60 hover:bg-cream-100/5 hover:text-cream-100',
                )
              }
            >
              <item.icon className="h-[1.05rem] w-[1.05rem] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge === 'pending' && pending > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-caramel-500 px-1.5 text-[0.65rem] font-bold text-cacao-950">
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 space-y-3 border-t border-cream-100/10 pt-5">
          <div className="rounded-2xl bg-cream-100/5 p-3.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-caramel-300">
              Conectado como
            </p>
            <p className="mt-1 truncate text-[0.85rem] font-semibold text-cream-100">{admin?.name}</p>
            <p className="truncate text-[0.72rem] text-cream-200/50">{admin?.email}</p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[0.85rem] text-cream-200/60 transition hover:bg-cream-100/5 hover:text-cream-100"
          >
            <ExternalLink className="h-4 w-4" />
            Ver o site
          </Link>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[0.85rem] text-cream-200/60 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sair do painel
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-cacao-950/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-cream-300 bg-cream-100/90 px-5 py-3.5 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-cream-300 bg-white text-cacao-800"
            aria-label="Abrir menu"
          >
            <MenuIcon className="h-4.5 w-4.5" />
          </button>
          <span className="flex items-center gap-2 font-display text-[1.05rem] font-semibold text-cacao-900">
            <BarChart3 className="h-4 w-4 text-caramel-600" />
            Painel Healthy Menu
          </span>
        </header>

        <main className="px-5 py-7 lg:px-9 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
