# Features

Each business feature lives in its own folder here, following a fixed internal
shape:

```text
src/features/<feature>/
├── api/         # HTTP calls to the OrderCore API (thin wrappers over apiFetch)
├── components/  # Feature-specific UI (colocated *.spec.ts tests)
├── hooks/       # React Query hooks (<feature>.queries.ts)
├── lib/         # Feature-specific helpers/formatters
├── model/       # TypeScript types for the feature's domain
└── schemas/     # Zod schemas used to validate API responses and forms
```

`src/app/**` stays thin: routes import and render feature components instead
of implementing business logic inline. `src/components/**` only holds
cross-feature UI (shadcn/ui primitives in `ui/`, shared composites elsewhere).

- `catalog/` — maps to the backend's Catalog module. Currently only the
  scaffold example: `GET /catalog/products` (public, paged) validated by
  `schemas/product.schema.ts`, exposed through `useProducts`, and rendered
  as a grid of `ProductCard` on `/`. Replace it with the specced home and
  listing screens (`Docs/design/mockups/Main.dc.html`,
  `Listagem.dc.html`).

Each new feature is added following the workflow in the root `CLAUDE.md`
(spec → resolve open decisions → backend pendencies → implementation plan →
implement → tests → docs → commit). A feature only gets the subfolders it
actually needs — skip `api/`/`hooks/`/`schemas/` if it makes no HTTP calls.
