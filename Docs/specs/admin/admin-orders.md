# Admin · Pedidos (`/admin/orders`)

Mockup: `Docs/design/mockups/AdminPedidos.dc.html` (list + detail panel,
fulfilment actions, cancellation, internal notes, toasts).

## Why

The team's daily work: see which orders need attention, move each one
through fulfilment (prepare → ship → deliver), cancel when needed and leave
notes for each other — without leaving the panel.

## What

- **List** ("OPERAÇÃO · Pedidos"): newest first, 20 per page — number,
  customer + date, units, total, status pill; the open order is
  highlighted. Empty filter → "Nenhum pedido neste filtro."
- **Status tabs** with live counts: Todos, A preparar (confirmed), Em
  preparo, Enviados, Entregues, Aguardando pagamento, Cancelados, Pagamento
  não aprovado.
- **Search by customer**: typing a name or e-mail suggests customers; picking
  one filters the list to their orders (shown as a removable chip). Typing an
  order number (ORD-…) says number search is coming (EM BREVE).
- **Detail panel** (beside the list on wide screens; on narrow screens it
  replaces the list, with "← Pedidos"): number + status, customer · date ·
  payment method and status, a warning when the card authorization is
  about to expire;
  - **Próxima ação** by status — Confirmado: **Iniciar preparo** ("Depois
    disso o cliente não consegue mais cancelar sozinho."); Em preparo:
    carrier + tracking code (required) + tracking link (optional, http/https)
    → **Marcar como enviado** (captures the payment; the customer gets the
    e-mail); Enviado: carrier · code (+ link) → **Marcar como entregue**;
    otherwise a status note (concluded, cancelled with what happened to the
    payment, payment refused, waiting for payment);
  - **Cancelar pedido** (waiting payment, confirmed, in preparation) with
    inline confirmation "Cancelar e estornar o pagamento? O estoque reservado
    é liberado.";
  - **Itens** (drawing, quantity, name, line total) and total;
  - **Entrega**: the shipping address (needed to ship; not in the mockup);
  - **Linha do tempo** from the order's events across modules (created,
    payment, confirmation, preparation, shipping, delivery, cancellation,
    stock), in pt-BR, stock movements grouped;
  - **Notas internas · só a equipe vê**: list of notes with author and time,
    "Escrever nota" + Salvar, characters left.
- Toast after each action ("Preparo iniciado", "Marcado como enviado. O
  cliente recebe o e-mail.", "Pedido entregue", "Pedido cancelado…", "Nota
  salva"); backend errors inline (capture refused, payment in progress, the
  order changed meanwhile).
- Everything in the URL: `?status=`, `?cliente=`, `?pagina=`, `?pedido=`;
  the dashboard's links and the side menu lead here. Refreshes every 30 s.

## Decisions

Asked and answered (2026-10-02):

- Internal notes: a list kept on top of OrderCore's single notes text —
  each save appends an entry in a fixed format; text in any other format
  shows as one note.
- Search: by customer (customer search → orders of that customer); number
  search EM BREVE.
- One tab per status instead of the mockup's combined "Cancelados e falhas".

Derived:

- Shipping requires carrier and code (the mockup's rule; OrderCore accepts
  neither or both).
- The cancellation reason sent to OrderCore is fixed and internal; the
  backend's English reasons are never shown.
