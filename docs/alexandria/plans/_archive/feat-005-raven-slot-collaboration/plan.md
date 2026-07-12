# FEAT-005 Raven Slot-By-Slot CLI Collaboration

- Issue: GitHub #191,
  `[FEAT-005] Raven collaborates slot-by-slot from the CLI`
- Run ID: `01KSXAB18FXXDVN9TDFMCDQHVB`
- Product plan: `raven-onboarding-experience`
- Product-plan anchor:
  `docs/alexandria/plans/raven-onboarding-experience/plan.md`
- Outcome: O-3, must tier
- Blocked by: FEAT-003 and FEAT-004
- Blocks: FEAT-006
- Primary surfaces: `packages/ax-next`, `packages/viewer-next`, and
  `packages/alexandria-next-plugin`

## Goal

Add the narrow CLI/runtime path that lets Raven draft or revise exactly one
Vision slot at a time.

A Raven-authored slot update must reuse the same reducer-backed Vision state
contract as manual editing: append `raven.vision.slot.updated`, persist the
slot text, set only that slot to `needs_review`, preserve all other
slot/source state, and make the update visible in an already-open Viewer Next
Vision screen. Raven must then be able to read the latest projected state or
recent review events before deciding whether to write the next slot.

This slice is about the two-surface collaboration loop, not about a full Raven
LLM drafting play. If the final `raven-fill-vision-slots` play is not ready,
the implementation should add the smallest deterministic AX2 command that
exercises the same runtime mutation and reducer behavior.

## Scope

This slice must include all of the following:

1. A deterministic AX2 command for one Raven Vision slot update, tentatively:
   `ax2 raven vision slot update --slot <slot-id> (--text <text>|--text-file <path>) [--idempotency-key <key>] [--json]`.
2. The command must run non-interactively, validate slot IDs before side
   effects, reject missing or conflicting text inputs, and use stable exit
   codes.
3. The command must use the local runtime path rather than writing
   `events.jsonl` or `alexandria-config.json` directly.
4. Runtime support for identifying the update actor as Raven, for example
   `{ "kind": "agent", "host": "claude-code", "name": "Raven" }`, while
   keeping existing Viewer updates as `{ "kind": "user", "host": "viewer" }`.
5. Runtime slot update behavior that appends `raven.vision.slot.updated`,
   reduces the event into config-backed Vision state, persists config, and
   returns the canonical Vision projection.
6. Preservation tests proving Raven updates do not reset approved, skipped,
   or already-needs-review slots and do not alter FEAT-004 `sourceItemIds` or
   attached source rows.
7. `ax2 inspect state --json` remains the primary projected-state read path
   Raven uses before each slot write and after user review.
8. `ax2 inspect events list --json --limit <n>` remains the raw feedback/audit
   path Raven can use to see user `raven.vision.slot.approved`,
   `raven.vision.slot.skipped`, and user edit `raven.vision.slot.updated`
   events.
9. Viewer Next must refresh an open Vision screen when a runtime project-state
   event arrives from a Raven slot update, so the written text appears without
   requiring a page reload or manual UI action.
10. Viewer Next must visibly render the externally updated slot as
    `needs_review` using the existing prototype-derived status treatment, and
    may add a subtle remote-write flash derived from the prototype's
    `vb-remote-write-flash` pattern.
11. The Alexandria Next plugin guidance must explain the slot-by-slot loop:
    inspect state, choose one slot, write one slot, stop for user review, then
    inspect state/events before continuing.
12. CLI/runtime, Viewer runtime/client, Viewer e2e, plugin validation, and
    deterministic preservation tests for the collaboration loop.

## Non-Goals

Out of scope for FEAT-005:

1. Bulk-filling all nine Vision slots.
2. Building the final `raven-fill-vision-slots` LLM play if a deterministic
   command can satisfy the ticket.
3. Source processing, source summaries, or source-to-slot attribution.
4. Banking Vision, `raven.vision.banked`, durable Knowledge Bank
   `vision: banked`, or Source of Truth generation.
5. New Vision slot statuses beyond `empty`, `needs_review`, `approved`, and
   `skipped`.
6. Storing per-slot author metadata in config unless implementation discovers
   it is required for the event contract. The ledger actor is enough for this
   slice.
