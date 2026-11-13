# 0002 · Tokens DTCG en capas: los componentes nunca usan primitivos

| Estado | Fecha | Decide | Reemplaza / Reemplazado por |
|---|---|---|---|
| Aceptado | 2026-11-13 | Template | — |

## Contexto

Las variables de Figma suelen mezclar valores crudos y usos. Si un componente usa `purple-500` directamente, cambiar la marca o añadir un modo oscuro obliga a tocar cada componente.

## Decisión

1. Formato **DTCG** (`$value`, `$type`, `$description`, `$extensions.figma`), validado por `schemas/tokens.schema.json`.
2. Tres capas en archivos separados:
   - `primitive.json`: valores crudos;
   - `semantic.json`: por uso, solo referencia primitivos;
   - `component.json` (opcional): solo referencia semánticos.
3. Los contratos y el código usan **solo** semánticos o de componente.
4. Los modos van en `tokens/themes/<modo>.json` con **solo lo que cambia**; el modo por defecto está en `semantic.json`.
5. `tokens/build/` se genera con `npm run tokens`. Las referencias se conservan como `var()`.

## Dónde se aplica

| Archivo | Qué cambia |
|---|---|
| `templates/tokens.*.json` | Plantillas de cada capa |
| `scripts/build-tokens.mjs` | Compila |
| `scripts/check.mjs` | Comprueba capas, referencias y modos |

## Consecuencias

**Positivas**
- Cambiar la marca o un modo no toca componentes.
- Cualquier herramienta DTCG puede leer los tokens.

**Negativas**
- Si el Figma no separa capas, `ds-tokens` tiene que proponer la separación (más trabajo inicial).
- Más archivos que un único `tokens.json`.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Un solo `tokens.json` con todo | No se puede comprobar qué capa usa cada cosa |
| Formato propio | Peor interoperabilidad |
