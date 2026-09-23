import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Spinner, WhatsAppIcon } from './ui.jsx';
import { Confetti } from './motion.jsx';
import ProductImage from './ProductImage.jsx';
import { useCart } from '../lib/cart.jsx';
import { useSite } from '../lib/site.jsx';
import { useToast } from '../lib/toast.jsx';
import { publicApi } from '../lib/api.js';
import { brl, cx, digits, isValidCpf, maskCpf, maskPhone, maskZip } from '../lib/format.js';
import { buildOrderMessage, whatsappLink } from '../lib/whatsapp.js';

const EMPTY_CUSTOMER = { name: '', phone: '', email: '', cpf: '' };
const EMPTY_ADDRESS = {
  zip: '',
  address: '',
  addressNumber: '',
  complement: '',
  district: '',
  city: 'Florianópolis',
  state: 'SC',
};

export default function CartDrawer() {
  const cart = useCart();
  const { settings, number } = useSite();
  const toast = useToast();

  const [step, setStep] = useState('cart');
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cepStatus, setCepStatus] = useState('idle');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!cart.isOpen) {
      setStep('cart');
      return;
    }
    if (cart.pendingStep) {
      setStep(cart.pendingStep);
      cart.clearPendingStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.isOpen, cart.pendingStep]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && cart.isOpen) cart.close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart]);

  /* Consulta de CEP (ViaCEP) */
  useEffect(() => {
    const zip = digits(address.zip);
    if (zip.length !== 8) {
      setCepStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setCepStatus('loading');

    fetch(`https://viacep.com.br/ws/${zip}/json/`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        if (data?.erro) {
          setCepStatus('error');
          return;
        }
        setAddress((current) => ({
          ...current,
          address: data.logradouro || current.address,
          district: data.bairro || current.district,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }));
        setCepStatus('done');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCepStatus('error');
      });

    return () => controller.abort();
  }, [address.zip]);

  const onlyLocalItems = cart.hasOnlyLocal;
  const subtotal = cart.subtotal;

  const deliveryFee = useMemo(() => {
    if (deliveryType !== 'delivery' || onlyLocalItems) return 0;
    const freeFrom = number('free_delivery_from');
    if (freeFrom > 0 && subtotal >= freeFrom) return 0;
    return number('delivery_fee');
  }, [deliveryType, onlyLocalItems, subtotal, number]);

  const total = Math.max(0, subtotal + deliveryFee);
  const minOrder = number('min_order');
  const belowMin = deliveryType === 'delivery' && !onlyLocalItems && subtotal < minOrder;
  const freeFrom = number('free_delivery_from');
  const missingForFreeShipping = freeFrom > 0 ? Math.max(0, freeFrom - subtotal) : 0;

  const validate = () => {
    const next = {};
    if (customer.name.trim().length < 3) next.name = 'Informe seu nome completo.';
    if (digits(customer.phone).length < 10) next.phone = 'WhatsApp com DDD, ex.: (48) 99999-9999.';
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) {
      next.email = 'Confira o e-mail informado.';
    }
    if (customer.cpf && !isValidCpf(customer.cpf)) next.cpf = 'CPF inválido.';

    if (deliveryType === 'delivery') {
      if (digits(address.zip).length !== 8) next.zip = 'Informe o CEP com 8 dígitos.';
      if (address.address.trim().length < 3) next.address = 'Informe a rua/avenida.';
      if (!address.addressNumber.trim()) next.addressNumber = 'Informe o número.';
      if (address.district.trim().length < 2) next.district = 'Informe o bairro.';
      if (address.city.trim().length < 2) next.city = 'Informe a cidade.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (belowMin) {
      toast.error(
        `O pedido mínimo para entrega é ${brl(minOrder)}. Falta ${brl(minOrder - subtotal)}.`,
      );
      return;
    }
    if (!validate()) {
      toast.error('Confira os campos destacados para finalizar seu pedido.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: digits(customer.phone),
          email: customer.email.trim(),
          cpf: digits(customer.cpf),
        },
        address: {
          zip: digits(address.zip),
          address: address.address.trim(),
          addressNumber: address.addressNumber.trim(),
          complement: address.complement.trim(),
          district: address.district.trim(),
          city: address.city.trim(),
          state: address.state.trim() || 'SC',
        },
        deliveryType,
        notes: notes.trim(),
        paymentMethod,
        items: cart.items.map((item) => ({ productId: item.productId, qty: item.qty })),
      };

      const data = await publicApi.createOrder(payload);

      const message = buildOrderMessage({
        order: data.order,
        cart: cart.items,
        settings,
        customer: {
          name: payload.customer.name,
          phone: maskPhone(payload.customer.phone),
          email: payload.customer.email,
          cpf: payload.customer.cpf ? maskCpf(payload.customer.cpf) : '',
        },
        address: { ...payload.address, zip: maskZip(payload.address.zip) },
        deliveryType,
        notes: payload.notes,
        paymentMethod,
      });

      setResult({ order: data.order, message, link: whatsappLink(settings.whatsapp, message) });
      setStep('done');
      cart.clear();
      toast.success(`Pedido ${data.order.code} registrado! Envie no WhatsApp para confirmar.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.isOpen) return null;

  const setField = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  return (
    <>
      <div
        className="animate-fade fixed inset-0 z-[60] bg-leaf-950/45 backdrop-blur-sm"
        onClick={cart.close}
        aria-hidden="true"
      />

      <aside className="animate-drawer fixed inset-y-0 right-0 z-[61] flex w-full max-w-[33rem] flex-col bg-cream-100 shadow-2xl">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between gap-3 border-b border-cream-300 px-5 py-4">
          <div>
            <p className="eyebrow">{step === 'done' ? 'Pedido registrado' : step === 'checkout' ? 'Finalizar pedido' : 'Seu carrinho'}</p>
            <h2 className="text-xl text-leaf-900">
              {step === 'done'
                ? 'Falta só enviar 🍫'
                : step === 'checkout'
                  ? 'Dados de entrega'
                  : cart.count > 0
                    ? `${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`
                    : 'Nada por aqui ainda'}
            </h2>
          </div>
          <button
            type="button"
            onClick={cart.close}
            aria-label="Fechar carrinho"
            className="grid h-10 w-10 place-items-center rounded-full border border-cream-300 bg-white text-leaf-700 transition hover:border-leaf-900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Conteúdo */}
        <div key={step} className="animate-fade flex-1 overflow-y-auto px-5 py-5">
          {step === 'cart' && (
            <CartStep cart={cart} onCheckout={() => setStep('checkout')} />
          )}

          {step === 'checkout' && (
            <CheckoutStep
              customer={customer}
              address={address}
              deliveryType={deliveryType}
              paymentMethod={paymentMethod}
              notes={notes}
              errors={errors}
              cepStatus={cepStatus}
              setCustomer={setField(setCustomer)}
              setAddress={setField(setAddress)}
              setDeliveryType={setDeliveryType}
              setPaymentMethod={setPaymentMethod}
              setNotes={setNotes}
              onBack={() => setStep('cart')}
            />
          )}

          {step === 'done' && <DoneStep result={result} />}
        </div>

        {/* Rodapé */}
        {step !== 'done' && cart.items.length > 0 && (
          <footer className="border-t border-cream-300 bg-white px-5 py-4">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-leaf-600">
                <dt>Subtotal</dt>
                <dd>{brl(subtotal)}</dd>
              </div>
              {step === 'checkout' && deliveryType === 'delivery' && (
                <div className="flex justify-between text-leaf-600">
                  <dt>Frete</dt>
                  <dd>{deliveryFee === 0 ? 'Grátis' : brl(deliveryFee)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold text-leaf-900">
                <dt>Total</dt>
                <dd>{brl(total)}</dd>
              </div>
            </dl>

            {deliveryType === 'delivery' && missingForFreeShipping > 0 && !onlyLocalItems && (
              <p className="mt-3 rounded-xl bg-sage-100 px-3 py-2 text-[0.78rem] font-medium text-sage-700">
                Faltam {brl(missingForFreeShipping)} para você ganhar o frete grátis na Ilha.
              </p>
            )}

            {belowMin && (
              <p className="mt-3 rounded-xl bg-lime-200 px-3 py-2 text-[0.78rem] font-medium text-leaf-800">
                Pedido mínimo para entrega: {brl(minOrder)}. Falta {brl(minOrder - subtotal)}.
              </p>
            )}

            {step === 'cart' ? (
              <Button className="mt-4 w-full" size="lg" onClick={() => setStep('checkout')}>
                Continuar para os dados
              </Button>
            ) : (
              <Button
                className="mt-4 w-full"
                size="lg"
                variant="whatsapp"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? <Spinner /> : <WhatsAppIcon className="h-5 w-5" />}
                {submitting ? 'Registrando pedido…' : 'Finalizar e enviar no WhatsApp'}
              </Button>
            )}

            <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-leaf-500">
              Seu pedido é registrado aqui e enviado para o WhatsApp {settings.whatsapp_display} com
              todos os dados. O pagamento é combinado direto com a loja.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}

/* ------------------------------- Passo: carrinho ------------------------------ */
function CartStep({ cart, onCheckout }) {
  if (cart.items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-200 text-3xl">🍫</div>
        <h3 className="mt-5 text-xl text-leaf-900">Seu carrinho está vazio</h3>
        <p className="mt-2 max-w-xs text-sm text-leaf-500">
          Escolha seus brownies favoritos no cardápio e volte aqui para finalizar.
        </p>
        <Button as={Link} to="/cardapio" onClick={cart.close} className="mt-6">
          Ver o cardápio
        </Button>
      </div>
    );
  }

  return (
    <ul className="stagger is-visible space-y-3">
      {cart.items.map((item) => (
        <li
          key={item.productId}
          className="flex gap-3 rounded-2xl border border-leaf-100 bg-white p-3 transition-shadow hover:shadow-soft"
        >
          <Link
            to={`/produto/${item.slug}`}
            onClick={cart.close}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-200"
          >
            <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/produto/${item.slug}`}
                onClick={cart.close}
                className="text-[0.92rem] font-semibold leading-snug text-leaf-900 hover:text-lime-600"
              >
                {item.name}
              </Link>
              <button
                type="button"
                onClick={() => cart.remove(item.productId)}
                aria-label={`Remover ${item.name}`}
                className="shrink-0 text-leaf-300 transition hover:text-red-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {item.unit && <p className="mt-0.5 text-[0.72rem] text-leaf-400">{item.unit}</p>}

            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 rounded-full border border-cream-300 p-0.5">
                <button
                  type="button"
                  onClick={() => cart.setQty(item.productId, item.qty - 1)}
                  aria-label="Diminuir quantidade"
                  className="grid h-7 w-7 place-items-center rounded-full text-leaf-700 transition hover:bg-cream-200"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => cart.setQty(item.productId, item.qty + 1)}
                  aria-label="Aumentar quantidade"
                  className="grid h-7 w-7 place-items-center rounded-full text-leaf-700 transition hover:bg-cream-200"
                >
                  +
                </button>
              </div>
              <span className="text-[0.95rem] font-bold text-leaf-900">
                {brl(item.price * item.qty)}
              </span>
            </div>
          </div>
        </li>
      ))}

      <li className="flex items-center justify-between px-1 pt-2">
        <Link
          to="/cardapio"
          onClick={cart.close}
          className="text-[0.82rem] font-semibold text-lime-600 hover:text-lime-500"
        >
          + Adicionar mais itens
        </Link>
        <button
          type="button"
          onClick={cart.clear}
          className="text-[0.78rem] text-leaf-400 transition hover:text-red-600"
        >
          Esvaziar carrinho
        </button>
      </li>
    </ul>
  );
}

