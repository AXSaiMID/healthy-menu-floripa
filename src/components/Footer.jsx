import { Link } from 'react-router-dom';

import { Logo } from './Logo.jsx';
import { Container, InstagramIcon, MapPinIcon, WhatsAppIcon } from './ui.jsx';
import { NAV_LINKS } from './Header.jsx';
import { useSite } from '../lib/site.jsx';

export default function Footer() {
  const { settings, activeCategories } = useSite();
  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const hours = String(settings.opening_hours ?? '').split('|').filter(Boolean);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-cacao-900 text-cream-200">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <Logo tone="light" />
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
                className="grid h-10 w-10 place-items-center rounded-full bg-cream-100/10 text-cream-100 transition hover:bg-[#25D366] hover:text-[#062e14]"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-cream-100/10 text-cream-100 transition hover:bg-caramel-500 hover:text-cacao-950"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={settings.google_maps}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps"
                className="grid h-10 w-10 place-items-center rounded-full bg-cream-100/10 text-cream-100 transition hover:bg-caramel-500 hover:text-cacao-950"
              >
                <MapPinIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.2em] text-caramel-300">
              Navegue
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-cream-300/85 transition hover:text-cream-100">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/carrinho" className="text-cream-300/85 transition hover:text-cream-100">
                  Meu carrinho
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.2em] text-caramel-300">
              Cardápio
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {activeCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/cardapio?categoria=${category.id}`}
                    className="text-cream-300/85 transition hover:text-cream-100"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.2em] text-caramel-300">
              Onde nos encontrar
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-cream-300/85">
              <li>
                {settings.address_line} · {settings.address_city}/{settings.address_state}
              </li>
              <li>
                <a href={`https://wa.me/${waNumber}`} className="transition hover:text-cream-100">
                  {settings.whatsapp_display}
                </a>
              </li>
              <li>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-cream-100"
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
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream-100/10 pt-7 text-[0.78rem] text-cream-300/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.business_name}. Feito artesanalmente em Florianópolis/SC.
          </p>
          <p className="flex items-center gap-4">
            <span>{settings.reviews_summary}</span>
            <Link to="/admin" className="text-cream-300/50 transition hover:text-caramel-300">
              Área da empresa
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
