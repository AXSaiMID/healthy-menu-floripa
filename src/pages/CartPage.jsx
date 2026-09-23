import { Link } from 'react-router-dom';
import { useEffect } from 'react';

import { Button, Container, EmptyState, SectionHeading, WhatsAppIcon } from '../components/ui.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { useCart } from '../lib/cart.jsx';
import { useSite } from '../lib/site.jsx';
import { brl } from '../lib/format.js';

export default function CartPage() {
  const cart = useCart();
  const { settings, number } = useSite();

  useEffect(() => {
    document.title = 'Meu carrinho · Healthy Menu Floripa';
  }, []);

  const freeFrom = number('free_delivery_from');
  const missing = freeFrom > 0 ? Math.max(0, freeFrom - cart.subtotal) : 0;

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Seu pedido"
        title="Carrinho"
        description="Confira os itens escolhidos e continue para informar seus dados. No fim, o pedido é enviado direto para o nosso WhatsApp."
      />

      {cart.items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<span className="text-5xl">🍫</span>}
            title="Seu carrinho está vazio"
            description="Que tal começar pelos nossos brownies mais pedidos? O clássico 50% cacau é um ótimo ponto de partida."
            action={
              <Button as={Link} to="/cardapio" variant="caramel" size="lg">
                Ver o cardápio
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {cart.items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-col gap-4 rounded-card border border-cream-300 bg-white p-4 shadow-soft sm:flex-row sm:items-center"
              >
                <Link
                  to={`/produto/${item.slug}`}
                  className="h-28 w-full overflow-hidden rounded-2xl bg-cream-200 sm:h-24 sm:w-24 sm:shrink-0"
                >
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/produto/${item.slug}`}
                    className="text-[1rem] font-semibold text-cacao-900 hover:text-caramel-600"
                  >
                    {item.name}
                  </Link>
                  {item.unit && <p className="mt-1 text-[0.78rem] text-cacao-400">{item.unit}</p>}
                  <p className="mt-1 text-[0.82rem] text-cacao-500">
                    {brl(item.price)} a unidade
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1 rounded-full border border-cream-300 p-0.5">
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.productId, item.qty - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-cacao-700 transition hover:bg-cream-200"
                      aria-label="Diminuir"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-semibold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => cart.setQty(item.productId, item.qty + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-cacao-700 transition hover:bg-cream-200"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-cacao-900">{brl(item.price * item.qty)}</p>
                    <button
                      type="button"
                      onClick={() => cart.remove(item.productId)}
                      className="text-[0.72rem] text-cacao-400 transition hover:text-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-cream-300 bg-white p-6 shadow-soft">
              <h2 className="text-[1.1rem] text-cacao-900">Resumo</h2>

              <dl className="mt-5 space-y-2 text-[0.9rem]">
                <div className="flex justify-between text-cacao-600">
                  <dt>Itens</dt>
                  <dd>{cart.count}</dd>
                </div>
                <div className="flex justify-between text-cacao-600">
                  <dt>Subtotal</dt>
                  <dd>{brl(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-cacao-900">
                  <dt>Total</dt>
                  <dd>{brl(cart.subtotal)}</dd>
                </div>
              </dl>

              {missing > 0 && !cart.hasOnlyLocal && (
                <p className="mt-4 rounded-xl bg-sage-100 px-3 py-2 text-[0.78rem] font-medium text-sage-700">
                  Faltam {brl(missing)} para o frete grátis no Norte da Ilha.
                </p>
              )}

              <Button variant="caramel" size="lg" className="mt-6 w-full" onClick={cart.openCheckout}>
                Informar dados e finalizar
              </Button>

              <Button as={Link} to="/cardapio" variant="ghost" className="mt-2 w-full">
                Continuar comprando
              </Button>

              <p className="mt-5 flex items-start gap-2 text-[0.74rem] leading-relaxed text-cacao-500">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                Ao finalizar, seu pedido é registrado no nosso sistema e enviado para o WhatsApp{' '}
                {settings.whatsapp_display} com todos os dados do comprador.
              </p>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
