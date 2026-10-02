# Marfim

## Objetivo

Frontend web do e-commerce Marfim — vitrine (início, listagem, produto,
sacola, checkout, conta) e painel administrativo (pedidos, produtos, estoque,
pagamentos, auditoria). Consome a API do
[OrderCore](https://github.com/Leo-Slv/OrderCore) via HTTP/JSON.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- React Hook Form + Zod
- motion

## Estrutura

```text
src/app/         # Rotas (App Router) — ficam finas, delegam para src/features
src/components/  # ui/ (shadcn) + componentes compartilhados entre features
src/features/    # Uma pasta por funcionalidade de negócio (ver src/features/README.md)
src/lib/         # HTTP client, auth, React Query, rotas, env, tema
Docs/            # specs, pendências de backend e mockups das telas
public/
```

## Módulos ativos

- **Início da loja** (`/`) — tela `Main.dc.html`: header com categorias
  reais e contador da sacola, hero com a Luminária Arco (preço e estoque
  vivos), grade "Escolhidos da semana" com filtro por categoria
  (`?categoria=`, também acionado pelo menu do header), banner de promoção
  com contagem regressiva, ateliês com as peças de cada um (agrupadas por
  `brand`), etiqueta de envio e rodapé. Consome
  `GET /api/catalog/products`, `GET /api/catalog/products/by-slug/{slug}` e
  `GET /api/catalog/categories`. As imagens dos produtos são os desenhos dos
  mocks, escolhidos por slug (não ficam no banco). "Adicionar" grava numa
  sacola local (localStorage); favoritos valem só durante a visita. Spec em
  `Docs/specs/storefront/home.md`; lacunas do backend em
  `Docs/backend-pendencies/storefront/home.md`.
- **Listagem** (`/products`, `/search`, `/promotions`) — tela
  `Listagem.dc.html` em três modos: por categoria (`?categoria=` com Tudo,
  Novidades e as categorias cadastradas no banco), busca (`?q=`, a partir de
  2 letras) e promoções (peças com preço "de/por"). Ordenação (`?ordem=`),
  paginação de 8 em 8 (`?pagina=`), selos de estoque (Esgotado / Últimas
  unidades) e mini-sacola ao adicionar. O menu de categorias do header e os
  links do rodapé levam para cá. Consome `GET /api/catalog/products` (com
  `categoryId`, `searchTerm`, `onSale`, `sort`) e
  `GET /api/catalog/categories`. Spec em `Docs/specs/storefront/listing.md`;
  lacunas do backend (busca só por nome e sensível a acento, sem filtro por
  ateliê) em `Docs/backend-pendencies/storefront/listing.md`.
- **Sacola** (`/cart`) — tela `Carrinho.dc.html`: itens com quantidade
  (1–9), remover, resumo do pedido e "Combina com a sua sacola". A sacola
  fica no navegador e é revalidada no backend ao abrir e a cada mudança
  (`POST /api/orders/cart/quote`): preço que mudou ("Entendi"), estoque
  insuficiente ("Diminuir quantidade") e peça indisponível ou removida
  aparecem na linha, e "Continuar para entrega" só libera sem avisos
  pendentes. Total, preços e promoções vêm da API; frete por CEP, cupom,
  presente, Pix e parcelamento aparecem como EM BREVE. Spec em
  `Docs/specs/storefront/cart.md`; lacunas em
  `Docs/backend-pendencies/storefront/cart.md`.

## Telas (design)

As telas do Claude Design estão exportadas em `Docs/design/mockups/`. Abra
`Docs/design/mockups/index.html` no navegador para navegar por todas
(ver `LEIA-ME.txt` na mesma pasta).

## Como rodar

Suba o OrderCore (API + Postgres com seed) pelo Docker, no repositório
dele:

```bash
docker compose up -d --build
```

Depois, aqui:

```bash
cp .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` aponta para a API do OrderCore no Docker
(`http://localhost:8080` por padrão).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript sem emitir
- `npm run test` — testes (`*.spec.ts`, via `node:test` + `tsx`)
- `npm run format` — Prettier
