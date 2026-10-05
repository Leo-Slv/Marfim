# Backend pendencies

Gaps between what the Marfim mockups (`Docs/design/mockups/`) expect and what
the OrderCore API supports today. One file per screen, at
`Docs/backend-pendencies/<domain>/<feature>.md`, mirroring the spec's path in
`Docs/specs/`.

Each pendency states: what the mockup expects, what the backend has today
(with source evidence — file/class names), what closing the gap would need,
the workaround shipped instead, and a severity (Blocking / Feature gap /
Cosmetic / Config).

## Index

| Screen | File | Pendencies |
| --- | --- | --- |
| Storefront home (`/`) | [storefront/home.md](storefront/home.md) | Product imagery, merchandising tags, curated selection, wishlist, atelier details, free shipping/installments, promotion campaign, newsletter, store contact data |
| Storefront listing (`/products`, `/search`, `/promotions`) | [storefront/listing.md](storefront/listing.md) | Name-only accent-sensitive search, no "new" flag, no brand filter, no editorial sort |
| Account access (`/login`, `/register`, `/forgot-password`, `/confirmar-email`, `/redefinir-senha`) | [auth/access.md](auth/access.md) | Rate limits behind the BFF (config), `Retry-After` not exposed by CORS, no name in the session |
| Checkout · Entrega (`/checkout/delivery`) | [checkout/delivery.md](checkout/delivery.md) | No shipping options/cost, label/neighborhood/country required, first address not default, no CEP/UF validation |
| Checkout · Pagamento (`/checkout/payment`) | [checkout/payment.md](checkout/payment.md) | No Pix with Stripe, no card last4, stock/price conflicts without item detail, Stripe CLI needed locally |
| Minha conta (`/account/*`) | [account/account.md](account/account.md) | Order list without items (N+1), single name field, no phone validation, generic timeline notes, no card last4 |
| Error states (404, 403, 500, sem conexão, 429, sessão expirada) | [storefront/error-states.md](storefront/error-states.md) | `Retry-After` not exposed by CORS, only auth/checkout throttled, expired vs revoked session indistinct, no trace code outside the API |
| Admin · Entrar (`/admin/login`) | [admin/admin-login.md](admin/admin-login.md) | No admin-only sign-in (BFF checks the role and signs out), "Manter conectado" can't shorten the refresh token, no public panel summary, recovery lands on the storefront |
| Admin · Dashboard (`/admin`) | [admin/admin-dashboard.md](admin/admin-dashboard.md) | No daily revenue series (summed from the order list), no daily goal, no previous-period comparison, "+24 h" from creation, low stock without product data, admins without a name |
| Admin · Pedidos (`/admin/orders`) | [admin/admin-orders.md](admin/admin-orders.md) | No search (customer search instead), one status per filter, tab counts one call each, internal notes as one text, no card last4, thin timeline details |
| Admin · Produtos (`/admin/products`) | [admin/admin-products.md](admin/admin-products.md) | Slug and category not editable, no reactivation after discontinuing, variants not renamable, images by URL only (drawings instead), save split into several calls |
| Admin · Categorias (`/admin/categories`) | [admin/admin-categories.md](admin/admin-categories.md) | No rename/reorder/visibility/delete endpoints, new categories go straight to the menu, duplicates answer 500, no product count |
| Admin · Estoque (`/admin/inventory`) | [admin/admin-inventory.md](admin/admin-inventory.md) | Stock list without product data, no available-units total, reservations without order number/expiry, reorder-point changes not recorded, movements without the order |
| Storefront cart (`/cart`) | [storefront/cart.md](storefront/cart.md) | No available quantity on stock issues, quote lines lack brand/category/compare-at, no shipping, coupons, gift wrap, Pix/installments, recommendations or lead time |
