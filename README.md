# Healthy Menu Floripa 🍫

Site institucional + loja online + painel administrativo da **Healthy Menu Floripa**,
empresa de alimentação natural de São João do Rio Vermelho, Norte da Ilha, Florianópolis/SC.

O carro-chefe da casa são os **brownies artesanais 50% cacau** (7×7 cm, cremosos por dentro e
crocantes por fora), hoje vendidos na região Norte da Ilha e em expansão para todo o Brasil.

---

## Identidade visual

A marca é construída a partir da **maçã verde** da logo oficial, com "Seu cardápio saudável"
como assinatura de marca.

| Elemento | Onde está | Observação |
| --- | --- | --- |
| Logo em vetor | `public/logo.svg` | Disco com o nome na curva, maçã, folha e a assinatura manuscrita |
| Maçã (símbolo) | `src/components/Logo.jsx` | SVG inline, 3 tons: `color`, `mono-dark` e `mono-light` |
| Favicon | `public/favicon.svg` | Maçã sobre disco verde escuro |

### Paleta

| Token | Uso | Cor |
| --- | --- | --- |
| `leaf-*` | Verde da marca: textos, botões, cabeçalhos | `#2F6B32` (600) · `#163F23` (900) |
| `lime-*` | Verde-claro da maçã: acentos, CTAs, selos | `#A9D86E` (400) · `#92C951` (500) |
| `cream-*` | Fundos claros esverdeados | `#F8FBF5` (100) |
| `sage-*` | Estados neutros e de sucesso | `#6D9A63` (500) |
| `cacao-*` | Reservado a detalhes de chocolate | `#241209` (900) |

Tipografia: **Fraunces** (títulos), **Plus Jakarta Sans** (texto) e **Caveat** (assinatura
manuscrita, usada em destaques como "brownie de verdade").

> Para usar o PNG original da logo em vez do vetor, salve-o como `public/logo.png` e troque o
> componente `<Logo />` por `<img src="/logo.png" />` — ou substitua `public/logo.svg`.

### Animações

- **Revelação no scroll** — `<Reveal>` e `<Stagger>` (`src/components/motion.jsx`) com
  `IntersectionObserver`; cada elemento aparece uma única vez, com entrada escalonada.
- **Micro-interações** — botões com brilho (`btn-shine`) e leve elevação, cards que sobem no
  hover, zoom suave nas fotos, ícone do carrinho que balança ao adicionar item.
- **Contadores animados** no hero (preço inicial, itens, avaliação) com `useCountUp`.
- **Parallax** discreto na foto do hero e flutuações de folhas/gradientes nas seções.
- **Faixa infinita** com as frases da marca, que pausa no hover.
- **Confete** na tela de pedido concluído e transição suave entre páginas.
- Tudo é desativado automaticamente quando o sistema pede **"reduzir movimento"**
  (`prefers-reduced-motion`).

---

## O que está pronto

### Site público
| Página | Rota | Conteúdo |
| --- | --- | --- |
| Home | `/` | Hero com foto do brownie, diferenciais, vitrine de destaques, história, categorias, combos, como pedir, avaliações do Google e CTA |
| Cardápio | `/cardapio` | Filtro por categoria (sincronizado com a URL), busca por texto e ordenação |
| Produto | `/produto/:slug` | Foto, descrição completa, selos, quantidade, "comprar agora", WhatsApp e sugestões |
| Carrinho | `/carrinho` | Revisão dos itens, resumo e início do checkout |
| Nossa história | `/sobre` | História da empresa, compromissos e linha do tempo |
| Entregas | `/entregas` | Bairros atendidos, taxas, envio nacional e perguntas frequentes |
| Contato | `/contato` | WhatsApp, Instagram, mapa do Google e formulário que monta a mensagem |

