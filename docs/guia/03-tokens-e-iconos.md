# 3 · Tokens e iconos

## Tú

1. Pide: *"Genera los tokens"*. Aprueba los cambios cuando te lo pida (el hook protege los tokens).
2. Abre `tokens/build/tokens.css` y busca tus colores.
3. Pide: *"Añade los iconos con Lucide"* (o tu librería).

## La IA

- `ds-tokens` → `tokens/primitive.json`, `semantic.json`, `themes/dark.json` (si hay modo oscuro) y `npm run tokens` → `tokens/build/`.
- `ds-icons` → `icons/registry.json` + `contracts/components/Icon/` + ADR de iconos `Aceptado`.

## Entender las capas

```
primitive   color.purple.500  = #6E56CF            ← valor
semantic    color.fill.brand  = {color.purple.500} ← uso (lo usan los componentes)
component   button.fill       = {color.fill.brand} ← opcional
themes/dark color.fill.brand  = {color.purple.300} ← solo lo que cambia
```

En CSS: `--<prefijo>-color-fill-brand: var(--<prefijo>-color-purple-500);`. El modo oscuro solo redefine las semánticas dentro de `[data-theme="dark"]`.

## Ha ido bien si…

- `npm run tokens` ✔ y `npm run check` ✔.
- Ningún semántico tiene un hex directamente (o, si lo tiene, hay un aviso que entiendes).
- Existen `icon.size.*`, `size.target.min`, tokens `*.disabled` y `color.border.focus`.
- El registro de iconos solo tiene los iconos que usas, cada uno con su `use`.
