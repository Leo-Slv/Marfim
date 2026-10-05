# Admin · Categorias — implementation plan

Spec: `Docs/specs/admin/admin-categories.md`.

## Feature `src/features/admin-categories/`

- `api/admin-categories.ts` — `createCategory(name)`,
  `countCategoryProducts(categoryId)` (admin product list, `PageSize=1`).
  The list itself reuses catalog's `getCategories`.
- `lib/category-form.ts` (+spec) — `categorySlug(name)` (catalog's
  `slugify`, the same rule as OrderCore's `Slug.GenerateFrom`),
  `findDuplicate(name, categories)`, form schema (name 1–100), error copy.
- `hooks/admin-categories.queries.ts` — `useCategoryCounts(categories)`
  (one query, all counts), `useCreateCategory()` (refreshes catalog's
  categories — the store menu — and the counts).
- `components/categories-page.tsx` — header, new-category form with the
  address preview and the menu warning, the table with EM BREVE controls,
  the rule note.

## Wiring

- `src/app/admin/(panel)/categories/page.tsx`; `appRoutes.admin.categories`;
  AdminNav `categories` gets its `href`.
- `queryKeys.admin.categoryCounts(ids)`.
