# AX2 Source Assessment Slice

- Issue reference: none yet
- Goal: implement the first Alexandria II Source Assessment vertical slice
  across deterministic CLI state, then extend through plugin, viewer, eval, and
  external smoke surfaces.
- Linked product plan: `docs/architecture-notebook.md`, entry
  `2026-05-14 10:31:24 EDT - Alexandria II Source Assessment Slice`.

## Scope

- Treat Source Assessment as the first Alexandria II play slice.
- Add deterministic AX2 support for inbox source discovery and active trigger
  projection.
- Keep the first implementation chunk read-only except for `ax2 init`
  scaffolding the required directories.
- Preserve the contract that assessment records do not clear inbox-source
  triggers.
- Prepare the next steps for trigger event recording, assessment recording,
  plugin skill routing, Viewer Next state visibility, and one narrow eval.

## Non-Goals

- Building a general trigger system or rules engine.
- Adding a long-running watcher, daemon, queue, or background processor.
- Implementing source ingestion or trigger resolution.
- Migrating Alexandria 1 surfaces or replacing existing plugin behavior.
- Adding `@effect/cli` or refactoring the whole AX2 parser in this slice.
- Moving `ax-next` to `@effect/platform` before the Source Assessment slice is
  proven.

## Current Gap

`ax2 init` creates the Alexandria Next config, workspace, and ledger file, but
it does not scaffold the inbox or source-assessment directories.

AX2 has a ledger command and the `source-assessment` play id exists, but there
is no deterministic source discovery, trigger projection, trigger command, or
assessment recording command.

The Alexandria Next start skill only checks initialization state. It cannot yet
observe pending inbox sources or suggest Source Assessment.

Viewer Next is still a shell and cannot show project state, inbox files,
triggers, or assessment records.

## Architectural Boundaries

The core architectural primitive is a pure projection:

```text
project files + ledger events -> current Alexandria state
```

The trigger is derived state, not a durable trigger object. The CLI may record a
`trigger.fired` observation later, but active trigger state must be derivable
from inbox files and ledger history.

AX2 owns deterministic filesystem inspection, hashing, validation, JSON output,
and ledger appends. The Alexandria Next plugin owns play workflow and user-facing
guidance. Viewer Next reads the same project-state contract rather than
inventing its own trigger rules.

New AX2 domain code should use Effect patterns where practical:

- `effect/Schema` for new contract validation.
- Typed domain errors for expected operational failures.
- Thin command handlers over pure domain modules.

Do not introduce Effect `Stream`, `Queue`, `PubSub`, `Schedule`, SQL event
journals, or a generic rules engine for this slice.

## Contract

Runtime paths:

| Artifact | Path |
|----------|------|
| Config | `.alexandria-next/alexandria-config.json` |
| Workspace | `docs/alexandria` |
| Inbox | `docs/alexandria/inbox/` |
| Ledger | `docs/alexandria/ledger/events.jsonl` |
| Source assessments | `docs/alexandria/source-assessments/` |

Source identity:

```ts
{
  path: "docs/alexandria/inbox/product-vision.md",
  inboxRelativePath: "product-vision.md",
  contentHash: "sha256:<hex>"
}
```

Trigger shape:

```ts
{
  triggerType: "inbox.source.pending",
  suggestedPlay: "source-assessment",
  source: SourceIdentity
}
```

Initial CLI surface:

```bash
ax2 triggers list --json
ax2 triggers detect --json
ax2 sources assess record --source <path> --assessment <path> --readiness READY|GAPS|BLOCKED --json
```

`triggers list` is read-only. `triggers detect` appends non-duplicate
`trigger.fired` events later. `sources assess record` validates source,
assessment artifact, and readiness, then appends `assessment.recorded`.

