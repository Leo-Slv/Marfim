# Deploy — implementation plan

Spec: `Docs/specs/infra/deploy.md`.

- `src/lib/security/security-headers.ts` (+spec): pure `buildCsp({ apiUrl,
  isDev })` and `securityHeaders({ apiUrl, isDev })` returning the header
  list. The API origin is taken from `NEXT_PUBLIC_API_URL` (also used by the
  browser, so the CSP and the client always agree). Dev adds `'unsafe-eval'`
  and omits `upgrade-insecure-requests`/HSTS.
- `next.config.ts`: `headers()` applies them to `/(.*)`. Relative import
  (the config cannot use the `@/` alias).
- `package.json`: `engines.node >= 20.9` (Next 16).
- `.github/workflows/ci.yml`: Node 22, `npm ci`, typecheck, lint, test,
  build with a placeholder `NEXT_PUBLIC_API_URL`; the build must not need
  the API (verified locally with the API address unreachable).
- `.env.example`: `ORDERCORE_API_URL`.
- `Docs/deploy/vercel.md`: runbook.
- README (Portuguese "Deploy" section), CLAUDE.md note.
