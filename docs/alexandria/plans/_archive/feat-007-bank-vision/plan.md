# FEAT-007 Bank Vision Creates Raven's Source Of Truth

- Issue: GitHub #193,
  `[FEAT-007] Bank Vision creates Raven's Source of Truth`
- Run ID: `01KSXNE2SPH5VS93YWRZPB5YMC`
- Product plan: `raven-onboarding-experience`
- Product-plan anchor:
  `docs/alexandria/plans/raven-onboarding-experience/plan.md`
- Outcome: O-4, must tier
- Blocked by: FEAT-003 and FEAT-006
- Blocks: FEAT-008
- Primary surfaces: `packages/ax-next`, `packages/viewer-next`, and
  `packages/alexandria-next-plugin`

## Goal

Implement the first durable Raven banking step.

When Raven Vision is `ready_to_bank`, `Bank Vision` should generate a simple
deterministic Raven Source of Truth Markdown document from approved Vision slot
text, write it to
`docs/alexandria/source-of-truth/raven-product-context.md`, record its path and
content hash in Raven state, append `raven.source_of_truth.updated`, append
`raven.vision.banked`, and project both Vision and Raven Knowledge Bank subject
`vision` as `banked`.

This slice makes Vision bankable and inspectable. It does not turn the Source
of Truth into Library cards.

## Scope

This slice must include all of the following:

1. Extend AX2 Raven state to support Vision status `banked`, Raven Source of
   Truth metadata, and Raven Knowledge Bank subject `vision`.
2. Add event schema support for `raven.source_of_truth.updated` and
   `raven.vision.banked`.
3. Add a deterministic Source of Truth Markdown builder that uses approved,
   non-empty Vision slot text in manifest order and produces stable LF output
   with a final newline.
4. Add AX2 runtime support for banking Vision, including precondition checks,
   file write, content hash, config update, ledger events, and SSE project-state
   broadcast.
5. Add a deterministic CLI banking primitive, tentatively
   `ax2 raven vision bank [--json]`, so the behavior can be exercised without
   the Viewer and covered by black-box CLI tests.
6. Update `ax2 inspect state --json` so it reports:
   `raven.vision.status === "banked"`,
   `raven.sourceOfTruth.{path,contentHash,createdAt,updatedAt}`, and
   `raven.knowledgeBank.subjects.vision.status === "banked"` after banking.
7. Update Viewer Next so `Bank Vision` remains disabled until Vision is
   `ready_to_bank`, calls the runtime banking path when enabled, and moves the
   user to Raven's Knowledge Bank after a successful bank.
8. Update Raven's Knowledge Bank UI so Vision is shown as `banked` with the
   Source of Truth path/hash when projected state says it is banked.
9. Update narrow Alexandria Next plugin guidance so Raven treats the banked
   Source of Truth as durable context and does not continue to invent or emit
   Library cards in this slice.
10. Add deterministic AX2 reducer/runtime/CLI tests, Viewer runtime/e2e tests,
    and plugin validation for the changed surfaces.

## Non-Goals

Out of scope for FEAT-007:

1. Generating Library cards, writing under `docs/alexandria/library/`, or
   atomizing the Source of Truth.
2. Sophisticated Source of Truth authoring, Raven-authored prose beyond the
   deterministic approved-slot template, source summaries, citations, or
   builder handoff.
3. Generalizing Knowledge Bank banking beyond subject `vision`.
4. Implementing FEAT-008 or play unlock behavior beyond projecting Vision as
   banked.
5. Re-banking UX for post-bank edits, stale Source of Truth warnings, or
   Source of Truth version history.
6. Adding phase rails, source sliders, logo upload dependencies,
   overlay-as-home behavior, or generic admin/form UI.
7. Changing Alexandria 1 CLI, viewer, plugin, skill, or eval behavior.
8. Writing directly to `docs/alexandria/library/`.

## Linked Product-Plan Summary

The broader Raven onboarding plan defines Vision as the first Raven power-up
subject. FEAT-003 established manual Vision slot review and the
`ready_to_bank` projection. FEAT-004 added shared source intake. FEAT-005 and
FEAT-006 hardened Raven/user collaboration and late source additions without
resetting slot state.

