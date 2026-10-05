# Admin · Pedidos — implementation plan

Spec: `Docs/specs/admin/admin-orders.md`.

## Feature `src/features/admin-orders/`

- `schemas/admin-orders.schema.ts` — `AdminOrderDetailsResponse`
  (order = checkout's `orderSchema` + timestamps/shipment, customer,
  payment details), timeline entries, customer search page, cancel
  response. The list reuses admin-dashboard's `adminOrderPageSchema`.
- `api/admin-orders.ts` — list (`Status`, `CustomerId`, `Page`,
  `PageSize`), status counts (`PageSize=1` per status), detail, timeline,
  `startProcessing`, `ship`, `deliver`, `cancel`, `setInternalNotes`,
  `searchCustomers`.
- `lib/order-tabs.ts` (+spec) — tabs (id ↔ `OrderStatus`), `?status=`
  parsing.
- `lib/order-timeline-labels.ts` (+spec) — event type → pt-BR label and
  tone; consecutive stock events grouped with their units.
- `lib/internal-notes.ts` (+spec) — `parseNotes(text)` → entries
  `{ text, author, at }` (unformatted text = one entry), `appendNote(text,
  note, author, now)`, characters left.
- `lib/order-actions.ts` (+spec) — next action per status, whether it can
  be cancelled, the status note, error code → copy, ship form validation
  (Zod: carrier + code required, link optional http/https).
- `hooks/admin-orders.queries.ts` — `useAdminOrders(filter)`,
  `useOrderCounts(customerId)`, `useAdminOrder(id)`, `useOrderTimeline(id)`,
  `useCustomerSearch(term)` (debounced), mutations that refresh the list,
  counts, detail, timeline, the menu counters and the dashboard.
- `components/` — `orders-page.tsx` (URL state, layout list | detail),
  `orders-toolbar.tsx` (search with suggestions + customer chip),
  `status-tabs.tsx`, `orders-table.tsx` (+ pagination),
  `order-detail-panel.tsx` (header, next action, cancel, items, address,
  timeline, notes) and `ship-form.tsx`, `internal-notes.tsx`.

## Wiring

- `src/app/admin/(panel)/orders/page.tsx`.
- `appRoutes.admin.orders` / `order(id)` / `ordersWith(...)`; AdminNav
  item `orders` gets its `href`.
- Dashboard: "Ver todos", "N pedidos esperam preparo" and the recent rows
  link here (`?status=` / `?pedido=`).
- `queryKeys.admin.orders(...)`, `orderCounts`, `order(id)`,
  `orderTimeline(id)`, `customerSearch(term)`.
- Toasts reuse account's `notify` (dark sonner toast).
