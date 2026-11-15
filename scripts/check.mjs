#!/usr/bin/env node
// Valida TODO el sistema contra schemas/ y las reglas de AGENTS.md.
//   npm run check                 → el sistema del repo
//   npm run check:self            → los fixtures de schemas/fixtures (prueba que el esquema cubre todo)
//   node scripts/check.mjs --quiet → solo errores (lo usa el hook)
// Con el repo recién clonado (vacío) da VERDE: no hay nada que validar todavía.
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO, exists, readJSON, readText, rootFromArgs, loadConfig, validate, validateFile, loadTokens,
  REF, refsIn, expandTokenRef, loadContracts, walkFiles, MODULES, PATTERN_MODULES, NON_INTERACTIVE,
} from './lib.mjs';

const ROOT = rootFromArgs();
const SELF = process.argv.includes('--self');
const QUIET = process.argv.includes('--quiet');
const S = (f) => path.join(REPO, 'schemas', f);
const rel = (p) => path.relative(ROOT, p) || '.';

const out = { error: [], warn: [], info: [] };
const error = (where, msg) => out.error.push(`${where}: ${msg}`);
const warn = (where, msg) => out.warn.push(`${where}: ${msg}`);
const info = (where, msg) => out.info.push(`${where}: ${msg}`);

// ─── 1. Configuración ────────────────────────────────────────────────────────
const cfgFile = path.join(ROOT, 'ds.config.json');
let cfg = loadConfig(ROOT);
if (!cfg) error('ds.config.json', 'no existe');
else {
  validateFile(S('ds-config.schema.json'), cfgFile).errors.forEach((e) => error('ds.config.json', e));
  if (!cfg.name) info('ds.config.json', 'sistema sin configurar. Empieza por la skill ds-setup.');
  else if (!cfg.figma?.bridge) warn('ds.config.json', 'figma.bridge vacío: ds-setup debe comprobar cómo se lee Figma.');
}
const paths = cfg?.paths || { tokens: 'tokens', icons: 'icons', contracts: 'contracts/components', code: 'src/components', docs: 'docs' };

// ─── 2. Tokens ───────────────────────────────────────────────────────────────
const T = loadTokens(ROOT, cfg);
for (const [k, f] of Object.entries(T.files)) validateFile(S('tokens.schema.json'), f).errors.forEach((e) => error(rel(f), e));

const tierOf = (p) => T.all.get(p)?.tier;
for (const [tier, list] of Object.entries(T.tiers)) {
  const where = `${paths.tokens}/${tier}.json`;
  for (const t of list) {
    if (!t.type) warn(where, `${t.path} sin $type (ni en el token ni en su grupo)`);
    for (const r of refsIn(t.value)) {
      const target = tierOf(r);
      if (!target) error(where, `${t.path} → referencia rota {${r}}`);
      else if (tier === 'primitive') error(where, `${t.path}: un primitivo no referencia otros tokens (es un valor)`);
      else if (tier === 'semantic' && target !== 'primitive') error(where, `${t.path} → {${r}} es ${target}; un semántico solo referencia primitivos (ADR 0002)`);
      else if (tier === 'component' && target !== 'semantic') error(where, `${t.path} → {${r}} es ${target}; un token de componente solo referencia semánticos (ADR 0002)`);
    }
    if (tier !== 'primitive' && typeof t.value === 'string' && !REF.test(t.value))
      warn(where, `${t.path} tiene un valor crudo (${t.value}); los semánticos deberían referenciar un primitivo`);
  }
}
const cssNames = new Map();
for (const p of T.all.keys()) { const n = p.replace(/\./g, '-'); if (cssNames.has(n)) error('tokens', `colisión de variable CSS: ${p} y ${cssNames.get(n)}`); cssNames.set(n, p); }

