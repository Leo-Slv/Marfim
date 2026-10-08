# Demonstration-store notice — implementation plan

Spec: `Docs/specs/storefront/demo-notice.md`.

- `src/lib/demo/demo-flag.ts` (+spec): `isDemoStore(value)` — on unless the
  value is `false`/`0`/`off`. `src/lib/env.ts` exposes `env.demoStore`.
- `src/lib/demo/demo-banner-store.ts`: dismissed flag in `sessionStorage`
  (`marfim.demo.dismissed`), read with `useSyncExternalStore` like the cart
  store; failures to read/write storage are swallowed.
- `src/components/demo-store-banner.tsx`: the band (renders nothing when the
  setting is off, while hydrating or once dismissed); mounted by
  `StoreHeader` above the mobile bar and the promise strip. Link to
  `appRoutes.content.page('perguntas-frequentes')` (checked against the
  content registry).
- `src/features/checkout/components/test-card-hint.tsx`: the test-card
  block, rendered by `payment-page.tsx` above `CardPaymentForm`.
- `.env.example`: documents the setting.
- Docs: README (Portuguese), `src/features/README.md`, CLAUDE.md.
