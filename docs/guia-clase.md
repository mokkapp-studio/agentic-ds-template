# De Figma a código con contratos
### Guía de clase · ds-template

> Un sistema de diseño donde **el contrato es la fuente de verdad**: Figma se *lee*, el código se *genera* y la documentación se *genera*. La IA propone y tú decides.

---

## 1. La idea en un minuto

```
 Figma ──leer──► AUDITORÍA ──► ADRs (decisiones)
                                   │
                                   ▼
              TOKENS (DTCG) + ICONOS  ◄── fundamentos
                                   │
                                   ▼
                     CONTRATO por componente   ◄── fuente de verdad
                       │                 │
                       ▼                 ▼
                    CÓDIGO           DOCUMENTACIÓN
                                   │
             npm run check  ◄──────┘  (vigila todo, siempre)
```

- **Contrato:** un JSON por componente que dice *qué es*: props, estados, partes, tokens, accesibilidad y comportamiento.
- **Skills:** instrucciones que la IA sigue para cada paso. No hace falta nombrarlas: se activan por lo que pides.
- **Check:** un script que valida que todo encaja. Es el "profesor" que corrige.
- **Hooks:** frenos automáticos que impiden que la IA edite lo que no debe.

---

## 2. Requisitos

| Necesitas | Para qué |
|---|---|
| **Node 20+** | Ejecutar los scripts (no hay dependencias, no hay `npm install`) |
| **Claude Code** | Ejecutar las skills |
| **Figma** con variables y componentes | El origen |
| **Un puente a Figma** (uno de tres) | Para que la IA pueda leerlo |

Los tres puentes, de más a menos completo:

| Puente | Qué lee | Cuándo usarlo |
|---|---|---|
| `figma-console` | Todo: variables, modos, alias, propiedades y capas | **Recomendado.** Figma Desktop con el plugin abierto |
| `figma-mcp` | Componentes; las variables solo por nodo | Si solo tienes el MCP oficial |
| `export-json` | Lo que hayas exportado | Sin MCP. La auditoría te dirá qué se pierde |

---

## 3. Mapa de carpetas

```
ds-template/
├── ds.config.json        ← la ficha del sistema (nombre, prefijo, Figma, stack, modos)
├── AGENTS.md             ← reglas para cualquier IA
├── CLAUDE.md             ← orden de las skills y hooks (para Claude Code)
├── GOBERNANZA.md         ← quién decide, estados, versiones
├── llms.txt              ← mapa del sistema para IAs (GENERADO)
├── package.json          ← los 5 comandos npm
│
├── tokens/               ← FUNDAMENTOS: decisiones visuales
│   ├── primitive.json    ←   valores en bruto (paleta, escala)
│   ├── semantic.json     ←   significado (color.text.default → primitivo)
│   ├── component.json    ←   opcional: tokens propios de un componente
│   ├── themes/dark.json  ←   solo lo que cambia en ese modo
│   └── build/            ←   tokens.css + tokens.json (GENERADO)
│
├── icons/registry.json   ← qué iconos usa el sistema y de qué librería
│
├── contracts/
│   ├── vocabulary.json   ← un nombre por idea (size, no scale)
│   └── components/<Nombre>/
│       ├── contract.json ←   EL CONTRATO (fuente de verdad)
│       └── CHANGELOG.md  ←   historial de versiones
│
├── src/components/       ← el código (generado desde el contrato)
│
├── docs/
│   ├── auditoria/        ← informes de lectura de Figma
│   ├── adr/              ← decisiones (0001–0005 vienen de serie; las tuyas, desde la 0100)
│   ├── components/       ← una página por componente (GENERADO)
│   ├── sesiones/         ← resúmenes entre sesiones (ds-handoff)
│   └── guia/             ← la guía del alumno, paso a paso
│
├── schemas/              ← las REGLAS: qué forma debe tener cada JSON
│   └── fixtures/         ← un mini sistema de ejemplo para practicar
├── templates/            ← moldes vacíos de cada archivo
├── scripts/              ← los motores: check, tokens, docs, new
├── .claude/
│   ├── skills/           ← las 11 skills
│   ├── hooks/            ← los 2 frenos automáticos
│   └── settings.json     ← activa los hooks
└── .github/              ← check automático en cada PR y plantilla de PR
```

