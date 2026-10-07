# Backend pendencies — Store screens on mobile

Spec: `Docs/specs/storefront/mobile-screens.md`. Mockups: `Mobile*.dc.html`
(store and account screens).

The mobile mockups show the same data as the desktop ones, so they add no
new requirement on OrderCore. What they assume and OrderCore doesn't have
is already recorded with the desktop screen it belongs to:

| Mobile mockup shows | Recorded in |
| --- | --- |
| "Últimas 2 unidades", "Só temos 2 unidades agora" | `storefront/product.md` #2 |
| "Em estoque · despacho em até 3 dias úteis" | `storefront/product.md` #3 |
| Frete por CEP, frete grátis, embrulho, cupom, Pix · 5% off, 6× | `storefront/cart.md`, `checkout/delivery.md`, `checkout/payment.md` |
| Variant chosen on the product reaching the bag | `storefront/product.md` #4 |
| Order cards with the pieces' drawings | `account/account.md` #1 (list without items) |
| "Mais procurados", search by atelier | `storefront/mobile-navigation.md` |
| Atelier stories and cities | `storefront/home.md` #5 |

No new pendency.
