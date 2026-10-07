# Institucional e ajuda (`/content/[slug]`)

Mockups: `Docs/design/mockups/Conteudo.dc.html` (desktop, screens 25–35)
and `Docs/design/mockups/MobileConteudo.dc.html` (mobile).

## Why

The footer, sign-up and payment review link to institutional, help and
legal pages that don't exist — Termos de uso and Privacidade are linked
from the purchase flow itself and currently answer 404. These pages also
tell visitors, honestly, that Marfim is a demonstration store whose
payments run in Stripe's test mode.

## What

Eleven pages under one layout, in three groups:

| Group | Page | Slug |
| --- | --- | --- |
| A MARFIM | Nossa história | `nossa-historia` |
| | Ateliês parceiros | `ateliers` |
| | Venda com a gente | `venda` |
| | Lookbook | `lookbook` |
| AJUDA | Perguntas frequentes | `perguntas-frequentes` |
| | Trocas e devoluções | `trocas-e-devolucoes` |
| | Prazos e frete | `prazos` |
| | Cuidados com as peças | `cuidados` |
| | Rastrear pedido | `rastrear` |
| LEGAL | Privacidade | `privacidade` |
| | Termos de uso | `termos` |

- **Layout**: desktop — sticky index of the pages by group on the left,
  current page highlighted; mobile — the same pages as a horizontal row of
  chips. Every page ends with "Ainda precisa de ajuda?". Unknown slugs →
  the 404 page. Page title = page name.
- **Nossa história** (model A): headline, the store's story, illustration,
  a quote card, three principles, CTA to the ateliers page.
- **Ateliês parceiros**: one card per atelier (number, city, drawing, craft
  text) with chips for its pieces **from the live catalog** (by brand),
  each leading to the product page.
- **Venda com a gente**: criteria, "Como funciona" steps, "Mande seu
  portfólio" CTA (EM BREVE).
- **Lookbook**: four scenes drawn with the store's illustrations; tags of
  pieces that exist in the live catalog lead to their product pages.
- **Perguntas frequentes**: accent-insensitive search over questions and
  answers, category chips (Todas, Pedidos, Pagamento, Entrega, Trocas,
  Conta), accordion; EM BREVE on answers about what's not available; empty
  state "Nenhuma pergunta encontrada para "{termo}"".
- **Trocas e devoluções**: three figures, sections with an "on this page"
  index (desktop): Prazo, Como pedir (with EM BREVE for requesting it from
  the order page), Condições, Estorno, Cancelar antes do envio (links to
  Meus pedidos).
- **Prazos e frete, Cuidados, Privacidade, Termos** (model B): eyebrow,
  title, intro, optional EM BREVE note, sections with an index (desktop) or
  open accordions (mobile).
- **Rastrear pedido**: "Entre na sua conta" card (Entrar → back to Meus
  pedidos; "Já entrei: Meus pedidos") and "Rastrear sem login" disabled
  with EM BREVE.
- **Footer**: links point to these slugs; "Rastrear pedido" goes to the
  tracking page; Instagram muted with EM BREVE; the `[BRACKETS]` of
  atendimento and CNPJ replaced by the demo copy.

## Decisions

Asked and answered (2026-10-07):

1. `[BRACKETS]` → honest demo copy: Marfim is a demonstration store
   (portfolio); no invented founder, contacts or legal entity; Privacidade
   and Termos describe what the system actually does (Stripe in test mode,
   data kept by OrderCore). Contact channels and the ateliers' e-mail are
   EM BREVE.
2. No dispatch lead time is promised (no "3 dias úteis"), as on the product
   page.
3. Rastrear pedido is the mockup's page; the footer points to it.
4. The footer's Instagram link is muted with EM BREVE.

Derived:

- Slugs are the mockup's page ids; the footer's old slugs change with them.
- Facts in the copy match OrderCore: confirmation link valid for 24 h,
  password link for 30 min, checkout needs a confirmed e-mail, the shopper
  cancels while the order is PendingPayment/Confirmed, card data goes only
  to Stripe.
- Atelier and lookbook pieces come from the catalog; pieces the mockup
  names that don't exist (Tigela Areia, Banco Tora, Arandela Fio, Toalha
  Listra) are not shown.
