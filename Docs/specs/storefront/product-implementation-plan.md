# Produto — implementation plan

Spec: `Docs/specs/storefront/product.md`.

## Feature `src/features/product/`

- `lib/product-content.ts` (+spec) — gallery views for a drawing kind
  (Acesa only for lighting), stock line per availability, care text per
  category slug, atelier line from `ateliers.ts`, quantity clamp (1–9),
  recommendations (same category, not this one, available first, 3).
- `components/product-page.tsx` — loads by slug (catalog's
  `useProductBySlug`), 404 → not-found state, other errors →
  `QueryErrorState`; breadcrumb, gallery, info, buy box, accordions,
  recommendations, mini-sacola (cart's `AddedToCartDrawer`, now with a
  quantity).
- `components/product-gallery.tsx`, `product-buy-box.tsx`,
  `product-recommendations.tsx`, `product-not-found.tsx`.

## Elsewhere

- catalog: `productDetailSchema` types images/variants
  (`ProductVariantResponse`); `ProductArt` gets a `lit` look (light strokes
  for the dark "Acesa" view).
- cart: `AddedToCartDrawer` shows the quantity added.
- `src/app/products/[slug]/page.tsx` (client, `useParams`).
- `globals.css`: `--animate-glow` for the lit view.
