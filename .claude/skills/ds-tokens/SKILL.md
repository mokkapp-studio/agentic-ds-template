---
name: ds-tokens
description: Genera los tokens de diseño en formato DTCG desde las variables y estilos de Figma, separados en capas primitiva, semántica y de componente, con un archivo por modo, y compila tokens.css. Úsala tras los ADRs de tokens y modos, cuando digan "genera los tokens", "pasa mis variables", "importa los colores", "añade el modo oscuro", o cuando cambien las variables en Figma.
---

# ds-tokens · Fase B, paso 4

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| B · Fundamentos | 4 | ADRs de tokens y modos | `ds-icons` |

## Qué hace y qué no

Escribe `tokens/primitive.json`, `tokens/semantic.json`, `tokens/component.json` (opcional) y `tokens/themes/<modo>.json`, y genera `tokens/build/`. No toca contratos.

## Qué necesitas

- `ds.config.json`: `prefix`, `modes`, `figma.bridge`.
- ADRs aceptados sobre tokens, modos y escala (`docs/adr/`). Si faltan, **para** y propón `ds-decide`.
- `templates/tokens.*.json` y `schemas/tokens.schema.json`.
- **Ejemplo completo:** `schemas/fixtures/tokens/`.

## Pasos

1. **Lee las variables** según el puente:
   - `figma-console`: `figma_get_variables` (todas, con modos y alias). Para estilos: `figma_get_styles` y `figma_get_text_styles`.
   - `figma-mcp`: `get_variable_defs` sobre **cada** component set y frame de fundamentos. Une los resultados y avisa de que puede faltar alguna variable que nadie use.
   - `export-json`: lee `tokens/_import/*.json` y normalízalo.
2. **Clasifica cada variable en su capa:**

   | Si en Figma… | Capa |
   |---|---|
   | Es un valor crudo (`#6E56CF`, `16`) en una colección tipo "Primitives / Core / Palette" | **primitive** |
   | Es un alias a una primitiva y su nombre habla de **uso** (`fill/brand`, `text/subtle`) | **semantic** |
   | Es un alias a una semántica y su nombre lleva un componente (`button/fill`) | **component** |
   | Tiene valor crudo pero nombre de uso | **semantic** con valor crudo → **avisa** y propón crear la primitiva |

3. **Nombres:** ruta en minúsculas con puntos (`color.fill.brand`), **sin** el nombre de la colección. Convierte `/` y espacios. Conserva el nombre original en `$extensions.figma.variable`.
4. **Tipos DTCG:** `color`, `dimension` (con unidad: `16px`), `fontFamily`, `fontWeight`, `number` (line-height sin unidad), `duration`, `cubicBezier`, `shadow`, `border`, `typography`. Pon `$type` en el grupo cuando todo el grupo comparte tipo.
5. **Alias:** `{color.purple.500}`. Una semántica solo referencia primitivas; una de componente, solo semánticas. `check` lo verifica.
6. **Estilos sin variable** (texto, sombras): tokens *composite* en la capa semántica, con `$extensions.figma.style`. Cada sub-valor referencia primitivas (crea las que falten: `font.size.14`).
7. **Modos:** los valores del **primer** modo van en `semantic.json`. Para cada modo restante: `npm run new -- theme <modo>` y escribe **solo los tokens que cambian**, con la misma ruta.
8. **Necesarios para los componentes** (créalos si Figma los tiene, o pregunta):
   - `size.target.min` (área táctil mínima);
   - `icon.size.<s|m|l>` (los usa `ds-icons`);
   - tokens `*.disabled` (nunca `opacity`);
   - `color.border.focus` (foco visible).
9. **Ejecuta** `npm run tokens` y después `npm run check`.
10. **Procedencia:** pon `"$extensions": {"provenance": "inferred"}` en lo que no venga de una variable real.

## Qué entrega

- `tokens/*.json`, `tokens/themes/*.json`, `tokens/build/tokens.css` y `tokens/build/tokens.json`.
- Resumen: número de tokens por capa, modos, y lo que se ha marcado como `inferred`.
- Siguiente paso: **`ds-icons`**.

## Cómo comprobarlo

- [ ] Ningún primitivo referencia a otro token.
- [ ] Ninguna semántica referencia a otra semántica ni a un token de componente.
- [ ] Los temas solo contienen lo que cambia.
- [ ] No has editado `tokens/build/` a mano.
- [ ] `npm run tokens` y `npm run check` en verde.

## Errores típicos

- Copiar el nombre de la colección en la ruta (`semantic.color.fill…`).
- Duplicar todos los tokens en `themes/dark.json`.
- Guardar `opacity: 0.5` como token "disabled".
