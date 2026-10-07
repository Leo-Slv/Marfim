# Institucional e ajuda — implementation plan

Spec: `Docs/specs/content/content-pages.md`.

## Route

`src/app/content/[slug]/page.tsx` — server component: `generateStaticParams`
from the page registry with `dynamicParams = false` (any other slug → the
app's `not-found.tsx`), `generateMetadata` for the title, renders
`ContentPage`.

## Feature `src/features/content/`

- `model/content.ts` — `ContentSlug`, page/group/FAQ/section types.
- `lib/content-pages.ts` — registry of the 11 pages (slug, label, group),
  `contentGroups`, `isContentSlug`, `getContentPage`.
- `lib/content-copy.ts` — all pt-BR copy (demo-honest, decisions 1–2):
  principles, criteria and steps, FAQ entries, the model-B pages (Prazos,
  Cuidados, Privacidade, Termos), lookbook scenes (drawings + product
  slugs), atelier stories (drawing + text by atelier name).
- `lib/filter-faqs.ts` (+spec) — category + accent-insensitive term.
- `lib/catalog-pieces.ts` (+spec) — pieces of an atelier (catalog products
  by `brand`) and lookbook tags kept only when the slug is in the catalog.
- `components/content-page.tsx` — layout: `StoreHeader`, `ContentNav`
  (desktop sticky index / mobile chips, `aria-current`), the page body by
  slug, `HelpCard`, `StoreFooter`.
- `components/content-sections.tsx` — model-B body (eyebrow, title, intro,
  EM BREVE note; desktop "Nesta página" index + sections, mobile open
  `<details>`).
- `components/pages/*` — `story-page`, `ateliers-page` (client, catalog
  query), `sell-page`, `lookbook-page` (client, catalog query),
  `faq-page` (client, search state), `returns-page`, `tracking-page`.

The catalog is read with `useProducts({ page: 1, pageSize: 100 })`
(OrderCore's maximum), which the storefront already filters to published
products.

## Elsewhere

- `src/components/store-footer.tsx` — slugs from the registry, Rastrear
  pedido → `/content/rastrear`, Instagram muted with EM BREVE, demo copy
  instead of the atendimento / CNPJ brackets.
- Sign-up and payment review already link to `termos` / `privacidade`,
  which keep their slugs.
