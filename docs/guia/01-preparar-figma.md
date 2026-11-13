# 1 · Preparar Figma

Cuanto mejor esté tu Figma, menos `null` y menos preguntas habrá después. No hace falta que esté perfecto: la auditoría te dirá qué falta.

## Checklist

**Variables**
- [ ] Hay **variables** para color, espaciado, radios y tamaños (no solo estilos).
- [ ] Están en colecciones separadas por capa: una de **primitivas** (`purple/500`) y otra **semántica** (`fill/brand`) con alias a las primitivas.
- [ ] Los modos (light/dark, marcas) son **modos de la colección semántica**, no variables duplicadas.
- [ ] Las variables tienen **scopes** (dónde se pueden usar) y, mejor, una descripción.

**Componentes**
- [ ] Cada componente es un **component set** con propiedades (no frames sueltos).
- [ ] Las propiedades tienen nombres claros: `Size`, `Variant`, `State`, `Disabled`.
- [ ] Los textos editables son propiedades **TEXT**; los iconos intercambiables, **INSTANCE_SWAP**; lo que se muestra u oculta, **BOOLEAN**; los huecos de contenido, **SLOT**.
- [ ] Las capas tienen **nombre** (`Label`, `Icon`, `Container`), no `Frame 27`.
- [ ] Usan **auto layout** con gap y padding enlazados a variables.
- [ ] Ningún color ni medida suelta: todo enlazado a una variable.

**Iconos**
- [ ] Los iconos vienen de una sola librería o de un único component set propio.

## Cómo conectar Figma con la IA

| Opción | Lee | Cómo |
|---|---|---|
| **figma-console** (recomendado) | Todo: todas las variables con modos, componentes, estilos | MCP figma-console + su plugin abierto en Figma Desktop |
| **MCP oficial de Figma** | Componentes y las variables **usadas** en cada nodo | Dev Mode MCP en Figma Desktop |
| **Exportar JSON** | Lo que exportes | Un plugin de exportación de variables → `tokens/_import/` |

`ds-setup` comprueba cuál tienes.
