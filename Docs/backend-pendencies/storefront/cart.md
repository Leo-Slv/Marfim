# Backend pendencies — Storefront cart (Sacola)

Spec: `Docs/specs/storefront/cart.md`. Mockup:
`Docs/design/mockups/Carrinho.dc.html`.

## 1. Available quantity on insufficient stock

- **Mockup expects**: "Só temos 1 unidade disponível agora." + "Ajustar
  para 1".
- **Backend today**: `QuoteCartUseCase` reports
  `CartLineIssue.InsufficientStock` but `CartQuoteLineResponse` has no
  available quantity; the stock-items endpoints are admin-only.
- **To close**: add `AvailableQuantity` to `CartQuoteLineResponse` for
  `InsufficientStock` lines.
- **Workaround**: generic notice + "Diminuir quantidade" (−1 and re-quote).
- **Severity**: Feature gap.

## 2. Quote lines lack brand, category and compare-at price

- **Mockup expects**: category, "por {atelier}", the old price and the
  "Promoções" savings line.
- **Backend today**: `CartQuoteLineResponse` has name, slug, image, unit
  price, quantity, line total, issue and previous price only.
- **To close**: include `Brand`, `CategoryId` and `CompareAtPrice` in the
  quote line.
- **Workaround**: joined client-side with `GET /api/catalog/products`
  (one page of 100 — OrderCore's maximum page size).
- **Severity**: Cosmetic (Feature gap past 100 published products).

## 3. Shipping quote by CEP and free-shipping rule

- **Mockup expects**: CEP → Econômica/Expressa options with prices and
  ETAs; free shipping above R$ 299.
- **Backend today**: no shipping module or rule; `CartQuoteResponse.Total`
  is goods only.
- **Workaround**: CEP field and progress bar disabled with EM BREVE; "Frete:
  Informe o CEP"; total note "frete a calcular".
- **Severity**: Feature gap.

## 4. Coupons, gift wrap, Pix discount and installments

- **Mockup expects**: coupon OUTONO10 (10%), gift wrap (+R$ 25 with card
  message), Pix 5% off, card in 6× sem juros.
- **Backend today**: none of these exist in Orders/Payments
  (`Payments/methods` lists the provider's methods only).
- **Workaround**: shown disabled with EM BREVE; total is the backend's goods
  total.
- **Severity**: Feature gap.

## 5. Recommendations

- **Mockup expects**: "Combina com a sua sacola — das mesmas categorias".
- **Backend today**: no recommendations endpoint.
- **Workaround**: chosen client-side from the catalog page (same categories
  first, in stock, not in the bag).
- **Severity**: Cosmetic.

## 6. Dispatch lead time per product

- **Mockup expects**: "despacho em até 3 dias" per line.
- **Backend today**: no lead-time field.
- **Workaround**: fixed editorial copy, as in the mockup.
- **Severity**: Cosmetic.
