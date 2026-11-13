---
name: ds-decide
description: Convierte una pregunta abierta o una decisión estructural en un ADR (Architecture Decision Record) - contexto con evidencia, decisión, dónde se aplica, consecuencias positivas y negativas, alternativas - y mantiene el índice. Úsala tras la auditoría, y siempre que digan "decidamos", "registra la decisión", "crea un ADR", "por qué hicimos X", o cuando otra skill se tope con algo que no está en ningún contrato ni ADR.
---

# ds-decide · Fase A, paso 3 (y cuando haga falta)

## Alcance

Escribe ADRs. **Cuándo hace falta un ADR** (ver `GOBERNANZA.md` §2):

- Algo que afecta a **más de un componente**: escalas, nombres, modos, iconos, stack.
- Cualquier cambio **major** de un contrato (renombrar o quitar).
- Excepciones a una regla (un componente que no usa tokens semánticos…).

Un detalle de un solo componente **no** es un ADR: va en su contrato y su CHANGELOG.

## Antes de empezar

- `templates/adr.md` y `docs/adr/README.md` (índice). Comprueba que la decisión no exista ya. Si existe y cambia, el ADR nuevo la **reemplaza**.
- La auditoría más reciente de `docs/auditoria/` (sus preguntas abiertas).

## Proceso

1. **Una pregunta = un ADR.** No mezcles iconos y modos en el mismo.
2. **Presenta las opciones** al dueño con pros y contras, y tu recomendación. **No decidas tú**: espera la respuesta.
3. Crea el archivo: `npm run new -- adr "<título que enuncia la decisión>"`. La numeración empieza en 0100; los 0001–0005 son del template.
4. Rellena la plantilla:
   - **Título**: la decisión, no el tema ("Usamos s/m/l como escala de tamaños", no "Tamaños").
   - **Contexto**: con evidencia; enlaza la auditoría y cita nodos o variables.
   - **Decisión**: numerada y comprobable.
   - **Dónde se aplica**: los archivos exactos que cambian.
   - **Consecuencias negativas**: obligatorias. Si no ves ninguna, no has pensado bastante.
   - **Alternativas descartadas** con su porqué.
5. **Estado `Propuesto`** hasta que se aplique en los archivos de "Dónde se aplica". Cuando otra skill lo aplique, pásalo a `Aceptado`.
6. Si la decisión toca el vocabulario (nombres de props, estados o eventos), actualiza `contracts/vocabulary.json` con `"adr": "NNNN"`.
7. Ejecuta `npm run docs` (regenera el índice) y después `npm run check`.

## Salida

- `docs/adr/NNNN-<slug>.md`.
- `docs/adr/README.md` actualizado.
- La pregunta de la auditoría marcada con el número de ADR.

## Checklist

- [ ] El título es una frase con verbo.
- [ ] Hay al menos una consecuencia negativa.
- [ ] "Dónde se aplica" lista archivos reales.
- [ ] La decisión la tomó una persona (campo **Decide**), no la IA.
- [ ] `npm run check` en verde.
