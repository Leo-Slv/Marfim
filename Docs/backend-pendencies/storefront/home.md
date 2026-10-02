# Backend pendencies — Storefront home (`/`)

Spec: `Docs/specs/storefront/home.md`. Mockup:
`Docs/design/mockups/Main.dc.html`.

## 1. Product imagery (drawing + tint)

- **Mockup expects**: every product card shows an illustration on a tinted
  background.
- **Backend today**: `ProductSummaryResponse.PrimaryImageUrl` /
  `ProductResponse.Images` exist (Catalog module), but the seed stores no
  images (`primaryImageUrl: null`) — by the product owner's choice, photos
  are not stored in the database.
- **To close**: nothing required while illustrations are the design; real
  photos would use the existing image endpoints.
- **Workaround**: `src/features/catalog/lib/product-visuals.ts` maps slug →
  drawing kind + tint (from `Art.dc.html`/`Main.dc.html`); unknown slugs get
  a default.
- **Severity**: Cosmetic.

## 2. Merchandising tags ("Mais vendido", "Novo")

- **Mockup expects**: an editorial tag on some cards and on the hero.
- **Backend today**: no tag/badge/featured field on `ProductSummaryResponse`
  or `ProductResponse`; `ProductSortOrder.Newest` exists but doesn't flag
  products individually.
- **To close**: a merchandising field (e.g. `Badges`) or a curated
  collections endpoint in Catalog.
- **Workaround**: tag in the same slug map as #1.
- **Severity**: Cosmetic.

## 3. Curated selection ("Escolhidos da semana") and hero product

- **Mockup expects**: a hand-picked grid in a specific order and a featured
  hero product.
- **Backend today**: `GET /api/catalog/products` only sorts by
  `Name`/`PriceAsc`/`PriceDesc`/`Newest` (`ProductSortOrder`); no
  featured/collection concept.
- **To close**: featured flag or collections in Catalog.
- **Workaround**: grid uses the default `Name` order; hero fixed on slug
  `luminaria-arco` (fetched via `GET /api/catalog/products/by-slug/{slug}`).
- **Severity**: Cosmetic.

## 4. Wishlist (heart button)

- **Mockup expects**: favoriting products.
- **Backend today**: no wishlist/favorites in Customers or Catalog.
- **To close**: `customers/me/wishlist` endpoints.
- **Workaround**: per-visit component state, not persisted.
- **Severity**: Feature gap.

## 5. Atelier details

- **Mockup expects**: per atelier — number, city, craft, technique, raw
  material, shipping-label code.
- **Backend today**: `Brand` is a plain string on the product
  (`ProductSummaryResponse.Brand`); there is no brand/atelier entity.
- **To close**: a Brand (atelier) entity with those fields in Catalog.
- **Workaround**: editorial data in `src/features/home/lib/ateliers.ts`,
  keyed by brand name; each atelier's product list is live (products whose
  `brand` equals the atelier name).
- **Severity**: Feature gap.

## 6. Free shipping threshold and installments

- **Mockup expects**: "Frete grátis acima de R$ 299" progress and "6× sem
  juros" (both flagged EM BREVE in the mockup).
- **Backend today**: `CartQuoteResponse` has `Total`, `IsValid`, `Lines` —
  no shipping cost or rule; no installment plans in Payments.
- **To close**: shipping rules in Orders; installments in Payments.
- **Workaround**: rendered as EM BREVE; the progress bar is computed from
  the client-side cart total with a hard-coded R$ 299 goal.
- **Severity**: Feature gap.

## 7. Promotion campaign and countdown

- **Mockup expects**: "Até 20% off em iluminação" with a deadline.
- **Backend today**: per-product `CompareAtPrice` only; no campaign entity
  or end date.
- **To close**: promotions/campaigns in Catalog.
- **Workaround**: editorial copy; countdown to the end of the current Sunday
  (client time).
- **Severity**: Cosmetic.

## 8. Newsletter

- **Mockup expects**: e-mail sign-up (flagged EM BREVE).
- **Backend today**: no subscription endpoint (Notifications only sends
  transactional e-mail).
- **Workaround**: disabled form, as in the mockup.
- **Severity**: Feature gap.

## 9. Store contact/legal data

- **Mockup expects**: WhatsApp, e-mail, CNPJ in the footer.
- **Backend today**: not exposed anywhere.
- **Workaround**: `[SEU WHATSAPP]`, `[SEU E-MAIL]`, `[SEU CNPJ]`
  placeholders kept.
- **Severity**: Config.
