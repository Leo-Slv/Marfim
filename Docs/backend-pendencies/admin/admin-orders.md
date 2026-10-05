# Backend pendencies — Admin · Pedidos

Spec: `Docs/specs/admin/admin-orders.md`. Mockup:
`Docs/design/mockups/AdminPedidos.dc.html`.

## 1. No search on the admin order list

- **Mockup expects**: "Número ou cliente" search.
- **Backend today**: `GET /api/admin/orders` (`ListOrdersFilter`) filters by
  `Status`, `CustomerId`, `CreatedFrom`/`CreatedTo` only.
- **To close**: a `SearchTerm` over order number and customer name/e-mail.
- **Workaround**: customer search through `GET /api/customers?SearchTerm`
  (ILIKE on name/e-mail), then `CustomerId=`; order-number search is EM
  BREVE.
- **Severity**: Feature gap.

## 2. One status per filter

- **Mockup expects**: a "Cancelados e falhas" tab (cancelled + payment
  refused + waiting payment).
- **Backend today**: `Status` takes a single `OrderStatus`.
- **To close**: accept several statuses (`Status=Cancelled&Status=…`).
- **Workaround**: one tab per status.
- **Severity**: Cosmetic.

## 3. Tab counts cost one call each

- **Mockup expects**: a count on every tab.
- **Backend today**: no counts by status on the list; the dashboard's
  `ordersByStatus` has no customer filter.
- **Workaround**: `PageSize=1` per status (`totalItems`), with the same
  customer filter.
- **Severity**: Cosmetic (performance).

## 4. Internal notes are one text

- **Mockup expects**: several notes, each with author and time.
- **Backend today**: `Order.InternalNotes` — a single string (max 2000),
  replaced by `PUT /api/orders/{id}/internal-notes`; no author or time.
- **To close**: notes as entries (`text`, `authorId`, `createdAt`) with an
  append endpoint.
- **Workaround**: each save appends an entry in a fixed format (text +
  "— author · date") to the single text; the screen parses it back into a
  list. Two admins saving at once can overwrite each other (last write
  wins); the 2000-character limit covers all notes together.
- **Severity**: Feature gap.

## 5. No card brand / last four

- **Mockup expects**: "Cartão final 4242".
- **Backend today**: `OrderPaymentDetailsResponse` has method, provider and
  status, no card details (same as payment pendency #2).
- **Workaround**: "Cartão" + payment status.
- **Severity**: Cosmetic.

## 6. Timeline details are thin

- **Mockup expects**: "Enviado · [TRANSPORTADORA]", "Cancelado pelo
  cliente".
- **Backend today**: `OrderTimelineEntryResponse.details` carries amounts,
  stock quantities and an English free-text `reason`; no actor, no carrier.
- **To close**: actor (customer / admin / system) and shipment data on the
  entries.
- **Workaround**: pt-BR labels per event type; carrier from the order's
  current shipment; the reason is never shown.
- **Severity**: Cosmetic.
