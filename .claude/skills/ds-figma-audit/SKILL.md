---
name: ds-figma-audit
description: Audita el archivo de Figma antes de generar nada - variables, estilos, component sets, propiedades, capas, iconos - y separa lo medido de lo inferido. Termina con preguntas abiertas que se convierten en ADRs. Úsala después de ds-setup, cuando digan "audita mi Figma", "analiza el archivo", "qué hay en mi Figma", "antes de empezar revisa", o cuando Figma haya cambiado mucho.
---

# ds-figma-audit · Fase A, paso 2

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| A · Preparar | 2 | `ds-setup` | `ds-decide` |

## Qué hace y qué no

**Solo lee y escribe un informe.** No crea tokens, contratos ni ADRs. Su producto son **preguntas**, no decisiones.

## Qué necesitas

- `ds.config.json`: `figma.fileUrl` y `figma.bridge`. Si `bridge` es `null`, para y ejecuta `ds-setup`.
- `templates/audit.md`: la estructura del informe.
- Si hay auditorías previas en `docs/auditoria/`, léelas: esta es la siguiente (número correlativo).

## Pasos

1. **Crea el informe**: `npm run new -- audit "<nombre del archivo>"`.
2. **Variables** (sección *Medido*):
   - Colecciones, modos, número y tipo de variables.
   - Si las variables ya están separadas por capas (primitivas/semánticas), anótalo.
   - Con `figma-mcp`, aclara que solo ves las variables de los nodos que consultes: consulta cada component set.
3. **Estilos que no son variables**: estilos de texto, de efecto (sombras) y de color sin variable. Irán a tokens *composite* citando el estilo.
4. **Componentes**: por cada component set anota:
   - número de variantes;
   - propiedades con su tipo (VARIANT / BOOLEAN / TEXT / INSTANCE_SWAP / SLOT);
   - capas sin nombre (`Frame 12`);
   - **valores sin variable** (colores o medidas sueltas): es el dato que más `null` generará.
5. **Iconos**: si son componentes propios o de una librería conocida (nombres como `lucide/…` o `ph:…`), cuántos hay y si van en un component set.
6. **Inferido**: lo que deduces. Cada punto cita el dato medido en el que se apoya:
   - escala de tamaños implícita;
   - propiedades de Figma que parecen estados de interacción (`State=Hover`);
   - variantes que parecen breakpoints o modos (`Device=Mobile`, `Theme=Dark`);
   - componentes que parecen compuestos (Tabs + Tab).
7. **Problemas**: tabla con evidencia (id de nodo o nombre de variable) e impacto.
8. **Preguntas abiertas**: cada decisión estructural que el alumno tiene que tomar, con opciones. Siempre revisa estas:
   - ¿Qué escala de tamaños (nombres de valores)?
   - ¿Qué modos y temas?
   - ¿Qué librería de iconos?
   - ¿Hay capa de tokens de componente o solo primitiva + semántica?
   - ¿Qué hacemos con los valores sin variable: crear variable en Figma o aceptar `null`?
   - ¿Librería *headless* o HTML nativo?
   - ¿Nombres de props en conflicto entre componentes (`Type` vs `Variant`)?
9. Si sabes algo de **Medido** solo a medias, dilo en *Qué NO se ha leído*. **Nunca rellenes huecos.**

## Qué entrega

- `docs/auditoria/NNNN-<archivo>.md`.
- Resumen en el chat: 3 hallazgos principales y las preguntas abiertas.
- Siguiente paso: **`ds-decide`** con esas preguntas.

## Cómo comprobarlo

- [ ] Cada número de *Medido* sale de una lectura real, no de una estimación.
- [ ] Cada punto de *Inferido* cita su evidencia.
- [ ] Están todas las preguntas abiertas obligatorias, aunque la respuesta parezca obvia.
- [ ] `npm run check` en verde (la sección "Preguntas abiertas" existe).
