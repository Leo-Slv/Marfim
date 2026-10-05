# Admin · Produtos (`/admin/products`)

Mockup: `Docs/design/mockups/AdminProdutos.dc.html` (list + editor, price
preview, variants, images, publish/discontinue, toasts).

## Why

The team keeps the catalog itself: creates pieces as drafts, fills name,
atelier and description, sets the price and promotions, publishes them to
the store and discontinues what won't be sold anymore.

## What

- **List** ("CATÁLOGO · Produtos"): search by name or SKU, each row with
  the product's drawing, name, price and status pill (Publicado, Rascunho,
  Descontinuado); the open product is highlighted; paged. **+ Novo** opens
  an empty product.
- **Editor** (beside the list on wide screens; on narrow screens it
  replaces the list, with "← Produtos"): title, status pill, "Alterações
  não salvas" while dirty.
  - **Dados**: Nome, Endereço na loja (`/products/{slug}`, read-only — the
    backend makes it from the name when the product is created), Categoria
    (chosen at creation only), Marca (ateliê), Descrição.
  - **Preço**: Preço and Preço "de" (optional; must be above the price —
    "O preço “de” precisa ser maior que o preço."), with the **Na loja**
    preview (price, struck "de" price, "−20%").
  - **Variantes**: name + SKU of each variant, × to remove (with
    confirmation); "+ Variante" adds a name, its SKU generated from the
    product's (e.g. `MF-ORBE-1`) — created on Salvar. "Sem variantes." when
    empty.
  - **Imagem na loja**: the drawing the store shows for this product (by
    slug: drawing, tint, tag) in three views — capa, detalhe, ambiente — as
    a preview. Sending and reordering images is EM BREVE (product photos
    aren't stored by design). A product without a drawing of its own shows
    the default one and says so.
  - **Salvar** (validates: name required, price above zero, "de" price
    above the price), **Publicar na loja** (drafts; saves first),
    **Descontinuar** (with confirmation). Toasts: "Produto salvo",
    "Publicado na loja", "Produto descontinuado".
- **New product**: Nome, **SKU** (required by OrderCore, unique),
  Categoria, Preço; created as Rascunho, then the editor opens it.
- Search, page and open product live in the URL (`?q=`, `?pagina=`,
  `?produto=`, `?novo=1`).

## Decisions

Asked and answered (2026-10-05):

- Images: a preview of the store's drawing; upload/reorder EM BREVE.
- Variants: add and remove only (no rename); SKU generated.

Derived:

- The mockup's slug field is read-only and the category is fixed after
  creation — OrderCore can't change them (see backend pendencies).
- A discontinued product can't go back to the store (OrderCore publishes
  drafts only): no "Publicar" for it.
- "Descrição" is OrderCore's `description`; its `shortDescription` is kept
  as is.
