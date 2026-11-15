---
name: ds-setup
description: Configura el sistema de diseño por primera vez - nombre, prefijo, enlace de Figma, stack, modos, dueño - y comprueba cómo se puede leer Figma. Úsala lo primero de todo, cuando el alumno diga "empezar", "configurar el sistema", "inicializar", "conectar mi Figma" o cuando check diga "sistema sin configurar".
---

# ds-setup · Fase A, paso 1

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| A · Preparar | 1 | — | `ds-figma-audit` |

## Qué hace y qué no

Rellena `ds.config.json` y crea `contracts/vocabulary.json`. **No** lee el diseño todavía (eso es `ds-figma-audit`) ni crea tokens.

## Qué necesitas

- Lee `ds.config.json` (plantilla vacía) y `schemas/ds-config.schema.json` (qué valores admite cada campo).
- Si `ds.config.json` ya tiene `name`, **no lo sobrescribas**: enseña lo que hay y pregunta qué cambiar.

## Pasos

1. **Pregunta, de una vez, lo que no puedas deducir:**
   - Nombre del sistema.
   - Prefijo corto para CSS. Propón uno derivado del nombre: "Aurora" → `au`.
   - Enlace al archivo de Figma.
   - Quién es el dueño (quien aprueba cambios).
   - Idioma de la documentación.
   - Stack, con un valor por defecto: `react` + `typescript` + `css-modules` + `native`.
2. **Extrae `fileKey`** del enlace: `figma.com/design/<fileKey>/…`.
3. **Comprueba el puente con Figma**, en este orden, y anota el primero que funcione en `figma.bridge`:
   - `figma-console`: si tienes las herramientas `figma_get_variables` / `figma_execute` y `figma_get_status` responde. Lee **todas** las variables con sus modos.
   - `figma-mcp`: si tienes el MCP oficial (`get_variable_defs`, `get_design_context`). **Aviso al alumno:** solo devuelve las variables *usadas en el nodo consultado*, no el inventario completo.
   - `export-json`: si no hay ninguno. Pide al alumno que exporte las variables con un plugin (p. ej. *Variables Export* o *Tokens Studio*) y deje el JSON en `tokens/_import/`.
4. **Modos:** si el puente funciona, lee los modos de la colección semántica y propónlos en `modes` (el primero = por defecto). Si no, pregunta (`["light"]` o `["light", "dark"]`).
5. **Escribe `ds.config.json`.** Valores permitidos: los del esquema; si el alumno pide algo fuera de ellos, explica que hay que cambiar el esquema con un ADR.
6. **Crea el vocabulario:** `npm run new -- vocabulary` (copia `templates/vocabulary.json`). Explica para qué sirve: una idea, un nombre.
7. `npm run check`.

## Qué entrega

- `ds.config.json` completo.
- `contracts/vocabulary.json`.
- Un mensaje con el puente detectado y sus límites, y el siguiente paso: **`ds-figma-audit`**.

## Cómo comprobarlo

- [ ] `name`, `prefix`, `owner`, `figma.fileUrl`, `figma.fileKey` y `figma.bridge` no son `null`.
- [ ] `prefix` en minúsculas, sin guiones.
- [ ] El alumno sabe qué puede y qué no puede leer su puente.
- [ ] `npm run check` en verde.

## Errores típicos

- Inventar el stack sin preguntar: el valor por defecto se **propone**, no se impone.
- Elegir un prefijo largo (`mydesignsystem`): ensucia cada variable CSS.
