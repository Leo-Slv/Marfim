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

- **Catálogo (scaffold)** (`/`) — lista a primeira página de produtos via
  `GET /catalog/products`. Existe só como exemplo do formato de uma feature
  (`api` → `schemas` → `hooks` → `components`); será substituído pela página
  inicial especificada.

## Telas (design)

As telas do Claude Design estão exportadas em `Docs/design/mockups/`. Abra
`Docs/design/mockups/index.html` no navegador para navegar por todas
(ver `LEIA-ME.txt` na mesma pasta).

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` aponta para o OrderCore rodando localmente
(`https://localhost:23346` por padrão).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript sem emitir
- `npm run test` — testes (`*.spec.ts`, via `node:test` + `tsx`)
- `npm run format` — Prettier