> **Regla de oro:** lo marcado como **GENERADO** nunca se edita a mano. Se cambia la fuente y se vuelve a ejecutar el comando.

---

## 4. Qué hace cada archivo clave

### Raíz

| Archivo | Qué es | Quién lo toca |
|---|---|---|
| `ds.config.json` | Nombre, prefijo CSS (`--xx-…`), URL de Figma, puente, stack (React, CSS Modules…), modos | `ds-setup`, una sola vez |
| `AGENTS.md` | Reglas que cualquier IA debe cumplir: contrato primero, solo tokens, nada inventado | El dueño (protegido) |
| `CLAUDE.md` | Tabla de skills por fases y en qué orden van | Casi nunca |
| `GOBERNANZA.md` | Roles, cuándo hace falta un ADR, semver y estados del contrato | El dueño (protegido) |
| `llms.txt` | Índice del sistema para que otra IA lo entienda rápido | `npm run docs` |

### Las reglas y los moldes

| Carpeta | Qué contiene |
|---|---|
| `schemas/` | 5 esquemas JSON: config, tokens, contrato, iconos y vocabulario. Definen qué es válido |
| `schemas/fixtures/` | Sistema de prueba con 10 contratos (Button, Checkbox, TextField, Card, Tabs, TabItem, Dialog, Slider, Icon, Table), 89 tokens y modo dark. **Para aprender mirando** |
| `templates/` | Moldes de contrato, CHANGELOG, tokens, tema, iconos, vocabulario, ADR, auditoría y página de doc |

### Los scripts

| Script | Comando | Qué hace |
|---|---|---|
| `check.mjs` | `npm run check` | Valida todo: config, tokens, iconos, vocabulario, contratos, código, ADRs |
| `build-tokens.mjs` | `npm run tokens` | JSON de tokens → `tokens/build/tokens.css` (variables CSS) |
| `docs.mjs` | `npm run docs` | Contratos → `docs/components/*.md`, índice de ADRs y `llms.txt` |
| `new.mjs` | `npm run new -- …` | Crea un archivo desde su plantilla (el camino sin IA) |
| `lib.mjs` | — | Utilidades compartidas (validador, lectura de tokens…) |

### Los hooks (frenos automáticos)

| Hook | Cuándo salta | Qué hace |
|---|---|---|
| `owner-approval.mjs` | **Antes** de que la IA escriba | **Bloquea** archivos generados. **Pregunta** antes de tocar tokens, vocabulario, esquemas, plantillas, reglas o contratos en `review`/`stable` |
| `check-after-write.mjs` | **Después** de que la IA escriba | Ejecuta `check`. Si falla, la IA recibe los errores y tiene que arreglarlos |

---

## 5. Conceptos que hay que entender

### 5.1 Tokens en capas (DTCG)

```
primitive   color.blue.600 = #2563eb          ← valor en bruto
    ▲
semantic    color.fill.brand = {color.blue.600}  ← significado
    ▲
component   button.radius = {radius.m}        ← opcional
```

- Un semántico solo apunta a primitivos. Un token de componente solo apunta a semánticos.
- **Los componentes solo usan semánticos o de componente, nunca primitivos.**
- Modo oscuro: `themes/dark.json` redefine **solo** lo que cambia. En CSS sale como `[data-theme="dark"] { … }`.

### 5.2 Las 7 clases de propiedad de Figma

Cada propiedad de un componente de Figma se clasifica antes de pasarla a código:

| Clase | Ejemplo en Figma | En código |
|---|---|---|
| `prop` | Variant = Solid/Ghost | Prop `variant` |
| `interaction` | State = Hover/Pressed | CSS `:hover`, `:active` (no es prop) |
| `declared` | Disabled = true | Prop + atributo ARIA |
| `content` | Label, Show icon, Icon swap | Texto, children, slot |
| `responsive` | Breakpoint = Mobile | Media query |
| `mode` | Theme = Dark | `data-theme` (no es prop) |
| `figma-only` | Show redlines | Nada: se ignora |

### 5.3 El contrato

Un contrato tiene estos bloques:

