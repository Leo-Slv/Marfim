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
| Storefront cart (`/cart`) | [storefront/cart.md](storefront/cart.md) | No available quantity on stock issues, quote lines lack brand/category/compare-at, no shipping, coupons, gift wrap, Pix/installments, recommendations or lead time |
