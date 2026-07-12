# Issue 444 Vision Reshape Plan

- Issue: GitHub #444, `Vision reshape: add shape + the-work slots and the Refusal & Fence (Move V)`
- Run ID: `01KW7PMJ82J0X13XWK43CVEZVN`
- Plan path: `docs/alexandria/plans/444-vision-reshape/plan.md`
- Primary surfaces: `packages/ax`, `packages/viewer`, and `packages/alexandria-plugin`

## Source Context

This plan is based on the issue body supplied in the run prompt. The GitHub
issue comments were fetched through the connector; the only comment was the
Fabro local run submission for this run, with no additional plan feedback.

The issue references `vision-reshape.md` and a Move V product `plan.md`.
Repository search did not find those files in this checkout, so the issue body's
frozen contract is the source of truth for this planning pass.

Required repo guidance read:

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `EVALS.md`
- `packages/ax/CLAUDE.md`
- `packages/ax/README.md`
- `packages/ax/docs/cli-design-principles.md`
- `packages/viewer/README.md`
- `packages/alexandria-plugin/CLAUDE.md`
- `packages/alexandria-plugin/README.md`

Relevant implementation context read:

- `packages/ax/src/domain/raven-vision.ts`
- `packages/ax/src/domain/state-events.ts`
- `packages/ax/src/domain/agents.ts`
- `packages/ax/src/commands/raven.ts`
- `packages/ax/src/effects/runtime-server.ts`
- `packages/ax/tests/raven-vision.test.ts`
- `packages/ax/tests/events.test.ts`
- `packages/ax/tests/state.test.ts`
- `packages/ax/tests/cli.test.ts`
- `packages/ax/tests/runtime-server.test.ts`
- `packages/viewer/src/app/runtime/schemas.ts`
- `packages/viewer/src/app/runtime/client.test.ts`
- `packages/viewer/src/components/library/vision/vision-slot-guidance.ts`
- `packages/viewer/src/components/library/vision/VisionOnboardingView.tsx`
- `packages/viewer/src/components/library/vision/VisionSlotCard.tsx`
- `packages/viewer/tests/library-browser.spec.ts`
- `packages/viewer/tests/serve-viewer-fixture.ts`
- `packages/alexandria-plugin/skills/raven-vision-drafting/SKILL.md`
- `packages/alexandria-plugin/skills/raven-vision-elicitation/SKILL.md`
- `packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/refusal.md`
- representative existing peg files in the same directory

Related plans checked:

- `docs/alexandria/plans/build-a-raven-onboarding/plan.md`
- `docs/alexandria/plans/feat-005-raven-slot-collaboration/plan.md`
- `docs/alexandria/plans/feat-008-knowledge-bank-banked-vision/plan.md`
- `docs/alexandria/plans/library-structural-pipeline-fix/plan.md`
- `docs/alexandria/plans/rebuilding-the-library/plan.md`

## Goal

Wire the Move V Vision reshape into the shipped app surfaces that define Raven
Vision slots:

1. Add `shape` and `the-work` as first-class Vision slots.
2. Rename and repurpose `refusal` as `The Refusal & Fence`.
3. Keep the existing slot state machine and banking mechanics unchanged.
4. Preserve deterministic CLI/runtime behavior while making the new ids valid
   anywhere existing slot ids are accepted.
5. Update Raven's product-facing drafting and elicitation peg guidance so the
   new slots are reachable and the refusal fence is understood.

## Scope

In scope:

1. `RAVEN_VISION_SLOT_IDS` and `RAVEN_VISION_SLOT_MANIFEST` membership, order,
   labels, and purposes.
2. Banked Source of Truth Markdown emitted by
   `buildRavenSourceOfTruthMarkdown`, through the existing manifest-driven
   section loop.
3. Runtime and CLI slot-id validation that already derives from
   `RAVEN_VISION_SLOT_IDS`.
4. Viewer runtime schema acceptance for the new slot ids.
5. Viewer elicitation copy in `slotGuidance`.
6. Viewer fixtures and browser tests that hard-code the Vision manifest.
7. Raven drafting and elicitation skills' slot tables.
8. Raven agent resource paths for the new peg files.
9. New `shape.md` and `the-work.md` peg files, plus a revised `refusal.md`.
10. Deterministic tests for manifest shape, guidance strings, banking output,
    free-text shape, skipped slot behavior, and peg presence.