| Bloque | Responde a |
|---|---|
| `figma` | ¿De qué nodo sale? ¿Cómo se clasifica cada propiedad? |
| `intent` | ¿Para qué sirve? ¿Cuándo usarlo? ¿Cuándo no, y qué usar en su lugar? |
| `props` | La API pública |
| `states` | Hover, focus, disabled… y cómo se resuelven (CSS o prop + ARIA) |
| `anatomy` | Las partes (`root`, `label`, `icon`…) → `data-part` en el HTML. Cada parte con sus tokens |
| `layout` | Auto layout: dirección, gap, padding, tamaño |
| `behavior` | Patrón WAI-ARIA (`button`, `checkbox`, `tabs`, `dialog-modal`…) y eventos |
| `a11y` | Rol, nombre accesible, teclado, foco visible, área mínima, contraste |
| módulos | `form`, `collection`, `overlay`, `range`… Se activan según el patrón |
| `meta` | Dueño, qué se puede adaptar, deprecación, `needsReview` (preguntas abiertas) y `provenance` (medido, inferido o decidido) |

### 5.4 "Lo que no se puede leer no se inventa"

Si la IA no puede saber algo (un color sin variable, un comportamiento que no se ve en Figma):
- lo deja en **`null`**;
- añade una **pregunta** en `meta.needsReview`;
- marca de dónde sale cada dato en `meta.provenance`: `measured` (leído), `inferred` (deducido) o `decided` (lo decidiste tú).

**Responder esas preguntas es el trabajo de diseño real.**

### 5.5 Estados del contrato

```
draft ──► review ──► stable ──► deprecated
```

| Estado | Para pasar hace falta |
|---|---|
| `draft` | Que sea válido según el esquema |
| `review` | Propósito, rol y nombre accesible, teclado y foco si es interactivo, y **nada `inferred`** |
| `stable` | Sin `needsReview`, sin tokens `null`, código existente, `meta.owner` y `meta.customization` rellenados |
| `deprecated` | Indicar qué lo sustituye, cuándo se elimina y su ADR |

La IA **propone** el cambio de estado; el dueño **aprueba**.

### 5.6 Versiones (semver)

| Cambio | Versión | ¿ADR? |
|---|---|---|
| Textos, descripción | patch `1.0.1` | No |
| Añadir prop, valor, estado o parte | minor `1.1.0` | No |
| Renombrar o quitar algo | **major** `2.0.0` | **Sí** |

### 5.7 ADR (Architecture Decision Record)

Una decisión = un archivo con contexto, decisión, consecuencias (también las malas) y alternativas.

- **Necesita ADR:** lo que afecta a varios componentes (escalas, nombres, modos, iconos, stack), los cambios major y las excepciones a las reglas.
- **Vienen de serie:**
  - 0001: el contrato es la fuente de verdad;
  - 0002: tokens DTCG en capas;
  - 0003: las 7 clases de propiedad;
  - 0004: comportamiento con patrones WAI-ARIA;
  - 0005: lo que no se lee no se inventa.

---

## 6. Paso a paso

Son 8 pasos en 4 fases. Haz `npm run check` después de cada uno.

| Fase | Paso | Skill | Resultado |
|---|---|---|---|
| A · Preparar | 0 | — | Proyecto copiado |
| | 1 | — (tú) | Figma ordenado |
| | 2 | `ds-setup` | `ds.config.json` |
| | 3 | `ds-figma-audit` | Auditoría |
| | 4 | `ds-decide` | ADRs |
| B · Fundamentos | 5 | `ds-tokens` | `tokens/` + `tokens.css` |
| | 6 | `ds-icons` | `icons/registry.json` + contrato Icon |
| C · Por componente | 7 | `ds-contract` | `contract.json` |
| | 8 | `ds-component` | Código + docs |
| D · Mantener | 9 | `ds-sync` | Versiones y CHANGELOG |

---

### Paso 0 · Crear tu proyecto

En GitHub: **Use this template**, o descomprime el zip. Abre la carpeta con Claude Code.

```bash
npm run check
```

✅ **Comprueba:** sale `sistema sin configurar. Empieza por la skill ds-setup` y 0 errores.

---

### Paso 1 · Preparar Figma (lo haces tú)

