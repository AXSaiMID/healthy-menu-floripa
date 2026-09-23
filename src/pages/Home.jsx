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
  StarIcon,
  WhatsAppIcon,
} from '../components/ui.jsx';
import {
  FloatingDecor,
  GradientBlobs,
  Marquee,
  Reveal,
  ShimmerBadge,
  Stagger,
  WaveDivider,
} from '../components/motion.jsx';
import { useSite } from '../lib/site.jsx';
import { useCountUp, useParallax } from '../lib/hooks.js';
import { brl } from '../lib/format.js';

const PILLARS = [
  {
    icon: 'hand',
    title: 'Feito à mão, todos os dias',
    text: 'Fornadas pequenas e artesanais. Nada de conservantes ou misturas prontas.',
  },
  {
    icon: 'pin',
    title: 'Norte da Ilha, na porta',
    text: 'Entrega rápida em Rio Vermelho, Ingleses, Santinho, Canasvieiras e Jurerê.',
  },
  {
    icon: 'truck',
    title: 'Enviamos para o Brasil',
    text: 'Embalado com cuidado para chegar inteiro em qualquer estado.',
  },
  {
    icon: 'leaf',
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
  {
    n: '01',
    emoji: '🛒',
    title: 'Escolha seus favoritos',
    text: 'Navegue pelo cardápio, monte seu carrinho e ajuste as quantidades.',
  },
  {
    n: '02',
    emoji: '📝',
    title: 'Preencha seus dados',
    text: 'Nome, WhatsApp e endereço completo — o CEP preenche a rua pra você.',
  },
  {
    n: '03',
    emoji: '💬',
    title: 'Envie no WhatsApp',
    text: 'O pedido chega pronto pra gente confirmar o pagamento e a entrega.',
  },
];

/* Se nenhum produto da categoria tiver foto, usamos uma imagem da casa. */
const FALLBACK_COVERS = {
  brownies: '/images/brownie-classico.jpg',
  combos: '/images/box-brownies.jpg',
  salgados: '/images/wrap.jpg',
  refeicoes: '/images/fricasse.jpg',
  'zero-acucar': '/images/brownie-zero-acucar.jpg',
  bebidas: '/images/box-brownies.jpg',
};

const MARQUEE_ITEMS = [
  'Brownie 50% cacau',
  'Zero açúcar',
  'Vegano',
  'Sem conservantes',
  'Entrega no Norte da Ilha',
  'Enviamos para todo o Brasil',
  'Embalagem biodegradável',
  'Feito à mão todos os dias',
];

/* ─────────────────────────── Ícones dos pilares ─────────────────────────── */
function PillarIcon({ name, className = 'h-5 w-5' }) {
  const paths = {
    hand: 'M9 11V5.5a1.5 1.5 0 013 0V11m0-2.5a1.5 1.5 0 013 0V11m0-1.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.5a6.5 6.5 0 01-6.5-6.5V11a1.5 1.5 0 013 0',
    pin: null,
    truck: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM7 19a2 2 0 100-4 2 2 0 000 4zM17.5 19a2 2 0 100-4 2 2 0 000 4z',
    leaf: null,
  };

  if (name === 'pin') return <MapPinIcon className={className} />;
  if (name === 'leaf') return <LeafIcon className={className} />;

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path d={paths[name] ?? paths.hand} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────────────── Estatística animada ─────────────────────────── */
function StatCounter({ target, prefix = '', suffix = '', decimals = 0, label, delay = 0 }) {
  const [ref, value] = useCountUp(target, { prefix, suffix, decimals });

  return (
    <div ref={ref} className={`animate-rise delay-${delay || ''}`.trim()}>
      <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-lime-200/70">{label}</dt>
      <dd className="mt-1 font-display text-[1.9rem] font-semibold text-cream-50 sm:text-[2.2rem]">{value}</dd>
    </div>
  );
}

export default function Home() {
  const { settings, featured, products, activeCategories, status, number } = useSite();
  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const heroRef = useParallax({ strength: 46 });

  const brownies = products.filter((p) => p.category === 'brownies');
  const combos = products.filter((p) => p.category === 'combos');
  const cheapest = brownies.length ? Math.min(...brownies.map((p) => p.finalPrice ?? p.price)) : 12;
  const totalProducts = products.length;

  return (
    <>
      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative -mt-[74px] overflow-hidden pt-[74px]">
        {/* Imagem de fundo com parallax */}
        <div className="absolute inset-0 bg-leaf-950" ref={heroRef}>
          <img
            src="/images/hero-brownie-fresh.jpg"
            alt="Brownies artesanais da Healthy Menu Floripa com folhas de hortelã"
            className="h-[115%] w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-leaf-950/95 via-leaf-950/80 to-leaf-900/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-leaf-950/70 via-transparent to-transparent" />
        </div>

        <GradientBlobs />
        <FloatingDecor tone="dark" />

        <Container className="relative flex min-h-[92vh] flex-col justify-center py-24 lg:min-h-[94vh]">
          <div className="max-w-2xl">
            <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-lime-300/30 bg-lime-400/15 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-lime-200 backdrop-blur">
              <MapPinIcon className="h-3.5 w-3.5" />
              Rio Vermelho · Norte da Ilha
            </span>

            <h1 className="mt-6 text-[2.6rem] leading-[1.03] text-cream-50 sm:text-[3.4rem] lg:text-[4.3rem]">
              <span className="animate-rise block" style={{ animationDelay: '80ms' }}>
                O brownie que você
              </span>
              <span className="animate-rise block" style={{ animationDelay: '180ms' }}>
                pode comer{' '}
                <span className="relative inline-block">
                  <span className="text-gradient italic">sem sair da dieta</span>
                  <svg
                    viewBox="0 0 300 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-lime-400"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9c60-7 120-8 180-4 40 3 80 1 116-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p
              className="animate-rise mt-8 max-w-xl text-[1.02rem] leading-relaxed text-cream-200/90"
              style={{ animationDelay: '280ms' }}
            >
              50% cacau, interior cremoso e casquinha crocante. Produzido artesanalmente em
              Florianópolis — entregamos em toda a região Norte da Ilha e enviamos para o Brasil
              inteiro.
            </p>

            <div
              className="animate-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '380ms' }}
            >
              <Button as={Link} to="/cardapio" variant="lime" size="lg">
                Ver o cardápio
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                className="border-white/30 bg-white/10 text-cream-50 backdrop-blur hover:border-white hover:bg-white/20"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Pedir no WhatsApp
              </Button>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 sm:grid-cols-4">
              <StatCounter target={cheapest} decimals={2} prefix="R$ " label="A partir de" />
              <StatCounter target={totalProducts} suffix="+" label="Itens no cardápio" delay={1} />
              <StatCounter target={5} suffix=",0 ★" decimals={1} label="No Google" delay={2} />
              <div className="animate-rise delay-3" data-variant="up">
                <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-lime-200/70">
                  Frete grátis acima de
                </dt>
                <dd className="mt-1 font-display text-[1.9rem] font-semibold text-cream-50 sm:text-[2.2rem]">
                  {brl(number('free_delivery_from'))}
                </dd>
              </div>
            </dl>
          </div>
        </Container>

        {/* Indicador de rolagem */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream-200/60 lg:flex">
          <span className="text-[0.66rem] font-bold uppercase tracking-[0.24em]">role</span>
          <span className="flex h-9 w-5 justify-center rounded-full border border-cream-200/30 p-1">
            <span className="h-2 w-1 animate-bounce rounded-full bg-lime-300" />
          </span>
        </div>
      </section>

      {/* ══════════════════════════ FAIXA ANIMADA ══════════════════════════ */}
      <Marquee items={MARQUEE_ITEMS} />

      {/* ═════════════════════════════ PILARES ═════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        <Container className="py-16">
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="group">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-100 text-leaf-600 transition-all duration-500 group-hover:-rotate-6 group-hover:bg-lime-300 group-hover:text-leaf-900">
                  <PillarIcon name={pillar.icon} />
                </span>
                <h3 className="mt-4 text-[1.02rem] font-semibold text-leaf-900">{pillar.title}</h3>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-leaf-700">{pillar.text}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ═══════════════════════════ DESTAQUES ═══════════════════════════ */}
      <section id="destaques" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-24">
        <GradientBlobs className="opacity-60" />

        <Container className="relative">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Os mais pedidos"
              title="Nossos brownies chegam primeiro"
              description="Cada fornada sai com a casquinha brilhante e o centro ainda úmido — do jeito que a gente ama."
            />
            <Button as={Link} to="/cardapio" variant="outline" className="shrink-0">
              Ver cardápio completo
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {status === 'loading'
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-96 animate-pulse rounded-card bg-leaf-100" />
                ))
              : featured.slice(0, 6).map((product, index) => (
                  <Reveal key={product.id} delay={(index % 3) + 1} variant="up" className="h-full">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════ HISTÓRIA / ATELIÊ ═══════════════════════ */}
      <section className="grain relative overflow-hidden bg-leaf-100/70 py-20 lg:py-28">
        <FloatingDecor />

        <Container className="relative grid items-center gap-14 lg:grid-cols-2">
          <Reveal variant="left" className="relative">
            <div className="overflow-hidden rounded-[2rem] bg-leaf-100 shadow-lift">
              <img
                src="/images/kitchen-atelier.jpg"
                alt="Produção artesanal dos brownies Healthy Menu Floripa"
                className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] hover:scale-105"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="animate-float absolute -bottom-6 -right-2 max-w-[15rem] rounded-2xl border border-leaf-200 bg-white/95 p-5 shadow-lift backdrop-blur sm:right-6">
              <p className="flex items-center gap-2 font-display text-3xl font-semibold text-leaf-900">
                5,0
                <StarIcon className="h-6 w-6 text-lime-500" />
              </p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-leaf-700">
                Avaliação dos clientes no Google — sabor e nutrição em cada pedido.
              </p>
            </div>
          </Reveal>

          <Reveal variant="right" delay={1}>
            <SectionHeading
              eyebrow="Nossa história"
              title="Nasceu no Rio Vermelho e virou o brownie mais pedido da Ilha"
              description={settings.about_story}
            />
            <Stagger as="ul" variant="left" className="mt-8 space-y-4">
              {[
                'Chocolate nobre 50% cacau e manteiga de verdade.',
                'Zero conservantes — consuma em até 5 dias ou congele por 60.',
                'Opções fit, zero açúcar e veganas para todo mundo.',
                'Mais de 100 pedidos entregues com avaliação máxima.',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[0.92rem] text-leaf-800"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-300 text-leaf-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </Stagger>
            <Button as={Link} to="/sobre" variant="outline" className="mt-8">
              Conhecer a nossa história
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* ═════════════════════════ CATEGORIAS ═════════════════════════ */}
      <section className="relative py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Cardápio completo"
              title="Muito além do brownie"
              description="O brownie é o carro-chefe, mas quem treina e come bem encontra aqui almoço, lanche e sobremesa."
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category, index) => {
              const items = products.filter((p) => p.category === category.id);
              const cover = items.find((p) => p.image)?.image || FALLBACK_COVERS[category.id];
              return (
                <Reveal key={category.id} delay={(index % 3) + 1} variant="zoom" className="h-full">
                  <Link
                    to={`/cardapio?categoria=${category.id}`}
                    className="group relative block h-full overflow-hidden rounded-card border border-leaf-100 bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-leaf-300 hover:shadow-lift"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-leaf-100">
                      <ProductImage
                        src={cover}
                        alt={category.label}
                        label={category.label}
                        className="h-full w-full object-cover transition-transform duration-[1.1s] group-hover:scale-110"
                      />
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-bold text-leaf-800 shadow-sm backdrop-blur">
                        {items.length} {items.length === 1 ? 'item' : 'itens'}
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-t from-leaf-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="p-5">
                      <h3 className="flex items-center gap-2 text-[1.15rem] font-semibold text-leaf-900">
                        {category.label}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </h3>
                      <p className="mt-1.5 text-[0.84rem] text-leaf-700">{category.blurb}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ════════════════════════════ COMBOS ════════════════════════════ */}
      {combos.length > 0 && (
        <section className="relative overflow-hidden bg-leaf-950 py-24 text-cream-100 lg:py-28">
          <WaveDivider position="top" fill="#f8fbf5" />
          <GradientBlobs />
          <FloatingDecor tone="dark" />

          <Container className="relative">
            <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <ShimmerBadge>Combos & presentes</ShimmerBadge>
                <h2 className="mt-4 text-3xl leading-tight text-cream-50 sm:text-4xl lg:text-[2.6rem]">
                  Leve 3 pague 2, monte caixas e{' '}
                  <span className="font-hand text-lime-300">presenteie com brownie</span>
                </h2>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-cream-200/80">
                  Caixas kraft biodegradáveis, cartão escrito à mão e combinações que cabem no
                  bolso. Quer personalizar para um evento? Falamos com você no WhatsApp.
                </p>
              </div>
              <Button as={Link} to="/cardapio?categoria=combos" variant="lime" className="shrink-0">
                Ver combos
              </Button>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {combos.slice(0, 3).map((product, index) => (
                <Reveal key={product.id} delay={index + 1} variant="up" className="h-full">
                  <div className="group flex h-full flex-col overflow-hidden rounded-card border border-white/12 bg-white/[0.06] backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-lime-400/40 hover:bg-white/10">
                    <div className="aspect-[16/10] overflow-hidden bg-leaf-900">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        label={product.name}
                        tone="dark"
                        className="h-full w-full object-cover transition-transform duration-[1.1s] group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[1.05rem] font-semibold text-cream-50">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 text-[0.83rem] leading-relaxed text-cream-200/70">
                        {product.shortDesc}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-5">
                        <span className="font-display text-xl font-semibold text-lime-300">
                          {brl(product.finalPrice ?? product.price)}
                        </span>
                        <Button as={Link} to={`/produto/${product.slug}`} variant="lime" size="sm">
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ═══════════════════════ COMO PEDIR ═══════════════════════ */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <FloatingDecor />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Simples assim"
              title="Como fazer seu pedido"
              description="Em três passos o pedido chega direto no nosso WhatsApp, com todos os dados preenchidos."
            />
          </Reveal>

          <div className="relative mt-14">
            {/* linha pontilhada conectando os passos */}
            <div
              className="absolute left-1/2 top-12 hidden h-0.5 w-[62%] -translate-x-1/2 lg:block"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #A3CD8C 0 10px, transparent 10px 20px)',
              }}
              aria-hidden="true"
            />

            <Stagger className="grid gap-6 md:grid-cols-3" variant="up">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="group relative rounded-card border border-leaf-100 bg-white p-7 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-lime-300 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between">
                    <span className="animate-float grid h-14 w-14 place-items-center rounded-2xl bg-leaf-100 text-2xl transition-colors duration-500 group-hover:bg-lime-300">
                      {step.emoji}
                    </span>
                    <span className="font-display text-4xl font-semibold text-leaf-200 transition-colors duration-500 group-hover:text-lime-400">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[1.15rem] font-semibold text-leaf-900">{step.title}</h3>
                  <p className="mt-2 text-[0.87rem] leading-relaxed text-leaf-700">{step.text}</p>
                </div>
              ))}
            </Stagger>
          </div>

          <Reveal className="mt-12 text-center" delay={2}>
            <Button as={Link} to="/cardapio" size="lg" variant="lime">
              Montar meu pedido
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* ═══════════════════════ DEPOIMENTOS ═══════════════════════ */}
      <section className="grain relative overflow-hidden bg-cream-200 py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Quem já provou"
              title="Avaliação 5,0 no Google"
              description="Nutrição e sabor em cada pedido — é o que os nossos clientes contam."
            />
          </Reveal>

          <Stagger className="mt-12 grid gap-6 md:grid-cols-3" variant="up">
            {REVIEWS.map((review) => (
              <figure
                key={review.name}
                className="flex h-full flex-col rounded-card border border-leaf-100 bg-white p-6 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift"
              >
                <div className="flex gap-1 text-lime-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="h-4 w-4 animate-pop" style={{ animationDelay: `${index * 80}ms` }} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[0.92rem] italic leading-relaxed text-leaf-800">
                  “{review.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 text-[0.8rem] font-semibold text-leaf-900">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-100 font-display text-[0.9rem] font-bold text-leaf-700">
                    {review.name.charAt(0)}
                  </span>
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ════════════════════════════ CTA ════════════════════════════ */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <Container>
          <Reveal variant="zoom">
            <div className="relative overflow-hidden rounded-[2rem] bg-leaf-900 px-8 py-16 text-center sm:px-14">
              <GradientBlobs />
              <FloatingDecor tone="dark" />
              <div className="grain absolute inset-0 opacity-40" />

              <div className="relative">
                <ShimmerBadge>Entrega no Norte da Ilha · Envio para todo o Brasil</ShimmerBadge>
                <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight text-cream-50 sm:text-4xl lg:text-[2.6rem]">
                  Vamos adoçar o seu dia com um{' '}
                  <span className="font-hand text-lime-300">brownie de verdade</span>?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-cream-200/80">
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
                    className="border-white/30 text-cream-50 hover:border-white hover:bg-white/10"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    {settings.instagram_handle}
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.78rem] font-semibold text-cream-200/70">
                  <span className="flex items-center gap-2">
                    <LeafIcon className="h-4 w-4 text-lime-300" />
                    Embalagem biodegradável
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone="lime" className="!bg-lime-400/20 !text-lime-200">
                      Sem conservantes
                    </Badge>
                  </span>
                  <span className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4 text-lime-300" />
                    5,0 no Google
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
