# Backend pendencies — Storefront listing

Spec: `Docs/specs/storefront/listing.md`. Mockup:
`Docs/design/mockups/Listagem.dc.html`.

Product imagery and editorial tags follow the home's pendencies #1–#2
(`home.md`).

## 1. Search only matches the product name, accent-sensitively

- **Mockup expects**: searching "peça, ateliê ou categoria", ignoring
  accents (`lumin` and `luminaria` both find "Luminária Arco"; "Faísca" finds
  the atelier's pieces).
- **Backend today**: `EfProductRepository.ListAsync` filters with
  `EF.Functions.ILike(p.Name, "%term%")` — name only, case-insensitive but
  accent-sensitive (`?searchTerm=luminaria` returns nothing; a brand or
  category name returns nothing).
- **To close**: also match `Brand` and the category name, and compare
  unaccented (`unaccent` extension or a normalized search column).
- **Workaround**: the term is sent as typed; the placeholder still says
  "peça, ateliê ou categoria" per the mockup, but only names match.
- **Severity**: Feature gap.

## 2. No "new" flag for "Novidades"

- **Mockup expects**: Novidades lists only pieces flagged as new.
- **Backend today**: `ProductSortOrder.Newest` sorts by publish date; no
  per-product "new" flag or date window on `ProductSummaryResponse`.
- **To close**: a `PublishedAt` on the summary (frontend picks a window) or
  an `isNew`/badges field.
- **Workaround**: Novidades = all products sorted by Newest.
- **Severity**: Cosmetic.

## 3. No filter by atelier (brand)

- **Mockup expects**: an atelier's "Ver peças" lands on its pieces.
- **Backend today**: `ListProductsFilter` has `CategoryId`, `Active`,
  `SearchTerm`, `OnSale`, `Sort` — no `Brand`; search doesn't match brand
  (#1).
- **To close**: a `brand` filter (or a Brand entity, home pendency #5).
- **Workaround**: "Ver peças" opens the full listing.
- **Severity**: Feature gap.

## 4. "Mais recentes" is the only relevance order

- **Mockup expects**: a default editorial order labelled "Mais recentes".
- **Backend today**: sorts are `Name`, `PriceAsc`, `PriceDesc`, `Newest`.
- **Workaround**: the default "Mais recentes" maps to `Newest`.
- **Severity**: Cosmetic.