Comprueba en tu archivo de Figma:
- [ ] **Variables** en colecciones: primitivos aparte y semánticos con **alias** a los primitivos.
- [ ] **Modos** (light/dark) como modos de variable, no como componentes duplicados.
- [ ] **Componentes** como *component sets*, con propiedades claras (Variant, Size, State…).
- [ ] **Capas con nombre** (`Label`, `Icon`), no `Frame 12`.
- [ ] Los colores, espacios y radios del componente **enlazados a variables**.
- [ ] Una **descripción** en cada componente.

> Cuanto mejor esté Figma, menos `null` y menos preguntas después.

---

### Paso 2 · Configurar · `ds-setup`

**Prompt:**
> *Configura el sistema. Se llama Aurora, prefijo `au`, el dueño soy yo. Este es mi Figma: <URL>. Trabajamos en React con CSS Modules y tenemos modo claro y oscuro.*

**Genera:** `ds.config.json` relleno, y comprueba que puede leer Figma con el puente elegido.

✅ **Comprueba:** `npm run check` ya no dice "sin configurar".

---

### Paso 3 · Auditar · `ds-figma-audit`

**Prompt:**
> *Audita mi Figma antes de empezar.*

**Genera:** `docs/auditoria/0001-….md`, con:
- inventario de variables, estilos, componentes e iconos;
- lo medido frente a lo inferido;
- inconsistencias (colores sueltos, nombres raros);
- lo que el puente no deja leer;
- **preguntas abiertas**.

> No crea nada más: solo mira.

✅ **Comprueba:** lee la lista de preguntas. Cada una será un ADR.

---

### Paso 4 · Decidir · `ds-decide`

**Prompts:**
> *Registra la decisión sobre la estructura de tokens: primitivos y semánticos, sin tokens de componente.*

> *Decidamos los modos: light y dark.*

> *Vamos a usar Lucide como librería de iconos. Crea el ADR.*

**Genera:** `docs/adr/0100-….md`, `0101-…` y siguientes, con estado `Propuesto` → `Aceptado`.

✅ **Comprueba:** `npm run docs` actualiza el índice `docs/adr/README.md`.

---

### Paso 5 · Tokens · `ds-tokens`

**Prompts:**
> *Pasa las variables de Figma a tokens.*

> *Añade el modo oscuro.*

**Genera:** `tokens/primitive.json`, `semantic.json`, `themes/dark.json`. Después:

```bash
npm run tokens
```

**Genera:** `tokens/build/tokens.css`, con variables como `--au-color-fill-brand: var(--au-color-blue-600);`.

✅ **Comprueba:**
- abre `tokens.css`: los semánticos apuntan con `var()` a los primitivos;
- el bloque `[data-theme="dark"]` solo contiene lo que cambia;
- `npm run check` sale en verde.

---

### Paso 6 · Iconos · `ds-icons`

**Prompt:**
> *Añade los iconos. Usamos Lucide, solo los que aparecen en Figma.*

**Genera:** `icons/registry.json` (solo los iconos usados) y el contrato `Icon`.

> Necesita antes los tokens `icon.size.*` y el ADR de iconos.

✅ **Comprueba:** `npm run check` cuenta los iconos.

---

### Paso 7 · Contrato · `ds-contract` (uno por componente)

Orden recomendado: primero los que no dependen de nadie (Icon, Button) y después los que los usan (TextField, Card, Dialog…).

**Prompts:**
> *Crea el contrato de Button desde Figma.*

> *Pasa este componente: <link al nodo de Figma>.*

> *Crea el contrato de Tabs.* (Si es compuesto, salen dos contratos: `Tabs` y `TabItem`.)

**Qué hace la IA:**
1. Lee el component set.
2. Clasifica cada propiedad en sus 7 clases.
3. Detecta el patrón WAI-ARIA y activa sus módulos.
4. Mapea capas → `anatomy` y variables → `tokens`.
5. Deja `null` + pregunta en todo lo que no puede leer.

**Genera:** `contracts/components/Button/contract.json` + `CHANGELOG.md`, en estado `draft`.

**Tu trabajo:** responder las preguntas de `needsReview`.
> *Las respuestas a needsReview de Button: el foco usa color.border.focus, el área mínima es 44px. Pásalo a review.*

