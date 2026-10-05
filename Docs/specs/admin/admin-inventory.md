# Admin · Estoque (`/admin/inventory`)

Mockup: `Docs/design/mockups/AdminEstoque.dc.html`.

## Why

The ateliês deliver pieces, things break, inventories are counted: the team
needs to see what's available and what's running out, register receipts
and adjustments, and set each product's reorder point — the line below
which it counts as "low" in the dashboard, the menu badge and the store.

## What

- "OPERAÇÃO · Estoque" with filter tabs **Todos**, **Abaixo da
  reposição**, **Esgotados** (with counts).
- **Tiles**: Unidades disponíveis (sum), Abaixo do ponto de reposição,
  Esgotados (clay when above zero, green when zero).
- **Table** (paged): product (drawing, name, SKU), DISPONÍVEL (clay at
  zero), RESERVADO, REPOSIÇÃO, NÍVEL — a bar of the available units with a
  tick at the reorder point, orange when below it, and the state (OK /
  Baixo / Zerado). Legend: "Traço = ponto de reposição. Barra laranja =
  abaixo do ponto." The open product is highlighted.
- **Panel** (beside on wide screens; replaces the list on narrow ones, with
  "← Estoque"): drawing, name, SKU; Disponível / Reservado / Reposição;
  three actions —
  - **Recebimento**: quantity (> 0) → "Registrar recebimento";
  - **Ajuste**: + or − quantity (not zero; can't take available below
    zero) and **Motivo** (Contagem de inventário, Peça danificada, Amostra
    para foto, Devolução de cliente) → "Aplicar ajuste";
  - **Reposição**: new reorder point (≥ 0) → "Salvar ponto";
  - errors inline, toast on success ("Recebimento registrado", "Ajuste
    aplicado", "Ponto de reposição salvo").
- **Reservas ativas**: order number (link to the order), units, since when;
  "Nenhuma reserva agora."
- **Movimentações**: newest first — signed quantity (green +, clay −, indigo
  for reservations), what happened in pt-BR (with the reason given), when;
  "Mostrar mais".
- Filter, page and open product in the URL (`?nivel=`, `?pagina=`,
  `?produto=`). Data refreshes every 30 s and after each action (also the
  menu badge and the dashboard's low-stock block).

## Decisions

No new questions — derived:

- The list comes from the admin product list (it carries each product's
  stock level and its name/SKU); the inventory list has neither.
- Reservations show "desde HH:MM" (when reserved): OrderCore has no expiry
  on them.
- Products of every status are listed (a draft can have stock too).
