# Account access — Acesso (`/login`, `/register`, `/forgot-password`, `/confirmar-email`, `/redefinir-senha`)

Mockup: `Docs/design/mockups/Acesso.dc.html` (screens 08–13), with the
shared `Header` (logged-in state and the confirm-e-mail banner), `Footer` and
`Art`.

## Why

Checkout in OrderCore requires a signed-in customer with a confirmed e-mail.
Shoppers need to create an account, sign in, prove they own their e-mail and
recover a forgotten password — and stay signed in across visits without
retyping their password every 15 minutes (the access token's lifetime).

## What

All screens share one layout: an indigo side panel ("SUA CONTA MARFIM ·
Cada peça, do ateliê até você.", floating vase drawing, three account
benefits; hidden below 980 px) and the form column.

- **Entrar** (`/login?next=`) — e-mail, password (show/hide), "Esqueci minha
  senha", "Criar conta". Errors: wrong credentials, deactivated account, too
  many attempts (button locked with a live countdown). Success shows "Você
  entrou — Voltando para onde você estava…" and returns to `next` (default:
  home), with "Voltar para a sacola" / "Minha conta" shortcuts.
- **Criar conta** (`/register?next=`) — full name, e-mail, password with a
  3-bar strength meter and the backend's rules (8–128 characters, a letter,
  a number), terms checkbox (required to submit). Errors: invalid e-mail,
  weak password, e-mail already registered (with an "Entrar" shortcut), too
  many attempts. Success signs the shopper in and opens "Confirme seu
  e-mail".
- **Confirme seu e-mail** (`/confirmar-email` without a token) — "Enviamos um
  link para {email}. Ele vale por 24 horas…", "Reenviar link" (states: sent,
  already confirmed, too many attempts with countdown), "Continuar
  navegando", "Usar outro e-mail". Needs a session; without one it sends the
  shopper to Entrar and back.
- **E-mail confirmado** (`/confirmar-email?token=` — the link in the
  backend's e-mail) — confirms on open; success "E-mail confirmado" (the
  session is refreshed so checkout sees it) with "Ir para a sacola" /
  "Continuar comprando"; failure "Esse link expirou" with "Enviar novo link".
- **Esqueci a senha** (`/forgot-password`) — e-mail → always the same
  neutral answer ("Se houver uma conta com {email}, enviamos o link. Ele vale
  por 30 minutos."), so the form can't reveal who has an account.
- **Nova senha** (`/redefinir-senha?token=` — the link in the backend's
  e-mail) — new password with the strength meter + repeat (must match).
  Success "Senha alterada — encerramos todas as sessões" → Entrar; invalid
  link "Esse link expirou" → Esqueci a senha.

### Session

- Signing in or up starts a session that renews itself silently while the
  shopper keeps using the store (up to the refresh token's 14 days), across
  tabs.
- The long-lived refresh token never reaches the page's JavaScript: the
  storefront's own server keeps it in an httpOnly cookie.
- The header shows "Minha conta" instead of "Entrar" when signed in, and —
  while the e-mail isn't confirmed — the banner "Confirme seu e-mail para
  poder finalizar compras…" with "Reenviar link".
- Opening Entrar/Criar conta while signed in goes straight to `next`.

Motion: fade-ups, shake on errors, popping check that draws itself,
floating vase, flying envelope, rotating orbit; all off under reduced
motion.

## Decisions (resolved with the user, 2026-10-02)

1. Tokens: a BFF in the Next app (`/api/session/*`) talks to OrderCore for
   sign-in/sign-up/refresh/sign-out and keeps the refresh token in an
   httpOnly cookie; the page only holds the short-lived access token.
2. After signing in, return to where the shopper was (`?next=`), after a
   brief "Você entrou".

Derived (no new decision): the two routes the backend's e-mails link to keep
the backend's configured pt-BR paths (`/confirmar-email`,
`/redefinir-senha`, `Identity:Links` in OrderCore's `appsettings.json`) —
same precedent as Plataforma VDG's shared `/primeira-vez`; the other auth
routes follow the app's English paths.

## Out of scope

Minha conta (Conta.dc), sign-out UI (comes with Minha conta), changing the
password while signed in, admin sign-in (AdminLogin.dc).

Backend gaps: `Docs/backend-pendencies/auth/access.md`.
