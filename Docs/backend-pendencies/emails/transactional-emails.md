# Backend pendencies — transactional e-mails

Mockups: `Docs/design/mockups/Email.dc.html` (+ `EmailConfirmacao`,
`EmailNovaSenha`, `EmailPedidoConfirmado`, `EmailPedidoEnviado`,
`EmailPedidoCancelado`, `EmailPagamentoRecusado`) and `MobileEmails.dc.html`.

The e-mails are rendered by OrderCore (Notifications module); the spec and
implementation live in its repo: `Docs/specs/notifications/email-branding.md`.
Done there: the Marfim layout (wordmark, icon, title, note box, button,
dark footer), responsive down to phones, with the brand as configuration
(`Notifications:Brand:*`).

## 1. Order items in the order e-mails — Feature gap

- **Mockup expects**: the order block with each item (drawing, name, atelier,
  quantity, line total) and the order total.
- **Backend today**: the e-mails are driven by `OrderConfirmed`, `OrderShipped`,
  `OrderCancelled` and `OrderPaymentFailed` integration events
  (`Modules/Orders/Contracts/IntegrationEvents`), which carry the order number
  and total, not the items.
- **Closing the gap**: items (name, brand, quantity, line total) on the events,
  or a read model Notifications queries; the drawings are Marfim-only (by
  slug), so they cannot appear in an e-mail without hosted images.
- **Workaround shipped**: number and total in the text.
- **Severity**: Feature gap.

## 2. Delivery address, carrier and tracking code — Feature gap

- **Mockup expects**: "ENTREGA EM" address on the confirmation and the
  carrier + tracking code on the shipped e-mail.
- **Backend today**: `shipment` is a pre-built sentence; the tracking link
  template exists (`order-shipped-tracking`) but the address is not on the
  event.
- **Closing the gap**: the address snapshot on `OrderConfirmed`.
- **Workaround shipped**: the shipment sentence in a note box.
- **Severity**: Feature gap.

## 3. "View order" / "Try again" links — Feature gap

- **Mockup expects**: a button to the order (`/account/orders/<id>`) and to the
  cart after a failed payment.
- **Backend today**: it only knows `Identity:Links` for the two account e-mails.
- **Closing the gap**: a storefront base URL setting and the order id on the
  events.
- **Workaround shipped**: no button on order e-mails.
- **Severity**: Feature gap.

## 4. Store data placeholders — Cosmetic

- **Mockup expects**: support WhatsApp, CNPJ and the store address in the
  footer (`[BRACKETS]`).
- **Backend today**: none of this exists; the footer text is one setting
  (`Notifications:Brand:Footer`).
- **Workaround shipped**: an honest demonstration footer, as in the content
  pages.
- **Severity**: Cosmetic.

## 5. Web fonts — Cosmetic

- **Mockup expects**: Outfit and JetBrains Mono.
- **Backend today**: e-mail clients block or ignore remote fonts (and loading
  them tracks the reader).
- **Workaround shipped**: system fonts with Outfit first in the stack.
- **Severity**: Cosmetic.
