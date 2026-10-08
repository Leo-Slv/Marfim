# Project Architecture

Marfim is the web frontend (storefront + admin panel) for
[OrderCore](https://github.com/Leo-Slv/OrderCore), an order-processing
e-commerce backend. This repo only renders UI and talks to the OrderCore API
over HTTP/JSON — it is not the authority for auth, pricing, stock or
authorization; the backend is.

The architecture and conventions below are copied from Plataforma VDG
(`c:\Users\leonardo.silva\source\repos\plataforma-vdg`), itself based on the
frontend of
https://github.com/ErrorSquad-ABP/ABP3-Sistema-Gestao-Leads/tree/main/front,
adapted where the real OrderCore API contract differs (see "Deliberate
deviations from the reference project" at the end of this file). Before
introducing a new pattern, check how equivalent functionality is handled
elsewhere in this codebase or in Plataforma VDG, and prefer the established
convention over inventing a new one.

## Stack

- Next.js 16 (App Router, `src` dir, Turbopack for dev)
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui (`radix` base, `lyra` preset — see `components.json`)
- TanStack Query for server state
- React Hook Form + Zod for forms and validation
- `motion` for animations (wrapped in `MotionConfig reducedMotion="user"`)
- Prettier + `prettier-plugin-tailwindcss`, ESLint (`eslint-config-next`)

There is no global client-state library (Redux/Zustand/etc.). Server state
goes through TanStack Query; keep local UI state in component state. The one
piece of cross-tree client state, the cart (header count ↔ product cards), is
a tiny localStorage-backed external store read with React's
`useSyncExternalStore` (`src/features/cart/lib/cart-store.ts`,
`hooks/use-cart.ts`) — follow that pattern before reaching for a library.
The cart lives on the client by OrderCore's design; the API only re-prices
it (`POST /api/orders/cart/quote`).

## Folder structure

```text
src/app/         # Routes (App Router). Stay thin: import and render feature
                 # components/hooks instead of implementing business logic inline.
src/components/
  ui/            # shadcn/ui primitives (generated via `npx shadcn add <name>`)
  ...            # cross-feature shared composites (store-header, store-footer,
                 # eyebrow, coming-soon-badge)
src/features/    # One folder per business feature — see src/features/README.md
src/lib/
  http/          # apiFetch client + ApiError (adapted to OrderCore's ProblemDetails)
  auth/          # client session: access-token store, JWT claims, BFF client
  session/       # server-only BFF helpers (refresh-token cookie)
  hooks/         # cross-feature hooks (useIsHydrated)
  query/         # QueryClient + provider
  routes/        # app-routes.ts — centralized route path constants
  constants/     # query-keys.ts — centralized React Query key registry
  theme/         # next-themes + MotionConfig provider
  env.ts         # runtime env access
Docs/
  specs/               # <domain>/<feature>.md + <feature>-implementation-plan.md
  backend-pendencies/  # gaps between the mockups and what OrderCore supports
  design/mockups/      # exported Claude Design screens (see "Design mockups")
```

### Feature slice shape

Each feature under `src/features/<feature>/` follows:

```text
api/         # HTTP calls (thin wrappers over apiFetch)
components/  # Feature UI (colocated *.spec.ts tests)
hooks/       # React Query hooks (<feature>.queries.ts)
lib/         # Feature-specific helpers/formatters
model/       # TypeScript types for the feature's domain
schemas/     # Zod schemas for API responses and form validation
```

Current features: `catalog/` (products, categories, `ProductCard`,
`ListingProductCard`, `ProductArt`), `cart/` (client-side cart store,
mini-sacola and the Sacola screen), `home/` (the storefront home),
`listing/` (category, search and promotions listing), `product/` (the
product page), `content/` (institutional, help and legal pages; static
copy written for a demonstration store), `auth/` (sign
in/up, e-mail confirmation, password recovery), `checkout/` (Entrega
and Pagamento with Stripe), `account/` (Minha conta), `errors/` (error
states), `admin-auth/` (admin sign-in + gate), `admin-shell/` (admin
frame: AdminNav with live counters), `admin-dashboard/`, `admin-orders/`
(Pedidos: list + detail panel, fulfilment actions, internal notes) and
`admin-products/` (Produtos: list + editor, price, variants, publish) and
`admin-categories/` (Categorias: list + create; the rest EM BREVE) and
`admin-inventory/` (Estoque: levels, receive/adjust/reorder point, reservations,
movements), `admin-customers/` (Clientes: list, panel, deactivate) and
`admin-payments/` (Pagamentos: list, Stripe check, refunds), `admin-audit/`
(Auditoria: read-only log) and `admin-failed-messages/` (Mensagens com
falha: replay/discard) — see
`src/features/README.md`. Screen state that defines what's shown (filters,
sort, page, search term) lives in the URL so it can be shared and survives
back/forward; components reading it with `useSearchParams` sit inside a
`Suspense` boundary. New features are added following the Implementation
Workflow below, one feature at a time.

Below 980 px the storefront header is the mobile bar (`MobileTopo.dc.html`:
menu, search, bag); inner screens pass `StoreHeader mobileBack={{ href,
title? }}` for its Voltar variant, as the mobile mockups show. Store search
runs in the front over the catalog (`useCatalog`, `searchProducts`) because
OrderCore only matches names.

The other store screens have a mobile layout of their own below 980 px
(`Docs/specs/storefront/mobile-screens.md`): desktop markup stays and the
mobile one is added next to it with `min-[980px]` classes. The main action
of Produto, Sacola, Entrega and Pagamento is a fixed bar
(`MobileActionBar`, `components/mobile-action-bar.tsx`) — never put it
inside an element with `animate-up` (its end state keeps a `transform`,
which traps `position: fixed`; use `animate-fade-in` there). Side panels
become bottom sheets (`BottomSheet`), and those screens pass
`StoreFooter hideOnMobile` (the others get the compact footer).

The admin panel has its mobile layout too (`Docs/specs/admin/mobile-admin.md`): below
980 px `AdminMobileBar` (bar + side menu) replaces the sidebar, lists show cards next to
the desktop table, detail panels take the whole screen, destructive confirms become
`BottomSheet`s gated by `useMediaQuery` and the product editor has a fixed save bar
(same `animate-up` caveat).

Marfim ships as a demonstration store: `DemoStoreBanner` (in `StoreHeader`) and the
checkout `TestCardHint` explain the Stripe test mode and are switched by
`NEXT_PUBLIC_DEMO_STORE` (`env.demoStore`, on unless `false`) — turn it off when
going live (`Docs/specs/storefront/demo-notice.md`).

Error screens come from `src/features/errors`: unknown routes hit
`src/app/not-found.tsx`, render errors `error.tsx`; when the query a page
is about fails without data, render `QueryErrorState` (404/403/429/sem
conexão/500 by error) instead of an ad-hoc notice — secondary sections keep
inline errors. Queries don't retry 4xx (`src/lib/query/query-client.ts`).

Features the mockups show but OrderCore doesn't support yet (shipping,
coupons, gift wrap, Pix, installments, newsletter…) are rendered disabled
and muted with `ComingSoonBadge` ("EM BREVE"), never faked. Note that
`animate-up` ends at `opacity: 1`, so put it on a wrapper when the element
itself is muted with an opacity class.