## Non-Goals

Out of scope:

1. The Back-of-House sweep salience-lens change from `Mechanism + Felt
   Experience + Proof` to `Shape + The Work`.
2. Enforcing no-AI-draft author routing for the Why band in
   `VisionOnboardingView` or the Raven flow.
3. Any state-machine change beyond adding ids that seed like existing slots.
4. A closed enum for `shape`. It remains free-text slot prose.
5. New Source of Truth section formatting, preamble text, or trailing-newline
   behavior.
6. New contract/renderer work such as temporal link keys, Process cards, or
   cross-context lifecycle lenses.
7. Writing to `docs/alexandria/library/`.
8. Rendering acceptance criteria, validation banners, plan decisions, or issue
   contract text in the Vision UI.

## Linked Product-Plan Summary

Move V reframes the Vision as an investigation prior for later library work.
The current nine-slot Vision names market intent and persuasive proof, but it
does not ask for the product's core work shape or the central unit of work. The
issue freezes a shipped-surface wiring slice: add the two mechanics slots before
the illustrative scene, reshape Refusal into a build-readable fence, and leave
the sweep and flow architecture for later slices.

The intended result is that future sweeps can read the Vision and know where to
look first, which evidence trails to skip, and which neighboring systems are out
of product scope.

## Frozen Slot Contract

The target slot order is:

| Order | Id | Label | Purpose |
| --- | --- | --- | --- |
| 1 | `person` | `The Person` | `Who is exposed to the shift` |
| 2 | `named-pain` | `Named Pain` | `The pain the user can already name` |
| 3 | `discovered-pain` | `Discovered Pain` | `The pain recognized after the alternative exists` |
| 4 | `shift` | `The Shift` | `What changed in the world` |
| 5 | `inadequacy` | `The Inadequacy` | `Why existing tools fail structurally` |
| 6 | `mechanism` | `The Mechanism` | `What this product does that resolves the failure` |
| 7 | `shape` | `The Shape` | `What kind of work the product does, so the build knows where to look and what to skip` |
| 8 | `the-work` | `The Work` | `The central unit of work and the path it takes from raw to done` |
| 9 | `felt-experience` | `The Felt Experience` | `What life looks like when it works` |
| 10 | `proof` | `The Proof` | `What would be observed if the Vision is true` |
| 11 | `refusal` | `The Refusal & Fence` | `What the product will not be — and, for the build, what is out of scope or not to look for` |

`RAVEN_VISION_SLOT_IDS` should use the same id order:

```ts
[
  "person",
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "mechanism",
  "shape",
  "the-work",
  "felt-experience",
  "proof",
  "refusal",
] as const
```

The new viewer guidance entries are frozen as:

```ts
shape: {
  prompt:
    "What shape is this product's core work? Pick the closest: assembly line / pipeline (each item moves through ordered stages), record-keeping / CRUD (creating, reading, and updating records), back-and-forth / interaction loop (a conversation that carries state from one turn to the next), decision / calculation (inputs run through rules to produce an answer), or reactive / event-driven (something happens, a rule fires, the system responds). Name the shape — and name any shape it explicitly is not.",
  pullingFor:
    "the classifier that tells the build which evidence trails to chase and which to skip",
  quickTest:
    "Could a builder predict where to look first — and what to ignore — from this one word?",
  length: "one shape + 1–2 'not this' exclusions",
},
"the-work": {
  prompt:
    "Trace the core work by naming five things — terse, a list or table, not an essay: 1. Unit — the central record the work accumulates around (the 'pile': reservations, orders, tickets). 2. Path — the ordered stages it moves through, raw → done. 3. Status — how the system marks where each unit is (a technical owner can name the actual status field or enum). 4. Places — the contexts/containers the work passes through (note any it revisits or steps out to). 5. Advances — what moves it from one stage to the next (an action, an approval, or a rule). One unit's lifecycle, birth to done.",
  pullingFor:
    "the throughline — the work threaded through the structure; the spine the sweep reconstructs and confirms against source",
  quickTest:
    "Could you draw it as a thread crossing columns (places) down rows (stages)?",
  length: "the five coordinates, terse",
},
```

The `refusal.prompt` should preserve the existing prompt and append the
frozen fence clause, producing this full prompt:

