#!/usr/bin/env node
/**
 * Gera o pacote do site para publicar no Netlify.
 *
 *   1. atualiza o catálogo congelado (snapshot) a partir do banco SQLite
 *   2. compila o site no "modo estático" (dados no navegador, sem servidor)
 *   3. junta _redirects, _headers, 404.html, robots.txt e o LEIA-ME
 *   4. compacta tudo em healthy-menu-floripa-netlify.zip
 *
 * Rodar com:  npm run build:netlify       (gerar a pasta .build/netlify)
 *             npm run zip:netlify         (gerar também o .zip)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '.build', 'netlify');
const TEMPLATE = path.join(ROOT, 'netlify');
const ZIP_NAME = 'healthy-menu-floripa-netlify.zip';
const ZIP_PATH = path.join(ROOT, '..', ZIP_NAME);

const makeZip = process.argv.includes('--zip');
const step = (message) => console.log(`\n▸ ${message}`);
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

/* ------------------ 1. Catálogo congelado (snapshot) ------------------ */
step('Catálogo: exportando do banco para o navegador');
const dataDir = process.env.DATA_DIR || path.join(ROOT, 'data');
const dbPath = path.join(dataDir, 'healthy-menu.db');

if (fs.existsSync(dbPath)) {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'export-snapshot.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
} else {
  const snapshot = path.join(ROOT, 'src', 'lib', 'static', 'snapshot.json');
  if (!fs.existsSync(snapshot)) {
    console.error('✖ Sem banco e sem snapshot: rode "npm run seed" antes.');
    process.exit(1);
  }
  console.log('  ⚠ Banco não encontrado neste computador — mantendo o snapshot já versionado.');
}

/* ---------------------------- 2. Compilação ---------------------------- */
step('Compilando o site em modo estático');
const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
execFileSync(process.execPath, [viteBin, 'build', '--outDir', path.relative(ROOT, OUT), '--emptyOutDir'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, VITE_STATIC_MODE: 'true' },
});

/* ------------------- 3. Arquivos que o Netlify usa ------------------- */
step('Adicionando arquivos de publicação');

for (const file of fs.readdirSync(TEMPLATE)) {
  fs.copyFileSync(path.join(TEMPLATE, file), path.join(OUT, file));
}

/* Rota desconhecida cai no index.html (mesma função do _redirects). */
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(OUT, '404.html'));

/* robots.txt estático: a versão de servidor gera o seu dinamicamente. */
fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  ['User-agent: *', 'Allow: /', 'Disallow: /admin', ''].join('\n'),
  'utf8',
);

const summary = {
  files: 0,
  bytes: 0,
};
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      summary.files += 1;
      summary.bytes += fs.statSync(full).size;
    }
  }
};
walk(OUT);

console.log(`  ${summary.files} arquivos · ${kb(summary.bytes)}`);
console.log(`  → ${path.relative(ROOT, OUT)}/`);

/* ------------------------- 4. Pacote .zip (opcional) ------------------------- */
if (makeZip) {
  step('Compactando o .zip');
  fs.rmSync(ZIP_PATH, { force: true });
  execFileSync('zip', ['-r', '-q', '-X', '-9', ZIP_PATH, '.'], { cwd: OUT });
  const size = fs.statSync(ZIP_PATH).size;
  const entries = execFileSync('unzip', ['-Z1', ZIP_PATH], { encoding: 'utf8' }).trim().split('\n');
  const topLevel = [...new Set(entries.map((e) => e.split('/')[0]))].sort();

  console.log(`  ${ZIP_NAME} — ${kb(size)} · ${entries.length} arquivos`);
  console.log(`  → ${ZIP_PATH}`);
  console.log(`  raiz do zip: ${topLevel.slice(0, 8).join(', ')}${topLevel.length > 8 ? '…' : ''}`);
  if (!entries.includes('index.html')) {
    console.error('✖ O zip não tem index.html na raiz — o Netlify não conseguiria publicar.');
    process.exit(1);
  }
}

console.log('\n✅ Pacote do Netlify pronto.');
if (!makeZip) console.log('   (rode "npm run zip:netlify" para gerar também o arquivo .zip)');
