# Backend pendencies — Minha conta

Spec: `Docs/specs/account/account.md`. Mockup:
`Docs/design/mockups/Conta.dc.html`.

## 1. Order list without items

- **Mockup expects**: thumbnails and "Pendente Orbe + 2 peças" per row.
- **Backend today**: `GET /api/orders/me` → `OrderSummaryResponse` (`id,
  orderNumber, status, createdAt, totalAmount, currency, itemCount`) — no
  items.
- **To close**: add the first items (product id/name/slug) to the summary.
- **Workaround**: `GET /api/orders/{id}` for each order on the page (10).
- **Severity**: Feature gap (performance).

## 2. Single name field

- **Mockup expects**: Nome and Sobrenome.
- **Backend today**: `CustomerResponse.Name` / `UpdateProfileRequest.Name`
  — one string.
- **Workaround**: split on the first space; joined on save.
- **Severity**: Cosmetic.

## 3. No phone validation

- **Mockup expects**: "Use DDD + número, com 10 ou 11 dígitos."
- **Backend today**: `Customer.Phone` is any string.
- **Workaround**: validated in the form; stored formatted
  "(11) 98000-0000".
- **Severity**: Feature gap.

## 4. Timeline notes and atelier names

- **Mockup expects**: notes like "A Oficina Faísca está embalando a peça",
  "Recebido por Ana".
- **Backend today**: `OrderStatusHistoryEntryResponse` has `fromStatus,
  toStatus, reason, changedAt`; reasons are operational codes or free text.
- **Workaround**: a fixed editorial note per status. The backend `reason`
  is never shown — it's operational English ("Cancelled by the customer",
  `payment_window_expired`), not shopper copy.
- **To close**: a localized, shopper-facing note per transition.
- **Severity**: Cosmetic.

## 5. Card brand / last four

- Same as payment pendency #2 — "Pagamento: Cartão de crédito".
- **Severity**: Cosmetic.

## 6. Changing e-mail

- **Mockup expects**: "Para trocar o e-mail, fale com o atendimento." (no
  self-service).
- **Backend today**: no change-e-mail endpoint (matches the mockup).
- **Severity**: Cosmetic (by design).
