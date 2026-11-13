# templates/: las plantillas

Las skills **nunca** escriben un archivo de memoria: copian una plantilla, la rellenan y validan con `npm run check`.
A mano: `npm run new -- <tipo> <nombre>`.

| Plantilla | Se convierte en | Esquema | Skill |
|---|---|---|---|
| `contract.json` + `contract.CHANGELOG.md` | `contracts/components/<N>/` | contract | ds-contract, ds-spec |
| `tokens.primitive.json`, `tokens.semantic.json`, `tokens.component.json` | `tokens/*.json` | tokens | ds-tokens |
| `tokens.theme.json` | `tokens/themes/<modo>.json` | tokens | ds-tokens |
| `icons.registry.json` | `icons/registry.json` | icons | ds-icons |
| `vocabulary.json` | `contracts/vocabulary.json` | vocabulary | ds-setup |
| `adr.md` | `docs/adr/NNNN-*.md` | (secciones, check) | ds-decide |
| `audit.md` | `docs/auditoria/NNNN-*.md` | (secciones, check) | ds-figma-audit |
| `component-doc.md` | `docs/components/<N>.md` | — | npm run docs |

La plantilla de contrato solo trae el **núcleo**. Los módulos (`form`, `collection`, `member`, `overlay`, `range`, `media`, `data`, `content`, `composition`, `testing`) los añade `ds-contract` según el patrón. Ejemplos de cada uno en `schemas/fixtures/`.
