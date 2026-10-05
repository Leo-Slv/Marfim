# Admin · Clientes — implementation plan

Spec: `Docs/specs/admin/admin-customers.md`.

## Feature `src/features/admin-customers/`

- `schemas/admin-customers.schema.ts` — `CustomerResponse` (+ page), the
  customer's order summaries page; addresses reuse checkout's
  `customerAddressSchema`.
- `api/admin-customers.ts` — list (`SearchTerm`, `Page`, `PageSize`),
  detail, addresses, orders, deactivate, reactivate.
- `lib/customers.ts` (+spec) — initials, "Cliente desde" ("jul 2026"),
  order stats (count, total spent from paid statuses), address line and
  default tags.
- `hooks/admin-customers.queries.ts` — list, stats for the listed rows (one
  query), detail, addresses, orders, status mutation (refreshes list and
  detail).
- `components/` — `customers-page.tsx` (URL state, list | panel),
  `customers-table.tsx`, `customer-panel.tsx`.

## Wiring

- `src/app/admin/(panel)/customers/page.tsx`; `appRoutes.admin.customers`
  and `ordersOfCustomer(id)`; AdminNav `customers` gets its `href`.
- `queryKeys.admin.customers…`.
- Initials reuse admin-shell's helper rules (letters only).
