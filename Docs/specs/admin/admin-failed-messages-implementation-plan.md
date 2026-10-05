# Admin · Mensagens com falha — implementation plan

Spec: `Docs/specs/admin/admin-failed-messages.md`.

## Feature `src/features/admin-failed-messages/`

- `schemas/failed-messages.schema.ts` — summary (+ page), details (body,
  traceParent).
- `api/failed-messages.ts` — list (`Status`, `Page`, `PageSize`), count,
  details, replay, discard.
- `lib/failed-messages.ts` (+spec) — tabs ↔ `?status=`, event type and
  consumer labels, consequence per consumer, attempts copy, body
  pretty-printing, error copy.
- `hooks/failed-messages.queries.ts` — list, counts, details (on open),
  replay / discard / replay all (refresh the lists, counts and the menu
  badge).
- `components/failed-messages-page.tsx` — header, tabs, cards with details,
  confirmations, empty state.

## Wiring

- `src/app/admin/(panel)/failures/page.tsx`; `appRoutes.admin.failures`;
  AdminNav `failures` gets its `href` (the last EM BREVE item).
- `queryKeys.admin.failedMessages…`.
