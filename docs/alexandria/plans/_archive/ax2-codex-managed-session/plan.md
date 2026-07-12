# AX2 Managed Codex Session

## Status

Implementation branch: `codex/codex-event-wake-path`

## Goal

Make Codex integration a normal local Alexandria workflow:

```bash
ax2 start
ax2 codex
```

Users should not manually start `codex app-server` or an event monitor. `ax2
start` owns the local substrate, and `ax2 codex` launches a regular Codex TUI
connected to that substrate.

## Architecture

`ax2 start` becomes the long-running local supervisor:

- starts the Fabro orchestration server
- starts the Alexandria viewer/runtime API
- starts a Codex app-server unless disabled with `--no-codex`
- starts an internal Codex host supervisor

The Codex host supervisor is internal architecture. It is responsible for:

- discovering Codex threads loaded in the AX2-managed app-server
- filtering discovered threads to the current project root
- reconciling configured Alexandria subscriptions for each thread
- running the existing event wake delivery loop for each Codex connection

`ax2 codex` is a shortcut for launching Codex against the managed app-server:

```bash
codex --remote <managed-app-server-endpoint> --cd <project-root> ...
```

Before launching the app-server, `ax2 start` installs or refreshes the local
Alexandria Next Codex plugin from the repo-local marketplace so the managed
Codex session can see Alexandria skills such as `alexandria-next:alexandria-event-log`.

When a wake starts a Codex turn, the app-server currently renders the
`turn/start` input as user-visible text. The adapter uses the stable marker
`🅰 Alexandria: Update incoming` and leaves event-specific context in the
injected JSON payload; a future Codex protocol/UI event role would be a better
fit for clearly non-user-authored wake metadata.

## Runtime State

Use the existing repo-local runtime directory. Do not create a new top-level
config file.

```text
docs/alexandria/.runtime/codex-app-server.json
```

The metadata records the app-server endpoint, PID, project root, workspace path,
and start time. It is written atomically and reclaimed when the process is no
longer alive.

## Subscription Bootstrap

Long term, subscription bootstrap should come from Alexandria config:

```json
{
  "codex": {
    "enabled": true,
    "startTurn": true,
    "subscriptions": [
      { "id": "reviews", "types": ["canvas.review.requested"] },
      { "id": "intents", "types": ["play.intent.created"] }
    ]
  }
}
```

For the first implementation, missing config resolves to those defaults. When a
thread is discovered, the reconciler writes durable subscriptions for that
connection:

```text
connectionId = host:codex:<thread-id>
subscriptionId = host:codex:<thread-id>:<subscription-id>
```

## Effect Design

The implementation should use Effect for lifecycle boundaries:

- service/layer style for app-server process ownership
- scoped cleanup for app-server and sidecar fibers
- schedule-based polling for thread discovery
- typed operational failures surfaced as CLI results

The core monitor behavior should remain host-neutral and reusable. Existing
`ax2 internal host codex monitor` stays available as a deterministic test/debug
primitive, while the product path runs the same wake pass internally from
`ax2 start`.

## Implementation Slices

1. Add Codex app-server metadata domain and runtime paths.
2. Add an injectable Codex app-server supervisor service.
3. Extend `ax2 start all` with `--no-codex`, `--codex-port`, and JSON output.
4. Add Codex plugin marketplace bootstrap for the app-server.
5. Add Codex thread discovery and subscription reconciliation.
6. Run the Codex wake loop internally from `ax2 start`.
7. Add `ax2 codex` to launch the TUI against managed metadata.
8. Add focused tests for metadata, startup JSON, disabled Codex mode, TUI
   launcher behavior, thread discovery, subscription reconciliation, and wake
   delivery through a fake app-server.
9. Run full package validation and a real local smoke test.

## Risks

- `codex --remote` may not emit a thread immediately. The supervisor must handle
  late thread discovery.
- `thread/started` notifications may not cover resumed sessions. Polling
  `thread/loaded/list` and `thread/read` is the durable fallback.
- App-server process cleanup must not be tied to viewer-only cleanup; `ax2 start`
  needs one combined cleanup path.
