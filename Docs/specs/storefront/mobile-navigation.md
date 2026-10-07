# Mobile navigation — top bar, menu and search

Mockups: `Docs/design/mockups/MobileTopo.dc.html` (top bar + menu) and
`Docs/design/mockups/MobileBusca.dc.html` (search, screen 03 mobile).

## Why

Below 980 px the storefront header loses its search field, and below
1180 px its category nav: on a phone the only way to move around is the
content of the page itself. The mobile mockups replace the header with a
compact bar, a side menu and a full-screen search.

## What

### Top bar (below 980 px; desktop header unchanged)

- Indigo strip with one promise ("TROCA FÁCIL EM 30 DIAS").
- 56 px bar: **menu** button (or **Voltar** on inner screens), the
  centered logo (or the screen's title), **Buscar** (opens the search) and
  **Sacola** with the item count badge (hidden at 0).
- **Voltar + title** variant, per the mockups: Produto (→ its category,
  title = category), Sacola (→ início, "Sacola"), Entrega/Pagamento (→
  sacola, "Finalizar compra"), Institucional e ajuda (→ início, "Ajuda"),
  Entrar/Criar conta/recuperação (→ início, logo). Every other screen shows
  the menu button.
- The e-mail confirmation strip keeps showing under the bar.

### Menu (side panel from the left)

- Logo and close; **Entrar ou criar conta** (signed out → Entrar, back to
  the current page) or **Minha conta**.
- LOJA: Novidades, the categories registered in the catalog, Promoções
  (indigo), "Buscar produtos".
- AJUDA: Meus pedidos, Trocas e devoluções, Perguntas frequentes, Nossa
  história.
- Closes on the overlay, the close button, Esc or following a link; focus
  stays inside while open.

### Search (`/search` below 980 px)

- Back arrow + focused field "Peça, ateliê ou categoria" with a clear
  button; the term lives in `?q=` (shared with the desktop search).
- **Before typing**: BUSCAS RECENTES (last 5 on this device, "Limpar",
  "Nenhuma busca recente.") and EXPLORE chips (the catalog's categories and
  ateliers).
- **One letter**: "Continue digitando · A busca começa a partir de 2
  letras."
- **No result**: "Nada para "{termo}"", hint and the explore chips.
- **Results**: "N resultados para "{termo}"" and rows with the drawing,
  atelier · category, name and price, leading to the product page.
- A term becomes a recent search when the shopper opens a result, picks a
  chip or submits the field.

### Search matching (mobile and desktop)

Name, atelier, category and short description, ignoring case and accents
("luminaria", "Faísca", "ceramica"). Desktop `/search` keeps its grid,
sort and pagination over the same matches.

## Decisions

Asked and answered (2026-10-07):

1. Search runs over the whole catalog in the front (OrderCore searches the
   name only, accent-sensitively), on mobile and desktop alike.
2. "Mais procurados" becomes **Explore** with real categories and ateliers
   (OrderCore records no searches).
3. The Voltar + title variant is applied now to the screens the mockups
   show it on.

Derived:

- Recent searches live in this browser's localStorage (no backend for it).
- The catalog is read in one call of OrderCore's maximum page (100
  products) — the demo has 8.