### Carrinho → WhatsApp (o coração da operação)
1. O cliente adiciona produtos ao carrinho (persistido no navegador).
2. Abre o carrinho lateral e escolhe **entrega** ou **retirada**.
3. Preenche os dados completos do comprador: nome, WhatsApp, e-mail, CPF (opcional) e
   endereço com **preenchimento automático pelo CEP (ViaCEP)**.
4. Escolhe a forma de pagamento e escreve observações.
5. O pedido é **registrado no banco** (código sequencial `HM-0001`) com todos os itens,
   frete e total recalculados no servidor e, em seguida, abre o **WhatsApp da empresa com a
   mensagem do pedido já formatada** (itens, valores, dados do comprador, endereço, pagamento).

Regras aplicadas automaticamente: pedido mínimo para entrega, taxa de entrega na Ilha,
frete grátis acima de um valor configurável e produtos de venda nacional sem taxa local.

### Painel administrativo (`/admin`)
| Área | O que faz |
| --- | --- |
| Visão geral | Faturamento, lucro líquido, despesas, itens vendidos, gráfico por dia, ranking de produtos, categorias, formas de pagamento, status e últimos pedidos |
| Pedidos | Filtros por status/período/busca, alteração rápida de status, ficha completa do pedido, observações internas, ajuste de frete/desconto, contato direto com o cliente e exportação em CSV |
| Produtos | Cadastro e edição completa (preço, preço promocional, **custo**, foto, descrições, selos, estoque, categoria), liga/desliga visibilidade, destaque na home e exclusão |
| Financeiro | Receita, custo dos produtos, despesas, lucro bruto e líquido, margem, ponto de equilíbrio, lançamento de despesas por categoria, gráficos e exportação em CSV |
| Clientes | Base de clientes com total gasto, ticket médio, última compra e envio de mensagem |
| Configurações | Dados da empresa, contatos (WhatsApp usado nos pedidos), regras de entrega, textos do site e troca de senha |

O acesso é protegido por sessão em cookie `httpOnly` (a senha é guardada com hash bcrypt).

---

## 🌐 Site no ar

| | |
| --- | --- |
| **Link público (ao vivo)** | https://3001-i10sqlwfup8i72vzhxh9z.e2b.app |
| **Painel da empresa** | https://3001-i10sqlwfup8i72vzhxh9z.e2b.app/admin |
| **Repositório** | https://github.com/AXSaiMID/healthy-menu-floripa |

O site roda em **modo produção** (bundle otimizado, gzip e cache de assets). Ele é servido pelo
proxy da plataforma e vale enquanto este ambiente estiver ativo.

Para um endereço definitivo, com domínio próprio e banco persistente, siga o
**[DEPLOY.md](DEPLOY.md)** — há um `Dockerfile` e um `render.yaml` prontos.

### 📦 Versão empacotada para Netlify (`.zip`)

```bash
npm run build:netlify   # gera a pasta .build/netlify pronta para publicar
npm run zip:netlify     # gera também healthy-menu-floripa-netlify.zip
```

O Netlify publica **arquivos**, não aplicações Node — não existe servidor nem SQLite lá.
Para o site não abrir vazio, esse build compila o projeto em **modo estático**: o catálogo
(com preços e custos reais) é congelado em `src/lib/static/snapshot.json` e as gravações
passam a acontecer no `localStorage` do navegador, com as mesmas regras do servidor
(frete, pedido mínimo, custo, lucro, KPIs do financeiro).

| | Com servidor (Render/Docker) | Modo estático (Netlify) |
| --- | --- | --- |
| Cardápio, fotos e carrinho | ✅ | ✅ |
| Pedido enviado ao WhatsApp | ✅ | ✅ |
| Painel e financeiro | ✅ compartilhado entre aparelhos | ⚠️ só no navegador de quem usa |
| Dados sobrevivem a limpar o navegador | ✅ | ❌ (catálogo de exemplo volta) |

Quem usa o painel na versão estática vê um aviso fixo e um botão **Restaurar dados de exemplo**.
Para o controle financeiro de verdade, use a versão com servidor (`DEPLOY.md`).

