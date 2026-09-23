import { Link } from 'react-router-dom';

import { Logo } from './Logo.jsx';
import { Container, InstagramIcon, MapPinIcon, WhatsAppIcon } from './ui.jsx';
import { Reveal } from './motion.jsx';
import { NAV_LINKS } from './Header.jsx';
import { useSite } from '../lib/site.jsx';

export default function Footer() {
  const { settings, activeCategories } = useSite();
  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const hours = String(settings.opening_hours ?? '').split('|').filter(Boolean);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-leaf-950 text-cream-200">
      {/* brilhos verdes de fundo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-float-slow absolute -left-20 top-10 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div
          className="animate-float-slow absolute bottom-0 right-0 h-72 w-72 rounded-full bg-leaf-500/15 blur-3xl"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <Container className="relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <Reveal>
            <Logo tone="light" showTagline />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-300/80">
              Brownies artesanais e comida de verdade feitos em pequenas fornadas no Rio Vermelho,
              Norte da Ilha. Sem conservantes, com embalagens biodegradáveis.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:bg-[#25D366] hover:text-[#062e14]"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-leaf-950"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={settings.google_maps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-leaf-950"
              >
                <MapPinIcon className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <h3 className="text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Navegue
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-block text-cream-300/85 transition-all duration-200 hover:translate-x-1 hover:text-lime-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/carrinho"
                  className="inline-block text-cream-300/85 transition-all duration-200 hover:translate-x-1 hover:text-lime-200"
                >
                  Meu carrinho
                </Link>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={2}>
            <h3 className="text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Cardápio
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {activeCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/cardapio?categoria=${category.id}`}
                    className="inline-block text-cream-300/85 transition-all duration-200 hover:translate-x-1 hover:text-lime-200"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={3}>
            <h3 className="text-[0.78rem] font-extrabold uppercase tracking-[0.2em] text-lime-300">
              Onde nos encontrar
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-cream-300/85">
              <li>
                {settings.address_line} · {settings.address_city}/{settings.address_state}
              </li>
              <li>
                <a href={`https://wa.me/${waNumber}`} className="transition hover:text-lime-200">
                  {settings.whatsapp_display}
                </a>
              </li>
              <li>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-lime-200"
                >
                  {settings.instagram_handle}
                </a>
              </li>
            </ul>
            <div className="mt-5 space-y-1 text-[0.8rem] text-cream-300/70">
              {hours.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-[0.78rem] text-cream-300/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.business_name}. Feito artesanalmente em Florianópolis/SC.
          </p>
          <p className="flex items-center gap-4">
            <span>{settings.reviews_summary}</span>
            <Link to="/admin" className="text-cream-300/50 transition hover:text-lime-300">
              Área da empresa
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
