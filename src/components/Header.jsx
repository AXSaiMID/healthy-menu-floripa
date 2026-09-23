import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { Logo } from './Logo.jsx';
import { Button, Container, WhatsAppIcon } from './ui.jsx';
import { useCart } from '../lib/cart.jsx';
import { useSite } from '../lib/site.jsx';
import { cx } from '../lib/format.js';

export const NAV_LINKS = [
  { to: '/', label: 'Início' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/sobre', label: 'Nossa história' },
  { to: '/entregas', label: 'Entregas' },
  { to: '/contato', label: 'Contato' },
];

export function CartButton({ className }) {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrinho (${count} ${count === 1 ? 'item' : 'itens'})`}
      className={cx(
        'relative grid h-11 w-11 place-items-center rounded-full border border-cream-300 bg-white text-cacao-800 transition hover:border-cacao-900',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <path d="M4 6h2l1.6 9.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L20.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-caramel-500 px-1 text-[0.65rem] font-bold text-cacao-950">
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
  }, [location.pathname, close]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-cream-300/80 bg-cream-100/90 backdrop-blur-lg'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link to="/" aria-label="Healthy Menu Floripa — página inicial">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cx(
                  'rounded-full px-4 py-2 text-[0.88rem] font-medium transition',
                  isActive ? 'bg-cacao-900 text-cream-100' : 'text-cacao-700 hover:bg-cream-200',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${String(settings.whatsapp ?? '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[0.85rem] font-semibold text-[#062e14] shadow-soft transition hover:brightness-105 md:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir no WhatsApp
          </a>

          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full border border-cream-300 bg-white text-cacao-800 lg:hidden"
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
        <div className="animate-fade border-t border-cream-300 bg-cream-100 lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'rounded-xl px-4 py-3 text-[0.95rem] font-medium transition',
                    isActive ? 'bg-cacao-900 text-cream-100' : 'text-cacao-700 hover:bg-cream-200',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              as="a"
              variant="whatsapp"
              href={`https://wa.me/${String(settings.whatsapp ?? '').replace(/\D/g, '')}`}
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
