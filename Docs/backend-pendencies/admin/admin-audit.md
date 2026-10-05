# Backend pendencies — Admin · Auditoria

Spec: `Docs/specs/admin/admin-audit.md`. Mockup:
`Docs/design/mockups/AdminAuditoria.dc.html`.

## 1. No before/after

- **Mockup expects**: ANTES / DEPOIS for each change.
- **Backend today**: `AuditLogResponse.metadata` — a key/value bag of the
  event's data (e.g. `newPrice`, `reason`), no previous values.
- **To close**: record the previous values of changed fields.
- **Workaround**: "Detalhes" lists the metadata.
- **Severity**: Feature gap.

## 2. Actor is an id only

- **Mockup expects**: the actor's name.
- **Backend today**: `userId` (Identity user id); no admin endpoint to read
  a user account; customers are a different id.
- **To close**: `actorName`/`actorRole` on the log (or a user lookup).
- **Workaround**: per distinct user on the page, its `UserAccountCreated`
  record (`Action=UserAccountCreated&UserId=`) gives role and customer id →
  `GET /api/customers/{id}` for the name; admins without that record show
  "Administrador".
- **Severity**: Cosmetic (performance).

## 3. No free-text search

- **Mockup expects**: "Quem, ação ou ID".
- **Backend today**: exact filters only (`EntityName`, `EntityId`,
  `UserId`, `Action`).
- **To close**: a `SearchTerm`.
- **Workaround**: full IDs search by entity, then by user; text is EM
  BREVE.
- **Severity**: Feature gap.

## 4. Human references and missing entities

- **Mockup expects**: "MF-000229", "pendente-orbe"; a "Categoria" type.
- **Backend today**: `entityId` is a UUID; categories, stock receipts and
  adjustments aren't audited.
- **To close**: a display reference on the log; audit the catalog's
  categories and inventory changes.
- **Workaround**: short UUID with links to the record's admin screen; no
  Categoria tab.
- **Severity**: Cosmetic.

## 5. Partial refunds aren't audited

- **Mockup expects**: "Estornou pagamento" for every refund.
- **Backend today**: `RequestRefundUseCase` records `PaymentRefunded` only
  once the refunds add up to the full amount, and with `userId: null` even
  when an admin asked for it (found while testing: a R$ 10 refund left no
  audit record).
- **To close**: audit every refund request with the admin's user id (and
  the settlement as `PaymentRefundSettled`).
- **Workaround**: none on this screen; the payment's own events
  (Admin · Pagamentos) list every refund.
- **Severity**: Feature gap.
