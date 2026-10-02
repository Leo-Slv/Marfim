# Storefront cart — implementation plan

Spec: `Docs/specs/storefront/cart.md`.

## API

- `POST /api/orders/cart/quote` (anonymous, read-only) — body
  `{ items: [{ productId, quantity, expectedUnitPrice }] }` (each product
  once); response `{ currency, total, isValid, lines: [{ productId,
  productName, slug, imageUrl, unitPrice, quantity, lineTotal, issue,
  previousUnitPrice }] }`, `issue` ∈ `NotFound | Unavailable |
  InsufficientStock | PriceChanged | null`. `expectedUnitPrice` is the price
  stored in the client line, so a stale price comes back as `PriceChanged`.
- `GET /api/catalog/products?pageSize=100` + `GET /api/catalog/categories`
  — brand, category, compare-at price and stock state for the lines, and the
  pool for recommendations.

## Files

### `src/features/cart`

- `schemas/cart-quote.schema.ts`, `model/cart-quote.ts`,
  `api/quote-cart.ts`.
- `hooks/use-debounced-value.ts`; `hooks/cart.queries.ts` —
  `useCartQuote(lines)`: debounces the lines (300 ms), query key built from
  `productId:quantity:unitPrice`, `keepPreviousData`, disabled for an empty
  bag.
- `lib/cart-lines.ts` — add `MAX_LINE_QUANTITY` (9), `setCartLineQuantity`
  (≤ 0 removes), `removeCartLine`, `repriceCartLine`; `addCartLine` caps at
  9.
- `lib/cart-store.ts` — `setCartQuantity`, `removeFromCart`,
  `repriceCartItem`; `useCart` exposes them.
- `lib/free-shipping.ts` — moved here from `home/lib` (it's about the cart
  subtotal); the home meter imports it.
- `lib/cart-view.ts` — pure join of client lines + quote + catalog +
  categories → view lines (price, totals, old total, issue, stock note) and
  summary (list subtotal, savings, total, piece count, `canCheckout` and
  the reason when not); `pickRecommendations`.
- `lib/line-issue-copy.ts` — notice copy per issue.
- `components/`: `cart-page.tsx`, `cart-line-item.tsx`,
  `cart-ghost-line.tsx`, `cart-summary.tsx`, `cart-empty-state.tsx`,
  `cart-recommendations.tsx`, `cart-extras.tsx` (free-shipping progress +
  gift wrap, EM BREVE).

### Shared

- `src/components/checkout-steps.tsx` — the 01/02/03 stepper, reused by the
  delivery and payment steps later.
- `src/components/store-header.tsx` — Sacola highlighted (`aria-current`)
  on `/cart`.
- `format-currency-brl.ts` — `formatCurrencyBrlCents` (always 2 decimals,
  the summary's style).
- `app-routes.ts` — `checkout.delivery`; `src/app/cart/page.tsx`.
- `globals.css` — `shine` animation for the main button.

## Tests

`cart-lines` (quantity/remove/reprice/cap), `cart-view` (join, totals,
savings, issues, `canCheckout`, recommendations), `line-issue-copy`,
`formatCurrencyBrlCents`; then test/typecheck/lint/build and a browser pass
including forced issues (stale price, excessive quantity, unknown product in
localStorage).
