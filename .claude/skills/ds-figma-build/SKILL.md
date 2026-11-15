---
name: ds-figma-build
description: (Opcional) Dirección inversa - construye o actualiza el component set en Figma a partir de un contrato - propiedades, variantes, capas con nombre, variables enlazadas y auto layout. Requiere el puente figma-console (Plugin API). Úsala cuando digan "créalo en Figma", "pasa el contrato a Figma", "genera las variantes en Figma".
---

# ds-figma-build · Opcional

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| Opcional | — | contrato y puente `figma-console` | `ds-sync` |

## Qué hace y qué no

Escribe en Figma (requiere `figma.bridge: "figma-console"`). **No** cambia el contrato, salvo `figma.url`, `figma.node`, `figma.componentKey` y `meta.figmaSyncedAt` al final.

## Qué necesitas

- Contrato en `review` o `stable`.
- Tokens creados como variables en Figma con los mismos nombres. Si no lo están, propón crearlas primero (`figma_setup_design_tokens` o `figma_batch_create_variables`, desde `tokens/*.json`) y pide confirmación.

## Pasos

1. Busca o crea una página y una Section para el componente. No dejes nodos sueltos en el lienzo.
2. **Variantes** = producto de las props `enum`/`boolean` de clase `prop` y `declared` × los estados `interaction` (como propiedad `State`). Si son más de unas 100 variantes, avisa y propón reducir (por ejemplo, los estados solo en una variante).
3. **Capas:** una por parte de `anatomy`, con `name = figmaLayer` (o la clave), sin las `codeOnly`.
4. **Variables:** enlaza cada token de `anatomy.<parte>.tokens` y los de `when` en su variante.
5. **Auto layout** según `layout`.
6. **Propiedades** TEXT, BOOLEAN, INSTANCE_SWAP y SLOT para el contenido (clase `content`).
7. Pon `intent.purpose` como descripción del componente en Figma.
8. Haz una captura y revísala: alineación, padding, hug o fill. Hasta 3 iteraciones.
9. Escribe en el contrato `figma.url`, `node`, `componentKey`, `variantCount` y `meta.figmaSyncedAt`. Rellena `figma.properties`, que ahora ya existen, con su clase. `npm run check`.

## Cómo comprobarlo

- [ ] Ningún valor sin variable.
- [ ] Nombres de capa iguales a `figmaLayer`.
- [ ] Captura revisada.
- [ ] Contrato actualizado y `check` en verde.
