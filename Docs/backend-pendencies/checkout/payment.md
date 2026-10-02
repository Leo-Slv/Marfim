# Backend pendencies — Checkout · Pagamento

Spec: `Docs/specs/checkout/payment.md`. Mockup:
`Docs/design/mockups/Pagamento.dc.html`.

## 1. Pix (and its 5% discount)

- **Mockup expects** ("futuro"): Pix with 5% off, QR code, 30-min timer.
- **Backend today**: `GET /api/payments/methods` → `{ provider: "Stripe",
  methods: ["Card"] }`; Pix only exists on the fake provider
  (`stripe-provider.md`, decision 2); no discount rule.
- **Workaround**: Pix muted with EM BREVE; offered automatically if the
  backend ever lists it.
- **Severity**: Feature gap.

## 2. Card brand / last four digits

- **Mockup expects**: "Cartão de crédito final 4242" on the confirmation.
- **Backend today**: `OrderPaymentResponse` has `Status`, `Method`,
  `FailureReason`, `NextAction` — no card details; the publishable key can't
  read them from Stripe either.
- **To close**: store brand + last4 from the PaymentIntent's payment method
  (webhook) and expose them on `OrderPaymentResponse`.
- **Workaround**: "Cartão de crédito".
- **Severity**: Cosmetic.

## 3. Which item ran out, and how many are left

- **Mockup expects**: "Restou só 1 unidade do Par de canecas Grão, e sua
  sacola tem 2."
- **Backend today**: checkout answers `409 insufficient_stock` for the
  whole cart, without the item or the available quantity
  (`CheckoutUseCase`).
- **To close**: include the offending product ids and available quantities
  in the ProblemDetails (extension).
- **Workaround**: generic notice + "Ajustar a sacola" (the bag re-quotes
  and marks the line).
- **Severity**: Feature gap.

## 4. Which price changed

- **Mockup expects**: "O Pendente Orbe passou de R$ 359,00 para R$ 379,00".
- **Backend today**: `409 price_changed` carries only the new total in the
  detail text.
- **Workaround**: on `price_changed` the page re-quotes the bag
  (`POST /api/orders/cart/quote` with the prices the shopper saw), which
  reports the changed lines with their previous price.
- **Severity**: Cosmetic.

## 5. Webhooks need the Stripe CLI locally

- **Backend today**: authorizations arrive by Stripe webhook; locally only
  when `docker compose --profile stripe up` runs `stripe-cli`; otherwise
  reconciliation picks them up every 15 minutes (payments older than 5).
- **Workaround**: documented in the README; started for development.
- **Severity**: Config.
