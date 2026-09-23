import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import {
  Badge,
  Button,
  Container,
  InstagramIcon,
  LeafIcon,
  MapPinIcon,
  SectionHeading,
  WhatsAppIcon,
} from '../components/ui.jsx';
import { useSite } from '../lib/site.jsx';
import { brl } from '../lib/format.js';

const PILLARS = [
  {
    title: 'Feito à mão, todos os dias',
    text: 'Fornadas pequenas e artesanais. Nada de conservantes ou misturas prontas.',
  },
  {
    title: 'Norte da Ilha, na porta',
    text: 'Entrega rápida em Rio Vermelho, Ingleses, Santinho, Canasvieiras e Jurerê.',
  },
  {
    title: 'Enviamos para o Brasil',
    text: 'Embalado com cuidado para chegar inteiro em qualquer estado.',
  },
  {
    title: 'Embalagem biodegradável',
    text: 'Caixas e sacolas compostáveis. O sabor não custa o planeta.',
  },
];

const REVIEWS = [
  {
    name: 'Denner Valdorino Secco',
    text: 'Entrega rápida e comida fitness deliciosa! Nutrição e sabor em cada refeição.',
  },
  { name: 'Itz_Julio', text: 'A fricassê de frango estava muito boa, sabor ótimo, bem temperada.' },
  {
    name: 'Willian Jefferson',
    text: 'Menus muito bons e nutritivos, ajudam demais no meu dia a dia. Top!',
  },
];

const STEPS = [
  { n: '01', title: 'Escolha seus favoritos', text: 'Navegue pelo cardápio e monte seu carrinho.' },
  { n: '02', title: 'Preencha seus dados', text: 'Nome, WhatsApp e endereço de entrega completo.' },
  { n: '03', title: 'Envie no WhatsApp', text: 'O pedido chega pronto para a gente confirmar com você.' },
];

