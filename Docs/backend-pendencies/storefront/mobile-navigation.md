# Backend pendencies — Mobile navigation and search

Spec: `Docs/specs/storefront/mobile-navigation.md`. Mockups:
`Docs/design/mockups/MobileTopo.dc.html`, `MobileBusca.dc.html`.

## 1. Search matches the name only, accent-sensitively

- **Mockup expects**: "peça, ateliê ou categoria", accents ignored.
- **Backend today**: `EfProductRepository.ListAsync` filters with
  `EF.Functions.ILike(p.Name, "%term%")` (listing pendency #1).
- **To close**: match `Brand`, the category name and the short
  description, unaccented (`unaccent` or a normalized search column).
- **Workaround**: the front loads the catalog (one page of
  `ListProductsFilter.MaximumPageSize` = 100) and matches name, brand,
  category and short description without accents; desktop sorts with the
  API's order and paginates locally.
- **Severity**: Feature gap past 100 published products (the search would
  miss what isn't in the first page).

## 2. No search statistics

- **Mockup expects**: "MAIS PROCURADOS" terms.
- **Backend today**: searches aren't recorded anywhere.
- **To close**: count search terms (or expose a curated list).
- **Workaround**: "EXPLORE" chips with the catalog's categories and
  ateliers.
- **Severity**: Cosmetic.

## 3. Recent searches are per device

- **Mockup expects**: BUSCAS RECENTES.
- **Backend today**: no search history on the customer.
- **Workaround**: last 5 terms in this browser's localStorage.
- **Severity**: Cosmetic.
