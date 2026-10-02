# Checkout · Entrega — implementation plan

Spec: `Docs/specs/checkout/delivery.md`.

## API (customer token)

- `GET /api/customers/me/addresses` → `CustomerAddressResponse[]` (`id,
  label, recipientName, phone, street, number, complement, neighborhood,
  city, state, postalCode, country, isDefaultShipping, isDefaultBilling`).
- `POST /api/customers/me/addresses` (same fields minus id/defaults) → 201
  the address.
- `POST /api/customers/me/addresses/{id}/default-shipping` /
  `default-billing` → 204.
- Bag summary: `POST /api/orders/cart/quote` + catalog, as on the bag
  (`useCartQuote`, `buildCartView`).

## Feature — `src/features/checkout`

- `schemas/address.schema.ts`, `model/address.ts`.
- `api/` — `get-addresses`, `add-address`, `set-default-address`.
- `hooks/checkout.queries.ts` — `useAddresses` (enabled with a session),
  `useAddAddress` (creates, sets defaults when asked/first, updates the
  cached list).
- `schemas/address-form.schema.ts` — Zod: recipient, CEP (8 digits), street,
  number, neighborhood, city required; UF in the list; label optional.
- `lib/`:
  - `brazilian-states.ts` — the 27 UFs.
  - `format-address.ts` — CEP mask, card lines, request mapping (label
    fallback "Endereço N", country `BR`).
  - `checkout-url.ts` — payment href with `entrega`/`cobranca`; resolve the
    initial selection (URL → default → first).
  (all tested)
- `components/` — `delivery-page.tsx`, `address-card.tsx`,
  `address-form.tsx`, `checkout-summary.tsx` ("Seu pedido"),
  `shipping-coming-soon.tsx`.

## Shared

- `src/lib/auth/use-require-session.ts` — redirects to Entrar (`?next=`)
  when signed out (after hydration).
- `CheckoutSteps` — completed steps render as a green link with a check.
- `StoreHeader` — Sacola highlighted on `/checkout/*` too.
- `app-routes.ts` — `checkout.paymentWith(shipping, billing)`.
- `src/app/checkout/delivery/page.tsx`.

## Tests

`format-address`, `checkout-url`, `address-form.schema`; test, typecheck,
lint, build; browser: signed-out redirect, empty-address flow (first
address becomes default), second address + selection, billing toggle,
continue URL, against the running API.
