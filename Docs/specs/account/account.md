# Minha conta (`/account/*`)

Mockup: `Docs/design/mockups/Conta.dc.html` — screens 20 (Meus dados), 21
(Endereços), 22 (Meus pedidos), 23 (Detalhe do pedido) and 24 (Trocar
senha), plus the "vazio" states and the toast.

## Why

After buying, shoppers come back to follow their orders, fix their data and
addresses, change their password or sign out. Until now "Minha conta" and
"Acompanhar pedido" led nowhere.

## What

- **Layout**: "MINHA CONTA · Olá, {nome}" with an "E-mail confirmado" badge
  (or "E-mail não confirmado" + resend); a sticky side menu — Meus pedidos
  (count), Meus dados, Endereços, Trocar senha — and **Sair**. Each section
  has its own URL, so back/forward and links work.
- **22 · Meus pedidos** (`/account/orders`): table — order number, date,
  item thumbnails + "Primeira peça + N peças", total, status pill — paged;
  empty state "Você ainda não fez pedidos" → Ver a loja.
- **23 · Detalhe** (`/account/orders/[id]`): number, status pill, "Ao vivo"
  (refreshes while the order is in progress), "Feito em {data} · N peças";
  **Linha do tempo** from the backend's status history (done steps with time
  and a short note, the current one highlighted, the remaining ones "A
  SEGUIR"; cancelled / payment failed end the line); **Envio** card with
  carrier, tracking code and "Rastrear na transportadora" once shipped;
  **Itens** + total, delivery address and payment; **Cancelar pedido** with
  confirmation while the store hasn't started preparing it ("O valor é
  estornado no cartão e as peças voltam ao estoque."), otherwise the
  "já começou o preparo" note.
- **20 · Meus dados** (`/account/profile`): Nome, Sobrenome, e-mail
  (read-only, "Para trocar o e-mail, fale com o atendimento."), Telefone
  (10–11 digits); "Alterações não salvas" while dirty; toast "Dados salvos".
- **21 · Endereços** (`/account/addresses`): cards with ENTREGA / COBRANÇA
  PADRÃO badges, Editar, Tornar entrega/cobrança padrão, Excluir with inline
  confirmation; "+ Novo endereço"; empty state "Nenhum endereço salvo — o
  primeiro vira o padrão de entrega e de cobrança". Toasts for each change.
- **24 · Trocar senha** (`/account/password`): senha atual, nova senha with
  the strength meter; wrong current password shakes; success "Senha
  alterada — encerramos as sessões abertas em outros aparelhos. Este
  continua conectado."
- **Sair** ends the session (this device) and goes to Entrar.
- Requires a signed-in customer (→ Entrar and back).

## Decisions

No new questions — derived:

- Sections are routes (URL convention); `/account` opens Meus pedidos.
- The address form is the structured one from Entrega (street, number,
  neighborhood, city, UF, CEP…) instead of the mockup's two free-text lines:
  OrderCore stores structured addresses and the same form must be used
  everywhere.
- The order list fetches each listed order's details for the thumbnails and
  summary (the list endpoint has no items) — the page is small (10), same
  N+1 approach Plataforma VDG used for "Meus cursos".
- Changing the password goes through the session BFF so the current session
  (its refresh token lives in the httpOnly cookie) is the one kept.
- Nome/Sobrenome are split from / joined into OrderCore's single `name`.

## Out of scope

Changing e-mail, deleting the account, saved cards, returns/exchanges flow,
order invoices.

Backend gaps: `Docs/backend-pendencies/account/account.md`.