FEAT-007 is the banking step from that plan: once every Vision slot is approved
or skipped and at least one approved slot contains text, the user can bank
Vision. Banking writes Raven's internal product-context Source of Truth,
records the Source of Truth pointer and hash, marks Vision banked, and updates
Raven's Knowledge Bank. The product plan explicitly says this Source of Truth
is not a user-facing section map and this slice must not generate Library
cards.

The production visual direction remains the current Raven prototype-derived
system: dark warm-walnut canvas, slate plates/cards, amber/gold stone controls,
Raven coin/agent bench, compact slot/source review affordances, no phase rail,
no source sliders, no logo upload dependency, and no overlay-as-home ambiguity.

## Current Gap

Current implementation after FEAT-006:

1. `packages/ax-next/src/domain/raven-vision.ts` supports Vision statuses
   `not_started`, `in_progress`, and `ready_to_bank`; it does not support
   `banked`.
2. `RavenAgentConfig` currently stores Vision onboarding state but has no typed
   `sourceOfTruth` or `knowledgeBank` state.
3. `packages/ax-next/src/domain/state-events.ts` validates Vision start/source
   attach/slot events, but not `raven.source_of_truth.updated` or
   `raven.vision.banked`.
4. `packages/ax-next/src/effects/runtime-server.ts` exposes Vision start,
   source attach, slot update, approve, and skip routes. It has no banking
   endpoint and no Source of Truth file writer.
5. `packages/ax-next/src/effects/runtime-client.ts` and
   `packages/ax-next/src/commands/raven.ts` expose only the one-slot Raven
   update command.
6. `ax2 inspect state --json` projects `raven.vision` only; Raven Knowledge
   Bank and Source of Truth metadata are not projected.
7. `packages/viewer-next/src/components/library/VisionOnboardingView.tsx`
   computes the correct enablement for `Bank Vision`, but clicking it only sets
   a placeholder message.
8. Viewer runtime schemas accept only the pre-bank Vision status literals, so a
   future `banked` status would fail decode until schemas are updated.
9. `RavenKnowledgeBankStatus` is static and always shows Vision as
   `Not banked`.
10. Existing tests prove `Bank Vision` enables at `ready_to_bank` and disables
    when a reviewed slot reopens, but no test proves the actual file, ledger,
    config, projection, or Knowledge Bank banking behavior.

## Architectural Boundaries

AX2 owns the deterministic banking behavior: event validation, Source of Truth
Markdown generation, file writing, content hashing, config projection updates,
runtime API behavior, CLI output, and inspectable state. The Viewer must call
the runtime path rather than writing files, config, or ledger events directly.

The Alexandria Next plugin owns guided play behavior. This slice may update
guidance so Raven knows how to read banked Vision state, but it should not add
an autonomous LLM authoring play or prompt-only banking path. The deterministic
builder is intentionally simple and should not depend on model output.

Viewer Next owns presentation and navigation. The Bank Vision button should
remain a stone-style Raven control in the existing Vision surface. After a
successful bank, the Viewer should show Raven's Knowledge Bank as a status
surface, not a Library page and not a modal.

The ledger remains append-only under the configured Alexandria workspace.
Current state remains in `.alexandria-next/alexandria-config.json`, with no
per-feature config files. The Source of Truth document lives under the
configured workspace at the stable project-relative path:

`docs/alexandria/source-of-truth/raven-product-context.md`

## State And Event Contract

Extend Raven state additively and keep existing config compatibility. Missing
`knowledgeBank` or `sourceOfTruth` in older configs must parse as absent state,
not as corruption.

Target config shape:

```ts
interface RavenAgentConfig {
  onboarding: {
    vision: RavenVisionOnboardingState;
  };
  knowledgeBank?: RavenKnowledgeBankState;
  sourceOfTruth?: RavenSourceOfTruthState;
  updatedAt: string;
}

interface RavenVisionOnboardingState {
  schemaVersion: 1;
  status: "not_started" | "in_progress" | "ready_to_bank" | "banked";
  sourceItemIds: string[];
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  startedAt?: string;
  bankedAt?: string;
  updatedAt?: string;
}

interface RavenSourceOfTruthState {
  path: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

interface RavenKnowledgeBankState {
  subjects: {
    vision?: {
      id: "vision";
      status: "in_progress" | "banked";
      bankedAt?: string;
    };
  };
  updatedAt?: string;
}
```

Projection should expose these fields under `state.raven`:

