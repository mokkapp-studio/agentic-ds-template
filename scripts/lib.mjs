// Utilidades compartidas por los scripts. Sin dependencias (Node 20+).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const exists = (p) => fs.existsSync(p);
export const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const readText = (p) => fs.readFileSync(p, 'utf8');
export const writeText = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
export const today = () => new Date().toISOString().slice(0, 10);

/** Lee --root <dir> (para check:self) o usa la raíz del repo. */
export function rootFromArgs(argv = process.argv) {
  const i = argv.indexOf('--root');
  return i > -1 ? path.resolve(REPO, argv[i + 1]) : REPO;
}

export function loadConfig(root) {
  const p = path.join(root, 'ds.config.json');
  return exists(p) ? readJSON(p) : null;
}

export function listDirs(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

export function walkFiles(dir, filter = () => true, out = []) {
  if (!exists(dir)) return out;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walkFiles(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}

// ─── Validador JSON Schema mínimo ────────────────────────────────────────────
// Soporta lo que usan los esquemas de schemas/: type, enum, const, required,
// properties, patternProperties, additionalProperties, propertyNames, items,
// minItems, maxItems, pattern, minLength, minimum, anyOf, oneOf, $ref (#/$defs/…).

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const typeMatches = (t, v) => { const a = typeOf(v); return t === a || (t === 'number' && a === 'integer'); };

export function validate(schema, data, rootSchema = schema, at = '', errors = []) {
  if (schema === true || schema === undefined) return errors;
  if (schema === false) { errors.push(`${at || '/'}: no permitido`); return errors; }
  if (schema.$ref) {
    const ref = schema.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], rootSchema);
    if (!ref) { errors.push(`${at}: $ref desconocido ${schema.$ref}`); return errors; }
    validate(ref, data, rootSchema, at, errors);
  }
  if (schema.type) {
    const types = [].concat(schema.type);
    if (!types.some((t) => typeMatches(t, data))) {
      errors.push(`${at || '/'}: debe ser ${types.join(' | ')} (es ${typeOf(data)})`);
      return errors;
    }
  }
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(data)))
    errors.push(`${at || '/'}: "${data}" no es válido. Opciones: ${schema.enum.map(String).join(', ')}`);
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(data))
    errors.push(`${at}: debe ser ${JSON.stringify(schema.const)}`);
  if (typeof data === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) errors.push(`${at}: "${data}" no cumple el formato ${schema.pattern}`);
    if (schema.minLength && data.length < schema.minLength) errors.push(`${at}: no puede estar vacío`);
  }
  if (typeof data === 'number' && schema.minimum !== undefined && data < schema.minimum) errors.push(`${at}: mínimo ${schema.minimum}`);
  if (Array.isArray(data)) {
    if (schema.minItems && data.length < schema.minItems) errors.push(`${at}: al menos ${schema.minItems} elemento(s)`);
    if (schema.maxItems !== undefined && data.length > schema.maxItems) errors.push(`${at}: como mucho ${schema.maxItems}`);
    if (schema.items) data.forEach((v, i) => validate(schema.items, v, rootSchema, `${at}[${i}]`, errors));
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const k of schema.required || []) if (!(k in data)) errors.push(`${at || '/'}: falta "${k}"`);
    for (const [k, v] of Object.entries(data)) {
      const p = `${at}.${k}`.replace(/^\./, '');
      if (schema.propertyNames?.pattern && !new RegExp(schema.propertyNames.pattern).test(k))
        errors.push(`${p}: nombre de clave no válido (${schema.propertyNames.pattern})`);
      if (schema.properties && k in schema.properties) { validate(schema.properties[k], v, rootSchema, p, errors); continue; }
      const pat = Object.entries(schema.patternProperties || {}).find(([re]) => new RegExp(re).test(k));
      if (pat) { validate(pat[1], v, rootSchema, p, errors); continue; }
      if (schema.additionalProperties === false) errors.push(`${p}: clave no permitida por el esquema`);
      else if (typeof schema.additionalProperties === 'object') validate(schema.additionalProperties, v, rootSchema, p, errors);
    }
  }
  for (const key of ['anyOf', 'oneOf']) {
    if (!schema[key]) continue;
    const results = schema[key].map((s) => validate(s, data, rootSchema, at, []));
    const ok = results.filter((r) => r.length === 0).length;
    if (key === 'anyOf' && ok === 0) errors.push(...results.sort((a, b) => a.length - b.length)[0]);
    if (key === 'oneOf' && ok !== 1) errors.push(`${at}: debe cumplir exactamente una opción`);
  }
  return errors;
}

