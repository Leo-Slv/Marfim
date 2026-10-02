# Account access — implementation plan

Spec: `Docs/specs/auth/access.md`.

## OrderCore endpoints (`/api/auth/*`)

| Endpoint | Auth | Success | Error codes used |
| --- | --- | --- | --- |
| `POST sign-up` `{name,email,password}` | — | 201 tokens | `email_already_registered` (409), `weak_password`, `validation_error` (400), `too_many_requests` (429) |
| `POST sign-in` `{email,password}` | — | 200 tokens | `invalid_credentials` (401), `account_inactive` (400), 429 |
| `POST refresh` `{refreshToken}` | — | 200 tokens (rotated) | `invalid_refresh_token` (401), 429 |
| `POST sign-out` `{refreshToken}` | Bearer | 204 | — |
| `POST password/forgot` `{email}` | — | 202 (always) | 429 |
| `POST password/reset` `{token,newPassword}` | — | 204 (all sessions end) | `invalid_or_expired_token`, `weak_password` (400), 429 |
| `POST email/confirm` `{token}` | — | 204 | `invalid_or_expired_token` (400), 429 |
| `POST email/confirmation` | Bearer (customer) | 202 | `email_already_confirmed` (409), 429 |

Tokens = `{ userId, role, customerId, accessToken, accessTokenExpiresAt,
refreshToken, refreshTokenExpiresAt }`; the JWT carries `email`,
`email_confirmed`, `role`, `customer_id`.

## BFF — `src/app/api/session/*` (Route Handlers)

- `sign-in`, `sign-up` — forward the body to OrderCore; on success set the
  `marfim_refresh` cookie (httpOnly, SameSite=Lax, `Secure` in production,
  `Path=/api/session`, expires with the refresh token) and return the tokens
  **without** `refreshToken`.
- `refresh` — reads the cookie, calls `auth/refresh`, rotates the cookie;
  on 401 clears it.
- `sign-out` — calls `auth/sign-out` with the caller's bearer + cookie
  (best effort) and always clears the cookie.
- Errors are passed through (status, ProblemDetails body, `Retry-After`).
  The shopper's address goes in `X-Forwarded-For` (pendency #1).
- `src/lib/session/ordercore-server.ts` — server-only fetch helper +
  cookie helpers (`ORDERCORE_API_URL`, default `NEXT_PUBLIC_API_URL`).

## Client session — `src/lib/auth`

- `session-store.ts` — external store (same pattern as the cart) persisted in
  localStorage `marfim.auth.session`: access token, expiry, and claims
  decoded from the JWT (`jwt-claims.ts`). Cross-tab via `storage` events.
  Replaces `access-token.ts`.
- `session-client.ts` — `signIn`, `signUp`, `refreshSession` (single
  in-flight promise), `signOut`, `clearSession`, `getValidAccessToken`
  (refreshes when < 30 s left).
- `use-session.ts` — `useSyncExternalStore` hook.
- `api-client.ts` — uses `getValidAccessToken`; on a 401 with a session,
  refreshes once and retries; reads `Retry-After` into
  `ApiError.retryAfterSeconds` when exposed.

## Feature — `src/features/auth`

- `api/` — `forgot-password`, `reset-password`, `confirm-email`,
  `request-email-confirmation` (OrderCore direct); sign-in/up via
  the session client.
- `schemas/` — Zod form schemas: sign-in, sign-up (password policy + terms),
  forgot, reset (match).
- `lib/password-strength.ts` (rules + score, tested), `auth-messages.ts`
  (code → copy, tested), `safe-next.ts` (only same-origin paths, tested),
  `use-countdown.ts`.
- `components/` — `auth-layout.tsx` (side panel), `auth-heading.tsx`,
  `form-field.tsx`, `password-input.tsx`, `password-strength-meter.tsx`,
  `form-alert.tsx` (shake), `status-icon.tsx` (pop + drawn check),
  `sign-in-page.tsx`, `sign-up-page.tsx`, `confirm-email-page.tsx`,
  `forgot-password-page.tsx`, `reset-password-page.tsx`.
- `hooks/auth.mutations.ts` — TanStack mutations.

## Shared

- `store-header.tsx` — "Minha conta" when signed in; confirm-e-mail banner
  with resend.
- `app-routes.ts` — `auth.register`, `auth.forgotPassword`,
  `auth.confirmEmail`, `auth.resetPassword`, `account.index`.
- `globals.css` — `shake`, `fly`, `pop-in`, short check-draw.

## Tests

Specs for the JWT claim decoding, password strength, message mapping,
`safe-next`, form schemas; then test/typecheck/lint/build and a browser pass
of every flow against the running API, reading the confirmation and reset
e-mails in Mailpit (`http://localhost:8025`).
