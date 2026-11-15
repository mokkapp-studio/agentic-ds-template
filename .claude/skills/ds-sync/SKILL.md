---
name: ds-sync
description: Compara Figma con los tokens y contratos actuales y propone los cambios - variables nuevas, renombradas o borradas, propiedades o variantes nuevas, capas cambiadas - con el salto de versión correcto (patch, minor, major) y su CHANGELOG. Úsala cuando digan "he cambiado Figma", "sincroniza", "qué ha cambiado en Figma", "actualiza el contrato desde Figma", o antes de una entrega.
---

# ds-sync · Fase D (mantenimiento)

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| D · Mantener | 8 | contratos y tokens existentes | `ds-component` y `npm run docs` |

## Qué hace y qué no

Detecta diferencias y **propone**. No aplica nada sin el visto bueno del dueño. Nunca regenera un contrato desde cero: lo **edita**, para conservar lo decidido (intent, a11y, meta.owner, meta.customization).

## Qué necesitas

- `ds.config.json` (puente), `tokens/build/tokens.json` y los contratos afectados.
- `meta.figmaSyncedAt` de cada contrato. Con `figma-console` puedes acotar con `figma_get_changes_since_version` o `figma_diff_versions`.

## Pasos

1. **Alcance:** pregunta si es todo el sistema, solo tokens o un componente.
2. **Tokens:** lee las variables como en `ds-tokens` y compara por `$extensions.figma.variable` (o `id`):

   | Cambio | Acción | Impacto |
   |---|---|---|
   | Variable nueva | Añadir token | Ninguno |
   | Valor cambiado | Cambiar `$value` | Visual: avisa |
   | Renombrada | Renombrar el token **y todas sus referencias** en contratos | Major en los contratos que la usan + ADR |
   | Borrada | Proponer `$deprecated` antes de borrar | Major si algún contrato la usa |

3. **Componentes:** lee el component set como en `ds-contract` y compara con `figma.properties`, `anatomy.*.figmaLayer` y los tokens de cada parte:

   | Cambio en Figma | Cambio en el contrato | Versión |
   |---|---|---|
   | Texto o descripción | `figma.description`, textos | patch |
   | Valor nuevo en una prop | Añadir a `values` | minor |
   | Propiedad nueva | Clasificar (7 clases) y añadir | minor |
   | Capa nueva | Parte nueva | minor |
   | Variable distinta en una capa | Token distinto | patch (o minor si es un cambio de diseño) |
   | Propiedad o valor eliminado | Quitar | **major** + ADR |
   | Propiedad o capa renombrada | Renombrar | **major** si cambia la API pública; patch si solo cambia `figmaLayer` |

4. **Informe** en el chat: tabla de cambios con versión propuesta e impacto en código (`meta.code`).
5. **Con el visto bueno:**
   - aplica los cambios;
   - sube la `version`;
   - añade una entrada al `CHANGELOG.md`;
   - actualiza `meta.figmaSyncedAt`;
   - si es major, crea el ADR con `ds-decide`;
   - `npm run tokens` (si tocaste tokens), `npm run check` y `npm run docs`.
6. Si hay código, avisa de que hay que regenerarlo o ajustarlo con `ds-component`.

## Qué entrega

- Informe de diferencias.
- Tras aprobar: contratos y tokens actualizados, CHANGELOG y versiones.

## Cómo comprobarlo

- [ ] Nada aplicado sin aprobación.
- [ ] Cada contrato cambiado tiene versión nueva y entrada en el CHANGELOG.
- [ ] Los renombrados actualizan todas las referencias.
- [ ] Los cambios major tienen ADR.
- [ ] `npm run check` en verde.
