# @alexandria/ax

`@alexandria/ax` contains the Alexandria deterministic CLI. The public binary is
`ax`.

Public surfaces:

```bash
ax init [all|project|orchestration] [--workspace <path>] [--json]
ax start [all|server|viewer] [options]
ax run <play-id> [--detach] [--adapter-command <command>] [--json]
ax cards validate-plan --plan <path> --lexicon <path> [--json]
ax cards publish --plan <path> --contract <id> --candidate <path> --actor <json> --lexicon <path> [--json]
ax raven vision slot update --slot <slot-id> (--text <text>|--text-file <path>) [--json]
ax raven vision slot approve --slot <slot-id> [--json]
ax raven vision slot skip --slot <slot-id> [--json]
ax inspect state [--json]
ax inspect events list|append|schema|validate ...
ax inspect triggers list ...
ax doctor [--json]
ax version
ax upgrade [--version <version>] [--dry-run]
```

Raven Vision collaboration is intentionally one slot at a time. A Raven update
uses the runtime-backed reducer path, appends `raven.vision.slot.updated`, and
marks only the targeted slot `needs_review`:

```bash
ax raven vision slot update \
  --slot shift \
  --text "The category changed shape." \
  --json
```

When the director explicitly approves or skips a slot in a Claude Code mediated
session, record that review through the runtime-backed review commands:

```bash
ax raven vision slot approve --slot shift --json
ax raven vision slot skip --slot person --json
```

Discover supported event types and payload fields before writing state events
through the append surface:

```bash
ax inspect events schema --json
```

```bash
ax inspect events append \
  --type play.started \
  --payload '{"agentId":"raven","playId":"source-assessment","playRunId":"run-1"}' \
  --idempotency-key viewer:run-1 \
  --json
```
