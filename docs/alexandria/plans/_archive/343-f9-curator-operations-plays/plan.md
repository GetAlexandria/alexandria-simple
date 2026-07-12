# Issue 343 Technical Plan - F9 Operations Plays

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/343
Run ID: 01KVVQCEF466AH9XNN9ZZ915Q5
Project: Studio Operations
Phase: 2
Tier: should
Blocked by: issue #341, merged as PR #372, and issue #344, merged as PR #373

## Goal

Implement F9 as three runnable PlaymakerStudio Operations plays:

- Capture
- Deprecate
- Quarantine

They are runtime/CLI operations plays, fronted by William through the
`PlaymakerStudio / Operations` catalog filing. They render no UI, do not touch
the retired `:8778` Studio site, and verify through `ax run`, typed Ledger
events, and markdown projections generated from those events.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the package map, canonical viewer
  surface, Studio data ownership, and cross-package boundaries.
- `skills/maintainer/technical-planning/SKILL.md` and its
  `plan-template.md` define this planning stage.
- `EVALS.md` defines eval-harness obligations when reusable product skills or
  agent behavior changes.
- Issue #343 text supplied in the run prompt freezes the F9 contract and the
  2026-06-24 surface correction.
- GitHub issue comments were fetched through the GitHub connector. The only
  comment records the Fabro local run URL for the same Run ID and adds no extra
  technical requirements.
- `docs/alexandria/plans/studio-fixes/studio-operations-division.md` defines
  PlaymakerStudio Operations as operations plays derived from the scattered
  operations manual.
- `docs/alexandria/plans/studio-fixes/F9-curator.md` supplies the parked
  Capture / Deprecate / Quarantine mechanism.
- `docs/alexandria/plans/studio-fixes/org-model.md` owns
  Company -> Division -> Function -> Play and the William-fronted
  PlaymakerStudio filing model.
