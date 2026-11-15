---
name: ds-handoff
description: (Opcional) Cierra una sesión de trabajo larga - resume lo hecho, lo pendiente (needsReview, ADRs propuestos, avisos de check) y las lecciones aprendidas en docs/sesiones/ para que la siguiente sesión (o la siguiente persona) continúe sin perder contexto. Úsala cuando digan "cerramos por hoy", "resume la sesión", "handoff", "qué queda pendiente".
---

# ds-handoff · Opcional

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| Opcional | — | — | la siguiente sesión |

## Pasos

1. Ejecuta `npm run check` y `npm run docs`.
2. Recoge:
   - archivos creados o cambiados (`git status`);
   - contratos por estado;
   - `needsReview` abiertos;
   - ADRs en `Propuesto`;
   - avisos de `check`.
3. Escribe `docs/sesiones/AAAA-MM-DD-sesion.md`:
   - **Hecho**;
   - **Pendiente**, con dueño y skill para continuar;
   - **Decisiones tomadas en la sesión**, que tienen ADR o deberían tenerlo;
   - **Lecciones**: qué confundió a la IA o al alumno, por ejemplo una propiedad de Figma mal clasificada.
4. Si una lección se repite, propón añadirla a `.claude/skills/ds-contract/reference.md` o a `AGENTS.md`.
5. Propón un mensaje de commit. No hagas commit sin que te lo pidan.