```ts
"Name customer types, product directions, or buying motions that look aligned with this Vision but would undermine it if served. For each, name the structural reason: what would this product amplify in that case that would be harm, not help? …and name what the library build should *not* chase: subsystems out of scope, shapes this product is *not* (from The Shape), and neighbors that are external dependencies rather than parts of this product."
```

The other existing guidance entries must remain byte-identical.

## Current Gap

Current shipped implementation:

1. `packages/ax/src/domain/raven-vision.ts` defines nine slots. The tuple begins
   `shift, person, named-pain, ...`, the manifest uses order `1..9`, and
   `refusal` is labeled `The Refusal`.
2. `createInitialRavenVisionState`, reducers, readiness, event schemas, CLI
   help, and runtime validation derive from `RAVEN_VISION_SLOT_IDS`, so adding
   ids there should make the state machine accept them without a new status
   model.
3. `buildRavenSourceOfTruthMarkdown` already iterates
   `RAVEN_VISION_SLOT_MANIFEST`, trims approved slot bodies with
   `trimBlankLines`, and emits `### ${definition.label}`.
4. `packages/viewer/src/app/runtime/schemas.ts` has a separate
   `RuntimeRavenVisionSlotIdSchema` with the same nine ids. It will reject
   runtime payloads containing `shape` or `the-work` until updated.
5. `slotGuidance` is keyed by `RuntimeRavenVisionSlotId`, so adding schema ids
   creates a type-level reminder to add guidance entries.
6. `packages/viewer/tests/serve-viewer-fixture.ts` hard-codes a nine-slot Vision
   manifest for Playwright tests.
7. The Raven drafting and elicitation skills each hard-code a nine-slot peg
   table, and `packages/ax/src/domain/agents.ts` exposes the same nine peg
   resources.
8. `refusal.md` currently covers trap-shaped anti-positions only. There are no
   peg files for `shape` or `the-work`.
9. Existing tests assert slot count `9`, manifest equality to the tuple,
   current Source of Truth headers, valid slot id help text, and runtime event
   schemas. These will need targeted updates plus new assertions.

## Architectural Boundaries

`packages/ax` remains the canonical deterministic source for Raven Vision slot
ids, manifest metadata, reducer seeding, event schema allowed values, Source of
Truth Markdown, CLI help, and agent resource projection. This slice should use
the existing domain constants instead of introducing a separate slot registry.

`packages/viewer` owns runtime decoding and elicitation display. It should
accept the two new ids, render whatever the runtime manifest projects, and add
the frozen guidance copy. It should not own an independent production manifest;
only the Playwright fixture needs its own matching test manifest.

`packages/alexandria-plugin` owns Raven's guided behavior. The skill changes
should keep the slot-by-slot drafting loop intact: inspect state, choose one
empty slot in manifest order, read exactly one peg, write one slot, then stop
for director review.

