# 2 · Configurar y auditar

## Tú

1. Clona el template (botón **Use this template** en GitHub) y ábrelo con Claude Code.
2. Ejecuta `npm run check`. Tiene que salir ✔ con todo vacío.
3. Pide: *"Configura el sistema"*. Responde a las preguntas (nombre, prefijo, enlace de Figma, dueño, stack).
4. Pide: *"Audita mi Figma"*.
5. Lee `docs/auditoria/0001-….md`, sobre todo **Problemas** y **Preguntas abiertas**.
6. Para cada pregunta, pide: *"Decidamos la escala de tamaños"* (o la que toque). La IA te da opciones; **tú decides**.

## La IA

- `ds-setup` → `ds.config.json`, `contracts/vocabulary.json`.
- `ds-figma-audit` → `docs/auditoria/0001-….md`.
- `ds-decide` → `docs/adr/0100-….md`, `0101-…`

## Ha ido bien si…

- `ds.config.json` no tiene `null` en `name`, `prefix`, `owner` ni `figma`.
- La auditoría distingue **Medido** e **Inferido**, y dice qué **no** ha podido leer.
- Tienes entre 3 y 6 ADRs en `Propuesto`, como mínimo:
  - escala de tamaños;
  - modos;
  - librería de iconos;
  - stack (nativo o *headless*);
  - qué hacer con los valores sin variable.
- `npm run check` ✔.

## Qué es un ADR

Una página que registra **una decisión**: el contexto, qué se decide, dónde se aplica, qué cuesta (consecuencias negativas) y qué se descartó. Sirve para que dentro de seis meses (tú, tu equipo o una IA) se sepa *por qué* el sistema es así. Ejemplos en `docs/adr/0001` a `0005`.
