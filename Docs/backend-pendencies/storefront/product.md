# Backend pendencies — Produto

Spec: `Docs/specs/storefront/product.md`. Mockup:
`Docs/design/mockups/Produto.dc.html`.

## 1. No dimensions or care instructions

- **Mockup expects**: Diâmetro, Cabo, Materiais, Lâmpada; "Cuidados com a
  peça".
- **Backend today**: `ProductResponse` has `shortDescription` and
  `description` (free text) only.
- **To close**: structured specs (key/value) and a care text per product.
- **Workaround**: materials = short description; dimensions EM BREVE; care
  text per category in `src/features/product/lib/product-content.ts`.
- **Severity**: Feature gap.

## 2. No exact stock on the public product

- **Mockup expects**: "Últimas 2 unidades", "Só temos 2 unidades".
- **Backend today**: `availability` (InStock / LowStock / OutOfStock).
- **To close**: the available quantity when low (or a max per order).
- **Workaround**: "Últimas unidades"; quantity capped at the bag's 9; the
  cart quote catches a shortage before checkout.
- **Severity**: Cosmetic.

## 3. No lead time / shipping estimate

- **Mockup expects**: "despacho em até 3 dias úteis" and CEP shipping.
- **Backend today**: no shipping or lead-time data (cart pendency).
- **Workaround**: not promised; CEP calculator EM BREVE.
- **Severity**: Feature gap.

## 4. Variants don't reach the order

- **Mockup expects**: choosing Acabamento / Vidro.
- **Backend today**: products can have variants (`ProductVariantResponse`,
  none seeded), but `CartQuoteRequest` / `CheckoutRequest` items carry only
  `productId`.
- **To close**: `variantId` on cart and order items.
- **Workaround**: variants shown with "EM BREVE · A variante escolhida
  ainda não segue para o pedido".
- **Severity**: Feature gap.

## 5. No atelier data

- **Mockup expects**: "OFICINA FAÍSCA · SÃO PAULO, SP".
- **Backend today**: `brand` only (home pendency #5).
- **Workaround**: city from the editorial `ateliers.ts`.
- **Severity**: Cosmetic.
