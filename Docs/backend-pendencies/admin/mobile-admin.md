# Backend pendencies — Admin on mobile

Spec: `Docs/specs/admin/mobile-admin.md`. Mockups: `MobileAdmin*.dc.html`.

The mobile mockups show the same data as the desktop ones, so they add no
new requirement on OrderCore. What they assume and it doesn't have is
already recorded with the desktop screen it belongs to:

| Mobile mockup shows | Recorded in |
| --- | --- |
| Login banner with live numbers (Confirmados, Em preparo, Meta do dia) | `admin-login.md` #3 |
| Daily revenue goal | `admin-dashboard.md` #2 |
| Greeting with the admin's name, "[NOME DO ADMIN]" in the menu | `admin-dashboard.md` #6 |
| Orders: internal notes as separate entries with author | `admin-orders.md` #4 |
| Payment detail "Cartão final ····" | `admin-payments.md` #2 |
| Payments: the order number and the Stripe reference on the list | `admin-payments.md` #1 |
| Product editor: edit the slug, change category, upload an image | `admin-products.md` #1, #2, #5 |
| Categories: rename, reorder, menu switch, delete, product count | `admin-categories.md` #1, #2, #5 |
| Stock: reservations with order number and expiry | `admin-inventory.md` #3 |
| Customers: "e-mail confirmado" and spent/orders on the card | `admin-customers.md` #1, #2 |
| Audit: ANTES / DEPOIS of each change | `admin-audit.md` #1 |
| Failed messages: "Reprocessar todas", payload and stack trace | `admin-failed-messages.md` #1, #2 |

No new pendency.