- `studio/plays/registry.js` is the current Studio catalog source of truth.
- `studio/plays/README.md`, `studio/plays/PROJECTION.md`, and
  `studio/inheritance/README.md` define the active play-writing loop,
  quarantine discipline, autopsy rules, and projection conventions.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md` define deterministic CLI
  behavior, Effect usage, stable exit codes, stdout/stderr boundaries, and
  black-box test requirements.
- `packages/alexandria-plugin/CLAUDE.md` and
  `packages/alexandria-plugin/README.md` define the plugin as the play contract
  owner and require plugin validation when plugin payload changes.
- `packages/viewer/README.md` defines the viewer boundary. The viewer consumes
  AX runtime APIs and Studio catalog data; this issue does not add a viewer
  surface.

## Scope

- Add three Studio play records and shipped play definitions for Capture,
  Deprecate, and Quarantine.
- File all three under `PlaymakerStudio / Operations` in
  `studio/plays/registry.js`, so the viewer `/studio` Catalog can render them
  as William-fronted Operations plays without new viewer UI.
- Add `capture`, `deprecate`, and `quarantine` play ids to the AX play manifest
  with `defaultAgentId: WILLIAM_AGENT_ID`.
- Add plugin-owned workflow payloads under
  `packages/alexandria-plugin/workflows/` for the three plays, plus tracker leg
  metadata where the existing playbook projection expects it.
- Add typed Ledger event support for the three dispositions. The proposed event
  type names are:
  - `studio.operations.capture`
  - `studio.operations.deprecate`
  - `studio.operations.quarantine`
- Give each disposition event strict schema-backed payload fields for
  operation id, play id, trigger kind, source provenance, human-readable
  verdict, projection path, content hash, and operation-specific target data.
- Extend `ax run` narrowly for the three operations plays using the existing
  `--input`, `--input-text`, `--fixture`, `--reactions`, `--json`, and
  idempotent runtime append patterns.
- Add `--actor <json>` support for operations-play dispositions so the event
  envelope records the real actor kind: `user` for director rulings and `agent`
  for agent-surfaced captures or quarantines.
- Keep Capture and Quarantine detached and non-gated. They only append records
  and sequester material.
- Make Deprecate director-gated before any load-bearing rule is changed.
  Decline leaves active rulebook files unchanged. Approval appends the
  deprecation event, updates the disposition projection, removes or marks the
  target rule according to the event payload, and records the reason.
- Generate markdown projections from Ledger events:
  - Capture writes or refreshes an autopsy entry under
    `studio/inheritance/autopsy/`.
  - Quarantine writes or refreshes a verbatim copy with a provenance header
    under `studio/inheritance/quarantine/`.
  - Deprecate writes or refreshes a disposition table projection and applies
    the approved load-bearing doc edit named by the event.
- Add a durable generated disposition projection, for example
  `studio/inheritance/dispositions.md`, unless implementation finds an existing
  generated table already owns this exact surface. The file must state that the
  Ledger is authoritative.
- Add a Capture trigger path from a Ledger event. The first supported trigger is
  an existing ruling event, `play.review_gate_confirmed`.

  > Implementation note (post-review): the trigger is a **derived**
  > `ruling.capture.pending` active-trigger computed from ledger events in
  > `domain/triggers.ts` (and surfaced by `ax inspect triggers list` /
  > project-state), mirroring `inbox.source.pending`. It is intentionally **not**
  > materialized as a `play.requested` event in the shared JSONL store: doing so
  > coupled the generic event store to a specific product play, fired on every
  > caller, and woke the agent on every review gate (3× per make-a-play run). A
  > Capture run that records the ruling in `payload.sourceEventId` clears the
  > pending trigger.
- Include Quarantine's first real intake run for the inherited build-mess
  material named by the issue. The implementation should identify the concrete
  source path during the slice, copy it verbatim, and append the matching
  `studio.operations.quarantine` event.
- Add black-box CLI and ledger tests for success, decline, approval, idempotency,
  actor kind, projection content, and no active-rulebook mutation on
  Quarantine.

## Non-Goals

- Do not build, restore, or touch the retired standalone Studio site on `:8778`.
- Do not add a new public `ax curate`, `ax operations`, or broader CLI
  subsystem. Use `ax run <play-id>` and the existing event append substrate.
- Do not build a viewer run-launch flow, viewer mutation UI, or any new Studio
  route. Catalog visibility is data-only.
- Do not generalize F9 into EL6 or a director's product-library maintenance
  system. This grooms the Studio's own operations manual only.
- Do not decompose the whole operations manual into additional plays.
- Do not make "The Curator" a storage container, play id, division, or agent
  owner. It may remain a lens name over these three operations plays.
- Do not make quarantined material load-bearing or reference it from active
  rulebook docs until a later gated promotion event exists.
- Do not promote quarantined material in this slice. Promotion is a second,
  gated disposition and remains deferred unless a later issue requests it.
- Do not let Capture invent a learning. If the source does not substantiate the
  learning, record a flagged verdict instead of turning it into a rule.
- Do not create per-feature config JSON files.
- Do not write to `docs/alexandria/library/`.
- Do not edit files under `repos/`.

## Linked Product-Plan Summary

The Studio Operations plan reframes the scattered rulebook as an operations
manual: procedures spread across `README.md`, `AUTHORING.md`, `PROJECTION.md`,
`TESTING.md`, and `inheritance/`. F9 is the maintenance corner of that
Operations division. It is not one Curator play. It is three operations plays
with different triggers:

| Operations play | Fires when | Process | Trigger kinds | Output |
|---|---|---|---|---|
| Capture | a session surfaces a learning worth preserving | classify the learning, then record it with provenance and verdict | director-invoked, quality-reaction | autopsy entry plus capture event |
| Deprecate | a verified doc-to-exemplar inconsistency proves a rule is stale | gate with the Director, mark the rule dead, remove it from load-bearing docs, record why | quality-reaction, timer | disposition update plus deprecate ruling event |
| Quarantine | incoming inheritance from another branch, era, or product arrives | copy it verbatim with a provenance header and keep it out of load-bearing rules | intake of foreign material | quarantined copy plus quarantine event |

The Ledger event is the source of truth for who dispositioned what and when.
Markdown is a projection. Capture and Quarantine run detached because they only
add records or sequester material. Deprecate is director-gated because it removes
or marks load-bearing rulebook content.

## Current Gap

- `studio/plays/registry.js` already has the corrected Company -> Division ->
  Function -> Play model and a `PlaymakerStudio` division fronted by William.
  It currently has `Play Re-sync` under PlaymakerStudio Operations, but not
  Capture, Deprecate, or Quarantine.
- `studio/inheritance/README.md` defines quarantine as non-load-bearing until
  promoted, and `studio/plays/PROJECTION.md` has a historical quarantine
  disposition table for graph-era conventions. There is no runnable play that
  appends disposition events and refreshes those markdown surfaces.
- `studio/inheritance/autopsy/` contains trusted historical records, but
  Capture is not a runtime operation with idempotent Ledger backing.
- `packages/ax/src/domain/state-events.ts` has schema-backed state events,
  idempotent append support, `play.provenance_recorded`, review-level events,
  and wake events. It does not have F9 disposition event types.
- `packages/ax/src/commands/events.ts` already exposes
  `ax inspect events append`, including `--actor` and `--idempotency-key`.
  F9 should reuse that substrate rather than direct-writing Ledger JSONL.
- `packages/ax/src/commands/play.ts` already supports `ax run <play-id>`,
  `--input`, `--input-text`, `--fixture`, `--reactions`, detached runs, and
  JSON output. It does not know operations-play disposition semantics or actor
  propagation.
- `packages/ax/src/domain/triggers.ts` currently derives only inbox source
  triggers. Capture has no event subscription or active trigger path.
- The existing wake-subscription system can match Ledger event types and wake
  Claude Code, Codex, or Freeq-facing hosts. It needs an F9-specific
  subscription/default rule or test fixture for Capture.
- The plugin workflow package has `frame-the-problem`, `source-assessment`, and
  `make-a-play` workflows, but no F9 workflows.
- The viewer Catalog can render catalog data, but there is no new viewer work
  required for this slice.

## Architectural Boundaries

- `packages/alexandria-plugin` owns the play contract: operation names,
  workflow artifacts, tracker leg labels, and any product-facing prompt text
  belong there.
- `packages/ax` owns deterministic execution: run parsing, actor parsing,
  Ledger event schemas, idempotent append, file projection, trigger/subscription
  integration, and black-box CLI behavior.
- `studio/` owns Studio data and projections: play briefs, catalog filing,
  autopsy entries, quarantine copies, disposition projection, Board data, and
  validators.
- The Ledger remains append-only and authoritative. Projections may be refreshed
  from events, but direct hand edits to projection rows must not be treated as
  source of truth.
- Quarantine copies are untrusted data. They may be copied and hashed, but their
  contents must not be executed, imported, sourced, included in active prompts,
  or referenced from load-bearing docs.
- Deprecate may edit active docs only after the director gate resolves to
  approval. It should apply the smallest target edit described by the event and
  record the reason.
- The viewer must not read `events.jsonl` directly and must not gain a new
  surface here. If the Catalog rendering changes are already in #370, this
  issue only adds data that the Catalog reads.

## Event And Projection Contract

Common event payload fields:

```json
{
  "operationId": "capture:sha256-...",
  "operationPlayId": "capture",
  "triggerKind": "director-invoked",
  "source": {
    "kind": "file",
    "path": "studio/plays/HANDOFF.md",
    "contentHash": "sha256:..."
  },
  "verdict": {
    "status": "recorded",
    "summary": "Human-readable verdict."
  },
  "projection": {
    "path": "studio/inheritance/autopsy/example.md",
    "contentHash": "sha256:..."
  }
}
```

Allowed `triggerKind` values:

- `director-invoked`
- `timer`
- `quality-reaction`
- `intake`

Operation-specific payload fields:

- Capture:
  - `learning`
  - `classification`
  - `substantiation` with `supported` or `unsubstantiated`
  - optional `sourceEventId` when fired from a Ledger subscription
- Deprecate:
  - `target` with doc path, rule id or rule text hash, and previous content hash
  - `disposition` as `rejected` or `superseded`
  - `reason`
  - `directorGate` with question id and approved answer metadata
- Quarantine:
  - `intake` with original path, copied path, content hash, and provenance header
  - `disposition` fixed to `quarantined`
  - optional `foreignOrigin`

Idempotency keys:

- Capture: `studio-operations:capture:<source-kind>:<source-hash>:<learning-hash>`
- Deprecate: `studio-operations:deprecate:<target-path>:<rule-hash>:<reason-hash>`
- Quarantine: `studio-operations:quarantine:<source-path>:<content-hash>`

Projection rules:

- If an event append returns `already-present`, the projection refresh must not
  duplicate rows or append a second autopsy/quarantine copy.
- Projection content should include the event id, event type, actor, timestamp,
  source hash, verdict, and any target path.
- Capture and Quarantine projections are additive and must not edit active
  rulebook docs.
- Deprecate projection plus active-doc edit happens only after approval.
- Projection refreshes must be deterministic enough for tests to compare paths,
  row counts, and important output fields without exact timestamp matching.

## Command Contract

Use the existing `ax run` shape:

```bash
ax run capture --input-text learning="..." --input source=path/to/source.md --actor '{"kind":"agent","host":"codex","name":"Codex"}' --json
ax run quarantine --input foreign=path/to/inherited.md --input-text origin="..." --actor '{"kind":"agent","host":"codex","name":"Codex"}' --json
ax run deprecate --input target=studio/plays/README.md --input-text reason="..." --actor '{"kind":"user","host":"ax","name":"Director"}' --reactions approve.json --json
```

Exact input key names can be adjusted during implementation, but they must be
documented in `ax run --help`, enforced by black-box tests, and represented in
fixtures for the three operations plays.

Expected CLI behavior:

- Capture and Quarantine return exit code `0` on append/projection success.
- Capture and Quarantine work in headless detached mode and do not prompt.
- Deprecate without an approving gate resolution must not edit active docs.
- Deprecate decline exits successfully as a completed non-mutation or as a
  stable "not approved" result, but it must not append a deprecate disposition
  event or change the rulebook.
- Deprecate approval appends exactly one `studio.operations.deprecate` event and
  applies exactly the approved active-doc edit.
- Invalid input, invalid actor JSON, unsupported trigger kind, missing source
  file, missing target rule, or unsafe quarantine path returns stable invalid
  input exit code `2`.
- Operational failures such as inaccessible workspace or runtime append failure
  return stable operational exit code `1`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Studio catalog data | `studio/plays/registry.js` | Adds Capture, Deprecate, and Quarantine under PlaymakerStudio / Operations, fronted by William through division data |
| Studio play records | `studio/plays/capture/`, `studio/plays/deprecate/`, `studio/plays/quarantine/` | Adds briefs and local play artifacts for the three operations plays |
| Studio projections | `studio/inheritance/autopsy/`, `studio/inheritance/quarantine/`, `studio/inheritance/dispositions.md` or existing disposition projection | Adds generated projections from F9 Ledger events |
| Plugin playbook | `packages/alexandria-plugin/workflows/capture/`, `packages/alexandria-plugin/workflows/deprecate/`, `packages/alexandria-plugin/workflows/quarantine/` | Ships the operations plays as runnable plugin workflow payloads |
| AX play manifest | `packages/ax/src/domain/plays.ts` | Adds play ids, William default agent ownership, workflow targets, fixtures, and required inputs |
| AX run command | `packages/ax/src/commands/play.ts` and supporting domain/effect modules | Runs the three operations plays, parses operation actor, appends events idempotently, refreshes projections, and handles deprecate gating |
| Ledger schema | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Adds schema-backed F9 event types and validates payloads, actor kinds, and schema discovery |
| Trigger/subscription path | `packages/ax/src/domain/wake-subscriptions.ts`, `packages/ax/src/commands/subscriptions.ts`, `packages/ax/src/domain/triggers.ts` only as needed | Adds or verifies a Capture subscription path from ruling/session events without creating a new daemon |
| Runtime projections | `packages/ax/src/domain/project-state.ts`, `packages/ax/src/effects/studio-api.ts` only if needed | Exposes operation events only if the viewer/runtime needs them for Catalog or state inspection; otherwise event listing is enough |
| Tests | `packages/ax/tests/events.test.ts`, `packages/ax/tests/cli.test.ts`, new or existing operations-play tests, `studio/tools/check.sh` | Covers CLI behavior, event schema, idempotency, projection mutation, no active-doc mutation, and catalog validity |
| Planning | `docs/alexandria/plans/343-f9-curator-operations-plays/plan.md` | This technical plan |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| William / PlaymakerStudio playbook | William fronts the three Operations plays through catalog filing and default AX agent id | Add catalog rows, manifest entries, and plugin workflows; validate plugin payload |
| Product agents | No Raven/Product behavior change | None |
| Product skills | No existing shipped skill changes are required if the operations plays are implemented deterministically | If implementation adds or changes a shipped skill file, run that skill's evals per `EVALS.md` |
| Operation prompts | Prefer no agent prompt for Quarantine; copy bytes deterministically. Capture may use a prompt only if deterministic input classification is insufficient | If a product-facing classifier prompt is added, add a targeted eval or deterministic fixture proving unsubstantiated learnings are flagged |
| CLI tools | `ax run` gains three play ids and operations-only actor handling | Black-box CLI tests for help, parse errors, JSON output, exit codes, and idempotency |
| Viewer | Catalog displays new data through existing `/studio` Catalog behavior | No viewer code change planned; run viewer validation only if implementation touches viewer code |
| Eval harness | No existing eval case maps directly to operations-play workflows | Deterministic CLI and fixture tests are required; eval-harness rerun is not required unless shipped skill/agent prompt behavior changes |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX event schema and operations CLI tests | `pnpm --filter @alexandria/ax run test -- events.test.ts cli.test.ts` plus the new operations-play test file | Verifies event schema discovery, append validation, parse/help behavior, exit codes, actor handling, and idempotency |
| AX full package tests | `pnpm --filter @alexandria/ax run test` | Catches regressions in `ax run`, subscriptions, runtime append, and project-state projections |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Ensures PlayId, event schemas, and Effect code compile |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Enforces package coding standards |
| Studio data checks | `sh studio/tools/check.sh` | Validates catalog filing, Board state, make-a-play graph, and Studio data invariants |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required because shipped plugin workflow payload changes |
| Plugin workflow smoke | `ax run capture --fixture <case> --json`, `ax run quarantine --fixture <case> --json`, `ax run deprecate --fixture <decline-case> --reactions <decline> --json`, `ax run deprecate --fixture <approve-case> --reactions <approve> --json` | Proves all three operations plays are runnable through CLI and Ledger |
| Ledger validation | `ax inspect events validate --json` | Confirms appended F9 events are schema-valid |
| Event listing | `ax inspect events list --type studio.operations.capture --json` and equivalent deprecate/quarantine commands | Verifies the typed events are visible with correct actor kinds and payload fields |
| Viewer validation if touched | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run test` | Only required if implementation changes viewer code; this slice should be data-only for Catalog |
| Markdown lint for changed docs | `pnpm run lint:markdown` or targeted markdownlint if available | Ensures new play briefs and projections do not break markdown checks outside excluded generated areas |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|--------------------|
| Existing shipped skills | Existing eval matrix in `EVALS.md` | No rerun if no skill files change | None |
| Operations-play deterministic behavior | No eval-harness coverage; behavior is CLI/file/Ledger deterministic | Add black-box AX tests and Studio fixtures instead of eval harness | `pnpm --filter @alexandria/ax run test -- <new operations test>` |
| Capture classification, if implemented with an agent prompt | No direct eval case exists | Add a small targeted eval or deterministic fixture that proves unsupported claims are flagged, not invented | New case only if implementation adds prompt-based classifier behavior |
| Quarantine prompt-injection boundary | No eval-harness coverage needed if byte-copy is deterministic | Add deterministic fixture containing instruction-like inherited content and assert it is copied, not followed or referenced | AX operations test fixture |
| Deprecate director gate | Covered by deterministic scripted reactions rather than LLM eval | Add approve and decline fixtures with `--reactions` | AX operations test fixture |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The implementation turns "Curator" back into a single play or storage home | Catalog rows must be three separate plays under `PlaymakerStudio / Operations`; tests should assert slugs and filing |
| A new CLI subsystem grows around F9 | Use `ax run <play-id>` and existing `ax inspect events` infrastructure only; reject plans for `ax curate` or broad operations commands |
| Quarantined material becomes load-bearing by accident | Quarantine projection tests must assert no active rulebook doc changes and no new references to the quarantined copy are inserted |
| Quarantined material contains instructions that an agent follows | Quarantine should be deterministic byte copy with provenance header; tests include instruction-like input and assert no behavior beyond copy/hash/event |
| Deprecate removes active rules without Director approval | Gate resolution must be required before the active-doc edit; decline fixture asserts previous content hash is unchanged |
| Ledger and markdown projections drift | Use event idempotency keys and projection refresh from events; tests re-run the same command and assert one event fact and one projection row/copy |
| Actor kind is wrong because CLI defaults to process actor | Operations dispositions require or explicitly accept `--actor`; tests cover `user` for Deprecate approval and `agent` for Capture/Quarantine |
| Capture invents unsupported learning | Payload/projection must carry substantiation status; unsupported fixture records a flagged verdict rather than a promoted rule |
| Capture subscription only wakes a host but never proves a run path | Add a black-box subscription or trigger test that appends the source ruling/session event and observes the Capture request/wake path with a stable idempotency key |
| Existing PROJECTION §10 is overloaded beyond its scope | Prefer a dedicated generated F9 disposition projection unless the target rule already belongs to PROJECTION §10; keep the Ledger authoritative either way |
| Viewer Catalog work leaks into this issue | Restrict viewer changes to none; use Studio catalog data checks and viewer validation only if implementation unexpectedly touches viewer code |

