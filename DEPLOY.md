# Publicando o site 🌐

O site da Healthy Menu Floripa é uma aplicação **Node + React**: um único processo serve tanto
as páginas quanto a API (pedidos, catálogo e painel). Existem três formas de colocá-lo no ar:

| | Onde | Servidor | Painel com dados compartilhados |
| --- | --- | --- | --- |
| 1 | Este ambiente (link ao vivo) | ✅ | ✅ |
| 2 | Netlify (pacote `.zip`) | ❌ | ❌ (só no navegador) |
| 3 | Render/Railway/Docker | ✅ | ✅ |

---

## 1. Link ao vivo do ambiente de desenvolvimento (imediato)

Enquanto o projeto está rodando aqui, ele fica acessível publicamente em:

```
https://3001-i10sqlwfup8i72vzhxh9z.e2b.app
```

Esse endereço é servido pelo proxy da plataforma e mostra exatamente o site que está rodando
neste ambiente (site, carrinho, WhatsApp e painel em `/admin`). Ele vale enquanto este
ambiente estiver ativo — ótimo para apresentar, testar com clientes e validar o conteúdo.

Para rodar o servidor localmente e reproduzir o mesmo modo de produção:

```bash
npm run build                 # gera o bundle otimizado em dist/
NODE_ENV=production npm start  # serve site + API na porta 3001
```

---

## 2. Netlify — pacote `.zip` (rápido, sem servidor)

O Netlify publica arquivos estáticos: não roda Node nem SQLite. Para o site não abrir
vazio, existe um build próprio que congela o catálogo no navegador.

```bash
npm run zip:netlify     # gera healthy-menu-floripa-netlify.zip (2,9 MB)
```

**Publicar:** entre em <https://app.netlify.com/drop> e arraste o `.zip`. Em segundos o site
está no ar. Para publicar conectando o repositório, o `netlify.toml` já traz o comando
(`npm run build:netlify`) e a pasta de publicação (`.build/netlify`).

**O que funciona igual:** cardápio com fotos, carrinho com todos os dados do comprador,
frete e pedido mínimo calculados, envio do pedido para o WhatsApp da loja e o painel
completo (pedidos, clientes, financeiro, despesas, produtos, configurações, CSV).

**A diferença:** sem servidor, o painel grava no `localStorage` — cada navegador vê os seus
próprios dados e o histórico se perde ao limpar o navegador. Serve para apresentar o projeto,
treinar a equipe e receber pedidos de verdade pelo WhatsApp; **não** serve como controle
financeiro oficial. Para isso, use a opção 3 abaixo (servidor + banco em arquivo).

O pacote inclui um `LEIA-ME.txt` com esse aviso, escrito para quem for usar o painel.

---

## 3. Endereço definitivo (domínio próprio)

Para um endereço permanente, com HTTPS, domínio da empresa e banco de dados que não se perde,
hospede a aplicação em um serviço que rode Node. **Railway**, **Render** e **Fly.io** funcionam
bem e têm plano gratuito. Abaixo, o caminho mais rápido:

### Opção A — Render (tem `render.yaml` pronto) — recomendado para o painel oficial

1. Crie uma conta em [render.com](https://render.com) e conecte o GitHub.
2. **New → Blueprint** e escolha o repositório `AXSaiMID/healthy-menu-floripa`.
3. O Render lê o `render.yaml` e já configura build, start e as variáveis.
4. Em **Environment**, defina `ADMIN_PASSWORD` com uma senha forte (a senha padrão é de
   demonstração) e `SITE_URL` com o endereço final, por exemplo
   `https://healthymenufloripa.com.br`.
5. Clique em **Deploy**. Em poucos minutos o site está no ar no endereço
   `https://healthy-menu-floripa.onrender.com`.

> **Importante:** no plano gratuito o disco é temporário — o banco SQLite pode ser zerado em
> novos deploys. Para manter os pedidos, adicione um **Persistent Disk** montado em `/data` e
> defina a variável `DATA_DIR=/data`. Assim o catálogo, os pedidos e o financeiro ficam salvos.

### Opção B — Railway

1. Crie uma conta em [railway.app](https://railway.app) e **New Project → Deploy from GitHub repo**.
2. O `Dockerfile` na raiz é detectado automaticamente.
3. Em **Variables**, adicione:
   - `NODE_ENV=production`
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD` (acesso ao painel)
   - `SITE_URL=https://seu-dominio.com.br`
4. Em **Settings → Volumes**, crie um volume montado em `/data` (e mantenha `DATA_DIR=/data`).
5. **Settings → Networking → Generate Domain** para ter o endereço público; depois dá para
   apontar o domínio próprio.

### Opção C — Docker em qualquer servidor

```bash
docker build -t healthy-menu .
docker run -d \
  --name healthy-menu \
  -p 3001:3001 \
  -v healthy-menu-data:/data \
  -e NODE_ENV=production \
  -e SITE_URL=https://seu-dominio.com.br \
  -e ADMIN_PASSWORD=uma-senha-forte \
  healthy-menu
```

---

## Variáveis de ambiente

| Variável | Padrão | Para que serve |
| --- | --- | --- |
| `PORT` | `3001` | Porta do servidor |
| `NODE_ENV` | — | Use `production` para servir o bundle de `dist/` |
| `DATA_DIR` | `./data` | Pasta do banco SQLite — **use um volume em produção** |
| `SITE_URL` | detectado | Endereço final, usado no `robots.txt` e no `sitemap.xml` |
| `ADMIN_EMAIL` | `admin@healthymenufloripa.com.br` | Login criado na primeira execução |
| `ADMIN_PASSWORD` | `healthy2024` | Senha criada na primeira execução — **troque em produção** |
| `COOKIE_SECURE` | — | Use `true` se o site estiver só em HTTPS |

Requisito de runtime: **Node.js 22.5 ou superior** (o site usa o SQLite nativo do Node).
Se o servidor reclamar de `node:sqlite`, defina `NODE_OPTIONS=--experimental-sqlite`.

---

## Depois de publicar: checklist

- [ ] Rodar `npm run build` e confirmar que o site abre em `/`
- [ ] Entrar em `/admin` e **trocar a senha** em *Configurações*
- [ ] Conferir o número de WhatsApp em *Configurações* (formato `55` + DDD + número)
- [ ] Fazer um pedido de teste e confirmar que a mensagem chega no WhatsApp da empresa
- [ ] Ajustar pedido mínimo, taxa de entrega e frete grátis em *Configurações*
- [ ] Revisar os **custos de produção** de cada produto (alimentam o lucro no financeiro)
- [ ] Substituir as fotos ilustrativas pelas fotos reais em `public/images/`
- [ ] Apontar o domínio da empresa (registro A/CNAME conforme instruções da hospedagem)
- [ ] Confirmar que `/robots.txt` e `/sitemap.xml` respondem com o domínio correto

---

## Como funciona em produção

```
navegador
   │  HTTPS
   ▼
hospedagem (proxy + TLS)
   │
   ▼
node server/index.js ──► dist/          site compilado (HTML, JS, CSS, fontes, fotos)
   │                 ──► /api/...       catálogo, pedidos, painel
   ▼
data/healthy-menu.db                    banco SQLite (catálogo, pedidos, despesas, clientes)
```

Um único container, sem serviços externos obrigatórios. O banco é criado e populado
automaticamente na primeira execução.
