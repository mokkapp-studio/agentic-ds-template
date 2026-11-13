---
name: ds-spec
description: (Opcional) Crea el contrato de un componente que NO existe en Figma a partir de una descripción - todo queda como inferred y en draft hasta que se diseñe o se confirme. Úsala cuando digan "necesito un componente que no está en Figma", "especifica un componente nuevo", "contrato desde cero", "propón un componente".
---

# ds-spec · Opcional

## Alcance

Contrato **sin Figma**. Mismo esquema y mismas reglas que `ds-contract`, pero:

- `figma.*` va en `null` y `figma.properties` queda vacío;
- todo lo redactado lleva `source: "inferred"` en `meta.provenance`;
- `meta.needsReview` incluye `{ "path": "figma", "reason": "No existe en Figma", "question": "¿Se diseña o se acepta solo en código?" }`.

## Proceso

1. Pregunta para qué sirve, dónde se usa y en qué se parece a componentes que ya existen. Si ya existe uno que cubre el caso, **dilo** y propón usarlo (o una variante).
2. Busca el patrón APG y los módulos en `.claude/skills/ds-contract/reference.md`.
3. `npm run new -- contract <Nombre>` y rellena el contrato:
   - props con el vocabulario;
   - estados;
   - anatomía con `figmaLayer: null`;
   - tokens existentes, o `null` + `needsReview`;
   - intent, a11y y eventos.
4. `npm run check` y `npm run docs`.
5. Propón el siguiente paso: diseñarlo en Figma (o `ds-figma-build`) y después `ds-sync`.

## Checklist

- [ ] `status: draft`; nada `measured`.
- [ ] Ningún token inventado.
- [ ] `npm run check` en verde.