## Implementation Steps

1. Add F9 domain constants and schemas in AX:
   - operation play ids
   - trigger kind enum
   - event type names
   - strict payload validators
   - stable idempotency-key helpers
   - projection path helpers
2. Extend `packages/ax/src/domain/state-events.ts` and schema discovery tests
   with `studio.operations.capture`, `studio.operations.deprecate`, and
   `studio.operations.quarantine`.
3. Extend `packages/ax/src/domain/plays.ts` with `capture`, `deprecate`, and
   `quarantine`, all defaulting to William and pointing at plugin workflows.
4. Add plugin workflow payloads and tracker legs for the three operations plays.
   Keep Quarantine deterministic and do not feed inherited content as
   instructions.
5. Add Studio play directories and briefs for the three plays, with frontmatter
   `division: PlaymakerStudio` and `function: Operations`.
6. Add Catalog rows in `studio/plays/registry.js` for the three operations plays
   under PlaymakerStudio / Operations. Keep them off the production Board unless
   the implementation discovers an explicit Board requirement.
7. Implement the AX operations runner behind `ax run`:
   - parse operations actor
   - bind inputs using existing `--input` / `--input-text`
   - validate required operation inputs
   - append the typed event through the runtime-backed append path
   - refresh the markdown projection
   - return stable JSON and human output