✅ **Comprueba:** `npm run check` sale en verde, y en `review` no queda nada `inferred`.

---

### Paso 8 · Código y documentación · `ds-component`

Requisito: contrato en `review` o `stable`.

**Prompt:**
> *Genera el código de Button.*

**Genera:** `src/components/Button/`, con:
- props exactas del contrato;
- `data-part` en cada parte;
- estados con CSS (`:hover`, `:focus-visible`) y ARIA;
- teclado según el patrón;
- **solo variables de tokens** (ni hex ni px sueltos).

Después:

```bash
npm run docs
```

**Genera:** `docs/components/Button.md`, el índice de componentes y `llms.txt`.

✅ **Comprueba:**
- `npm run check` valida que el código solo usa tokens que existen y que cada parte tiene su `data-part`;
- abre `docs/components/Button.md`.

Cuando lo apruebes:
> *Pasa Button a stable.*

---

### Paso 9 · Mantener · `ds-sync`

**Prompts:**
> *He cambiado Figma, sincroniza.*

> *¿Qué ha cambiado en Figma desde la última vez?*

**Qué hace:** compara Figma con tokens y contratos, propone el salto de versión (patch, minor o major) y escribe el CHANGELOG.
- Si es **major**, pide un ADR.
- Después regenera el código y las docs.

```
Figma cambia → ds-sync → contrato (+versión) → ds-component → npm run docs
```

> **Nunca al revés:** el código no cambia sin que antes cambie el contrato.

---

### Skills opcionales

| Skill | Prompt de ejemplo | Para qué |
|---|---|---|
| `ds-spec` | *Necesito un Toast que no está en Figma* | Contrato desde una descripción (todo `inferred` y en `draft`) |
| `ds-figma-build` | *Crea el Button en Figma desde su contrato* | Dirección inversa: contrato → Figma (necesita `figma-console`) |
| `ds-handoff` | *Cerramos por hoy, resume la sesión* | Guarda lo hecho y lo pendiente en `docs/sesiones/` |

---

## 7. Comandos

| Comando | Cuándo |
|---|---|
| `npm run check` | Después de cada paso. Verde = puedes seguir |
| `npm run check:self` | Probar el template con el sistema de ejemplo (`fixtures`) |
| `npm run tokens` | Después de cambiar tokens |
| `npm run docs` | Después de cambiar contratos o ADRs |
| `npm run new -- contract Button` | Crear un contrato vacío sin IA |
| `npm run new -- adr "Título"` | Crear un ADR vacío |
| `npm run new -- audit "Mi Figma"` | Crear una auditoría vacía |
| `npm run new -- theme dark` | Crear un modo |
| `npm run new -- tokens` / `icons` / `vocabulary` | Crear esos archivos vacíos |

---

## 8. Pruebas para hacer en clase

Para demostrar que el sistema **se defiende solo**.

### Prueba 1 · El template funciona
```bash
npm run check:self
```
✅ Espera: `0 errores · 10 contrato(s) · 89 token(s) · 4 icono(s)`. Los `ℹ` son avisos informativos, no fallos.

### Prueba 2 · Romper el check
1. En `schemas/fixtures/contracts/components/Button/contract.json`, en `anatomy.root.tokens`, cambia `"color": "color.text.on-brand"` por `"color": "color.purple.500"`, que es un primitivo.
2. Ejecuta `npm run check:self`.
3. ✅ Espera: `✖ … anatomy.root.tokens.color: "color.purple.500" es primitivo; usa un semántico o de componente (ADR 0002)`. Deshaz el cambio.

> Otras roturas para probar: usar `scale` en vez de `size` (vocabulario prohibido), quitar `a11y.role` en un contrato `review`, poner un valor hex en el CSS del componente.

### Prueba 3 · Hook de archivo generado
**Prompt:** *Cambia a mano el color en tokens/build/tokens.css.*
✅ Espera: la IA **no puede**. El hook responde que es GENERADO y que hay que ejecutar `npm run tokens`.

### Prueba 4 · Hook de aprobación
**Prompt:** *Cambia el valor de color.fill.brand en semantic.json.*
✅ Espera: Claude Code te **pide permiso** ("El dueño del sistema debe aprobarlo").

