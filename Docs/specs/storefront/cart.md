# Storefront cart — Sacola (`/cart`)

Mockup: `Docs/design/mockups/Carrinho.dc.html` (default state; the
"avisos" state for line issues; "futuro" features shown as EM BREVE).

## Why

The bag is where a shopper reviews what they picked before checkout. Since
OrderCore keeps the cart on the client, this screen is also the first place
the client cart meets the backend's truth: prices may have changed, stock may
have run out, a product may have left the catalog. The shopper must see that
before going to delivery, not at payment.

## What

- **Steps** "01 Sacola · 02 Entrega · 03 Pagamento" with Sacola current;
  title "Sua sacola" with the piece count and "Continuar comprando" (home).
- **Lines**: drawing on tint (by slug), category (uppercase), name, "por
  {atelier}", stock note ("Em estoque" / "Últimas unidades" · despacho em
  até 3 dias), line total (with the old total when on sale and "R$ X cada"
  for quantity > 1), quantity stepper (1–9; − at 1 removes) and "Remover".
- **Validation**: the bag is re-priced by the backend when the screen opens
  and after every change (debounced). Prices and totals shown are the
  backend's current ones. Per-line notices:
  - price changed → "O preço mudou de R$ A para R$ B desde que você
    adicionou." + **Entendi** (accepts the new price);
  - not enough stock → "Não temos estoque para essa quantidade." +
    **Diminuir quantidade** (−1 and re-validate);
  - unavailable / not found → the line becomes a struck-through "ghost"
    (INDISPONÍVEL / NÃO ENCONTRADA) with **Remover da sacola**.
  "Continuar para entrega" is blocked while any notice is unresolved (or the
  validation hasn't answered), with a short reason.
- **Free-shipping progress** card and **gift wrap** option: shown muted with
  EM BREVE (no backend support).
- **Summary** ("Resumo do pedido"): frete por CEP and cupom muted with EM
  BREVE; Subtotal (list prices) · Promoções (savings from compare-at prices)
  · Frete "Informe o CEP"; **Total** (backend total) "no cartão de crédito ·
  frete a calcular"; EM BREVE note on Pix/installments; "Continuar para
  entrega" (shine animation) → delivery step (future route); COMPRA SEGURA /
  TROCA EM 30 DIAS.
- **Empty bag**: drawing that draws itself, "Sua sacola está vazia", "Ver a
  loja".
- **"Combina com a sua sacola"**: up to 4 in-stock products from the same
  categories as the bag (topped up with other products), not already in it;
  "+" adds to the bag in place.
- The header's Sacola button is highlighted on this page; the count follows
  the bag live (also across tabs).
- Motion: fade-ups, total/line-total "pop" on change, floating empty-state
  drawing, shine on the main button; all off under reduced motion.

## Decisions (resolved with the user, 2026-10-02)

1. Validate on open and after each change (debounced); block "Continuar"
   while there are unresolved notices; totals use the backend's prices.
2. Insufficient stock offers "Diminuir quantidade" (the API doesn't say how
   many units are left).

Carried over: features without backend support are shown disabled with EM
BREVE; links to screens not built yet use their future routes.

## Out of scope

Delivery/payment steps, shipping quotes, coupons, gift wrap, Pix,
installments, server-side cart.

Backend gaps: `Docs/backend-pendencies/storefront/cart.md`.
