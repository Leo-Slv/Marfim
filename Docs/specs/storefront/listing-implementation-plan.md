# Storefront listing — implementation plan

Spec: `Docs/specs/storefront/listing.md`.

## API

`GET /api/catalog/products?categoryId&searchTerm&onSale&sort&page&pageSize`
(public) and `GET /api/catalog/categories`. Page size 8.

## Routes and URL state

- `/products` — category mode; `?categoria=<slug|novidades>`.
- `/search` — search mode; `?q=<term>`.
- `/promotions` — promotions mode.
- All: `?ordem=recentes|nome|menor-preco|maior-preco` (default recentes →
  `Newest`) and `?pagina=N`.

Each `src/app/<route>/page.tsx` renders `ListingPage` with its `mode`. The
URL-reading part sits inside `Suspense` (Next 16 `useSearchParams` prerender
rule); header/footer stay outside it.

## Files

### `src/features/listing` (new)

- `lib/listing-sort.ts` — sort param ↔ label ↔ API `ProductSortOrder`.
- `lib/pagination.ts` — `parsePage`, `pageNumbers`, `formatRange`
  ("1–8 DE 14").
- `lib/listing-copy.ts` — category blurbs by slug (+ Tudo/Novidades),
  `formatPieceCount`, `formatResultCount`, empty-state copy per mode,
  `MIN_SEARCH_LENGTH` / `isSearchable`.
- `lib/listing-url.ts` — builds the listing href with updated params
  (resetting `pagina` when a filter/sort changes).
- `components/listing-page.tsx` — chrome + `Suspense`.
- `components/listing-content.tsx` — reads params, resolves category,
  queries products, renders header/filters/grid/pagination/states, owns the
  mini-sacola state.
- `components/category-heading.tsx`, `search-heading.tsx` (debounced input →
  `router.replace`), `promotions-heading.tsx`, `listing-toolbar.tsx`
  (chips or count + sort select), `listing-grid.tsx` (+ skeleton),
  `listing-pagination.tsx`, `listing-empty-state.tsx`.

### `src/features/catalog`

- `components/listing-product-card.tsx` — the Listagem card variant
  (brand, linked name/art, status + discount badges, add / Esgotado).
- `lib/product-badge.ts` — status badge for a product (Esgotado / Últimas
  unidades / editorial tag) — tested.
- `api/get-products.ts` — add `searchTerm` and `onSale`; query key gains
  them.

### `src/features/cart`

- `components/added-to-cart-drawer.tsx` — Radix Dialog side panel (focus
  trap, Esc, overlay) with the added line and cart count/total.
- `lib/cart-lines.ts` — `formatItemCount` ("1 item" / "3 itens").

### Shared

- `app-routes.ts` — `products.category(slug)`, `products.newest`,
  `search(term?)`, `promotions`.
- `store-header.tsx` — category nav → listing, active from the listing's
  `categoria`; search → `/search`.
- `store-footer.tsx`, home `promo-banner.tsx` ("Aproveitar" → promotions),
  `ateliers-section.tsx` ("Ver peças" → `/products`).
- `globals.css` — `shimmer`, `slide-in`, `fade-in` keyframes.

## Tests

Specs for `listing-sort`, `pagination`, `listing-copy`, `listing-url`,
`product-badge`, `formatItemCount`; then test/typecheck/lint/build and a
browser pass over the three modes against the running API.
