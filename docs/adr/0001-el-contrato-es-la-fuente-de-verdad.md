# 0001 · El contrato es la fuente de verdad: Figma se lee y el código se genera

| Estado | Fecha | Decide | Reemplaza / Reemplazado por |
|---|---|---|---|
| Aceptado | 2026-11-13 | Template | — |

## Contexto

En un sistema de diseño hay tres representaciones del mismo componente: Figma, el código y la documentación. Si cada una se edita por separado, divergen. Las IA lo empeoran: leen el código o el Figma y rellenan huecos con suposiciones.

## Decisión

1. Cada componente tiene un **contrato JSON** (`contracts/components/<Nombre>/contract.json`) validado por `schemas/contract.schema.json`.
2. **Figma es la entrada**: las skills lo leen y escriben el contrato.
3. **El código es la salida**: se genera desde el contrato y `check` comprueba que lo cumple (`data-part`, tokens).
4. **La documentación se genera** desde el contrato (`npm run docs`), nunca se escribe a mano.
5. Si algo cambia, cambia **primero el contrato** (versión + CHANGELOG).

## Dónde se aplica

| Archivo | Qué cambia |
|---|---|
| `schemas/contract.schema.json` | Define el contrato |
| `scripts/check.mjs`, `scripts/docs.mjs` | Validan y documentan desde el contrato |
| `AGENTS.md` | "Contrato primero" |

## Consecuencias

**Positivas**
- Una IA cualquiera tiene una sola fuente que leer, legible y validable.
- La documentación nunca se desactualiza.

**Negativas**
- Un paso más: no se puede ir directo de Figma a código.
- Hay que mantener el contrato al día cuando cambia Figma (`ds-sync`).

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Figma como fuente de verdad | Figma no expresa comportamiento, teclado, ARIA ni intención |
| Código como fuente de verdad | Depende del framework; ni diseño ni IA lo leen bien |