7. A generic state-event replay framework for every future reducer-backed
   event. Keep this slice focused on the Raven Vision mutation path.
8. Changing Alexandria 1 CLI, viewer, plugin, skills, or evals.
9. Writing anything under `docs/alexandria/library/`.
10. Reintroducing prototype-only phase rails, source sliders, logo upload, or
    overlay-as-home behavior.

## Linked Product-Plan Summary

The broader Raven onboarding plan defines Vision as a slot-based collaboration
surface. FEAT-003 established manual slot review and the
`raven.vision.slot.*` reducer contract. FEAT-004 added shared sources attached
to Vision without changing slot state. FEAT-005 adds Raven's participation on
the CLI/plugin side: Raven writes one slot, the user reviews in Viewer, and
Raven continues only after reading current state or review events.

This plan keeps the simplifications already chosen for production: no phase
rail, no source sliders, no logo-upload dependency, no overlay-as-home model,
and no bulk invisible form fill.

## Current Gap

Current AX2 and Viewer state after FEAT-003/FEAT-004:

1. `packages/ax-next/src/domain/raven-vision.ts` already defines the nine slot
   manifest, slot state, `sourceItemIds`, reducer transitions, and projection.
2. `packages/ax-next/src/domain/state-events.ts` already validates
   `raven.vision.slot.updated`, `raven.vision.slot.approved`, and
   `raven.vision.slot.skipped`.
3. `packages/ax-next/src/effects/runtime-server.ts` already exposes
   `PATCH /api/raven/onboarding/vision/slots/:slotId` plus approve/skip
   routes, but those mutation routes use a Viewer actor and are only surfaced
   through the browser runtime client.
4. Generic `ax2 inspect events append` can append validated events through the
   runtime, but it does not reduce `raven.vision.*` events into config-backed
   Vision state. Using it directly would leave projected state stale.
5. `ax2 inspect state --json` already exposes `raven.vision` and attached
   source rows, so Raven has a read path once mutations persist state.
6. Viewer Next currently updates `VisionOnboardingView` after its own runtime
   requests, but `LibraryBrowserApp` does not subscribe to
   `/api/events-stream`. A CLI-originated Raven update can be broadcast by the
   runtime and still not repaint the mounted Vision screen.
7. `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` tells
   agents to inspect state and run plays, but it does not describe the
   slot-by-slot Raven Vision collaboration loop or the one-slot update
   command.
8. `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`
   covers generic event-log wake handling, but not Vision review feedback.

The missing work is the Raven-facing mutation path plus live UI propagation.
The reducer itself should not need a semantic rewrite.

## Architectural Boundaries

AX2 owns deterministic command parsing, runtime calls, event validation,
state reduction, config persistence, and CLI output contracts. The command
should be modeled as an Effect program returning `CliResult`, following the
existing `commands/*`, `effects/runtime-client.ts`, and runtime-server
patterns.

The CLI must not define Raven's product strategy or decide every slot to fill.
It only provides a deterministic primitive: write this text to this slot.
Guided slot choice and drafting behavior belongs to the Alexandria Next plugin.

Runtime mutation code should factor the current Viewer slot update path so the
Viewer and CLI/Raven path share validation, append, reduction, persistence, SSE
broadcast, and projection return behavior. The actor and optional idempotency
key may differ by caller; the reducer result must not.

Viewer Next owns presentation and subscription-driven refresh. It should treat
runtime `project-state` SSE messages as canonical external state and update
the current Vision projection when `state.raven.vision` is present. Local
unsaved editor text should not be silently overwritten while the user is
typing; if a pending local edit exists for the same slot, keep the local edit
and surface a small inline conflict/error instead of discarding either side.

Alexandria Next plugin changes should be instructional and narrow. The plugin
can tell Raven how to use AX2 state and one-slot update commands, but this
ticket should not add a prompt-only bulk-fill workflow that bypasses runtime
state.

State remains in `.alexandria-next/alexandria-config.json`; source projection
remains at `sourcesPath`; ledger history remains append-only under the
workspace. Do not create per-feature JSON files.

## CLI Contract

Add a Raven-facing AX2 command with a stable non-interactive contract:

```bash
ax2 raven vision slot update \
  --slot shift \
  --text "The category changed shape." \
  --json
```