No package should add new persisted state, per-feature config files, or
product-specific examples outside fixtures/tests. No implementation should
render issue acceptance/spec text in the UI.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX Vision domain | `packages/ax/src/domain/raven-vision.ts` | Canonical ids and manifest become 11 slots in frozen order; `isRavenVisionSlotId` accepts `shape` and `the-work`; Source of Truth Markdown emits new labels through existing manifest iteration |
| AX event schemas and runtime | `packages/ax/src/domain/state-events.ts`, `packages/ax/src/effects/runtime-server.ts` | Allowed slot id lists and unknown-slot diagnostics include the new ids by deriving from the tuple; no route or reducer semantics change |
| AX CLI | `packages/ax/src/commands/raven.ts`, CLI tests | Help and validation list the 11 ids because they derive from the tuple; command behavior and exit codes remain unchanged |
| AX agent resource projection | `packages/ax/src/domain/agents.ts`, `packages/ax/tests/state.test.ts` | Raven resource paths expose `shape.md` and `the-work.md` so projected state advertises reachable peg files |
| AX tests | `packages/ax/tests/raven-vision.test.ts`, `events.test.ts`, `state.test.ts`, `cli.test.ts`, `runtime-server.test.ts` | Update 9-slot assumptions; add contract coverage for manifest, markdown additions/reshape, free-text shape, skip path, and peg/resource presence |
| Viewer runtime schema | `packages/viewer/src/app/runtime/schemas.ts`, `client.test.ts` | Runtime decode accepts `shape` and `the-work` in manifest and slot payloads |
| Viewer guidance | `packages/viewer/src/components/library/vision/vision-slot-guidance.ts` and a covered test location | Add frozen guidance entries and refusal suffix while preserving other guidance strings |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Fixture manifest mirrors the 11-slot production contract so Playwright tests exercise the new slots |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts` | Slot rendering, skip loops, ready-to-bank, and mobile checks include `shape`, `the-work`, and the reshaped refusal label |
| Plugin drafting skill | `packages/alexandria-plugin/skills/raven-vision-drafting/SKILL.md` | Slot peg table and slot map include `shape` and `the-work`; target lengths align with the new guidance; loop remains one slot at a time |
| Plugin elicitation skill | `packages/alexandria-plugin/skills/raven-vision-elicitation/SKILL.md` | Peg table includes `shape` and `the-work`, so elicitation can load the right rubric |
| Plugin peg files | `packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/{shape.md,the-work.md,refusal.md}` | Add new peg rubrics and extend Refusal with the build fence while preserving anti-position guidance |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven Vision drafting | Raven can draft `shape` and `the-work` as normal empty slots in manifest order; it reads exactly the selected slot's peg before writing; `refusal` peg now includes fence guidance | Update drafting skill tables, slot map, peg files, agent resource paths, plugin validation, markdown lint |
| Raven Vision elicitation | Raven can help the director improve `shape`, `the-work`, or the fence half of `refusal` using peg-driven diagnostics | Update elicitation skill peg table; keep no-self-approval and no-immediate-rewrite rules |
| Raven projected resources | `ax inspect state --json` advertises the two new peg reference paths for Raven | Update `BUILT_IN_AGENTS` and state projection tests |
| Viewer elicitation copy | The director sees the new prompts and the refusal fence clause where Vision slot guidance already renders | Add/update deterministic guidance tests and browser coverage; do not add issue-contract copy elsewhere |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX focused tests | `bun test packages/ax/tests/raven-vision.test.ts packages/ax/tests/events.test.ts packages/ax/tests/state.test.ts packages/ax/tests/cli.test.ts packages/ax/tests/runtime-server.test.ts` | Covers slot seeding/projection, event allowed values, Source of Truth Markdown, CLI validation/help, runtime slot paths, and agent resources |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches tuple/manifest/type drift across domain, CLI, runtime, and tests |
| Viewer focused unit/runtime tests | `bun test packages/viewer/src/app/runtime/client.test.ts <guidance-test-path>` | Proves runtime schema decodes new ids and guidance strings match the frozen literals |
| Viewer package tests | `pnpm --filter @alexandria/viewer run test` | Runs the viewer's maintained unit test list after any new guidance test is added to it or integrated into an existing listed test |
| Viewer check/build | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Validates Astro/React/Effect types and production build after schema and component-copy changes |
| Viewer browser validation | `pnpm --filter @alexandria/viewer run test:e2e` | Existing Playwright Vision tests should render and review all 11 slots through the fixture, including responsive/mobile coverage |
| Plugin validation | `cd packages/alexandria-plugin && claude plugin validate .` | Confirms the shipped plugin remains structurally valid after skill and peg changes |
| Markdown lint | `pnpm run lint:markdown` | Validates new and revised Markdown pegs and plan text under the repo's markdown rules |
| Full repo smoke, if time allows | `pnpm run test` | Guards against broad hard-coded slot-count assumptions outside the focused files |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX slot manifest, reducer, CLI, runtime | Deterministic Bun tests exist and directly cover this surface | Update and run focused AX tests | `bun test packages/ax/tests/raven-vision.test.ts packages/ax/tests/events.test.ts packages/ax/tests/state.test.ts packages/ax/tests/cli.test.ts packages/ax/tests/runtime-server.test.ts` |
| Viewer runtime and Vision UI | Unit and Playwright coverage exist; no LLM eval needed | Update fixture/browser tests and run viewer validation | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run test:e2e` |
| Raven Vision drafting/elicitation skills | The current checkout has no Raven Vision eval cases; `pnpm eval` is currently the EL5 atomic-card substitute runner under `packages/ax/tests/eval-cases` | Run `pnpm eval -- list` to confirm no applicable Raven Vision cases. Do not invent an unrelated EL5 rerun. Use plugin validation, markdown lint, and deterministic peg/resource tests for this slice | If a restored eval harness exposes Raven Vision cases before merge, run the relevant `raven-vision-drafting` and `raven-vision-elicitation` cases. Otherwise record no available eval-harness coverage in the implementation notes and defer new LLM eval cases |

