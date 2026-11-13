#!/usr/bin/env node
// Crea un archivo nuevo desde templates/. Es el camino manual (sin IA); las skills hacen lo mismo.
//   npm run new -- contract Button
//   npm run new -- adr "Usamos Lucide como librería de iconos"
//   npm run new -- audit "Mi Figma"
//   npm run new -- theme dark
//   npm run new -- tokens            (primitive.json + semantic.json + component.json)
//   npm run new -- icons             (icons/registry.json)
//   npm run new -- vocabulary        (contracts/vocabulary.json)
import fs from 'node:fs';
import path from 'node:path';
import { REPO, exists, readText, writeText, today, loadConfig } from './lib.mjs';

const [type, ...rest] = process.argv.slice(2);
const arg = rest.join(' ').trim();
const cfg = loadConfig(REPO) || {};
const P = cfg.paths || { tokens: 'tokens', icons: 'icons', contracts: 'contracts/components', docs: 'docs' };
const tpl = (f) => readText(path.join(REPO, 'templates', f));
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const nextNumber = (dir, min = 1) => {
  const nums = exists(dir) ? fs.readdirSync(dir).map((f) => parseInt(f, 10)).filter((n) => !isNaN(n)) : [];
  return String(Math.max(min - 1, ...nums) + 1).padStart(4, '0');
};
const create = (file, content) => {
  if (exists(file)) { console.log(`✖ Ya existe ${path.relative(REPO, file)}. No lo sobrescribo.`); process.exit(1); }
  writeText(file, content);
  console.log(`✔ Creado ${path.relative(REPO, file)}`);
};
const need = (what) => { if (!arg) { console.log(`✖ Falta ${what}. Ejemplo: npm run new -- ${type} ${what}`); process.exit(1); } };

switch (type) {
  case 'contract': {
    need('Nombre');
    if (!/^[A-Z][A-Za-z0-9]*$/.test(arg)) { console.log('✖ El nombre va en PascalCase: Button, TextField, TabItem'); process.exit(1); }
    const dir = path.join(REPO, P.contracts, arg);
    create(path.join(dir, 'contract.json'), tpl('contract.json').replace('__NAME__', arg));
    create(path.join(dir, 'CHANGELOG.md'), tpl('contract.CHANGELOG.md').replace(/__NAME__/g, arg).replace('__DATE__', today()).replace('`__NODE__`', '(manual)'));
    break;
  }
  case 'adr': {
    need('"Título que enuncia la decisión"');
    const dir = path.join(REPO, P.docs, 'adr');
    const n = nextNumber(dir, 100); // 0001–0099 son del template
    create(path.join(dir, `${n}-${slug(arg)}.md`), tpl('adr.md').replace('NNNN', n).replace('__TITULO__', arg).replace('AAAA-MM-DD', today()));
    break;
  }
  case 'audit': {
    const dir = path.join(REPO, P.docs, 'auditoria');
    const n = nextNumber(dir);
    create(path.join(dir, `${n}-${slug(arg || 'figma')}.md`), tpl('audit.md').replace('NNNN', n).replace('__ARCHIVO__', arg || 'Figma').replace('AAAA-MM-DD', today()));
    break;
  }
  case 'theme': {
    need('modo');
    create(path.join(REPO, P.tokens, 'themes', `${arg}.json`), tpl('tokens.theme.json').replace('__MODE__', arg));
    break;
  }
  case 'tokens':
    for (const t of ['primitive', 'semantic', 'component']) create(path.join(REPO, P.tokens, `${t}.json`), tpl(`tokens.${t}.json`));
    break;
  case 'icons':
    create(path.join(REPO, P.icons, 'registry.json'), tpl('icons.registry.json'));
    break;
  case 'vocabulary':
    create(path.join(REPO, 'contracts', 'vocabulary.json'), tpl('vocabulary.json'));
    break;
  default:
    console.log('Uso: npm run new -- <contract|adr|audit|theme|tokens|icons|vocabulary> [nombre]');
    process.exit(type ? 1 : 0);
}
