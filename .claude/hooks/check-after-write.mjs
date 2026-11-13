#!/usr/bin/env node
// Hook PostToolUse: tras escribir en el sistema, ejecuta check. Si falla, devuelve los errores a la IA (exit 2).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
if (!/^(ds\.config\.json|tokens\/|icons\/|contracts\/|src\/components\/|docs\/adr\/|docs\/auditoria\/|schemas\/)/.test(rel)) process.exit(0);

const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'check.mjs'), '--quiet'], { cwd: root, encoding: 'utf8' });
if (r.status !== 0) {
  process.stderr.write(`npm run check falla tras escribir ${rel}:\n${r.stdout}${r.stderr}\nArréglalo antes de seguir.`);
  process.exit(2);
}
process.exit(0);
