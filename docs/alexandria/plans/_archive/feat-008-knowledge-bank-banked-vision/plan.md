# FEAT-008 Knowledge Bank Shows Banked Vision

- Issue: GitHub #194, `[FEAT-008] Knowledge Bank shows banked Vision`
- Run ID: `01KSXRY98TQM0HD6NJ43GSG9VB`
- Product plan: `raven-onboarding-experience`
- Product-plan anchor:
  `docs/alexandria/plans/raven-onboarding-experience/plan.md`
- Product ticket:
  `docs/alexandria/implementation-plans/raven-onboarding-experience/tickets/FEAT-008.md`
- Outcome: O-4, must tier
- Blocked by: FEAT-002 and FEAT-007
- Primary surfaces: `packages/ax-next` and `packages/viewer-next`
- Guardrail surface: `packages/alexandria-next-plugin`

## Source Context

This plan is based on the issue text supplied in the run prompt, the local
product ticket, the broader Raven onboarding release plan, the existing
FEAT-007 banking plan, current AX2 and Viewer Next implementation, and the
canvas prototype design references named by the issue.

A live GitHub issue fetch was attempted. The local environment does not have
`gh` installed, and the browser fetch returned no additional issue body, so no
issue comments beyond the prompt were available during this planning pass.

Required repo guidance read for this plan:

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `packages/ax-next/CLAUDE.md`
- `packages/ax-next/docs/cli-design-principles.md`
- `packages/alexandria-next-plugin/CLAUDE.md`
- `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`
- `packages/viewer-next/README.md`
- `EVALS.md`

Prototype sources read for this plan:

- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/js/raven.js`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/raven.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/product-library/assets/css/vision-onboarding.css`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/brand.md`
- `docs/alexandria/plans/canvas-library-spike/prototype/docs/design/canvas-patterns.md`

## Goal

Make Raven's Knowledge Bank a durable status screen for Raven capability
progress.

The screen must open from Raven's Quick Bar and after Vision banking. It must
show Vision as banked only when `ax2 inspect state --json` projects Vision as
banked, show Vision as not banked before that point, show future subjects as
locked from a static subject manifest, and avoid any implication that Knowledge
Bank subjects are Library cards.

## Scope

In scope:

1. Add or tighten a static Raven Knowledge Bank subject manifest for the
   production subjects visible in this slice:
   `vision`, `vocabulary`, `bets`, `guardrails`, and `user-research`.
2. Keep persisted Knowledge Bank state limited to project-specific subject
   progress, currently only `vision` when it is in progress or banked.
3. Derive `available`, `in_progress`, `banked`, and `locked` display statuses
   by combining persisted state, Vision onboarding projection, the subject
   manifest, and product rules.
4. Expose the derived Knowledge Bank projection through
   `ax2 inspect state --json` so the Viewer does not own a separate subject
   list or status model.
5. Update Viewer runtime schemas and `RavenKnowledgeBankStatus.tsx` to render
   the AX2 projection, including future locked subjects from the manifest.
6. Preserve the existing Raven Quick Bar route to Knowledge Bank.
7. Preserve FEAT-007 post-bank routing from Vision to Knowledge Bank.
8. Add deterministic AX2 state/CLI tests and Viewer runtime/e2e tests for
   before-bank, after-bank, future-locked, and no-Library-card behavior.
9. Keep the visual treatment derived from the canvas prototype: warm walnut
   canvas, slate plates, amber stone controls, compact status pips, Raven
   coin/bench continuity, and locked future rows.

## Non-Goals

Out of scope:

1. Generating, atomizing, displaying, editing, or deleting Library cards.
2. Writing under `docs/alexandria/library/`.
3. Adding full Playbook UI, callable plays, or stored play unlock state.
4. Generalizing subject banking beyond Vision.
5. Building future subject flows for Vocabulary, Bets, Guardrails, or User
   Research.
6. Reintroducing phase rails, source sliders, logo upload, overlay-as-home
   behavior, or prototype playbook filtering.
7. Adding new autonomous Raven plays or LLM-authored Knowledge Bank behavior.
8. Changing Alexandria 1 packages or old plugin behavior.

## Linked Product-Plan Summary

The `raven-onboarding-experience` plan says the first useful Raven loop is
Home -> Vision -> Bank -> Knowledge Bank. FEAT-002 made Raven's coin open a
Quick Bar. FEAT-007 makes Vision banking deterministic: it writes Raven's
Source of Truth, records Source of Truth metadata, appends
`raven.source_of_truth.updated` and `raven.vision.banked`, and projects
`raven.knowledgeBank.subjects.vision.status === "banked"`.

FEAT-008 is the status-legibility slice after that banking work. It must show
what changed without implying the Library has been atomized. Knowledge Bank is
a Raven capability/progress surface. The Library remains the separate card
surface.

The issue's visual direction points to the canvas spike, especially the
Knowledge Bank bands in `raven.js` and `raven.css`, the banked subject treatment
in `vision-onboarding.css`, and the brand/pattern guidance for dark slate
cards, amber controls, compact status pips, and Raven bench continuity. The
production simplification remains: no phase rail, no source sliders, no logo
upload dependency, and no overlay-as-home ambiguity.

## Current Implementation Gap

Current implementation already has important FEAT-007 foundations:

1. `packages/ax-next/src/domain/raven-vision.ts` supports Vision status
   `banked`, Raven Source of Truth metadata, and persisted Knowledge Bank
   subject `vision`.
2. `packages/ax-next/src/domain/project-state.ts` projects
   `state.raven.knowledgeBank.subjects.vision`.
3. `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx` opens
   Knowledge Bank from Raven's Quick Bar and after successful Vision banking.
4. `packages/viewer-next/src/components/library/RavenKnowledgeBankStatus.tsx`
   shows Vision as `Banked` when the projected Vision subject is banked and
   displays Source of Truth path/hash.
5. Viewer e2e coverage already exercises Quick Bar -> Knowledge Bank and
   Bank Vision -> Knowledge Bank at a basic level.

The gaps for this issue are narrower but still product-significant:

1. The future subject list is hardcoded in `RavenKnowledgeBankStatus.tsx`,
   separate from AX2 state projection. This risks Viewer/CLI drift.
2. `RavenKnowledgeBankProjection` exposes only `subjects.vision`, so
   `ax2 inspect state --json` cannot currently be the source of truth for the
   future locked subjects the UI shows.
3. The initialized-project projection currently defaults Vision to
   `in_progress`; before Vision starts, the derived display status should be
   `available` or otherwise clearly not banked.
4. Viewer runtime schemas only accept a Knowledge Bank with
   `subjects.vision`, so they cannot decode a manifest-backed projection with
   locked future subjects.
5. Existing e2e coverage proves `Vision` can say `Not banked` and then
   `Banked`, but it does not prove future subjects come from the static
   manifest, remain locked/grayed out, or that the screen explicitly separates
   Raven capability status from Library cards.
6. The current component copy is close but should more directly say that this
   is Raven capability status and not Library card output.
7. There is no CLI black-box assertion that the Knowledge Bank projection used
   by the UI matches `ax2 inspect state --json`, including future locked
   subjects.

## Architectural Boundaries

AX2 owns the deterministic Knowledge Bank projection. The projection should be
derived from persisted Raven state, Vision onboarding status, a static subject
manifest, and explicit product rules. Config must not store locked/available
future subjects or play unlock lists.

Viewer Next owns presentation and navigation. It should render the projected
Knowledge Bank data and use local UI state only for active view selection. It
must not maintain a separate future subject manifest when the runtime state is
available, and it must not write files, config, ledger events, or Library cards.

The Alexandria Next plugin owns guided behavior. This slice should not change
agent prompts or add autonomous play behavior unless implementation discovers
that existing guidance materially misstates the Knowledge Bank boundary. If
plugin files are touched, run plugin validation and keep wording generic.

Effect stays at runtime boundaries. AX2 domain projection code should remain
ordinary deterministic TypeScript. Viewer runtime schema/client changes stay in
`src/app/runtime/*`; pure React components receive plain props.

Alexandria 1 is not part of this slice.

## Knowledge Bank Projection Contract

Add a static manifest near the AX2 Raven domain, either in
`packages/ax-next/src/domain/raven-vision.ts` if the change stays small or in a
new `packages/ax-next/src/domain/raven-knowledge-bank.ts` if it clarifies the
boundary.

Target subject manifest:

```ts
type RavenKnowledgeSubjectId =
  | "vision"
  | "vocabulary"
  | "bets"
  | "guardrails"
  | "user-research";

interface RavenKnowledgeSubjectDefinition {
  id: RavenKnowledgeSubjectId;
  label: string;
  band: "strategy" | "product" | "learning";
  order: number;
  description: string;
  lockedReason?: string;
}
```

Persisted config remains project-specific progress only:

```ts
interface RavenKnowledgeBankState {
  subjects: Partial<
    Record<
      RavenKnowledgeSubjectId,
      {
        id: RavenKnowledgeSubjectId;
        status: "in_progress" | "banked";
        bankedAt?: string;
      }
    >
  >;
  updatedAt?: string;
}
```

Projection should be display-ready and derived:

```ts
type RavenKnowledgeSubjectProjectionStatus =
  | "available"
  | "in_progress"
  | "banked"
  | "locked";

interface RavenKnowledgeSubjectProjection
  extends RavenKnowledgeSubjectDefinition {
  status: RavenKnowledgeSubjectProjectionStatus;
  persistedStatus?: "in_progress" | "banked";
  bankedAt?: string;
  sourceOfTruth?: RavenSourceOfTruthState;
}

interface RavenKnowledgeBankProjection {
  manifest: readonly RavenKnowledgeSubjectDefinition[];
  subjects: Record<RavenKnowledgeSubjectId, RavenKnowledgeSubjectProjection>;
  updatedAt?: string;
}
```

Initial product rules for FEAT-008:

1. Vision is `banked` only when persisted Knowledge Bank state says
   `subjects.vision.status === "banked"`.
2. Vision is `in_progress` when Vision onboarding has started but is not
   banked.
3. Vision is `available` when Vision has not started and is not banked.
4. Vocabulary, Bets, Guardrails, and User Research are `locked` in this slice.
5. Locked/available statuses are never written into `agents.raven`.
6. If a future `playUnlocks` projection exists or is introduced nearby, it must
   be computed from this projection and a play manifest, not stored in
   `agents.raven`.

Backward compatibility:

1. Existing config with only `knowledgeBank.subjects.vision` must keep parsing.
2. Existing plugin guidance that reads
   `raven.knowledgeBank.subjects.vision.status` after banking must continue to
   work.
3. The FEAT-007 banking response can continue to include `subjects.vision` as
   `banked`; adding manifest-backed fields must be additive for callers where
   practical.

## Viewer UX Contract

Knowledge Bank should be a full Viewer surface, not a modal, not Home, and not
a Library card view.

Entry behavior:

1. Clicking Raven's coin opens the Quick Bar.
2. Clicking `Knowledge Bank` closes the Quick Bar and opens the Knowledge Bank
   surface.
3. Successful Vision banking routes directly to the Knowledge Bank surface with
   the returned projection applied.
4. Home and Library navigation remain available.
5. Closing the Quick Bar while Knowledge Bank is open leaves Knowledge Bank
   open.

Status behavior:

1. Before Vision banking, Vision is not shown as banked.
2. After Vision banking, Vision is shown as banked and displays Source of Truth
   path/hash when present.
3. Future manifest subjects are visible, disabled/grayed out, and labelled as
   locked.
4. The screen names the surface as Raven capability/status, not Library cards.
5. The screen does not render Library card grids, folder shelves, constellation
   card nodes, source sliders, phase rails, or logo upload affordances.

Visual behavior:

1. Use warm walnut canvas ground and slate plates/cards from `brand.md` and
   `canvas-patterns.md`.
2. Translate the prototype Knowledge Bank bands/subjects into a simpler
   production status list. Preserve compact rows, locked treatment, and calm
   banked Vision treatment; do not restore prototype playbook filtering.
3. Use compact status pips/badges where status is needed. Avoid large generic
   admin badges.
4. Keep the bottom Raven bench present and visually continuous with the surface.
5. Keep responsive layout stable on desktop and mobile; subject text and hashes
   must not overflow their containers.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 Knowledge Bank domain | `packages/ax-next/src/domain/raven-vision.ts` or new `packages/ax-next/src/domain/raven-knowledge-bank.ts` | Adds static subject manifest, subject id union, derived display statuses, and projection helpers |
| AX2 project state | `packages/ax-next/src/domain/project-state.ts` | Projects manifest-backed Knowledge Bank subjects from config plus Vision state |
| AX2 config parsing | `packages/ax-next/src/domain/raven-vision.ts`, `config.ts` only if needed | Keeps persisted state progress-only and backward-compatible while accepting known subject ids |
| AX2 CLI/state tests | `packages/ax-next/tests/state.test.ts`, `tests/cli.test.ts`, `tests/raven-vision.test.ts` | Proves inspect JSON fields, pre-bank not-banked state, banked Vision, future locked subjects, and no stored unlocks |
| Viewer runtime schemas/client | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.test.ts` | Decodes manifest-backed Knowledge Bank projection and bank result payloads |
| Viewer Knowledge Bank UI | `packages/viewer-next/src/components/library/RavenKnowledgeBankStatus.tsx`, styles in `global.css` only if needed | Renders subjects from projection rather than local hardcoded future subjects; adds status/not-Library copy and locked treatment |
| Viewer app routing | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `RavenBench.tsx` only if needed | Preserves Quick Bar and post-bank Knowledge Bank routing |
| Viewer e2e fixture/tests | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Fixture mirrors projected manifest subjects; e2e covers before-bank, after-bank, future locked subjects, and no Library-card UI |
| Viewer stories | `packages/viewer-next/src/components/library/*.stories.tsx` if present/useful | Optional visual review states for pre-bank and banked Knowledge Bank |
| Alexandria Next plugin | No files expected; `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` only if wording needs correction | No guided play change; plugin validation if touched |
| Alexandria 1 | No files expected | No behavior change |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| AX2 CLI behavior | `ax2 inspect state --json` exposes a manifest-backed Knowledge Bank projection; no new command is expected | Add black-box CLI assertions for JSON fields and exit code `0` |
| Viewer user behavior | Knowledge Bank renders runtime-projected subjects and distinguishes Raven capability status from Library cards | Add Viewer runtime and Playwright coverage |
| Alexandria Next plugin skills | No intended behavior change; existing guidance can continue to read banked Vision state | No eval rerun; run `claude plugin validate .` only if plugin files are touched |
| Raven guided behavior | No autonomous Raven decision changes | No LLM eval unless a new play/prompt behavior is added |
| Templates/docs | No public docs expected in this slice | Markdown lint changed plan/prose only |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 state projection | `cd packages/ax-next && bun test tests/state.test.ts` | Proves initialized/pre-bank state is not falsely banked, banked Vision is banked, future subjects are projected locked, and config stays progress-only |
| AX2 Raven domain | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves Knowledge Bank reducer/projection compatibility with FEAT-007 banking |
| AX2 CLI black-box behavior | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves `ax2 inspect state --json` exits `0` and includes the important Knowledge Bank fields |
| AX2 runtime guard | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves Vision banking still returns Knowledge Bank state and does not write Library cards |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches projection/schema type drift |
| Viewer runtime schema | `cd packages/viewer-next && pnpm run test` | Proves the browser decodes manifest-backed Knowledge Bank state and bank results |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves Quick Bar entry, pre-bank not-banked state, banking route, banked Vision, locked future subjects, and no Library-card rendering |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the mounted Viewer bundle builds |
| Plugin validation | `cd packages/alexandria-next-plugin && pnpm run validate` if plugin files are touched | Required for Next plugin payload changes |
| Markdown lint | Repo markdown lint for changed plan/prose | Keeps plan and docs valid |

Manual CLI/UI cross-check:

1. Open Knowledge Bank in a fresh initialized Alexandria Next project and
   verify Vision is not banked.
2. Run `ax2 inspect state --json` and verify the same Vision status and locked
   future subjects shown by the UI.
3. Complete or fixture Vision to `ready_to_bank`, then bank Vision through the
   Viewer or `ax2 raven vision bank --json`.
4. Run `ax2 inspect state --json` and verify
   `raven.knowledgeBank.subjects.vision.status === "banked"` plus matching
   Source of Truth metadata.
5. Verify no files were written under `docs/alexandria/library/`.
6. If a play unlock projection exists, verify it is absent from
   `.alexandria-next/alexandria-config.json` and derived from the projected
   Knowledge Bank state.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Knowledge Bank projection and CLI inspect output | Deterministic Bun tests cover state projection, Raven Vision banking, runtime APIs, and CLI behavior | Extend deterministic tests; no LLM eval needed | `cd packages/ax-next && bun test tests/state.test.ts tests/raven-vision.test.ts tests/runtime-server.test.ts tests/cli.test.ts` |
| Viewer Next Knowledge Bank | Playwright covers Quick Bar entry and basic Bank Vision route | Extend runtime/e2e coverage for manifest future subjects, pre-bank not-banked state, locked/grayed visual state, and no Library-card UI | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin guidance | Plugin validation exists; current eval harness is primarily oriented around the shipped Alexandria 1 plugin line | No change expected; validate only if plugin files are touched | `cd packages/alexandria-next-plugin && pnpm run validate` if touched |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin behavior | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-008 as scoped because this is a
deterministic AX2 projection and Viewer presentation slice. If implementation
adds or changes a product-facing Raven play, agent prompt, or reusable skill
behavior, revise this section before merge and add or rerun the appropriate
Next Raven eval coverage. If the current harness cannot load
`packages/alexandria-next-plugin`, document that blocker in the implementation
result.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Viewer and CLI drift because future subjects live only in React | Put the static subject manifest and product rules in AX2 projection; Viewer renders projected subjects |
| Persisted config starts storing derived locked subjects or play unlocks | Keep `RavenKnowledgeBankState` progress-only and add tests that `.alexandria-next/alexandria-config.json` does not contain locked future subjects or unlock lists |
| Vision appears in progress before onboarding starts | Derive Vision as `available` or explicitly not banked when Vision status is `not_started`; add initialized-project state and UI tests |
| Knowledge Bank reads as a Library replacement | Add explicit status/not-card copy and e2e assertions that Library headings/card grids are absent |
| FEAT-007 banking response breaks after projection shape changes | Keep `subjects.vision.status === "banked"` stable and add runtime/client decode tests |
| Future subject statuses imply available flows exist now | Label future subjects locked/disabled with concise reasons; do not make them clickable in this slice |
| Play unlocks get stored in `agents.raven` | Do not introduce stored unlocks; if an unlock projection is present, test that it is derived and absent from config |
| Visual implementation restores prototype-only phase rail or playbook filters | Use only the simplified band/row/locked/banked treatments; add e2e absence checks for phase rail, source sliders, and logo upload |
| Source of Truth metadata is missing but Vision says banked | Preserve FEAT-007 runtime precondition and render metadata only when present; add tests for banked Vision with metadata |

## Implementation Steps

1. Add the static Knowledge Bank subject manifest and subject id/status types
   in the AX2 Raven domain.
2. Split persisted `RavenKnowledgeBankState` from display
   `RavenKnowledgeBankProjection` so locked/available subjects are derived.
3. Update `projectRavenKnowledgeBank` to accept the current Vision projection
   or Vision state and derive Vision status plus locked future subjects.
4. Update `deriveProjectState` so `state.raven.knowledgeBank` includes the
   manifest-backed subject projection while preserving
   `subjects.vision.status`.
5. Update AX2 tests for initialized state, in-progress state, banked state,
   future locked subjects, and config not storing derived subjects/unlocks.
6. Add or extend CLI black-box tests for `ax2 inspect state --json` Knowledge
   Bank fields and exit code.
7. Update Viewer runtime schemas and client tests for the new Knowledge Bank
   projection shape.
8. Refactor `RavenKnowledgeBankStatus.tsx` to render ordered subjects from the
   runtime projection instead of its local `futureSubjects` array.
9. Add copy and accessible labels that frame the screen as Raven capability
   status, not Library cards.
10. Style locked future rows and banked Vision with prototype-derived slate,
    amber, compact pip, and grayed/disabled treatments; keep responsive text
    and hash truncation stable.
11. Update the Viewer fixture to return the same projection shape as AX2.
12. Extend Playwright coverage for Quick Bar -> Knowledge Bank before banking,
    Home -> Vision -> Bank -> Knowledge Bank after banking, locked future
    subjects, and absence of Library-card/phase-rail/source-slider/logo-upload
    UI.
13. Touch plugin guidance only if implementation discovers wording drift; run
    plugin validation if that happens.
14. Run the deterministic verification set above.

## Acceptance / Exit Criteria

1. Knowledge Bank opens from Raven's Quick Bar.
2. Knowledge Bank opens after successful Vision banking.
3. Before Vision banking, Vision is not shown as banked in the UI or in
   `ax2 inspect state --json`.
4. After Vision banking, Vision is shown as banked in the UI and in
   `ax2 inspect state --json`.
5. Banked Vision shows Source of Truth path/hash when metadata is present.
6. Future subjects from the static manifest are visible in the UI.
7. Future subjects are disabled/grayed out and projected as locked.
8. The Viewer no longer owns a separate hardcoded future subject list when
   runtime Knowledge Bank projection is available.
9. Persisted `agents.raven.knowledgeBank` stores project-specific progress only,
   not locked future subjects or play unlocks.
10. If play unlock projection exists, it is computed from Knowledge Bank state
    and not stored in `agents.raven`.
11. The screen explicitly distinguishes Raven Knowledge Bank status from
    Library cards.
12. The screen does not render atomized Library cards, Library card grids, or
    folder/constellation card views.
13. No source sliders, phase rail, or logo upload appears in this flow.
14. Viewer e2e covers Home -> Vision -> Bank -> Knowledge Bank.
15. AX2 and Viewer deterministic tests in this plan pass.
16. Plugin validation passes if plugin files are touched.
17. No Alexandria 1 surfaces are changed.
18. No files are written under `docs/alexandria/library/`.

## Deferred Follow-Ups

1. Play unlock projection and Playbook UI from banked Knowledge Bank subjects.
2. Future subject builders for Vocabulary, Bets, Guardrails, and User Research.
3. Generalized `raven-bank-subject` support beyond Vision.
4. Builder handoff from Raven Source of Truth to Library card atomization.
5. Drift indicators between banked Source of Truth and later generated Library
   cards.
6. Re-banking/staleness UX after post-bank Vision edits.
7. Next-plugin LLM eval coverage if autonomous Raven Knowledge Bank plays are
   introduced.
