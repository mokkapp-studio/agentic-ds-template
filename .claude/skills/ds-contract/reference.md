# Referencia de ds-contract

## 1. Las 7 clases de propiedad de Figma (ADR 0003)

Pregúntate en orden: **¿quién cambia este valor?**

| # | Clase | Señales en Figma | Quién lo cambia | Va a | ¿Prop? |
|---|---|---|---|---|---|
| 1 | **prop** | `Variant`, `Size`, `Tone`, `Orientation`, `Density` | El consumidor, al diseñar | `props` (enum/boolean) | Sí |
| 2 | **interaction** | `State=Hover/Pressed/Focus/Active` | El usuario, con el puntero o el teclado | `states` kind interaction → CSS | **No** |
| 3 | **declared** | `Disabled`, `Invalid/Error`, `Required`, `Loading`, `ReadOnly` | El consumidor, por lógica de negocio | `props` + `states` kind declared + aria | Sí |
| 3b | **declared (valor)** | `Checked`, `Selected`, `Open`, `Expanded`, `Value` | El usuario, y el consumidor puede controlarlo | `props` (`x` + `defaultX`) + `states` kind value, control shared | Sí |
| 4 | **content** | TEXT, INSTANCE_SWAP, BOOLEAN "Show…/Has…", SLOT | El consumidor, con contenido | Prop de texto o icono, o `anatomy.<parte>.slot` / `optional` | A veces |
| 5 | **responsive** | `Breakpoint`, `Device`, `Viewport`, `Mobile/Desktop` | El ancho de la pantalla | `layout.responsive` | **No** |
| 6 | **mode** | `Mode`, `Theme`, `Dark/Light`, `Brand` | El tema activo | `tokens/themes/` | **No** |
| 7 | **figma-only** | `Show redlines`, `Annotation`, `Spec`, `Grid` | Nadie en producto | `figma.properties` con `figmaOnly` | **No** |

**Casos frontera**

- `State=Disabled` dentro de una propiedad State → divídela. Las interacciones van a `interaction` y `Disabled` es `declared` (prop `disabled`). En `figma.properties`, una única entrada con `class: interaction` y una nota en `needsReview` si la mezcla confunde.
- `State=Filled` en un input → no es un estado: es el valor. Va a `value`, sin token propio salvo que Figma lo pinte distinto.
- `Type=Primary` → es una `prop`, pero el vocabulario la renombra a `variant`.
- `Icon position=Left/Right` → `prop` (enum `iconPosition`) o dos slots (`start`, `end`). Prefiere slots si el ADR de iconos no dice lo contrario.

## 2. Patrón APG → módulos

| Componente típico | `behavior.pattern` | Módulos | Contratos |
|---|---|---|---|
| Button, IconButton | `button` | — | 1 |
| Toggle (botón con estado) | `toggle-button` | — | 1 |
| Link | `link` | — | 1 |
| Checkbox | `checkbox` | form | 1 |
| Switch | `switch` | form | 1 |
| RadioGroup + RadioItem | `radio` | collection + form · member | 2 |
| TextField, Input, Search | `textbox` | form | 1 |
| TextArea | `textbox` | form (+ props `rows`, `resize`, `autoGrow`; parte `counter`) | 1 |
| NumberField | `spinbutton` | form, range | 1 |
| Select | `combobox` o `listbox` | form, overlay, collection · member | 2 (Select + Option) |
| Combobox, Autocomplete | `combobox` | form, overlay, collection · member | 2 |
| Slider | `slider` | form, range | 1 |
| Progress, Meter | `progressbar` · `meter` | range | 1 |
| Tabs + TabItem (+ TabPanel) | `tabs` | collection · member | 2–3 |
| Accordion + AccordionItem | `accordion` | collection · member (`reflects: expanded`) | 2 |
| Disclosure, Collapsible | `disclosure` | — | 1 |
| Dialog, Modal, Drawer | `dialog-modal` | overlay (`modal: true`, `trap: true`) | 1 |
| AlertDialog | `alertdialog` | overlay | 1 |
| Popover | `dialog-modal` con `modal: false` | overlay | 1 |
| Tooltip | `tooltip` | overlay (`opens.on: hover, focus`; sin trap) | 1 |
| Menu + MenuItem | `menu-button` · `menu` | overlay, collection · member | 2 |
| Toast, Snackbar | `status` o `alert` | overlay (`dismisses.on: timeout`) + `a11y.live` | 1 |
| Alert, Banner (estático) | `alert` o `status` | — | 1 |
| Breadcrumb | `breadcrumb` | — | 1 |
| Pagination | `landmark` (nav) | — | 1 |
| Toolbar, SegmentedControl | `toolbar` · `radio` | collection · member | 2 |
| Table | `table` | data | 1–3 |
| DataGrid (editable) | `grid` | data, collection · member | 2+ |
| Tree | `tree` | collection · member | 2 |
| Icon | `img` | media | 1 |
| Avatar, Image | `img` | media (`fallback`) | 1 |
| Card, Badge, Tag, Divider, Skeleton, Spinner | `null` (`separator` para Divider, `status` para Spinner) | — | 1 |

`check` exige estos módulos a partir de `review` (en `draft` solo avisa).

## 3. Regla de compuestos: ¿parte o contrato propio?

Una pieza tiene **contrato propio** si se cumple **cualquiera** de estas:

1. El consumidor la **coloca** él mismo (escribe `<TabItem>`), normalmente varias veces.
2. Tiene **props propias** que el consumidor pasa (`value`, `disabled` por ítem).
3. En Figma es **su propio component set** y se instancia dentro del padre.

Si no, es una **parte** de `anatomy`: el `thumb` de un Switch, el `indicator` de un Checkbox, el `backdrop` de un Dialog.

Enlace obligatorio:

- padre: `"collection": { "items": ["TabItem"], … }`;
- hijo: `"member": { "of": "Tabs", "identity": "value", "reflects": ["selected"] }`.

Instancias de **otro componente del sistema** dentro de este (un Icon en un Button, un Button en el pie de un Dialog) no son compuestos: van en `composition.nested` con sus `fixedProps`.

## 4. Nombres accesibles (`a11y.name.from`)

| Caso | `from` | `required` |
|---|---|---|
| Texto visible dentro (Button, Tab) | `content` | false |
| Etiqueta visible enlazada (TextField, Checkbox) | `label-part` | true |
| Solo icono (IconButton) | `aria-label` | **true** |
| Diálogo con título | `title-part` | true |
| Imagen | `alt` | según `decorative` |

## 5. Valores que no se pueden leer

| Situación | Qué escribir |
|---|---|
| Capa con color sin variable | `null` + `needsReview` (`reason`: "#E2E2E2 sin variable", `question`: "¿Qué token?") |
| Valor intermedio entre dos tokens (radio 6 entre 4 y 8) | `null` + `needsReview` con las dos opciones |
| Algo que Figma no puede expresar (teclado, aria, eventos) | Rellénalo como `inferred` |
| Algo que no sabes ni puedes inferir | Deja la clave **ausente** y anótalo en el resumen |
