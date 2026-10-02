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
  auth/          # access-token storage (client-side, localStorage)
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
mini-sacola and the Sacola screen), `home/` (the storefront home) and
`listing/` (category, search and promotions listing) — see
`src/features/README.md`. Screen state that defines what's shown (filters,
sort, page, search term) lives in the URL so it can be shared and survives
back/forward; components reading it with `useSearchParams` sit inside a
`Suspense` boundary. New features are added following the Implementation
Workflow below, one feature at a time.

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
(unknown slugs fall back to a default drawing).

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

- OrderCore authenticates with JWT bearer tokens (Identity module). Store the
  access token client-side via `src/lib/auth/access-token.ts` (localStorage);
  `apiFetch` sends it as `Authorization: Bearer <token>` automatically and
  uses `credentials: 'include'` by default.
- Refresh-token handling, route gating (customer vs admin) and the
  current-user endpoint are not wired yet — decide them when the
  `auth`/`account` feature is specced, against the live OrderCore contract.

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
  needs them is specced.
- **No branch-flow model**: this repo commits directly to `main`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
