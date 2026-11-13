# 0005 · Lo que no se puede leer no se inventa: null, needsReview y procedencia

| Estado | Fecha | Decide | Reemplaza / Reemplazado por |
|---|---|---|---|
| Aceptado | 2026-11-13 | Template | — |

## Contexto

Ningún Figma está completo: colores sin variable, radios intermedios, capas sin nombre, nada sobre teclado o ARIA. Una IA tiende a rellenar esos huecos con valores plausibles, y el error pasa desapercibido.

## Decisión

1. **`null`** = se ha mirado y no hay dato o no está decidido. **Clave ausente** = no se ha mirado.
2. Cada `null` lleva una entrada en `meta.needsReview` con `path`, `reason` (qué hay en Figma) y `question` (qué decidir).
3. `meta.provenance` registra el origen de cada bloque: `measured` (Figma), `inferred` (IA) o `decided` (persona o ADR).
4. `check` avisa de cualquier `null` sin `needsReview`, impide `review` si queda algo `inferred` e impide `stable` si queda `null` o `needsReview`.
5. Las auditorías separan **Medido**, **Inferido** y **Qué no se ha leído**.

## Dónde se aplica

| Archivo | Qué cambia |
|---|---|
| `schemas/contract.schema.json` | `meta.needsReview`, `meta.provenance` |
| `scripts/check.mjs` | Reglas por estado |
| `templates/audit.md` | Secciones Medido, Inferido, No leído |

## Consecuencias

**Positivas**
- Los huecos se ven y se convierten en preguntas concretas para el equipo.
- Se sabe qué partes del contrato son fiables.

**Negativas**
- Los primeros contratos salen llenos de `null`: puede parecer un fallo y no lo es.
- El dueño tiene trabajo de revisión.

## Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Que la IA elija el token más parecido | Errores silenciosos |
| Bloquear el contrato hasta que Figma esté perfecto | Nadie avanzaría |
