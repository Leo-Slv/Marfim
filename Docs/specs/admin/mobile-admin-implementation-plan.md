# Admin on mobile — implementation plan

Spec: `Docs/specs/admin/mobile-admin.md`. Breakpoint `min-[980px]` as the
rest of the app; the desktop markup stays and the mobile one is added next
to it. One commit per screen, shell first.

## Shared (`src/features/admin-shell/`, `src/components/`)

- `admin-shell.tsx` — below 980 px a `AdminTopBar` (menu button with the
  attention dot, MARFIM · ADMIN + title, bell, initials) replaces the
  sidebar/tab row; `AdminMenu` is a Radix Dialog from the left (`animate-
  slide-in-left`) with the same groups, counters, the admin and Sair. The
  title comes from the nav item of the current path (`lib/admin-nav.ts`).
- `hooks/admin-shell.queries.ts` — already has the counters; the dot and
  the bell read them.
- `src/components/bottom-sheet.tsx` and `mobile-action-bar.tsx` (from the
  store screens) are reused: confirmations are sheets, editors' main
  actions go in the bar. Never inside an `animate-up` element.
- `src/lib/hooks/use-media-query.ts` — mounts the sheet only on mobile.

## Screens

- **Login** (`admin-auth`): the dark banner above the form.
- **Dashboard** (`admin-dashboard`): layout classes (2×2 KPIs, stacked
  cards, recent orders and low stock as cards).
- **Pedidos** (`admin-orders`): `StatusTabs` as scrolling chips,
  `OrdersTable` → cards below 980 px, the detail panel full width, the
  cancel confirm as a sheet.
- **Produtos** (`admin-products`): rows as in the mock, the editor's
  Publicar/Salvar in the fixed bar, Descontinuar as a sheet.
- **Categorias** (`admin-categories`): cards.
- **Estoque** (`admin-inventory`): tiles, chips, cards with the bar, the
  detail's tabs.
- **Clientes** (`admin-customers`): cards, the detail, deactivate sheet.
- **Pagamentos** (`admin-payments`): cards, the detail, refund sheet.
- **Auditoria** (`admin-audit`): expandable cards.
- **Mensagens com falha** (`admin-failed-messages`): cards, discard sheet.
