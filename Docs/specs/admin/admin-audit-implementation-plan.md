# Admin · Auditoria — implementation plan

Spec: `Docs/specs/admin/admin-audit.md`.

## Feature `src/features/admin-audit/`

- `schemas/admin-audit.schema.ts` — `AuditLogResponse` (+ page).
- `api/admin-audit.ts` — list (`EntityName`, `EntityId`, `UserId`, `Page`,
  `PageSize`), the user's `UserAccountCreated` record, customer name.
- `lib/audit.ts` (+spec) — entity tabs ↔ `?entidade=`, action labels
  (all of `AuditLogActionNames`), metadata labels and ordering, entity
  links per entity/metadata, UUID detection for the search, short ids,
  actor from the resolved account.
- `hooks/admin-audit.queries.ts` — log page; actors of the page (one
  query, cached per user).
- `components/audit-page.tsx` — header, tabs, search, the expandable
  table, read-only note, pagination.

## Wiring

- `src/app/admin/(panel)/audit/page.tsx`; `appRoutes.admin.audit`;
  AdminNav `audit` gets its `href`.
- `queryKeys.admin.audit…`, `auditActor(userId)`.
