import { all, get, run } from './db.js';
import { countAdmins, hashPassword } from './auth.js';

export const DEMO_ADMIN = {
  name: 'Equipe Healthy Menu',
  email: process.env.ADMIN_EMAIL || 'admin@healthymenufloripa.com.br',
  password: process.env.ADMIN_PASSWORD || 'healthy2024',
};

const PRODUCTS = [
  /* --------------------------- BROWNIES --------------------------- */
  {
    name: 'Brownie 50% Cacau Clássico',
    slug: 'brownie-50-cacau-classico',
    category: 'brownies',
    short_desc: 'O nosso carro-chefe: cremoso por dentro, casquinha crocante por fora.',
    description:
      'Nosso brownie clássico, feito com chocolate 50% cacau. Interior ultra cremoso e uma casquinha perfeitamente crocante — o equilíbrio exato entre doçura e intensidade. Produzido artesanalmente, em pequenas fornadas, sem conservantes.',
    price: 12.0,
    cost: 3.8,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-classico.jpg',
    tags: ['Mais vendido', 'Sem conservantes'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 1,
  },
  {
    name: 'Brownie com Castanha de Caju',
    slug: 'brownie-castanha-de-caju',
    category: 'brownies',
    short_desc: 'Chocolatudo, macio, úmido e com pedacinhos crocantes que fazem toda a diferença.',
    description:
      'Brownie de castanha de caju daquele jeito que a gente ama: bem chocolatudo, macio, úmido e com pedacinhos crocantes que fazem toda a diferença. Uma mordida e você já se apaixona!',
    price: 13.99,
    cost: 4.6,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-castanha-caju.jpg',
    tags: ['Castanha de caju'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 2,
  },
  {
    name: 'Brownie com Amendoim',
    slug: 'brownie-com-amendoim',
    category: 'brownies',
    short_desc: 'Interior super cremoso, casquinha crocante e crocância de amendoim torrado.',
    description:
      'Descubra o prazer intenso do nosso Brownie 50% Cacau com amendoim. Com seu interior super cremoso e uma casquinha irresistivelmente crocante, cada mordida é uma obra-prima de sabor e textura.',
    price: 12.0,
    cost: 3.6,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-amendoim.jpg',
    tags: ['Amendoim'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 3,
  },
  {
    name: 'Brownie com Nozes',
    slug: 'brownie-com-nozes',
    category: 'brownies',
    short_desc: 'Massa fudgy com nozes selecionadas em cada mordida.',
    description:
      'Massa fudgy de chocolate 50% cacau com nozes selecionadas. Crocância natural das nozes contrastando com o centro úmido do brownie — uma combinação sofisticada para quem gosta de textura.',
    price: 14.5,
    cost: 5.2,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-nozes.jpg',
    tags: ['Nozes'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 4,
  },
  {
    name: 'Brownie Zero Açúcar',
    slug: 'brownie-zero-acucar',
    category: 'brownies',
    short_desc: 'Todo o prazer do chocolate, sem adição de açúcar.',
    description:
      'A versão que cabe na sua dieta: brownie de chocolate intenso adoçado naturalmente, sem adição de açúcar. Textura densa e cremosa, ideal para quem treina e não quer abrir mão da sobremesa.',
    price: 15.0,
    cost: 4.9,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-zero-acucar.jpg',
    tags: ['Zero açúcar', 'Fit'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 5,
  },
  {
    name: 'Brownie Vegano',
    slug: 'brownie-vegano',
    category: 'brownies',
    short_desc: '100% vegetal, com base de batata-doce e chocolate amargo.',
    description:
      'Brownie vegano com base de batata-doce, cacau 70% e óleo de coco. Sem ingredientes de origem animal, sem lactose e sem ovos — mas com a mesma textura úmida e intensa que você já conhece.',
    price: 15.0,
    cost: 4.7,
    unit: '1 unidade · 7x7 cm',
    image_url: '/images/brownie-vegano.jpg',
    tags: ['Vegano', 'Sem lactose'],
    shipping_scope: 'nacional',
    featured: 0,
    sort_order: 6,
  },

  /* ---------------------------- COMBOS ---------------------------- */
  {
    name: 'Leve 3 Pague 2',
    slug: 'leve-3-pague-2',
    category: 'combos',
    short_desc: 'Três brownies 50% cacau pelo preço de dois.',
    description:
      'Venha se perder no sabor luxuoso do nosso combo de Brownies 50% Cacau. Cremosos por dentro com a casquinha perfeitamente crocante por fora. Leve 3 e pague apenas 2.',
    price: 24.0,
    cost: 11.4,
    unit: '3 unidades · 7x7 cm',
    image_url: '/images/box-brownies.jpg',
    tags: ['Economia', 'Mais pedido'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 1,
  },
  {
    name: 'Caixa Degustação · 4 Sabores',
    slug: 'caixa-degustacao-4-sabores',
    category: 'combos',
    short_desc: 'Clássico, caju, amendoim e nozes para provar todos.',
    description:
      'Quatro brownies, quatro experiências: Clássico 50% cacau, Castanha de Caju, Amendoim e Nozes. Embalados individualmente em caixa kraft biodegradável — perfeito para presentear ou dividir.',
    price: 46.0,
    cost: 18.4,
    unit: '4 unidades',
    image_url: '/images/box-brownies.jpg',
    tags: ['Presente', 'Embalagem biodegradável'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 2,
  },
  {
    name: 'Caixa Presente · 9 Brownies',
    slug: 'caixa-presente-9-brownies',
    category: 'combos',
    short_desc: 'A caixa que virou pedido de aniversário, chá de bebê e lembrancinha.',
    description:
      'Nove brownies artesanais organizados em caixa kraft rígida com papel seda, na combinação de sabores que você escolher. A escolha preferida para presentes, agradecimentos e eventos corporativos. Personalizamos com cartão escrito à mão.',
    price: 99.0,
    cost: 36.0,
    unit: '9 unidades',
    image_url: '/images/box-brownies.jpg',
    tags: ['Presente', 'Personalizável', 'Eventos'],
    shipping_scope: 'nacional',
    featured: 1,
    sort_order: 3,
  },
  {
    name: 'Kit Fit · 6 Zero Açúcar',
    slug: 'kit-fit-6-zero-acucar',
    category: 'combos',
    short_desc: 'Seis brownies sem açúcar para a semana de treino.',
    description:
      'Seis unidades do nosso Brownie Zero Açúcar, embaladas individualmente e congeláveis por até 60 dias. A sobremesa de quem treina sério e não quer sair da dieta.',
    price: 79.0,
    cost: 29.4,
    unit: '6 unidades',
    image_url: '/images/brownie-zero-acucar.jpg',
    tags: ['Zero açúcar', 'Congelável', 'Fit'],
    shipping_scope: 'nacional',
    featured: 0,
    sort_order: 4,
  },

  /* --------------------- SALGADOS E REFEIÇÕES --------------------- */
  {
    name: 'Wrap de Frango',
    slug: 'wrap-de-frango',
    category: 'salgados',
    short_desc: 'Massa de aipim e aveia com patê de frango e salada fresca.',
    description:
      'Delicioso Wrap artesanal, produzido com massa de aipim e aveia temperada com pimenta-do-reino (leve), chimichurri e sal, recheado com patê de frango, alface, cebola roxa, tomate, repolho branco e cream cheese.',
    price: 23.9,
    cost: 9.8,
    unit: '1 wrap',
    image_url: '/images/wrap.jpg',
    tags: ['Sem glúten', 'Proteico'],
    shipping_scope: 'local',
    sort_order: 1,
  },
  {
    name: 'Wrap de Carne',
    slug: 'wrap-de-carne',
    category: 'salgados',
    short_desc: 'Carne moída temperada, salada crocante e cream cheese.',
    description:
      'Delicioso Wrap artesanal, produzido com massa de aipim e aveia temperada com pimenta-do-reino (leve), chimichurri e sal, recheado com carne moída, alface, cebola roxa, tomate, repolho branco e cream cheese.',
    price: 24.9,
    cost: 11.2,
    unit: '1 wrap',
    image_url: '/images/wrap.jpg',
    tags: ['Sem glúten'],
    shipping_scope: 'local',
    sort_order: 2,
  },
  {
    name: 'Wrap Vegano',
    slug: 'wrap-vegano',
    category: 'salgados',
    short_desc: 'Base de aipim com os ingredientes que você escolher.',
    description:
      'Com base de massa de aipim, você escolhe os ingredientes da sua preferência. Uma opção leve, saborosa e 100% vegetal.',
    price: 24.9,
    cost: 10.4,
    unit: '1 wrap',
    image_url: '/images/wrap.jpg',
    tags: ['Vegano'],
    shipping_scope: 'local',
    sort_order: 3,
  },
  {
    name: 'Tapioca Salgada',
    slug: 'tapioca-salgada',
    category: 'salgados',
    short_desc: 'A queridinha do bulking de qualidade — monte do seu jeito.',
    description:
      'A queridinha do bulking de qualidade em sua versão salgada, com ingredientes à sua escolha (monte sua tapioca). Massa fina, bem recheada e feita na hora.',
    price: 16.98,
    cost: 6.2,
    unit: '1 unidade',
    image_url: '/images/tapioca.jpg',
    tags: ['Monte a sua', 'Sem glúten'],
    shipping_scope: 'local',
    sort_order: 4,
  },
  {
    name: 'Tapioca Doce',
    slug: 'tapioca-doce',
    category: 'salgados',
    short_desc: 'Versão doce, com os recheios que você escolher.',
    description:
      'A queridinha do bulking de qualidade em sua versão doce, com ingredientes à sua escolha (monte sua tapioca).',
    price: 20.0,
    cost: 7.1,
    unit: '1 unidade',
    image_url: '/images/tapioca.jpg',
    tags: ['Monte a sua'],
    shipping_scope: 'local',
    sort_order: 5,
  },
  {
    name: 'Fricassê de Frango + Arroz',
    slug: 'fricasse-de-frango-arroz',
    category: 'refeicoes',
    short_desc: 'Molho cremoso de milho e requeijão light, gratinado.',
    description:
      'O Fricassê de Frango é preparado com frango suculento, mergulhado em um cremoso e leve molho de requeijão light com toques de milho verde fresco, coberto com duas camadas de queijo mussarela e batata palha crocante. Acompanha arroz soltinho.',
    price: 33.9,
    cost: 14.6,
    unit: '1 marmita',
    image_url: '/images/fricasse.jpg',
    tags: ['Almoço', 'Proteico'],
    shipping_scope: 'local',
    sort_order: 1,
  },
  {
    name: 'Fricassê de Carne Solitário',
    slug: 'fricasse-de-carne-solitario',
    category: 'refeicoes',
    short_desc: 'Duas camadas de mussarela e batata palha crocante.',
    description:
      'Delicioso Fricassê produzido com carne, duas camadas de queijo mussarela com cobertura de batata palha.',
    price: 27.99,
    cost: 12.8,
    unit: '1 porção',
    image_url: '/images/fricasse.jpg',
    tags: ['Proteico'],
    shipping_scope: 'local',
    sort_order: 2,
  },
  {
    name: 'Mingau de Aveia com Banana',
    slug: 'mingau-de-aveia-com-banana',
    category: 'zero-acucar',
    short_desc: 'Café da manhã nutritivo, zero açúcar e zero lactose.',
    description:
      'Mingau de aveia com banana preparado com leite zero lactose integral e uma pitada de canela em pó por cima. Uma opção deliciosa e nutritiva para o café da manhã ou lanche da tarde.',
    price: 20.9,
    cost: 7.4,
    unit: '1 pote 300 ml',
    image_url: '/images/mingau.jpg',
    tags: ['Zero açúcar', 'Zero lactose'],
    shipping_scope: 'local',
    sort_order: 1,
  },
];

const SETTINGS = {
  business_name: 'Healthy Menu Floripa',
  tagline: 'Brownies artesanais e comida de verdade',
  whatsapp: '5548920008689',
  whatsapp_display: '(48) 92000-8689',
  email: 'contato@healthymenufloripa.com.br',
  instagram: 'https://www.instagram.com/healthymenufloripa/',
  instagram_handle: '@healthymenufloripa',
  google_maps: 'https://maps.app.goo.gl/oS9ekyWUMoUgZiQW9',
  address_line: 'São João do Rio Vermelho',
  address_city: 'Florianópolis',
  address_state: 'SC',
  address_note: 'Atendemos toda a região Norte da Ilha: Rio Vermelho, Ingleses, Santinho, Canasvieiras, Jurerê e Cachoeira do Bom Jesus.',
  opening_hours:
    'Seg, Ter e Qua · 11h às 22h|Qui e Sex · 11h às 23h|Dom · 11h às 23h|Sábado · fechado',
  min_order: '25',
  delivery_fee: '8',
  free_delivery_from: '80',
  pickup_note: 'Retirada combinada no Rio Vermelho (São João) — sem custo.',
  pix_key: '48 92000-8689',
  national_shipping: 'Enviamos brownies para todo o Brasil pelos Correios e transportadora. O frete é calculado na conversa do WhatsApp conforme o CEP.',
  free_shipping_from: '180',
  about_story:
    'A Healthy Menu Floripa nasceu no Rio Vermelho, no Norte da Ilha, de um hábito simples: provar que comida de verdade pode ser deliciosa. Começamos com marmitas e tapiocas para quem treina, e foi o brownie — cremoso por dentro, crocante por fora — que conquistou a vizinhança e virou o nosso carro-chefe. Hoje produzimos em pequenas fornadas, todos os dias, com chocolate nobre, sem conservantes e com embalagens biodegradáveis.',
  reviews_summary: '5,0 de 5 estrelas no Google (5 avaliações)',
};

export function seed() {
  let created = 0;

  /* ------------------------------ Admin ------------------------------ */
  if (countAdmins() === 0) {
    run('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)', [
      DEMO_ADMIN.name,
      DEMO_ADMIN.email,
      hashPassword(DEMO_ADMIN.password),
    ]);
    created += 1;
    console.log(`\n  Painel admin criado — usuário: ${DEMO_ADMIN.email} | senha: ${DEMO_ADMIN.password}`);
    console.log('  (troque a senha em Admin → Configurações após o primeiro acesso)\n');
  }

  /* ---------------------------- Configurações ---------------------------- */
  for (const [key, value] of Object.entries(SETTINGS)) {
    const exists = get('SELECT key FROM settings WHERE key = ?', [key]);
    if (!exists) run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }

  /* ------------------------------ Produtos ------------------------------ */
  const productCount = get('SELECT COUNT(*) AS n FROM products')?.n ?? 0;
  if (productCount === 0) {
    for (const p of PRODUCTS) {
      run(
        `INSERT INTO products
          (name, slug, category, short_desc, description, price, promo_price, cost, unit,
           image_url, gallery, tags, shipping_scope, stock, active, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, NULL, 1, ?, ?)`,
        [
          p.name,
          p.slug,
          p.category,
          p.short_desc,
          p.description,
          p.price,
          p.cost ?? 0,
          p.unit,
          p.image_url,
          JSON.stringify(p.gallery ?? []),
          JSON.stringify(p.tags ?? []),
          p.shipping_scope ?? 'nacional',
          p.featured ?? 0,
          p.sort_order ?? 0,
        ],
      );
      created += 1;
    }
    console.log(`  ${PRODUCTS.length} produtos cadastrados.`);
  }

  /* --------------------- Pedidos de demonstração --------------------- */
  /* Ajudam a visualizar o painel e o financeiro no primeiro acesso.
     Cada pedido pode ser excluído em Admin → Pedidos. */
  const orderCount = get('SELECT COUNT(*) AS n FROM orders')?.n ?? 0;
  if (orderCount === 0) {
    const demoOrders = [
      {
        days: 0, offset: 3, name: 'Ana Beatriz Ribeiro', phone: '48991234567',
        email: 'ana.ribeiro@email.com', district: 'Ingleses', payment: 'pix', status: 'novo',
        items: [['brownie-castanha-de-caju', 3], ['leve-3-pague-2', 1]],
      },
      {
        days: 1, offset: 19, name: 'Carlos Eduardo Lima', phone: '48988776655',
        email: 'cadu.lima@email.com', district: 'Canasvieiras', payment: 'cartao', status: 'entregue',
        items: [['caixa-presente-9-brownies', 1]],
      },
      {
        days: 3, offset: 12, name: 'Juliana Martins', phone: '48997654321',
        email: 'ju.martins@email.com', district: 'Jurerê', payment: 'pix', status: 'entregue',
        items: [['brownie-zero-acucar', 6]],
      },
      {
        days: 5, offset: 20, name: 'Rafael Nunes', phone: '48996541230',
        email: '', district: 'Rio Vermelho', payment: 'dinheiro', status: 'entregue',
        items: [['wrap-de-frango', 2], ['brownie-com-amendoim', 2]],
      },
      {
        days: 8, offset: 11, name: 'Patrícia Almeida', phone: '48995432187',
        email: 'patricia.almeida@email.com', district: 'Santinho', payment: 'link', status: 'entregue',
        items: [['caixa-degustacao-4-sabores', 2]],
      },
      {
        days: 11, offset: 16, name: 'Marcos Vinícius Silva', phone: '48994321876',
        email: 'marcos.v@email.com', district: 'Cachoeira do Bom Jesus', payment: 'pix',
        status: 'entregue', items: [['fricasse-de-frango-arroz', 2], ['brownie-50-cacau-classico', 4]],
      },
    ];

    const settings = Object.fromEntries(
      all('SELECT key, value FROM settings').map((row) => [row.key, row.value]),
    );
    const fee = Number(settings.delivery_fee || 8);
    const freeFrom = Number(settings.free_delivery_from || 80);

    let seq = 0;
    for (const demo of demoOrders) {
      seq += 1;
      const resolved = demo.items
        .map(([slug, qty]) => {
          const product = get('SELECT * FROM products WHERE slug = ?', [slug]);
          if (!product) return null;
          const price = product.promo_price > 0 ? product.promo_price : product.price;
          return {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            unitPrice: price,
            unitCost: product.cost,
            qty,
            total: Math.round(price * qty * 100) / 100,
          };
        })
        .filter(Boolean);

      if (!resolved.length) continue;

      const subtotal = Math.round(resolved.reduce((s, i) => s + i.total, 0) * 100) / 100;
      const cost = Math.round(resolved.reduce((s, i) => s + i.unitCost * i.qty, 0) * 100) / 100;
      const deliveryFee = subtotal >= freeFrom ? 0 : fee;
      const total = Math.round((subtotal + deliveryFee) * 100) / 100;

      const created = new Date();
      created.setDate(created.getDate() - demo.days);
      created.setHours(demo.offset, 30, 0, 0);
      const stamp = created.toISOString().slice(0, 19).replace('T', ' ');
      const code = `HM-${String(seq).padStart(4, '0')}`;

      const result = run(
        `INSERT INTO orders (
           code, customer_name, customer_phone, customer_email, customer_cpf,
           delivery_type, zip, address, address_number, complement, district, city, state,
           notes, payment_method, subtotal, delivery_fee, discount, total, cost, status,
           items_json, source, created_at, updated_at
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          code, demo.name, demo.phone, demo.email, '',
          'delivery', '88060-000', 'Rua das Gaivotas', String(100 + seq), '',
          demo.district, 'Florianópolis', 'SC',
          '', demo.payment, subtotal, deliveryFee, 0, total, cost, demo.status,
          JSON.stringify(resolved), 'demo', stamp, stamp,
        ],
      );

      const orderId = Number(result.lastInsertRowid);
      for (const item of resolved) {
        run(
          `INSERT INTO order_items (order_id, product_id, name, unit, unit_price, unit_cost, qty, total)
           VALUES (?,?,?,?,?,?,?,?)`,
          [orderId, item.productId, item.name, item.unit, item.unitPrice, item.unitCost, item.qty, item.total],
        );
      }
    }
    console.log(`  ${demoOrders.length} pedidos de demonstração criados (podem ser excluídos no painel).`);
  }

  /* ------------------------- Financeiro de exemplo ------------------------- */
  const expenseCount = get('SELECT COUNT(*) AS n FROM expenses')?.n ?? 0;
  if (expenseCount === 0) {
    const today = new Date();
    const day = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };
    const demos = [
      ['Chocolate 50% cacau — barra 1,05 kg', 'Insumos', 92.0, 0],
      ['Castanha de caju torrada 1 kg', 'Insumos', 118.5, 2],
      ['Embalagens kraft biodegradáveis (100 un)', 'Embalagens', 145.0, 4],
      ['Gás de cozinha', 'Operacional', 110.0, 6],
      ['Combustível das entregas', 'Entregas', 180.0, 8],
      ['Impulsionamento Instagram', 'Marketing', 60.0, 12],
    ];
    for (const [description, category, amount, offset] of demos) {
      run('INSERT INTO expenses (date, description, category, amount) VALUES (?, ?, ?, ?)', [
        day(offset),
        description,
        category,
        amount,
      ]);
    }
    console.log('  6 despesas de exemplo lançadas no financeiro.');
  }

  return { created, products: all('SELECT id FROM products').length };
}

export { PRODUCTS, SETTINGS };
