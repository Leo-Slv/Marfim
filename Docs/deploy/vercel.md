# Deploying Marfim on Vercel

Spec: `Docs/specs/infra/deploy.md`.

## 1. Project

1. Import the GitHub repo in Vercel (framework: Next.js, root: repo root).
2. Production branch: `main`. Build/install commands: the defaults.
3. Node.js version: 22.x (`engines` asks for >= 20.9).

## 2. Environment variables

| Variable | Scope | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Production, Preview | Public HTTPS origin of the OrderCore API (e.g. `https://api.example.com`). **Inlined at build time**: it feeds the browser calls and the CSP `connect-src`, so changing it needs a redeploy. |
| `ORDERCORE_API_URL` | optional | Address the Vercel server routes (`/api/session/*`) use to reach the API, when different from the public one. Falls back to `NEXT_PUBLIC_API_URL`. |
| `NEXT_PUBLIC_DEMO_STORE` | Production | `true` (default) while Stripe is in test mode; `false` to hide the demonstration banner and the test-card hint when going live. |

No secret lives in this app: the Stripe publishable key comes from the API
(`/api/payments/methods`) and the refresh token only exists in the
`marfim_refresh` httpOnly cookie, which is `Secure` in production (HTTPS is
automatic on Vercel).

## 3. Security headers

`next.config.ts` → `src/lib/security/security-headers.ts` sends a CSP
(self, the API origin, Stripe), HSTS, `nosniff`, `DENY` framing, a strict
referrer policy and a locked-down permissions policy on every response.
If a new third-party origin is added (analytics, fonts, images), add it to
that file and its spec, or the browser will block it.

## 4. What OrderCore needs once the Marfim URL is known (step 8)

OrderCore ships the server side in its repo (`Docs/operations/aws-demo.md`): one AWS
machine deployed by CI. Put the Vercel URL in its `storefront-url` SSM parameter and
deploy; set `NEXT_PUBLIC_API_URL` here to its `ApiUrl` output.

See `Docs/backend-pendencies/infra/deploy.md`: CORS for the Marfim origin,
`Identity:Links` pointing to `https://<marfim>/confirmar-email` and
`/redefinir-senha`, the Stripe webhook endpoint for the public API, and
forwarded headers behind the proxy.

## 5. Smoke test after deploying

1. Home loads with products (API reachable, CORS ok) and the demonstration
   banner shows.
2. Sign up / sign in; the e-mail link opens the deployed domain.
3. Cart → Entrega → Pagamento with `4242 4242 4242 4242`: the card form
   renders (CSP allows Stripe) and the order ends as paid.
4. `/admin/login` with an admin account.
5. Browser console: no `Content Security Policy` violations.