### Product imagery

Product photos are deliberately **not** stored in OrderCore. Products are
drawn with the mockups' inline-SVG illustrations (`Art.dc.html`): drawing
kind, background tint and editorial tag are mapped by product slug in
`src/features/catalog/lib/product-visuals.ts` and rendered by
`components/product-art.tsx`. A new product only needs an entry there
(unknown slugs fall back to a default drawing). The admin product editor
shows that drawing as the product's "image" and flags products without
one (`hasProductVisual`).

## Backend / API contract

The OrderCore backend lives in a sibling repo on this machine:
`c:\Users\leonardo.silva\Documents\GitHub\OrderCore`
(GitHub: https://github.com/Leo-Slv/OrderCore). It is a modular monolith with
the modules Catalog, Customers, Identity, Inventory, Orders, Payments,
Notifications, Messaging and AuditLogs.

- **Always check the API first.** Before working on (or verifying) any
  screen, check that the API answers at `http://localhost:8080/`. If it
  doesn't, start it with Docker from the OrderCore repo
  (`docker compose up -d --build`; start Docker Desktop first if the daemon
  is down). The compose stack seeds the local database with real catalog
  data, so screens are built against the live API — never against mocked
  responses.
- **Payments are Stripe (test mode)** when OrderCore's `.env` has the Stripe
  keys (it does locally). Card authorizations reach the API by Stripe
  webhook, so for checkout work also run the Stripe CLI:
  `docker compose --profile stripe up -d stripe-cli` in the OrderCore repo
  (without it, outcomes only arrive via reconciliation, up to ~15 min).
  Test with Stripe's published test cards (4242 4242 4242 4242 approves,
  4000 0000 0000 0002 declines, 4000 0025 0000 3155 asks for 3-D Secure).
  Card data is only ever typed into Stripe's Payment Element — never build
  card inputs in this app.
- **Routes are prefixed with `/api`** (`ApiRoutePrefixConvention` in the
  backend): e.g. `GET /api/catalog/products`.
