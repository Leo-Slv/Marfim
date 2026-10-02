# Admin · Entrar — implementation plan

Spec: `Docs/specs/admin/admin-login.md`.

## BFF (`src/lib/session/ordercore-server.ts`, `src/app/api/session/*`)

- `respondWithSession(upstream, { persistent, requireRole })`: parses the
  tokens; with `requireRole` and another role, signs that session out
  upstream (`/api/auth/sign-out` with its own tokens) and answers
  `403 not_admin` without touching the cookies. Persistent → cookie with the
  refresh token's expiry (as today); not persistent → session cookie, plus
  `marfim_persist=0` (same path, httpOnly) so renewals keep it a session
  cookie.
- `admin-sign-in/route.ts`: `{ email, password, keepSignedIn }` → OrderCore
  sign-in → `respondWithSession(…, { persistent: keepSignedIn, requireRole:
  'Admin' })`. Before replacing an existing cookie, signs the previous
  session out (best effort).
- `sign-in` / `sign-up`: persistent (unchanged behaviour). `refresh`:
  persistent unless `marfim_persist=0`. `sign-out` and a rejected refresh
  clear both cookies.

## Client session

- `session-client.ts`: `signInAdmin({ email, password, keepSignedIn })`.
- `src/lib/auth/use-require-admin.ts`: like `useRequireSession` —
  signed out (or expired) → `/admin/login?next=`; returns `{ session,
  forbidden }` (`forbidden` for a non-admin session).

## Feature `src/features/admin-auth/`

- `schemas/admin-login.schema.ts` — e-mail (valid), password (required),
  keepSignedIn.
- `lib/admin-login.ts` (+spec) — `adminLoginErrorCopy(error)` (credentials,
  inactive, 429 + lock seconds, offline, generic; `not_admin` handled as the
  denied step), `adminSafeNext(next)` (same-origin path under `/admin`, not
  `/admin/login`), `adminSection(path)` → preposition + name ("ao Dashboard", "a
  Pedidos"…; default "ao painel").
- `hooks/admin-auth.queries.ts` — `useAdminSignIn()`.
- `components/admin-login-page.tsx` — two-column layout, form / denied /
  welcome steps, shake per error (keyed), countdown (auth's `useCountdown`),
  expired notice (`wasSessionExpired()` after hydration), redirect when
  already an admin. Reuses auth's `TextField` / `FormAlert` look.
- `components/admin-brand-panel.tsx` — the dark illustration panel.
- `components/admin-gate.tsx` — `AdminGate` (Suspense + `useRequireAdmin`)
  for `/admin/*`; skeleton while reading, 403 state for a shopper.
- `components/admin-placeholder.tsx` — "Dashboard em breve" + Sair.

## Routes

- `src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`.
- `appRoutes.admin`: `index`, `login`, `loginThen(next)`.

## Styling

`globals.css`: `--animate-bar` (scaleX from the left).
