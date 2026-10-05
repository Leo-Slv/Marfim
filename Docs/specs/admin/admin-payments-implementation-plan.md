# Admin · Pagamentos — implementation plan

Spec: `Docs/specs/admin/admin-payments.md`.

## Feature `src/features/admin-payments/`

- `schemas/admin-payments.schema.ts` — `PaymentSummaryResponse` (+ page),
  `PaymentResponse` (+ refunds), `PaymentReconciliationResponse`,
  `RefundResponse`.
- `api/admin-payments.ts` — list (`Status`, `Page`, `PageSize`), count per
  status, detail, refund, reconcile, order number of a payment.
- `lib/payments.ts` (+spec) — tabs ↔ `?status=`, status label/pill
  (incl. "Estorno parcial"), decline explanations, events from the
  payment's timestamps and refunds, refund validation (0,01 … balance),
  reconcile message, error copy.
- `hooks/admin-payments.queries.ts` — list + order numbers, counts, detail,
  refund and reconcile mutations (refresh payments, orders, dashboard).
- `components/` — `payments-page.tsx` (URL state, list | panel),
  `payments-table.tsx`, `payment-panel.tsx`.

## Wiring

- `src/app/admin/(panel)/payments/page.tsx`; `appRoutes.admin.payments`;
  AdminNav `payments` gets its `href`.
- `queryKeys.admin.payments…`.
- Money input parsing reuses admin-products' `parseMoney`.