- **Live contract**: with the API running in Development, read the OpenAPI
  spec at `http://localhost:8080/openapi/v1.json` or browse the Scalar UI at
  `http://localhost:8080/scalar`. This is the source of truth — it's
  generated straight from the actual controllers/DTOs. (`dotnet run` outside
  Docker serves the same API at `https://localhost:23346`.)
- **Offline fallback**: when the API isn't running, read the backend's
  `README.md`, `Docs/` (ADRs, specs, api) and the controllers/`Responses`
  under `Modules/<Module>/Presentation/` directly (Claude Code can read files
  outside this repo's working directory by absolute path).

### Response shape

- **Success**: the raw DTO directly in the response body. Lists are paged as
  `PagedResponse<T>` (`{ items, page, pageSize, totalItems, totalPages }`).
  `204 No Content` for actions with no body.
- **Error**: RFC 7807 `ProblemDetails` (`application/problem+json`), written by
  `Shared/Presentation/ExceptionHandling/ApiExceptionHandler.cs` and
  `ProblemDetailsDefaults.cs` in the backend:
  ```json
  {
    "type": "...",
    "title": "Business rule violated.",
    "status": 400,
    "detail": "...",
    "instance": "/api/catalog/products",
    "code": "validation_error"
  }
  ```
  Every error carries a stable `code` extension (`validation_error`,
  `unauthenticated`, `forbidden`, `not_found`, `concurrency_conflict`,
  `internal_error`, or a domain-specific code) — branch on `code`, never on
  the `detail` text. Model-validation 400s may also carry an `errors`
  dictionary (field → messages).

This is already implemented in `src/lib/http/api-client.ts` and
`src/lib/http/api-error.ts` (`ApiError.code`, `ApiError.fieldErrors`) — do not
reintroduce a `{ success, data, errors }` envelope when adding new API calls.

### Auth

OrderCore authenticates with JWT bearer tokens (Identity module, routes
`/api/auth/*`): a 15-minute access token and a 14-day rotating refresh
token, both returned in the JSON body. Decided in
`Docs/specs/auth/access.md`:

- **BFF for the refresh token.** Sign-in, sign-up, refresh and sign-out go
  through the app's own Route Handlers, `src/app/api/session/*`
  (`src/lib/session/ordercore-server.ts`, `server-only`). They store the
  refresh token in the httpOnly cookie `marfim_refresh`
  (`Path=/api/session`) and hand the page the tokens **without** it. Page
  JavaScript never sees the refresh token — don't add code that does.
- **Access token on the client**: `src/lib/auth/session-store.ts` keeps it in
  localStorage (`marfim.auth.session`) as an external store (same pattern as
  the cart; `useSession()`), with claims decoded by `jwt-claims.ts` for the
  UI only (`email`, `role`, `email_confirmed`, `customer_id`).
- **Renewal is automatic**: `apiFetch` asks `getValidAccessToken()`
  (renews when < 30 s are left) and, on a 401 with a session, refreshes once
  and retries. Refreshes are single-flight (the refresh token rotates); a
  rejected refresh (401) clears the session.
- Other `auth/*` calls (forgot/reset password, confirm e-mail, resend
  confirmation) go straight from the browser with `apiFetch` — except
  `password/change`, which needs the refresh token of the session to keep
  and therefore goes through `/api/session/change-password`.
- **Never show OrderCore's free-text fields as shopper copy** without
  checking: operational texts like an order's status `reason` are English
  and internal; map to pt-BR copy instead.
- The backend's e-mails link to `/confirmar-email?token=` and
  `/redefinir-senha?token=` (OrderCore's `Identity:Links` config) — those
  two routes keep their pt-BR paths.
- **Screens that need a signed-in shopper** call `useRequireSession()`
  (`src/lib/auth/use-require-session.ts`, inside `Suspense`): once the
  session is read, a signed-out visitor goes to Entrar and comes back to the
  same URL — unless the session expired (the backend refused to renew
  it): then `expired` is true and the screen renders the "Sessão
  expirada" state. It's UX only — the backend authorizes every call.
- **Admin panel** (`/admin/*`, `Docs/specs/admin/admin-login.md`): admins
  sign in at `/admin/login` through `/api/session/admin-sign-in`, which
  only lets the `Admin` role through (a non-admin's new session is signed
  out at once → `403 not_admin`) and ends the session it replaces on this
  browser. "Manter conectado" off makes `marfim_refresh` a session cookie
  (`marfim_persist=0` keeps it so on renewals). Every admin screen sits
  inside `AdminGate` (`useRequireAdmin()`): signed out or expired →
  `/admin/login?next=` (which shows "Sua sessão terminou" from the expired
  flag), a shopper → the 403 state, an expired token renewed on arrival.
  One session per browser, shared with the storefront.
- **Admin screens** live in the route group `src/app/admin/(panel)/`, whose
  layout wraps them in `AdminGate` + `AdminShell` (`/admin/login` stays
  outside). Sections not built yet are muted with EM BREVE in
  `src/features/admin-shell/lib/admin-nav.ts` (`href: null`) — a new admin
  screen sets its `href` there (and dashboard links pointing to it swap
  `SoonLink` for `PanelLink`). Admin figures refresh by polling (30 s);
  after an admin action, invalidate `queryKeys.admin.ordersRoot`, the menu
  counters and the dashboard keys.

## Implementation Workflow

One feature at a time:

1. **Spec (WHAT/WHY only)** at `Docs/specs/<domain>/<feature>.md` — no
   implementation detail.
2. **Resolve open decisions explicitly.** If something can't be inferred from
   the existing code, this CLAUDE.md, or the reference project, list the
   questions and ask before proceeding — don't assume silently.
3. **Backend pendencies.** While speccing, record every mockup requirement
   the OrderCore backend doesn't actually support today (missing field,
   missing endpoint, a rule that rules out what the mockup assumes, etc.) in
   `Docs/backend-pendencies/<domain>/<feature>.md` — mirrors the spec's own
   path. State per pendency: what the mockup expects, what the backend has
   today (with source evidence — file/class names), what closing the gap
   would need, the workaround shipped instead, and a severity (Blocking /
   Feature gap / Cosmetic / Config). Add the new screen to the index at
   `Docs/backend-pendencies/README.md`.
4. **Implementation plan (HOW)** at
   `Docs/specs/<domain>/<feature>-implementation-plan.md`.
5. **Implement.**
6. **Tests.** Fix/add tests until `npm run test`, `npm run typecheck`, and
   `npm run lint` all pass.
7. **Docs.** Update `README.md` (and this file, if the architecture changed)
   to reflect the new feature.
8. **Commit.** Conventional Commits, in English, separated by context
   (several small commits, never one giant commit). Never add a
   `Co-Authored-By: Claude` trailer — commits are attributed to the user
   only. Never push to the remote without an explicit request.

The user writes in Portuguese in conversation; specs, plans, commit messages,
and code comments stay in English. UI copy is pt-BR.

## Design mockups

Screens are designed in Claude Design (canvas "Marfim",
https://claude.ai/artifact/Y8Yn6CqwWhDkrRoBLVdYJe) and delivered here as the
exported, self-contained package under `Docs/design/mockups/` — durable,
works offline, versioned with the code. Open `Docs/design/mockups/index.html`
for the index of every screen (`LEIA-ME.txt` explains how to serve it if a
browser blocks `file://`). Each `*.dc.html` is one screen (with its
animations and interactions); `support.js` is the runtime that mounts them.
Shared pieces: `Header`, `Footer`, `Art`, `AdminNav`, `Email`, `MobileTopo`.
`Paleta.dc.html` and `Componentes.dc.html` are the source for the design
tokens in `src/app/globals.css` (Outfit + JetBrains Mono, ground `#F4F3EF`,
ink `#18181B`, primary `#3B3FD9`, accent `#E8793A`).

Screen groups: store (Main, Listagem, Produto, Carrinho, Entrega, Pagamento),
account (Acesso, Conta), institutional/content (Conteudo, Erro), mobile
(Mobile*), transactional e-mails (Email*), and admin (Admin*: Dashboard,
Pedidos, Produtos, Categorias, Estoque, Clientes, Pagamentos, Falhas,
Auditoria, Login). Text in `[BRACKETS]` is a placeholder for real store data.
Reference the relevant mockup(s) from each feature's spec. Don't edit the
exported files by hand — re-export from the canvas and replace them.

## Deliberate deviations from the reference project

- **HTTP client / error shape**: adapted to OrderCore's RFC 7807
  ProblemDetails instead of Plataforma VDG's CourseCore error body — see
  "Backend / API contract" above.
- **Light theme by default**: the Marfim mockups are light-only, so
  `ThemeProvider` defaults to `light` and `globals.css` has no `.dark`
  palette yet.
- **Reduced starter dependency set**: Turnstile and `lucide-react` from
  Plataforma VDG were not installed (no feature needs them; icons are
  Phosphor, per `components.json`). Add dependencies when the feature that
  needs them is specced (`server-only` came with the session BFF).
- **Session via BFF**: Plataforma VDG keeps the access token in
  localStorage and relies on a backend-set refresh cookie; OrderCore returns
  the refresh token in the body, so this app stores it in its own httpOnly
  cookie through `src/app/api/session/*` — see "Auth" above.
- **No branch-flow model**: this repo commits directly to `main`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
