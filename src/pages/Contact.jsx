import { useEffect, useState } from 'react';

import {
  Button,
  Container,
  InstagramIcon,
  MapPinIcon,
  SectionHeading,
  WhatsAppIcon,
} from '../components/ui.jsx';
import { useSite } from '../lib/site.jsx';
import { useToast } from '../lib/toast.jsx';
import { whatsappLink } from '../lib/whatsapp.js';
import { maskPhone } from '../lib/format.js';

const SUBJECTS = [
  'Quero fazer um pedido',
  'Encomenda para evento ou empresa',
  'Consultar frete para outro estado',
  'Trabalhe com a gente',
  'Outro assunto',
];

export default function Contact() {
  const { settings } = useSite();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', subject: SUBJECTS[0], message: '' });

  useEffect(() => {
    document.title = 'Contato · Healthy Menu Floripa';
  }, []);

  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');
  const hours = String(settings.opening_hours ?? '').split('|').filter(Boolean);

  const submit = (event) => {
    event.preventDefault();
    if (form.name.trim().length < 3 || form.message.trim().length < 5) {
      toast.error('Preencha seu nome e escreva uma mensagem.');
      return;
    }

    const text = [
      `*${form.subject}*`,
      '',
      `Nome: ${form.name}`,
      form.phone ? `Telefone: ${maskPhone(form.phone)}` : null,
      '',
      form.message,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(whatsappLink(settings.whatsapp, text), '_blank', 'noopener,noreferrer');
    toast.success('Abrimos o WhatsApp com a sua mensagem pronta!');
  };

  const mapQuery = encodeURIComponent(
    `${settings.address_line || 'São João do Rio Vermelho'}, ${settings.address_city || 'Florianópolis'} - ${settings.address_state || 'SC'}`,
  );

  return (
    <>
      <section className="border-b border-cream-300 bg-white py-16">
        <Container>
          <SectionHeading
            eyebrow="Contato"
            title="Fale com a Healthy Menu Floripa"
            description="Pedidos, encomendas para eventos, dúvidas sobre entrega ou parcerias: o caminho mais rápido é o WhatsApp."
          />
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Canais */}
          <div className="space-y-4">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Olá! Vim pelo site 🙂')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-card border border-cream-300 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#25D366]/15 text-[#128C4A]">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-[1.05rem] text-cacao-900">WhatsApp</h3>
                <p className="mt-1 text-[0.9rem] font-semibold text-cacao-700">
                  {settings.whatsapp_display}
                </p>
                <p className="mt-1 text-[0.8rem] text-cacao-500">
                  Resposta rápida em horário comercial. Pedidos e orçamentos.
                </p>
              </div>
            </a>

            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-card border border-cream-300 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-caramel-200 text-caramel-600">
                <InstagramIcon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-[1.05rem] text-cacao-900">Instagram</h3>
                <p className="mt-1 text-[0.9rem] font-semibold text-cacao-700">
                  {settings.instagram_handle}
                </p>
                <p className="mt-1 text-[0.8rem] text-cacao-500">
                  Fornadas do dia, novidades e combos da semana.
                </p>
              </div>
            </a>

            <a
              href={settings.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-card border border-cream-300 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-100 text-sage-600">
                <MapPinIcon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-[1.05rem] text-cacao-900">Onde estamos</h3>
                <p className="mt-1 text-[0.9rem] font-semibold text-cacao-700">
                  {settings.address_line} · {settings.address_city}/{settings.address_state}
                </p>
                <p className="mt-1 text-[0.8rem] text-cacao-500">
                  {settings.reviews_summary}
                </p>
              </div>
            </a>

            <div className="rounded-card border border-cream-300 bg-white p-6 shadow-soft">
              <h3 className="text-[1.05rem] text-cacao-900">Horário de atendimento</h3>
              <ul className="mt-3 space-y-1.5 text-[0.86rem] text-cacao-600">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulário */}
          <div>
            <form onSubmit={submit} className="rounded-card border border-cream-300 bg-white p-7 shadow-soft">
              <h2 className="text-[1.35rem] text-cacao-900">Envie sua mensagem</h2>
              <p className="mt-2 text-[0.86rem] text-cacao-500">
                Preencha e a gente abre o WhatsApp com tudo pronto — é só enviar.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="label" htmlFor="c-name">Seu nome *</label>
                  <input
                    id="c-name"
                    className="field"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Nome e sobrenome"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Telefone / WhatsApp</label>
                  <input
                    id="c-phone"
                    className="field"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: maskPhone(event.target.value) })}
                    placeholder="(48) 99999-9999"
                    inputMode="tel"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="c-subject">Assunto</label>
                  <select
                    id="c-subject"
                    className="field"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="c-message">Mensagem *</label>
                  <textarea
                    id="c-message"
                    rows={5}
                    className="field resize-none"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Conte o que você precisa — quantidade, data, cidade…"
                  />
                </div>
              </div>

              <Button type="submit" variant="whatsapp" size="lg" className="mt-6 w-full">
                <WhatsAppIcon className="h-5 w-5" />
                Enviar pelo WhatsApp
              </Button>
            </form>

            <div className="mt-6 overflow-hidden rounded-card border border-cream-300 shadow-soft">
              <iframe
                title="Localização Healthy Menu Floripa"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&hl=pt-BR`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
