# Produto (`/products/[slug]`)

Mockup: `Docs/design/mockups/Produto.dc.html` — states em estoque,
últimas unidades, esgotado and inexistente, plus the mini-sacola.

## Why

Every product card (home, listing, cart recommendations) leads here. The
shopper needs the piece's story, price, availability and a way to put it in
the bag — until now this URL was a 404.

## What

- Breadcrumb: INÍCIO / {CATEGORIA} / {PRODUTO}.
- **Gallery**: the store's drawing for the piece (by slug — no photos by
  design) in views selectable by thumbnail: Frente, Acesa (lighting only:
  dark ground, warm glow), Detalhe, Ambiente; caption on each view;
  "−20%" pill when on sale. Gentle float animation.
- **Info**: "{ATELIÊ} · {CIDADE}" (atelier from the product's brand),
  name, short description and long description; price, struck "de" price
  and "−N%"; stock line — Em estoque (pulsing green), Últimas unidades
  ("o ateliê produz em lotes pequenos"), Esgotado.
- **Variants** (only when the product has them): chips per variant with
  the mockup's note "EM BREVE · A variante escolhida ainda não segue para
  o pedido".
- **Buy**: quantity 1–9 (the bag's per-piece limit; "Máximo de 9 por
  peça" at the cap) + **Adicionar à sacola** → mini-sacola (piece,
  quantity, line price, bag count and total, "Ir para a sacola" /
  "Continuar comprando"). Sold out: disabled "Esgotado" + "{ateliê}
  produz em lotes pequenos. Veja abaixo outras peças de {categoria}
  disponíveis agora."
- "Calcular frete e prazo pelo CEP" — EM BREVE.
- **Accordions**: Medidas e materiais (materials = short description;
  medidas EM BREVE), Cuidados com a peça (editorial per category),
  Trocas e devoluções (30 days, as the header promises).
- **"Combina com {produto}"**: up to 3 other pieces of the same category
  (available first) with add buttons, and "Ver toda a {categoria}".
- **Not found** (unknown or no-longer-sold slug): "PRODUTO NÃO
  ENCONTRADO · Essa peça não está mais na loja" with "Ver a loja".
- Page title = product name.

## Decisions

Asked and answered (2026-10-05):

- Accordions: materials from the short description, dimensions EM BREVE,
  care text per category in the front, 30-day returns policy.

Derived:

- No exact stock count ("Últimas 2 unidades"): OrderCore's public product
  only says LowStock; the cap is the bag's 9 per piece.
- No lead time ("despacho em até 3 dias úteis"): not in OrderCore, not
  promised.
- Variants don't go to the order (the bag and checkout have no variant):
  shown with the mockup's own EM BREVE note.
