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
