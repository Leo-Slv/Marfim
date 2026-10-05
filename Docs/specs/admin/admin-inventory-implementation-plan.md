# Admin · Estoque — implementation plan

Spec: `Docs/specs/admin/admin-inventory.md`.

## Feature `src/features/admin-inventory/`

- `schemas/admin-inventory.schema.ts` — stock rows (admin product list
  with `stock`), `StockItemResponse`, movements and reservations pages.
- `api/admin-inventory.ts` — product stock list (`Stock`, `Page`,
  `PageSize`), stock item, receive, adjust, set reorder level, movements,
  reservations, order number of a reservation (`GET /api/admin/orders/{id}`).
- `lib/stock.ts` (+spec) — filters ↔ `?nivel=`, row level (bar width, tick
  position, state, colours), tiles from the list, form validation per
  action, movement labels/sign/tone, error copy.
- `hooks/admin-inventory.queries.ts` — list, summary (one 100-row call),
  stock item, movements (infinite), active reservations + their order
  numbers, the three actions (refresh list, item, movements, menu counters,
  dashboard low stock, product editor).
- `components/` — `inventory-page.tsx` (URL state, list | panel),
  `stock-table.tsx`, `stock-panel.tsx` (numbers, action tabs + form,
  reservations, movements).

## Wiring

- `src/app/admin/(panel)/inventory/page.tsx`; `appRoutes.admin.inventory`;
  AdminNav `inventory` gets its `href`; the dashboard's "Registrar
  recebimento" links here (`?nivel=abaixo`).
- `queryKeys.admin.inventory…`.
