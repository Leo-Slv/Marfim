# Admin · Auditoria (`/admin/audit`)

Mockup: `Docs/design/mockups/AdminAuditoria.dc.html`.

## Why

Who did what, when, to which record — for support ("did someone cancel
this order?"), security (password resets, refresh-token reuse) and money
(refunds, captures). Read only: the log can't be edited or erased.

## What

- "SISTEMA · Auditoria", entity tabs — Todos, Pedido, Produto, Estoque,
  Cliente, Pagamento, Conta — and a search field.
- **Table** (newest first, paged): QUANDO ("05 OUT · 09:12"), QUEM (dot by
  kind — indigo admin, green customer, grey system — and the name: "Você"
  for the signed-in admin, the customer's name, "Administrador",
  "Sistema"), AÇÃO (pt-BR: "Iniciou o preparo", "Estornou pagamento"…),
  ENTIDADE pill, ID (short; full on hover), chevron. A row expands to
  **Detalhes** — the record's data in pt-BR labels (new price, reason,
  quantity…), "Sem detalhes registrados." when empty — and links to open
  the record in its admin screen (pedido, produto, cliente, pagamento,
  estoque do produto) and "Ver tudo deste usuário".
- **Search**: a full ID (entity or user) filters the log by it; plain text
  says text search is coming (EM BREVE).
- "REGISTRO SOMENTE LEITURA · NÃO PODE SER EDITADO NEM APAGADO".
- Tab, search, page and the user filter in the URL (`?entidade=`, `?id=`,
  `?usuario=`, `?pagina=`).

## Decisions

No new questions — derived from what OrderCore records:

- The mockup's ANTES / DEPOIS becomes **Detalhes**: OrderCore keeps the
  event's data (`metadata`), not a before/after diff.
- "Quem" is resolved from `userId`: null → Sistema; the signed-in admin →
  Você; others through their `UserAccountCreated` record (role, customer)
  → the customer's name or "Administrador".
- No Categoria tab: OrderCore doesn't audit categories.
- Operational values (English reasons, codes) are shown as recorded — this
  is an internal log, not shopper copy.
