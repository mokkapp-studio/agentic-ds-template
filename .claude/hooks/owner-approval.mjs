#!/usr/bin/env node
// Hook PreToolUse (GOBERNANZA.md §1): el agente propone, el dueño aprueba.
// - Archivos GENERADOS → se bloquean (hay que ejecutar el script).
// - Archivos que definen el sistema → se pide confirmación al usuario.
// - Lo demás → libre.
import fs from 'node:fs';
import path from 'node:path';

const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');

const reply = (decision, reason) => {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason } }));
  process.exit(0);
};

const GENERATED = [
  [/^tokens\/build\//, 'npm run tokens'],
  [/^docs\/components\//, 'npm run docs'],
  [/^docs\/adr\/README\.md$/, 'npm run docs'],
  [/^llms\.txt$/, 'npm run docs'],
];
for (const [re, cmd] of GENERATED) if (re.test(rel)) reply('deny', `${rel} es GENERADO. No se edita a mano: cambia la fuente y ejecuta \`${cmd}\`.`);

const PROTECTED = [
  [/^tokens\/(primitive|semantic|component)\.json$/, 'tokens del sistema'],
  [/^tokens\/themes\//, 'modos del sistema'],
  [/^contracts\/vocabulary\.json$/, 'vocabulario común'],
  [/^schemas\//, 'esquemas (las reglas). Cambiarlos requiere un ADR'],
  [/^templates\//, 'plantillas'],
  [/^(AGENTS|GOBERNANZA)\.md$/, 'reglas del sistema'],
];
for (const [re, what] of PROTECTED) if (re.test(rel)) reply('ask', `Cambio en ${what} (${rel}). El dueño del sistema debe aprobarlo.`);

const m = rel.match(/^contracts\/components\/[^/]+\/contract\.json$/);
if (m && fs.existsSync(path.join(root, rel))) {
  try {
    const status = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')).status;
    if (status === 'stable' || status === 'review')
      reply('ask', `El contrato está en "${status}". Cualquier cambio necesita versión nueva, entrada en el CHANGELOG y aprobación del dueño.`);
  } catch { /* JSON roto: deja que check lo diga */ }
}
process.exit(0);
