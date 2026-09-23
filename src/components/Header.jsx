import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { Logo } from './Logo.jsx';
import { Button, Container, WhatsAppIcon } from './ui.jsx';
import { useCart } from '../lib/cart.jsx';
import { useSite } from '../lib/site.jsx';
import { usePulse, useScrollY } from '../lib/hooks.js';
import { cx } from '../lib/format.js';

export const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/sobre', label: 'Nossa história' },
  { to: '/entregas', label: 'Entregas' },
  { to: '/contato', label: 'Contato' },
];

/* Barra fina de progresso da leitura, no topo do site */
function ScrollProgress() {
  const scrollY = useScrollY();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(height > 0 ? Math.min(100, (scrollY / height) * 100) : 0);
  }, [scrollY]);

  return (
    <div className="absolute inset-x-0 top-0 h-[3px] bg-transparent">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-lime-400 via-leaf-500 to-leaf-700 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function CartButton({ className, light = false }) {
  const { count, open, lastAdded } = useCart();
  const bouncing = usePulse(lastAdded, 700);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrinho (${count} ${count === 1 ? 'item' : 'itens'})`}
      className={cx(
        'group relative grid h-11 w-11 place-items-center rounded-full border transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-soft active:scale-95',
        light
          ? 'border-white/30 bg-white/15 text-cream-50 backdrop-blur hover:border-white/60 hover:bg-white/25'
          : 'border-leaf-200 bg-white text-leaf-800 hover:border-leaf-500',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className={cx('h-5 w-5 transition-transform duration-300', bouncing && 'animate-wiggle text-leaf-600')}
      >
        <path d="M4 6h2l1.6 9.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L20.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className="animate-pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime-400 px-1 text-[0.65rem] font-extrabold text-leaf-950 shadow-sm"
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSite();
  const location = useLocation();
  const { close } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const waLink = `https://wa.me/${String(settings.whatsapp ?? '').replace(/\D/g, '')}`;
  /* Na home, o cabeçalho flutua sobre o hero escuro até o primeiro scroll. */
  const overHero = location.pathname === '/' && !scrolled && !menuOpen;

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-leaf-100 bg-cream-50/90 shadow-[0_10px_30px_-24px_rgba(22,63,35,0.5)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <ScrollProgress />

      <Container className="flex h-[74px] items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="Healthy Menu Floripa — página inicial"
          className="transition-transform duration-300 hover:scale-[1.03] active:scale-95"
        >
          <Logo tone={overHero ? 'light' : 'dark'} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cx(
                  'relative rounded-full px-4 py-2 text-[0.88rem] font-semibold transition-all duration-300',
                  isActive
                    ? overHero
                      ? 'bg-lime-400 text-leaf-950 shadow-soft'
                      : 'bg-leaf-900 text-cream-50 shadow-soft'
                    : overHero
                      ? 'text-cream-100/90 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'
                      : 'text-leaf-700 hover:-translate-y-0.5 hover:bg-leaf-100 hover:text-leaf-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[0.85rem] font-bold text-[#062e14] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift md:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir no WhatsApp
          </a>

          <CartButton light={overHero} />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className={cx(
              'grid h-11 w-11 place-items-center rounded-full border transition-all duration-300 active:scale-95 lg:hidden',
              overHero
                ? 'border-white/30 bg-white/15 text-cream-50 backdrop-blur'
                : 'border-leaf-200 bg-white text-leaf-800 hover:border-leaf-500',
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="animate-fade border-t border-leaf-100 bg-cream-50/95 backdrop-blur-xl lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link, index) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={{ animationDelay: `${index * 45}ms` }}
                className={({ isActive }) =>
                  cx(
                    'animate-rise rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition-colors',
                    isActive ? 'bg-leaf-900 text-cream-50' : 'text-leaf-700 hover:bg-leaf-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              as="a"
              variant="whatsapp"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Falar com a Healthy Menu
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
