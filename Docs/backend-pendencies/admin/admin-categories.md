# Backend pendencies — Admin · Categorias

Spec: `Docs/specs/admin/admin-categories.md`. Mockup:
`Docs/design/mockups/AdminCategorias.dc.html`.

## 1. No rename, reorder or menu visibility endpoints

- **Mockup expects**: Renomear, ↑ ↓ (menu order) and a "No menu" switch.
- **Backend today**: `Category` has `Rename`, `ChangeDisplayOrder`,
  `Activate`/`Deactivate`, but `CategoriesController` only exposes
  `GET /api/catalog/categories` and `POST /api/catalog/categories`; the
  public list (`EfCategoryRepository.ListAsync`) returns every category,
  active or not, ordered by `DisplayOrder`.
- **To close**: `PUT /categories/{id}` (name → new slug), `PUT
  /categories/order` (ids in order), `POST /categories/{id}/activate|
  deactivate`; the public list should hide inactive ones and the admin one
  show them.
- **Workaround**: controls shown disabled with EM BREVE.
- **Severity**: Feature gap.

## 2. No delete

- **Mockup expects**: Excluir (only without products).
- **Backend today**: no delete on `Category`.
- **To close**: `DELETE /categories/{id}` refusing categories with products.
- **Workaround**: EM BREVE.
- **Severity**: Feature gap.

## 3. New categories go straight into the store menu

- **Mockup expects**: "Categoria criada (fora do menu)".
- **Backend today**: no hidden state is honoured by the public list, so a
  new (empty) category shows in the header and footer menus at once.
- **To close**: create inactive + pendency #1.
- **Workaround**: the form warns before creating.
- **Severity**: Feature gap.

## 4. Duplicate names answer a server error

- **Mockup expects**: "Já existe uma categoria com esse nome."
- **Backend today**: `CreateCategoryUseCase` doesn't check the slug; the
  unique index on `Slug` (`CategoryConfiguration`) rejects it at the
  database, which surfaces as a 500.
- **To close**: a `category_slug_already_exists` 409, like products'
  `slug_already_exists`.
- **Workaround**: the screen compares the new slug with the loaded ones
  before sending.
- **Severity**: Cosmetic.

## 5. No product count

- **Mockup expects**: PRODUTOS per category.
- **Backend today**: `CategoryResponse` = id, name, slug.
- **To close**: a `productCount` on an admin category list.
- **Workaround**: `GET /api/admin/catalog/products?CategoryId=…&PageSize=1`
  per category (`totalItems`).
- **Severity**: Cosmetic.
