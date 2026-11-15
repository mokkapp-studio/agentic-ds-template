---
name: ds-contract
description: Crea o completa el contrato de un componente (contracts/components/<Nombre>/contract.json) leyendo su component set en Figma - clasifica cada propiedad en sus 7 clases, detecta el patrón WAI-ARIA y activa los módulos (form, collection, member, overlay, range, media, data), mapea capas y variables a anatomy y tokens, y deja null + needsReview lo que no se puede leer. Sirve para cualquier componente - botón, checkbox, input, textarea, card, tabs, diálogo, tabla. Úsala cuando digan "crea el contrato de…", "pasa este componente de Figma", "documenta el componente", "contrato del botón", o pegan un enlace a un nodo de Figma.
---

# ds-contract · Fase C, paso 6 (un componente cada vez)

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| C · Por componente | 6 | tokens (e Icon si usa iconos) | `ds-component` |

## Qué hace y qué no

Escribe `contracts/components/<Nombre>/contract.json` y su `CHANGELOG.md`. **No** escribe código (eso es `ds-component`) ni inventa tokens (si falta uno, `null` + `needsReview`).

## Qué necesitas

1. `ds.config.json`, `contracts/vocabulary.json` y los ADRs aceptados.
2. `tokens/build/tokens.json`: los tokens que existen. Si no hay tokens, para y ejecuta `ds-tokens`.
3. `schemas/contract.schema.json`: qué admite cada campo.
4. **[reference.md](reference.md)**: las 7 clases, la tabla patrón → módulos y la regla de compuestos.
5. **Un fixture parecido** en `schemas/fixtures/contracts/components/`: Button, Checkbox, TextField, Card, Tabs/TabItem, Dialog, Slider, Icon o Table.
6. Si el contrato ya existe, **no lo regeneres**: eso es `ds-sync`.

## Pasos

### 1. Leer el component set
Necesitas:

- propiedades con tipo, valores y default;
- árbol de capas con nombres;
- variables enlazadas en cada capa y variante;
- auto layout (dirección, gap, padding, hug/fill/fixed);
- descripción del componente en Figma;
- una captura (para ti, no para el contrato).

| Puente | Herramientas |
|---|---|
| figma-console | `figma_analyze_component_set`, `figma_get_component_for_development_deep`, `figma_get_component_image` |
| figma-mcp | `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot` |
| export-json | Pide al alumno los datos del panel de propiedades y una captura; marca casi todo como `inferred` |

### 2. Crear el archivo
`npm run new -- contract <Nombre>`: nombre en PascalCase, igual que en Figma salvo que el vocabulario diga otra cosa.

### 3. Clasificar CADA propiedad de Figma (7 clases → `reference.md`)
Por cada una, añade una entrada en `figma.properties` con `class` y `mapsTo`. Después:

- **prop** → `props[]`, tipo `enum` con los valores normalizados (`Large` → `l`, según el vocabulario y el ADR de escala). Pon `figma.valueMap` si cambian.
- **interaction** → una entrada en `states[]` por valor (`hover`, `pressed`, `focusVisible`), con `kind: interaction` y `control: browser`. **Nunca una prop.**
- **declared** → prop booleana (o enum) + estado `kind: declared`, `control: consumer` y su `aria`.
- **value** (Checked, Selected, Open, Value) → prop controlada + `default<Prop>` no controlada + estado `kind: value`, `control: shared`.
- **content** → TEXT da una prop `string`. INSTANCE_SWAP de icono da una prop `icon`. BOOLEAN "Show X" da una parte `optional` con `visibleWhen`. SLOT da una parte con `slot`.
- **responsive** → `layout.responsive`.
- **mode** → nada en el contrato (va a `tokens/themes`).
- **figma-only** → solo en `figma.properties` con `figmaOnly: true`.

### 4. Patrón y módulos
Elige `behavior.pattern` (APG) con la tabla de `reference.md` y **añade los módulos que pide**. Pon `pattern: null` si no hay interacción propia (Card, Badge, Divider).

### 5. Anatomía
- Cada capa con significado se convierte en una parte. La clave va en camelCase y será `data-part` en el código.
- Añade `figmaLayer`, `element` (HTML semántico), `parent` si no cuelga de root, y `optional`/`visibleWhen`.
- Añade partes `codeOnly` que Figma no dibuja: el input nativo oculto de un checkbox, el `error` de un campo, el portal de un diálogo.
- ¿Una pieza es parte o contrato propio? Aplica la **regla de compuestos** (`reference.md`).

### 6. Tokens por parte
- `tokens`: los valores de la variante por defecto. `when`: lo que cambia por condición (`size=s`, `state=hover`, `variant=ghost&state=hover`).
- Usa **solo** rutas que existan en `tokens/build/tokens.json` y que no sean primitivas.
- **Valor sin variable en Figma → `null`** y una entrada en `meta.needsReview` con `reason` (qué hay en Figma) y `question` (qué decidir).
- Para matrices grandes (`tone` con 8 colores) usa el comodín `color.fill.{tone}`.

### 7. Layout
Copia el auto layout: dirección, gap, padding (tokens), y `width`/`height` con `mode`. `fixed` lleva token; `hug` y `fill`, no.

### 8. Intent, a11y, eventos (borrador)
- Redacta `intent` (propósito, cuándo sí, cuándo no con `useInstead`), `a11y` (rol, nombre accesible, teclado según el patrón APG, `focusVisible`, `minTarget`) y `behavior.events` (nombres del vocabulario: `press`, `change`, `openChange`).
- Marca todo esto como `"inferred"` en `meta.provenance`: lo tiene que confirmar una persona.

### 9. Cerrar
- `meta.provenance`: `measured` para lo leído de Figma, `inferred` para lo redactado, `decided` para lo que diga un ADR.
- Rellena el CHANGELOG (`0.1.0`).
- Deja `status: "draft"`.
- `npm run check`: arregla **todos** los errores y explica los avisos.
- `npm run docs`.
- **Presenta al alumno:** los `needsReview` como preguntas y lo `inferred` para confirmar. Cuando lo confirme, cambia `inferred` → `decided` y sube a `review`.

## Qué entrega

- `contracts/components/<Nombre>/contract.json` y `CHANGELOG.md`.
- `docs/components/<Nombre>.md`.
- La lista de preguntas pendientes.

## Cómo comprobarlo

- [ ] Todas las propiedades de Figma están en `figma.properties` con su clase.
- [ ] Ningún estado de interacción, breakpoint o modo es una prop.
- [ ] El patrón tiene sus módulos.
- [ ] Cada `null` tiene su `needsReview`.
- [ ] Ningún token primitivo, hex ni px.
- [ ] Props, estados y eventos con nombres del vocabulario.
- [ ] Compuestos: padre con `collection.items`, hijos con `member.of`.
- [ ] `npm run check` en verde.

## Orden recomendado de componentes

1. Icon y Divider.
2. Button y Badge.
3. Checkbox, Switch y TextField.
4. TextArea y Card.
5. RadioGroup y Select.
6. Tabs y Accordion.
7. Dialog, Tooltip y Toast.

Cada nivel introduce un módulo nuevo.