export default function Home() {
  const { settings, featured, products, activeCategories, status, number } = useSite();
  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const brownies = products.filter((p) => p.category === 'brownies');
  const combos = products.filter((p) => p.category === 'combos');
  const cheapest = brownies.length
    ? Math.min(...brownies.map((p) => p.finalPrice ?? p.price))
    : 12;

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-brownie.jpg"
            alt="Brownies artesanais 50% cacau da Healthy Menu Floripa"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cacao-950/92 via-cacao-950/75 to-cacao-950/35" />
        </div>

        <Container className="relative flex min-h-[86vh] flex-col justify-center py-20 lg:min-h-[88vh]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-100/25 bg-cream-100/10 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cream-200 backdrop-blur">
              <MapPinIcon className="h-3.5 w-3.5" />
              Rio Vermelho · Norte da Ilha
            </span>

            <h1 className="animate-rise mt-6 text-[2.6rem] leading-[1.03] text-cream-100 sm:text-[3.4rem] lg:text-[4.2rem]">
              O brownie que você pode comer{' '}
              <span className="italic text-caramel-300">sem sair da dieta</span>
            </h1>

            <p className="animate-rise mt-6 max-w-xl text-[1.02rem] leading-relaxed text-cream-200/85">
              50% cacau, interior cremoso e casquinha crocante. Produzido artesanalmente em
              Florianópolis — entregamos em toda a região Norte da Ilha e enviamos para o Brasil
              inteiro.
            </p>

            <div className="animate-rise mt-9 flex flex-wrap items-center gap-3">
              <Button as={Link} to="/cardapio" variant="caramel" size="lg">
                Ver o cardápio
              </Button>
              <Button
                as="a"
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Olá! Vim pelo site e quero encomendar brownies 🍫',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="lg"
                className="border-cream-100/35 bg-cream-100/10 text-cream-100 backdrop-blur hover:border-cream-100 hover:bg-cream-100/20"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                Pedir no WhatsApp
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-cream-100/15 pt-7">
              <div>
                <dt className="text-[0.7rem] uppercase tracking-widest text-cream-200/60">A partir de</dt>
                <dd className="mt-1 font-display text-2xl text-cream-100">{brl(cheapest)}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-widest text-cream-200/60">Entrega</dt>
                <dd className="mt-1 font-display text-2xl text-cream-100">20min–1h30</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] uppercase tracking-widest text-cream-200/60">Frete grátis</dt>
                <dd className="mt-1 font-display text-2xl text-cream-100">
                  acima de {brl(number('free_delivery_from'))}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      {/* ----------------------------- PILARES ----------------------------- */}
      <section className="border-b border-cream-300 bg-white">
        <Container className="grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream-200 text-caramel-600">
                <LeafIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[1.02rem] text-cacao-900">{pillar.title}</h3>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-cacao-500">{pillar.text}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* ---------------------------- DESTAQUES ---------------------------- */}
      <section id="destaques" className="scroll-mt-24 py-20 lg:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Os mais pedidos"
              title="Nossos brownies chegam primeiro"
              description="Cada fornada sai com a casquinha brilhante e o centro ainda úmido — do jeito que a gente ama."
            />
            <Button as={Link} to="/cardapio" variant="outline" className="shrink-0">
              Ver cardápio completo
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {status === 'loading'
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-96 animate-pulse rounded-card bg-cream-200" />
                ))
              : featured.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </Container>
      </section>

      {/* ------------------------- HISTÓRIA / ATELIÊ ------------------------- */}
      <section className="grain bg-cream-200/70 py-20 lg:py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/images/kitchen-atelier.jpg"
                alt="Produção artesanal dos brownies Healthy Menu Floripa"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 max-w-[15rem] rounded-2xl border border-cream-300 bg-white p-5 shadow-lift sm:right-6">
              <p className="font-display text-3xl text-cacao-900">5,0★</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-cacao-500">
                Avaliação dos clientes no Google — sabor e nutrição em cada pedido.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Nossa história"
              title="Nasceu no Rio Vermelho, virou o brownie mais pedido da Ilha"
              description={settings.about_story}
            />
            <ul className="mt-8 space-y-4">
              {[
                'Chocolate nobre 50% cacau e manteiga de verdade.',
                'Zero conservantes — feito para consumir em até 5 dias ou congelar.',
                'Opções fit, zero açúcar e veganas para todo mundo.',
                'Mais de 100 pedidos entregues com avaliação máxima.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[0.92rem] text-cacao-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage-200 text-sage-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button as={Link} to="/sobre" variant="outline" className="mt-8">
              Conhecer a nossa história
            </Button>
          </div>
        </Container>
      </section>

      {/* ----------------------------- CATEGORIAS ----------------------------- */}
      <section className="py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Cardápio completo"
            title="Muito além do brownie"
            description="O brownie é o carro-chefe, mas quem treina e come bem encontra aqui almoço, lanche e sobremesa."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category) => {
              const items = products.filter((p) => p.category === category.id);
              const cover = items.find((p) => p.image)?.image;
              return (
                <Link
                  key={category.id}
                  to={`/cardapio?categoria=${category.id}`}
                  className="group relative overflow-hidden rounded-card border border-cream-300 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                    <ProductImage
                      src={cover}
                      alt={category.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-cream-100/95 px-3 py-1 text-[0.7rem] font-bold text-cacao-800">
                      {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[1.15rem] text-cacao-900">{category.label}</h3>
                    <p className="mt-1.5 text-[0.84rem] text-cacao-500">{category.blurb}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ------------------------------- COMBOS ------------------------------- */}
      {combos.length > 0 && (
        <section className="bg-cacao-900 py-20 text-cream-100 lg:py-24">
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow !text-caramel-300">Combos & presentes</p>
                <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
                  Leve 3 pague 2, monte caixas e presentei com brownie
                </h2>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-cream-200/75">
                  Caixas kraft biodegradáveis, cartão escrito à mão e combinações que cabem no
                  bolso. Quer personalizar para um evento? Falamos com você no WhatsApp.
                </p>
              </div>
              <Button as={Link} to="/cardapio?categoria=combos" variant="caramel" className="shrink-0">
                Ver combos
              </Button>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {combos.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-card border border-cream-100/12 bg-cream-100/[0.06] backdrop-blur"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-cacao-800">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[1.05rem] text-cream-100">{product.name}</h3>
                    <p className="mt-2 line-clamp-2 text-[0.83rem] leading-relaxed text-cream-200/70">
                      {product.shortDesc}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <span className="font-display text-xl text-caramel-300">
                        {brl(product.finalPrice ?? product.price)}
                      </span>
                      <Button as={Link} to={`/produto/${product.slug}`} variant="caramel" size="sm">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ----------------------------- COMO PEDIR ----------------------------- */}
      <section className="py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Simples assim"
            title="Como fazer seu pedido"
            description="Em três passos o pedido chega direto no nosso WhatsApp, com todos os dados preenchidos."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-card border border-cream-300 bg-white p-7 shadow-soft">
                <span className="font-display text-3xl text-caramel-400">{step.n}</span>
                <h3 className="mt-4 text-[1.15rem] text-cacao-900">{step.title}</h3>
                <p className="mt-2 text-[0.87rem] leading-relaxed text-cacao-500">{step.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button as={Link} to="/cardapio" size="lg" variant="caramel">
              Montar meu pedido
            </Button>
          </div>
        </Container>
      </section>

      {/* ----------------------------- DEPOIMENTOS ----------------------------- */}
      <section className="bg-cream-200/70 py-20 lg:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Quem já provou"
            title="Avaliação 5,0 no Google"
            description="Nutrição e sabor em cada pedido — é o que os nossos clientes contam."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((review) => (
              <figure key={review.name} className="flex h-full flex-col rounded-card border border-cream-300 bg-white p-6 shadow-soft">
                <div className="flex gap-0.5 text-caramel-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg key={index} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2l2.9 6.3 6.9.8-5 4.8 1.3 6.9L12 17.6 5.9 20.8 7.2 13.9 2.2 9.1l6.9-.8z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[0.92rem] italic leading-relaxed text-cacao-700">
                  “{review.text}”
                </blockquote>
                <figcaption className="mt-5 text-[0.8rem] font-semibold text-cacao-900">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* --------------------------------- CTA --------------------------------- */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-cacao-900 px-8 py-14 text-center sm:px-14">
            <div className="grain absolute inset-0 opacity-60" />
            <div className="relative">
              <Badge tone="caramel">Entrega no Norte da Ilha · Envio para todo o Brasil</Badge>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight text-cream-100 sm:text-4xl">
                Vamos adoçar o seu dia com um brownie de verdade?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-cream-200/75">
                Fale com a gente no WhatsApp para pedidos, encomendas para eventos e orçamentos em
                quantidade.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button
                  as="a"
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    'Olá! Quero encomendar brownies da Healthy Menu Floripa 🍫',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  size="lg"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Falar no WhatsApp
                </Button>
                <Button
                  as="a"
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                  className="border-cream-100/30 text-cream-100 hover:border-cream-100 hover:bg-cream-100/10"
                >
                  <InstagramIcon className="h-4.5 w-4.5" />
                  {settings.instagram_handle}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