const modes = cfg?.modes || [];
for (const [mode, list] of Object.entries(T.themes)) {
  const where = `${paths.tokens}/themes/${mode}.json`;
  if (!modes.includes(mode)) warn(where, `el modo "${mode}" no está en ds.config.modes`);
  if (mode === modes[0]) warn(where, `"${mode}" es el modo por defecto: sus valores van en semantic.json, no en themes/`);
  for (const t of list) {
    const base = T.all.get(t.path);
    if (!base) error(where, `${t.path} no existe en semantic/component: un modo solo cambia valores de tokens existentes`);
    else if (base.tier === 'primitive') error(where, `${t.path} es primitivo: los modos cambian semánticos, no primitivos`);
    for (const r of refsIn(t.value)) if (!T.all.has(r)) error(where, `${t.path} → referencia rota {${r}}`);
  }
}
for (const m of modes.slice(1)) if (T.tiers.semantic && !T.themes[m]) warn('tokens', `el modo "${m}" está en ds.config pero falta tokens/themes/${m}.json`);
if (exists(path.join(ROOT, paths.tokens, 'tokens.json'))) warn(paths.tokens, 'tokens.json suelto: usa primitive.json / semantic.json / component.json');
if (T.tiers.semantic && !exists(path.join(ROOT, paths.tokens, 'build', 'tokens.css'))) warn('tokens', 'falta tokens/build/tokens.css: ejecuta npm run tokens');
else if (T.tiers.semantic) {
  const built = fs.statSync(path.join(ROOT, paths.tokens, 'build', 'tokens.css')).mtimeMs;
  if (Object.values(T.files).some((f) => fs.statSync(f).mtimeMs > built)) warn('tokens', 'tokens.css está desactualizado: ejecuta npm run tokens');
}

/** Valida una ruta de token usada en un contrato. */
function checkTokenRef(where, at, ref, props) {
  if (ref === null) return 'null';
  const expanded = expandTokenRef(ref, props);
  if (!expanded) return error(where, `${at}: comodín en "${ref}" sin prop enum con ese nombre`);
  if (!T.all.size) return; // aún no hay tokens: no se puede comprobar
  for (const r of expanded) {
    const t = T.all.get(r);
    if (!t) error(where, `${at}: el token "${r}" no existe`);
    else if (t.tier === 'primitive') error(where, `${at}: "${r}" es primitivo; usa un semántico o de componente (ADR 0002)`);
  }
}

// ─── 3. Iconos ───────────────────────────────────────────────────────────────
const regFile = path.join(ROOT, paths.icons, 'registry.json');
let registry = null;
if (exists(regFile)) {
  const { data, errors } = validateFile(S('icons.schema.json'), regFile);
  errors.forEach((e) => error(`${paths.icons}/registry.json`, e));
  registry = data;
  const seen = new Set();
  for (const ic of data?.icons || []) { if (seen.has(ic.name)) error(`${paths.icons}/registry.json`, `icono duplicado ${ic.name}`); seen.add(ic.name); }
  if (T.all.size) for (const s of data?.sizes || []) if (!T.all.has(`icon.size.${s}`)) warn(`${paths.icons}/registry.json`, `no existe el token icon.size.${s}`);
  if (data?.defaults?.size && T.all.size && !T.all.has(data.defaults.size)) error(`${paths.icons}/registry.json`, `defaults.size "${data.defaults.size}" no existe`);
}

// ─── 4. Vocabulario ──────────────────────────────────────────────────────────
const vocFile = path.join(ROOT, 'contracts', 'vocabulary.json');
const replaced = { props: new Map(), states: new Map(), events: new Map() }; // sinónimo → nombre correcto
if (exists(vocFile)) {
  const { data, errors } = validateFile(S('vocabulary.schema.json'), vocFile);
  errors.forEach((e) => error('contracts/vocabulary.json', e));
  for (const kind of Object.keys(replaced)) for (const [name, e] of Object.entries(data?.[kind] || {})) for (const a of e.replaces || []) {
    if (data[kind][a]) error('contracts/vocabulary.json', `${kind}.${name}.replaces incluye "${a}", que es otra entrada del vocabulario`);
    replaced[kind].set(a, name);
  }
}

// ─── 5. Contratos ────────────────────────────────────────────────────────────
const contractSchema = readJSON(S('contract.schema.json'));
const contracts = loadContracts(ROOT, cfg);
const byName = new Map();
for (const c of contracts) {
  if (!c.exists) { error(rel(c.dir), 'carpeta sin contract.json'); continue; }
  try { c.data = readJSON(c.file); } catch (e) { error(rel(c.file), `JSON no válido: ${e.message}`); continue; }
  byName.set(c.data.name, c);
}

const STATUS_RANK = { draft: 0, review: 1, stable: 2, deprecated: 2 };
const usedModules = new Set(), usedPatterns = new Set(), usedClasses = new Set();

