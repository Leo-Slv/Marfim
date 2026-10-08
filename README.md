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
  `categoryId`, `onSale`, `sort`) e `GET /api/catalog/categories`. A busca
  roda no front sobre o catálogo inteiro (nome, ateliê, categoria e
  descrição curta, sem acento), porque a API só busca no nome. Spec em
  `Docs/specs/storefront/listing.md`; lacunas do backend em
  `Docs/backend-pendencies/storefront/listing.md`.
- **Navegação no celular** (abaixo de 980 px) — telas `MobileTopo.dc.html` e
  `MobileBusca.dc.html`: barra compacta com menu lateral (conta, Novidades,
  categorias do banco, Promoções, busca e ajuda), busca e sacola com
  contador; nas telas internas a barra troca o menu por "Voltar" e título
  (Produto → categoria, Sacola, Finalizar compra, Ajuda, Entrar). No celular
  `/search` vira a tela de busca: buscas recentes (no navegador), chips de
  categorias e ateliês reais, "Continue digitando", "Nada para…" e
  resultados em lista. Spec em `Docs/specs/storefront/mobile-navigation.md`;
  lacunas em `Docs/backend-pendencies/storefront/mobile-navigation.md`.
- **Telas da loja no celular** (abaixo de 980 px) — `MobileInicio`,
  `MobileListagem`, `MobileProduto`, `MobileSacola`, `MobileCheckout`,
  `MobileAcesso`, `MobileConta` e `MobileErro`: barra de ação fixa no rodapé
  (Produto, Sacola, Entrega e Pagamento, com a ação e o total), painéis que
  sobem de baixo (mini-sacola, ordenar, cancelar pedido), rodapé compacto,
  galeria em carrossel, grade de 2 colunas com "Carregar mais", ateliês em
  acordeão e aviso ao adicionar na home. O desktop não muda. Spec em
  `Docs/specs/storefront/mobile-screens.md`; sem lacunas novas no backend.
- **Produto** (`/products/[slug]`) — tela `Produto.dc.html`: o desenho da
  peça em vistas (frente, acesa para iluminação, detalhe, ambiente), ateliê,
  descrição, preço com preço "de" e desconto, estoque (em estoque, últimas
  unidades, esgotado), variantes (EM BREVE para o pedido), quantidade e
  "Adicionar à sacola" com a mini-sacola, frete por CEP (EM BREVE), medidas e
  materiais, cuidados, trocas e "Combina com" peças da mesma categoria; peça
  inexistente ou fora de linha mostra "Essa peça não está mais na loja".
  Consome `GET /api/catalog/products/by-slug/{slug}`. Spec em
  `Docs/specs/storefront/product.md`; lacunas em
  `Docs/backend-pendencies/storefront/product.md`.
- **Institucional e ajuda** (`/content/[slug]`) — telas `Conteudo.dc.html`
  e `MobileConteudo.dc.html`: 11 páginas (Nossa história, Ateliês parceiros,
  Venda com a gente, Lookbook, Perguntas frequentes, Trocas e devoluções,
  Prazos e frete, Cuidados com as peças, Rastrear pedido, Privacidade e
  Termos de uso) com índice lateral no desktop e chips no celular. Os textos
  deixam claro que a Marfim é uma loja de demonstração (pagamentos em modo
  de teste do Stripe); o que a loja ainda não tem (atendimento, rastreio sem
  login, frete por CEP, troca pelo pedido) aparece como EM BREVE. Ateliês e
  Lookbook usam as peças reais do catálogo (`GET /api/catalog/products`).
  Spec em `Docs/specs/content/content-pages.md`; lacunas em
  `Docs/backend-pendencies/content/content-pages.md`.
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

- **Admin · Clientes** (`/admin/customers`) — tela `AdminClientes.dc.html`:
  clientes com busca por nome ou e-mail, quantos pedidos fizeram e quanto
  gastaram, e o painel com telefone, endereços, pedidos recentes (que abrem
  em Pedidos) e desativar/reativar a conta (a pessoa deixa de entrar e
  comprar; pedidos e dados ficam). Confirmação de e-mail aparece como EM
  BREVE. Spec em `Docs/specs/admin/admin-customers.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-customers.md`.

- **Admin · Pagamentos** (`/admin/payments`) — tela `AdminPagamentos.dc.html`:
  pagamentos por status com o pedido, valor e quanto já foi estornado, e o
  painel com a referência do Stripe, o motivo de recusa (código do Stripe
  explicado em português), "Conferir agora" com o Stripe, estorno total ou
  parcial de pagamentos capturados (com motivo e confirmação) e os eventos
  do pagamento. Precisa do Stripe CLI rodando para os estornos serem
  confirmados. Spec em `Docs/specs/admin/admin-payments.md`; lacunas em
  `Docs/backend-pendencies/admin/admin-payments.md`.

- **Admin · Auditoria** (`/admin/audit`) — tela `AdminAuditoria.dc.html`:
  registro somente leitura de quem fez o quê e quando (pedidos, produtos,
  estoque, clientes, pagamentos, contas), com filtro por tipo, busca por ID
  completo, filtro por usuário, detalhes de cada evento e links para abrir o
  registro na tela dele. Spec em `Docs/specs/admin/admin-audit.md`; lacunas
  em `Docs/backend-pendencies/admin/admin-audit.md`.

- **Admin · Mensagens com falha** (`/admin/failures`) — tela
  `AdminFalhas.dc.html`: eventos entre os módulos do OrderCore que
  esgotaram as tentativas automáticas, com o que deixou de acontecer, o erro
  e a mensagem original; Reprocessar (uma ou todas) e Descartar (com
  confirmação e a consequência), além do histórico de reprocessadas e
  descartadas. Spec em `Docs/specs/admin/admin-failed-messages.md`; lacunas
  em `Docs/backend-pendencies/admin/admin-failed-messages.md`.

- **Admin · versão mobile** (abaixo de 980 px) — todas as telas do painel têm
  layout próprio (`MobileAdmin*.dc.html`): barra superior com menu lateral e
  sino de pedidos a preparar, listas em cards, filtros em chips com rolagem,
  painéis de detalhe em tela cheia, barra fixa Salvar/Publicar no editor de
  produto e confirmações (cancelar, descontinuar, desativar, estornar,
  descartar) em bottom sheet. Spec em `Docs/specs/admin/mobile-admin.md`;
  lacunas em `Docs/backend-pendencies/admin/mobile-admin.md`.

- **Aviso de loja de demonstração** — faixa fechável (lembrada na sessão) acima do
  cabeçalho da loja e bloco com os cartões de teste do Stripe na tela de
  Pagamento. Ligado por padrão; desligue com `NEXT_PUBLIC_DEMO_STORE=false`
  junto com as chaves live do Stripe. Spec em `Docs/specs/storefront/demo-notice.md`;
  lacunas em `Docs/backend-pendencies/storefront/demo-notice.md`.

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

## Deploy

Hospedagem na Vercel; passo a passo, variáveis de ambiente e teste de fumaça
em `Docs/deploy/vercel.md`. Toda resposta leva os cabeçalhos de segurança de
`src/lib/security/security-headers.ts` (CSP liberando só o próprio app, a API e o
Stripe, HSTS etc.) — uma nova origem de terceiros precisa ser incluída ali. O CI
(`.github/workflows/ci.yml`) roda typecheck, lint, testes e build em cada push na
`main` e em cada pull request, sem depender da API. Spec em
`Docs/specs/infra/deploy.md`; o que o OrderCore precisa em produção (CORS, links
dos e-mails, webhook do Stripe) em `Docs/backend-pendencies/infra/deploy.md`.