Text may also come from a file:

```bash
ax2 raven vision slot update \
  --slot shift \
  --text-file /tmp/raven-shift.txt \
  --idempotency-key raven:vision:shift:run-123 \
  --json
```

Required behavior:

1. `--slot` must be one of the nine manifest IDs and invalid input must list
   the valid IDs.
2. Exactly one of `--text` or `--text-file` is required. Empty text is allowed
   because the existing reducer stores text exactly as supplied and sets
   `needs_review`; the user can skip if it should clear.
3. The command must not prompt in TTY or headless use.
4. `--json` output must include at least: `slot.id`, `slot.status`,
   `slot.text`, `vision.status`, `vision.readyToBank`, runtime lifecycle, and
   enough ledger correlation to verify a `raven.vision.slot.updated` event.
   If the shared runtime endpoint cannot return an event ID without breaking
   Viewer clients, the command should report the mutation result and tests
   should verify the ledger separately.
5. Human output should be short and summary-first, for example slot ID,
   resulting status, Vision status, and runtime lifecycle.
6. Exit codes should match AX2 conventions:
   - `0` update accepted and projection returned.
   - `1` operational/runtime/project-state failure.
   - `2` invalid CLI input.
7. The command must call the local runtime via `withAlexandriaRuntime` or the
   same runtime-client path used by other AX2 commands, so an existing runtime
   is reused and a temporary runtime can be started for headless tests.

## Runtime Contract

Reuse the existing slot mutation route semantics:

| Method | Path | Behavior |
|--------|------|----------|
| `PATCH` | `/api/raven/onboarding/vision/slots/:slotId` | Validate text, actor, and optional idempotency key; append `raven.vision.slot.updated`; reduce/persist Vision; broadcast; return projection |

Runtime behavior:

1. Keep Viewer request compatibility: existing Viewer requests with
   `{ "text": string }` continue to use actor
   `{ "kind": "user", "host": "viewer" }`.
2. Allow the CLI/Raven path to provide a validated Raven actor and optional
   idempotency key without allowing arbitrary status, timestamp, manifest, or
   reducer-owned fields in the request body.
3. Validate Vision has started before appending. A Raven update before start
   returns structured `409` and does not append a slot event.
4. Unknown slot IDs return structured `400` with all valid slot IDs.
5. Successful Raven updates append exactly one
   `raven.vision.slot.updated` event.
6. The reducer updates only the targeted slot text/status/timestamps, clears
   that slot's `reviewedAt`, recomputes Vision status, and preserves all other
   slots plus `sourceItemIds`.
7. If an idempotency key is provided and the event already exists, the runtime
   must return the current projection without duplicating the event. It must
   still ensure config projection has been reduced for the event before
   returning.
8. After a successful append or idempotent replay, `/api/state`,
   `GET /api/raven/onboarding/vision`, and `ax2 inspect state --json` must
   agree on the Vision projection.
9. Runtime SSE subscribers receive both `state-event` and `project-state`
   messages for appended Raven slot updates, matching existing Vision mutation
   broadcast behavior.

Do not change approve/skip payloads for this ticket unless needed for actor
metadata. User review feedback is already visible through the existing
approve/skip events and projected slot statuses.

## Raven Feedback Loop

Raven's expected loop after this ticket:

1. Read current state:

   ```bash
   ax2 inspect state --json
   ```

2. Choose one slot whose current status and source context justify a draft.
3. Write exactly one slot:

   ```bash
   ax2 raven vision slot update --slot <slot-id> --text-file <draft> --json
   ```

4. Stop. Do not write another Vision slot until the user has had a chance to
   approve, skip, or edit.
5. Before continuing, read projected state again and, when needed, inspect
   recent events:

   ```bash
   ax2 inspect state --json
   ax2 inspect events list --json --limit 20
   ```

6. Treat `approved`, `skipped`, and user-authored `needs_review` slots as
   current user feedback. Do not reset them while drafting another slot.

This loop can be documented in the Next plugin now, even if the final Raven
play remains deferred.

## Viewer UX Contract

The FEAT-003/FEAT-004 Vision UI remains the same surface. FEAT-005 adds live
external update behavior:

1. With Vision open, a Raven CLI slot update should appear in the matching slot
   without a full page reload.
