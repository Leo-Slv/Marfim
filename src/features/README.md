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