```ts
interface RavenProjection {
  vision: RavenVisionProjection;
  sourceOfTruth?: RavenSourceOfTruthState;
  knowledgeBank: RavenKnowledgeBankProjection;
}
```

Event additions:

1. `raven.source_of_truth.updated`
   - required payload: `{ "path": string, "contentHash": string }`
   - reducer behavior: update `agents.raven.sourceOfTruth`; preserve the prior
     `createdAt` when the path already exists, otherwise set `createdAt` to
     the event timestamp; always set `updatedAt` to the event timestamp.
2. `raven.vision.banked`
   - required payload:
     `{ "sourceOfTruthPath": string, "contentHash": string }`
   - reducer behavior: require Vision status `ready_to_bank` and matching
     Source of Truth metadata, then set Vision status `banked`, set
     `bankedAt`, and set Knowledge Bank subject `vision` to `banked`.

The banking runtime path must append `raven.source_of_truth.updated` before
`raven.vision.banked`. Both events should use deterministic idempotency keys
derived from subject `vision` and the Source of Truth content hash so retrying
the same bank does not duplicate ledger entries.

If Vision is not `ready_to_bank`, banking must fail with a structured runtime
error and no file write, no Source of Truth metadata update, and no banking
ledger events.

## Source Of Truth Markdown Contract

The generated document must be deterministic for the same approved Vision slot
state.

Path:

`docs/alexandria/source-of-truth/raven-product-context.md`

Content rules:

1. Use only approved slots whose trimmed text is non-empty.
2. Preserve Vision manifest order.
3. Normalize line endings to LF.
4. Trim leading/trailing blank lines from each slot text while preserving
   internal Markdown.
5. Do not include a generated timestamp or other volatile content in the
   Markdown body.
6. End the document with exactly one trailing newline.
7. Hash the exact bytes written with the existing `sha256:<hex>` content-hash
   convention used by `packages/ax-next/src/domain/sources.ts`.

Initial structure:

```md
# Raven Product Context

Generated from approved Raven Vision slots.

## Vision

### The Shift

Approved slot text...
```

Skipped slots are omitted in this slice. Attached sources may remain visible
through projected Vision state, but the Source of Truth builder should not
attempt source summaries or citations yet.

## Runtime And CLI Contract