export function validateFile(schemaPath, filePath) {
  const schema = readJSON(schemaPath);
  let data;
  try { data = readJSON(filePath); } catch (e) { return { data: null, errors: [`JSON no válido: ${e.message}`] }; }
  return { data, errors: validate(schema, data, schema) };
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

export const TIERS = ['primitive', 'semantic', 'component'];

/** Aplana un árbol DTCG: [{ path, type, value, description, figma }]. Hereda $type del grupo. */
export function flattenTokens(tree, prefix = [], inheritedType, out = []) {
  for (const [k, v] of Object.entries(tree || {})) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    const type = v.$type || inheritedType;
    if ('$value' in v) out.push({ path: [...prefix, k].join('.'), type, value: v.$value, description: v.$description, figma: v.$extensions?.figma });
    else flattenTokens(v, [...prefix, k], type, out);
  }
  return out;
}

/** Carga todas las capas y modos. Devuelve { tiers: {primitive:[],…}, themes: {modo: []}, all: Map(path → token+tier) }. */
export function loadTokens(root, cfg) {
  const dir = path.join(root, cfg?.paths?.tokens || 'tokens');
  const tiers = {}, themes = {}, files = {}, all = new Map();
  for (const t of TIERS) {
    const f = path.join(dir, `${t}.json`);
    if (!exists(f)) continue;
    files[t] = f;
    tiers[t] = flattenTokens(readJSON(f));
    for (const tok of tiers[t]) all.set(tok.path, { ...tok, tier: t });
  }
  const tdir = path.join(dir, 'themes');
  if (exists(tdir)) for (const f of fs.readdirSync(tdir).filter((f) => f.endsWith('.json'))) {
    const mode = f.replace(/\.json$/, '');
    files[`themes/${mode}`] = path.join(tdir, f);
    themes[mode] = flattenTokens(readJSON(path.join(tdir, f)));
  }
  return { dir, tiers, themes, files, all };
}

export const REF = /^\{([^}]+)\}$/;
export const refsIn = (v) => JSON.stringify(v ?? null).match(/\{[a-z0-9][a-z0-9.-]*\}/g)?.map((r) => r.slice(1, -1)) || [];

/** Expande comodines {prop} de una ruta de token con los valores de esa prop: color.fill.{tone} → [color.fill.neutral, …]. */
export function expandTokenRef(ref, props = []) {
  const m = ref.match(/\{([a-zA-Z0-9]+)\}/);
  if (!m) return [ref];
  const prop = props.find((p) => p.name === m[1]);
  if (!prop?.values?.length) return null; // comodín sin prop enum
  return prop.values.flatMap((v) => expandTokenRef(ref.replace(m[0], String(v)), props) || []);
}

// ─── Contratos ───────────────────────────────────────────────────────────────

export function loadContracts(root, cfg) {
  const dir = path.join(root, cfg?.paths?.contracts || 'contracts/components');
  return listDirs(dir).map((name) => {
    const file = path.join(dir, name, 'contract.json');
    return { name, dir: path.join(dir, name), file, exists: exists(file) };
  });
}

export const MODULES = ['form', 'collection', 'member', 'overlay', 'range', 'media', 'data', 'content', 'composition', 'testing'];

/** Qué módulos espera cada patrón APG. Ver ADR 0004 y la skill ds-contract. */
export const PATTERN_MODULES = {
  checkbox: [['form']], switch: [['form']], textbox: [['form']], spinbutton: [['form', 'range']],
  slider: [['form'], ['range']], 'slider-multithumb': [['form'], ['range']],
  meter: [['range']], progressbar: [['range']],
  radio: [['form', 'member'], ['collection', 'member']],
  combobox: [['form'], ['overlay', 'collection']], listbox: [['collection', 'member']],
  tabs: [['collection', 'member']], accordion: [['collection', 'member']], toolbar: [['collection', 'member']],
  tree: [['collection', 'member']], menubar: [['collection', 'member']],
  menu: [['overlay', 'collection', 'member']], 'menu-button': [['overlay']],
  'dialog-modal': [['overlay']], alertdialog: [['overlay']], tooltip: [['overlay']],
  img: [['media']], table: [['data', 'collection', 'member']], grid: [['data', 'collection', 'member']], treegrid: [['data', 'collection', 'member']],
};

/** Patrones sin interacción propia: no exigen teclado ni foco visible. */
export const NON_INTERACTIVE = new Set([null, 'img', 'separator', 'landmark', 'status', 'alert', 'meter', 'progressbar', 'table', 'feed']);
