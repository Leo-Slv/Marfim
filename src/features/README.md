# Features

Each business feature lives in its own folder here, following a fixed internal
shape:

```text
src/features/<feature>/
├── api/         # HTTP calls to the OrderCore API (thin wrappers over apiFetch)
├── components/  # Feature-specific UI (colocated *.spec.ts tests)
├── hooks/       # React Query hooks (<feature>.queries.ts)
├── lib/         # Feature-specific helpers/formatters
├── model/       # TypeScript types for the feature's domain
└── schemas/     # Zod schemas used to validate API responses and forms
```

`src/app/**` stays thin: routes import and render feature components instead
of implementing business logic inline. `src/components/**` only holds
cross-feature UI (shadcn/ui primitives in `ui/`, shared composites elsewhere).

- `catalog/` — maps to the backend's Catalog module: products
  (`GET /api/catalog/products`, `…/by-slug/{slug}`) and categories
  (`GET /api/catalog/categories`), all public. Owns the reusable
  `ProductCard` and `ProductArt` (the mockups' SVG drawings — product photos
  aren't stored in the backend; `lib/product-visuals.ts` maps slug →
  drawing, tint and editorial tag), plus price helpers.
- `cart/` — the client-side cart (OrderCore keeps the cart on the client and
  only re-prices it). A localStorage-backed external store read through
  `useSyncExternalStore` (`useCart`: add, set quantity 1–9, remove,
  reprice); no state library. Owns the Sacola `/cart`
  (`Docs/specs/storefront/cart.md`) and the mini-sacola panel.
  `useCartQuote` re-prices the bag with `POST /api/orders/cart/quote`
  (debounced, keyed by the bag's lines); `lib/cart-view.ts` joins bag +
  quote + catalog (the quote has no brand/category/compare-at) into what
  the screen renders and decides whether checkout is allowed. Components
  that read the bag on first paint use `useIsHydrated` to avoid flashing
  the empty state before localStorage is read.
- `home/` — the storefront home `/` (`Docs/specs/storefront/home.md`):
  hero, "Escolhidos da semana" grid filtered by `?categoria=` (wrapped in
  `Suspense` because of `useSearchParams`), promo countdown, ateliers and
  shipping label. Atelier details are editorial (`lib/ateliers.ts`, keyed
  by product `brand`); each atelier's product list is live.

- `account/` — Minha conta (`Docs/specs/account/account.md`), one route per
  section under `src/app/account/*` sharing `AccountLayout` (greeting, side
  menu, Sair; gated with `useRequireSession`). Orders: `GET
  /api/orders/me` + one `GET /api/orders/{id}` per listed order for the
  thumbnails (the list has no items — useQueries, page of 10); the detail
  polls while the order is still moving and builds the timeline from
  `status-history` (`lib/order-timeline.ts`: always shows the current
  status, never the backend's raw English `reason`). Addresses reuse
  checkout's API/form (`AddressFormCard` edits too, via `addressToForm`).
  The password change goes through the BFF
  (`/api/session/change-password`) so the cookie's session is the one kept.
  Order lines have no slug, so drawings come from `slugify(productName)`
  (catalog).
- `admin-audit/` — `/admin/audit` (`Docs/specs/admin/admin-audit.md`):
  `GET /api/audit-logs` by entity tab, a full ID (entity, then user) and
  a user filter; actions and metadata in pt-BR (`lib/audit.ts`), actors
  resolved from `userId` (Você / Sistema / the customer's name through
  their `UserAccountCreated` record / Administrador), expandable rows with
  the details and links to the record's admin screen. Read only.
- `admin-auth/` — the admin panel's door (`Docs/specs/admin/admin-login.md`):
  `/admin/login` (AdminLogin.dc.html — form, "Sem acesso ao painel",
  "Bem-vindo de volta", the "sessão terminou" notice, "Manter conectado")
  through the BFF's `admin-sign-in`; `AdminGate` for every `/admin/*`
  screen (`useRequireAdmin` in `src/lib/auth`). `lib/admin-login.ts` maps errors, keeps
  `?next=` inside the panel and names the section to go back to.
- `admin-shell/` — the admin frame (AdminNav.dc.html) for every screen in
  `src/app/admin/(panel)`: side menu (top bar on narrow screens) with live
  counters — confirmed orders, stock alerts, pending failed messages —
  the admin's e-mail and Sair. Unbuilt sections: `href: null` → muted +
  EM BREVE.
- `admin-categories/` — `/admin/categories`
  (`Docs/specs/admin/admin-categories.md`): catalog's category list with a
  product count per category (admin product list, `CategoryId`) and the
  new-category form (address preview, duplicate check by slug, warning that
  it enters the store menu at once). Reorder, rename, menu visibility and
  delete are EM BREVE — OrderCore has no endpoints for them yet.
- `admin-customers/` — `/admin/customers` (`Docs/specs/admin/admin-customers.md`):
  customer list with name/e-mail search, orders and total spent per row
  (each customer's orders; paid statuses as in the dashboard), and the
  panel — data, addresses, recent orders (links to Pedidos, "Ver todos"
  filters Pedidos by the customer) and deactivate/reactivate. E-mail
  confirmation is EM BREVE (it lives in Identity).
- `admin-dashboard/` — `/admin` (`Docs/specs/admin/admin-dashboard.md`):
  `GET /api/admin/dashboard` for the period and the previous one (KPIs,
  funnel, recent orders), "Receita por dia" summed per São Paulo day from
  `GET /api/admin/orders` (all pages of the period), the preparation queue
  and the low-stock list from the admin product list (`Stock=`). Period in
  `?periodo=` (7 / 30); everything polls every 30 s ("Ao vivo").
- `admin-inventory/` — `/admin/inventory` (`Docs/specs/admin/admin-inventory.md`):
  stock levels from the admin product list (`Stock=` filter; the inventory
  list has no names), tiles from one 100-row call, the level bar and state
  by OrderCore's rule (low = at or below the reorder point,
  `lib/stock.ts`), and the panel: receive, adjust with a reason, reorder
  point, active reservations (with order numbers) and movements (infinite,
  pt-BR labels). Filter, page and open product live in the URL.
- `admin-orders/` — `/admin/orders` (`Docs/specs/admin/admin-orders.md`):
  list (`GET /api/admin/orders`, one tab per status with counts from
  `PageSize=1` calls, customer search via `GET /api/customers` →
  `CustomerId`) and the detail panel (`GET /api/admin/orders/{id}` +
  `/timeline`): start preparing, ship (captures the payment; carrier +
  code required), deliver, cancel, and internal notes kept as a list on top
  of OrderCore's single notes text (`lib/internal-notes.ts`). Status, customer,
  page and open order live in the URL; on narrow screens the detail replaces
  the list.
- `admin-payments/` — `/admin/payments` (`Docs/specs/admin/admin-payments.md`):
  `GET /api/payments` with one tab per status (counts by `PageSize=1`),
  order numbers fetched per row, and the panel: Stripe reference, decline
  reason (Stripe code + pt-BR), "Conferir agora" (`/reconcile`), refunds
  of captured payments (amount up to the balance, reason, confirmation;
  Stripe completes them by webhook) and the events built from the
  payment's timestamps and refunds.
- `admin-products/` — `/admin/products` (`Docs/specs/admin/admin-products.md`):
  list with name/SKU search (`GET /api/admin/catalog/products`), new draft
  (name, SKU, category, price) and the editor. Salvar runs
  `lib/product-form.ts`'s `savePlan` — details, then price and "de" price
  in an order OrderCore accepts, then new variants (SKU generated) — and
  reports the step that failed. Publish (drafts), discontinue, remove
  variant. The "image" is the store's drawing (`ProductArtPreview`).
  Search, page and open product live in the URL.
- `auth/` — maps to OrderCore's Identity module: the Acesso screens
  (`Docs/specs/auth/access.md`) — `/login`, `/register`,
  `/forgot-password`, `/confirmar-email` and `/redefinir-senha` (the last
  two are where the backend's e-mails link to). Forms use React Hook Form +
  Zod (`schemas/auth-forms.schema.ts`, password rules mirroring OrderCore's
  `PasswordPolicy`); backend error codes map to the mockup's copy in
  `lib/auth-messages.ts`; `?next=` is sanitized by `lib/safe-next.ts`. The
  session itself (BFF, store, renewal) lives in `src/lib/auth` and
  `src/lib/session` since every feature uses it. E-mail confirmation runs as
  a query keyed by the link's token so it fires once even under React's
  double mount in development.
- `checkout/` — the checkout steps after the bag. Currently Entrega
  (`/checkout/delivery`, `Docs/specs/checkout/delivery.md`): the customer's
  addresses (`/api/customers/me/addresses`, query keyed by user id), the
  new-address form (Zod rules mirror OrderCore's `Address.Create` plus an
  8-digit CEP; blank label → "Endereço N", country `BR`) and the "Seu
  pedido" summary (reuses cart's quote + `buildCartView`). The selection is
  derived (pick → `?entrega=`/`?cobranca=` → default → first) instead of
  synced in effects, and travels to the payment step in the URL. Gated with
  `useRequireSession` (`src/lib/auth`).
  And Pagamento (`/checkout/payment`, `Docs/specs/checkout/payment.md`):
  `POST /api/orders/checkout` creates the order (stock reserved) and returns
  Stripe's client secret; the card is confirmed in Stripe's Payment Element
  (`card-payment-form.tsx`, `@stripe/react-stripe-js`) and the page polls
  `GET /api/orders/{id}` until Confirmed / PaymentFailed. The screen is
  derived from the order (`lib/order-stage.ts`); `?pedido=` makes reloads
  land on the right screen. The idempotency key lives per tab in
  sessionStorage keyed by bag + addresses + total
  (`lib/checkout-attempt.ts`): a reload replays the same order (and gets its
  client secret back) instead of creating another; "Tentar de novo" starts a
  new key. With Stripe the payment is `Processing` from checkout on, so
  "card already sent" comes from this tab or from Stripe's PaymentIntent
  status, never from OrderCore's payment status.
- `errors/` — the error states of Erro.dc.html
  (`Docs/specs/storefront/error-states.md`): `ErrorState` (404, 403, 500
  with the trace code, sem conexão, 429 countdown, sessão expirada),
  `ErrorPage` (store chrome around it) and `QueryErrorState` for a page's
  main query; `lib/error-kind.ts` maps an error to its state. Used by
  `src/app/not-found.tsx`, `error.tsx` and `global-error.tsx`, the order
  detail, the payment step's `?pedido=` and the session gates
  (`useRequireSession().expired`).
- `listing/` — the product listing (`Docs/specs/storefront/listing.md`),
  one screen in three modes routed by `src/app/products`, `search` and
  `promotions`. Everything that defines the result set lives in the URL
  (`categoria`, `q`, `ordem`, `pagina`; `lib/listing-url.ts` builds hrefs
  and resets the page on any other change), read inside `Suspense`. Uses
  catalog's `ListingProductCard` and cart's `AddedToCartDrawer`
  (mini-sacola, a Radix Dialog).

`src/components/store-header.tsx` and `store-footer.tsx` are the
storefront chrome shared by every store page.

Each new feature is added following the workflow in the root `CLAUDE.md`
(spec → resolve open decisions → backend pendencies → implementation plan →
implement → tests → docs → commit). A feature only gets the subfolders it
actually needs — skip `api/`/`hooks/`/`schemas/` if it makes no HTTP calls.
