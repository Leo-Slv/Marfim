# Storefront home — implementation plan

Spec: `Docs/specs/storefront/home.md`.

## API (OrderCore, all `[AllowAnonymous]`)

Every controller route is prefixed with `api/` (`ApiRoutePrefixConvention`).

- `GET /api/catalog/products?categoryId&sort&page&pageSize` →
  `PagedResponse<ProductSummaryResponse>` (grid; atelier products).
- `GET /api/catalog/products/by-slug/{slug}` → `ProductResponse` (hero).
- `GET /api/catalog/categories` → `CategoryResponse[]` (chips, header nav,
  card category label).

Local backend: `docker compose up -d` in the OrderCore repo serves the API at
`http://localhost:8080` with seeded products; `NEXT_PUBLIC_API_URL` defaults
to it.

## Files

### `src/lib`

- `env.ts` / `.env.example`: default API URL → `http://localhost:8080`.
- `routes/app-routes.ts`: home + `homeCategory(slug)` (grid filter via
  `?categoria=`), and the future storefront routes (`/products`,
  `/products/[slug]`, `/cart`, `/login`, `/account/orders`,
  `/content/[slug]`).
- `constants/query-keys.ts`: `catalog.products(params)`,
  `catalog.product(slug)`, `catalog.categories`.

### `src/features/catalog`

- `schemas/` + `model/`: product summary/page (existing), product detail,
  category.
- `api/`: `get-products.ts` (fix: `/api` prefix; `categoryId`/`sort`
  params), `get-product-by-slug.ts`, `get-categories.ts`.
- `hooks/catalog.queries.ts`: `useProducts`, `useProductBySlug`,
  `useCategories`. The grid uses `placeholderData: keepPreviousData` so
  switching chips doesn't flash the loading state.
- `lib/`:
  - `format-currency-brl.ts` — matches the mockup's `money()`: no cents for
    whole amounts (`R$ 1.290`), two decimals otherwise (`R$ 189,90`).
  - `discount-percent.ts` — `-13%` label from current vs compare-at.
  - `is-on-sale.ts` (existing).
  - `product-visuals.ts` — slug → `{ kind, tint, tag? }`, default for
    unknown slugs (backend pendency #1/#2).
- `components/`:
  - `product-art.tsx` — the 11 drawings from `Art.dc.html` as inline SVG
    (`kind`, `size`, `strokeWidth`, optional hero light-ray detail,
    `className` for the line-draw animation).
  - `product-card.tsx` — rewritten to the mockup card: tinted art panel,
    tag/"Esgotado", heart, category, name, price/old price/discount, add
    button ↔ check.
- `components/product-list.tsx` — removed (scaffold placeholder).

### `src/features/cart` (new)

- `model/cart.ts` — `CartLine { productId, slug, name, unitPrice,
  quantity }`.
- `lib/cart-lines.ts` — pure `addCartLine`, `countCartItems`,
  `cartSubtotal` (tested).
- `lib/cart-store.ts` — tiny external store over `localStorage`
  (`marfim.cart`), cached snapshot, `storage`-event sync across tabs, empty
  server snapshot.
- `hooks/use-cart.ts` — `useSyncExternalStore` → `{ lines, count,
  subtotal, addItem }`.

This is the first cross-tree client state (header count ↔ product cards);
it uses React's `useSyncExternalStore` instead of adding a state library.

### `src/features/home` (new)

- `lib/ateliers.ts` — editorial atelier data keyed by brand name (backend
  pendency #5).
- `lib/atelier-products.ts` — products of an atelier (by brand) and the
  "3 peças: …" line (tested).
- `lib/countdown.ts` — time left until the end of the current Sunday,
  zero-padded parts (tested).
- `lib/free-shipping.ts` — progress % and label for the R$ 299 goal
  (tested).
- `components/`: `home-page.tsx` (composition + selected atelier state),
  `home-hero.tsx`, `featured-products-section.tsx` (chips via
  `useSearchParams`, wrapped in `Suspense` per Next 16's prerender rule),
  `free-shipping-meter.tsx`, `promo-banner.tsx` (countdown renders `--`
  until mounted to avoid a hydration mismatch), `atelier-art.tsx`,
  `ateliers-section.tsx`, `shipping-section.tsx`.

### `src/components` (shared storefront chrome)

- `store-header.tsx` — top strip, logo, category nav (live categories;
  active item from `?categoria=`, inside its own `Suspense`), search, account,
  bag with animated count from `useCart`.
- `store-footer.tsx` — static footer from `Footer.dc.html`.

### Styling and motion

- `globals.css`: add the remaining mockup colors as tokens (ink-soft,
  primary-strong/soft, success-soft, clay/clay-soft) and the mockup's
  keyframes as Tailwind `--animate-*` theme values (`up`, `floaty`,
  `spin-slow`, `pulse-dot`, `pop`, `swing`) plus the `.line-draw` stroke
  animation. A global `prefers-reduced-motion` rule disables them.
- Card hover lift / art zoom via `group` + transitions.

## Tests

`node:test` specs for `format-currency-brl`, `discount-percent`,
`product-visuals`, `cart-lines`, `atelier-products`, `countdown`,
`free-shipping`. Then `npm run test`, `npm run typecheck`, `npm run lint`,
`npm run build`, and a browser check against the running API.
