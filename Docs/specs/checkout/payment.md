# Checkout — Pagamento (`/checkout/payment`)

Mockup: `Docs/design/mockups/Pagamento.dc.html` — screens 15 (revisão), 16
(dados do cartão + 3-D Secure), 17 (processando), 18 (confirmado) and 19
(não aprovado); Pix ("futuro") shown as EM BREVE.

## Why

This is where the order is actually placed and paid. OrderCore creates the
order (reserving stock) at checkout and hands the card payment to the
browser through Stripe; the result arrives asynchronously. The shopper needs
to review what they're buying, pay safely, wait without anxiety, and get a
clear outcome — or a clear way to try again.

## What

### 15 · Revise e pague

- Steps (Sacola ✓ · Entrega ✓ · 03 Pagamento); title "Revise e pague".
- **Forma de pagamento**: "Cartão de crédito" (selected) — "Você digita os
  dados do cartão no próximo passo."; "Pix com 5% off" muted with EM BREVE
  while the backend doesn't offer it (methods come from the backend).
- **Entrega / Cobrança** summary of the addresses chosen in Entrega
  ("Igual à entrega" when the same), each with "Alterar" back to Entrega
  keeping the choice.
- **Revisão do pedido** aside: lines (drawing, quantity, name, total;
  "Preço atualizado" on a line whose price moved), Subtotal, Frete EM BREVE,
  Total; "Ir para o pagamento" (spinner "Criando pedido…") and the note
  "Ao continuar, você concorda com os termos de uso. O total é conferido de
  novo antes da cobrança."
- Placing the order can fail with a notice (shake):
  - **price changed** → which piece changed and the new total, "Aceitar
    novo total" (the bag adopts the new prices; nothing was charged);
  - **out of stock / unavailable** → "Ajustar a sacola";
  - **e-mail not confirmed** → "Reenviar link de confirmação";
  - **too many attempts** → countdown, button locked.

### 16 · Dados do cartão

- Title "Dados do cartão", "PROCESSADO PELO STRIPE". The card fields are
  **Stripe's own component**, styled like the mockup — the card never
  touches Marfim or OrderCore.
- "Pagar R$ X" confirms the card with Stripe; when the bank asks for 3-D
  Secure, Stripe shows its challenge in place.
- A declined card shows "O banco recusou este cartão. Confira os dados ou
  use outro cartão. Nenhum valor foi cobrado." and the shopper can try
  another card (the order keeps waiting for payment, up to 30 minutes).
- "Voltar" returns to the review; the same order is reused.

### 17 · Confirmando o pagamento…

- Order number, animated orbit, "Não feche nem atualize esta página", steps
  (Pedido criado ✓ · Pagamento enviado ao banco ✓ · Aguardando confirmação ·
  Confirmando estoque) and "Ao vivo · atualiza sozinho" — the page follows
  the order until it's confirmed or fails.

### 18 · Pedido confirmado

- Confetti + drawn check, order number, "Obrigado, {nome}. Mandamos o resumo
  para {e-mail}…", the four next steps (Confirmado · Em preparo · Enviado ·
  Entregue), items with "Total pago", delivery address and payment method,
  "Acompanhar pedido" (Minha conta → future route) and "Continuar
  comprando". The bag is emptied.

### 19 · Pagamento não aprovado

- Order number, the reason in plain language, "As peças voltaram ao estoque,
  mas a sua sacola continua salva. Para tentar de novo, um novo pedido é
  criado." — "Tentar de novo" (new order) / "Voltar para a sacola".

### Navigation and state

- Needs a signed-in customer (→ Entrar and back) and the addresses from
  Entrega (`?entrega=&cobranca=`; missing → Entrega). Empty bag → the bag.
- Once placed, the order id joins the URL (`?pedido=`), so a reload shows
  the right screen (card form, processing, confirmed or failed).
- Retrying "Ir para o pagamento" for the same bag and addresses reuses the
  same order (idempotency key), never creating a duplicate.

## Decisions (resolved with the user, 2026-10-02)

1. Stripe CLI (OrderCore's `stripe` compose profile) runs locally so test
   payments confirm immediately through webhooks.
2. The processing screen follows the order by polling
   `GET /api/orders/{id}` (~2 s), not SignalR.

Derived: the card form is Stripe's Payment Element (OrderCore's
`stripe-provider` spec, decision 1 — card data never reaches OrderCore),
so `@stripe/stripe-js` + `@stripe/react-stripe-js` are added.

## Out of scope

Pix, installments, saved cards, coupons, shipping cost, order tracking
(Minha conta).

Backend gaps: `Docs/backend-pendencies/checkout/payment.md`.