/* ------------------------------- Passo: checkout ------------------------------ */
function Field({ label, name, error, hint, children }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[0.72rem] text-leaf-400">{hint}</p>}
      {error && <p className="mt-1 text-[0.72rem] font-medium text-red-600">{error}</p>}
    </div>
  );
}

function CheckoutStep({
  customer,
  address,
  deliveryType,
  paymentMethod,
  notes,
  errors,
  cepStatus,
  setCustomer,
  setAddress,
  setDeliveryType,
  setPaymentMethod,
  setNotes,
  onBack,
}) {
  const { settings } = useSite();

  return (
    <div className="space-y-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-lime-600 hover:text-lime-500"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Voltar ao carrinho
      </button>

      <section>
        <h3 className="mb-4 text-[0.95rem] font-bold uppercase tracking-wider text-leaf-800">
          Seus dados
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome completo *" name="name" error={errors.name}>
              <input
                id="name"
                name="name"
                className="field"
                value={customer.name}
                onChange={setCustomer}
                placeholder="Como podemos te chamar?"
                autoComplete="name"
              />
            </Field>
          </div>
          <Field label="WhatsApp *" name="phone" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              className="field"
              value={customer.phone}
              onChange={(event) =>
                setCustomer({ target: { name: 'phone', value: maskPhone(event.target.value) } })
              }
              placeholder="(48) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
          <Field label="E-mail" name="email" error={errors.email} hint="Para enviarmos a nota e o rastreio.">
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              value={customer.email}
              onChange={setCustomer}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </Field>
          <Field label="CPF" name="cpf" error={errors.cpf} hint="Opcional — necessário apenas para nota fiscal.">
            <input
              id="cpf"
              name="cpf"
              className="field"
              value={customer.cpf}
              onChange={(event) =>
                setCustomer({ target: { name: 'cpf', value: maskCpf(event.target.value) } })
              }
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[0.95rem] font-bold uppercase tracking-wider text-leaf-800">
          Como você quer receber?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'delivery', title: 'Entrega', desc: 'Recebo em casa' },
            { id: 'pickup', title: 'Retirada', desc: 'Rio Vermelho' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDeliveryType(option.id)}
              className={cx(
                'rounded-2xl border p-3.5 text-left transition',
                deliveryType === option.id
                  ? 'border-leaf-900 bg-leaf-900 text-cream-100'
                  : 'border-cream-300 bg-white text-leaf-800 hover:border-leaf-300',
              )}
            >
              <span className="block text-[0.9rem] font-semibold">{option.title}</span>
              <span
                className={cx(
                  'mt-0.5 block text-[0.72rem]',
                  deliveryType === option.id ? 'text-cream-300/80' : 'text-leaf-400',
                )}
              >
                {option.desc}
              </span>
            </button>
          ))}
        </div>

        {deliveryType === 'pickup' && (
          <p className="mt-3 rounded-xl bg-cream-200 px-3 py-2.5 text-[0.78rem] leading-relaxed text-leaf-600">
            {settings.pickup_note}
          </p>
        )}

        {deliveryType === 'delivery' && (
          <div className="mt-5 grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <Field label="CEP *" name="zip" error={errors.zip}>
                <div className="relative">
                  <input
                    id="zip"
                    name="zip"
                    className="field"
                    value={address.zip}
                    onChange={(event) =>
                      setAddress({ target: { name: 'zip', value: maskZip(event.target.value) } })
                    }
                    placeholder="88060-000"
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  {cepStatus === 'loading' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-leaf-400">
                      <Spinner />
                    </span>
                  )}
                </div>
              </Field>
            </div>
            <div className="sm:col-span-4">
              <Field
                label="Rua / Avenida *"
                name="address"
                error={errors.address}
                hint={cepStatus === 'done' ? 'Endereço preenchido automaticamente pelo CEP.' : undefined}
              >
                <input
                  id="address"
                  name="address"
                  className="field"
                  value={address.address}
                  onChange={setAddress}
                  autoComplete="street-address"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Número *" name="addressNumber" error={errors.addressNumber}>
                <input
                  id="addressNumber"
                  name="addressNumber"
                  className="field"
                  value={address.addressNumber}
                  onChange={setAddress}
                />
              </Field>
            </div>
            <div className="sm:col-span-4">
              <Field label="Complemento" name="complement">
                <input
                  id="complement"
                  name="complement"
                  className="field"
                  value={address.complement}
                  onChange={setAddress}
                  placeholder="Apto, bloco, referência…"
                />
              </Field>
            </div>
            <div className="sm:col-span-3">
              <Field label="Bairro *" name="district" error={errors.district}>
                <input id="district" name="district" className="field" value={address.district} onChange={setAddress} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Cidade *" name="city" error={errors.city}>
                <input id="city" name="city" className="field" value={address.city} onChange={setAddress} />
              </Field>
            </div>
            <div className="sm:col-span-1">
              <Field label="UF" name="state">
                <input
                  id="state"
                  name="state"
                  maxLength={2}
                  className="field uppercase"
                  value={address.state}
                  onChange={setAddress}
                />
              </Field>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-[0.95rem] font-bold uppercase tracking-wider text-leaf-800">
          Pagamento
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: 'pix', label: 'Pix' },
            { id: 'dinheiro', label: 'Dinheiro' },
            { id: 'cartao', label: 'Cartão na entrega' },
            { id: 'link', label: 'Link de pagamento' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPaymentMethod(option.id)}
              className={cx(
                'rounded-xl border px-3 py-2.5 text-[0.85rem] font-semibold transition',
                paymentMethod === option.id
                  ? 'border-lime-500 bg-lime-200 text-leaf-900'
                  : 'border-cream-300 bg-white text-leaf-600 hover:border-leaf-300',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Field
          label="Observações do pedido"
          name="notes"
          hint="Alergias, ponto do brownie, horário preferido de entrega, mensagem no cartão…"
        >
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="field resize-none"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex.: entregar depois das 18h / sem amendoim / escrever 'Parabéns, Ana!' no cartão"
          />
        </Field>
      </section>
    </div>
  );
}

