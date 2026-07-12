# Issue #544: Front-of-House Banked Frame Gate

## Header

- Issue reference: GitHub issue `GetAlexandria/alexandria-internal#544`,
  "Front-of-House walk always opens with a banked frame gate (level-set on the
  keystone story)".
- Goal: make `ax internal front-of-house prepare-agenda` guarantee one bankable
  frame-origin agenda item for every Front-of-House walk, even when the
  bundle's `threads.json` contains no frame thread, while preserving the
  existing scan-authored frame behavior when present.
- Run ID: `01KWGAC20YG2M37PGBP1FYJJEM`.
- Plan path: `docs/alexandria/plans/544-foh-banked-frame-gate/plan.md`.
- Linked product plan: no separate product-level plan was linked. The issue
  body is the product contract for this technical slice.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `packages/alexandria-plugin/CLAUDE.md`,
  `packages/alexandria-plugin/README.md`, and
  `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`.
- Related plans:
  - `docs/alexandria/plans/545-raven-front-of-house-opener/plan.md`
  - `docs/alexandria/plans/505-threads-json-ledger-derived-lifecycle/plan.md`
  - `docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md`
  - `docs/alexandria/plans/536-foh-rejected-bundle-patch-survival/plan.md`
  - `docs/alexandria/plans/539-foh-durable-draft-patch-log/plan.md`
