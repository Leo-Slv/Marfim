# Admin · Clientes (`/admin/customers`)

Mockup: `Docs/design/mockups/AdminClientes.dc.html`.

## Why

Support and the team need to find a shopper, see who they are (contact,
addresses, what they bought) and, when needed, block or restore their
account.

## What

- "CLIENTES E FINANÇAS · Clientes" with search by name or e-mail.
- **Table** (paged): initials, name, e-mail; PEDIDOS (count); TOTAL GASTO
  (paid orders: confirmed, in preparation, shipped, delivered — the
  dashboard's rule); E-MAIL (confirmed or not — EM BREVE, see pendencies);
  CONTA pill (Ativa / Desativada). The open customer is highlighted.
- **Panel** (beside on wide screens; replaces the list on narrow ones, with
  "← Clientes"): initials, name, e-mail; Pedidos / Total gasto / Cliente
  desde; **Dados** (telefone); **Endereços** (label, default shipping/
  billing tags, address line) or "Nenhum endereço salvo."; **Pedidos
  recentes** (number, total, status pill — each opens the order in
  Pedidos) with "Ver todos os pedidos" (Pedidos filtered by the customer)
  or "Ainda não comprou."; and the account box:
  - active → "Desativar conta" — "A pessoa não consegue mais entrar nem
    comprar. Pedidos e histórico continuam guardados." → confirm →
    toast "Conta desativada";
  - deactivated → "Conta desativada" — "Ao reativar, a pessoa volta a
    entrar com a mesma senha." → confirm → "Conta reativada".
- Search, page and open customer in the URL (`?q=`, `?pagina=`,
  `?cliente=`).

## Decisions

No new questions — derived:

- E-mail confirmation isn't on OrderCore's customer (it's Identity's): the
  column and the panel line say EM BREVE.
- Totals and counts come from each customer's orders (`GET
  /api/orders/customers/{id}`), the same statuses the dashboard counts as
  revenue.
