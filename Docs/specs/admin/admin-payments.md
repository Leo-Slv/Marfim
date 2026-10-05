# Admin · Pagamentos (`/admin/payments`)

Mockup: `Docs/design/mockups/AdminPagamentos.dc.html`.

## Why

Finance and support need to see every charge, why a card was refused,
refund customers (fully or partly) and, when something looks off, check the
payment against Stripe right away instead of waiting for the next webhook.

## What

- "CLIENTES E FINANÇAS · Pagamentos" with **one tab per status** (as in
  Pedidos): Todos, Aguardando, Em processamento, Autorizados, Capturados,
  Recusados, Estornados, Liberados — with counts.
- **Table** (newest first, paged): PAGAMENTO (method + when), PEDIDO
  (order number), VALOR, ESTORNADO (refunded so far, "—" when none),
  STATUS pill ("Estorno parcial" when a captured payment has refunds).
- **Panel** (beside on wide screens; replaces the list on narrow ones):
  Stripe reference, amount, status; "Pedido ORD-… (link to Pedidos) ·
  Cartão · when"; **Motivo da recusa** for the last decline (Stripe's code
  + pt-BR explanation);
  - **Conferir com o Stripe**: "Conferir agora" asks Stripe where the
    payment stands — "Status no Stripe igual ao da loja: capturado." or
    "Corrigido: estava X, agora Y.";
  - **Estorno · até R$ X** (captured payments with balance left): amount
    (or "Total"), reason (Pedido do cliente, Produto com defeito, Cobrança
    indevida, Outro) → **Estornar** with confirmation. Toast "Estorno
    enviado ao Stripe"; the refund shows as pending until Stripe confirms;
  - **Eventos**: created, authorized, refused (code), captured, released,
    disputed, each refund (amount + status), oldest first.
- Status tab, page and open payment in the URL (`?status=`, `?pagina=`,
  `?pagamento=`). Refreshes every 30 s.

## Decisions

No new questions — derived:

- One tab per status, the decision taken for Pedidos (the API filters one
  status at a time); the mockup's "Aprovados" and "Estornos" are split.
- OrderCore requires a refund reason; the mockup has none, so a short
  pt-BR list is offered.
- Stripe decline codes are shown with a pt-BR explanation (internal screen;
  the code helps support).
