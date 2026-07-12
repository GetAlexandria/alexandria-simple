# Architecture Notebook

Newest entries go first. Each entry should be timestamped with local time.

## 2026-05-14 10:31:24 EDT - Alexandria Source Assessment Slice

### Plan

The first Alexandria vertical slice should be Source Assessment, not a
general trigger system or noun-index setup. The slice is intentionally narrow:
drop a source file into an Alexandria inbox, detect one active inbox-source
trigger, suggest Source Assessment, record an assessment, append ledger history,
show the state in Alexandria viewer, and smoke it in a real external project.

Runtime paths for this slice:

- Config: `.alexandria/alexandria-config.json`
- Workspace: `docs/alexandria`
- Inbox: `docs/alexandria/inbox/`
- Ledger: `docs/alexandria/ledger/events.jsonl`
- Source assessments: `docs/alexandria/source-assessments/`

The source identity is path plus content hash:

```ts
{
  path: "docs/alexandria/inbox/product-vision.md",
  inboxRelativePath: "product-vision.md",
  contentHash: "sha256:<hex>"
}
```

The trigger is a derived state row, not a durable trigger object:

```ts
{
  triggerType: "inbox.source.pending",
  suggestedPlay: "source-assessment",
  source: SourceIdentity
}
```

`assessment.recorded` does not clear the trigger. The inbox source stays pending
until a future ingestion play exists and records a matching ingest event.

Initial CLI surface:

```bash
ax triggers list --json
ax triggers detect --json
ax sources assess record --source <path> --assessment <path> --readiness READY|GAPS|BLOCKED --json
```

`triggers list` should be read-only. `triggers detect` may append non-duplicate
`trigger.fired` events using a natural idempotency key. `sources assess record`
validates the source, assessment artifact, and readiness, then appends
`assessment.recorded`.

The main architectural primitive should be a pure projection:

```text
project files + ledger events -> current Alexandria state
```

CLI commands, Alexandria viewer, and tests should consume the same state derivation
rather than each re-implementing trigger or assessment state.

### Effect Cleanup Observations

`ax` is already Effect-based, but its current support services and CLI
parsing are still local hand-rolled layers. For this slice, keep the change
small, but improve the new surfaces by leaning harder on Effect patterns:

- Use `effect/Schema` for config, source identity, trigger payload,
  assessment-record payload, and ledger event validation.
- Use typed domain errors with `Data.TaggedError` or `Schema.TaggedError`
  instead of broad generic `Error` values in new domain code.
- Keep command handlers thin and move core behavior into pure domain modules
  such as `sources`, `triggers`, `assessments`, and `project-state`.
- Do not add `Stream`, `Queue`, `PubSub`, `Schedule`, SQL event journals, or a
  general rules engine for this slice; those fit watchers, async processing,
  or larger event systems, which are explicit non-goals today.

Potential cleanup after the slice is working:

- Add `@effect/platform` and `@effect/platform-bun` so `ax` can use the
  standard `FileSystem` and `Path` services instead of its local service.
- Consider `@effect/cli` only if the whole `ax` parser is intentionally
  refactored. Do not introduce it just for the Source Assessment commands.
