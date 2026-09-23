import { Link } from 'react-router-dom';
import { useEffect } from 'react';

import { Badge, Button, Container, InstagramIcon, SectionHeading, WhatsAppIcon } from '../components/ui.jsx';
import { FloatingDecor, GradientBlobs, Reveal, ShimmerBadge, Stagger, WaveDivider } from '../components/motion.jsx';
import { useSite } from '../lib/site.jsx';

const VALUES = [
  {
    title: 'Ingrediente de verdade',
    text: 'Chocolate 50% cacau, manteiga, ovos e frutas secas selecionadas. Sem mistura pronta e sem conservantes.',
  },
  {
    title: 'Porções que respeitam a sua meta',
    text: 'Cada brownie tem 7x7 cm e informações que cabem na sua dieta. Zero açúcar e versões veganas disponíveis.',
  },
  {
    title: 'Produção artesanal',
    text: 'Fornadas pequenas, todos os dias, na nossa cozinha no Rio Vermelho. Você sente a diferença na primeira mordida.',
  },
  {
    title: 'Consciência ambiental',
    text: 'Embalagens 100% biodegradáveis, sacolas compostáveis e entregas agrupadas para reduzir deslocamentos.',
  },
];

const TIMELINE = [
  { year: 'O começo', text: 'Marmitas fitness e tapiocas entregues para quem treinava no Norte da Ilha.' },
  { year: 'O brownie', text: 'A receita 50% cacau virou o pedido mais repetido — e depois o nosso carro-chefe.' },
  { year: 'Hoje', text: 'Brownies artesanais em caixas para presente, combos e envio para todo o Brasil.' },
];

export default function About() {
  const { settings } = useSite();

  useEffect(() => {
    document.title = 'Nossa história · Healthy Menu Floripa';
  }, []);

  const waNumber = String(settings.whatsapp ?? '').replace(/\D/g, '');

  return (
    <>
      <section className="relative overflow-hidden border-b border-leaf-100 bg-white py-16">
        <GradientBlobs className="opacity-70" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              eyebrow="Nossa história"
              title="Comida de verdade, feita por mãos que gostam de cozinhar"
              description={settings.about_story}
            />
          </Reveal>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <Reveal variant="left" className="overflow-hidden rounded-[2rem] bg-leaf-100 shadow-lift">
            <img
              src="/images/kitchen-atelier.jpg"
              alt="Cozinha artesanal da Healthy Menu Floripa"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          </Reveal>

          <Reveal variant="right" delay={1}>
            <h2 className="text-3xl text-leaf-900">Do Rio Vermelho para o Brasil</h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-leaf-600">
              Tudo começou com uma pergunta simples: por que comida saudável precisa ser sem graça?
              Foi testando receitas na nossa própria cozinha, no bairro São João do Rio Vermelho,
              que chegamos no brownie que não pesa na consciência e nem no paladar.
            </p>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-leaf-600">
              Hoje atendemos a região Norte da Ilha com entrega rápida — Rio Vermelho, Ingleses,
              Santinho, Canasvieiras, Jurerê e Cachoeira do Bom Jesus — e enviamos brownies
              embalados com cuidado para qualquer cidade do país.
            </p>

            <div className="mt-9 space-y-5">
              {TIMELINE.map((item) => (
                <div key={item.year} className="flex gap-4">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-lime-500" />
                  <div>
                    <p className="text-[0.8rem] font-bold uppercase tracking-wider text-lime-600">
                      {item.year}
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-relaxed text-leaf-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/cardapio" variant="lime">
                Ver o cardápio
              </Button>
              <Button
                as="a"
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Conversar com a gente
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>

      <section className="grain bg-cream-200/70 py-16">
        <Container>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="No que acreditamos"
              title="Quatro compromissos em cada fornada"
            />
          </Reveal>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-card border border-leaf-100 bg-white p-7 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-lime-300 hover:shadow-lift">
                <Badge tone="sage">Compromisso</Badge>
                <h3 className="mt-4 text-[1.15rem] text-leaf-900">{value.title}</h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-leaf-500">{value.text}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </section>

      <Container className="py-16">
        <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-cream-300 bg-white px-8 py-12 text-center shadow-soft">
          <h2 className="max-w-2xl text-3xl leading-tight text-leaf-900">
            Quer ver a produção do dia e as novidades?
          </h2>
          <p className="max-w-lg text-[0.95rem] leading-relaxed text-leaf-600">
            Postamos as fornadas, os combos da semana e as novidades primeiro no Instagram.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              as="a"
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              variant="lime"
              size="lg"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
              Seguir {settings.instagram_handle}
            </Button>
            <Button as={Link} to="/contato" variant="outline" size="lg">
              Formas de contato
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
