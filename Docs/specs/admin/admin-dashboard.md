# Admin · Dashboard (`/admin`)

Mockups: `Docs/design/mockups/AdminDashboard.dc.html` (screen) and
`Docs/design/mockups/AdminNav.dc.html` (the admin side menu, shared by every
admin screen).

## Why

The first thing the store's team sees after signing in: how the store is
doing in the period, what needs attention now (orders to prepare, stock
below the reorder point) and the latest orders — without opening each
section.

## What

- **Admin frame** (every `/admin/*` screen except the sign-in): the side
  menu of AdminNav — marfim. + ADMIN; OPERAÇÃO (Dashboard, Pedidos,
  Produtos, Categorias, Estoque), CLIENTES E FINANÇAS (Clientes,
  Pagamentos), SISTEMA (Auditoria, Mensagens com falha); live counters on
  Pedidos (confirmed orders waiting to be prepared), Estoque (products low
  or out of stock) and Mensagens com falha (pending failed messages); the
  signed-in admin (initials, e-mail, "Administrador") and **Sair**.
  Sections not built yet are shown muted with **EM BREVE** and lead
  nowhere; each new admin screen turns its item on. On narrow screens the
  menu becomes a top bar.
- **Header**: "VISÃO GERAL · Dashboard", **Ao vivo** (the numbers refresh
  every 30 s) and the period switch **7 dias / 30 dias** (in the URL,
  `?periodo=7`; 30 by default). Days are São Paulo days, today included.
- **KPIs**:
  - **Receita no período** — confirmed revenue (confirmed, in preparation,
    shipped, delivered) with the change vs the previous period of the same
    length;
  - **Pedidos pagos** — orders created in the period that are in those
    statuses, with the difference vs the previous period;
  - **Ticket médio** — revenue ÷ paid orders, with the change;
  - **A preparar agora** — confirmed orders waiting to be prepared (now,
    not per period), with how many have waited more than 24 h ("em dia"
    when none), and a warning when card authorizations are about to expire.
- **Receita por dia**: line + area chart of the period, hover shows the day
  and the amount; dates on the axis (4 for 30 days, every day for 7). No
  daily goal (decided — there's none in the backend).
- **Pedidos por etapa**: orders created in the period by stage —
  Aguardando pagamento, Confirmado, Em preparo, Enviado, Entregue — as
  bars; "N pedidos esperam preparo" (EM BREVE until Pedidos exists).
- **Últimos pedidos**: the five most recent orders — number, customer,
  total, status pill, how long ago; "Ver todos" EM BREVE.
- **Abaixo do ponto de reposição**: count + the products out of stock or
  below their reorder level (name, SKU, available / reorder level, out of
  stock first); "Registrar recebimento" EM BREVE; "Tudo acima do ponto de
  reposição" when empty.
- Each block has its own loading skeleton and an inline error with
  "Tentar de novo".

## Decisions

Asked and answered (2026-10-02):

- "Receita por dia" is summed from the period's orders
  (`GET /api/admin/orders`), by day of creation; the KPI total stays the
  backend's exact figure.
- No daily goal line.
- Admin sections not built yet: muted + EM BREVE, counters already live.

Derived:

- "Ao vivo" is polling (30 s), as in the payment step — no SignalR.
- Comparisons use a second dashboard call for the previous period.
- The admin's display name is the e-mail: admins have no name in OrderCore.
