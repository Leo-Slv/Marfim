# Backend pendencies — Error states

Spec: `Docs/specs/storefront/error-states.md`. Mockup:
`Docs/design/mockups/Erro.dc.html`.

## 1. `Retry-After` not readable by the browser

- **Mockup expects**: the 429 countdown starts at the server's wait time.
- **Backend today**: `RateLimitingExtensions.OnRejectedAsync` sets
  `Retry-After`, but the storefront CORS policy
  (`Shared/Presentation/Cors/CorsExtensions.cs`) only exposes `Location` and
  `traceparent`, so a cross-origin `fetch` can't read it. Same gap as auth
  pendency "Retry-After not exposed by CORS".
- **To close**: add `Retry-After` to `WithExposedHeaders`, or put the
  seconds in the ProblemDetails (e.g. a `retryAfter` extension).
- **Workaround**: countdown of 30 s (the mockup's default) when unknown.
- **Severity**: Config.

## 2. Rate limits only on auth and checkout writes

- **Mockup expects**: a full-page "Vamos com calma" for a throttled device.
- **Backend today**: only `AuthController` (sign-up/in, refresh, password
  and confirmation e-mails), `OrdersController.Checkout` and the Stripe
  webhook have `[EnableRateLimiting]`; every GET is unthrottled. The forms
  that can be throttled already show their own inline lock (Acesso,
  Pagamento).
- **To close**: nothing required — if read endpoints get limits, the full
  page is already wired to the page's main query.
- **Workaround**: the full-page 429 appears for a throttled main query or a
  thrown 429; forms keep the inline lock.
- **Severity**: Cosmetic.

## 3. Expired vs revoked session look the same

- **Mockup expects**: "Por segurança, sua sessão terminou."
- **Backend today**: `POST /api/auth/refresh` answers `401
  unauthenticated` for an expired, revoked (password change, sign-out
  elsewhere) or reused refresh token — no reason code.
- **To close**: distinct codes (`refresh_token_expired`,
  `refresh_token_revoked`) if the copy should differ.
- **Workaround**: one message covering all of them (the mockup's copy
  already does).
- **Severity**: Cosmetic.

## 4. No trace code for errors outside the API

- **Mockup expects**: every 500 shows a code for the support team.
- **Backend today**: `TraceResponseExtensions.Customize` adds `traceId` to
  every ProblemDetails — but a failure that never reached the API (network,
  a rendering bug in the storefront) has none, and the storefront has no
  error-reporting service of its own.
- **To close**: a frontend error tracker (Sentry/OpenTelemetry web) whose
  event id could be shown instead.
- **Workaround**: Next's `digest` for server render errors; the code box is
  hidden when there's nothing to look up.
- **Severity**: Feature gap.
