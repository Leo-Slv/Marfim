# Mobile navigation — implementation plan

Spec: `Docs/specs/storefront/mobile-navigation.md`.

## Shared

- `src/lib/text/normalize-search.ts` — lowercase + strip accents (moved
  from `content/lib/filter-faqs.ts`, now also used by the catalog search).
- `catalog/lib/search-products.ts` (+spec) — `matchesSearch` over name,
  brand, category name and short description; `searchProducts` keeps the
  given order.
- `catalog/hooks`: `useCatalog()` — the whole catalog in one page (100),
  shared by search and the content pages.

## Header (`src/components/`)

- `store-header.tsx` — desktop header as today, hidden below 980 px; new
  prop `mobileBack?: { href; title? }`.
- `mobile-top-bar.tsx` — promise strip, menu or Voltar, logo or title,
  Buscar, Sacola with badge.
- `mobile-menu.tsx` — Radix Dialog sliding from the left
  (`--animate-slide-in-left` in `globals.css`): account CTA, LOJA
  (categories from `useCategories`), AJUDA; links close it.

Screens passing `mobileBack`: `product-page` (category from
`useCategories`), `cart-page`, `delivery-page`, `payment-page`,
`content-page`, `auth-layout`.

## Search

- `listing/lib/recent-searches.ts` (+spec) — pure `addRecentSearch`
  (dedupe case/accents, newest first, 5 max) + a localStorage external
  store (`useRecentSearches`), same pattern as the cart.
- `listing/components/mobile-search.tsx` — the MobileBusca screen: field
  bound to `?q=` (replace), idle / short / none / results states, explore
  chips (categories + ateliers from the catalog).
- `listing/components/listing-content.tsx` — search mode reads
  `useCatalog({ sort })` and filters/paginates locally
  (`lib/pagination.ts` `paginate`).
- `/search` renders `MobileSearch` below 980 px and the listing above.