2. The slot status chip must show `Needs review`, and the card should keep the
   current dark/warm-walnut slate card treatment.
3. A subtle remote-write flash may be added to the changed slot, derived from
   the prototype `vb-remote-write-flash` pattern. The flash should use amber
   glow on slate, not a generic notification color.
4. Existing approved, skipped, and needs-review cards must retain their text
   and status unless the runtime projection changed that specific slot.
5. If the user clicks Approve after a Raven update, the updated text is
   approved and the status changes to `approved`.
6. If the user skips a Raven-written slot, the text clears and the status
   changes to `skipped`.
7. If the user manually edits a Raven-written slot, the same
   `raven.vision.slot.updated` reducer behavior applies and the latest text is
   visible to Raven through projected state/events.
8. If an external update arrives for a slot with an unsaved local edit, do not
   silently replace the textarea. Keep the user's local text, show a concise
   inline warning, and refresh cleanly after the local save/reload path
   resolves.
9. Do not add phase rails, source sliders, logo upload dependencies, or a
   generic admin/form layout. New visual elements should stay aligned with the
   prototype's slate plates/cards, amber/gold controls, Raven coin/bench, and
   compact slot/source review affordances.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 CLI router | `packages/ax-next/src/cli/router.ts`, `packages/ax-next/src/commands/raven.ts` or nearby focused modules, `packages/ax-next/README.md` | Adds a public deterministic `ax2 raven vision slot update` command without affecting Alexandria 1 |
