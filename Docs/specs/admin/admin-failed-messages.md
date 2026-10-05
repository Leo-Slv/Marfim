# Admin · Mensagens com falha (`/admin/failures`)

Mockup: `Docs/design/mockups/AdminFalhas.dc.html`.

## Why

OrderCore's modules talk through messages (an order confirmed → the e-mail,
the order timeline, live updates…). When a message can't be handled after
its automatic retries, something downstream didn't happen. The team needs
to see what, why, and either send it again or give up on it on purpose.

## What

- "SISTEMA · Mensagens com falha", the explanation line, and
  **Reprocessar todas** (pending ones) when there are any.
- Tabs **Pendentes** (default) / **Reprocessadas** / **Descartadas** with
  counts — the last two are the history.
- **Card per message**: warning icon; what it was in pt-BR ("Pedido
  cancelado → E-mails de pedido") with the technical type and consumer in
  mono; the error as recorded; "N TENTATIVAS" and when it last failed;
  **Detalhes** / Ocultar → the message body (pretty JSON) and the error in
  a dark box; **Reprocessar** (spinner "Reprocessando") and **Descartar**
  with inline confirmation stating the consequence for that consumer
  ("O cliente não recebe o e-mail deste evento."), **Manter** to go back.
- Toasts: "Mensagem reenviada — se falhar de novo, ela volta para esta
  lista." / "Mensagem descartada".
- Empty state: "Fila limpa · Nenhuma mensagem com falha agora."
- The menu badge and these lists refresh after every action (and every
  30 s). Tab in the URL (`?status=`).

## Decisions

Asked and answered (2026-10-05):

- Test with real failures: two messages with an invalid contract were
  published to the order e-mails queue (OrderCore records those as failed
  at once).

Derived:

- "Reprocessar" puts the message back on its consumer's queue; OrderCore
  can't say yet whether it will work, so the toast says so. If it fails
  again it comes back as a new entry.
- "Reprocessar todas" replays the pending ones one by one (no bulk
  endpoint).
- The error and the body are shown as recorded (English, technical): this
  is an operations screen.
