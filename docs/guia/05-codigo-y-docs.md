# 5 · Código y documentación

## Tú

1. Con el contrato en `review`, pide: *"Genera el código del Button"*.
2. Revisa `src/components/button/`.
3. Si todo cuadra, pide: *"Pasa el Button a stable"*.

## La IA

- `ds-component` → código en tu stack (`ds.config.json → stack`), con `data-part` en cada parte, estados con CSS y ARIA, y solo `var(--<prefijo>-…)`.
- `npm run docs` → `docs/components/Button.md`, índice y `llms.txt`.

## Ha ido bien si…

- `npm run check` ✔. Comprueba que no hay hex, ni px sueltos, ni `opacity` en disabled, ni tokens inexistentes, y que están todos los `data-part`.
- Con el teclado funciona lo que dice `a11y.keyboard`.
- Al cambiar `data-theme="dark"` en `<html>` el componente cambia sin tocar su CSS.

## Ver los componentes

El template no incluye un entorno de previsualización: es agnóstico. Puedes añadir Storybook, Vite o lo que use tu stack. Las skills generan código que funciona en cualquiera.
