# Admin · Dashboard — implementation plan

Spec: `Docs/specs/admin/admin-dashboard.md`.

## Routes

- Route group `src/app/admin/(panel)/`: `layout.tsx` (client) wraps every
  panel screen in `AdminGate` + `AdminShell`; `page.tsx` renders the
  dashboard. `/admin/login` stays outside the group (no gate, no menu).
- The provisional `AdminPlaceholder` is removed.

## Feature `src/features/admin-shell/`

- `lib/admin-nav.ts` — groups/items (label, icon path from AdminNav, href
  or null when not built, counter key), `adminInitials(email)` (+spec).
- `api/admin-counts.ts` — counters: confirmed orders
  (`/api/admin/orders?Status=Confirmed&PageSize=1` → `totalItems`), low +
  out of stock (`/api/admin/catalog/products?Stock=…&PageSize=1`), pending
  failed messages (`/api/messaging/failed-messages?Status=Pending`).
- `hooks/admin-shell.queries.ts` — `useAdminCounts()` (30 s polling).
- `components/admin-nav.tsx`, `components/admin-shell.tsx` (sidebar ≥ 980 px,
  top bar below; Sair → `signOut` → `/admin/login`).

## Feature `src/features/admin-dashboard/`

- `schemas/admin-dashboard.schema.ts` — `DashboardResponse`,
  `AdminOrderSummaryResponse` (+ paged), `AdminProductSummaryResponse`
  (+ paged) — numbers via `z.coerce`.
- `api/admin-dashboard.ts` — `getDashboard(from, to)`,
  `getAdminOrders(filter)`, `getAdminProducts(filter)`.
- `lib/dashboard-period.ts` (+spec) — São Paulo day keys, period range for
  7/30 days (today included) and the previous one, `?periodo=` parsing.
- `lib/dashboard-metrics.ts` (+spec) — paid orders, ticket, deltas
  ("+12,4%", "+3"), funnel stages, revenue per day from orders, relative
  time ("4 MIN", "1 H", "3 D"), chart geometry (paths, y max).
- `hooks/admin-dashboard.queries.ts` — `useDashboard(range)` (current +
  previous), `useRevenueSeries(range)` (all pages, capped at 20),
  `usePreparationQueue()` (confirmed now / over 24 h), `useLowStock()`;
  all polling 30 s.
- `components/` — `dashboard-page.tsx` (header, period switch in the URL
  inside Suspense), `kpi-cards.tsx`, `revenue-chart.tsx` (SVG, hover),
  `orders-funnel.tsx`, `recent-orders.tsx` (reuses account's status
  label/pill), `low-stock-card.tsx`, shared card/skeleton/error bits.

## Keys & styling

- `queryKeys.admin`: `counts`, `dashboard(from, to)`, `revenue(from, to)`,
  `preparation`, `lowStock`.
- `globals.css`: `--animate-draw-line` (stroke-dashoffset 2000 → 0),
  reuses `animate-bar`, `animate-fade-in`, `animate-pulse-dot`.
