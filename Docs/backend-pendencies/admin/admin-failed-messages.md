# Backend pendencies — Admin · Mensagens com falha

Spec: `Docs/specs/admin/admin-failed-messages.md`. Mockup:
`Docs/design/mockups/AdminFalhas.dc.html`.

## 1. No bulk replay

- **Mockup expects**: "Reprocessar todas".
- **Backend today**: `POST /api/messaging/failed-messages/{id}/replay`, one
  at a time (`FailedMessagesController`).
- **To close**: a bulk replay (all pending, or by consumer).
- **Workaround**: the screen replays the pending ones in sequence.
- **Severity**: Cosmetic.

## 2. No stack trace; error is one line

- **Mockup expects**: the error summary plus a stack trace.
- **Backend today**: `lastError` (exception type + message, capped at
  `FailedMessage.MaxErrorLength`); the trace is only in the logs (search by
  the message's `traceParent`).
- **To close**: store the stack (or link to the trace).
- **Workaround**: error + message body; the `traceParent` is shown when
  present.
- **Severity**: Cosmetic.

## 3. No description of the impact

- **Mockup expects**: "A cliente não recebe o e-mail de confirmação."
- **Backend today**: only the technical `type` and `consumer`.
- **Workaround**: pt-BR labels and consequences per known consumer/type in
  `src/features/admin-failed-messages/lib/failed-messages.ts`; a generic
  sentence for unknown ones.
- **Severity**: Cosmetic.

## 4. E-mail delivery failures don't show up here

- **Mockup expects**: "OrderConfirmedEmail · SMTP 421" in this list.
- **Backend today**: the Notifications consumer only queues the e-mail;
  sending is retried in Notifications' own table and a failed send never
  becomes a failed message (found while testing with Mailpit down).
- **To close**: an admin view (or failed-message entry) for e-mails that
  gave up.
- **Workaround**: none — e-mail send failures are only in the API logs.
- **Severity**: Feature gap.