/* -------------------------------- Passo: pronto ------------------------------- */
function DoneStep({ result }) {
  const cart = useCart();
  if (!result) return null;

  return (
    <div className="relative flex flex-col items-center py-6 text-center">
      <Confetti />
      <div className="animate-pop grid h-20 w-20 place-items-center rounded-full bg-lime-200 text-4xl">
        <svg viewBox="0 0 24 24" fill="none" stroke="#163F23" strokeWidth="2.6" className="h-10 w-10">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-5 text-2xl text-leaf-900">Pedido {result.order.code} registrado!</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-leaf-600">
        Agora envie a mensagem para o nosso WhatsApp {''}
        para confirmarmos o pagamento e o horário de entrega.
      </p>

      <dl className="mt-6 w-full rounded-2xl border border-cream-300 bg-white p-4 text-left text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-leaf-500">Código</dt>
          <dd className="font-semibold">{result.order.code}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-leaf-500">Itens</dt>
          <dd className="font-semibold">{brl(result.order.subtotal)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-leaf-500">Frete</dt>
          <dd className="font-semibold">
            {result.order.deliveryFee > 0 ? brl(result.order.deliveryFee) : 'Grátis'}
          </dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-cream-200 pt-2 text-base">
          <dt className="font-bold">Total</dt>
          <dd className="font-bold">{brl(result.order.total)}</dd>
        </div>
      </dl>

      <Button
        as="a"
        variant="whatsapp"
        size="lg"
        href={result.link}
        target="_blank"
        rel="noopener noreferrer"
        className="animate-pulse-ring mt-6 w-full"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Enviar pedido no WhatsApp
      </Button>

      <button
        type="button"
        onClick={cart.close}
        className="mt-4 text-[0.82rem] font-semibold text-leaf-500 underline-offset-4 hover:text-leaf-800 hover:underline"
      >
        Continuar navegando
      </button>
    </div>
  );
}