- Current implementation and tests:
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/effects/front-of-house-answer-banking.ts`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - `packages/ax/tests/front-of-house-answer-banking.test.ts`
  - `packages/ax/tests/eval-cases/front-of-house-walk/*`
  - `studio/plays/front-of-house-walk/fixtures/small-el2/`

Planning note: the full issue body was supplied in the task prompt. `gh` was
not used in this environment, so additional GitHub comments were not fetched.

## Scope

This slice is primarily a deterministic AX change.

In scope:

1. Guarantee one `origin: "frame"` agenda item during agenda projection when a
   Front-of-House walk's `threads.json` has no scan-authored frame thread.
2. Preserve the existing scan-authored frame thread path exactly when
   `threads.json` already contains a frame thread: no duplicate
   synthesized item, no rewritten scan text, and the frame item still sorts
   first.
3. Synthesize the fallback frame item deterministically from the headline data
   already computed by `prepare-agenda`: container census, selected keystone,
   keystone-named containers, and headline drift.
4. Make the synthetic frame a normal agenda item for staging, Raven turn
   banking, director answer banking, patch planning/application, residual
   accounting, and `stage-next` lifecycle skipping.
5. Ensure `prepare-agenda --json` reports `itemCount` including the synthesized
   frame item and writes `current-item.*` / `for-raven.md` for that frame when
   it is first unresolved.
6. Add unit and black-box CLI tests for frame synthesis, no-duplication,
   first-position ordering, item counts, answer banking, `cardUpdates[].set`
   patch flow, deferred/residual frame accounting, and the existing
   `small-el2` fixture regression.
7. Adjust Front-of-House workflow leg metadata only if needed to stop shipped
   metadata from contradicting the already-updated skill and the new banked
   frame guarantee.

## Non-Goals

1. Do not change scanner output or require a re-sweep of existing bundles.
2. Do not add a model call, LLM summarization step, or prompt-only workaround to
   `prepare-agenda`.
3. Do not change Raven's director-facing conversational shape from issue #545;
   this slice creates the deterministic gate that #545's skill wording already
   expects.
4. Do not change the semantics of `library.front_of_house.answer_recorded`,
   `library.front_of_house.bundle_patch_applied`, or
   `library.front_of_house.residual_gap_recorded`.
5. Do not add new card-body writes or keystone body rewrites. EL5 still owns
   body prose.
6. Do not write synthetic frame data back into `threads.json`.
7. Do not write to `docs/alexandria/library/`.
8. Do not change Viewer behavior.

## Current Gap

`packages/ax/src/commands/front-of-house.ts` already computes the headline
needed for a frame-level ask. `loadAgendaProjectionInput` loads the library
catalog, selects the Front-of-House keystone, reads the keystone markdown, and
builds a `FrontOfHouseHeadline` with:

- `containers`: the product plane/context census;
- `keystone`: selected card path, label, and names parsed from wikilinks;
- `drift`: named-but-empty and present-but-unnamed container mismatches.

`runPrepareAgenda` then calls `buildFrontOfHouseAgenda`, which currently maps
only `threads.json` rows into agenda items. A frame item appears only when a
thread has `emittingMove: "translate_search_prior"` and
`kind: "missing_context"`. That works for the `small-el2` fixture, which emits
`frame-small-el2-search-frame`, but fails for real bundles such as
`studio/sweeps/playmaker-studio`, whose `threads.json` has 12 open threads and
no frame thread.

The runtime artifacts expose the contradiction:

- `agenda.json` includes `headline`, so the frame material is present.
- `for-raven.md` renders `## Product Containers` before the first ordinary
  agenda item, so Raven can improvise an opener.
- `current-item.json` points at the first section or held-back item, so
  `record-turn` and `ax raven answer` bank the ordinary item, not the opener.

Because `appendFrontOfHouseAnswerReceipt` records
`current.agendaItem.id`, a missing frame item means the director's most
important level-set has no `library.front_of_house.answer_recorded` event and no
answer-backed patch can carry frame-level reconciliations such as
`Authoring = Workflow` or `Production Ladder = Production Line`.

## Architectural Boundaries

- AX owns deterministic agenda projection, runtime artifact writing, answer
  receipts, patch validation/application, lifecycle projection, residual
  accounting, and CLI output contracts. The frame guarantee belongs here.
- The Alexandria plugin owns guided play behavior. The existing
  `front-of-house-walk` skill already assumes the first frame-origin wake is
  the headline opener. This implementation should not move that human-facing
  behavior into AX.
- The scanner remains unchanged. Scan-authored frame threads are richer source
  material and must win when present.
- `threads.json` remains reviewed scanner input. Synthetic frame items must not
  masquerade as scanner threads in diagnostics or mutate the thread file.
- Lifecycle remains Ledger-derived. The synthesized frame id should be stable
  enough for `answer_recorded`, `bundle_patch_applied`, and
  `residual_gap_recorded` to skip it on retry exactly like thread-backed items.
- CLI behavior must remain headless and structured: command data on stdout,
  diagnostics on stderr, stable exit codes, and black-box coverage for changed
  output fields.
- Effect code should follow the existing package patterns: pure projection
  helpers in `library-front-of-house.ts`, command orchestration in
  `front-of-house.ts`, and `Effect.fn` command bodies.

## Synthetic Frame Contract

The implementation should add an explicit synthetic frame helper rather than
burying the fallback inside a sort comparator.

Recommended contract:

1. Use the scan-authored frame thread if `threads.json` contains one, and keep
   the existing lifecycle filtering for that thread.
2. If no scan-authored frame thread exists at all, and the synthetic frame id is
   not already resolved for this play run, prepend one deterministic synthetic
   agenda projection.
3. Use a stable id, for example `frame-front-of-house-level-set`.
4. Give it:
   - `origin: "frame"`;
   - `kind: "stage2_question"`;
   - `placementState: "framing"`;
   - `confidence: "high"` when a keystone exists, otherwise `confidence: "low"`;
   - `concerns` containing the keystone card when available;
   - `evidenceRefs` containing the keystone card path when available;
   - `basis` only if useful for rendered triage, for example
     `Synthesized from the Front-of-House headline because threads.json did not
     include a frame thread.`;
   - deterministic `title` and `text`.
5. The synthesized `text` should be the level-set ask, not director-facing
   prose. It should instruct the Raven-mediated turn to confirm the product
   story and container spread and to rule any story/container reconciliations
   surfaced by headline drift. It should enumerate the computed keystone label,
   container rows, named containers, named-but-empty entries, and
   present-but-unnamed entries in stable sorted/rendered order.
6. The item must have no `context` or `plane`, so it remains a framing item and
   sorts before section comprehension and held-back problems.
7. The source discriminator should stop being misleading. Either extend
   `FrontOfHouseAgendaItemBase.sourcePath` / parsing to allow a value such as
   `"front-of-house-headline"` for synthetic items, or add an explicit
   `synthesized: true` flag. The preferred cleaner shape is a source union:
   `"threads.json" | "front-of-house-headline"`.
8. `diagnoseThreadLifecycleSurface` should only warn about missing thread ids
   for items whose source is `threads.json`. A synthetic frame patch or
   residual must not warn that `threads.json` lacks a thread that was never
   supposed to exist.
9. The synthesized item should participate in
   `resolvedAgendaItemIds` filtering through its stable id. A re-run of
   `prepare-agenda` for a play run whose frame id is already answered or
   residualed should not re-present it.

If implementation chooses a `synthesized: true` flag instead of a source union,
the same observable requirements still apply: parse/render round trips,
diagnostics distinguish it from `threads.json`, and existing thread-backed
items remain unchanged.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH agenda domain | `packages/ax/src/domain/library-front-of-house.ts` | Add the deterministic frame guarantee, synthetic frame item construction, source parsing/rendering support, and lifecycle/residual compatibility for synthetic items. Preserve scan-authored frame projection and frame-first sorting. |
| FoH prepare command | `packages/ax/src/commands/front-of-house.ts` | Pass headline data into agenda construction as today, report `itemCount` including a synthesized frame, stage the synthetic frame as the initial `current-item.*`, and suppress thread-missing diagnostics for non-thread synthetic items. |
| FoH answer banking | `packages/ax/src/effects/front-of-house-answer-banking.ts` | No intended code change. Existing banking should record the synthesized frame id because it reads `current-item.json`. Add or extend tests for a frame-origin current item. |
| FoH patch path | `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/commands/front-of-house.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | No schema change to patch files. Prove a frame answer can cite `answerEventId` and apply `cardUpdates[].set.context` / `set.prefLabel` through the existing path. |
| FoH residual path | `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/commands/front-of-house.ts` | Ensure `record-residual`, unresolved patches, and `finalize` can list the frame item in `RESIDUAL-GAPS.md` with `origin: frame` and `placement: Framing -> Framing`. |
| FoH black-box tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Update no-frame bundle expectations, add first-position and item-count coverage, add answer + patch and residual frame flows, and keep `small-el2` unchanged. |
| FoH domain tests | `packages/ax/tests/library-front-of-house.test.ts` | Cover pure synthesis, no duplication when a frame thread exists, ordering, parse/render round trip for the new source shape, residual rendering, and patch validation for synthetic item ids. |
| Plugin workflow metadata, conditional | `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json` | If touched, update the director-review description from the old "headline plus search-frame confirmation" wording to the #545-compatible banked frame opener. |
| Eval metadata, conditional | `packages/ax/tests/eval-cases/front-of-house-walk/*` | Update only if implementation touches plugin wording or workflow prompt/metadata checked by structural evals. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house prepare-agenda` | No-frame bundles now produce a synthetic `origin: "frame"` item and return `status: "prepared"` with `itemCount >= 1` unless the frame has already been resolved for that play run. | Update black-box tests for JSON stdout, current-item files, first item id/origin, and no-frame fixture counts. |
| `ax internal front-of-house stage-next` | The first unresolved item for a no-frame bundle is the synthetic frame. Once answered or residualed, `stage-next` advances to the former first section item and ultimately reports `AGENDA_DONE` with no off-by-one. | Add lifecycle tests with answered and residual synthetic frame ids. |
| `ax raven answer` / FoH answer banking | The director's answer to the opener is now banked as `library.front_of_house.answer_recorded` with the synthetic frame id. | Add answer-banking coverage through `runPlayAnswer` or the existing effect helper. |
| `ax internal front-of-house apply-patch` / `apply-patch-step` | Frame-level reconciliations can apply through the same validated patch path as section items. | Add a patch test where a frame answer updates `set.context` / `set.prefLabel` for existing cards and produces `bundle_patch_applied`. |
| Residual accounting | A deferred synthetic frame becomes a normal residual gap, and the walk can continue to later section/hot-spot items. | Add `record-residual` or unresolved-patch coverage plus `RESIDUAL-GAPS.md` assertions. |
| Raven Front-of-House skill | No skill text change is required for the gate mechanics. The skill already says the first frame-origin wake is the opener and that answer banking uses `ax raven answer`. | If implementation changes `SKILL.md`, run plugin validation and `front-of-house-walk` evals. |
| FoH workflow leg metadata | Potential stale wording cleanup only. | If `legs.json` changes, run plugin validation and targeted structural eval checks. |
| Viewer | No behavior change. | No Viewer validation required. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts` | Verifies synthesis, no-duplication, ordering, parsing/rendering, lifecycle projection, patch parsing, and residual rendering at the pure helper layer. |
| FoH black-box CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Verifies `prepare-agenda`, `stage-next`, `record-turn`, answer banking, patch application, residual accounting, stdout/stderr, and important JSON output fields through the real command path. |
| FoH answer banking tests | `pnpm --filter @alexandria/ax test -- tests/front-of-house-answer-banking.test.ts` | Guards that a frame-origin `current-item.json` banks the expected `agendaItemId` and receipt shape. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches agenda item source union, parser, command, and Effect type drift. |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches package style/import issues in touched TypeScript and tests. |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Covers changed TypeScript and JSON fixtures/configs. |
| Plugin validation, conditional | `pnpm --filter @alexandria/plugin run validate` | Required if implementation touches `packages/alexandria-plugin` workflow metadata or skill files. |
| Markdown lint | `pnpm run lint:markdown` | Covers this plan and any changed markdown/prose files if implementation edits them. |

No Viewer unit/build/browser validation is required unless implementation
broadens into `packages/viewer`.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX deterministic frame-gate behavior | Existing Bun tests cover Front-of-House agenda projection, CLI command output, answer banking, patch flow, and residual accounting. | Add/adjust Bun tests in this slice. No eval harness is required for AX-only deterministic behavior. | Commands in Deterministic Verification. |
| Raven Front-of-House skill | Existing structural eval metadata lives under `packages/ax/tests/eval-cases/front-of-house-walk/`. Issue #545 already updated the conversational opener contract. | No eval rerun is required if this slice does not edit the shipped skill or workflow prompt/metadata. | None for AX-only implementation. |
| Plugin workflow metadata, conditional | Structural Front-of-House evals may inspect workflow/prompt text. | If `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`, workflow, prompts, or `SKILL.md` change, run targeted FoH evals after plugin validation. | Preferred: `pnpm eval -- run front-of-house-walk/all`; if the current structural substitute does not list FoH cases, run `pnpm eval -- list` and document the limitation. |
| Viewer | Not touched. | No eval-harness or browser validation required. | None. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| A synthesized item is treated as a missing `threads.json` thread, causing noisy or misleading lifecycle warnings after patch/residual. | Add an explicit non-thread source discriminator or synthetic flag and gate `diagnoseThreadLifecycleSurface` warnings to thread-backed agenda items only. Test patch/residual on a synthetic frame with empty stderr. |
| The guarantee creates two frame items when the scan already emitted one. | Detect scan-authored frame threads before lifecycle filtering and add no-duplication tests using the `small-el2` fixture and a small domain fixture. |
| The synthetic id collides with a future scan-authored thread id. | Use a reserved, documented id such as `frame-front-of-house-level-set`; if a scan thread already has that exact id and is frame-origin, treat it as the scan-authored item and do not synthesize. If a non-frame thread uses that id, fail loudly or suffix the synthetic id in a deterministic way and test the chosen behavior. |
| Re-running `prepare-agenda` after the frame is answered reopens the opener. | Base synthesis on whether `threads.json` has a frame thread at all, not whether an unresolved frame projection remains. Include the synthetic id in the same `resolvedAgendaItemIds` filter as thread-backed items. Add lifecycle tests for answered/residual scan frames and answered/residual synthetic frames. |
| Existing tests for empty `threads.json` expect an empty agenda and hide the new contract. | Deliberately update those tests: a valid Front-of-House walk with no frame thread should be `prepared` with one frame item unless the synthetic frame is already resolved. |
| Frame answer patching updates the wrong cards because the synthetic item has too few concerns. | Include the keystone card as a concern/evidence when available and rely on Raven reading `for-raven.md` plus the existing card files. Patch validation still requires explicit `cardPath`s and matching user answer events. |
| No-keystone bundles produce awkward or under-informative frame text. | Still synthesize the gate from the container census with a low-confidence/no-keystone note; #545's skill already tells Raven to say plainly when no center card was found. Add degraded-headline tests. |
| The first-position comparator is relied on instead of construction invariants. | Keep `placementState: "framing"` and `origin: "frame"`, then assert item order in domain and CLI tests. |
| `itemCount` and `AGENDA_DONE` diverge because the prepared agenda contains the synthetic frame but lifecycle skipping ignores it. | Test `prepare-agenda` count, then answer/residual the frame and run `stage-next` through the remaining items to `status: "done"`. |
| Plugin metadata remains stale after the deterministic behavior changes. | Inspect `legs.json` during implementation. If edited, validate the plugin and run/update Front-of-House structural evals. |

## Implementation Steps

1. In `packages/ax/src/domain/library-front-of-house.ts`, introduce a source
   discriminator for agenda items. Prefer changing `sourcePath` from the literal
   `"threads.json"` type to a union such as
   `"threads.json" | "front-of-house-headline"`, with parser validation and
   render output updated accordingly.
2. Add a stable synthetic frame id constant, for example
   `FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID =
   "frame-front-of-house-level-set"`.
3. Add a pure helper that builds the synthetic frame item from a
   `FrontOfHouseHeadline`. Keep all text deterministic:
   - sorted/rendered container rows;
   - keystone card path, label, and named containers when present;
   - drift lists when present;
   - a no-keystone/no-containers fallback when degraded.
4. Refactor `buildFrontOfHouseAgenda` so it first projects unresolved
   thread-backed items as it does today, while separately tracking whether the
   parsed `threads.json` contains any frame thread before lifecycle filtering.
   If no scan-authored frame thread exists and the synthetic frame id is not in
   `resolvedAgendaItemIds`, add the synthetic frame projection before sorting.
5. Preserve scan-authored frame behavior:
   - do not synthesize when a scan-authored frame thread exists;
   - do not alter the scan thread's id, text, confidence, concerns, or evidence;
   - keep the existing frame-first comparator.
6. Update `parseAgendaItem`, `renderFrontOfHouseCurrentItemMarkdown`,
   `renderFrontOfHouseForRaven`, residual rendering, and related tests to accept
   and display the new source value without breaking existing `threads.json`
   items.
7. Update `diagnoseThreadLifecycleSurface` in
   `packages/ax/src/commands/front-of-house.ts` to read the current agenda item
   source and skip missing-thread diagnostics for synthetic/non-thread items.
   Keep malformed `threads.json` warnings for thread-backed items.
8. Add or update domain tests in `library-front-of-house.test.ts`:
   - frame-less threads synthesize exactly one frame item;
   - frame-carrying threads do not synthesize a duplicate;
   - frame item sorts first before section items and hot spots;
   - synthetic frame source parses/renders round trip;
   - synthetic frame participates in resolved lifecycle filtering;
   - residual markdown for a synthetic frame contains `origin: frame` and
     `Framing -> Framing`;
   - `small-el2`-style scan frame behavior remains unchanged at the pure helper
     level if a small fixture is easier than the full integration fixture.
9. Update black-box CLI tests in `library-front-of-house-bundle.test.ts`:
   - change frame-less `prepare-agenda` expectations from 12 to 13 for the PMS
     fixture and assert the new first item is the synthetic frame;
   - update empty/blank/degraded-thread tests to expect a prepared frame item
     when the bundle catalog loads and the frame is unresolved;
   - assert `prepare-agenda --json.itemCount` includes the synthetic frame and
     `current-item.json` / `for-raven.md` stage it first;
   - keep `small-el2` fixture expectations at one frame item with the scan's id
     and text, item count unchanged, and byte-identical re-prepare.
10. Add a black-box answer + patch flow for a frame-less bundle:
    - prepare and stage the synthetic frame;
    - call `record-turn` and assert
      `library.front_of_house.turn_recorded.payload.agendaItemId` is the
      synthetic frame id;
    - call `ax raven answer` through the existing `runPlayAnswer` helper and
      assert `library.front_of_house.answer_recorded` carries the same id;
    - write a valid resolved patch citing the answer event and updating existing
      card frontmatter through `cardUpdates[].set.context` and optionally
      `set.prefLabel`;
    - run `apply-patch --json` and assert `bundle_patch_applied`,
      `touchedCardPaths`, and unchanged `threads.json`.
11. Add a black-box deferred-frame path:
    - prepare the synthetic frame first;
    - record it as residual through `record-residual` or an unresolved patch;
    - verify `stage-next` advances to the former first section item;
    - finalize and assert `RESIDUAL-GAPS.md` contains the frame residual and the
      later unresolved items as appropriate.
12. Add or update `front-of-house-answer-banking.test.ts` with a frame-origin
    `current-item.json` so the lower-level answer receipt contract is protected
    independent of the bundle test.
13. Inspect `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`.
    If implementation updates its stale director-review description, keep the
    change scoped to metadata and run plugin validation. Do not alter workflow
    graph behavior unless a test proves the graph depends on old wording.
14. Run the deterministic verification commands. If plugin files changed, also
    run plugin validation and the targeted Front-of-House eval command or
    document harness unavailability per `EVALS.md`.

## Acceptance / Exit Criteria

1. A bundle with no `threads.json` frame thread prepares an agenda whose first
   unresolved item is a single synthetic `origin: "frame"` item with
   `placementState: "framing"`.
2. The `prepare-agenda --json` `itemCount` includes the synthesized frame item,
   and `status` is `prepared` when that frame is unresolved.
3. `current-item.json`, `current-item.md`, and `for-raven.md` stage the
   synthetic frame before any section, hot-spot, or out-of-scope suspect item.
4. `record-turn` banks
   `library.front_of_house.turn_recorded.payload.agendaItemId` with the
   synthetic frame id.
5. `ax raven answer` banks
   `library.front_of_house.answer_recorded.payload.agendaItemId` with the same
   synthetic frame id and writes the normal answer receipt.
6. A valid patch citing that frame answer event can update existing card
   frontmatter through `cardUpdates[].set.context` / `set.prefLabel` and append
   `library.front_of_house.bundle_patch_applied`.
7. A deferred synthetic frame can be recorded as residual, appears in
   `RESIDUAL-GAPS.md`, and does not block later section items from staging.
8. A bundle that already has a frame thread, including the `small-el2` fixture,
   still has exactly one frame item using the scan-authored id/text and no
   synthesized duplicate.
9. Re-preparing the same unresolved input is byte-identical. Re-preparing after
   a frame answer or residual does not reopen a scan-authored or synthetic frame
   for that play run.
10. Synthetic frame patch/residual flows do not emit misleading
    `threads.json does not contain this agenda thread` warnings.
11. Targeted AX tests, AX typecheck, lint, and format checks pass. Plugin
    validation and Front-of-House evals pass or are explicitly documented as not
    required because no plugin/eval-backed surface changed.

## Deferred Follow-Ups

1. Scanner-side enhancement: teach future scans to emit richer frame threads
   more consistently. This remains separate because the walk-side guarantee
   must cover existing bundles without re-sweep.
2. Adaptive live eval: when the full conversational eval harness is restored,
   add a no-frame Front-of-House case where the director confirms the synthetic
   opener, rules one container reconciliation, and proceeds to a section item.
3. Viewer audit: if a future Viewer surface starts visualizing agenda item
   source values, add display copy for `front-of-house-headline` there in a
   Viewer-scoped slice.
