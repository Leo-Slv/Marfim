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

- **Acesso** (`/login`, `/register`, `/forgot-password`,
  `/confirmar-email`, `/redefinir-senha`) — tela `Acesso.dc.html`: entrar,
  criar conta (com medidor de força da senha), confirmar e-mail (o link do
  e-mail do backend cai em `/confirmar-email?token=`), reenviar
  confirmação, esqueci a senha e nova senha (`/redefinir-senha?token=`). A
  sessão se renova sozinha: o refresh token fica num cookie httpOnly do
  próprio Next (`/api/session/*`) e nunca chega ao JavaScript da página. O
  header mostra "Minha conta" e, enquanto o e-mail não for confirmado, a
  faixa "Confirme seu e-mail" com "Reenviar link". Spec em
  `Docs/specs/auth/access.md`; lacunas em
  `Docs/backend-pendencies/auth/access.md`. Para testar localmente, os
  e-mails chegam no Mailpit do OrderCore: http://localhost:8025.

- **Checkout · Entrega** (`/checkout/delivery`) — tela `Entrega.dc.html`:
  escolhe o endereço de entrega entre os salvos no OrderCore
  (`/api/customers/me/addresses`) ou cadastra um novo (o primeiro vira o
  padrão), e o de cobrança ("Igual ao endereço de entrega" ou outro salvo).
  Frete e prazo aparecem como EM BREVE. O resumo "Seu pedido" usa os preços
  revalidados da sacola. Exige login (volta para cá depois de entrar); os
  endereços escolhidos seguem para o pagamento na URL
  (`/checkout/payment?entrega=…&cobranca=…`). Spec em
  `Docs/specs/checkout/delivery.md`; lacunas em
  `Docs/backend-pendencies/checkout/delivery.md`.

- **Checkout · Pagamento** (`/checkout/payment`) — tela `Pagamento.dc.html`:
  revisão (cartão; Pix em EM BREVE), criação do pedido no OrderCore
  (`POST /api/orders/checkout`, com chave de idempotência — recarregar ou
  clicar duas vezes nunca duplica o pedido), dados do cartão no **Payment
  Element do Stripe** (o número do cartão nunca passa pela Marfim nem pelo
  OrderCore; 3-D Secure acontece na própria página), "Confirmando o
  pagamento…" acompanhando o pedido até **Pedido confirmado** (a sacola é
  esvaziada) ou **Pagamento não aprovado** (com "Tentar de novo"). Avisos de
  preço alterado, estoque, e-mail não confirmado e muitas tentativas. Spec
  em `Docs/specs/checkout/payment.md`; lacunas em
  `Docs/backend-pendencies/checkout/payment.md`.

- **Minha conta** (`/account/*`) — tela `Conta.dc.html`: **Meus pedidos**
  (lista paginada com miniaturas e status; detalhe com linha do tempo a
  partir do histórico do OrderCore, envio/rastreio, itens e **cancelamento**
  enquanto o ateliê não começou o preparo — atualiza sozinho enquanto o
  pedido anda), **Meus dados** (nome, sobrenome, telefone com máscara),
  **Endereços** (adicionar, editar, excluir, tornar entrega/cobrança
  padrão), **Trocar senha** (mantém esta sessão e encerra as outras, pelo
  BFF) e **Sair**. Cada seção tem sua URL. Spec em
  `Docs/specs/account/account.md`; lacunas em
  `Docs/backend-pendencies/account/account.md`.

