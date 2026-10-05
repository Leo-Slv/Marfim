# Admin · Categorias (`/admin/categories`)

Mockup: `Docs/design/mockups/AdminCategorias.dc.html`.

## Why

Categories are the store's menu (Casa, Cozinha, Iluminação, Têxteis…) and
the listing's filters. The team needs to see them with how many products
each has, and to add new ones.

## What

- "CATÁLOGO · Categorias", with "A ordem aqui é a ordem do menu da loja."
- **Nova categoria**: name + the address it will get
  (`/products?categoria={slug}`, previewed while typing) → **Adicionar**.
  Empty name → red field; a name whose address already exists → "Já existe
  uma categoria com esse nome." Before creating, the screen says the new
  category goes straight into the store menu (OrderCore has no hidden
  categories). Toast "Categoria criada".
- **Table**: ORDEM (↑ ↓), NOME, ENDEREÇO, PRODUTOS (count, live), NO MENU
  (switch), actions **Renomear** and **Excluir**.
  - Order, rename, the menu switch and delete are **EM BREVE**: shown
    disabled, since OrderCore has no endpoint for them yet (backend
    pendencies). The switch shows every category as in the menu, which is
    what the store does today.
  - "Só é possível excluir categorias sem produtos…" stays as the rule
    for when deleting exists.
- Narrow screens: the table scrolls sideways; the form stacks.

## Decisions

Asked and answered (2026-10-05):

- Build the screen on what OrderCore supports today (list + create); the
  rest EM BREVE and recorded as backend pendencies.

Derived:

- The duplicate check compares addresses (slugs) — OrderCore keeps the slug
  unique but answers a duplicate with a server error.
- Product counts come from the admin product list per category
  (`CategoryId`, all statuses).
