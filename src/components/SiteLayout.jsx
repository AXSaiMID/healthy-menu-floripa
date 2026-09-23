import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import { WhatsAppIcon } from './ui.jsx';
import { useSite } from '../lib/site.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

/** Faz a página entrar suavemente a cada troca de rota. */
function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-fade">
      {children}
    </div>
  );
}

function WhatsAppFab() {
  const { settings } = useSite();
  const [expanded, setExpanded] = useState(false);
  const number = String(settings.whatsapp ?? '').replace(/\D/g, '');

  useEffect(() => {
    const timer = window.setTimeout(() => setExpanded(true), 1400);
    const hide = window.setTimeout(() => setExpanded(false), 7000);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(
        'Olá! Vim pelo site da Healthy Menu Floripa e gostaria de fazer um pedido 🍫',
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="group fixed bottom-5 right-5 z-40 flex animate-pulse-ring items-center gap-2.5 rounded-full bg-[#25D366] px-3.5 py-3.5 font-bold text-[#062e14] shadow-lift transition-all duration-300 hover:-translate-y-1 hover:brightness-105 sm:bottom-7 sm:right-7"
      aria-label="Falar no WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
      <span
        className={`overflow-hidden whitespace-nowrap text-[0.85rem] transition-all duration-300 ${
          expanded ? 'max-w-[12rem] pr-1 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        Pedir agora
      </span>
    </a>
  );
}

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </div>
  );
}
