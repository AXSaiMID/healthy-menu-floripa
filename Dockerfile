# ─────────────────────────────────────────────────────────────
#  Healthy Menu Floripa — imagem de produção
#  Um único container serve o site (dist/) e a API (Express + SQLite).
# ─────────────────────────────────────────────────────────────

# ── Etapa 1: build do front-end ──
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ── Etapa 2: runtime enxuto ──
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
# Banco de dados fora da imagem, para sobreviver a novos deploys (use um volume aqui)
ENV DATA_DIR=/data

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY server ./server

RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.js"]
