# 6 · Mantener

## Cuando cambia Figma

Pide: *"He cambiado el botón en Figma, sincroniza"*. `ds-sync` te enseña las diferencias y la versión que propone:

| Cambio | Versión |
|---|---|
| Texto | patch (`1.0.1`) |
| Algo nuevo | minor (`1.1.0`) |
| Renombrar o quitar algo | **major** (`2.0.0`) + ADR |

Nada se aplica sin tu aprobación. Cada versión queda en `CHANGELOG.md`.

## Cuando hay que decidir algo

Pide: *"Decidamos …"* → `ds-decide`. Reglas en [GOBERNANZA.md](../../GOBERNANZA.md).

## Al acabar una sesión

Pide: *"Cerramos por hoy"* → `ds-handoff` resume lo hecho y lo pendiente en `.ai/memory/`.
