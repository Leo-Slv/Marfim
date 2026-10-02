# Storefront home (`/`)

Mockup: `Docs/design/mockups/Main.dc.html` (with the shared
`Header.dc.html`, `Footer.dc.html` and the product drawings in
`Art.dc.html`).

## Why

The home is the storefront's entry point: it tells a first-time visitor what
Marfim sells (handmade objects from four ateliers), shows a curated set of
real, buyable products, and lets them start a cart without leaving the page.
It replaces the scaffold's placeholder product grid.

## What

### Store header (shared by every storefront page)

- Top strip with the store's three promises (static copy).
- Logo linking home; category nav ("Novidades" + one entry per catalog
  category, live from the API); "Buscar produtos" entry; "Entrar" account
  entry; "Sacola" button with the number of items in the cart.
- Category nav, "Novidades" and search lead to the product listing
  (`Docs/specs/storefront/listing.md`; until it existed they filtered the
  home grid). Account and the bag point at their future routes.

### Hero

- Editorial headline, copy and two calls to action that scroll to the
  products grid.
- Trust row: "Troca em 30 dias", plus "Frete grátis acima de R$ 299" and
  "6× sem juros" flagged **EM BREVE**.
- Featured product card: always **Luminária Arco** (fixed by slug). Name,
  short description, price and stock state are live from the API; the
  drawing, "Mais vendido" tag and tint are editorial. "Adicionar" puts it in
  the cart; it's disabled when the product is out of stock.

### "Escolhidos da semana" products grid

- Live products from the public catalog, with category chips ("Tudo" + each
  catalog category) that filter the grid. The selected category lives in the
  URL so it can be linked/shared and so the header nav can drive it.
- Each card: drawing on a tinted background (both chosen by product slug,
  per the mockup — product photos are deliberately not stored in the
  backend), optional editorial tag ("Mais vendido", "Novo"), category name,
  product name, price, and — when the product is on sale (compare-at above
  current price) — the old price and the discount percentage.
- Out-of-stock products show an "Esgotado" tag and cannot be added.
- "Add" button: adds one unit to the cart and briefly turns into a check.
- Heart button: toggles a favorite for the visit only (not persisted).
- Free-shipping progress (flagged **EM BREVE**, muted): how much the cart
  still needs to reach R$ 299.
- Loading, error and empty states for the grid.

### Promotion banner

- "Semana do design · Até 20% off em iluminação" with a live countdown to
  the end of the current Sunday (23:59:59, local time), and a CTA to the
  grid. Editorial copy.

### Ateliers

- Index of the four ateliers (number, name, craft, city); picking one swaps
  the featured atelier card (drawing, technique, raw material, and the list
  of that atelier's products) and the shipping-label illustration.
- Atelier products come from the API (products whose brand is the atelier's
  name); everything else about an atelier is editorial.

### Shipping section

- Three editorial facts (3 dias / 0 g / 30 dias) and the swinging shipping
  label for the selected atelier.

### Footer

- Newsletter (disabled, **EM BREVE**), Loja / Ajuda / Marfim link columns,
  service hours, payment methods, legal line. `[BRACKETS]` placeholders stay
  until the store's real data exists.

### Cart (minimal, client-side)

The OrderCore storefront design keeps the cart on the client (the API only
re-prices it via `POST /api/orders/cart/quote`). This screen introduces the
cart's minimal client-side store: lines of product + quantity (with the name
and price seen when added, for display only), persisted in the browser so the
header count survives reloads. The Sacola screen will build on it.

### Motion

The mockup's animations are part of the design: staggered fade-ups, the
floating hero drawing and line-draw strokes, slowly rotating orbits, the
pulsing stock dot, the heart/check "pop", card lift on hover, and the
swinging shipping label. All of them are disabled under
`prefers-reduced-motion`.

## Decisions (resolved with the user, 2026-10-02)

1. "Adicionar" writes to a persisted client-side cart (localStorage); the
   header count reads from it.
2. Favorites are per-visit component state only.
3. Drawing, tint and editorial tag are mapped by product slug in the
   frontend; unknown products get a default drawing/tint and no tag. The hero
   is fixed on `luminaria-arco`.
4. Links to screens that don't exist yet point at their future routes
   (`/products`, `/products/[slug]`, `/cart`, `/login`, content pages) via
   `app-routes.ts`; header categories filter the home grid meanwhile.

## Out of scope

Product listing, product page, Sacola, checkout, login, wishlist,
newsletter, real free-shipping and installment rules.

Backend gaps: `Docs/backend-pendencies/storefront/home.md`.
