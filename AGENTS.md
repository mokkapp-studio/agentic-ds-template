# AGENTS.md

Reglas para **cualquier** agente de IA que trabaje en este repositorio (Claude, Cursor, Copilot, Codex…).
Este repo es un sistema de diseño gobernado por contratos: **el contrato es la fuente de verdad, Figma se lee y el código se genera.**

## Mapa

| Qué | Dónde | ¿Se edita? |
|---|---|---|
| Identidad del sistema | `ds.config.json` | Sí (ds-setup) |
| Reglas (formas válidas) | `schemas/` | Solo con un ADR |
| Plantillas | `templates/` | No: se copian |
| Tokens (fuente) | `tokens/primitive.json`, `semantic.json`, `component.json`, `themes/*.json` | Sí (ds-tokens), con aprobación |
| Tokens (generados) | `tokens/build/` | **Nunca**: `npm run tokens` |
| Iconos | `icons/registry.json` | Sí (ds-icons) |
| Vocabulario | `contracts/vocabulary.json` | Sí, con aprobación |
| Contratos | `contracts/components/<Nombre>/contract.json` + `CHANGELOG.md` | Sí (ds-contract, ds-sync) |
| Código | `src/components/<nombre>/` | Sí (ds-component), según el contrato |
| Decisiones | `docs/adr/NNNN-*.md` | Sí (ds-decide) |
| Auditorías | `docs/auditoria/` | Sí (ds-figma-audit) |
| Docs de componentes, índices, `llms.txt` | `docs/components/`, `docs/adr/README.md` | **Nunca**: `npm run docs` |
| Ejemplos de referencia | `schemas/fixtures/` | No: son la prueba del esquema |

## Antes de crear o modificar un componente

1. Lee `contracts/components/<Nombre>/contract.json`. Si no existe, **no lo inventes**: créalo con `ds-contract` (desde Figma) o `ds-spec` (sin Figma).
2. Lee `tokens/build/tokens.json` (qué tokens existen) y `ds.config.json` (prefijo y stack).
3. Lee `contracts/vocabulary.json` y los ADRs aceptados de `docs/adr/`.

## Reglas

- **Contrato primero.** Si el código necesita algo que no está en el contrato, se cambia **primero el contrato** (con su `version` y su CHANGELOG) y después el código.
- **Props:** nombres, tipos, valores y defaults exactamente como en `props`. No añadas props.
- **Vocabulario:** nunca uses un nombre que esté en un `avoid` del vocabulario.
- **Propiedades de Figma:** antes de convertir una propiedad en prop, clasifícala en sus 7 clases (ADR 0003). Hover, focus, breakpoints y modos **nunca** son props.
- **Estados:** los `interaction` se resuelven con CSS (`:hover`, `:focus-visible`, `:active`). Los `declared` y `value` son props con su atributo `aria`.
- **Anatomía:** cada clave de `anatomy` es una parte con `data-part="<clave>"`.
- **Slots:** respeta `accepts`, `min` y `max`. **Composición:** nunca metas dentro lo que esté en `composition.forbiddenChildren`.
- **Tokens:** solo semánticos o de componente, nunca primitivos. Sin hex ni px sueltos en el código.
- **Modos:** nunca escribas valores distintos para dark; usa la variable y el modo cambia solo con `[data-theme]`.
- **Disabled:** con los tokens `*.disabled`. **Nunca** con `opacity`.
- **Comportamiento:** el del patrón WAI-ARIA de `behavior.pattern` (ADR 0004): teclado, foco y roles.
- **Accesibilidad:** cumple `a11y` (nombre, teclado, foco visible, área mínima, contraste).
- **Lo que no se puede leer, no se inventa:** `null` + `meta.needsReview` + `meta.provenance` (ADR 0005).
- **Si algo no está en el contrato ni en un ADR:** pregunta. No rellenes huecos con suposiciones.
- **Generados:** no edites `tokens/build/`, `docs/components/`, `docs/adr/README.md` ni `llms.txt`.

## Al terminar

1. `npm run check` (y `npm run tokens` / `npm run docs` si tocaste tokens o contratos).
2. Responde con una lista corta: qué reglas del contrato has aplicado y qué has dejado fuera o queda en duda.