for (const c of contracts.filter((c) => c.data)) {
  const d = c.data, W = rel(c.file);
  const rank = STATUS_RANK[d.status] ?? 0;
  const strict = (msg) => (rank >= 1 ? error : warn)(W, msg); // error desde review

  const schemaErrors = validate(contractSchema, d, contractSchema);
  schemaErrors.forEach((e) => error(W, e));
  if (schemaErrors.length) continue;

  if (d.name !== c.name) error(W, `name "${d.name}" no coincide con la carpeta "${c.name}"`);
  const changelog = path.join(c.dir, 'CHANGELOG.md');
  if (!exists(changelog)) strict('falta CHANGELOG.md (cópialo de templates/contract.CHANGELOG.md)');
  else if (!readText(changelog).includes(`## ${d.version}`)) warn(W, `CHANGELOG.md no tiene entrada para ${d.version}`);

  MODULES.forEach((m) => d[m] && usedModules.add(m));
  usedPatterns.add(d.behavior.pattern);

  // Props
  const props = d.props, propNames = new Set();
  for (const p of props) {
    if (propNames.has(p.name)) error(W, `prop duplicada "${p.name}"`);
    propNames.add(p.name);
    if (replaced.props.has(p.name)) error(W, `prop "${p.name}": el vocabulario dice usar "${replaced.props.get(p.name)}"`);
    if (p.type === 'enum' && !p.values?.length) error(W, `prop "${p.name}" es enum sin values`);
    if (p.type === 'enum' && p.default !== null && p.values && !p.values.includes(p.default)) error(W, `prop "${p.name}": default "${p.default}" no está en values`);
  }
  // Estados
  const stateNames = new Set();
  for (const s of d.states) {
    if (stateNames.has(s.name)) error(W, `estado duplicado "${s.name}"`);
    stateNames.add(s.name);
    if (replaced.states.has(s.name)) error(W, `estado "${s.name}": el vocabulario dice usar "${replaced.states.get(s.name)}"`);
    if (s.kind === 'interaction' && s.control !== 'browser') error(W, `estado "${s.name}" es de interacción: control debe ser "browser" (se resuelve con CSS, nunca con una prop)`);
    if (s.kind === 'interaction' && s.prop) error(W, `estado "${s.name}" es de interacción y no puede tener prop (ADR 0003)`);
    if (s.kind !== 'interaction' && s.prop && !propNames.has(s.prop)) error(W, `estado "${s.name}" → prop "${s.prop}" no existe`);
    if (s.kind !== 'interaction' && !s.aria && rank >= 1) warn(W, `estado "${s.name}" sin atributo aria`);
  }
  for (const e of d.behavior.events) if (replaced.events.has(e.name)) error(W, `evento "${e.name}": el vocabulario dice usar "${replaced.events.get(e.name)}"`);

  // Clases de Figma (ADR 0003)
  for (const fp of d.figma.properties) {
    usedClasses.add(fp.class);
    const to = fp.mapsTo || '';
    if (['interaction', 'responsive', 'mode', 'figma-only'].includes(fp.class) && to.startsWith('props.'))
      error(W, `propiedad de Figma "${fp.name}" es de clase "${fp.class}" y no puede ser una prop (ADR 0003)`);
    if (fp.class === 'prop' && !to.startsWith('props.')) warn(W, `propiedad de Figma "${fp.name}" es "prop" pero mapsTo no apunta a props.*`);
    if (fp.class === 'interaction' && !to.startsWith('states.')) warn(W, `propiedad de Figma "${fp.name}" es "interaction": mapsTo debería ser states.*`);
    if (fp.class === 'responsive' && !to.startsWith('layout.responsive')) warn(W, `propiedad de Figma "${fp.name}" es "responsive": mapsTo debería ser layout.responsive`);
    if (fp.class === 'mode' && to && !to.startsWith('tokens')) warn(W, `propiedad de Figma "${fp.name}" es "mode": va a tokens/themes, no al contrato`);
    const [block, key] = to.split('.');
    if (block === 'props' && key && !propNames.has(key)) error(W, `mapsTo "${to}" no existe`);
    if (block === 'states' && key && !stateNames.has(key)) error(W, `mapsTo "${to}" no existe`);
    if (block === 'anatomy' && key && !d.anatomy[key]) error(W, `mapsTo "${to}" no existe`);
  }
  for (const p of props) if (p.figma && !d.figma.properties.some((fp) => fp.name === p.figma.property))
    warn(W, `prop "${p.name}" dice venir de la propiedad de Figma "${p.figma.property}", que no está en figma.properties`);

  // Anatomía y tokens
  const nullTokens = [];
  const review = new Set(d.meta.needsReview.map((n) => n.path));
  const reviewed = (p) => [...review].some((r) => p === r || p.startsWith(r + '.') || r.startsWith(p));
  const condOk = (cond, at) => {
    for (const part of cond.split('&')) {
      const [, k, , v] = part.match(/^([a-zA-Z0-9]+)(!?=)(.+)$/) || [];
      if (k === 'state') { if (!stateNames.has(v)) error(W, `${at}: el estado "${v}" no existe`); continue; }
      const p = props.find((p) => p.name === k);
      if (!p) { error(W, `${at}: "${k}" no es una prop ni "state"`); continue; }
      if (p.type === 'enum' && !p.values.map(String).includes(v)) error(W, `${at}: "${v}" no es un valor de ${k}`);
      if (p.type === 'boolean' && !['true', 'false'].includes(v)) error(W, `${at}: ${k} es boolean (true/false)`);
    }
  };
  for (const [part, def] of Object.entries(d.anatomy)) {
    if (def.parent && !d.anatomy[def.parent]) error(W, `anatomy.${part}.parent "${def.parent}" no existe`);
    for (const [prop, ref] of Object.entries(def.tokens || {}))
      if (checkTokenRef(W, `anatomy.${part}.tokens.${prop}`, ref, props) === 'null') nullTokens.push(`anatomy.${part}.tokens.${prop}`);
    for (const [cond, map] of Object.entries(def.when || {})) {
      condOk(cond, `anatomy.${part}.when["${cond}"]`);
      for (const [prop, ref] of Object.entries(map))
        if (checkTokenRef(W, `anatomy.${part}.when["${cond}"].${prop}`, ref, props) === 'null') nullTokens.push(`anatomy.${part}.when.${cond}.${prop}`);
    }
    for (const a of def.slot?.accepts || []) if (/^[A-Z]/.test(a) && !byName.has(a)) warn(W, `anatomy.${part}.slot acepta "${a}", que aún no tiene contrato`);
  }
  const L = d.layout;
  const fixed = (s) => (s?.mode === 'fixed' ? s.token : s?.token ?? undefined); // hug/fill no necesitan token
  const layoutRefs = [['layout.width.token', fixed(L.width)], ['layout.height.token', fixed(L.height)], ['layout.width.min', L.width?.min], ['layout.height.min', L.height?.min],
    ['layout.autoLayout.gap', L.autoLayout?.gap], ['layout.autoLayout.padding.block', L.autoLayout?.padding?.block], ['layout.autoLayout.padding.inline', L.autoLayout?.padding?.inline],
    ['a11y.minTarget', d.a11y.minTarget], ['overlay.opens.delay', d.overlay?.opens?.delay], ['overlay.dismisses.timeout', d.overlay?.dismisses?.timeout]];
  for (const [at, ref] of layoutRefs) if (ref !== undefined && checkTokenRef(W, at, ref, props) === 'null' && !at.startsWith('a11y')) nullTokens.push(at);
  for (const n of nullTokens) if (!reviewed(n)) warn(W, `${n} es null sin entrada en meta.needsReview (¿no hay variable en Figma? dilo)`);

  // Referencias a partes
  const partRefs = [['form.label', d.form?.label], ['form.description', d.form?.description], ['form.error', d.form?.error], ['a11y.focusVisible', d.a11y.focusVisible],
    ['overlay.focus.initial', d.overlay?.focus?.initial], ...(d.composition?.nested || []).map((n) => ['composition.nested.part', n.part])];
  for (const [at, ref] of partRefs) if (ref && !d.anatomy[ref]) error(W, `${at} → la parte "${ref}" no existe en anatomy`);

  // Compuestos
  for (const item of d.collection?.items || []) {
    const child = byName.get(item);
    if (!child) strict(`collection.items: falta el contrato ${item}`);
    else if (child.data.member?.of !== d.name) error(W, `collection.items: ${item} debe tener member.of = "${d.name}"`);
  }
  if (d.member) {
    const parent = byName.get(d.member.of);
    if (!parent) strict(`member.of: falta el contrato ${d.member.of}`);
    else if (!parent.data.collection?.items?.includes(d.name)) error(W, `member.of: ${d.member.of} no incluye ${d.name} en collection.items`);
    if (!propNames.has(d.member.identity)) warn(W, `member.identity "${d.member.identity}" no es una prop`);
  }
  for (const n of d.composition?.nested || []) if (!byName.has(n.component)) strict(`composition.nested: falta el contrato ${n.component}`);
  for (const x of d.intent.dontUseFor) if (x.useInstead && !byName.has(x.useInstead)) info(W, `dontUseFor.useInstead "${x.useInstead}" aún no tiene contrato`);
  if (d.media?.source === 'registry' && !registry) strict('media.source = registry pero no existe icons/registry.json (ejecuta ds-icons)');

  // Patrón → módulos (ADR 0004)
  for (const group of PATTERN_MODULES[d.behavior.pattern] || [])
    if (!group.some((m) => d[m])) strict(`el patrón "${d.behavior.pattern}" necesita el módulo ${group.join(' o ')}`);
  if (d.overlay && !d.overlay.dismisses.on.length && d.behavior.pattern !== 'alertdialog') warn(W, 'overlay sin forma de cerrarse (dismisses.on vacío)');

  // Exigencias por estado (GOBERNANZA.md §5)
  const inferred = Object.entries(d.meta.provenance).filter(([, v]) => v.source === 'inferred').map(([k]) => k);
  if (rank >= 1) {
    if (!d.intent.purpose) error(W, `status ${d.status}: falta intent.purpose`);
    if (!d.intent.useWhen.length) error(W, `status ${d.status}: intent.useWhen vacío`);
    if (!d.a11y.role) error(W, `status ${d.status}: falta a11y.role`);
    if (!d.a11y.name) error(W, `status ${d.status}: falta a11y.name (de dónde sale el nombre accesible)`);
    if (!NON_INTERACTIVE.has(d.behavior.pattern) && !d.a11y.focusVisible) error(W, `status ${d.status}: componente interactivo sin a11y.focusVisible`);
    if (!NON_INTERACTIVE.has(d.behavior.pattern) && !d.a11y.keyboard.length) error(W, `status ${d.status}: componente interactivo sin a11y.keyboard`);
    if (inferred.length) error(W, `status ${d.status}: quedan bloques "inferred" sin confirmar: ${inferred.join(', ')}`);
  }
  if (rank >= 2 && d.status !== 'deprecated') {
    if (d.meta.needsReview.length) error(W, 'status stable: meta.needsReview debe estar vacío');
    if (nullTokens.length) error(W, `status stable: quedan tokens null (${nullTokens.length})`);
    if (!d.meta.owner) error(W, 'status stable: falta meta.owner');
    if (!d.meta.customization.allowed.length && !d.meta.customization.askOwner.length) error(W, 'status stable: meta.customization vacío');
    if (!d.meta.code && !SELF) error(W, 'status stable: falta meta.code (ejecuta ds-component)');
  }
  if (d.status === 'deprecated' && !d.meta.deprecation) error(W, 'status deprecated: falta meta.deprecation');
  if (d.meta.needsReview.length) info(W, `${d.meta.needsReview.length} punto(s) en needsReview`);

  // Código
  if (d.meta.code) {
    const codeDir = path.join(ROOT, d.meta.code);
    if (!exists(codeDir)) error(W, `meta.code "${d.meta.code}" no existe`);
    else {
      const src = walkFiles(codeDir, (f) => /\.(tsx?|jsx?|vue|svelte|html)$/.test(f)).map(readText).join('\n');
      const parts = new Set([...src.matchAll(/data-part["']?\s*[:=]\s*\{?\s*["'`]([a-zA-Z0-9]+)["'`]/g)].map((m) => m[1]));
      for (const p of Object.keys(d.anatomy)) if (!parts.has(p) && !d.anatomy[p].optional) warn(W, `el código no tiene data-part="${p}"`);
    }
  }
}

// ─── 6. Código: tokens sí, valores sueltos no ────────────────────────────────
const codeRoot = path.join(ROOT, paths.code);
const prefix = cfg?.prefix || 'ds';
for (const f of walkFiles(codeRoot, (f) => /\.(css|scss|tsx?|jsx?|vue|svelte)$/.test(f) && !/\.(test|spec|stories)\./.test(f))) {
  const src = readText(f), W = rel(f), isStyle = /\.s?css$/.test(f);
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (isStyle || /style|css|className/.test(line)) {
      if (/#[0-9a-fA-F]{3,8}\b/.test(line) && /:\s*[^;]*#[0-9a-fA-F]{3,8}/.test(line)) error(W, `línea ${i + 1}: color hex suelto. Usa var(--${prefix}-…)`);
      if (/(?<![\w-])[1-9]\d*(\.\d+)?px\b/.test(line)) error(W, `línea ${i + 1}: px suelto. Usa un token de dimensión`);
    }
    for (const m of line.matchAll(new RegExp(`var\\(--${prefix}-([a-z0-9-]+)`, 'g')))
      if (T.all.size && !cssNames.has(m[1]) && !/-(font-family|font-size|font-weight|line-height|letter-spacing)$/.test(m[1])) error(W, `línea ${i + 1}: --${prefix}-${m[1]} no es un token`);
  });
  if (isStyle) for (const m of src.matchAll(/([^{}]*disabled[^{}]*)\{([^}]*)\}/g)) if (/opacity\s*:/.test(m[2])) error(W, 'disabled con opacity: usa los tokens *.disabled (AGENTS.md)');
}

// ─── 7. Documentación y ADRs ─────────────────────────────────────────────────
const adrDir = path.join(ROOT, paths.docs, 'adr');
const adrs = exists(adrDir) ? fs.readdirSync(adrDir).filter((f) => /^\d{4}-.+\.md$/.test(f)) : [];
const adrIndex = exists(path.join(adrDir, 'README.md')) ? readText(path.join(adrDir, 'README.md')) : '';
const numbers = new Set();
for (const f of adrs) {
  const src = readText(path.join(adrDir, f)), W = `${paths.docs}/adr/${f}`;
  const n = f.slice(0, 4);
  if (numbers.has(n)) error(W, `número de ADR repetido ${n}`);
  numbers.add(n);
  for (const sec of ['## Contexto', '## Decisión', '## Dónde se aplica', '## Consecuencias', '## Alternativas descartadas'])
    if (!src.includes(sec)) error(W, `falta la sección "${sec}" (templates/adr.md)`);
  if (!/\*\*Negativas\*\*/.test(src)) error(W, 'faltan las consecuencias negativas (son obligatorias)');
  if (!adrIndex.includes(f)) warn(`${paths.docs}/adr/README.md`, `no lista ${f}: ejecuta npm run docs`);
}
const auditDir = path.join(ROOT, paths.docs, 'auditoria');
if (exists(auditDir)) for (const f of fs.readdirSync(auditDir).filter((f) => f.endsWith('.md') && f !== 'README.md'))
  if (!readText(path.join(auditDir, f)).includes('Preguntas abiertas')) warn(`${paths.docs}/auditoria/${f}`, 'falta la sección "Preguntas abiertas"');
if (!SELF) for (const c of contracts.filter((c) => c.data))
  if (!exists(path.join(ROOT, paths.docs, 'components', `${c.name}.md`))) warn(`${paths.docs}/components`, `falta ${c.name}.md: ejecuta npm run docs`);

// ─── 8. check:self: ¿cubren los fixtures todas las piezas del esquema? ───────
if (SELF) {
  for (const m of MODULES) if (!usedModules.has(m)) error('fixtures', `ningún fixture usa el módulo "${m}"`);
  for (const k of ['prop', 'interaction', 'declared', 'content', 'responsive', 'mode', 'figma-only']) if (!usedClasses.has(k)) error('fixtures', `ningún fixture usa la clase de Figma "${k}"`);
  info('fixtures', `${contracts.length} contratos · patrones: ${[...usedPatterns].map(String).join(', ')} · módulos: ${[...usedModules].join(', ')}`);
}

// ─── Informe ─────────────────────────────────────────────────────────────────
const print = (icon, list) => list.forEach((l) => console.log(`${icon} ${l}`));
print('✖', out.error);
if (!QUIET) { print('⚠', out.warn); print('ℹ', out.info); }
const n = contracts.filter((c) => c.data).length;
const summary = `${n} contrato(s) · ${T.all.size} token(s) · ${registry?.icons?.length ?? 0} icono(s) · ${adrs.length} ADR(s)`;
if (out.error.length) { console.log(`\n✖ check (${rel(ROOT)}): ${out.error.length} error(es), ${out.warn.length} aviso(s) · ${summary}`); process.exit(1); }
if (!QUIET) console.log(`\n✔ check (${rel(ROOT)}): 0 errores, ${out.warn.length} aviso(s) · ${summary}`);