---

## Como rodar

Requisitos: **Node.js 20.11+** (usa o SQLite nativo do Node 22).

```bash
npm install       # instala as dependências
npm run dev       # sobe o site em http://localhost:3001
```

Na primeira execução o banco é criado automaticamente em `data/health-menu.db` com:

- 18 produtos com preços oficiais e **custos estimados de produção** (ajuste em Produtos);
- 6 pedidos de demonstração (podem ser excluídos em **Admin → Pedidos**);
- 6 despesas de exemplo no financeiro.

### Acesso ao painel

```
URL:   http://localhost:3001/admin
E-mail: admin@healthymenufloripa.com.br
Senha:  healthy2024
```

> Troque a senha em **Admin → Configurações** logo no primeiro acesso.

### Produção

```bash
npm run build                  # gera o bundle otimizado em dist/
NODE_ENV=production npm start  # serve o site + API na porta 3001
# ou
npm run serve                  # build + start em um comando
```

Em produção o servidor serve o `dist/` com compressão gzip, cache imutável nos assets,
`robots.txt` e `sitemap.xml` gerados na hora (com as URLs dos produtos) e o painel
marcado como `noindex`. Requer **Node 22.5+**.

### Testes rápidos

Com o servidor rodando:

```bash
npm run smoke          # 25 verificações da API e do painel (servidor rodando)
npm run test:static    # 58 verificações do modo estático, sem navegador
npm run check:images   # confere se todas as fotos do catálogo existem e são válidas
```

O `test:static` cobre justamente o que roda no Netlify: catálogo, frete e pedido mínimo,
criação de pedido, mensagem do WhatsApp, painel financeiro, produtos, despesas, clientes,
sessão e exportação CSV.

O `check:images` percorre os produtos do banco, confirma que cada arquivo existe em
`public/`, que o conteúdo é uma imagem de verdade (não um arquivo truncado) e ainda
lista arquivos de foto que nenhum produto está usando.

### Fotos do catálogo

- Ficam em `public/images/` e são referenciadas como `/images/nome-do-arquivo.jpg`.
- **Se uma foto falhar, o site não mostra ícone de imagem quebrada:** o componente
  `ProductImage` tenta carregar de novo com uma URL nova (o que dribla um 404 que
  ficou preso em cache) e, se ainda assim não conseguir, exibe um painel com a maçã
  da marca escrito “foto em breve”. Ao cadastrar produtos no painel, uma **prévia**
  mostra na hora se o caminho da imagem está certo.
- Em desenvolvimento as fotos nunca são cacheadas, então uma imagem recém-adicionada
  aparece no primeiro recarregamento.

---

## Estrutura do projeto

```
Dockerfile              Imagem de produção (Railway, Fly, VPS…)
render.yaml             Blueprint do Render (deploy com um clique)
netlify.toml            Deploy estático pelo Netlify (publica .build/netlify)
netlify/                _redirects, _headers e LEIA-ME que entram no pacote .zip
DEPLOY.md               Passo a passo para publicar com domínio próprio
server/                 API Express + banco SQLite
  db.js                 Conexão, schema e migrações leves
  auth.js               Sessões, hash de senha e middleware
  seed.js               Catálogo, configurações, pedidos e despesas iniciais
  routes/public.js      Catálogo, configurações e criação de pedidos
  routes/auth.js        Login, logout e troca de senha
  routes/admin.js       Dashboard, pedidos, produtos, clientes, despesas e configurações
  index.js              Servidor (API + Vite em dev / dist em produção)

src/
  components/           Header, Footer, CartDrawer, ProductCard, Logo, motion, UI base
  lib/hooks.js          Animação: revelar no scroll, contadores, parallax, scroll
  pages/                Home, Menu, ProductDetail, CartPage, About, Delivery, Contact
  admin/                AdminApp, Login, AdminLayout, Dashboard, Orders, Products,
                        Finance, Customers, Settings
  lib/                  api.js, cart.jsx, site.jsx, toast.jsx, format.js, whatsapp.js
  lib/static/           Modo estático: snapshot.json (catálogo congelado),
                        store.js (banco no navegador) e api.js (mesma API, sem servidor)
  index.css             Design system (Tailwind 4 + paleta cacau/caramelo/creme/sálvia)

public/logo.svg         Logo oficial em vetor
public/favicon.svg      Ícone do navegador (maçã da marca)
public/images/          Fotografia dos produtos
scripts/smoke.mjs       Testes de ponta a ponta da API
scripts/test-static.mjs Testes do modo estático (o que roda no Netlify)
scripts/export-snapshot.mjs  Congela o catálogo do SQLite para o modo estático
scripts/build-netlify.mjs    Compila e empacota o site para o Netlify
```

