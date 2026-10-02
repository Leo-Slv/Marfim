# Backend pendencies — Admin · Dashboard

Spec: `Docs/specs/admin/admin-dashboard.md`. Mockups:
`Docs/design/mockups/AdminDashboard.dc.html`, `AdminNav.dc.html`.

## 1. No daily revenue series

- **Mockup expects**: "Receita por dia" for the last 7 / 30 days.
- **Backend today**: `GET /api/admin/dashboard` (`GetDashboardUseCase`)
  returns one `revenueByCurrency` total for the period; no per-day figure.
- **To close**: a `revenueByDay` series in `DashboardResponse` (same
  statuses, bucketed by `ConfirmedAt` in the store's time zone).
- **Workaround**: the screen pages through `GET /api/admin/orders`
  (`CreatedFrom`/`CreatedTo`, 100 per page, capped at 20 pages) and sums
  confirmed/processing/shipped/delivered totals per day of **creation**
  (`AdminOrderSummaryResponse` has no `confirmedAt`), so a day can differ
  slightly from the KPI, which uses `ConfirmedAt`.
- **Severity**: Feature gap (performance on large periods).

## 2. No daily goal

- **Mockup expects**: "Meta diária R$ 700" line and "Acima/Abaixo da meta".
- **Backend today**: no goal/target setting anywhere.
- **To close**: a store setting for the daily revenue goal.
- **Workaround**: no goal on the chart (decided with the user).
- **Severity**: Feature gap.

## 3. No comparison with the previous period

- **Mockup expects**: "+12,4% vs. período anterior" on the KPIs.
- **Backend today**: the dashboard answers one period.
- **Workaround**: a second call for the previous period of the same length.
- **Severity**: Cosmetic.

## 4. "Waiting more than 24 h" is measured from creation

- **Mockup expects**: "2 há +24 h" — confirmed orders waiting to be
  prepared for over a day.
- **Backend today**: `GET /api/admin/orders` filters by `CreatedFrom` /
  `CreatedTo` only; there's no "confirmed before" filter and the summary
  has no `confirmedAt`.
- **To close**: a `ConfirmedTo` filter (or the count in the dashboard).
- **Workaround**: `Status=Confirmed&CreatedTo=now-24h` — creation and
  confirmation are minutes apart for card payments.
- **Severity**: Cosmetic.

## 5. Low stock without product data

- **Mockup expects**: product name, SKU and "available / reorder level".
- **Backend today**: `GET /api/inventory/stock-items?State=LowStock` has
  only `productId`; the dashboard only counts (`DashboardStockResponse`).
- **Workaround**: `GET /api/admin/catalog/products?Stock=LowStock` and
  `Stock=OutOfStock`, which carry name, SKU and stock level.
- **Severity**: Cosmetic.

## 6. Admins have no name

- **Mockup expects**: "[NOME DO ADMIN]" and initials in the menu.
- **Backend today**: admin accounts (`UserAccount.CreateAdmin`) have only an
  e-mail; names live in Customers.
- **To close**: a display name on admin accounts.
- **Workaround**: the e-mail (initials from its first letters).
- **Severity**: Cosmetic.
