# 0004 · El comportamiento se describe con patrones WAI-ARIA, no con una librería

| Estado | Fecha | Decide | Reemplaza / Reemplazado por |
|---|---|---|---|
| Aceptado | 2026-11-13 | Template | — |

## Contexto

El comportamiento (teclado, foco, roles, abrir y cerrar) no está en Figma. Hay sistemas que lo describen con las primitivas de una librería concreta (Base UI, Radix), lo que ata el contrato a esa librería y a React.

## Decisión

1. `behavior.pattern` es un patrón del **WAI-ARIA Authoring Practices Guide** (APG): `button`, `checkbox`, `tabs`, `dialog-modal`… o `null` si no hay interacción propia.
2. Cada patrón exige unos **módulos** del contrato (`form`, `collection`/`member`, `overlay`, `range`, `media`, `data`). La tabla está en `.claude/skills/ds-contract/reference.md` §2 y en `PATTERN_MODULES` de `scripts/lib.mjs`.
3. Qué implementa el patrón se elige en `ds.config.json → stack.headless`: `native` (HTML + ARIA a mano) o una librería (`base-ui`, `radix`, `react-aria`, `ark`…).
4. Los eventos usan nombres agnósticos (`press`, `change`, `openChange`) y el stack les pone la convención (`onPress`, `@press`).

## Dónde se aplica

| Archivo | Qué cambia |
|---|---|
| `schemas/contract.schema.json` | `behavior.pattern` (enum APG) y los módulos |
| `scripts/lib.mjs` | `PATTERN_MODULES`, `NON_INTERACTIVE` |
| `.claude/skills/ds-component/` | Cómo implementar según `headless` |

## Consecuencias

**Positivas**
- El mismo contrato sirve para React, Vue, Svelte o HTML.
- Se puede cambiar de librería *headless* sin tocar contratos.

**Negativas**
- El APG no cubre todo (Card, Toast…): hay `null` y patrones aproximados (`status`) que piden criterio.
- Con `native`, el alumno implementa más comportamiento a mano.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Primitivas de una librería headless (p. ej. Base UI) | Ata el contrato a una librería de React |
| Sin describir comportamiento | La IA lo inventaría en cada generación |
