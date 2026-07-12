# Issue #667: ax internal library backfill

## Header

- Issue: [#667](https://github.com/GetAlexandria/alexandria-internal/issues/667)
- Goal: add `ax internal library backfill --bundle <path> [--dry-run] --json` so the Alexandria product bundle's walk artifacts can be replayed into the project Ledger as flat `library.*` events before those artifacts are archived.
- Linked product plan: `docs/alexandria/plans/library-migration/plan.md`, especially §2.3 event vocabulary and §2.6 backfill.
- Issue comments checked: only Fabro run links were present; no contract changes beyond the issue body.

## Scope

This slice lands the deterministic `packages/ax` work needed for the backfill:

- Add an internal `ax internal library backfill` command with JSON summary output, `--dry-run`, stable exit codes, and non-interactive behavior.
- Read the bundle's existing sources:
  - `runtime/front-of-house/answers/*.json`
  - `threads.json`
  - `gaps.json` `.typeMapping[]`
  - `runtime/front-of-house/patch.json` as best-effort only
- Emit new flat event types through the existing runtime-backed append path:
  - `library.answer_recorded`
  - `library.thread_opened`
  - `library.taxonomy_ruled`
  - `library.card_patch_applied` when the patch source can be represented without inventing missing facts
- Add read-side aliases so old `library.front_of_house.*` spellings and the flat `library.*` spellings are accepted by existing parser/projection helpers.
- Keep current old-name emitters unchanged. Existing front-of-house commands may continue emitting `library.front_of_house.*` in this issue.
- Add black-box and projection tests for the command, idempotency, dry-run, malformed records, missing sources, alias parsing, append-only behavior, and `ax inspect state --json` regression.

## Non-Goals

- Do not rename existing front-of-house emit sites in `packages/ax/src/commands/front-of-house.ts` or `packages/ax/src/effects/front-of-house-answer-banking.ts`.
- Do not modify the Alexandria product sweep bundle under `docs/alexandria/sweeps/alexandria-product`.
- Do not write directly to `docs/alexandria/ledger/events.jsonl` or any other ledger file bytes outside the existing append path.
- Do not archive `runtime/`, `threads.json`, `gaps.json`, or reports. That belongs to the later library move slices.
- Do not change Viewer behavior or the shipped plugin.
- Do not apply the Concept→Entity card edits; this issue records the taxonomy ruling only.
- Do not synthesize events from per-card `rulings:` strings or prose reports.

## Linked Product-Plan Summary

The library migration plan rules that decision history should move out of sidecar walk artifacts and into the Ledger. Section 2.3 drops the `front_of_house` event-name infix because it identifies the emitting play, not the durable fact. Section 2.6 identifies the easy backfill sources and requires the backfill to run before the walk artifacts are archived.

The checked-in product bundle currently has 25 answer receipt files, 3 thread definitions, and 1 taxonomy mapping. The current `runtime/front-of-house/patch.json` contains a patch id, agenda item id, answer event id, resolution, and empty `cardUpdates`; because it does not carry a content hash, the patch backfill must stay best-effort and must not invent a card-change fact merely to satisfy a schema.

## Current Gap

- `packages/ax/src/domain/state-events.ts` currently registers old front-of-house event types such as `library.front_of_house.answer_recorded` and has no flat `library.answer_recorded`, `library.card_patch_applied`, `library.thread_opened`, or `library.taxonomy_ruled` append schema.
- Parser helpers in `state-events.ts` hard-code old names in `parseAnswerRecorded`, `parseBundlePatchApplied`, `parseResidualGapRecorded`, `parseFrontOfHouseItemReopened`, and `parseSectionConfirmed`.
- Thread resolution and draft-overlay enrichment consume those helpers, so they do not yet see flat events.
- `packages/ax/src/commands/internal.ts` has `front-of-house`, `library-confirm`, and `host`, but no `library backfill` command family.
- The JSONL state store dedupes on `idempotencyKey`; the issue requires dedupe on `payload.backfill.sourceKey`, so the command needs a pre-scan for already-backfilled source keys before appending.
- Existing `ax inspect events append` uses `appendStateEventThroughRuntime`; the new command should share the same runtime-backed append surface, not bypass it.

## Architectural Boundaries

- `packages/ax` owns this change. Keep behavior deterministic, headless, and Effect-modeled with `CliResult` outputs.
- The command should load project storage to inspect current events, then append through `withAlexandriaRuntime` and `client.appendEvent(...)` so all writes still go through the same runtime validation/projection path used by `ax inspect events append`.
- Source parsing belongs in a small `packages/ax` command/domain helper, not in Viewer or plugin code.
- Event vocabulary and aliasing belong in `state-events.ts` so all readers share one normalization rule.
- Source readers should reuse existing structured parsers where useful:
  - `parseLibraryCatalogThreads`
  - `parseLibraryCatalogExtras`
  - `parseFrontOfHousePatchFile`
- Missing source files and directories are zero-count sources, not failures.
- Per-record malformed input is degraded into warnings and `skippedMalformed`, while valid sibling records still append.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Internal CLI | `packages/ax/src/commands/internal.ts`, new `packages/ax/src/commands/library.ts` or `library-backfill.ts` | Adds `ax internal library backfill`; root help remains unchanged and internal help exposes the internal family. |
| Backfill source parsing | New focused helper in `packages/ax/src/commands` or `packages/ax/src/domain` | Reads answers, threads, taxonomy mappings, and optional patch source; produces deterministic candidate events and per-source warnings. |
| Ledger append | `packages/ax/src/effects/runtime-client.ts` existing `withAlexandriaRuntime` / client append | Reuses existing append path for each non-dry-run candidate. No direct JSONL writes. |
| Event vocabulary | `packages/ax/src/domain/state-events.ts` | Adds flat event types and payload schemas; keeps old types accepted; adds alias helpers for parser consumers. |
| Thread projection | `packages/ax/src/domain/library-thread-resolution.ts` through shared parser helpers | Old and flat answer/patch/residual/reopen events project identically. |
| Draft overlay projection | `packages/ax/src/effects/library-graph-loader.ts` through shared parser helpers | Old and flat answer/patch/section events enrich draft overlays identically. |
| Tests | `packages/ax/tests/*` plus small fixture bundle copied from a real receipt shape | Adds black-box CLI tests and alias/projection regression tests. |

## Event Contract

Keep existing old event names in `ALEXANDRIA_STATE_EVENT_TYPES` because current emitters still use them. Add the flat names as additional appendable types.

The backfilled payloads should include source fields from the original artifact plus:

```json
"backfill": {
  "sourceKey": "<dedupe key>",
  "bundle": "<bundle argument as supplied or normalized consistently>",
  "sourcePath": "<path inside bundle>"
}
```

Use actor `{ "kind": "user" }` for answer receipts and taxonomy rulings. Use actor `{ "kind": "process", "host": "ax", "process": "cli" }` for thread and patch events.

Candidate payloads:

| Source | Event type | Dedupe `backfill.sourceKey` | Required payload fields |
|---|---|---|---|
| answer receipt | `library.answer_recorded` | `answerEventId` | `playRunId`, `fabroRunId`, `questionId`, `agendaItemId`, `agendaItemKind`, `answerText`, `backfill`; preserve any real timestamp field if a receipt has one. |
| thread definition | `library.thread_opened` | `thread.id` | `threadId`, `family`, `kind`, `concerns`, `confidence`, `severity`, `question`, `reason`, `emittingMove`, `sourceEvidence`, `backfill`; include source lifecycle fields such as `sourceStatus`, `sourceResolution`, and `sourceResolvingEventId` when present. |
| taxonomy mapping | `library.taxonomy_ruled` | `${from}->${to}` | `from`, `to`, `disposition`, `basis`, `backfill`. |
| patch source | `library.card_patch_applied` | `patchId` | `patchId`, `agendaItemId`, `answerEventId`, `resolution`, `bundlePath`, `backfill`, and real patch fields present in the file. If the current file cannot satisfy the append schema without inventing missing data, skip it as malformed/best-effort with a warning. |

For read-side aliasing, centralize the old-to-flat mapping in `state-events.ts` and use it in parser helpers. Existing consumers should not grow their own `event.type === old || event.type === flat` checks.

Alias pairs required in this issue:

| Old spelling | Flat spelling |
|---|---|
| `library.front_of_house.answer_recorded` | `library.answer_recorded` |
| `library.front_of_house.bundle_patch_applied` | `library.card_patch_applied` |
| `library.front_of_house.section_confirmed` | `library.section_confirmed` |
| `library.front_of_house.residual_gap_recorded` | `library.residual_gap_recorded` |
| `library.front_of_house.item_reopened` | `library.item_reopened` |

`library.front_of_house.turn_recorded` is not part of the issue's alias acceptance list; leave it unchanged unless adding the helper makes accepting a flat turn event trivial and covered by tests.

## CLI Contract

Command:

```bash
ax internal library backfill --bundle <path> [--dry-run] [--json]
```

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Command completed, including degraded runs with skipped malformed records. |
| 1 | Operational failure such as uninitialized Alexandria project, unreadable ledger, or runtime append failure. |
| 2 | Invalid CLI input such as missing `--bundle` or unknown option. |

JSON summary shape:

```json
{
  "status": "completed",
  "dryRun": false,
  "bundle": "docs/alexandria/sweeps/alexandria-product",
  "totals": {
    "discovered": 29,
    "emitted": 29,
    "skippedExisting": 0,
    "skippedMalformed": 0
  },
  "sources": {
    "answers": { "discovered": 25, "emitted": 25, "skippedExisting": 0, "skippedMalformed": 0, "warnings": [] },
    "threads": { "discovered": 3, "emitted": 3, "skippedExisting": 0, "skippedMalformed": 0, "warnings": [] },
    "taxonomy": { "discovered": 1, "emitted": 1, "skippedExisting": 0, "skippedMalformed": 0, "warnings": [] },
    "patch": { "discovered": 1, "emitted": 0, "skippedExisting": 0, "skippedMalformed": 1, "warnings": [] }
  }
}
```

In dry-run mode, keep the same shape and set `dryRun: true`; `emitted` means "would emit" in that mode. The command must append zero events in dry-run.

Warnings should name the source path and, when known, the source key. They should stay in stdout JSON when `--json` is used; diagnostics for invalid CLI input and operational failures stay on stderr.

Candidate order must be deterministic:

1. answers sorted by filename
2. threads in source order
3. taxonomy mappings in source order
4. patch source

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Agents | None | No agent prompts or agent manifests change. |
| Skills | None | No shipped plugin skills or maintainer skills change. |
| Templates / workflows | None | No Fabro workflow or play template changes in this slice. |
| CLI tools | Adds internal deterministic backfill command and new event schema entries | Black-box CLI tests and event schema tests move with the implementation. |
| Viewer | None | No Viewer unit/build/browser validation required. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Focused ax tests | `pnpm --filter @alexandria/ax exec bun test tests/library-backfill-cli.test.ts tests/events.test.ts tests/library-thread-resolution.test.ts tests/runtime-server.test.ts tests/state.test.ts` | Covers command behavior, event schema, aliases, projections, and inspect-state regression. |
| Full ax tests | `pnpm --filter @alexandria/ax test` | Catches command-router and runtime regressions outside the focused set. |
| Typecheck | `pnpm --filter @alexandria/ax run typecheck` | Verifies event-type unions, Effect signatures, and schema descriptors. |
| Lint / formatting | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Enforces package guidance for TypeScript and test files. |
| Real bundle dry-run | `pnpm ax -- internal library backfill --bundle docs/alexandria/sweeps/alexandria-product --dry-run --json` | Confirms the checked-in product bundle reports 25 answers, 3 threads, 1 taxonomy mapping, and no writes. |
| Real bundle append acceptance | `pnpm ax -- internal library backfill --bundle docs/alexandria/sweeps/alexandria-product --json`, then `pnpm ax -- inspect events list --type library.answer_recorded --json --limit 30` and equivalent thread/taxonomy filters | Final migration acceptance when the repository owner is ready to append these durable events. Do not run this during planning. |

## Test Matrix

Add a new fixture bundle under `packages/ax/tests/fixtures/library-backfill/` using at least one real receipt copied from `docs/alexandria/sweeps/alexandria-product/runtime/front-of-house/answers/*.json`. Keep it small but real-shaped.

Required tests:

1. Happy path: fixture bundle emits answer, thread, and taxonomy events with flat names; JSON summary has per-source counts; `ax inspect events list --json` sees the events.
2. Idempotent re-run: running the same command again emits zero events, reports `skippedExisting`, and leaves the ledger line count unchanged.
3. Dry-run: on a fresh initialized project, `--dry-run --json` reports would-emit counts and appends zero events.
4. Missing sources: an initialized project with a bundle containing none of the source files exits 0 with all counts 0.
5. Malformed record skip: one deliberately malformed receipt is named in `warnings`, increments `skippedMalformed`, and valid sibling receipts still append.
6. Alias parsing: state-event validation and parser helpers accept old and flat spellings for answer, patch, residual, reopen, and section events.
7. Thread-resolution alias: `projectLibraryCatalogThreadResolutions` returns identical projection for `library.front_of_house.answer_recorded` and `library.answer_recorded`, including patch provenance where applicable.
8. Draft-overlay alias: `loadLibraryCatalogRoot` or the runtime catalog API returns identical draft-overlay rulings/section confirmations for old and flat answer/patch/section events.
9. Append-only invariant: create a pre-existing non-library event, record its raw JSONL bytes, run backfill, and assert the pre-existing bytes are unchanged and new events are appended after it.
10. Inspect-state regression: a ledger containing only non-library events still makes `ax inspect state --json` succeed and project the same non-library state as before.
11. CLI parser/help: missing `--bundle` and unknown options exit 2; root `ax --help` still does not list `internal`; `ax internal --help` can list the internal `library` family.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| Product agents and skills | No product agent or skill behavior changes | No eval-harness rerun required | None |
| Maintainer planning skill | Read-only input for this plan; not modified | No eval-harness rerun required | None |
| CLI deterministic behavior | Covered by Bun tests, not eval harness | Add/extend black-box CLI tests | See deterministic verification commands |

No `pnpm eval` run is required for this slice because it changes deterministic CLI/event behavior only and does not modify shipped plugin skills, agents, or eval-backed reusable behavior.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Flat and old event names drift across readers. | Put alias mapping in `state-events.ts` parser helpers and test projections through existing consumers. |
| Adding `backfill` metadata breaks strict payload validation. | Add explicit optional `backfill` schema fields to the new flat event payload schemas and cover append/schema tests. |
| Re-run idempotency accidentally depends on idempotency-key conflicts rather than issue-required source keys. | Pre-scan existing events for `payload.backfill.sourceKey` before appending; still pass an idempotency key as a secondary retry guard. |
| The patch source lacks enough data for the old patch-applied payload shape. | Treat patch backfill as best-effort; emit only if the schema can represent real source data, otherwise skip with a warning and keep the 29-event acceptance independent from patch success. |
| Malformed source file aborts the whole backfill. | Parse per record where possible; convert parser metadata issues into per-source warnings and skipped counts; reserve exit 1 for project/ledger/runtime failures. |
| Dry-run accidentally starts a runtime or appends. | Build candidates and dedupe from storage only in dry-run; do not call `withAlexandriaRuntime` when `dryRun` is true. |
| Existing ledger bytes are rewritten during backfill. | Use append-only runtime path and assert raw prefix bytes in tests. |
| Internal command discoverability conflicts with "not top-level help." | Keep root help unchanged; add only `ax internal library` help and tests. |

## Implementation Steps

1. Add flat library event types and payload schemas in `state-events.ts`.
2. Add a small alias map/helper in `state-events.ts`, then update parse helpers to accept the flat and old spellings while returning the same typed payloads for existing consumers.
3. Add event schema descriptor entries for the flat names so `ax inspect events schema --json` exposes them.
4. Add a new internal library command module with parser/help/result formatting for `ax internal library backfill`.
5. Register the `library` internal family in `packages/ax/src/commands/internal.ts` without adding anything to root help.
6. Implement deterministic source readers:
   - answer receipts from sorted `runtime/front-of-house/answers/*.json`
   - thread definitions via `parseLibraryCatalogThreads`
   - taxonomy mappings via `parseLibraryCatalogExtras`
   - optional patch via `parseFrontOfHousePatchFile`
7. Load current ledger events with `loadProjectStorage`, build the existing `backfill.sourceKey` set, and classify each candidate as emit, skipped existing, or skipped malformed.
8. For non-dry-run candidates, append sequentially through one `withAlexandriaRuntime` client session and pass stable idempotency keys such as `library-backfill:<eventType>:<sourceKey>`.
9. Produce the JSON summary with per-source counts and warnings. Add a concise human summary for non-JSON mode if implemented.
10. Add fixture bundle files copied from real checked-in artifacts, keeping the fixture minimal.
11. Add/extend tests from the matrix above.
12. Run focused tests, full ax tests, typecheck, lint, format check, and real-bundle dry-run.

## Acceptance / Exit Criteria

1. `ax internal library backfill --bundle docs/alexandria/sweeps/alexandria-product --json` appends 25 `library.answer_recorded`, 3 `library.thread_opened`, and 1 `library.taxonomy_ruled` events when run against the real initialized repository ledger.
2. Re-running the same command appends zero events, reports `skippedExisting >= 29`, and leaves `events.jsonl` line count unchanged.
3. `--dry-run` on a fresh ledger appends zero events and reports the same would-emit source counts.
4. A bundle with none of the source files exits 0 and reports all counts 0.
5. A malformed individual receipt is skipped and named in the summary; valid sibling receipts still append.
6. `ax inspect events list --json` can list the new flat event types.
7. Existing old event names remain accepted by validators and readers.
8. Thread-resolution and draft-overlay projections produce identical results for old and flat spellings covered by the issue.
9. Pre-existing event lines are byte-identical after a run.
10. `ax inspect state --json` still succeeds for a ledger containing only non-library events.
11. No implementation files outside `packages/ax` and focused tests/fixtures are changed unless the implementation discovers a tightly related package-local guidance update is required.

## Deferred Follow-Ups

1. Rename existing front-of-house emitters from old `library.front_of_house.*` names to flat names in a later vocabulary cleanup slice.
2. Archive `runtime/`, `threads.json`, `gaps.json`, and walk reports in the later library migration slice after the real backfill has run.
3. Convert the Library Notepad/Drafts surfaces to pure ledger projections in the planned sidecar dissolution slices.
4. Apply the Concept→Entity taxonomy migration to card files through the gated migration pipeline citing the backfilled `library.taxonomy_ruled` event.
5. Revisit whether `library.card_patch_applied` should become the canonical patch event payload for future walks once the old front-of-house patch emitters are renamed.
