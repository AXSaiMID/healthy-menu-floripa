#!/usr/bin/env node
/**
 * Verifica se todas as fotos cadastradas no catálogo existem de verdade.
 *
 *   npm run check:images
 *
 * Checa três coisas para cada produto:
 *   1. se o caminho da imagem está preenchido;
 *   2. se o arquivo existe dentro de public/;
 *   3. se o conteúdo é mesmo uma imagem válida (e não um arquivo truncado).
 *
 * Útil depois de cadastrar produtos pelo painel, ou quando alguma foto
 * aparece quebrada no site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

/* Como identificar os formatos que o navegador entende */
const SIGNATURES = [
  { name: 'JPEG', bytes: [0xff, 0xd8, 0xff], ext: ['.jpg', '.jpeg'] },
  { name: 'PNG', bytes: [0x89, 0x50, 0x4e, 0x47], ext: ['.png'] },
  { name: 'GIF', bytes: [0x47, 0x49, 0x46], ext: ['.gif'] },
  { name: 'WEBP', bytes: [0x52, 0x49, 0x46, 0x46], ext: ['.webp'] },
  { name: 'AVIF', bytes: [0x00, 0x00, 0x00, 0x20], ext: ['.avif'] },
  { name: 'SVG', bytes: [0x3c, 0x3f, 0x78, 0x6d], ext: ['.svg'] },
  { name: 'SVG', bytes: [0x3c, 0x73, 0x76, 0x67], ext: ['.svg'] },
];

function inspect(file) {
  const stat = fs.statSync(file);
  const buffer = fs.readFileSync(file);
  const head = [...buffer.subarray(0, 8)];

  const match = SIGNATURES.find((sig) => sig.bytes.every((byte, index) => head[index] === byte));
  const truncatedJpeg =
    match?.name === 'JPEG' &&
    !(buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9);

  return {
    size: stat.size,
    format: match?.name ?? 'formato não reconhecido',
    ok: Boolean(match) && !truncatedJpeg && stat.size > 1024,
    truncated: truncatedJpeg,
  };
}

/* ------------------------- carrega o catálogo ------------------------- */
process.env.DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const { all } = await import('../server/db.js');

const products = all('SELECT id, name, image_url, gallery FROM products ORDER BY category, sort_order');

if (products.length === 0) {
  console.log('\n⚠️  Nenhum produto cadastrado ainda.\n');
  process.exit(0);
}

let problems = 0;
let checked = 0;
const lines = [];

for (const product of products) {
  const gallery = (() => {
    try {
      return JSON.parse(product.gallery ?? '[]');
    } catch {
      return [];
    }
  })();

  const urls = [product.image_url, ...gallery].filter(Boolean);

  if (urls.length === 0) {
    problems += 1;
    lines.push(`❌ ${product.name}\n     sem imagem cadastrada`);
    continue;
  }

  for (const url of urls) {
    checked += 1;
    const file = path.join(PUBLIC_DIR, url.replace(/^\//, '').split('?')[0]);

    if (!fs.existsSync(file)) {
      problems += 1;
      lines.push(`❌ ${product.name}\n     arquivo não encontrado: public${url}`);
      continue;
    }

    const info = inspect(file);
    if (!info.ok) {
      problems += 1;
      const motivo = info.truncated
        ? 'arquivo truncado (JPEG sem marcador de fim)'
        : `conteúdo inválido — detectado: ${info.format}`;
      lines.push(`❌ ${product.name}\n     ${url} — ${motivo}`);
      continue;
    }

    lines.push(`✅ ${product.name.padEnd(42)} ${url} (${info.format}, ${(info.size / 1024).toFixed(0)} kB)`);
  }
}

/* --------------------------- arquivos órfãos --------------------------- */
const imagesDir = path.join(PUBLIC_DIR, 'images');
const used = new Set(
  products
    .flatMap((product) => {
      const gallery = (() => {
        try {
          return JSON.parse(product.gallery ?? '[]');
        } catch {
          return [];
        }
      })();
      return [product.image_url, ...gallery];
    })
    .filter(Boolean)
    .map((url) => url.replace(/^\//, '').split('?')[0]),
);

const orphans = fs.existsSync(imagesDir)
  ? fs
      .readdirSync(imagesDir)
      .filter((name) => !used.has(`images/${name}`))
      .sort()
  : [];

/* -------------------------------- saída -------------------------------- */
console.log('\n🍏  Verificação das fotos do catálogo\n');
lines.forEach((line) => console.log(`  ${line}`));

if (orphans.length) {
  console.log('\n  Arquivos em public/images não vinculados a produtos (usados pelas páginas):');
  orphans.forEach((name) => console.log(`    • ${name}`));
}

console.log(
  `\n  ${checked} imagem(ns) verificada(s) em ${products.length} produto(s): ` +
    `${problems === 0 ? '✅ nenhum problema' : `❌ ${problems} problema(s)`}\n`,
);

process.exit(problems === 0 ? 0 : 1);
