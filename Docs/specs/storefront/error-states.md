# Error states (404, 403, 500, sem conexão, 429, sessão expirada)

Mockup: `Docs/design/mockups/Erro.dc.html` — screens 36 (404), 37 (500),
38 (429) and 39 (Sessão expirada). The 403 and "sem conexão" variants are
not in the mockup; they reuse its layouts with their own copy.

## Why

Until now an unknown URL fell on Next's default English 404, a render error
on its default error page, and a failure of the query a page is built on
showed a one-line notice (or a skeleton forever). A session the backend
stopped renewing silently bounced the shopper to Entrar without saying why.
The store needs one consistent, pt-BR answer for each of these, with a way
forward from each.

## What

All states render inside the store chrome (header + footer), centred, with
the mockup's entrance animations (respecting reduced motion).

- **404 · Página não encontrada** — "4 [vaso flutuando] 4", "Esta página
  saiu da prateleira", Voltar ao início / Buscar produtos. Shown for any
  unknown URL and when the record a page is about doesn't exist (or isn't
  the shopper's — the backend answers 404 for both).
- **403 · Acesso negado** (extra) — same layout as the 404 ("4 [peça] 3"),
  "Esta área não é para a sua conta", Voltar ao início / Minha conta. Shown
  when the backend answers `forbidden`.
- **500 · Erro inesperado** — pendant swinging inside a slowly turning
  dotted ring, "Algo deu errado do nosso lado", the **código** to give the
  support team with **Copiar** ("Copiado" for 2 s), Tentar de novo / Voltar
  ao início. The code is the backend's trace id when the failure came from
  the API (so it can be found in the logs), Next's error digest for a
  server render error, and is hidden when there is neither.
- **Sem conexão** (extra) — same illustration as the 500, "Não conseguimos
  falar com a loja": the API didn't answer (network down, timeout). No code
  (there's no request on the server to look up). Tentar de novo / Voltar ao
  início.
- **429 · Muitas tentativas** — a ring emptying with the seconds left,
  "Vamos com calma"; "Tentar de novo em Ns" stays disabled until the
  countdown ends (green ring), then retries.
- **Sessão expirada** — card with a padlock, "Entre de novo para
  continuar", saying where the shopper goes back to after signing in
  (Meus pedidos, Meus dados, Endereços, Trocar senha, a entrega, o
  pagamento…) and that the bag is still saved; **Entrar** (→ Entrar and
  back to this exact URL) and "Continuar sem entrar" (→ início). The header
  shows the signed-out state.

## When each one shows

- Unknown routes → 404 (also future routes not built yet, e.g. product
  detail).
- A rendering error anywhere → the matching state by error (500 by
  default), with "Tentar de novo" re-rendering the page. An error in the
  root layout itself gets a minimal 500 without the store chrome.
- **Only the query a page is about** turns into a full error state when it
  fails without data: the order detail in Minha conta and the order of the
  payment step (`?pedido=`). Lists and secondary sections keep their inline
  notice with "Tentar de novo". By error: `not_found` → 404, `forbidden` →
  403, 429 → countdown, API unreachable → sem conexão, anything else → 500.
- **Sessão expirada only when the session really expired**: the backend
  refused to renew it (refresh → 401) while the shopper was signed in. A
  visitor who never signed in, or who clicked Sair, still goes straight to
  Entrar as before. The notice survives a reload of that tab; signing in
  clears it.

## Decisions

Asked and answered (2026-10-02):

- Sessão expirada only on a real expiry, not on every signed-out visit.
- Full-page states only for the page's main query; secondary sections keep
  inline errors.
- Extras beyond the mockup: "sem conexão / API fora" and "403 acesso
  negado".

Derived:

- The 429 countdown uses the response's `Retry-After`; when the browser
  can't read it (see backend pendencies) it uses the mockup's default, 30 s.
- The trace code shown is OrderCore's `traceId` (32 hex, what the logs are
  searched by), not the W3C `traceparent` format drawn in the mockup.
