#!/usr/bin/env node
// Genera la documentación desde los contratos. Nunca se escribe a mano.
//   npm run docs
// → docs/components/<Nombre>.md (desde templates/component-doc.md)
// → docs/components/README.md   (índice de componentes)
// → docs/adr/README.md          (índice de ADRs)
// → llms.txt                    (mapa del sistema para cualquier IA)
import fs from 'node:fs';
import path from 'node:path';
import { REPO, exists, readJSON, readText, writeText, rootFromArgs, loadConfig, loadContracts, MODULES } from './lib.mjs';

const ROOT = rootFromArgs();
const cfg = loadConfig(ROOT) || {};
const P = cfg.paths || { docs: 'docs', contracts: 'contracts/components', tokens: 'tokens', icons: 'icons' };
const docsDir = path.join(ROOT, P.docs);
const tpl = readText(path.join(REPO, 'templates', 'component-doc.md'));

const esc = (s) => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const code = (s) => (s === null || s === undefined ? '—' : `\`${typeof s === 'string' ? s : JSON.stringify(s)}\``);
const table = (head, rows) => (rows.length ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n') : '_Ninguno._');
const list = (arr, f = (x) => x) => (arr?.length ? arr.map((x) => `- ${f(x)}`).join('\n') : '_Sin definir._');

function render(d) {
  const A = d.a11y;
  const tokens = [];
  for (const [part, def] of Object.entries(d.anatomy)) {
    for (const [p, t] of Object.entries(def.tokens || {})) tokens.push([part, '(base)', p, t ?? '⚠ null']);
    for (const [cond, map] of Object.entries(def.when || {})) for (const [p, t] of Object.entries(map)) tokens.push([part, cond, p, t ?? '⚠ null']);
  }
  const modules = MODULES.filter((m) => d[m]).map((m) => `## Módulo \`${m}\`\n\n\`\`\`json\n${JSON.stringify(d[m], null, 2)}\n\`\`\``).join('\n\n');
  const map = {
    name: d.name, version: d.version, status: d.status, category: d.category,
    figmaUrl: d.figma.url || '#', purpose: d.intent.purpose || '_Sin propósito definido todavía._',
    useWhen: list(d.intent.useWhen),
    dontUseFor: list(d.intent.dontUseFor, (x) => `${x.case}${x.useInstead ? ` → usa **${x.useInstead}**` : ''}${x.why ? ` (${x.why})` : ''}`),
    props: table(['Prop', 'Tipo', 'Valores', 'Por defecto', 'Req.', 'Figma', 'Descripción'],
      d.props.map((p) => [code(p.name), p.type, p.values ? p.values.join(', ') : '—', code(p.default), p.required ? 'sí' : '', p.figma ? `${p.figma.property} (${p.figma.type})` : '—', p.description])),
    states: table(['Estado', 'Tipo', 'Control', 'CSS', 'ARIA', 'Prop'],
      d.states.map((s) => [code(s.name), s.kind, s.control, s.css ?? '—', s.aria ?? '—', s.prop ?? '—'])),
    anatomy: table(['Parte (data-part)', 'Capa Figma', 'Elemento', 'Dentro de', 'Opcional', 'Slot'],
      Object.entries(d.anatomy).map(([k, p]) => [code(k), p.figmaLayer ?? (p.codeOnly ? 'solo código' : '—'), p.element ?? '—', p.parent ?? (k === 'root' ? '—' : 'root'), p.optional ? (p.visibleWhen || 'sí') : '', p.slot ? `${(p.slot.accepts || []).join(', ')}${p.slot.prop ? ` (prop ${p.slot.prop})` : ''}` : ''])),
    behavior: [`Patrón APG: **${d.behavior.pattern ?? 'ninguno'}**${d.behavior.element ? ` · elemento \`${d.behavior.element}\`` : ''}`, '',
      table(['Evento', 'Entrega', 'Cuándo'], d.behavior.events.map((e) => [code(e.name), e.payload ?? '—', e.when]))].join('\n'),
    a11y: [`- Rol: ${code(A.role)}`, `- Nombre accesible: ${A.name ? `${A.name.from}${A.name.required ? ' (obligatorio)' : ''}` : '—'}`,
      `- Foco visible en: ${code(A.focusVisible)} · área mínima: ${code(A.minTarget)} · contraste: ${A.contrast}${A.live ? ` · live: ${A.live}` : ''}`,
      '', table(['Tecla', 'Acción'], A.keyboard.map((k) => [k.key, k.action])), ...(A.notes?.length ? ['', list(A.notes)] : [])].join('\n'),
    tokens: table(['Parte', 'Cuando', 'Propiedad', 'Token'], tokens),
    modules,
    needsReview: list(d.meta.needsReview, (n) => `\`${n.path}\`: ${n.reason}${n.question ? ` **¿${n.question.replace(/^¿|\?$/g, '')}?**` : ''}`).replace('_Sin definir._', '_Nada pendiente._'),
  };
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? '').replace(/\n{3,}/g, '\n\n');
}

