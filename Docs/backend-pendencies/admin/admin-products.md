# Backend pendencies — Admin · Produtos

Spec: `Docs/specs/admin/admin-products.md`. Mockup:
`Docs/design/mockups/AdminProdutos.dc.html`.

## 1. Slug can't be edited

- **Mockup expects**: an editable "Endereço na loja".
- **Backend today**: `CreateProductUseCase` generates the slug from the
  name; `UpdateProductRequest` has no slug.
- **To close**: a slug field on update (unique, with redirects for old
  links).
- **Workaround**: shown read-only.
- **Severity**: Feature gap.

## 2. Category fixed after creation

- **Mockup expects**: Categoria editable.
- **Backend today**: `UpdateProductRequest` = name, shortDescription,
  description, brand.
- **To close**: `categoryId` on update (or a move endpoint).
- **Workaround**: chosen at creation, read-only afterwards.
- **Severity**: Feature gap.

## 3. No way back from Discontinued

- **Mockup expects**: "Publicar na loja" on any non-published product.
- **Backend today**: `Product.Publish` only from `Draft`
  (`invalid_product_state`); `Discontinue` is final.
- **To close**: a reactivate transition.
- **Workaround**: no publish button for discontinued products.
- **Severity**: Feature gap.

## 4. Variants can't be renamed

- **Mockup expects**: editable variant names, SKU generated.
- **Backend today**: `POST /variants` (SKU required, unique per product)
  and `DELETE /variants/{id}` only.
- **To close**: `PUT /variants/{id}`.
- **Workaround**: existing variants read-only; new ones get a generated SKU
  (`{product SKU}-{n}`).
- **Severity**: Cosmetic.

## 5. Images

- **Mockup expects**: upload, reorder, first is the cover.
- **Backend today**: images by absolute URL (`AddProductImageRequest`), no
  upload/storage; the project decided not to store product photos (the
  store draws them — `product-visuals.ts`).
- **Workaround**: a preview of the drawing; upload EM BREVE. A new
  product's drawing needs an entry in `product-visuals.ts`.
- **Severity**: Feature gap (by design for now).

## 6. Saving is several calls

- **Mockup expects**: one Salvar.
- **Backend today**: details (`PUT /products/{id}`), price
  (`PUT /price`), "de" price (`PUT /compare-at-price`) and variants are
  separate endpoints; the "de" price must stay above the current price at
  every step.
- **To close**: one update covering price and promotion.
- **Workaround**: calls in a safe order (clear "de" price → price → "de"
  price → variants); a failure midway leaves what was saved and says which
  part failed.
- **Severity**: Cosmetic.
