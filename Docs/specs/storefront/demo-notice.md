# Demonstration-store notice

Mockups: none (derived from `Header.dc.html` and `Pagamento.dc.html`
patterns; the copy follows `Docs/specs/content/content-pages.md`).

## Why

Marfim is deployed as a demonstration store: the pieces are fictional and
payments run in Stripe's test mode. A visitor who does not know that may
try to buy with a real card, or wonder why nothing arrives. The notice
says it up front and, at payment time, tells them which test card to use.

## What

- A thin band above the storefront header, on every store screen (not the
  admin panel, not the admin login): "Loja de demonstração — os pagamentos
  usam o modo de teste do Stripe e nada é cobrado." with a link to the FAQ
  entry about payments.
- The visitor can close it. It stays closed for the rest of that browser
  session and comes back in a new one.
- On the Pagamento screen, while the card form is shown, a block explains
  the test cards (approves / declines / asks for 3-D Secure) and states
  that real cards must not be used.
- The whole thing is controlled by one setting, on by default; turning it
  off removes the band and the hint (for when the store sells for real).

## Out of scope

- Any change to the e-mails (OrderCore side, step 6).
- Detecting Stripe's mode from the API (not exposed; see pendencies).

## Decisions (asked and answered)

1. Band on the store + hint on Pagamento.
2. Dismissible, remembered for the session.
3. Switchable with `NEXT_PUBLIC_DEMO_STORE` (default on).