8. Implement Capture projection:
   - classify or accept classification
   - record source provenance
   - write an autopsy entry from the event
   - flag unsubstantiated learning instead of inventing support
9. Implement Quarantine projection:
   - copy source bytes verbatim under `studio/inheritance/quarantine/`
   - prepend only the provenance header
   - append the quarantine event
   - assert no active rulebook doc is edited
10. Implement Deprecate gate and projection:
    - create or reuse a human gate through the existing reactions path
    - decline without mutation
    - approve with `actor.kind = "user"`
    - append the deprecate event
    - update the disposition projection
    - apply the approved active-doc edit
11. Add the Capture subscription path from a schema-backed Ledger event. Prefer
    existing `play.review_gate_confirmed` as the first supported ruling trigger
    unless a `session.closed` event is added and tested in the same slice.
12. Run the Quarantine play once for the inherited build-mess material named by
    the issue, append the real event, and commit the quarantined copy plus
    projection.
13. Add black-box tests for:
    - help and invalid inputs
    - event schema discovery
    - Capture success and unsupported-learning flag
    - Quarantine success, byte-copy/provenance header, and no rulebook mutation
    - Deprecate decline and approval
    - actor kind on Capture and Deprecate
    - idempotent reruns
    - Capture subscription trigger path
14. Run the deterministic verification commands and fix any regressions within
    this scope.

