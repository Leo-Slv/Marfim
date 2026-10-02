# Minha conta — implementation plan

Spec: `Docs/specs/account/account.md`.

## API (customer token)

- `GET/PUT /api/customers/me` (`{ name, phone }`).
- `GET/POST /api/customers/me/addresses`, `PUT/DELETE
  /api/customers/me/addresses/{id}`, `POST …/{id}/default-shipping|billing`.
- `GET /api/orders/me?page&pageSize` → `PagedResponse<OrderSummaryResponse>`;
  `GET /api/orders/{id}`; `GET /api/orders/{id}/status-history` →
  `[{ fromStatus, toStatus, reason, changedAt }]`;
  `POST /api/orders/me/{id}/cancel` `{ reason? }` → `{ paymentSettlement }`
  (`order_in_fulfilment` 400, `payment_in_progress` 409).
- `POST /api/auth/password/change` `{ currentPassword, newPassword,
  refreshToken }` — via the BFF (`/api/session/change-password`) so the
  cookie's refresh token is the session kept.

## Routes

`/account` → redirect `/account/orders`; `/account/orders`,
`/account/orders/[orderId]`, `/account/profile`, `/account/addresses`,
`/account/password` — each page renders `AccountLayout` + its section.

## Feature — `src/features/account`

- `api/` — profile, orders (list/history/cancel), address update/delete;
  reuses checkout's `customer-addresses` (get/add/default) and order schema.
- `hooks/account.queries.ts` — `useProfile`, `useUpdateProfile`,
  `useMyOrders(page)`, `useOrderDetails(ids)` (useQueries),
  `useOrderHistory`, `useCancelOrder`, `useUpdateAddress`,
  `useDeleteAddress`, `useSetDefaultAddress`, `useChangePassword`.
- `lib/` — `order-status.ts` (label + tone per status, cancellable,
  in fulfilment), `order-timeline.ts` (history → timeline steps),
  `order-summary.ts` ("X + N peças"), `person-name.ts` (split/join),
  `phone.ts` (mask + 10–11 digits), `format-date-br.ts` — all tested.
- `schemas/` — profile form, change-password form.
- `components/` — `account-layout.tsx` (heading + side nav + Sair),
  `orders-section.tsx`, `order-detail-section.tsx`, `profile-section.tsx`,
  `addresses-section.tsx`, `password-section.tsx`, `account-toast.ts`.

## Shared

- `AddressFormCard` (checkout) gains `initialValues` / `title` / submit
  label for editing.
- BFF `src/app/api/session/change-password/route.ts`.
- `app-routes.ts` — `account.*`.

## Tests

Pure libs; test, typecheck, lint, build; browser on the test account: the
order ORD-2026-000001 in the list + detail timeline, profile save, address
add/edit/default/delete, password change (wrong current, success, session
kept), Sair.