Because this slice changes product-facing skills but no Raven Vision eval cases
exist in the current harness, the implementation should create or link a
follow-up for Raven Vision drafting/elicitation eval coverage. That follow-up
should exercise `shape`, `the-work`, and `refusal` fence behavior against
source-backed fixtures once the broader eval runner is available again.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Tuple, manifest, runtime schema, and viewer fixture drift from each other | Add tests that compare the tuple and manifest ids, decode `shape`/`the-work`, and update the Playwright fixture manifest with the same 11-slot order |
| Hidden `9` slot-count assumptions survive in tests or UI | Search for `slotCount`, `RAVEN_VISION_SLOT_IDS`, and hard-coded slot arrays; update assertions to use the tuple/manifest where possible and explicit `11` only where testing the contract |
| The Markdown emitter is accidentally rewritten while adding headers | Keep `buildRavenSourceOfTruthMarkdown` logic unchanged; test exact preamble, blank-line layout, trimming, new headers, and refusal header rename |
| `shape` is accidentally treated as an enum | Do not add enum validation; add a banked-markdown test with a shape value outside the five prompt examples |
| Raven can see the new slot ids but cannot load their pegs | Update both plugin skill peg tables and `BUILT_IN_AGENTS.referencePaths`; test peg file existence/resource projection; run plugin validation |
| The refusal fence addition erases existing anti-position guidance | Revise `refusal.md` by adding the fence as a second half, preserving trap-shaped anti-position job, failure modes, diagnostic, and examples |
| Issue acceptance/spec text leaks into the Vision UI | Limit UI text changes to manifest labels/purposes already rendered by existing components and `slotGuidance` copy; add/browser-check no extra contract banner if implementation touches UI rendering |
| Work expands into sweep or Why-band flow changes | Keep implementation files scoped to the manifest/guidance/peg/banked-markdown wiring and record any desired enforcement as a deferred follow-up |

## Implementation Steps

1. Add or update focused tests first:
   - AX manifest contract test for the exact 11 ids, order, labels, and purposes.
   - AX `isRavenVisionSlotId("shape")` and `isRavenVisionSlotId("the-work")`
     assertions.
   - AX initial state/projection count updates from 9 to 11.
   - AX Source of Truth Markdown tests for `### The Shape`, `### The Work`, and
     `### The Refusal & Fence`.
   - AX free-text shape and skipped `shape`/`the-work` readiness tests.
   - Viewer guidance literal tests for new entries and refusal suffix.
   - Plugin peg presence/resource projection assertions.
2. Update `packages/ax/src/domain/raven-vision.ts`:
   - Reorder `RAVEN_VISION_SLOT_IDS` to the frozen table.
   - Reorder `RAVEN_VISION_SLOT_MANIFEST`.
   - Add `shape` and `the-work` entries.
   - Rename `refusal.label` and replace `refusal.purpose`.
   - Leave reducer state shape, statuses, readiness logic, and Markdown emitter
     logic unchanged.
3. Let derived AX surfaces pick up the ids, then update tests and hard-coded
   expected slot counts/help expectations in `events.test.ts`, `state.test.ts`,
   `cli.test.ts`, and `runtime-server.test.ts`.
4. Update `packages/ax/src/domain/agents.ts` to include `shape.md` and
   `the-work.md` in Raven's `referencePaths`, keeping paths under
   `skills/raven-vision-drafting/references/slots/`.
5. Update viewer runtime and guidance:
   - Add `shape` and `the-work` to `RuntimeRavenVisionSlotIdSchema`.
   - Add the frozen `slotGuidance` entries.
   - Append the frozen `refusal.prompt` fence clause and leave
     `pullingFor`, `quickTest`, and `length` unchanged.
   - Ensure the eight non-refusal existing guidance entries remain
     byte-identical.
6. Update viewer tests and fixtures:
   - Mirror the 11-slot manifest in `packages/viewer/tests/serve-viewer-fixture.ts`.
   - Update `library-browser.spec.ts` slot arrays and ready-to-bank loops.
   - Add assertions that `vision-slot-shape`, `vision-slot-the-work`, and
     `vision-slot-refusal` render the expected labels and no stale
     `The Refusal` header/label appears where the new label should be.
   - Add or integrate a viewer guidance test into the maintained
     `packages/viewer/package.json` test command.