`assessment.recorded` does not clear the pending inbox-source trigger. A future
ingestion play will define the event that clears it.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| CLI init | `packages/ax-next/src/commands/init.ts` | Create inbox and source-assessment directories |
| CLI paths | `packages/ax-next/src/domain/paths.ts` | Add shared path constants/helpers |
| CLI domain | `packages/ax-next/src/domain/sources.ts`, `triggers.ts`, `project-state.ts` | Derive inbox sources and active triggers |
| CLI command | `packages/ax-next/src/commands/triggers.ts`, router | Add `ax2 triggers list --json` first |
| CLI tests | `packages/ax-next/tests/*.test.ts` | Black-box coverage for init directories and trigger listing |
| Plugin | `packages/alexandria-next-plugin/skills/*` | Later route pending sources to Source Assessment |
| Viewer | `packages/viewer-next` | Later show initialized state, inbox, triggers, assessment records |
| Eval | AX2 eval location to choose | Later add one source-assessment skill eval |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `ax-next-start` | Later run trigger check after initialization and suggest Source Assessment when inbox triggers exist | Requires `ax2 triggers list` first |
| Source Assessment skill | Later add a new Next skill adapted from Conan Job 0 | Requires assessment record command |
| Alexandria Next docs | Later document inbox and assessment workflow | Requires CLI contract to settle |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 tests | `pnpm --filter @alexandria/ax-next run test` | Black-box command behavior |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Type-level integration |
| AX2 format check | `pnpm --filter @alexandria/ax-next run format:check` | Repo formatting rules |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 CLI | Black-box Bun tests | Add deterministic tests for init and triggers | `pnpm --filter @alexandria/ax-next run test` |
| Next plugin skills | No Source Assessment eval yet | Add one narrow eval after the skill exists | To be defined with eval location |
| Viewer Next | Build/check tests only | Add state dashboard checks after viewer slice | `pnpm --filter @alexandria/viewer-next run check` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Trigger work expands into a rules engine | Keep only `inbox.source.pending` and derive it from files plus ledger |
| CLI and viewer diverge on state rules | Put projection in shared AX2 domain logic first; reuse or mirror the contract deliberately |
| Assessment record is mistaken for trigger resolution | Tests must assert `assessment.recorded` does not clear the trigger |
| Source hashing is unstable across platforms | Hash file bytes/content and normalize stored relative paths with forward slashes |
| Hidden or generated files create noisy triggers | Exclude hidden path segments in inbox traversal |

## Implementation Steps

1. Update `ax2 init` to create `inbox/` and `source-assessments/`.
2. Add source identity helpers for inbox file discovery, relative path
   normalization, and SHA-256 content hashing.
3. Add trigger projection for active `inbox.source.pending` triggers.
4. Add `ax2 triggers list --json` with bounded JSON output.
5. Add black-box tests for empty inbox, one source, nested source, content hash
   changes, hidden-file exclusion, and assessment records not clearing triggers.
6. Add `ax2 triggers detect --json` with idempotent `trigger.fired` ledger
   appends.
7. Add `ax2 sources assess record ...` and deterministic assessment path
   guidance.
8. Update `ax-next-start` to initialize when needed and suggest Source
   Assessment for pending inbox triggers.
9. Add the Source Assessment skill.
10. Add Viewer Next state dashboard.
11. Add one narrow eval and run an external smoke test.

## Acceptance / Exit Criteria

1. `ax2 init` creates config, workspace, ledger, inbox, and source-assessment
   directories and remains idempotent.
2. `ax2 triggers list --json` returns active `inbox.source.pending` triggers for
   visible inbox source files.
3. Source identity includes workspace-relative path, inbox-relative path, and
   stable `sha256:<hex>` content hash.
4. Existing `assessment.recorded` ledger events do not clear pending triggers.
5. Focused AX2 tests and typecheck pass.
6. Later vertical-slice surfaces have tracked follow-up steps in this plan.

## Deferred Follow-Ups

1. Source ingestion and trigger resolution.
2. Long-running file watcher or background trigger processing.
3. Full viewer polish beyond state visibility.
4. Fabro automation.
5. GitHub report automation.
6. `@effect/platform` migration for AX2 filesystem/path services.