## Acceptance / Exit Criteria

1. Capture, Deprecate, and Quarantine are runnable through `ax run`.
2. All three are filed in the Studio catalog as
   `PlaymakerStudio / Operations`, fronted by William through division data.
3. No new UI is built, and no retired `:8778` files are touched.
4. Capture and Quarantine complete detached without a human gate.
5. Deprecate pauses for a Director gate before editing any load-bearing rule.
6. Deprecate decline leaves the active rulebook unchanged and appends no
   deprecate disposition event.
7. Deprecate approval records a user-actor deprecate event, updates the
   disposition projection, and applies only the approved rule edit.
8. Capture records an agent or user actor according to the invocation and writes
   an autopsy projection with provenance and verdict.
9. Quarantine records an agent or user actor according to the invocation, writes
   a verbatim quarantined copy with a provenance header, and does not reference
   the copy from active rulebook docs.
10. Each disposition appends exactly one typed event under idempotent reruns and
    refreshes the markdown projection without duplicating rows or copies.
11. Capture has a Ledger subscription or trigger path from a ruling/session
    event and is not manual-only.
12. `ax inspect events validate --json` passes after the F9 runs.
13. AX tests, Studio data checks, and plugin validation pass.

## Deferred Follow-Ups

1. Gated promotion of quarantined material into load-bearing rules.
2. Timer-based Deprecate sweeps beyond the first manual/quality-reaction path.
3. Broader operations-manual decomposition into additional PlaymakerStudio
   Operations plays.
4. Viewer run-launch controls for operations plays.
5. A richer Catalog lens named "The Curator" if the product wants a filtered
   view over the three plays.
6. EL6 or director product-library maintenance work at product-library scale.