### Prueba 5 · Check automático
**Prompt:** *Añade al contrato de Button una prop `color`.*
✅ Espera: tras escribir, el hook ejecuta `check`, detecta que `color` está prohibido por el vocabulario (lo correcto es `tone`) y la IA tiene que corregirlo.

### Prueba 6 · Modo oscuro
```bash
npm run new -- theme dark
```
Cambia 3 tokens en `themes/dark.json` y ejecuta `npm run tokens`.
✅ Espera: en `tokens.css`, el bloque `[data-theme="dark"]` tiene **solo 3** líneas.

### Prueba 7 · Un null honesto
Pon en Figma un color **sin variable** en un componente y crea su contrato.
✅ Espera: ese token sale en `null`, con una pregunta en `needsReview`. El contrato no puede pasar a `stable` hasta resolverlo.

### Prueba 8 · Versionado
Añade el valor `xl` a `Size` en Figma y ejecuta: *Sincroniza con Figma*.
✅ Espera: propone **minor**. Si quitas `s`, propone **major** y pide un ADR.

### Prueba 9 · Orden de las skills
En un proyecto recién copiado: *Genera el código de Button.*
✅ Espera: la IA dice que falta configurar, auditar, los tokens y el contrato, y propone empezar por el principio.

---

## 9. Chuleta de prompts

| Quiero… | Prompt |
|---|---|
| Empezar | *Configura el sistema: se llama X, prefijo xx, este es mi Figma <URL>* |
| Ver qué hay | *Audita mi Figma* |
| Decidir | *Registra la decisión sobre <tema>* · *¿Por qué hicimos X?* |
| Tokens | *Pasa las variables de Figma a tokens* · *Añade el modo oscuro* |
| Iconos | *Añade los iconos con Lucide* · *Falta el icono X* |
| Contrato | *Crea el contrato de <Componente> desde Figma* |
| Revisar | *¿Qué queda en needsReview de <Componente>?* |
| Subir estado | *Pasa <Componente> a review / stable* |
| Código | *Genera el código de <Componente>* |
| Cambios | *He cambiado Figma, sincroniza* |
| Sin Figma | *Especifica un componente <X> que no está en Figma* |
| Al revés | *Crea <Componente> en Figma desde su contrato* |
| Cerrar | *Cerramos por hoy, resume lo pendiente* |

---

## 10. Errores típicos

| Síntoma | Causa | Solución |
|---|---|---|
| "sistema sin configurar" | No has hecho el paso 2 | `ds-setup` |
| Muchos `null` en el contrato | Figma sin variables enlazadas | Enlaza variables en Figma y vuelve a ejecutar `ds-contract` |
| "token no existe" | El contrato usa un token que no está en `tokens/` | Créalo con `ds-tokens` o usa uno existente |
| "usa un primitivo" | El componente apunta a `color.blue.600` | Usa un semántico (`color.fill.brand`) |
| "término prohibido" | `scale`, `color`, `click`… | Usa el del vocabulario: `size`, `tone`, `press` |
| No puede pasar a `stable` | Quedan `needsReview`, `null` o falta el código | Resuélvelos uno a uno |
| La IA no puede editar un archivo | Es GENERADO | Cambia la fuente y ejecuta el comando |
| `tokens.css` desactualizado | No has recompilado | `npm run tokens` |

---

## 11. Resumen en 6 frases

1. **Figma se lee, el contrato manda, el código y las docs se generan.**
2. **Los tokens van en capas:** primitivo → semántico → componente, y los modos solo redefinen lo que cambia.
3. **Cada propiedad de Figma tiene una clase**, y eso decide si es prop, CSS, ARIA o nada.
4. **Lo que no se puede leer queda en `null` con una pregunta**: la IA no inventa.
5. **Las decisiones van en ADRs; los cambios, en versiones y CHANGELOG.**
6. **`npm run check` y los hooks vigilan:** si está en verde, puedes seguir.

---

**Para seguir:** `docs/guia/` (guía detallada por pasos) · `docs/guia/ejercicios.md` (8 ejercicios) · `schemas/fixtures/` (10 contratos de ejemplo).
