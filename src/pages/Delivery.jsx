import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button, Container, MapPinIcon, SectionHeading, WhatsAppIcon } from '../components/ui.jsx';
import { GradientBlobs, Reveal, Stagger } from '../components/motion.jsx';
import { useSite } from '../lib/site.jsx';
import { brl } from '../lib/format.js';

const NEIGHBORHOODS = [
  'Rio Vermelho',
  'São João do Rio Vermelho',
  'Ingleses',
  'Santinho',
  'Canasvieiras',
  'Jurerê',
  'Jurerê Internacional',
  'Cachoeira do Bom Jesus',
  'Vargem do Bom Jesus',
  'Barra da Lagoa',
  'Monte Verde',
  'Córrego Grande (sob consulta)',
];

const FAQ = [
  {
    q: 'Qual o prazo de entrega no Norte da Ilha?',
    a: 'Entre 20 minutos e 1h30, conforme a distância e o volume de pedidos. Você recebe a confirmação do horário pelo WhatsApp.',
  },
  {
    q: 'Vocês enviam brownies para outros estados?',
    a: 'Sim! Embalado individualmente a vácuo/kraft para chegar inteiro. Enviamos pelos Correios ou transportadora — o frete é cotado na conversa do WhatsApp conforme o seu CEP.',
  },
  {
    q: 'Como funciona o pedido mínimo?',
    a: `O pedido mínimo para entrega é ${brl(25)}. Para retirada no Rio Vermelho não há mínimo.`,
  },
  {
    q: 'Qual o prazo de validade e como conservar?',
    a: 'Até 5 dias na geladeira, ou 60 dias congelado. Basta aquecer 15 segundos no micro-ondas para voltar ao ponto cremoso.',
  },
  {
    q: 'Atendem eventos, festas e empresas?',
    a: 'Sim. Produzimos caixas personalizadas para aniversários, chá de bebê, casamentos e brindes corporativos, com cartão escrito à mão e embalagem biodegradável.',
  },
  {
    q: 'Quais as formas de pagamento?',
    a: 'Pix, dinheiro, cartão na entrega (maquininha) ou link de pagamento à distância.',
  },
];

export default function Delivery() {
  const { settings, number } = useSite();

  useEffect(() => {
    document.title = 'Entregas e envios · Healthy Menu Floripa';
  }, []);

  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const hours = String(settings.opening_hours ?? '').split('|').filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden border-b border-leaf-100 bg-white py-16">
        <GradientBlobs className="opacity-60" />
        <Container className="relative">
          <Reveal>
          <SectionHeading
            eyebrow="Entregas e envios"
            title="Entregamos no Norte da Ilha e enviamos para todo o Brasil"
            description="Produção artesanal em Florianópolis, com logística pensada para o brownie chegar intacto — seja na casa do vizinho ou em outro estado."
          />

          </Reveal>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Pedido mínimo (entrega)', value: brl(number('min_order')) },
              {
                label: 'Taxa de entrega na Ilha',
                value: number('delivery_fee') > 0 ? brl(number('delivery_fee')) : 'Grátis',
              },
              { label: 'Frete grátis acima de', value: brl(number('free_delivery_from')) },
            ].map((item) => (
              <div key={item.label} className="rounded-card border border-leaf-100 bg-cream-100 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-lime-300 hover:shadow-soft">
                <p className="text-[0.72rem] font-bold uppercase tracking-wider text-leaf-600">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-3xl text-leaf-900">{item.value}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl text-leaf-900">Bairros atendidos no Norte da Ilha</h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-leaf-600">
              {settings.address_note}
            </p>
            <Stagger as="ul" variant="left" className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {NEIGHBORHOODS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[0.88rem] text-leaf-700">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-lime-500" />
                  {item}
                </li>
              ))}
            </Stagger>

            <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-5">
              <h3 className="text-[1rem] text-leaf-900">Retirada sem custo</h3>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-leaf-600">
                {settings.pickup_note}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl text-leaf-900">Envio para todo o Brasil</h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-leaf-600">
              {settings.national_shipping}
            </p>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: 'Embalagem reforçada',
                  text: 'Brownies embalados individualmente em papel kraft biodegradável e acomodados em caixa rígida com proteção.',
                },
                {
                  title: 'Envio em até 48h',
                  text: 'Produzimos e postamos em até 2 dias úteis após a confirmação do pagamento, sempre no início da semana.',
                },
                {
                  title: 'Rastreio no WhatsApp',
                  text: 'Você recebe o código de rastreio direto no seu WhatsApp assim que a encomenda é postada.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-cream-300 bg-white p-5">
                  <h3 className="text-[1rem] text-leaf-900">{item.title}</h3>
                  <p className="mt-2 text-[0.86rem] leading-relaxed text-leaf-600">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-leaf-900 p-6 text-cream-100">
              <h3 className="text-[1.05rem]">Horários de atendimento</h3>
              <ul className="mt-3 space-y-1.5 text-[0.86rem] text-cream-200/80">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <Button
                as="a"
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Olá! Quero consultar o frete para o meu CEP 📦',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                className="mt-5 w-full"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Consultar frete do meu CEP
              </Button>
            </div>
          </div>
        </div>
      </Container>

      <section className="grain bg-cream-200/70 py-16">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow="Perguntas frequentes" title="Tudo o que você precisa saber" />
          </Reveal>
          <Stagger className="mx-auto mt-12 max-w-3xl space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-cream-300 bg-white px-5 py-4 shadow-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-semibold text-leaf-900">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-200 text-leaf-700 transition group-open:rotate-45">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-[0.88rem] leading-relaxed text-leaf-600">{item.a}</p>
              </details>
            ))}
          </Stagger>

          <div className="mt-12 text-center">
            <Button as={Link} to="/cardapio" variant="lime" size="lg">
              Montar meu pedido
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
