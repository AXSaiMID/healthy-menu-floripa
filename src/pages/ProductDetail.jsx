import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { Badge, Button, Container, WhatsAppIcon } from '../components/ui.jsx';
import { useSite } from '../lib/site.jsx';
import { useCart } from '../lib/cart.jsx';
import { useToast } from '../lib/toast.jsx';
import { brl, categoryLabel, cx } from '../lib/format.js';
import { whatsappLink } from '../lib/whatsapp.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, settings, status } = useSite();
  const cart = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = products.find((p) => p.slug === slug);

  useEffect(() => {
    setQty(1);
    setActiveImage(0);
    if (product) document.title = `${product.name} · Healthy Menu Floripa`;
  }, [product]);

  if (status === 'loading') {
    return (
      <Container className="py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-card bg-cream-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-cream-200" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-cream-200" />
            <div className="h-4 w-4/5 animate-pulse rounded-lg bg-cream-200" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-3xl">Produto não encontrado</h1>
        <p className="mt-3 text-cacao-500">
          Talvez ele tenha saído do cardápio. Veja as novidades na nossa vitrine.
        </p>
        <Button as={Link} to="/cardapio" className="mt-7">
          Voltar ao cardápio
        </Button>
      </Container>
    );
  }

  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
  const price = product.finalPrice ?? product.price;
  const soldOut = product.stock !== null && product.stock !== undefined && product.stock <= 0;
  const images = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const waMessage = whatsappLink(
    settings.whatsapp,
    `Olá! Tenho interesse no *${product.name}* (${brl(price)}). Podem me ajudar?`,
  );

  const addToCart = () => {
    cart.add(product, qty);
    toast.success(`${qty}x ${product.name} no carrinho.`);
  };

  return (
    <>
      <Container className="py-8">
        <nav className="flex items-center gap-2 text-[0.78rem] text-cacao-400">
          <Link to="/" className="hover:text-cacao-700">Início</Link>
          <span>/</span>
          <Link to="/cardapio" className="hover:text-cacao-700">Cardápio</Link>
          <span>/</span>
          <Link to={`/cardapio?categoria=${product.category}`} className="hover:text-cacao-700">
            {categoryLabel(product.category)}
          </Link>
          <span>/</span>
          <span className="truncate text-cacao-700">{product.name}</span>
        </nav>
      </Container>

      <Container className="pb-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Imagens */}
          <div>
            <div className="overflow-hidden rounded-[1.75rem] border border-cream-300 bg-white shadow-soft">
              <div className="aspect-square w-full bg-cream-200">
                <ProductImage
                  src={images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cx(
                      'h-20 w-20 overflow-hidden rounded-xl border-2 transition',
                      activeImage === index ? 'border-caramel-500' : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <ProductImage src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="sage">{categoryLabel(product.category)}</Badge>
              {product.shippingScope === 'nacional' ? (
                <Badge tone="caramel">Envio para todo o Brasil</Badge>
              ) : (
                <Badge tone="caramel">Entrega no Norte da Ilha</Badge>
              )}
              {hasPromo && <Badge tone="dark">Promoção</Badge>}
            </div>

            <h1 className="mt-4 text-3xl leading-tight text-cacao-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-[1rem] leading-relaxed text-cacao-600">{product.shortDesc}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              {hasPromo && (
                <span className="text-[0.9rem] text-cacao-400 line-through">{brl(product.price)}</span>
              )}
              <span className="font-display text-4xl font-semibold text-cacao-900">{brl(price)}</span>
              {product.unit && (
                <span className="pb-1 text-[0.82rem] text-cacao-400">/ {product.unit}</span>
              )}
            </div>

            {product.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantidade + ações */}
            <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.82rem] font-semibold text-cacao-600">Quantidade</span>
                <div className="flex items-center gap-1 rounded-full border border-cream-300 p-1">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-cacao-700 transition hover:bg-cream-200"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-cacao-700 transition hover:bg-cream-200"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button size="lg" onClick={addToCart} disabled={soldOut}>
                  {soldOut ? 'Produto esgotado' : `Adicionar · ${brl(price * qty)}`}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="caramel"
                    onClick={() => {
                      addToCart();
                      cart.openCheckout();
                    }}
                    disabled={soldOut}
                  >
                    Comprar agora
                  </Button>
                  <Button
                    as="a"
                    href={waMessage}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-center text-[0.74rem] leading-relaxed text-cacao-400">
                {product.shippingScope === 'nacional'
                  ? 'Enviamos para todo o Brasil. O frete é calculado na finalização pelo WhatsApp.'
                  : `Entrega rápida no Norte da Ilha. Frete grátis acima de ${brl(
                      Number(settings.free_delivery_from ?? 0),
                    )}.`}
              </p>
            </div>

            {/* Descrição completa */}
            <div className="mt-8 border-t border-cream-300 pt-7">
              <h2 className="text-[1.15rem] text-cacao-900">Sobre este produto</h2>
              <p className="mt-3 whitespace-pre-line text-[0.92rem] leading-relaxed text-cacao-600">
                {product.description}
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ['Porção', product.unit || '—'],
                  ['Conservação', 'Até 5 dias na geladeira ou 60 dias congelado'],
                  ['Produção', 'Artesanal, em Florianópolis/SC'],
                  ['Embalagem', 'Kraft biodegradável'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-cream-200/70 px-4 py-3">
                    <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-caramel-600">
                      {label}
                    </dt>
                    <dd className="mt-1 text-[0.85rem] text-cacao-700">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl text-cacao-900">Combina com</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
