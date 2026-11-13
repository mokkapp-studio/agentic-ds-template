# Fixtures

Un **minisistema de prueba**, no el tuyo. Sirve para demostrar que los esquemas cubren cualquier componente:
cada módulo del contrato (`form`, `collection`, `member`, `overlay`, `range`, `media`, `data`, `content`,
`composition`, `testing`) y las 7 clases de propiedad de Figma aparecen al menos una vez.

```bash
npm run check:self
```

| Fixture | Qué demuestra |
|---|---|
| Button | Componente simple · `stable` · clases prop/interaction/declared/content/figma-only · comodín `{tone}` |
| Checkbox | `form` · estado de valor con `mixed` (indeterminado) · input nativo oculto |
| TextField | `form` · slots prefix/suffix · label, description y error como partes · `content` |
| Card | Sin patrón (`null`) · slots · clases responsive y mode · `composition` |
| Tabs + TabItem | Compuesto: `collection` + `member` |
| Dialog | `overlay` con trampa de foco · `testing` |
| Slider | `form` + `range` |
| Icon | `media` con `source: registry` |
| Table | `data` · en `draft`, con `null` + `needsReview` (así se ve un contrato a medias) |

También son **ejemplos** para las skills: cuando `ds-contract` no sepa cómo modelar algo, mira aquí.