Add runtime endpoint:

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/api/raven/onboarding/vision/bank` | Validate Vision is `ready_to_bank`, generate/write Source of Truth, append `raven.source_of_truth.updated`, append `raven.vision.banked`, persist Raven config, broadcast project state, and return Raven projection plus event metadata |

The endpoint body may be empty. If a body is accepted, it should allow only
`actor` and `idempotencyKey` fields, matching existing runtime mutation
validation style.

Response should include enough for Viewer and CLI callers:

```ts
interface RavenVisionBankResult {
  vision: RavenVisionProjection;
  sourceOfTruth: RavenSourceOfTruthState;
  knowledgeBank: RavenKnowledgeBankProjection;
  events: {
    sourceOfTruthUpdated: AlexandriaStateEvent;
    visionBanked: AlexandriaStateEvent;
  };
}
```

Add CLI command:

```bash
ax2 raven vision bank --json
```

CLI behavior:

1. Non-interactive in TTY and headless contexts.
2. Uses `withAlexandriaRuntime` and the runtime endpoint, not direct file,
   config, or ledger writes.
3. Human output is short: status, Source of Truth path, hash, and runtime
   lifecycle.
4. JSON output includes at least: command, `vision.status`,
   `sourceOfTruth.path`, `sourceOfTruth.contentHash`, Knowledge Bank subject
   `vision.status`, event IDs/types, and runtime lifecycle.
5. Exit codes:
   - `0` Vision banked or already banked with the same projected state.
   - `1` runtime, project-state, or precondition failure.
   - `2` invalid CLI input.
6. `--help` lists usage, `--json`, examples, and exit codes.

Already-banked retry behavior should be idempotent: if the current projected
state is already banked and the Source of Truth metadata exists, return success
without appending duplicate events. Re-banking after post-bank slot edits is a
deferred follow-up.

## Viewer UX Contract

`Bank Vision` behavior:

1. Disabled unless the current runtime Vision projection status is
   `ready_to_bank`.
2. Enabled only for `ready_to_bank`; not for `not_started`, `in_progress`, or
   `banked`.
3. Shows a pending state while the runtime bank request is in flight.
4. On success, applies the returned Vision projection, clears inline banking
   errors, and opens Raven's Knowledge Bank.
5. On runtime error, keeps the user on Vision and shows the existing etched
   inline error style.
6. Does not create Library cards, navigate to Library, or imply that Library
   output exists.

Knowledge Bank behavior:

1. Reads projected Raven Knowledge Bank and Source of Truth state.
2. Shows Vision as `Banked` when
   `raven.knowledgeBank.subjects.vision.status === "banked"`.
3. Shows the Source of Truth path and content hash in the side panel or Vision
   subject detail.
4. Keeps future subjects locked/grayed out.
5. Keeps Home and Library navigation available.
6. Uses the existing prototype-derived dark/warm-walnut, slate, amber/gold,
   Raven coin, and compact status language.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 Raven domain | `packages/ax-next/src/domain/raven-vision.ts`, or a new narrow Raven state module if the file gets too broad | Adds `banked` status, Source of Truth state, Knowledge Bank subject state, banking reducer behavior, and Source of Truth projection |
| AX2 config parsing | `packages/ax-next/src/domain/config.ts` | Parses and serializes optional Raven `sourceOfTruth` and `knowledgeBank` without dropping existing config branches |
| AX2 event schemas | `packages/ax-next/src/domain/state-events.ts` | Adds `raven.source_of_truth.updated` and `raven.vision.banked` validation and schema introspection |
| AX2 path/hash helpers | `packages/ax-next/src/domain/paths.ts`, `packages/ax-next/src/domain/sources.ts` | Adds Source of Truth path helper and reuses existing `hashText`/`sha256:<hex>` convention |
| AX2 runtime server | `packages/ax-next/src/effects/runtime-server.ts` | Adds the banking endpoint, deterministic Markdown write, event append order, config persistence, and SSE broadcast |
| AX2 runtime client | `packages/ax-next/src/effects/runtime-client.ts` | Adds typed bank Vision runtime call for CLI |
| AX2 CLI | `packages/ax-next/src/commands/raven.ts`, `packages/ax-next/README.md`, router only if needed | Adds `ax2 raven vision bank` help, validation, JSON/human output, and exit-code behavior |
| AX2 tests | `packages/ax-next/tests/raven-vision.test.ts`, `events.test.ts`, `state.test.ts`, `runtime-server.test.ts`, `cli.test.ts` | Covers reducer, event schema, Source of Truth file/hash/config, ledger events, inspect projection, CLI success/failure, and no Library cards |
| Viewer runtime schemas/client | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Accepts `banked`, decodes banking result, and exposes a bank Vision client method |
| Viewer Vision UI | `packages/viewer-next/src/components/library/VisionOnboardingView.tsx`, `LibraryBrowserApp.tsx`, `types.ts` if needed | Replaces placeholder click behavior with runtime banking, pending/error state, and post-bank Knowledge Bank route |
| Viewer Knowledge Bank UI | `packages/viewer-next/src/components/library/RavenKnowledgeBankStatus.tsx` | Renders projected Vision banked state and Source of Truth metadata instead of static `Not banked` |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds banking fixture route/state and browser coverage for ready, bank, completed Knowledge Bank |
| Alexandria Next plugin guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` and optionally `skills/alexandria-event-log/SKILL.md` | Tells Raven to treat banked Vision Source of Truth as durable context and not to generate Library cards in this slice |
| Alexandria 1 surfaces | No files expected | No behavior change |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `ax-next-start` skill | After banking, Raven can inspect `state.raven.sourceOfTruth` and `state.raven.knowledgeBank.subjects.vision`; banking is deterministic and not a Library-card generation step | Update concise guidance and run plugin validation |
| `alexandria-event-log` skill | If touched, mention `raven.source_of_truth.updated` and `raven.vision.banked` as durable context events | Run plugin validation; keep wording generic |
| AX2 CLI behavior | Adds `ax2 raven vision bank` as the deterministic headless banking primitive | Add black-box CLI help, invalid input, precondition, success JSON, exit-code, stdout/stderr tests |
| Viewer user behavior | Bank Vision becomes a real mutation and routes to Knowledge Bank completed state | Add Playwright coverage |
| Raven guided behavior | Raven should consume the banked Source of Truth as context after it exists | No autonomous LLM eval unless a new Raven play is added |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 Raven reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves ready Vision can become banked, Source of Truth metadata is recorded, Knowledge Bank subject `vision` becomes banked, and non-ready Vision cannot bank |
| AX2 event schema | `cd packages/ax-next && bun test tests/events.test.ts` | Proves new ledger event types and payload schemas are valid and discoverable |
| AX2 state projection | `cd packages/ax-next && bun test tests/state.test.ts` | Proves `ax2 inspect state --json` reports Vision, Source of Truth, and Knowledge Bank banked fields |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves endpoint writes the Markdown file, records hash/timestamps, appends both events in order, persists config, broadcasts state, rejects non-ready Vision, and does not create Library cards |
| AX2 CLI black-box behavior | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves command help, exit codes, JSON output fields, precondition failures, stdout/stderr separation, and no direct writes |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches domain/runtime/command type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves Viewer schemas decode `banked` and banking result shapes |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves Bank Vision enablement, successful banking, Knowledge Bank completed state, and no Library route/card claim |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the mounted viewer bundle builds for the fixture server |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required if Next plugin guidance changes |
| Markdown lint | Repo markdown lint for changed plan/skill prose | Keeps planning and guidance docs valid |

