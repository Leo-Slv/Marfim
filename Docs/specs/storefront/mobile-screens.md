# Store screens on mobile

Mockups (390 px wide): `MobileInicio`, `MobileListagem`, `MobileProduto`,
`MobileSacola`, `MobileCheckout`, `MobileAcesso`, `MobileConta` and
`MobileErro` (`.dc.html` in `Docs/design/mockups/`). The top bar, menu
and search are in `mobile-navigation.md`; the content pages in
`content/content-pages.md`.

## Why

The store screens only shrink their desktop layouts below 980 px: one
product per row, the desktop side panels stacked under the content, the
main action far from the thumb and a three-column footer. The mobile
mockups give each screen a layout of its own. A demo where people buy
with Stripe's test card on their phones needs Produto → Sacola →
Checkout to work comfortably there first.

## What (below 980 px; desktop unchanged)

### Shared

- **Fixed action bar** at the bottom on Produto, Sacola, Entrega and
  Pagamento, with the screen's main action and the amount it concerns.
- **Bottom sheets** instead of side panels: "Adicionado à sacola" (with
  the piece, quantity, price, "Ir para a sacola · N itens", "Continuar
  comprando"), the sort options of the listing and the order
  cancellation.
- **Compact footer** (MobileInicio): AJUDA (Meus pedidos, Trocas,
  Perguntas frequentes) and MARFIM (Nossa história, Ateliês, Privacidade),
  © and the big logo. Screens with the fixed action bar have no footer.
- **Checkout steps** as three equal pills: done (green, ✓), current
  (indigo), next (grey) — SACOLA, ENTREGA, PAGAR.

### Início

- Compact hero: eyebrow, title, text, the Luminária Arco card (drawing,
  "Mais vendido", name, price, Adicionar) and "Explorar coleção →".
- "Feito para ficar" + "Ver tudo", category chips in one scrolling row,
  4 pieces in 2 columns (drawing, name, price, +).
- Semana do Design card with the countdown in four boxes and "Aproveitar".
- Ateliers as an accordion (number, name, craft; the open one shows its
  drawing, city and technique).
- No shipping-label section. Adding a piece shows a toast "{peça} na
  sacola · Ver sacola".

### Listagem (category, promotions)

- Breadcrumb, title + count; category chips in one scrolling row; the
  promotions banner as a compact card.
- "Ordenar: {ordem}" button → bottom sheet of radio options.
- 2-column cards (badge, discount, atelier, name, price, old price, +);
  "N DE M" and **Carregar mais**, which adds the next 8 below (the page
  count stays in `?pagina=`).
- Empty state as a card with "Voltar ao início".

### Produto

- Full-width gallery of the drawing's views with ‹ › buttons, dots and the
  discount pill (no thumbnails, no breadcrumb — the top bar shows the
  category).
- Atelier, name, price, stock line, description, variants (EM BREVE),
  CEP (EM BREVE), the three accordions, "Combina com {peça}" as a
  scrolling row of small cards.
- Fixed bar: quantity and **Adicionar · {total}**; the per-piece cap
  message above it; sold out → disabled "Esgotado". Adding opens the
  sheet.

### Sacola

- Step pills; one card per line (drawing, atelier, name, line total and
  old price, the line's warning with its fix, stepper, "Remover");
  unavailable lines dashed with "×".
- Summary card (subtotal · N peças, promoções, frete EM BREVE, total);
  the EM BREVE note (frete por CEP, cupom, embrulho, Pix); "Da mesma
  categoria" as a scrolling row with +.
- Fixed bar: **Continuar · {total}** (disabled with the reason while the
  bag can't go to checkout). Empty bag: card with "Ver a loja".

### Checkout — Entrega and Pagamento

- Step pills, short titles ("Para onde enviar?", "Pagamento").
- Entrega: address cards with radio, "+ Novo endereço" (dashed), the new
  address form, "Cobrança no mesmo endereço", frete EM BREVE, summary
  card (N peças, frete).
- Pagamento: "Entrega: {endereço} · Alterar", the problems found at
  payment time, Stripe's card form, summary card.
- Fixed bar: **Ir para o pagamento · {total}** / **Pagar · {total}**.
- Processing and result screens centered and full width.

### Acesso (Entrar, Criar conta, e-mails, senha)

- A dark 96 px banner ("SUA CONTA MARFIM · Cada peça, do ateliê até
  você.") replaces the side illustration; forms in one column, full-width
  buttons.

### Minha conta

- Header with initials, "Olá, {nome}", e-mail and Sair; the sections as
  a row of chips (with the order count).
- Order cards (number · date, status, drawings of the pieces, total);
  detail with timeline, items and total; cancelling asks in a bottom
  sheet.
- Forms in one column.

### Erros

- 404, 500, 429 and session expired centered, full-width stacked buttons.

## Decisions

Asked and answered (2026-10-07):

1. Footer below 980 px: the compact one, except on the screens with the
   fixed action bar (Produto, Sacola, Entrega, Pagamento).

Derived:

- "Carregar mais" keeps the URL as the source of truth: `?pagina=N` on
  mobile shows pages 1..N.
- Mockup elements already ruled out stay so: lead time, exact stock,
  shipping, coupons, gift wrap, Pix, card last4 (see the screens'
  existing pendencies).
