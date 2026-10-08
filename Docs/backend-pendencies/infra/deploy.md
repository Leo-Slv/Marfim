# Backend pendencies — deploy

Spec: `Docs/specs/infra/deploy.md`. All of these are OrderCore
configuration (step 8), not code, and wait for the Marfim URL.

## 1. CORS allows only the Marfim origin — Config

- **Marfim expects**: the browser calls the API directly (`apiFetch`), so
  the API must answer CORS for `https://<marfim-domain>`.
- **Backend today**: the allowed origins come from OrderCore's CORS
  configuration (`Program.cs` / `appsettings`), set for localhost.
- **Closing the gap**: add the production origin to the allowed list.
- **Workaround shipped**: none; documented in `Docs/deploy/vercel.md`.
- **Severity**: Blocking for the deployed store.

## 2. E-mail links point to localhost — Config

- **Marfim expects**: `/confirmar-email?token=` and `/redefinir-senha?token=`
  on the public domain.
- **Backend today**: `Identity:Links` config.
- **Closing the gap**: set the production base URL.
- **Workaround shipped**: none.
- **Severity**: Config.

## 3. Stripe webhook endpoint for the public API — Config

- **Marfim expects**: card outcomes reach the API without the Stripe CLI.
- **Backend today**: the local stack uses the `stripe-cli` container.
- **Closing the gap**: register the public API URL as a webhook endpoint in
  the Stripe dashboard (test mode) and set its signing secret.
- **Workaround shipped**: reconciliation (up to ~15 min).
- **Severity**: Feature gap.

## 4. Forwarded headers / HTTPS behind the proxy — Config

- **Backend today**: see step 8 (ForwardedHeaders).
- **Severity**: Config.
