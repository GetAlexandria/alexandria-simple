# Claude Code Plugin Monitor

This is the Claude Code host contract for delivering Alexandria event-log
wakes into an interactive Claude Code session.

## Scope

The Claude Code monitor consumes the same Alexandria runtime cursor and
subscription contract as the Codex app-server adapter:

- Event pages come from `GET /api/events?cursor=<cursor-id>&limit=<n>`.
- Cursor advancement uses `POST /api/cursors/<cursor-id>/advance`.
- The default connection and cursor id is `host:claude-code:default`.
- The monitor must not store a private cursor outside
  `docs/alexandria/.runtime/cursors/`.
- The monitor must not edit Claude Code session logs, rollout files, or private
  host persistence directly.

The Claude Code plugin declares the monitor in
`packages/alexandria-plugin/monitors/monitors.json`:

```json
[
  {
    "name": "alexandria-state-wake-loop",
    "command": "${CLAUDE_PLUGIN_ROOT}/scripts/claude-monitor.sh --follow --json-lines",
    "description": "Alexandria event monitor"
  }
]
```

The wrapper script exits quietly when the current directory is not an
Alexandria project or `ax` is unavailable. Otherwise it delegates to:

```bash
ax internal host claude monitor \
  --connection <connection-id> \
  --cursor <cursor-id> \
  --follow \
  --json-lines
```

When no connection is supplied, the wrapper uses
`ALEXANDRIA_CLAUDE_CONNECTION_ID` or falls back to
`host:claude-code:default`. A Claude Code session is one connection. That
connection can have many wake subscriptions attached to it.

## Event Handling

For each source event returned by the runtime cursor API:

1. Match the source event against wake subscriptions attached to the Claude Code
   connection.
2. For ignored events, advance the cursor with no monitor output.
3. For matched events, append `session.wake.requested` through the Alexandria
   runtime.
4. Prepare exactly one stdout line for Claude Code's plugin monitor to deliver
   to the interactive session. With `--json-lines`, the line is the compact
   Alexandria wake payload:

   ```json
   {
     "message": "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
     "event": {
       "id": "<event-id>",
       "type": "<event-type>",
       "at": "<iso-timestamp>",
       "actor": {},
       "payload": {}
     }
   }
   ```

5. Append `session.wake.delivered` or `session.wake.failed`, then advance the
   cursor. The monitor command writes prepared wake lines to stdout immediately
   after the pass accepts delivery.

The monitor emits wake payloads on stdout only. Diagnostics go to stderr so
Claude Code receives only intentional monitor notifications.

`session.wake.delivered` means the adapter accepted the stdout-json-lines
delivery path for the matched event. The monitor does not observe or record the
Claude Code turn's final outcome after Claude Code receives the monitor line.

`session.wake.*` records use the same idempotency-key shapes as the Codex
adapter, replacing the host segment with `claude-code`.

## Subscriptions And Connections

Subscriptions are durable event match rules attached to a connection. They are
registered with:

```bash
ax inspect subscriptions register \
  --connection <connection-id> \
  --subscription <subscription-id> \
  --type <event-type> \
  --host claude-code
```

Each monitor pass refreshes a short-lived connection lease under
`docs/alexandria/.runtime/connections/`. The viewer and
`ax inspect connections list` use those leases to show whether a Claude Code
session is connected, stale, and which subscriptions are attached.

## Plugin Monitor Transport

Claude Code owns the long-running process lifecycle for plugin monitors. The
Alexandria plugin only declares the command; Claude Code starts it for an
interactive session and forwards stdout lines into the session as monitor
notifications.

The wrapper script keeps host integration shallow:

- It gates on `.alexandria/alexandria-config.json` so unrelated projects
  do not start noisy monitors.
- It requires `ax` on `PATH`.
- It supplies the connection/cursor defaults.
- It delegates all event matching, wake auditing, cursor advancement, and lease
  refresh behavior to the AX host adapter.

Current implementation note: monitor delivery failures are recorded as
`session.wake.failed`, and the Alexandria cursor still advances so one bad
delivery cannot wedge a connection. Retry/backoff policy can be added later if
we decide failed deliveries should remain pending.