Manual CLI verification:

1. Initialize an Alexandria Next project.
2. Complete Vision review so `ax2 inspect state --json` reports
   `raven.vision.status` as `ready_to_bank`.
3. Run `ax2 raven vision bank --json`.
4. Verify
   `docs/alexandria/source-of-truth/raven-product-context.md` exists.
5. Verify the CLI JSON reports the same Source of Truth path and content hash
   as `.alexandria-next/alexandria-config.json`.
6. Run `ax2 inspect events list --json --limit 20` and verify
   `raven.source_of_truth.updated` appears before `raven.vision.banked`.
7. Run `ax2 inspect state --json` and verify Vision status and Knowledge Bank
   subject `vision` are `banked`.
8. Verify no new files were written under `docs/alexandria/library/`.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 banking runtime and CLI | Deterministic Bun tests already cover Raven Vision reducers, runtime APIs, state projection, event schemas, and Raven CLI command behavior | Extend deterministic tests for banking, Source of Truth file/hash/config, ledger events, inspect projection, and CLI output | `cd packages/ax-next && bun test tests/raven-vision.test.ts tests/events.test.ts tests/state.test.ts tests/runtime-server.test.ts tests/cli.test.ts` |
| Viewer Next Vision and Knowledge Bank | Playwright coverage already covers Home, Vision review, source intake, Raven updates, Quick Bar, and static Knowledge Bank | Extend browser coverage for enabled Bank Vision, successful bank, Knowledge Bank banked state, and no Library-card claim | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin guidance | Plugin validation exists; current checked-in eval harness is oriented around the shipped Alexandria 1 plugin line, not the Next plugin payload | Update guidance and run plugin validation; no LLM eval-harness rerun required unless a new autonomous Raven play is added | `cd packages/alexandria-next-plugin && claude plugin validate .` |
| Alexandria 1 skills/evals | Existing eval suite covers the old plugin line | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-007 as scoped because banking is
deterministic AX2/runtime behavior plus Viewer presentation and narrow Next
plugin guidance. If implementation adds a product-facing autonomous
`raven-bank-vision` play or materially changes Raven's LLM decision behavior,
revise this section before merge and add or rerun the appropriate Next Raven
eval coverage. If the current harness cannot load `packages/alexandria-next-plugin`,
document that blocker in the implementation result.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Bank Vision can be called before Vision is ready | Enforce the `ready_to_bank` precondition in runtime and CLI tests, not only in the disabled Viewer button |
| Source of Truth hashes drift between retries | Keep generated Markdown free of timestamps and volatile fields; hash the exact bytes written |
| Ledger and config drift if only one banking event is reduced | Append and reduce `raven.source_of_truth.updated` before `raven.vision.banked` in one runtime mutation path; test event order and final config |
| Duplicate banking events appear on retry | Use deterministic idempotency keys based on subject and content hash; add retry assertions |
| Knowledge Bank says Vision is banked while Source of Truth metadata is missing | Make `raven.vision.banked` require matching Source of Truth metadata; test malformed/precondition cases |
| Viewer decodes fail after adding `banked` | Update runtime schemas and client tests before wiring UI |
| UI turns Knowledge Bank into a second Library | Render a status/checklist surface with Source of Truth metadata; do not render Library cards or section maps |
| Implementation accidentally writes Library cards | Add runtime/CLI assertions that `docs/alexandria/library/` is unchanged or absent after banking |
| Plugin guidance implies Raven should author cards now | State that banked Vision is durable context only; Library card generation is deferred |
| Post-bank edits create stale Source of Truth ambiguity | Treat re-banking/staleness as deferred; for this slice, successful banking moves the user to completed Knowledge Bank state |