| AX2 runtime client | `packages/ax-next/src/effects/runtime-client.ts` | Adds a typed client method for Raven slot updates through the local runtime, including runtime lifecycle metadata |
| AX2 runtime server | `packages/ax-next/src/effects/runtime-server.ts` | Factors Vision slot mutation so Viewer and Raven CLI updates share validation/reduce/persist/broadcast behavior with different actors |
| AX2 Raven domain | `packages/ax-next/src/domain/raven-vision.ts`, `tests/raven-vision.test.ts` | Adds preservation tests if existing reducer coverage does not already prove source IDs and unrelated slots survive Raven updates |
| AX2 event/state tests | `packages/ax-next/tests/events.test.ts`, `state.test.ts`, `runtime-server.test.ts`, `cli.test.ts` | Proves event actor/idempotency, projection agreement, CLI exit codes/output fields, and unrelated state preservation |
| Viewer runtime schemas | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `event-stream.ts`, `client.test.ts` | Decodes project-state messages carrying Raven Vision and supports app-level refresh from SSE |
| Viewer mounted app | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `VisionOnboardingView.tsx` | Subscribes to runtime project-state updates, refreshes open Vision projections, handles external updates and local-edit conflicts |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds fixture external Raven update and event-stream behavior plus browser coverage for open-screen Raven updates |
| Alexandria Next plugin skills | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`, `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`, or a new narrow Raven Vision skill | Documents one-slot-at-a-time Raven behavior and how to read approve/skip/edit feedback |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `ax-next-start` skill | After startup, Raven can inspect `raven.vision`, attached sources, and use the one-slot update command when asked to collaborate on Vision | Update command examples and run plugin validation |
| `alexandria-event-log` skill | Treat Vision review events as feedback: inspect current state, do not bulk fill, and continue only from current projected state | Update common event handling notes and run plugin validation |
| Possible new Next Raven Vision skill | If added, it should be a narrow guided loop for one slot, not a bulk-fill play | Validate plugin and keep eval impact section updated before merge |
| AX2 CLI behavior | New mutation command with stable output and exit codes | Add black-box CLI tests for help, invalid input, success JSON, operational failure, and stdout/stderr separation |
| Viewer user behavior | Open Vision screen reacts to external Raven updates and lets the user approve/skip/edit those updates | Add Playwright coverage for the collaboration loop |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 Raven reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves Raven slot update sets only the target slot to `needs_review` and preserves approved/skipped/needs-review/source state |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves Raven actor/idempotency, ledger event append, projection persistence, SSE broadcast, and structured 400/409 errors |
| AX2 state and events | `cd packages/ax-next && bun test tests/state.test.ts tests/events.test.ts` | Proves projected state and event schemas expose the feedback Raven reads |
| AX2 CLI black-box behavior | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves command help, exit codes, JSON output fields, invalid slot/missing text behavior, and stdout/stderr separation |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches command/runtime/domain type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves runtime schemas/client code decode project-state and Vision projections used by SSE refresh |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves an external Raven update appears in an open Vision screen, marks `needs_review`, and approve/skip feedback behaves correctly |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the mounted viewer bundle still builds for the fixture server |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required because this slice updates Next plugin guidance |

Manual verification:

1. Start from an initialized Alexandria Next project with FEAT-004 Vision source
   state available and Raven connected.
2. Open Viewer Next, start or reopen `Power up Raven: Vision`, and leave the
   Vision screen open.
3. From another shell or agent session, run
   `ax2 raven vision slot update --slot shift --text "A Raven draft." --json`.
4. Verify the open Viewer slot text updates and the slot is visibly
   `needs_review`.
5. Approve the slot in the UI and run `ax2 inspect state --json`; verify Raven
   can see `shift.status === "approved"`.
6. Run a Raven update for a later slot, skip it in the UI, and verify the text
   clears in Viewer and projected state.
7. Inspect `ax2 inspect events list --json --limit 20` and verify
   `raven.vision.slot.updated`, `raven.vision.slot.approved`, and
   `raven.vision.slot.skipped` events with appropriate actors.
8. Confirm attached sources and unrelated slot states remain unchanged after
   each Raven update.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Raven CLI/runtime | Deterministic Bun tests cover CLI, runtime, events, and state projection | Add focused deterministic tests; no LLM eval needed | `cd packages/ax-next && bun test tests/cli.test.ts tests/runtime-server.test.ts tests/state.test.ts tests/events.test.ts tests/raven-vision.test.ts` |
| Viewer Next Vision collaboration | Existing Playwright coverage covers Home, manual slots, and source intake | Extend browser coverage for external Raven update and user feedback loop | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin guidance | Plugin validation exists; current repo eval harness is oriented around the shipped Alexandria 1 plugin, not the Next plugin payload | Update guidance and run plugin validation. Do not claim eval-harness coverage for this slice unless a Next plugin eval case is explicitly added | `cd packages/alexandria-next-plugin && claude plugin validate .` |
| Alexandria 1 skills/evals | Existing eval suite covers the old plugin line | No rerun because Alexandria 1 is untouched | None |

No current eval-harness rerun is required for FEAT-005 as scoped because the
accepted implementation can be deterministic AX2 runtime/CLI behavior plus
Viewer UI refresh and narrow Next-plugin instructions. If implementation adds
or materially changes a product-facing Raven skill/play that drafts text
autonomously, revise this section before merge and either create a Next-plugin
eval case or document the blocker if the harness cannot yet load
`packages/alexandria-next-plugin`.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Raven bulk-fills the whole Vision form | CLI command updates exactly one slot per invocation; plugin guidance says inspect/write one/stop; tests should avoid all-slot auto-fill helpers |
| Generic event append leaves projected state stale | Do not use raw `ax2 inspect events append` as the Raven write path; the new command must use reducer-backed runtime mutation |
| Viewer update route records Raven writes as Viewer user writes | Allow validated Raven actor metadata on the runtime mutation path and test ledger actors |
| Raven updates reset user-reviewed slots or attached sources | Add reducer/runtime tests with approved, skipped, needs-review, and attached-source state before a Raven update |
| Open Viewer does not repaint after CLI mutation | Subscribe to runtime `project-state` SSE and add e2e coverage where the page is already open before the external update |
| External update overwrites unsaved local typing | Track pending local slot edits and surface a conflict instead of silently replacing active local text |
| Idempotent retries duplicate ledger events | Support optional idempotency keys and test duplicate command invocations |
| CLI command grows into play orchestration | Keep command to deterministic one-slot mutation; defer slot choice, drafting strategy, and source synthesis to plugin/play work |
| Runtime response shape breaks existing Viewer client | Preserve existing projection response for Viewer or update Viewer schemas and tests in the same slice |
| Plugin guidance changes lack eval coverage | Run plugin validation and document the lack of current Next-plugin eval harness coverage; add eval coverage only if autonomous Raven play behavior lands |

## Implementation Steps

1. Add `packages/ax-next/src/commands/raven.ts` or equivalent focused command
   module with help, argument parsing, exit codes, text/text-file validation,
   and JSON/human output formatting.
2. Wire the `raven` command into `packages/ax-next/src/cli/router.ts` and
   update `packages/ax-next/README.md` public command examples.
3. Extend `packages/ax-next/src/effects/runtime-client.ts` with a Raven Vision
   slot update method that reuses existing runtime discovery/startup.
4. Factor `ravenVisionSlotMutationResponse` in
   `packages/ax-next/src/effects/runtime-server.ts` so Viewer and Raven CLI
   callers share one append/reduce/persist/broadcast path.
5. Add request parsing for a validated Raven actor and optional idempotency
   key while keeping unsupported reducer-owned fields rejected.
6. Ensure idempotent Raven updates return current projection and do not
   duplicate `raven.vision.slot.updated`.
7. Add AX2 reducer/runtime/state/event/CLI tests for success, invalid input,
   before-start `409`, idempotency, actor metadata, ledger event presence,
   projection agreement, and unrelated state preservation.
8. Extend Viewer runtime schemas or app code so `project-state` SSE payloads
   can refresh `vision` when `raven.vision` appears.
9. Update `LibraryBrowserApp` and `VisionOnboardingView` to apply external
   Raven projections, render `needs_review`, optionally flash changed slots,
   and protect unsaved local edits from silent overwrite.
10. Extend the Viewer fixture with enough event-stream/external-update support
    to test a Raven update arriving while Vision is open.
11. Add Playwright coverage for Raven update visibility, approval feedback,
    skip clearing text, and unrelated slot/source preservation.
12. Update Alexandria Next plugin guidance for the inspect/write-one/wait loop
    and Vision review event feedback.
13. Run deterministic verification and plugin validation.

## Acceptance / Exit Criteria

1. `ax2 raven vision slot update --slot <id> --text <text> --json` updates one
   Vision slot through the runtime.
2. The command is non-interactive and has stable help, JSON output, stdout,
   stderr, and exit-code behavior.
3. Invalid slot IDs list all valid Vision slot IDs and exit `2`.
4. Updating before Vision starts fails with a structured operational error and
   does not append `raven.vision.slot.updated`.
5. A successful Raven update appends exactly one
   `raven.vision.slot.updated` event.
6. The ledger actor for Raven CLI updates identifies Raven/agent, while Viewer
   manual edits remain Viewer/user actor events.
7. The updated slot text appears in `GET /api/raven/onboarding/vision`,
   `/api/state`, and `ax2 inspect state --json`.
8. The updated slot status is `needs_review`.
9. Existing approved, skipped, needs-review, and empty slots are not reset by a
   Raven update to another slot.
10. Existing Vision `sourceItemIds` and attached source rows are not changed by
    a Raven slot update.
11. An already-open Viewer Vision screen updates when Raven writes a slot.
12. The Viewer status chip visibly shows `Needs review` for Raven-written text.
13. Approving a Raven-written slot in the UI changes projected state to
    `approved` and is visible to Raven through `ax2 inspect state --json`.
14. Skipping a Raven-written slot in the UI clears text, changes projected
    state to `skipped`, and is visible to Raven through state/events.
15. Editing a Raven-written slot in the UI produces the same reducer-backed
    `needs_review` state and is visible to Raven.
16. Raven plugin guidance instructs agents to inspect current state/events
    before each slot write and to stop after one slot.
17. Deterministic AX2, Viewer, and plugin validation commands in this section
    pass.
18. No Alexandria 1 surfaces are changed.
19. No library files are written as part of this ticket.

## Deferred Follow-Ups

1. FEAT-006 richer mixed-review source intake while Raven/user review is in
   progress.
2. The final `raven-fill-vision-slots` guided play with source synthesis.
3. Source processing summaries under
   `docs/alexandria/sources/processed/<sourceId>/<runId>.md`.
4. Source-to-slot attribution and per-slot rationale/scratch notes.
5. Banking Vision, Source of Truth generation, and Knowledge Bank
   `vision: banked`.
6. Next-plugin eval harness coverage for autonomous Raven play behavior.
7. Multi-agent/multi-session conflict resolution beyond same-slot local edit
   protection.
