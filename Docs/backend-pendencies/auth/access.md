# Backend pendencies — Account access (Acesso)

Spec: `Docs/specs/auth/access.md`. Mockup:
`Docs/design/mockups/Acesso.dc.html`.

## 1. Rate limits see the BFF, not the shopper

- **Mockup expects**: "Muitas tentativas" to throttle one person.
- **Backend today**: `IdentityRateLimits` partitions per client address;
  `ForwardedHeadersExtensions` honours `X-Forwarded-For` only from loopback
  or `ForwardedHeaders:KnownProxies/KnownNetworks`. The storefront's BFF
  (`/api/session/*`) calls OrderCore server-side and forwards the shopper's
  address in `X-Forwarded-For`, but with the API in Docker the BFF isn't
  loopback, so every shopper shares the BFF's quota (10 sign-ins/min, 5
  sign-ups/h).
- **To close**: list the storefront server's address/network under
  `ForwardedHeaders` in each environment.
- **Workaround**: none needed locally; must be configured before deploy.
- **Severity**: Config.

## 2. `Retry-After` isn't readable from the browser

- **Mockup expects**: "você poderá pedir outro link em {N}s".
- **Backend today**: 429s carry `Retry-After`, but the CORS policy exposes
  only `Location` and `traceparent` (`Access-Control-Expose-Headers`), so
  calls made straight from the browser (e.g. `POST auth/email/confirmation`)
  can't read it. Calls through the BFF can.
- **To close**: add `Retry-After` to the exposed headers
  (`CorsExtensions.AddStorefrontCors`).
- **Workaround**: a 60 s countdown when the header isn't readable.
- **Severity**: Cosmetic.

## 3. No name in the session

- **Mockup expects**: nothing on these screens, but the logged-in header
  and Minha conta greet the shopper.
- **Backend today**: the JWT carries `sub`, `email`, `role`,
  `email_confirmed`, `customer_id` — no name; `AuthTokensResponse` neither.
- **To close**: a `name` claim, or read it from `GET customers/me` (exists).
- **Workaround**: the header shows "Minha conta"; the name is fetched when
  Minha conta is built.
- **Severity**: Cosmetic.
