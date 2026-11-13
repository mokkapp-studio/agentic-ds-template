#!/usr/bin/env node
// tokens/*.json (DTCG) → tokens/build/tokens.css + tokens/build/tokens.json
//   npm run tokens
// - Modo por defecto (ds.config.modes[0]) en :root.
// - Cada tokens/themes/<modo>.json en [data-theme="<modo>"], solo lo que cambia.
// - Las referencias {a.b} se emiten como var(--prefijo-a-b): la cadena se conserva.
// No edites lo generado: cambia el JSON y vuelve a ejecutar.
import path from 'node:path';
import { REPO, rootFromArgs, loadConfig, loadTokens, writeText, REF } from './lib.mjs';

const ROOT = rootFromArgs();
const cfg = loadConfig(ROOT);
const prefix = cfg?.prefix || 'ds';
const modes = cfg?.modes || ['light'];
const T = loadTokens(ROOT, cfg);

if (!T.all.size) {
  console.log('ℹ No hay tokens todavía (tokens/primitive.json, semantic.json…). Ejecuta la skill ds-tokens.');
  process.exit(0);
}

const v = (p) => `--${prefix}-${p.replace(/\./g, '-')}`;
const errors = [];
const ref = (r, from) => {
  if (!T.all.has(r)) errors.push(`${from} → referencia rota {${r}}`);
  return T.all.get(r);
};

/** Valor DTCG → CSS. Admite strings y los objetos de DTCG 2025 (dimension {value,unit}, color {hex}). */
function css(value, type, from) {
  if (typeof value === 'string') {
    const m = value.match(REF);
    if (m) { ref(m[1], from); return `var(${v(m[1])})`; }
    return value.replace(/\{([^}]+)\}/g, (_, r) => (ref(r, from), `var(${v(r)})`));
  }
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (type === 'fontFamily') return value.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
    if (type === 'cubicBezier') return `cubic-bezier(${value.join(', ')})`;
    if (type === 'shadow') return value.map((s) => css(s, 'shadow', from)).join(', ');
    return value.join(' ');
  }
  if (value && typeof value === 'object') {
    if ('unit' in value) return `${value.value}${value.unit}`;
    if (type === 'color') return value.hex || `color(${value.colorSpace} ${value.components.join(' ')}${value.alpha !== undefined ? ` / ${value.alpha}` : ''})`;
    if (type === 'shadow') return `${value.inset ? 'inset ' : ''}${css(value.offsetX, 'dimension', from)} ${css(value.offsetY, 'dimension', from)} ${css(value.blur, 'dimension', from)} ${css(value.spread ?? '0', 'dimension', from)} ${css(value.color, 'color', from)}`;
    if (type === 'border') return `${css(value.width, 'dimension', from)} ${css(value.style, 'strokeStyle', from)} ${css(value.color, 'color', from)}`;
  }
  errors.push(`${from}: no sé convertir ${JSON.stringify(value)} (${type})`);
  return 'initial';
}

const TYPO = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/** Declaraciones CSS de un token. Una tipografía se emite como sub-variables + shorthand `font`. */
function decls(t) {
  const name = v(t.path);
  const target = typeof t.value === 'string' && t.value.match(REF) ? T.all.get(t.value.slice(1, -1)) : null;
  if (t.type === 'typography' || target?.type === 'typography') {
    if (target) return [...TYPO.map((k) => `  ${name}-${kebab(k)}: var(${v(target.path)}-${kebab(k)});`), `  ${name}: var(${v(target.path)});`];
    const val = t.value, sub = { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' };
    const out = TYPO.filter((k) => val[k] !== undefined).map((k) => `  ${name}-${kebab(k)}: ${css(val[k], sub[k], t.path)};`);
    out.push(`  ${name}: var(${name}-font-weight) var(${name}-font-size)/var(${name}-line-height) var(${name}-font-family);`);
    return out;
  }
  return [`  ${name}: ${css(t.value, t.type, t.path)};`];
}

const block = (title, list) => (list?.length ? [`  /* ${title} */`, ...list.flatMap(decls)] : []);
const baseType = (p) => T.all.get(p)?.type;
const root = [...block('primitive', T.tiers.primitive), ...block('semantic', T.tiers.semantic), ...block('component', T.tiers.component)];
const themeBlocks = Object.entries(T.themes)
  .filter(([mode]) => mode !== modes[0])
  .map(([mode, list]) => `[data-theme="${mode}"] {\n  color-scheme: ${/dark/.test(mode) ? 'dark' : 'light'};\n${list.map((t) => ({ ...t, type: t.type || baseType(t.path) })).flatMap(decls).join('\n')}\n}`);

if (errors.length) { errors.forEach((e) => console.log(`✖ ${e}`)); process.exit(1); }

const header = `/* GENERADO por scripts/build-tokens.mjs. No editar: cambia tokens/*.json y ejecuta npm run tokens. */\n/* Sistema: ${cfg?.name ?? '(sin nombre)'} · modos: ${modes.join(', ')} */\n`;
const cssOut = `${header}\n:root,\n[data-theme="${modes[0]}"] {\n  color-scheme: ${/dark/.test(modes[0]) ? 'dark' : 'light'};\n${root.join('\n')}\n}\n${themeBlocks.length ? '\n' + themeBlocks.join('\n\n') + '\n' : ''}`;

// Mapa plano para herramientas y docs: ruta → { tier, type, var, value (resuelto), modes }
const resolve = (val, seen = 0) => (typeof val === 'string' && REF.test(val) && seen < 20 ? resolve(T.all.get(val.slice(1, -1))?.value, seen + 1) : val);
const flat = {};
for (const [p, t] of T.all) flat[p] = { tier: t.tier, type: t.type, var: v(p), value: resolve(t.value), description: t.description ?? null };
for (const [mode, list] of Object.entries(T.themes)) for (const t of list) if (flat[t.path]) (flat[t.path].modes ||= {})[mode] = resolve(t.value);

const outDir = path.join(T.dir, 'build');
writeText(path.join(outDir, 'tokens.css'), cssOut);
writeText(path.join(outDir, 'tokens.json'), JSON.stringify(flat, null, 2) + '\n');
console.log(`✔ ${T.all.size} tokens → ${path.relative(REPO, outDir)}/tokens.css (${Object.keys(T.themes).length} modo(s) extra)`);
