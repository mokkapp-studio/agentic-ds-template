# CLAUDE.md

@AGENTS.md

## Skills de este repo (`.claude/skills/`)

El alumno no tiene que nombrarlas: actívalas cuando la petición encaje. **Respeta el orden**: si falta un paso anterior, dilo y propón hacerlo primero.

| Fase | Orden | Skill | Requiere antes |
|---|---|---|---|
| A · Preparar | 1 | `ds-setup` | — |
| | 2 | `ds-figma-audit` | ds-setup |
| | 3 | `ds-decide` | una auditoría (o una decisión pendiente) |
| B · Fundamentos | 4 | `ds-tokens` | ADRs de tokens y modos |
| | 5 | `ds-icons` | tokens `icon.size.*` + ADR de iconos |
| C · Por componente | 6 | `ds-contract` | tokens (e Icon si usa iconos) |
| | 7 | `ds-component` | contrato en `review` o `stable` |
| D · Mantener | 8 | `ds-sync` | contratos y tokens existentes |
| Opcionales | — | `ds-spec`, `ds-figma-build`, `ds-handoff` | — |

## Hooks (`.claude/settings.json`)

- **Antes de escribir:** bloquea los archivos generados y pide aprobación para tokens, vocabulario, esquemas, plantillas, reglas y contratos en `review` o `stable`.
- **Después de escribir:** ejecuta `check`; si falla, recibirás los errores y debes arreglarlos.

## Leer Figma

Mira `figma.bridge` en `ds.config.json`:

- `figma-console`: Plugin API completa.
- `figma-mcp`: MCP oficial; variables solo por nodo.
- `export-json`: archivo exportado.

Nunca supongas que puedes leer algo que el puente no da: dilo en la auditoría.
