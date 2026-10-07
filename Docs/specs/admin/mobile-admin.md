# Admin panel on mobile

Mockups (390 px wide), in `Docs/design/mockups/`: `MobileAdminTopo`,
`MobileAdminLogin`, `MobileAdminDashboard`, `MobileAdminPedidos`,
`MobileAdminProdutos`, `MobileAdminCategorias`, `MobileAdminEstoque`,
`MobileAdminClientes`, `MobileAdminPagamentos`, `MobileAdminAuditoria` and
`MobileAdminFalhas`. The desktop screens are in the other `admin-*` specs.

## Why

Below 980 px the panel only squeezes its desktop layout: a scrolling row of
menu tabs, tables that scroll sideways, side panels and inline confirms.
The shop team uses the panel from a phone for the things that can't wait —
starting an order, replaying a failed message, checking a payment — so each
screen gets the mobile mockup's layout: a top bar with a menu, cards
instead of tables, one thing on screen at a time, and the main action in
reach of the thumb.

## What (below 980 px; desktop unchanged)

### Shared

- **Top bar** (60 px): menu button (an orange dot when something needs
  attention: low stock or failed messages), "MARFIM · ADMIN" over the
  screen's title, a bell with the number of orders to prepare (→ Pedidos),
  and the admin's initials.
- **Menu** (side panel from the left): the same groups and counters as the
  desktop menu (OPERAÇÃO, CLIENTES E FINANÇAS, SISTEMA), the signed-in
  admin and **Sair**. Closes on the overlay, Esc, the close button or a link.
- **List screens**: search field, a row of scrolling filter chips with
  counts, and cards instead of table rows (tap → the detail).
- **Detail**: replaces the list (the URL still holds the open item), with a
  "‹ back" link; status as a pill; blocks as cards.
- **Confirmations** (cancel order, discontinue, deactivate customer, refund,
  discard message, delete category) are bottom sheets with the consequence
  and a primary and a "Voltar/Manter" button; **toasts** confirm actions.
- Screens with a long form keep the main actions in a fixed bottom bar.

### Entrar (`/admin/login`)

- A dark banner (logo + ADMIN, "Pedidos, peças e ateliês num só painel.")
  above the form; same form, errors and states as the desktop login.

### Dashboard

- Date, greeting and the period selector; KPIs in 2×2; the revenue chart
  (tap a bar for its value); orders by stage; recent orders and low stock
  as cards.

### Pedidos

- Search by customer, status chips with counts, order cards (number,
  status, customer, date · units, total). Detail: the next step (Iniciar
  preparo / Marcar como enviado with its form / Marcar como entregue),
  items and total, history, internal notes, Cancelar pedido (sheet).

### Produtos

- Search + "+ Novo", status chips, product rows (drawing, name, category ·
  price, status). Editor: information, price (with the "na loja" preview),
  variants, images (the drawing — no upload), Descontinuar (sheet); a
  fixed bar with Publicar and Salvar, and an "Alterações não salvas" strip.

### Categorias

- "Nova categoria" form and one card per category. Renaming, reordering,
  visibility and deleting stay EM BREVE (OrderCore has no endpoints).

### Estoque

- Three tiles (to restock, out, units — the ones the desktop has), filter
  chips, cards with quantity and the reorder-point bar; detail with the
  Receber / Ajustar / Ponto de reposição tabs, reservations and movements.

### Clientes

- Search, status chips, customer cards; detail with data, addresses, recent
  orders and Desativar/Reativar (sheet).

### Pagamentos

- Status chips and payment cards; detail with "Conferir com o Stripe", the
  refund form (sheet to confirm) and the events.

### Auditoria

- Search, entity chips, cards that expand to the details of the entry;
  read-only notice.

### Mensagens com falha

- Intro, one card per message with Reprocessar / Descartar (sheet) and an
  expandable technical block, "Fila limpa" when empty.

## Decisions

All derived — nothing needed asking:

- What the mockups show and OrderCore can't serve stays as the desktop
  screens already decided (EM BREVE or left out): category rename /
  reorder / visibility / delete, audit before/after, bulk replay, stack
  traces, card last four, daily goal, image upload (see
  `Docs/backend-pendencies/admin/mobile-admin.md`).
- The login banner carries no numbers: there is no public summary of the
  panel (admin-login pendency #3).
- The bell counts what the menu already counts as "a preparar".
- Both layouts of a screen stay in the DOM and CSS picks one; confirmation
  sheets mount only on mobile (`useMediaQuery`), like the account screens.
