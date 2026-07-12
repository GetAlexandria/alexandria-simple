# Codex App-Server Adapter

This is the Codex host contract and CLI adapter.

## Scope

The Codex adapter consumes the same Alexandria runtime cursor and subscription
contract as the Claude Code monitor:

- Event pages come from `GET /api/events?cursor=<cursor-id>&limit=<n>`.
- Cursor advancement uses `POST /api/cursors/<cursor-id>/advance`.
- The default cursor id for a target thread is `host:codex:<thread-id>`.
- The adapter must not store a private cursor outside
  `docs/alexandria/.runtime/cursors/`.
- The adapter must not edit Codex rollout files, private TUI state, or any
  other Codex-owned persistence directly.

The target `thread-id` and app-server endpoint are supplied by the host
integration that launches the adapter. The managed `ax start` supervisor maps
project roots to loaded Codex threads, but that mapping still resolves to the
same connection/cursor id shape.

```bash
ax internal host codex monitor \
  --thread <thread-id> \
  --app-server ws://127.0.0.1:<port> \
  --once
```

Use `--follow` for a long-running adapter loop. Use `--start-turn` when the
adapter should call `turn/start` after injecting matched events.

The managed `ax start` path installs or refreshes the local Alexandria
Codex plugin before starting the app-server so `alexandria:alexandria-event-log` is
available to sessions launched through `ax codex`.

## Event Handling

For each source event returned by the runtime cursor API:

1. Match the source event against wake subscriptions attached to the Codex
   connection.
2. For ignored events, advance the cursor with no Codex app-server call.
3. For matched events, append `session.wake.requested` through the Alexandria
   runtime before calling Codex.
4. Call Codex `thread/inject_items` with one Responses API `message` item whose
   `content[0].text` is the compact Alexandria wake payload:

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

5. If `--start-turn` is set, call `turn/start` after `thread/inject_items`
   with the stable visible marker `🅰 Alexandria: Update incoming`. Codex
   app-server accepts an empty turn input but does not create a durable agent
   turn from it.
6. Append `session.wake.delivered` or `session.wake.failed`, then advance the
   cursor.

`session.wake.delivered` means every requested app-server method was accepted.
If `thread/inject_items` succeeds but `turn/start` fails, the adapter records
`session.wake.failed` because the requested delivery was incomplete. The adapter
does not observe or record the resulting turn's final outcome after `turn/start`
is accepted.

Current app-server behavior renders the `turn/start` input as a user-visible
message in Codex. The injected event itself is still external event context,
not human-authored text. A dedicated external-event role would be a better UI
fit when the app-server protocol exposes one.

`session.wake.*` records use the same idempotency-key shapes as the Claude
monitor, replacing the host segment with `codex`.

## App-Server Transport

The adapter uses the Codex app-server WebSocket transport and performs the
required `initialize` request and `initialized` notification before each
injection batch. All app-server requests and notifications include the
JSON-RPC `jsonrpc: "2.0"` field. The app-server protocol shape is generated
locally with:

```bash
codex app-server generate-ts --experimental --out <dir>
```

Current implementation note: app-server transport failures are recorded as
`session.wake.failed`, and the Alexandria cursor still advances so one bad
delivery cannot wedge a connection. Retry/backoff policy can be added later if
we decide failed deliveries should remain pending.
