# Backend pendencies — Admin · Pagamentos

Spec: `Docs/specs/admin/admin-payments.md`. Mockup:
`Docs/design/mockups/AdminPagamentos.dc.html`.

## 1. Payment list without order number or Stripe reference

- **Mockup expects**: "pi_3Q8a…231" and "MF-000231" on each row.
- **Backend today**: `PaymentSummaryResponse` = id, orderId, amount,
  refundedAmount, currency, method, status, createdAt.
- **To close**: `orderNumber` and `providerReference` on the summary.
- **Workaround**: order number fetched per listed payment
  (`GET /api/admin/orders/{id}`); the Stripe reference only in the panel
  (`PaymentResponse.providerReference`).
- **Severity**: Cosmetic (performance).

## 2. No card brand / last four

- **Mockup expects**: "Cartão final 4242".
- **Backend today**: none on `PaymentResponse` (payment pendency #2).
- **Workaround**: "Cartão".
- **Severity**: Cosmetic.

## 3. One status per filter; no "has refunds" filter

- **Mockup expects**: "Aprovados" (authorized + captured) and "Estornos"
  (any refund).
- **Backend today**: `Status` takes one `PaymentStatus`; a partly refunded
  payment stays `Captured`.
- **To close**: several statuses per filter and a `HasRefunds` filter.
- **Workaround**: one tab per status; partial refunds show as "Estorno
  parcial" on the row.
- **Severity**: Cosmetic.

## 4. Refund reason required

- **Mockup expects**: amount only.
- **Backend today**: `RequestRefundRequest.reason` required.
- **Workaround**: a reason list on the form.
- **Severity**: Cosmetic.

## 5. Tab counts one call each

- **Workaround**: `PageSize=1` per status (`totalItems`).
- **Severity**: Cosmetic (performance).