## Endpoints principais

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/public/bootstrap` | Configurações + catálogo completo (uma chamada só) |
| GET | `/api/public/products/:slug` | Produto individual |
| POST | `/api/public/orders` | Cria o pedido e devolve o código |
| POST | `/api/auth/login` · `/logout` · `GET /me` · `PUT /password` | Sessão do painel |
| GET | `/api/admin/dashboard` | KPIs e gráficos (aceita `from`/`to`) |
| GET/PUT/DELETE | `/api/admin/orders/:id` · `/orders/export.csv` | Gestão de pedidos |
| GET/POST/PUT/DELETE | `/api/admin/products/:id` | Gestão do catálogo |
| GET/POST/PUT/DELETE | `/api/admin/expenses/:id` | Lançamentos financeiros |
| GET | `/api/admin/customers` | Base de clientes consolidada |
| GET/PUT | `/api/admin/settings` | Configurações da empresa |
| GET | `/api/health` | Verificação de saúde (usada pelas hospedagens) |
| GET | `/robots.txt` · `/sitemap.xml` | SEO — gerados dinamicamente com o domínio em uso |

Todas essas rotas têm uma implementação equivalente em `src/lib/static/api.js`, usada
quando o site é publicado sem servidor (Netlify). O front-end não sabe qual das duas
está ativa — a escolha acontece em `src/lib/api.js` pela variável `VITE_STATIC_MODE`.

## Personalização rápida

- **WhatsApp que recebe os pedidos:** Admin → Configurações → `whatsapp` (formato `55` + DDD + número).
- **Preços, fotos e custos:** Admin → Produtos. O campo **custo de produção** alimenta o lucro real do financeiro.
- **Regras de entrega:** Admin → Configurações → pedido mínimo, taxa e frete grátis.
- **Cores e tipografia:** `src/index.css` no bloco `@theme`.
- **Fotografias:** substitua os arquivos em `public/images/` mantendo os mesmos nomes
  (`hero-brownie-fresh.jpg` é a foto de abertura, verde e aberta).
- **Logo:** `public/logo.svg` ou `src/components/Logo.jsx` para o símbolo do cabeçalho.
- **Velocidade das animações:** `hf-*` e as classes `animate-*` em `src/index.css`.

## Variáveis de ambiente (opcionais)

| Variável | Padrão | Para que serve |
| --- | --- | --- |
| `PORT` | `3001` | Porta do servidor |
| `DATA_DIR` | `./data` | Onde guardar o banco SQLite |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@healthymenufloripa.com.br` / `healthy2024` | Credenciais criadas na primeira execução |
| `NODE_ENV=production` | — | Serve o bundle de `dist/` em vez do Vite |
| `COOKIE_SECURE=true` | — | Marca o cookie de sessão como `Secure` (use atrás de HTTPS) |
| `SITE_URL` | detectado da conexão | Endereço final do site, usado no `robots.txt` e no `sitemap.xml` |

---

Feito com carinho para a Healthy Menu Floripa · Florianópolis/SC 🍫
