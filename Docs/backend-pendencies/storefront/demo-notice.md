# Backend pendencies — demonstration-store notice

Spec: `Docs/specs/storefront/demo-notice.md`.

## 1. Stripe mode is not exposed — Config

- **Mockup expects**: the notice to appear only while payments are in test
  mode.
- **Backend today**: `GET /api/payments/methods` returns the publishable key
  but not whether it is a test or live key
  (`Modules/Payments/Presentation/`); the key prefix (`pk_test_`) is the only
  hint.
- **Closing the gap**: a `testMode` flag on the payment methods response.
- **Workaround shipped**: the notice is a manual setting
  (`NEXT_PUBLIC_DEMO_STORE`, on by default). Turn it off together with the
  Stripe live keys.
- **Severity**: Config.