// Componentes
const contracts = loadContracts(ROOT, cfg).filter((c) => c.exists).map((c) => ({ ...c, data: readJSON(c.file) }));
const compDir = path.join(docsDir, 'components');
for (const c of contracts) writeText(path.join(compDir, `${c.data.name}.md`), render(c.data));
writeText(path.join(compDir, 'README.md'), `<!-- GENERADO por npm run docs. -->\n# Componentes\n\n${table(['Componente', 'Estado', 'Versión', 'Categoría', 'Patrón', 'Pendiente'],
  contracts.map(({ data: d }) => [`[${d.name}](${d.name}.md)`, d.status, d.version, d.category, d.behavior.pattern ?? '—', d.meta.needsReview.length || '']))}\n`);

// ADRs
const adrDir = path.join(docsDir, 'adr');
const adrs = exists(adrDir) ? fs.readdirSync(adrDir).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort() : [];
const adrRows = adrs.map((f) => {
  const src = readText(path.join(adrDir, f));
  const title = src.match(/^#\s+(.+)$/m)?.[1] ?? f;
  const status = src.match(/\|\s*-+\s*\|[^\n]*\n\|\s*([^|]+?)\s*\|/)?.[1] ?? '?';
  return [`[${title}](${f})`, status];
});
writeText(path.join(adrDir, 'README.md'), `<!-- GENERADO por npm run docs. -->\n# Decisiones de arquitectura (ADR)\n\nUn ADR registra **una** decisión, su porqué y su coste. Se crean con la skill \`ds-decide\` desde \`templates/adr.md\`.\nLos 0001–0005 son del template; los tuyos empiezan en el 0100.\n\n${table(['ADR', 'Estado'], adrRows)}\n`);

// llms.txt
const llms = `# ${cfg.name ?? 'Sistema de diseño (sin configurar)'}

> Sistema de diseño gobernado por contratos. El contrato (${P.contracts}/<Nombre>/contract.json) es la fuente de verdad; Figma se lee y el código se genera.

## Reglas
- [AGENTS.md](AGENTS.md): reglas para cualquier IA
- [GOBERNANZA.md](GOBERNANZA.md): quién decide, estados, versiones

## Fundamentos
- [Configuración](ds.config.json)
- [Tokens CSS](${P.tokens}/build/tokens.css) · [Tokens planos](${P.tokens}/build/tokens.json)
- [Iconos](${P.icons}/registry.json)
- [Vocabulario](contracts/vocabulary.json)

## Componentes
${contracts.map(({ data: d }) => `- [${d.name}](${P.contracts}/${d.name}/contract.json): ${d.intent.purpose ?? '(sin propósito)'} [${d.status}]`).join('\n') || '- (ninguno todavía)'}

## Decisiones
${adrRows.map(([t], i) => `- [${t.replace(/^\[|\]\(.*$/g, '')}](${P.docs}/adr/${adrs[i]})`).join('\n') || '- (ninguna)'}
`;
writeText(path.join(ROOT, 'llms.txt'), llms);
console.log(`✔ docs: ${contracts.length} componente(s), ${adrs.length} ADR(s), llms.txt`);
