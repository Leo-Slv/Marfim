# Checkout · Pagamento — implementation plan

Spec: `Docs/specs/checkout/payment.md`.

## API

- `GET /api/payments/methods` (anonymous) → `{ provider, methods,
  publishableKey }`.
- `POST /api/orders/checkout` (customer, header `Idempotency-Key`) body
  `{ items: [{productId, quantity}], shippingAddressId, billingAddressId,
  paymentMethod: "Card", expectedTotal }` → 202 `OrderResponse` with
  `payment.nextAction = { type: "confirm_card", clientSecret }`. Replaying
  the same key returns the same order and next action. Errors:
  `email_not_confirmed` (403), `price_changed`, `insufficient_stock`,
  `product_unavailable` (409), `product_not_found` (404),
  `payment_method_unavailable` (400), 429.
- `GET /api/orders/{id}` (owner) → `OrderResponse` (`status`:
  `PendingPayment` → `Confirmed` / `PaymentFailed` / `Cancelled`;
  `payment.status`, `payment.failureReason`).
- `GET /api/customers/me` → name for "Obrigado, {nome}".

## Stripe

- `@stripe/stripe-js` (`loadStripe(publishableKey)`) + `@stripe/react-stripe-js`
  (`<Elements stripe options={{ clientSecret, appearance, fonts }}>` +
  `<PaymentElement>`). Appearance from the design tokens (Outfit via Google
  Fonts `cssSrc`, primary #3B3FD9, radius 12).
- Pay: `stripe.confirmPayment({ elements, redirect: 'if_required',
  confirmParams: { return_url } })` — 3-D Secure in place; `return_url`
  points back to this page with `?pedido=` for methods that must redirect.
  An `error` (decline…) keeps the form with the message.

## State

- URL: `entrega`, `cobranca` (from Entrega) and `pedido` (once placed).
- `sessionStorage` `marfim.checkout.attempt` = `{ key, signature, orderId }`
  where `signature` = bag lines + addresses. Same signature → same
  idempotency key (reload / back / double click never duplicates);
  different → new key. "Tentar de novo" after a failure starts a new key.
- The client secret lives only in memory (re-obtained by replaying the
  checkout with the same key after a reload).

## Files — `src/features/checkout`

- `schemas/order.schema.ts`, `schemas/payment-methods.schema.ts`,
  `model/order.ts`.
- `api/` — `get-payment-methods`, `place-order` (checkout), `get-order`,
  `get-customer-profile`.
- `hooks/payment.queries.ts` — `usePaymentMethods`, `usePlaceOrder`,
  `useOrder(id, { poll })` (refetchInterval 2 s while `PendingPayment`),
  `useCustomerProfile`.
- `lib/` — `checkout-attempt.ts` (idempotency key store, tested),
  `order-stage.ts` (order + local state → screen, tested),
  `payment-messages.ts` (checkout error codes + Stripe failure reasons →
  copy, tested), `stripe-appearance.ts`.
- `components/` — `payment-page.tsx` (gate + stage switch),
  `payment-review.tsx`, `payment-alert.tsx`, `card-payment-form.tsx`
  (Elements), `payment-processing.tsx`, `order-confirmed.tsx`,
  `payment-failed.tsx`, `order-review-aside.tsx`.
- `src/app/checkout/payment/page.tsx`.

## Shared

- `CheckoutSteps` with `hrefs` (Entrega keeps the addresses).
- `globals.css` — confetti, orbit, loading dots.
- Cart: `clearCart()` in the store (on confirmation).

## Tests

`checkout-attempt`, `order-stage`, `payment-messages`; test, typecheck,
lint, build; browser with Stripe test cards (4242 4242 4242 4242 approved,
4000 0000 0000 0002 declined, 4000 0025 0000 3155 3-D Secure) against the
running API + Stripe CLI, plus price-changed and email-not-confirmed
notices.
