# Deploy (Vercel) — security headers, CI and configuration

No mockup. Prerequisite for putting the demonstration store online
(Docs/specs/storefront/demo-notice.md).

## Why

Marfim must run on a public URL with real HTTPS, with Stripe's test mode
working in the browser, and every change must be checked automatically
before it ships. Today there is no CI, the security headers are the
framework defaults, and the environment variables are only listed in
`.env.example`.

## What

- **Hosting**: Vercel (Next.js, no custom server). One project, deployed
  from `main`; previews for other branches are optional.
- **API location is not decided yet**: the app reads it from two settings,
  `NEXT_PUBLIC_API_URL` (the browser) and `ORDERCORE_API_URL` (the server
  routes under `src/app/api/session/*`, optional — falls back to the
  public one). Changing the API's address must not need a code change.
- **Security headers on every response**: a Content-Security-Policy that
  allows only what the app uses (itself, the OrderCore origin, Stripe's
  script/frame/API hosts), plus HSTS, no MIME sniffing, no framing,
  a strict referrer policy and a locked-down permissions policy.
- **CI (GitHub Actions)** on every push to `main` and every pull request:
  install, typecheck, lint, test, build. A red CI blocks the merge.
- **Runbook** (`Docs/deploy/vercel.md`): the environment variables, the
  deploy steps, and what OrderCore must be configured with once the
  Marfim URL is known (CORS, e-mail links, Stripe webhook — step 8).

## Out of scope

- Docker image, health check route, SEO/robots (decided: not now).
- OrderCore's production configuration (step 8).
- Per-request nonces for the CSP (see decision 2).

## Decisions (asked and answered / taken)

1. Vercel; API address parametrised; GitHub Actions; CSP + security headers.
2. CSP without nonces: a nonce forces dynamic rendering of every page and
   gives up the static content pages and CDN caching, while the app still
   needs `'unsafe-inline'` for styles (Radix/motion set inline styles). So
   scripts keep `'unsafe-inline'` too. Revisit with nonces if the threat
   model changes.
