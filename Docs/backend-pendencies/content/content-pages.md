# Backend pendencies — Institucional e ajuda

Spec: `Docs/specs/content/content-pages.md`. Mockups:
`Docs/design/mockups/Conteudo.dc.html`, `MobileConteudo.dc.html`.

## 1. No guest order tracking

- **Mockup expects**: "Rastrear sem login" by order number + purchase
  e-mail.
- **Backend today**: orders are read only by their owner
  (`OrdersController`: `GET /api/orders/me`, `GET /api/orders/{id}`) or an
  admin; nothing looks an order up by number and e-mail.
- **To close**: a throttled public endpoint taking the order number and
  e-mail, answering status and shipment only.
- **Workaround**: card to sign in / Meus pedidos; the guest form is
  disabled with EM BREVE.
- **Severity**: Feature gap.

## 2. No returns / exchange flow

- **Mockup expects**: requesting an exchange or return from the order page
  (EM BREVE in the mockup itself), collection scheduling.
- **Backend today**: no return entity or endpoint in the Orders module;
  refunds exist only as an admin action on the payment
  (`PaymentsController`, `RequestRefundUseCase`).
- **To close**: a return request on the order (reason, items) with its
  states, and the refund tied to it.
- **Workaround**: the page explains the policy; requesting it via support
  shows EM BREVE.
- **Severity**: Feature gap.

## 3. No shipping or lead time

- **Mockup expects**: dispatch "em até 3 dias úteis", transport times per
  region, free shipping above R$ 299.
- **Backend today**: no shipping or lead-time data (cart pendency,
  `Docs/backend-pendencies/storefront/cart.md`).
- **Workaround**: no time promised; CEP calculation, express delivery and
  free shipping EM BREVE.
- **Severity**: Feature gap.

## 4. LGPD export and erasure

- **Mockup expects**: asking for access, correction or erasure of personal
  data.
- **Backend today**: the shopper edits profile and addresses
  (`MyAccountController`); no data export or account erasure — listed as
  out of scope in OrderCore's
  `Docs/specs/operations/production-readiness.md`.
- **To close**: export (JSON of profile, addresses, orders) and erasure /
  anonymisation of the account.
- **Workaround**: Privacidade says correction is in Minha conta and that
  export/erasure are EM BREVE.
- **Severity**: Feature gap.

## 5. No editorial content or atelier data

- **Mockup expects**: store story, atelier stories and cities, lookbook
  scenes, FAQ, policies — editable by the store.
- **Backend today**: no CMS/content module; ateliers are only the products'
  `brand` (home pendency #5).
- **Workaround**: content lives in the front
  (`src/features/content/lib/`), atelier data in `home/lib/ateliers.ts`;
  pieces come from the catalog by brand.
- **Severity**: Cosmetic.

## 6. No support channel or store contacts

- **Mockup expects**: WhatsApp and e-mail of the support team, the
  ateliers' e-mail, the CNPJ.
- **Backend today**: none (it's store data, not an API concern, and the
  store is a demonstration).
- **Workaround**: atendimento and "Mande seu portfólio" EM BREVE; footer
  says "LOJA DE DEMONSTRAÇÃO" instead of a CNPJ.
- **Severity**: Config.
