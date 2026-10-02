# Storefront product listing (`/products`, `/search`, `/promotions`)

Mockup: `Docs/design/mockups/Listagem.dc.html` (screens 02–04 + 06
mini-sacola), with the shared `Header`, `Footer` and `Art`.

## Why

The home only shows a curated handful of products. Shoppers need to browse
the whole catalog by category, find a piece by name, and see what's on sale —
and the header's category nav, "Buscar produtos" and the home's promotion
banner need somewhere real to land.

## What

One listing screen with three modes, each with its own URL so it can be
linked and shared:

### Category mode (`/products?categoria=<slug>`)

- Breadcrumb (INÍCIO / CATEGORY), category title (animated on change),
  "N peças" count and a one-line editorial blurb per category.
- Chips: **Tudo**, **Novidades**, then one chip per category registered in
  the backend (today Casa, Cozinha, Iluminação, Têxteis — the same as the
  mockup). Unknown slugs fall back to Tudo.
- **Novidades** lists every product, newest first (OrderCore has no
  "is new" flag — see pendencies).

### Search mode (`/search?q=<term>`)

- Large search field (with clear button) that updates results as the
  shopper types; "N resultados para “term”".
- Searching starts at 2 characters; below that, a "Continue digitando" hint.

### Promotions mode (`/promotions`)

- Indigo "Semana do design · Peças com preço especial" banner with the count
  of discounted pieces; lists products whose compare-at price is above the
  current price.

### Shared by all modes

- Sort select: Mais recentes (default), Nome (A–Z), Menor preço, Maior
  preço. Changing the sort or filter goes back to page 1.
- Grid of 8 products per page; pagination (previous / numbered pages / next
  + "1–8 DE 14") when there's more than one page. Page, sort, category and
  term live in the URL.
- Card: drawing on tint (by slug, as on the home), status badge (Esgotado /
  Últimas unidades / editorial tag such as "Novo"), discount badge, brand
  (atelier), name, price and old price. Name and art link to the product
  page. "+" adds to the cart; sold-out products show a disabled
  "Esgotado" button and a faded drawing.
- Loading skeleton (shimmer), empty state per mode (with links to the
  categories) and an error state with retry.
- **Mini-sacola**: after adding, a side panel confirms "Adicionado à
  sacola" with the piece, quantity, the cart's item count and total, "Ir
  para a sacola" and "Continuar comprando". Closes on overlay click, Esc or
  the close button.

### Navigation changes elsewhere

- Header category nav and "Novidades" go to the listing (active item
  highlighted there); "Buscar produtos" goes to search.
- Footer "Loja" links go to the listing; the home's "Aproveitar" goes to
  promotions; an atelier's "Ver peças" goes to the full listing. The home's
  own category chips keep filtering the home grid.

## Decisions (resolved with the user, 2026-10-02)

1. All three modes (category, search, promotions) ship now.
2. Header/footer category links and "Ver peças" lead to the listing.
3. "Novidades" = all products sorted by Newest; the "Novo" badge still comes
   from the slug map.
4. The mini-sacola panel ships with this screen, on top of the client cart.

## Out of scope

Product page, Sacola, filtering by atelier/brand, accent-insensitive or
brand/category search (backend), facets.

Backend gaps: `Docs/backend-pendencies/storefront/listing.md`.
