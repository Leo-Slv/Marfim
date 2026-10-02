# Backend pendencies — Admin · Entrar

Spec: `Docs/specs/admin/admin-login.md`. Mockup:
`Docs/design/mockups/AdminLogin.dc.html`.

## 1. No admin-only sign-in

- **Mockup expects**: "Sem acesso ao painel" for a shopper's credentials,
  without that shopper being signed in.
- **Backend today**: `POST /api/auth/sign-in` (`SignInUseCase`) issues
  tokens for any active account, whatever its role; the role only comes
  back in `AuthTokensResponse.Role`.
- **To close**: an admin sign-in (e.g. `auth/sign-in` with a required role,
  or `auth/admin/sign-in`) answering `403 not_admin` before issuing tokens.
- **Workaround**: the BFF (`/api/session/admin-sign-in`) signs in, checks
  the role and, for a non-admin, signs that session out at once and answers
  `403 not_admin` — no cookie is set. The attempt still shows up as a
  sign-in + sign-out in OrderCore's logs/audit.
- **Severity**: Cosmetic.

## 2. "Manter conectado" can't shorten the session on the server

- **Mockup expects**: unchecked, the admin is signed out when leaving.
- **Backend today**: every refresh token lives 14 days
  (`Jwt:RefreshTokenDays`, `JwtOptions`), with no per-sign-in choice.
- **To close**: a `rememberMe` flag on sign-in choosing a short refresh
  lifetime (e.g. 12 h) vs the long one.
- **Workaround**: unchecked, the BFF stores the refresh token in a
  session cookie (gone when the browser closes) and keeps doing so on every
  renewal; the token itself stays valid upstream until it expires or is
  rotated.
- **Severity**: Feature gap.

## 3. No public summary for the panel illustration

- **Mockup expects**: "Confirmados 8 / Em preparo 5 / Meta do dia R$ 700"
  (marked "dados de exemplo").
- **Backend today**: order counts are admin-only; there's no "daily goal"
  anywhere.
- **Workaround**: the bars are an illustration without numbers (decided
  with the user). Nothing to close — real numbers belong on the dashboard.
- **Severity**: Cosmetic.

## 4. Password recovery lands on the storefront

- **Mockup expects**: "Esqueci minha senha" from the admin sign-in.
- **Backend today**: one recovery flow; the e-mail links to
  `/redefinir-senha` (`Identity:Links`), which ends on the store's Entrar.
- **To close**: a `returnTo`/audience on the reset request if admins should
  land back on `/admin/login`.
- **Workaround**: the link opens the store's "Esqueci minha senha"; it
  works for admin accounts too.
- **Severity**: Cosmetic.
