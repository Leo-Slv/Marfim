# Admin · Produtos — implementation plan

Spec: `Docs/specs/admin/admin-products.md`.

## Feature `src/features/admin-products/`

- `schemas/admin-products.schema.ts` — `ProductResponse` (images,
  variants, status), the admin list page (reuses admin-dashboard's
  `adminProductPageSchema`, extended with price/status/category), the
  editor and new-product form schemas (pt-BR prices "1.290,00" parsed,
  price > 0, "de" > price).
- `api/admin-products.ts` — list (`SearchTerm`, `Page`, `PageSize`), get,
  create, update details, change price, set compare-at price, publish,
  discontinue, add / remove variant.
- `lib/product-form.ts` (+spec) — status labels/tones, money parsing and
  formatting for inputs, discount preview, next variant SKU, the save plan
  (which calls, in a safe order) from the original product and the form.
- `hooks/admin-products.queries.ts` — list, detail, create, save (runs the
  plan, reports the failed step), publish, discontinue, remove variant;
  all refresh the list, the detail, the menu counters and the dashboard's
  low-stock block.
- `components/` — `products-page.tsx` (URL state, list | editor),
  `products-list.tsx`, `product-editor.tsx` (RHF form, dirty flag, price
  preview, variants, actions), `new-product-form.tsx`,
  `product-art-preview.tsx` (three views of the drawing, EM BREVE upload).

## Wiring

- `src/app/admin/(panel)/products/page.tsx`; `appRoutes.admin.products`;
  AdminNav `products` gets its `href`.
- `queryKeys.admin.products(q, page)`, `product(id)`, root for refresh.
- `catalog/lib/product-visuals.ts`: `hasProductVisual(slug)`.
- Toasts: account's `notify`.
