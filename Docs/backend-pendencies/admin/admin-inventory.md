# Backend pendencies — Admin · Estoque

Spec: `Docs/specs/admin/admin-inventory.md`. Mockup:
`Docs/design/mockups/AdminEstoque.dc.html`.

## 1. Stock list without product data

- **Mockup expects**: name, SKU and drawing on each stock row.
- **Backend today**: `StockItemResponse` has `productId` only.
- **To close**: product name/SKU on the inventory list (or a joined admin
  view).
- **Workaround**: `GET /api/admin/catalog/products` (with `Stock=`),
  whose rows carry the stock level (`ProductStockLevelResponse`).
- **Severity**: Cosmetic.

## 2. No total of available units

- **Mockup expects**: "Unidades disponíveis".
- **Backend today**: no aggregate; the dashboard only counts low/out.
- **Workaround**: the sum over the product list (up to 100 products — one
  page at the API's maximum).
- **Severity**: Cosmetic (wrong above 100 products).

## 3. Reservations without order number or expiry

- **Mockup expects**: "MF-000231 · 1 un. · até 10:57".
- **Backend today**: `ReservationResponse` has `orderId`, `reservedAt`, no
  order number nor expiry (unpaid orders are released by
  `UnpaidOrderExpiry`, not per reservation).
- **To close**: the order number and the release deadline on the
  reservation.
- **Workaround**: order number fetched per active reservation; "desde
  HH:MM".
- **Severity**: Cosmetic.

## 4. Reorder-point changes aren't movements

- **Mockup expects**: "=6 Ponto de reposição alterado" in Movimentações.
- **Backend today**: `StockItem.SetReorderLevel` records no
  `InventoryStockMovementRecorded`.
- **To close**: record it (or show it from the audit log).
- **Workaround**: not listed; the new value shows in the panel.
- **Severity**: Cosmetic.

## 5. Movements without the order

- **Mockup expects**: "Vendas".
- **Backend today**: reservation movements reference the
  `InventoryReservation`, not the order.
- **Workaround**: pt-BR labels per movement type.
- **Severity**: Cosmetic.