7. Update plugin skill tables:
   - Add `shape` and `the-work` peg rows to both
     `raven-vision-drafting/SKILL.md` and
     `raven-vision-elicitation/SKILL.md`.
   - Update the drafting skill slot map to include the new ids and targets.
   - Keep the one-slot drafting and director review gate unchanged.
8. Add `shape.md` and `the-work.md` using the existing peg file structure:
   - `Job`
   - `Not the job`
   - `Common failure modes`
   - `Sharpness target`
   - `Diagnostic test`
   - `How it connects`
   - `Examples`
   The `shape.md` peg should frame shape as a prior that selects the suspect
   lineup, not a verdict. The `the-work.md` peg should frame the five work
   coordinates as intent that agents later confirm against source.
9. Revise `refusal.md`:
   - Rename heading to `Vision Slot Pegs: The Refusal & Fence`.
   - Preserve anti-position job/failure modes/examples.
   - Add the fence half: prune out-of-scope subsystems, shapes the product is
     not, and external-neighbor dependencies; mirror examples such as scanning
     only the in-scope workflow rather than adjacent systems and external
     dependencies when that is the declared product boundary.
10. Run deterministic verification. If any command cannot run because of local
    environment constraints, record the exact failure and the coverage gap in
    the implementation handoff.

## Acceptance / Exit Criteria

1. `RAVEN_VISION_SLOT_IDS` and `RAVEN_VISION_SLOT_MANIFEST` contain the same 11
   ids in the frozen order.
2. `shape` and `the-work` manifest entries exactly match the frozen label,
   order, and purpose strings.
3. `refusal` keeps id `refusal`, label `The Refusal & Fence`, order `11`, and
   the frozen purpose string.
4. The existing non-refusal slot labels and purposes stay unchanged except for
   the order values required by the frozen table.
5. `isRavenVisionSlotId("shape")` and
   `isRavenVisionSlotId("the-work")` return true.
6. Runtime event schemas, CLI help, and runtime unknown-slot diagnostics list
   `shape` and `the-work` through the existing valid-id path.
7. `slotGuidance.shape` and `slotGuidance["the-work"]` match the frozen strings.
8. `slotGuidance.refusal.prompt` matches the full frozen prompt with the fence
   suffix; `pullingFor`, `quickTest`, and `length` are unchanged.
9. The eight other existing guidance entries are byte-identical to their
   pre-change values.
10. Approved non-empty `shape` and `the-work` slots bank into Source of Truth
    Markdown as `### The Shape` and `### The Work` in manifest order.
11. Approved non-empty `refusal` banks as `### The Refusal & Fence`, with no
    stale `### The Refusal` header.
12. Existing approved-slot banking output is otherwise byte-identical: same
    preamble, blank-line format, trimming, and trailing newline behavior.
13. A `shape` value outside the prompt's five example shapes banks without
    rejection.
14. Skipped `shape` and `the-work` emit no Source of Truth section and do not
    block `ready_to_bank` when all slots are reviewed and at least one approved
    slot has text.
15. Viewer runtime schemas decode projections containing `shape` and
    `the-work`.
16. Viewer Vision onboarding renders the two new slots and the reshaped refusal
    label through existing slot card rendering.
17. No acceptance/spec/validation copy is added to the Vision UI.
18. `shape.md` and `the-work.md` exist under
    `packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/`.
19. `refusal.md` covers both trap-shaped anti-positions and the build fence.
20. Raven drafting/elicitation skill tables and Raven resource paths include
    the two new peg files.
21. Focused AX, Viewer, browser, plugin validation, and markdown lint checks
    pass or have documented environment-only blockers.

## Deferred Follow-Ups

1. Add eval-harness coverage for Raven Vision drafting and elicitation once the
   broader Raven eval runner exists again. The cases should exercise `shape`,
   `the-work`, and `refusal` fence diagnostics.
2. File a separate issue for Why-band no-AI-draft author routing if the team
   wants runtime enforcement beyond this slice's declared decision.
3. Track the Back-of-House sweep salience-lens change as the separate
   play-authoring Move S work named by the issue.
4. Track future contract/renderer work for temporal link keys, a Process card,
   and cross-context lifecycle views outside this Vision slot wiring slice.
