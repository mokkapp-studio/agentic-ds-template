# Ejercicio de clase · Simple Design System → contratos y código
### 2 h 30 min · con ds-template y el Figma de SDS

> **Objetivo de la sesión:** que cada alumno salga con un sistema que funciona de punta a punta:
> - el Figma auditado;
> - 3 o 4 decisiones registradas;
> - los tokens compilados;
> - el registro de iconos;
> - el contrato de **Button** en `review`;
> - el código de Button y su documentación;
> - `npm run check` en verde.
>
> Checkbox queda como ampliación o como deberes.

**Archivo de Figma:** [Simple Design System (Community)](https://www.figma.com/design/0VEljjIPpD367Z0s6ZRn9F/Simple-Design-System--Community-?node-id=3-5)

---

## 0. Por qué SDS es un buen archivo para este ejercicio

Lo he revisado y tiene justo lo que hace falta para enseñar el método, **incluidos problemas reales** que la IA debe detectar y no tapar:

| Lo que hay en SDS | Por qué es interesante en clase |
|---|---|
| Variables con sintaxis de código `--sds-…` (`--sds-color-background-brand-default`, `--sds-size-space-300`, `--sds-size-radius-200`) | El prefijo ya está decidido: **`sds`**. Los nombres son semánticos |
| **Button**: `Variant` = Primary/Neutral/Subtle · `State` = Default/Hover/Disabled · `Size` = Medium/Small | Muestra las 7 clases: `Variant` es **prop**, `Hover` es **interaction**, `Disabled` es **declared** |
| **Button Danger** como *component set aparte* (Primary/Subtle) | **Decisión de diseño:** ¿componente aparte o `tone="danger"`? → ADR |
| **Icon Button** y **Button Group** aparte | Discusión: ¿variante, prop o componente propio? |
| **Checkbox Field**: `Value Type` = Checked/Unchecked/Indeterminate · `State` = Default/Disabled | Estado `checked` + `indeterminate` → patrón `checkbox` y módulo `form` |
| **Input Field**: `State` = Default/Error/Disabled · `Value Type` = Default/Placeholder | `Error` es el estado `invalid`. `Placeholder` es **content**, no una prop |
| Instancias `_Component Annotation` junto a cada componente | Son **figma-only**: se ignoran |
| Página **Icons** con iconos propios | ADR de iconos: ¿los de Figma o una librería (Lucide)? |
| Páginas Foundations, Examples, Composition guide… | No son componentes: la auditoría debe separarlos |

---

## 1. Preparación del profesor (el día antes, ≈1 h)

> **La clave para que "todo salga bien" es hacer el ejercicio entero tú antes, una vez, con el mismo puente que usarán los alumnos.**

### 1.1 Elegir el puente a Figma

| Puente | Para quién | Ventajas | Cuidado |
|---|---|---|---|
| **`figma-console`** (recomendado) | Profesor y alumnos con Figma Desktop | Lee **todas** las variables, con sus alias y modos, y los componentes completos | Necesita Figma Desktop + el plugin *Desktop Bridge* abierto en el archivo. El archivo debe ser **un duplicado propio**, no la página de Community |
| **`figma-mcp`** (MCP oficial) | Alumnos sin plugin | Fácil de conectar (`/mcp` → Figma) | Solo da las variables **usadas en cada nodo**, ya resueltas a hex: **no ve los primitivos ni los alias**. En planes gratuitos el cupo de llamadas es muy bajo |
| **`export-json`** | Plan C | No depende de nada en clase | Hay que exportar las variables antes (plugin *Variables Export* o *Tokens Studio*) y dejar el JSON en `tokens/_import/` |

**Recomendación:**
- **Tú:** `figma-console`.
- **Alumnos:** `figma-console` si pueden. Si no, `figma-mcp`, y tú les das el JSON de variables exportado para el paso de tokens.

### 1.2 Checklist

- [ ] **Node 20+** y **Claude Code** instalados en tu equipo y comprobados en los de los alumnos (manda las instrucciones una semana antes).
- [ ] El template en GitHub como **Template repository** (o el zip preparado).
- [ ] **Duplica SDS:** abre el enlace → *Open in Figma* → **Duplicate** (queda en tus drafts). Pide a los alumnos que hagan lo mismo **antes** de clase.
- [ ] Con `figma-console`: abre el duplicado en **Figma Desktop** → *Plugins → Development → Figma Desktop Bridge*. En Claude Code, `/mcp` debe mostrar `figma-console` conectado.
- [ ] Mira el panel de **Variables** del duplicado y anota:
  - qué colecciones hay;
  - qué modos tiene la de color (¿Light/Dark?);
  - si los semánticos tienen alias a primitivos.

  Lo necesitas para guiar el paso 5.
- [ ] **Exporta las variables a JSON** (plan C) y súbelo a una carpeta compartida.
- [ ] **Haz el ejercicio completo** en un repo de prueba y **etiqueta cada punto de control** (ver 1.3).
- [ ] Ten abierta esta guía y `docs/guia-clase.md` (teoría).

### 1.3 Repo de rescate (muy recomendado)

Mientras haces la prueba, haz un commit y un tag al terminar cada fase:

```bash
git tag cp1-config && git tag cp2-adrs && git tag cp3-tokens && git tag cp4-contrato && git tag cp5-codigo
```

(Cada tag, en su momento, después de su commit.)

Sube ese repo. Si un alumno se queda atascado, se pone al día con:

```bash
git fetch rescate --tags && git checkout cp3-tokens -- tokens/ icons/ docs/adr/ ds.config.json contracts/vocabulary.json
```

Así **nadie se queda fuera** por un problema técnico.

---

## 2. Agenda (150 min)

| Hora | Min | Bloque | Skill | Punto de control |
|---|---|---|---|---|
| 0:00 | 10 | Introducción y demo del resultado final | — | — |
| 0:10 | 15 | Entorno: proyecto + Figma + puente | — | `npm run check` sale "sin configurar" |
| 0:25 | 10 | Configurar | `ds-setup` | **CP1** · `ds.config.json` |
| 0:35 | 15 | Auditar SDS | `ds-figma-audit` | Auditoría con preguntas |
| 0:50 | 20 | Decidir (4 ADRs) | `ds-decide` | **CP2** · ADRs 0100–0103 |
| 1:10 | 10 | ☕ Descanso | — | — |
| 1:20 | 20 | Tokens + modos | `ds-tokens` | **CP3** · `tokens.css` |
| 1:40 | 10 | Iconos | `ds-icons` | Registro + contrato Icon |
| 1:50 | 20 | Contrato de Button | `ds-contract` | **CP4** · Button en `review` |
| 2:10 | 10 | Código y docs | `ds-component` | **CP5** · `src/` + `docs/` |
| 2:20 | 10 | Romper el sistema + cierre | — | Pruebas de hooks y check |

> Si vais rápido: Checkbox en el paso 7 bis. Si vais lentos: el contrato de Button lo haces tú en pantalla y los alumnos lo replican después.

---

## 3. El ejercicio, paso a paso

Cada paso tiene: 🎯 objetivo · 🗣 qué explicas · ⌨️ qué hacen · 💬 prompt · ✅ cómo comprobarlo · ⚠️ problemas típicos.

---

### Paso 0 · Introducción (0:00 – 0:10)

🎯 Que entiendan el porqué antes del cómo.

🗣 Explica:
1. El problema: Figma, código y documentación se desincronizan.
2. La idea: **el contrato es la fuente de verdad**. Figma se lee, el código y las docs se generan.
3. **La IA propone, tú decides.** Lo que la IA no puede leer lo deja en `null` con una pregunta.

Enseña el resultado final de tu prueba: `contract.json` de Button → `src/components/Button/` → `docs/components/Button.md`.

---

### Paso 1 · Entorno (0:10 – 0:25)

🎯 Todos con el proyecto abierto y Figma conectado.

⌨️ Alumnos:
1. En GitHub, **Use this template** → crea `mi-sds`, clónalo y ábrelo con Claude Code (o descomprime el zip).
2. Abre en Figma Desktop **su duplicado** de SDS.
3. Con `figma-console`: lanza el plugin *Desktop Bridge*. Con `figma-mcp`: `/mcp` y autoriza Figma.
4. Ejecuta:

```bash
npm run check
```

✅ Sale `sistema sin configurar. Empieza por la skill ds-setup` y **0 errores**.

💬 Comprobar la conexión con Figma:
> *¿Puedes leer mi archivo de Figma? Dime qué páginas tiene.*

✅ Debe listar Cover, Foundations, Icons, Buttons, Inputs, Cards, Dialog…

⚠️ Problemas típicos:
- `node: command not found` → falta Node 20.
- No ve Figma → el plugin no está abierto, o el archivo abierto es el de Community y no el duplicado.
- `figma-mcp` responde "rate limit" → pasa a `figma-console` o al plan C.

---

### Paso 2 · Configurar · `ds-setup` (0:25 – 0:35)

🎯 Rellenar la ficha del sistema.

🗣 Explica que el prefijo se elige una vez y aparece en todas las variables CSS. SDS ya usa `sds`.

💬 Prompt (sustituir `<URL>` por la URL **de su duplicado**):
> *Configura el sistema. Se llama "Simple Design System", prefijo `sds`, el dueño soy yo. Este es mi Figma: `<URL>`. Leemos Figma con figma-console. Stack: React, TypeScript y CSS Modules. De momento solo modo light; decidiremos los modos tras la auditoría.*

✅ Comprueba:
- `ds.config.json` con nombre, `prefix: "sds"`, `fileKey`, `bridge` y stack;
- existe `contracts/vocabulary.json`;
- `npm run check` ya **no** dice "sin configurar".

🏁 **CP1**

---

### Paso 3 · Auditar SDS · `ds-figma-audit` (0:35 – 0:50)

🎯 Ver qué hay antes de generar nada, y separar lo **medido** de lo **inferido**.

💬 Prompt:
> *Audita mi Figma. Céntrate en las variables, en la página Icons y en los component sets de Buttons e Inputs. Separa lo que has medido de lo que deduces y termina con las preguntas abiertas.*

Se genera `docs/auditoria/0001-….md`.

✅ Pídeles que busquen en la auditoría:
- [ ] Las colecciones de variables y sus modos.
- [ ] Que **Button Danger** está separado de **Button**.
- [ ] Que el `State` de Button mezcla interacción (`Hover`) y declaración (`Disabled`).
- [ ] Que `Value Type = Placeholder` del Input no es una prop.
- [ ] Que `_Component Annotation` es documentación de Figma (**figma-only**).
- [ ] Qué **no** ha podido leer con su puente (con `figma-mcp`: los primitivos y los alias).
- [ ] Una lista de **preguntas abiertas**.

🗣 Discusión en voz alta (3 min): *"¿Qué ha deducido la IA que no debería dar por hecho?"*

⚠️ Si la auditoría intenta crear tokens o contratos, recuérdales que este paso **solo lee**.

---

### Paso 4 · Decidir · `ds-decide` (0:50 – 1:10)

🎯 Convertir las preguntas de la auditoría en decisiones registradas. **Esta es la parte de diseño, no de IA.**

Haced estos 4 ADRs. Debátelos 2 o 3 minutos con la clase **antes** de lanzar cada prompt.

**ADR 1 · Capas de tokens**
> *Registra la decisión: tokens en dos capas, primitivos y semánticos, a partir de las colecciones de SDS. Sin tokens de componente por ahora. Prefijo sds.*

**ADR 2 · Modos**
> *Registra la decisión sobre modos: <light y dark, si la colección de color los tiene | solo light>.*

**ADR 3 · Button Danger** ⭐ (el más interesante)
> *Registra la decisión: Button Danger no será un componente aparte. Button tendrá una prop `tone` con `brand`, `neutral` y `danger`, además de `variant`. Explica qué combinaciones de Figma corresponden a cada valor y la consecuencia negativa.*

🗣 Pregunta a la clase: *"¿Qué pasa con `Variant=Neutral`? ¿Es variant o tone?"* No hay una única respuesta correcta; lo importante es **que quede escrito y razonado**.

**ADR 4 · Iconos**
> *Registra la decisión sobre iconos: usamos <los iconos propios de la página Icons de SDS | Lucide>, solo los que aparecen en los componentes.*

(Los iconos de SDS tienen un estilo de trazo como el de Feather. Lucide es su sucesor, así que es una buena alternativa.)

Después:

```bash
npm run docs
```

✅ Comprueba:
- `docs/adr/0100-…` a `0103-…` existen;
- el índice `docs/adr/README.md` está actualizado;
- en cada ADR hay **consecuencias negativas**: si no las hay, no está bien hecho.

🏁 **CP2**

---

### ☕ Descanso (1:10 – 1:20)

Momento para que los rezagados se pongan al día con `cp2-adrs` del repo de rescate.

---

### Paso 5 · Tokens · `ds-tokens` (1:20 – 1:40)

🎯 Pasar las variables de SDS a DTCG en capas y compilar el CSS.

💬 Prompt (con `figma-console`):
> *Pasa las variables de Figma a tokens según los ADRs 0100 y 0101. Mantén los nombres de SDS (color.background.brand.default, size.space.300, size.radius.200…). Los semánticos deben apuntar con alias a los primitivos.*

💬 Prompt (con el plan C, JSON exportado en `tokens/_import/`):
> *Genera los tokens desde tokens/_import/ según los ADRs 0100 y 0101.*

Te pedirá permiso para escribir en `tokens/`: es el hook de aprobación. **Enséñalo en pantalla:** *"La IA no puede tocar los tokens sin que el dueño apruebe."*

Después:

```bash
npm run tokens
```

```bash
npm run check
```

✅ Comprueba:
- `tokens/primitive.json` y `tokens/semantic.json` existen; si hay modo dark, también `tokens/themes/dark.json`;
- en `tokens/build/tokens.css`, `--sds-color-background-brand-default: var(--sds-…);` apunta a un primitivo **con `var()`**, no con un hex;
- el bloque `[data-theme="dark"]` (si existe) solo tiene **lo que cambia**;
- `npm run check` sale en verde.

⚠️ Problemas típicos:
- Con `figma-mcp`, los semánticos salen con hex directo: es lo esperado, porque ese puente no ve los alias. Debe aparecer como `inferred` o como aviso. **Aprovecha para enseñarlo:** el puente limita lo que se puede saber, y la IA no lo esconde.
- Faltan tokens que ningún componente usa: con `figma-mcp` es normal.

🏁 **CP3**

---

### Paso 6 · Iconos · `ds-icons` (1:40 – 1:50)

🎯 Registrar solo los iconos que se usan y crear el contrato Icon.

💬 Prompt:
> *Añade los iconos según el ADR 0103. Registra solo los que usan Button, Icon Button, Checkbox e Input Field. Crea también el contrato Icon.*

✅ Comprueba:
- `icons/registry.json` con unos pocos iconos, no cientos;
- `contracts/components/Icon/contract.json` existe;
- `npm run check` cuenta los iconos.

⚠️ Si pide tokens `icon.size.*` que no existen, créalos en semánticos a partir de los tamaños reales de SDS (20/24 px…) y repite.

---

### Paso 7 · Contrato de Button · `ds-contract` (1:50 – 2:10)

🎯 El corazón del ejercicio: pasar el component set a contrato **clasificando cada propiedad**.

💬 Prompt (con el enlace al nodo del component set de Button en su duplicado):
> *Crea el contrato de Button desde Figma: `<link al component set Button>`. Aplica el ADR 0102: incorpora Button Danger como `tone="danger"`. Clasifica cada propiedad en sus 7 clases.*

(Cómo copiar el enlace: en Figma, clic derecho sobre el component set → *Copy link to selection*.)

✅ Haz que lo revisen en el JSON, apartado por apartado:

| Mira en… | Debe decir |
|---|---|
| `figma.properties` | `Variant` → **prop** · `Size` → **prop** (`Medium` → `m`, `Small` → `s`) · `State=Hover` → **interaction** · `State=Disabled` → **declared** |
| `props` | `variant`, `tone`, `size`, `disabled`, `label`… con nombres del **vocabulario** |
| `states` | `hover` por CSS · `focusVisible` por CSS · `disabled` como prop con `aria-disabled` o `disabled` |
| `anatomy` | `root`, `label`, `icon`, cada una con sus tokens **semánticos** |
| `behavior.pattern` | `button` |
| `meta.needsReview` | Preguntas. Seguro que hay una sobre **focus**: SDS no tiene variante de foco |

🗣 Momento clave: *"SDS no diseña el estado de foco. La IA no se lo inventa: lo deja en `null` y pregunta. **Lo decide un diseñador.**"*

💬 Responder a `needsReview` (adapta las respuestas a lo que hayáis decidido):
> *Respuestas para Button: el foco usa un anillo de 2px con color.border.default.default (o el token de foco que tengamos) y offset de 2px; el área mínima es 40px; Primary es la acción principal y no debe haber dos en el mismo grupo. Pásalo a review.*

```bash
npm run check
```

✅ Button en `review`, sin nada `inferred`, y 0 errores.

⚠️ Problemas típicos:
- El check falla con *"término prohibido"* → han usado `color` o `type` en lugar de `tone` o `variant`. Muy buen momento didáctico.
- El check falla con *"usa un primitivo"* → un token apunta a la paleta. Cámbialo por un semántico.
- No puede pasar a `review` → falta `intent.purpose`, `a11y.role` o el teclado.

🏁 **CP4**

#### 7 bis · Checkbox (si sobra tiempo, o como deberes)

💬
> *Crea el contrato de Checkbox desde `<link a Checkbox Field>`. Value Type Checked/Unchecked/Indeterminate es el estado `checked` más `indeterminate`.*

✅ Comprueba:
- `behavior.pattern: "checkbox"` y el módulo `form` activo;
- `checked` es un estado controlado con `aria-checked` (`mixed` para indeterminate);
- la etiqueta es el nombre accesible.

---

### Paso 8 · Código y docs · `ds-component` (2:10 – 2:20)

🎯 Ver que el código sale del contrato, y solo del contrato.

💬
> *Genera el código de Button.*

```bash
npm run docs
```

```bash
npm run check
```

✅ Abre `src/components/Button/`:
- [ ] Las props son exactamente las del contrato, sin extras.
- [ ] Hay `data-part="root"`, `data-part="label"`…
- [ ] El CSS solo usa `var(--sds-…)`: **ni un hex, ni un px suelto**.
- [ ] `:hover` y `:focus-visible` van por CSS.
- [ ] Disabled se hace con tokens `*.disabled`, **no con `opacity`**.

✅ Abre `docs/components/Button.md`: se ha generado sola.

🏁 **CP5**

---

### Paso 9 · Romper el sistema + cierre (2:20 – 2:30)

🎯 Ver que el sistema **se defiende solo**. Elige 2 o 3 pruebas según el tiempo:

| Prueba | Prompt o acción | Qué debe pasar |
|---|---|---|
| Editar un archivo generado | *Cambia a mano el color de Button en tokens/build/tokens.css* | **Bloqueado**: es GENERADO, hay que usar `npm run tokens` |
| Tocar un token | *Cambia color.background.brand.default a rojo* | **Pide permiso al dueño** |
| Nombre prohibido | *Añade al contrato de Button una prop `color`* | El check falla: el vocabulario dice usar `tone` |
| Saltarse el orden | En un proyecto vacío: *Genera el código de Card* | La IA dice qué pasos faltan |
| Cambio en Figma | Añade `Size=Large` al Button del duplicado → *He cambiado Figma, sincroniza* | Propone **minor** y una entrada en el CHANGELOG |

**Cierre (3 min)**, repite las 3 ideas:
1. El contrato manda; Figma se lee; el código y las docs se generan.
2. La IA no inventa: lo que no sabe lo pregunta, y responder es trabajo de diseño.
3. Las decisiones quedan escritas (ADR), y el check y los hooks lo vigilan todo.

**Deberes:**
- Checkbox (7 bis) e Input Field: fijaos en `Error` → `invalid` y en `Placeholder` → content.
- `docs/guia/ejercicios.md`: los ejercicios 1, 4 y 7.

---

## 4. Chuleta de prompts para la pizarra

```
1 · Configura el sistema: "Simple Design System", prefijo sds, mi Figma <URL>
2 · Audita mi Figma (variables, Icons, Buttons, Inputs)
3 · Registra la decisión sobre <capas | modos | Button Danger | iconos>
4 · Pasa las variables de Figma a tokens según los ADRs
    → npm run tokens
5 · Añade los iconos según el ADR (solo los usados) y crea el contrato Icon
6 · Crea el contrato de Button desde <link>. Aplica el ADR de tone
7 · Respuestas para Button: … Pásalo a review
8 · Genera el código de Button
    → npm run docs
Siempre → npm run check
```

---

## 5. Si algo falla en directo

| Síntoma | Solución rápida |
|---|---|
| Un alumno no tiene Node o Claude Code | Que trabaje en pareja; instala en el descanso |
| No conecta con Figma | Plan C: JSON exportado en `tokens/_import/` y `bridge: "export-json"` |
| El MCP oficial da *rate limit* | Cambiar a `figma-console` o al plan C. Para los contratos, hazlo tú en pantalla |
| La IA se salta pasos o mezcla fases | *"Para. Sigue el orden de CLAUDE.md: ¿qué paso toca ahora?"* |
| El check en rojo y no se entiende | *"Explícame el error del check y arréglalo sin tocar los tokens"* |
| Un alumno muy retrasado | Repo de rescate: `git checkout cp<N> -- …` |
| Se acaba el tiempo en el paso 7 | Haz tú Button en pantalla y deja `ds-component` para la siguiente clase |

---

## 6. Qué deben entregar los alumnos al terminar

- [ ] `ds.config.json` configurado.
- [ ] Una auditoría en `docs/auditoria/`.
- [ ] 4 ADRs, cada uno con consecuencias negativas.
- [ ] `tokens/` + `tokens/build/tokens.css`.
- [ ] `icons/registry.json` + contrato Icon.
- [ ] Contrato de Button en `review`, con `needsReview` respondido.
- [ ] `src/components/Button/` + `docs/components/Button.md`.
- [ ] Una captura de `npm run check` en verde.
