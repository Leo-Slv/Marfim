# Error states — implementation plan

Spec: `Docs/specs/storefront/error-states.md`.

## Feature slice `src/features/errors/`

- `lib/error-kind.ts` (+spec) — `errorKindOf(error)`: `ApiError` 404 /
  `not_found` → `not-found`, 403 / `forbidden` → `forbidden`, 429 →
  `rate-limited`, 401 → `session-expired`, 408 or a 503 without a code
  (what `apiFetch` throws when the API can't be reached) → `offline`,
  anything else → `server`. `errorTraceCode(error)` → `ApiError.traceId`,
  else Next's `digest`, else null.
- `lib/session-destination.ts` (+spec) — path → "Meus pedidos", "Meus
  dados", "Endereços", "Trocar senha", "a entrega", "o pagamento"; default
  "a página em que você estava".
- `components/error-state.tsx` — `ErrorState({ kind, traceCode,
  retryAfterSeconds, onRetry })`, one block per kind, transcribed from
  Erro.dc.html. 429 countdown in its own component (interval in an effect,
  keyed by the caller to restart); copy button with 2 s "Copiado".
  `SessionExpired` reads the current URL (`usePathname` +
  `useSearchParams`, callers already sit inside `Suspense`) for `next=`.
- `components/query-error-state.tsx` — `QueryErrorState({ error, onRetry })`
  maps an error to `ErrorState` (used by the page-defining queries).
- `components/error-page.tsx` — `ErrorPage` = `StoreHeader` + state +
  `StoreFooter`.

## Routes

- `src/app/not-found.tsx` — `ErrorPage kind="not-found"` + metadata title.
- `src/app/error.tsx` — client; `errorKindOf(error)`, `retry()` after
  `useQueryErrorResetBoundary().reset()`.
- `src/app/global-error.tsx` — own `<html>/<body>`, imports `globals.css`
  and the fonts; minimal wordmark + 500 state.

## Session expiry

- `session-store.ts`: `setSessionAccessToken(null, { expired: true })`
  remembers the expiry in sessionStorage (`marfim.auth.expired`, per tab,
  survives reload); any new session or a plain sign-out clears it;
  `wasSessionExpired()` reads it.
- `session-client.ts`: a refresh rejected with 401 ends the session as
  expired.
- `useRequireSession()` now returns `{ session, expired }` and doesn't
  redirect when `expired`; Minha conta, Entrega and Pagamento render the
  session-expired state instead.

## Page-defining queries

- `order-detail-section.tsx` → `QueryErrorState` instead of the "não
  encontramos" notice.
- `payment-page.tsx` (`?pedido=`) → `QueryErrorState`.

## Styling

`globals.css`: `--animate-float-tilt` (floaty with rotation, 6 s) and
`--animate-wobble` (±4°, origin top). Existing `animate-up`,
`animate-spin-slow`.
