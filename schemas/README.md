# schemas/: las reglas

| Esquema | Valida | Lo rellena |
|---|---|---|
| `ds-config.schema.json` | `ds.config.json` | ds-setup |
| `tokens.schema.json` | `tokens/*.json`, `tokens/themes/*.json` | ds-tokens |
| `contract.schema.json` | `contracts/components/*/contract.json` | ds-contract, ds-sync, ds-spec |
| `icons.schema.json` | `icons/registry.json` | ds-icons |
| `vocabulary.schema.json` | `contracts/vocabulary.json` | ds-setup, ds-decide |

Además de la forma, `scripts/check.mjs` comprueba reglas que un JSON Schema no puede expresar:

- capas de tokens y referencias;
- tokens que existen;
- compuestos enlazados;
- patrón → módulos;
- exigencias por estado;
- código sin hex ni px.

`fixtures/` es un minisistema de ejemplo que usa **todas** las piezas del esquema (`npm run check:self`).

Cambiar un esquema = ADR + aprobación del dueño.
