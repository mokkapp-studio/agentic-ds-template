---
name: ds-component
description: Genera el código de un componente a partir de su contrato, en el stack de ds.config.json (React, Vue, Svelte, Angular, Web Components o HTML; CSS Modules, CSS, SCSS, Tailwind; HTML nativo o librería headless) - props, partes con data-part, estados con CSS y ARIA, teclado según el patrón APG, solo variables de tokens. Úsala cuando el contrato esté al menos en review y digan "genera el código", "implementa el componente", "pásalo a React", "crea el componente desde el contrato".
---

# ds-component · Fase C, paso 7

## Alcance

Escribe en `src/components/<nombre-kebab>/`. **El contrato manda**: si para implementar algo hace falta cambiar el contrato, para, propón el cambio (con su versión) y espera.

## Antes de empezar

- El contrato debe estar en `review` o `stable` (`npm run check` en verde). Si está en `draft`, avisa: generar código de un borrador obliga a rehacerlo.
- `ds.config.json`: `stack.*` y `prefix`.
- `tokens/build/tokens.css`: las variables que existen.
- Contratos de los componentes en `composition.nested`, `collection.items` y `slot.accepts`: genera antes los que falten.

## Proceso

1. **Estructura**, según el stack. Ejemplo para React + CSS Modules:
   ```
   src/components/button/
     Button.tsx
     Button.module.css
     index.ts
   ```
2. **API = `props` del contrato, exactamente:** mismos nombres, tipos, valores y defaults. No añadas props. Si el stack lo necesita (`className`, `ref`, `...rest`), usa las convenciones del framework y documéntalo en `governance.canExtend`.
3. **Eventos:** `behavior.events` con la convención del stack: `press` → `onPress` en React (o `onClick` si el ADR del stack lo dice), `@press` en Vue.
4. **Partes:** cada clave de `anatomy` es un elemento `element` con `data-part="<clave>"`. Las partes `optional` solo se renderizan si se cumple `visibleWhen`. Los `slot` reciben su prop o `children`.
5. **Estados:**
   - `interaction` → solo CSS (`:hover`, `:active`, `:focus-visible`), nunca estado de JS.
   - `declared` y `value` → atributo `data-<estado>` en root + el atributo `aria` del contrato.
   - `value` con `control: shared` → controlado (`value` + `onChange`) y no controlado (`defaultValue`).
6. **Estilos:** cada entrada de `anatomy.<parte>.tokens` se convierte en `propiedad: var(--<prefix>-<ruta-con-guiones>)`. Cada clave de `when` es un selector:
   - `size=s` → `[data-size="s"]`;
   - `state=hover` → el `css` del estado (`:hover`);
   - `state=disabled` → `[data-disabled]`;
   - `variant=ghost&state=hover` → `[data-variant="ghost"]:hover`.

   El comodín `{tone}` se convierte en un selector por valor. `font: typography.label` → `font: var(--<prefix>-typography-label)`.
7. **Prohibido** en el código:
   - hex;
   - px sueltos;
   - `opacity` para disabled;
   - tokens primitivos;
   - valores distintos para dark (los modos cambian solos con `[data-theme]`).

   `check` lo vigila.
8. **Comportamiento según `ds.config.stack.headless`:**
   - `native`: implementa el patrón APG del contrato a mano: teclado de `a11y.keyboard`, foco y roles. Usa elementos nativos siempre que se pueda (`button`, `input`, `dialog`).
   - `base-ui`, `radix`, `react-aria`, `ark`…: usa el primitivo de esa librería para el patrón y aplica solo estilos y `data-part`. **No** dupliques comportamiento que la librería ya da.
9. **Módulos:**
   - `form`: input nativo, `name`, `required`, `aria-describedby` hacia `description` y `error`.
   - `overlay`: trampa de foco, Esc, clic fuera, retorno del foco, portal y bloqueo de scroll según el contrato.
   - `collection` / `member`: contexto padre-hijo, foco itinerante, flechas, Inicio y Fin.
   - `range`: `aria-valuemin`, `aria-valuemax`, `aria-valuenow` y `aria-valuetext`.
   - `media`: `aria-hidden` si es decorativo.
10. **Icons:** solo a través del componente `Icon` y el registro.
11. **Cierra:**
    - pon `meta.code: "src/components/<nombre>"` en el contrato (solo ese campo);
    - `npm run check` (incluye el control de `data-part`);
    - `npm run docs`;
    - si el contrato estaba en `review` y todo lo que pide `GOBERNANZA.md` §5 se cumple, **propón** subirlo a `stable` (lo aprueba el dueño).

## Salida

- `src/components/<nombre>/`.
- `meta.code` actualizado.
- La lista de reglas del contrato aplicadas y lo que se ha dejado fuera o queda en duda (AGENTS.md, "Al terminar").

## Checklist

- [ ] Props idénticas al contrato.
- [ ] Todas las partes con `data-part`.
- [ ] Interacción solo con CSS; los estados declarados con su `aria`.
- [ ] Solo `var(--<prefix>-…)` de tokens semánticos o de componente.
- [ ] Teclado y foco del patrón APG.
- [ ] `npm run check` en verde.