## Implementation Steps

1. Add Raven Source of Truth and Knowledge Bank types, parsers, and projection
   defaults while preserving existing config compatibility.
2. Extend Vision status parsing/projection with `banked` and add banked-state
   reducer tests.
3. Add `raven.source_of_truth.updated` and `raven.vision.banked` event schema
   validation plus event schema descriptor tests.
4. Add Source of Truth path helper and deterministic Markdown builder using
   approved slot text in manifest order.
5. Implement a Raven banking reducer/helper that applies Source of Truth
   metadata and marks Vision plus Knowledge Bank subject `vision` banked.
6. Implement `POST /api/raven/onboarding/vision/bank` in the runtime server
   using the existing mutation semaphore, config write, state load, and SSE
   broadcast patterns.
7. Add runtime-client support and `ax2 raven vision bank [--json]` with help,
   human/JSON output, validation, and exit-code behavior.
8. Extend `ax2 inspect state --json` projection tests for Source of Truth and
   Knowledge Bank banked state.
9. Update Viewer runtime schemas/client with `banked` and banking result decode.
10. Replace the Vision button placeholder with runtime banking, pending/error
    state, and post-success navigation to Raven's Knowledge Bank.
11. Update Knowledge Bank UI to render projected Vision banked state and Source
    of Truth metadata.
12. Extend the Viewer fixture with a bank endpoint/state projection and add
    Playwright coverage for the full UI banking path.
13. Update `ax-next-start` guidance, and `alexandria-event-log` only if useful,
    to explain the banked Source of Truth state and no-card boundary.
14. Run deterministic verification and plugin validation.

## Acceptance / Exit Criteria

1. `Bank Vision` is disabled when Vision is `not_started` or `in_progress`.
2. `Bank Vision` becomes enabled when Vision is `ready_to_bank`.
3. Calling the runtime/CLI banking path before `ready_to_bank` fails without
   writing the Source of Truth document and without appending banking events.
4. Banking writes or updates
   `docs/alexandria/source-of-truth/raven-product-context.md`.
5. The Source of Truth Markdown is deterministic and uses approved Vision slot
   text in manifest order.
6. Raven state records Source of Truth `path`, `contentHash`, `createdAt`, and
   `updatedAt`.
7. The ledger includes `raven.source_of_truth.updated`.
8. The ledger includes `raven.vision.banked`.
9. `raven.source_of_truth.updated` appears before `raven.vision.banked` for the
   banking mutation.
10. Vision onboarding status becomes `banked`.
11. Knowledge Bank subject `vision` becomes `banked`.
12. `ax2 inspect state --json` reports Vision and Knowledge Bank subject
    `vision` as `banked`.
13. `ax2 inspect state --json` reports Raven Source of Truth metadata.
14. Viewer moves to or clearly offers Raven's Knowledge Bank after banking; the
    planned implementation should route directly to Knowledge Bank.
15. Knowledge Bank shows Vision as banked and displays Source of Truth
    metadata.
16. No Library cards are generated and no files are written under
    `docs/alexandria/library/`.
17. Deterministic AX2, Viewer, and plugin validation commands in this plan pass.
18. No Alexandria 1 surfaces are changed.

## Deferred Follow-Ups

1. FEAT-008 play unlocks and any downstream builder handoff.
2. Sophisticated Source of Truth authoring with Raven/model synthesis.
3. Source summaries, citations, and source-to-slot attribution in the Source of
   Truth.
4. Library card generation from a banked Source of Truth.
5. Re-banking UX, stale Source of Truth detection, and Source of Truth version
   history after post-bank edits.
6. Generalized `raven-bank-subject` support for Vocabulary, Bets, Guardrails,
   User Research, and later Knowledge Bank subjects.
7. Next-plugin eval harness coverage for autonomous Raven banking plays once
   such plays exist.
