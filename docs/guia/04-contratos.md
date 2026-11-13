# 4 · Contratos (un componente cada vez)

## Tú

1. En Figma, copia el enlace del component set (clic derecho → *Copy link to selection*).
2. Pide: *"Crea el contrato del botón: <enlace>"*.
3. Lee `docs/components/Button.md` (generado) y responde a las preguntas de **Pendiente de revisar**.
4. Revisa lo que la IA ha redactado (propósito, cuándo usarlo, accesibilidad). Cuando lo confirmes, pide: *"Pasa el Button a review"*.

**Orden recomendado:**

1. Icon.
2. Button.
3. Checkbox y TextField.
4. Card.
5. Tabs.
6. Dialog.

Cada nivel introduce algo nuevo.

## Qué hay dentro de un contrato

| Bloque | Responde a | Sale de |
|---|---|---|
| `figma` | ¿De dónde viene y cómo se clasificó cada propiedad? | Figma |
| `intent` | ¿Para qué sirve? ¿Cuándo no usarlo? | IA + tú |
| `props` | ¿Qué API tiene? | Figma |
| `states` | ¿Qué estados tiene y quién los controla? | Figma |
| `anatomy` | ¿Qué partes tiene y qué tokens usa cada una? | Capas y variables de Figma |
| `layout` | ¿Cómo se dimensiona? | Auto layout |
| `behavior` | ¿Qué patrón de interacción sigue? | IA |
| `a11y` | ¿Cómo se usa con teclado y lector de pantalla? | IA + tú |
| módulos | Formularios, grupos, capas, rangos, media, datos | Según el patrón |
| `meta` | ¿Qué falta? ¿De dónde salió cada cosa? | Todas las skills |

## Las 7 clases (lo más importante)

No todas las variantes de Figma son props. `State=Hover` lo hace el navegador; `Mode=Dark` lo hacen los tokens; `Breakpoint=Mobile` lo hace el layout. Tabla completa: `.claude/skills/ds-contract/reference.md`.

## ¿Uno o varios contratos?

Tabs y TabItem son **dos** contratos porque tú colocas cada TabItem. El *thumb* de un Switch es una **parte**, porque nunca lo colocas tú.

## Ha ido bien si…

- `npm run check` ✔.
- Cada `null` tiene su pregunta en **Pendiente de revisar**.
- Ninguna prop se llama `state`, `hover`, `mode` ni `breakpoint`.
