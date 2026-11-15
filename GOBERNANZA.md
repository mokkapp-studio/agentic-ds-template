# Gobernanza

Cómo se toman y se registran las decisiones del sistema. Es corta a propósito: todo lo que dice aquí lo comprueba `npm run check` o un hook.

## 1. Roles

| Rol | Quién | Puede |
|---|---|---|
| **Dueño** | `ds.config.json → owner` | Aprobar cambios en tokens, vocabulario, esquemas, contratos en `review`/`stable` y ADRs |
| **Contribuidor** | Cualquier persona del equipo | Proponer: abrir ADRs en `Propuesto`, contratos en `draft`, PRs |
| **Agente (IA)** | Las skills | Leer Figma, redactar borradores, generar código y docs. **Nunca decide**: propone y espera |

El hook `.claude/hooks/owner-approval.mjs` pide confirmación al usuario antes de que la IA toque archivos protegidos.

## 2. Qué exige un ADR

- Algo que afecta a **más de un componente**: escalas, nombres, modos, iconos, stack, capas de tokens.
- Un cambio **major** de un contrato (renombrar o quitar una prop, un valor, un estado o una parte).
- Una **excepción** a una regla de `AGENTS.md`.
- Cambiar `schemas/` o `templates/`.

No hace falta ADR para un detalle de un solo componente: eso va en su contrato y su CHANGELOG.

## 3. Orden de los cambios

```
Figma cambia ──► ds-sync ──► contrato (+versión, +CHANGELOG) ──► código (ds-component) ──► npm run docs
Decisión nueva ──► ds-decide (ADR Propuesto) ──► se aplica ──► ADR Aceptado
```

Nunca al revés: el código no cambia sin que antes cambie el contrato.

## 4. Versiones de contrato (semver)

| Cambio | Versión | Ejemplo |
|---|---|---|
| **patch** | 0.0.x | Textos, descripción, un token distinto con el mismo propósito |
| **minor** | 0.x.0 | Prop, valor, estado, parte o slot nuevo (nada se rompe) |
| **major** | x.0.0 | Renombrar o quitar cualquier cosa de la API pública. **Requiere ADR** |

Cada versión tiene su entrada en `contracts/components/<Nombre>/CHANGELOG.md`. Mientras un contrato esté en `0.x`, se considera inestable.

## 5. Estados del contrato

`check` comprueba cada uno:

| Estado | Significa | Exige |
|---|---|---|
| `draft` | Recién leído de Figma | Núcleo válido según el esquema. Lo que falta es aviso, no error |
| `review` | Listo para revisión del dueño | + `intent.purpose` y `useWhen`; `a11y.role` y `name`; teclado y foco si es interactivo; módulos de su patrón; **nada `inferred`** en `meta.provenance` |
| `stable` | Se puede usar en producto | + `meta.needsReview` vacío, ningún token `null`, `meta.owner`, `meta.customization` con contenido y `meta.code` existente |
| `deprecated` | No usar en nuevo código | + `meta.deprecation` (`replacedBy`, `removeIn`, `adr`) |

Subir de estado lo **propone** la IA y lo **aprueba** el dueño.

## 6. Vocabulario

`contracts/vocabulary.json` fija un nombre por idea (`size`, no `scale`; `tone`, no `color`; `press`, no `click`). Cada entrada lista en `replaces` los sinónimos a los que sustituye (`check` falla si un contrato los usa) y en `example` cómo se escribe en código. Cambiar el vocabulario requiere ADR.

## 7. Procedencia

Todo dato del contrato tiene origen en `meta.provenance`:

- `measured`: leído de Figma.
- `inferred`: redactado por la IA.
- `decided`: confirmado por una persona o un ADR.

Lo `inferred` no puede llegar a `review`.
