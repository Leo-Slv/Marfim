# Store screens on mobile — implementation plan

Spec: `Docs/specs/storefront/mobile-screens.md`. One screen per commit, in
the order of the buying path: shared pieces, Checkout, Sacola, Produto,
Acesso, Listagem, Início, Conta, Erros. Breakpoint `min-[980px]` as the
rest of the store; desktop markup is kept and the mobile one is added next
to it only where the structure differs (otherwise responsive classes).

## Shared (`src/components/`)

- `mobile-action-bar.tsx` — fixed bottom bar below 980 px (white, top
  border, safe-area padding) + a spacer so the page can scroll past it.
- `bottom-sheet.tsx` — Radix Dialog sliding up (`--animate-sheet-up`),
  grabber, title; used by the mini-sacola, sort and cancel sheets.
- `store-footer.tsx` — `variant`: compact below 980 px; `StoreFooter
  hideOnMobile` on the screens with the action bar.
- `checkout-steps.tsx` — compact pills below 980 px.
- cart's `AddedToCartDrawer` — the bottom sheet below 980 px (same
  content), so every "add" (listing, product, recommendations) gets it.

## Screens

- **Checkout** (`checkout/components`): titles, address cards and summary
  in mobile size; `CheckoutSummary` collapses to a totals card below
  980 px and the continue/pay action moves to the action bar (payment:
  the bar submits the card form through its `form` id).
- **Sacola** (`cart/components`): line cards, summary card, recommendations
  row, action bar "Continuar · total".
- **Produto** (`product/components`): `ProductGallery` carousel below
  980 px; recommendations row; `ProductBuyBox` renders in the action bar
  below 980 px; no breadcrumb.
- **Acesso** (`auth-layout`): the dark banner below 980 px.
- **Listagem**: compact headings, sort sheet, 2-column `ListingProductCard`
  sizes, "Carregar mais" (`pageSize = 8 × pagina` on mobile via
  `useMediaQuery`), empty card.
- **Início**: hero, grid (4 in 2 columns), promo card, ateliers accordion,
  shipping section hidden, toast on add.
- **Conta**: header, chips nav, order cards, cancel sheet.
- **Erros**: full-width stacked actions.
