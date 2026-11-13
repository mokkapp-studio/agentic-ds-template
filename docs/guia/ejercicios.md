# Ejercicios

1. **Clasificar.** Para un component set de tu Figma, rellena a mano la tabla de 7 clases de `reference.md`. Después compárala con la que produce `ds-contract`.
2. **Romper el check.** En `schemas/fixtures/`, cambia un token de un contrato por uno primitivo (`color.purple.500`) y ejecuta `npm run check:self`. Lee el error y deshaz el cambio.
3. **Un null honesto.** Pon en Figma un color sin variable en un componente. Ejecuta `ds-contract` y localiza el `null` y su pregunta en `needsReview`.
4. **Tu primer ADR.** Decide la escala de tamaños con `ds-decide`. ¿Cuál es la consecuencia negativa?
5. **Compuesto.** Crea el contrato de un RadioGroup. ¿Cuántos contratos salen? ¿Qué enlaza a cada uno?
6. **Modo oscuro.** Añade un modo con `npm run new -- theme dark`, cambia 3 tokens y comprueba en `tokens/build/tokens.css` que solo se redefinen esos 3.
7. **Versionar.** Añade un valor `xl` a `size` en Figma y ejecuta `ds-sync`. ¿Qué versión propone? ¿Y si quitas `s`?
8. **Sin Figma.** Especifica un `Toast` con `ds-spec`. ¿Qué módulos activa y por qué?