- **Estados de erro** — tela `Erro.dc.html`: **404** (rota inexistente ou
  registro que não existe/não é seu), **403** (acesso negado), **500** (com o
  código de rastreio do OrderCore e "Copiar"), **sem conexão** (API fora do
  ar), **429** (contagem regressiva até poder tentar de novo) e **sessão
  expirada** (quando o backend recusa renovar a sessão: "Entre de novo para
  continuar", voltando para a mesma tela). Rotas inexistentes caem no 404;
  erros de renderização no `error.tsx`; a consulta principal de uma página
  (detalhe do pedido, pedido do pagamento) mostra o estado conforme o erro.
  Spec em `Docs/specs/storefront/error-states.md`; lacunas em
  `Docs/backend-pendencies/storefront/error-states.md`.

- **Admin · Entrar** (`/admin/login`) — tela `AdminLogin.dc.html`: entrada
  do painel administrativo, só para contas com papel Admin. Erros de
  credenciais, conta desativada e muitas tentativas (com contagem); conta de
  cliente → "Sem acesso ao painel" (sem deixar sessão aberta); sessão
  expirada → aviso "Sua sessão terminou" e volta para a seção onde estava;
  "Manter conectado neste computador" desmarcado faz a sessão acabar ao
  fechar o navegador. Para testar localmente, o
  admin é o de `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env` do OrderCore. Spec
  em `Docs/specs/admin/admin-login.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-login.md`.

- **Admin · Dashboard** (`/admin`) — telas `AdminDashboard.dc.html` e
  `AdminNav.dc.html`: menu lateral do painel com contadores ao vivo
  (pedidos a preparar, estoque baixo, mensagens com falha; seções ainda não
  feitas aparecem como EM BREVE), receita, pedidos pagos e ticket médio do
  período com a variação contra o período anterior, pedidos a preparar
  (e quantos há mais de 24 h), gráfico de receita por dia, pedidos por
  etapa, últimos pedidos e produtos abaixo do ponto de reposição. Período de
  7 ou 30 dias (`?periodo=`); atualiza a cada 30 s. Consome
  `/api/admin/dashboard`, `/api/admin/orders`,
  `/api/admin/catalog/products` e `/api/messaging/failed-messages`. Spec
  em `Docs/specs/admin/admin-dashboard.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-dashboard.md`.

- **Admin · Pedidos** (`/admin/orders`) — tela `AdminPedidos.dc.html`: lista
  de pedidos com abas por status (com contagens), busca por cliente,
  paginação e painel de detalhe com a próxima ação — iniciar preparo, marcar
  como enviado (transportadora, rastreio e link; captura o pagamento no
  Stripe e o cliente recebe o e-mail), marcar como entregue —, cancelamento
  com estorno/liberação do cartão, itens, endereço de entrega, linha do
  tempo do pedido e notas internas da equipe. Tudo na URL (`?status=`,
  `?cliente=`, `?pagina=`, `?pedido=`); o dashboard e o menu levam para cá.
  Spec em `Docs/specs/admin/admin-orders.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-orders.md`.

- **Admin · Produtos** (`/admin/products`) — tela `AdminProdutos.dc.html`:
  lista com busca por nome ou SKU e editor do produto — nome, marca
  (ateliê), descrição, preço e preço "de" com a prévia "Na loja",
  variantes (adicionar com SKU gerado e remover), o desenho que a loja usa
  como imagem (envio de fotos EM BREVE), Salvar, Publicar na loja e
  Descontinuar. "+ Novo" cria um rascunho (nome, SKU, categoria e preço).
  Spec em `Docs/specs/admin/admin-products.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-products.md`.

- **Admin · Categorias** (`/admin/categories`) — tela
  `AdminCategorias.dc.html`: as categorias na ordem do menu, com o endereço
  e quantos produtos cada uma tem, e o formulário de nova categoria (com
  prévia do endereço e checagem de nome repetido). Reordenar, renomear,
  tirar do menu e excluir aparecem como EM BREVE — o OrderCore ainda não
  tem essas operações. Spec em `Docs/specs/admin/admin-categories.md`;
  lacunas em `Docs/backend-pendencies/admin/admin-categories.md`.

- **Admin · Estoque** (`/admin/inventory`) — tela `AdminEstoque.dc.html`:
  níveis de estoque de todos os produtos (disponível, reservado, ponto de
  reposição e barra de nível), filtros Abaixo da reposição e Esgotados, totais
  e o painel do produto para registrar recebimento, ajuste (com motivo) e
  ponto de reposição, com as reservas ativas (e o pedido de cada uma) e o
  histórico de movimentações. Spec em `Docs/specs/admin/admin-inventory.md`;
  lacunas em `Docs/backend-pendencies/admin/admin-inventory.md`.

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

Para testar o pagamento (Stripe em modo teste), suba também o Stripe CLI,
que entrega os webhooks do Stripe para a API local:

```bash
docker compose --profile stripe up -d stripe-cli
```

Cartões de teste do Stripe: `4242 4242 4242 4242` (aprovado),
`4000 0000 0000 0002` (recusado), `4000 0025 0000 3155` (pede 3-D Secure) —
qualquer validade futura e qualquer CVC.

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
