# Checkout — Entrega (`/checkout/delivery`)

Mockup: `Docs/design/mockups/Entrega.dc.html` (default state; "sem
endereço" state; "futuro" shipping options shown as EM BREVE).

## Why

OrderCore's checkout needs a shipping and a billing address of the signed-in
customer (`shippingAddressId`, `billingAddressId`). This step lets the
shopper pick them — or register the first one — between the bag and the
payment.

## What

- **Steps**: Sacola done (green check, links back to the bag), 02 Entrega
  current, 03 Pagamento next. Title "Para onde vamos enviar?".
- **A · Endereço de entrega**: the customer's saved addresses as radio cards
  (label, "PADRÃO DE ENTREGA" badge, recipient · street, number ·
  complement, neighborhood · city, UF · CEP). The default shipping address
  starts selected. "+ Novo endereço" opens the form; with no address saved,
  a notice ("Você ainda não tem endereços salvos…") and the form open by
  default.
- **New address form**: nome do endereço, quem recebe, CEP (masked
  00000-000), rua, número, complemento (optional), bairro, cidade, UF (all
  27), "Usar como padrão de entrega". Invalid fields are highlighted with
  "Preencha os campos destacados. O CEP tem 8 números." Saving adds the
  address, selects it, and (when chosen, and always for the first one)
  makes it the default.
- **B · Endereço de cobrança**: "Igual ao endereço de entrega" (default on);
  unchecked, the saved addresses appear to pick from (default billing first).
- **C · Frete e prazo**: muted with EM BREVE ("…Por enquanto o pedido não
  tem custo de frete.").
- **Seu pedido** (sticky): the bag's lines (drawing, quantity badge, name,
  total), Subtotal, Frete EM BREVE, Total — prices re-validated with the
  backend as on the bag; "Editar" / "Voltar para a sacola".
  "Continuar para pagamento" goes to the payment step carrying the chosen
  addresses; it's replaced by "Cadastre um endereço para continuar" while
  there's none, and blocked (with a link back) while the bag has unresolved
  notices.
- Motion: fade-ups, shine on the main button.

### Access rules

- Signed out → Entrar, then back here (`?next=`).
- Empty bag → the bag.
- E-mail not confirmed → allowed (the header banner already asks); payment
  will require it, as the backend does.

## Decisions

No new questions — derived from earlier decisions and the backend contract:

- The chosen addresses travel to the payment step in the URL
  (`/checkout/payment?entrega=<id>&cobranca=<id>`), per the "screen state
  lives in the URL" convention; coming back to Entrega restores them.
- Features without backend support (shipping options) are EM BREVE; the
  payment step uses its future route until it's built.
- Fields the backend requires but the mockup marks optional are handled on
  the frontend (see pendencies).

## Out of scope

Editing/removing addresses (Minha conta), CEP lookup/autocomplete, shipping
quotes, the payment step.

Backend gaps: `Docs/backend-pendencies/checkout/delivery.md`.
