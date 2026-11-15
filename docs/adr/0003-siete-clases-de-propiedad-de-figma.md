# 0003 · Toda propiedad de Figma se clasifica en 7 clases antes de ser prop

| Estado | Fecha | Decide | Reemplaza / Reemplazado por |
|---|---|---|---|
| Aceptado | 2026-11-13 | Template | — |

## Contexto

En Figma todo es una "variante": `Size`, pero también `State=Hover`, `Breakpoint=Mobile`, `Mode=Dark` o `Show redlines`. Si cada variante se convierte en prop, el componente acaba con una API imposible (`<Button state="hover">`) y duplica lo que ya hacen el navegador (CSS) o los tokens (modos).

## Decisión

1. `ds-contract` clasifica **cada** propiedad del component set en una clase y la registra en `figma.properties[].class`:
   1. `prop`;
   2. `interaction`;
   3. `declared`;
   4. `content`;
   5. `responsive`;
   6. `mode`;
   7. `figma-only`.
2. Solo `prop`, `declared` y `content` crean props.
3. `interaction` se convierte en estados resueltos con CSS; `responsive`, en `layout.responsive`; `mode`, en `tokens/themes`; `figma-only`, en nada.
4. La guía está en `.claude/skills/ds-contract/reference.md` §1.

## Dónde se aplica

| Archivo | Qué cambia |
|---|---|
| `schemas/contract.schema.json` | `figma.properties[].class` y `mapsTo` |
| `scripts/check.mjs` | Error si `interaction`, `responsive`, `mode` o `figma-only` apuntan a `props.*` |
| `.claude/skills/ds-contract/` | Proceso de clasificación |

## Consecuencias

**Positivas**
- APIs pequeñas y previsibles.
- Trazabilidad: cada propiedad de Figma dice adónde fue.

**Negativas**
- Hay casos frontera (`State=Disabled`, `State=Filled`) que exigen criterio y a veces una pregunta al dueño.
- El contrato ocupa más que una lista de props.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| 1 variante = 1 prop | APIs infladas, estados de interacción como props |
| Solo 4 clases | No cubre breakpoints, modos ni propiedades solo de Figma, que aparecen en archivos reales |
