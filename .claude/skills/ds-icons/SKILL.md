---
name: ds-icons
description: Añade la librería de iconos del sistema - Lucide, Phosphor, Tabler, Heroicons, Material Symbols, Remix o los iconos propios de Figma - crea icons/registry.json con solo los iconos que se usan, y genera el contrato Icon. Úsala tras los tokens, cuando digan "añade los iconos", "quiero usar Lucide/Phosphor…", "configura la librería de iconos", "falta un icono", o cuando un contrato necesite un icono que no está en el registro.
---

# ds-icons · Fase B, paso 5

| Fase | Paso | Necesita | Después |
|---|---|---|---|
| B · Fundamentos | 5 | tokens `icon.size.*` y ADR de iconos | `ds-contract` |

## Qué hace y qué no

Crea o actualiza `icons/registry.json` y el contrato `Icon`. **Regla del sistema:** ningún componente importa la librería de iconos directamente; todo pasa por `Icon` y el registro.

## Qué necesitas

- `ds.config.json` (stack) y el ADR de iconos. Si no existe, la elección de librería **es** una decisión: hazla con `ds-decide`.
- Tokens `icon.size.*`. Si no existen, vuelve a `ds-tokens` (o pregunta los valores).
- `templates/icons.registry.json` y `schemas/icons.schema.json`. Ejemplo: `schemas/fixtures/icons/registry.json`.

## Pasos

1. **Detecta qué hay en Figma:** busca instancias de iconos en los component sets (propiedades INSTANCE_SWAP, capas `Icon`).
   - Si los nombres coinciden con una librería conocida, propón esa.
   - Si son dibujos propios, la librería es `custom-figma`.
2. **Confirma la librería con el alumno** y anótala en el ADR. Datos por librería:

   | Librería | Paquete React | Pesos | Trazo |
   |---|---|---|---|
   | lucide | `lucide-react` | — | `strokeWidth` |
   | phosphor | `@phosphor-icons/react` | thin…fill, duotone | — |
   | tabler | `@tabler/icons-react` | — | `stroke` |
   | heroicons | `@heroicons/react` | outline, solid | — |
   | material-symbols | `@material-symbols/svg-400` | fill, grade | — |
   | remix | `@remixicon/react` | line, fill | — |

   Para otros frameworks, usa el paquete equivalente y anótalo en `package`.
3. Crea el registro: `npm run new -- icons`. Rellena `library`, `package`, `docs` y `defaults` (`size` es un token).
4. **Registra solo los iconos que se usan.** Cada uno lleva:
   - `name` (en el `naming` elegido);
   - `use` (para qué sirve, para que la IA elija bien);
   - `source` si el nombre en la librería es distinto;
   - `figma.component` si existe.
5. **Contrato `Icon`:** `npm run new -- contract Icon`. Rellénalo como `schemas/fixtures/contracts/components/Icon/contract.json`:
   - módulo `media` con `source: "registry"`;
   - `decorative: "prop"`;
   - tamaño con el comodín `icon.size.{size}`;
   - patrón `img`.
6. **Iconos propios (`custom-figma`):** exporta los SVG a `icons/svg/<name>.svg` con el puente (`figma_get_component_image` en formato svg, o `get_design_context`). Sin color fijo: usa `currentColor`.
7. Ejecuta `npm run check`.

## Qué entrega

- `icons/registry.json`.
- `contracts/components/Icon/`.
- ADR de la librería (`Propuesto` → `Aceptado`).

## Cómo comprobarlo

- [ ] Cada icono tiene `use`.
- [ ] `defaults.size` y `sizes` existen como tokens.
- [ ] `rules.color` es `currentColor`.
- [ ] Ningún otro contrato o código importa la librería.
- [ ] `npm run check` en verde.
