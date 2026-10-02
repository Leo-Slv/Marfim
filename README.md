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
