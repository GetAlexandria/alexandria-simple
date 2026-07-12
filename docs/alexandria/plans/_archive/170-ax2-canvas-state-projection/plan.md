# AX2 Canvas State Projection

- Issue: [#170](https://github.com/GetAlexandria/alexandria-internal/issues/170)
- Goal: make `ax2 inspect state --json` project canvas save and review events
  into a stable, useful canvas state shape for agent wake flows.
- Linked product plan: none. The GitHub issue body and the existing
  `ax2-state-contract-storage` / `ax2-viewer-agent-architecture` plans are the
  source for this slice.

## Scope

In scope:

- Extend the existing `packages/ax-next` project-state projection so
  `canvas.step.saved` and `canvas.review.requested` events populate
  `state.canvas.sessions` and `state.canvas.views`.
- Keep `ax2 inspect state --json` as the first high-level inspection path for
  agents woken by `canvas.review.requested`.
- Preserve raw `ax2 inspect events list --json` as an audit/debug path, not the
  required primary path for normal wake response.
- Add deterministic AX2 tests for empty canvas state, save-only canvas context,
  and review-requested canvas context.
- Update wake-message or help text only where it currently implies agents must
  inspect raw events before using projected state.

## Non-Goals

- Do not create a new higher-level canvas inspection command unless projection
  proves insufficient during implementation.
- Do not change Alexandria 1 packages.
- Do not write to `docs/alexandria/library/`.
- Do not redesign the full canvas model, viewer UI, or runtime server API.
- Do not add workflow-specific canvas write commands in this slice; raw
  `ax2 inspect events append` remains the test and low-level mutation path.
- Do not change event payload schemas unless a deterministic test exposes a
  current schema bug.

## Current Gap

AX2 already recognizes the relevant event types:

- `canvas.step.saved`
- `canvas.review.requested`

Those event payloads are schema-backed in
`packages/ax-next/src/domain/state-events.ts`, and the Claude monitor already
classifies `canvas.review.requested` as wake-worthy while treating
`canvas.step.saved` as context-only.

The gap is in `packages/ax-next/src/domain/project-state.ts`: `CanvasProjection`
is currently typed and returned as:

```ts
export interface CanvasProjection {
  sessions: [];
  views: [];
}
```

As a result, `ax2 inspect state --json` can report `canvas.sessions: []` and
`canvas.views: []` even when the ledger contains the exact save/review payloads
an awakened agent needs. The agent then has to discover and reverse-engineer
`ax2 inspect events list --json`.

## Architectural Boundaries

- `packages/ax-next` owns deterministic state loading, projection, CLI output,
  exit codes, and black-box tests.
- `packages/alexandria-next-plugin` owns guided play behavior. It should only
  change if existing skill prose needs to clarify that state is the first
  inspection path and raw events are for audit/debugging.
- The event ledger remains the durable source of truth. The canvas projection is
  derived state and must not write a new per-feature state file.
- Projection should be pure and should stay inside the existing
  `deriveProjectState` path used by `inspect state`, triggers, monitor logic,
  and runtime endpoints.
- Use the Effect patterns already present in `packages/ax-next`; do not add a
  separate state-loading stack.

## Stable Canvas Projection Shape

Keep the existing top-level `canvas.sessions` and `canvas.views` keys so empty
state stays compatible:

```json
{
  "canvas": {
    "sessions": [],
    "views": []
  }
}
```

For canvas events, project into this stable schema:

```ts
interface CanvasProjection {
  sessions: CanvasSessionProjection[];
  views: CanvasViewProjection[];
}

interface CanvasSessionProjection {
  canvasId: string;
  createdAt: string;
  updatedAt: string;
  stepIds: string[];
  reviewIds: string[];
  eventCount: number;
}

interface CanvasViewProjection {
  canvasId: string;
  stepId: string;
  createdAt: string;
  updatedAt: string;
  latestStepSaved?: CanvasStepSavedProjection;
  latestReviewRequested?: CanvasReviewRequestedProjection;
}

interface CanvasStepSavedProjection {
  eventId: string;
  at: string;
  contentHash: string;
  payload?: Record<string, unknown>;
}

interface CanvasReviewRequestedProjection {
  eventId: string;
  at: string;
  reviewId: string;
  prompt?: string;
  payload?: Record<string, unknown>;
}
```

Projection rules:

1. Use `event.payload.canvasId` when present; otherwise use a stable default
   canvas id, `default`.
2. Group views by `(canvasId, stepId)`.
3. For each view, keep the latest `canvas.step.saved` by ledger order as
   `latestStepSaved`.
4. For each view, keep the latest `canvas.review.requested` by ledger order as
   `latestReviewRequested`.
5. Preserve the event `payload` object exactly as validated by the event schema;
   do not rename or flatten user payload fields.
6. Build one session per `canvasId`, with deduplicated `stepIds` and
   `reviewIds`.
7. Order `sessions` and `views` deterministically by first relevant event
   appearance in the ledger. Within each session, order `stepIds` and
   `reviewIds` by first appearance.

This shape gives an awakened agent the review prompt, review payload, latest
saved step payload, content hash, and source event ids from
`ax2 inspect state --json` without parsing JSONL.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX2 state projection | `packages/ax-next/src/domain/project-state.ts` | Project canvas save/review events into stable `canvas.sessions` and `canvas.views` instead of hard-coded empty arrays |
| AX2 inspect state CLI | `packages/ax-next/src/commands/state.ts` | JSON output gains populated canvas fields; human summary may include canvas view/session counts while keeping exit codes unchanged |
| AX2 tests | `packages/ax-next/tests/state.test.ts` and focused domain tests if useful | Black-box coverage for empty, save-only, and review-requested canvas projection |
| Wake guidance | `packages/ax-next/src/domain/wake-classification.ts`, `packages/ax-next/tests/wake-classification.test.ts`, `packages/ax-next/tests/claude-monitor.test.ts` if current wording changed | Wake messages continue to direct agents to `ax2 inspect state --json` first; raw events remain an optional audit/debug path |
| Next plugin guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` only if needed | Clarify state-first inspection without telling agents to write or parse state files directly |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Claude/Codex wake flow | A `canvas.review.requested` wake can be handled by running `ax2 inspect state --json` and reading `canvas.views[].latestReviewRequested` plus `latestStepSaved` | Update deterministic wake tests only if message text changes |
| `ax-next-start` skill | No required change if it already points at `ax2 inspect state --json`; update only if implementation finds raw-event-first guidance in the Next plugin | If touched, run plugin validation and markdown lint |
| Raw event inspection | Remains available for audit/debugging but is not required to understand current canvas context | Keep existing `inspect events` tests passing |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused state tests | `cd packages/ax-next && bun test tests/state.test.ts` | Proves `ax2 inspect state --json` exposes empty, save-only, and review-requested canvas state |
| Event schema regression | `cd packages/ax-next && bun test tests/events.test.ts` | Confirms existing canvas event payload validation still accepts save and review events |
| Wake regression | `cd packages/ax-next && bun test tests/wake-classification.test.ts tests/claude-monitor.test.ts` | Confirms review events still wake, save events remain context-only, and wake instructions stay state-first |
| Full AX2 suite | `cd packages/ax-next && bun test` | Catches regressions in init, inspect, events, monitor, play, and runtime behavior |
| Typecheck | `cd packages/ax-next && pnpm exec tsc --noEmit -p tsconfig.json` | Validates the new projection interfaces and CLI consumers |
| Lint | `cd packages/ax-next && pnpm exec eslint src tests e2e` | Keeps package style consistent |
| Plugin validation, conditional | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required only if Next plugin skill or manifest files change |
| Markdown lint, conditional | Repo markdown lint command for changed markdown files | Required for this plan file and any changed skill prose |

Black-box CLI assertions should cover:

1. Empty initialized project: `canvas.sessions` and `canvas.views` are `[]`,
   exit code is `0`, stderr is empty.
2. Save-only project: after one `canvas.step.saved`, state has one session and
   one view with `latestStepSaved.contentHash`, `latestStepSaved.payload`, and
   no `latestReviewRequested`.
3. Review-requested project: after one save and one
   `canvas.review.requested` for the same step, state has one view with both
   `latestStepSaved` and `latestReviewRequested`, including the review `prompt`,
   review `payload`, `reviewId`, and source `eventId`.
4. Multi-canvas or missing-canvas-id behavior if added as a unit test:
   missing `canvasId` uses `default`, and explicit `canvasId` does not merge
   with default.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX2 CLI state projection | Deterministic Bun tests in `packages/ax-next/tests` | Add/extend tests; no LLM eval required | `cd packages/ax-next && bun test tests/state.test.ts` |
| Wake behavior | Deterministic wake classification and Claude monitor tests | Rerun focused wake tests; update assertions only if guidance text changes | `cd packages/ax-next && bun test tests/wake-classification.test.ts tests/claude-monitor.test.ts` |
| Next plugin skill prose | `ax-next-start` has no dedicated eval case in the current Alexandria 1 eval harness | No eval rerun if skill prose is untouched. If touched, validate plugin and record that Next plugin eval coverage remains deferred until a Next-specific eval harness exists | `cd packages/alexandria-next-plugin && claude plugin validate .` |

No existing `packages/ax/tests/eval-cases` case exercises Alexandria Next canvas
wake flows. This slice should not add a broad LLM eval unless it changes
reusable Next plugin skill behavior beyond command guidance. The required
quality gate is deterministic AX2 CLI and wake-flow coverage.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The projection overfits the current demo payload and becomes unstable for future canvas UI work | Keep opaque `payload` objects intact, expose only generic envelope fields (`eventId`, `at`, `canvasId`, `stepId`, `reviewId`, `prompt`, `contentHash`), and avoid product-specific payload flattening |
| Missing `canvasId` events become impossible to group consistently | Use the explicit stable default id `default` and test it |
| Later saves after a review obscure what the review was originally based on | This slice exposes the current latest save and latest review by step. If immutable review-to-save snapshots are needed, defer that as a separate event-schema or projection enhancement |
| Agents still fall back to raw events because wake text is ambiguous | Keep wake guidance state-first and add deterministic text assertions where messages changed |
| Projection order flakes across runtimes | Derive order from ledger order and test arrays directly in black-box CLI output |
| Canvas projection duplicates future viewer-specific state rules | Keep projection pure and generic in AX2; viewer can consume this state but should not define the contract in this slice |
| Human output grows noisy | JSON is the contract. Human summary should remain terse and at most add canvas counts |

## Implementation Steps

1. Update `CanvasProjection` types in
   `packages/ax-next/src/domain/project-state.ts` to include session and view
   projection interfaces.
2. Add a pure `deriveCanvasProjection(events)` helper near
   `derivePlayIntents`, keeping event traversal deterministic and isolated.
3. In the helper, handle only `canvas.step.saved` and
   `canvas.review.requested`; ignore malformed payloads defensively even though
   the loader validates events.
4. Use `default` for absent `canvasId`, group by `(canvasId, stepId)`, and
   retain latest save/review by ledger order.
5. Return `canvas: deriveCanvasProjection(input.stateEvents)` from
   `deriveProjectState`.
6. Optionally update `formatStateSummary` to include `Canvas sessions: N` and
   `Canvas views: N`, keeping stdout terse.
7. Extend `packages/ax-next/tests/state.test.ts` with black-box CLI fixtures
   for empty canvas state, save-only state, and review-requested state.
8. Keep or add focused domain-level tests only if black-box tests become too
   indirect for latest-event and default-canvas ordering rules.
9. Review wake messages and `ax-next-start` guidance. Change only wording that
   still makes raw event inspection sound required before state inspection.
10. Run the focused AX2 tests, then the full AX2 test/typecheck/lint commands
    listed above.
11. If any Next plugin file changes, run plugin validation and markdown lint.

## Acceptance / Exit Criteria

1. Given an initialized project with no canvas events,
   `ax2 inspect state --json` returns `canvas.sessions: []` and
   `canvas.views: []`.
2. Given a project with one `canvas.step.saved`,
   `ax2 inspect state --json` returns a canvas session and view containing the
   step id, content hash, save event id, save timestamp, and save payload.
3. Given a project with one `canvas.step.saved` and one
   `canvas.review.requested` for the same step,
   `ax2 inspect state --json` returns a canvas view containing both the latest
   saved step context and the latest review request, including `reviewId`,
   `prompt`, review payload, and source event id.
4. The JSON schema is stable enough for Claude/Codex wake instructions to use
   `ax2 inspect state --json` as the first inspection command.
5. Raw `ax2 inspect events list --json` remains available for audit/debugging
   and existing event tests still pass.
6. Deterministic tests cover empty, save-only, and review-requested contexts.
7. AX2 exit codes for `inspect state` remain unchanged: `0` success, `1`
   missing/invalid project state, `2` invalid input.
8. No Alexandria 1 package and no `docs/alexandria/library/` files are changed.

## Deferred Follow-Ups

1. Add workflow-specific `ax2 canvas save` and `ax2 canvas review-request`
   commands if raw event append remains too low-level for viewer or agent
   writers.
2. Add immutable review snapshots if product behavior needs each review request
   to preserve the exact saved content hash active at request time, even after
   later saves.
3. Add Viewer Next UI consumption of projected `canvas.views` once the viewer
   needs to display current canvas context.
4. Add Next-plugin LLM eval coverage for canvas wake flows when a Next-specific
   eval harness exists.
5. Consider an `ax2 inspect canvas --json` command only if `inspect state`
   becomes too large or agents need a bounded canvas-only response.
