# Admin · Entrar (`/admin/login`)

Mockup: `Docs/design/mockups/AdminLogin.dc.html` — the form and its error
variants (credenciais, sem permissão, conta inativa, muitas tentativas,
sessão expirada) and the "Bem-vindo de volta" state.

## Why

The admin panel (dashboard, pedidos, produtos, estoque…) is for the store's
team only. Its door is a sign-in of its own, separate from the storefront's
Entrar: it only lets in accounts with OrderCore's `Admin` role and says so
clearly when a shopper's account tries it.

## What

- **Layout**: two columns on wide screens. Left, a dark panel — marfim.
  wordmark with the **ADMIN** badge, a slowly turning dotted ring,
  "Pedidos, peças e ateliês **num só painel.**", three animated bars as a
  pure illustration (no numbers or labels — the page is public, there's no
  real data to show before signing in) and "ACESSO RESTRITO À EQUIPE".
  Right, the form. On narrow screens only the form shows, with the
  wordmark + ADMIN above it.
- **Form**: "PAINEL DE ADMINISTRAÇÃO · Entrar no painel", E-mail, Senha,
  **Manter conectado neste computador** (checked by default), Entrar
  ("Entrando…" with a spinner while sending); "Esqueci minha senha" (the
  store's recovery flow — same accounts) and "Ir para a loja".
- **Errors** (shake on each new one):
  - wrong e-mail/password → "E-mail ou senha incorretos.";
  - deactivated account → "Esta conta foi desativada. Fale com quem
    gerencia a loja.";
  - too many attempts → "Muitas tentativas. Tente de novo em N segundos."
    with the button locked ("Aguarde Ns") until the wait ends;
  - API unreachable → "Não conseguimos falar com a loja agora…";
  - invalid e-mail → the field turns red before anything is sent.
- **Sem acesso ao painel**: valid credentials of an account without the
  admin role → "A conta {e-mail} existe, mas não tem permissão de
  administrador. Peça acesso a quem gerencia a loja." with "Usar outra
  conta" (back to the form, password cleared) and "Ir para a loja". No
  session is left behind by that attempt.
- **Sessão expirada**: when the admin's session ended because the backend
  refused to renew it, the form opens with "Sua sessão terminou. Entre de
  novo para voltar a **{seção}**."
- **Bem-vindo de volta**: success, then straight on to where the admin was
  going (`?next=` inside `/admin`, else the dashboard); "Abrir o dashboard"
  goes there at once.
- Opening `/admin/login` already signed in as an admin skips the form.

## Gate for `/admin/*`

Signed-out visitors go to `/admin/login?next=…`; an expired session goes
there too, with the notice; a signed-in shopper sees the 403 state. (`/admin`
was a placeholder until the dashboard — `Docs/specs/admin/admin-dashboard.md`.)

## Decisions

Asked and answered (2026-10-02):

- After signing in: back to `?next=`, else "Bem-vindo de volta" →
  `/admin`, a protected placeholder until the dashboard exists.
- The dark panel's stats become an illustration without numbers.
- "Manter conectado" is real: unchecked, the session ends when the browser
  closes.

Derived:

- One session per browser, shared with the storefront (same identity
  system): signing in as admin replaces a shopper's session on this
  browser (the replaced one is ended on the server).
- The role is checked by the BFF right after OrderCore signs in; a
  non-admin's new session is ended at once and never reaches the browser.
