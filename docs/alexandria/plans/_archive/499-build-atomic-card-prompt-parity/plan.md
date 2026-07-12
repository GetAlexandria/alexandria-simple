# Issue 499 Technical Plan: Build Atomic Card Prompt Parity

Issue: GitHub #499, "FoH section-summary prompt must survive a build-atomic-card bank"
Date: 2026-06-30
Status: Ready for implementation

## Goal

Keep the `build-atomic-card` draft prompt's `SECTION_SUMMARY` contract from
being silently removed by a Studio-to-plugin bank.

The implementation must make two guarantees:

1. The Studio source prompt and shipped plugin prompt for
   `build-atomic-card/prompts/draft_or_repair.md` are byte-identical and both
   contain the section-summary instructions that use the canonical
   `__AX_INPUT_SECTION_SUMMARY__` placeholder.
2. The bank/conformance guard fails when any banked play's prompt files diverge
   between `studio/plays/<slug>/prompts/` and
   `packages/alexandria-plugin/workflows/<slug>/prompts/`, including
   present-on-one-side-only prompts.

## Linked Product Plan

There is no separate product-level plan for issue #499. The controlling source
is the issue body supplied with run `01KWDAPSVMTXBXWG9XDM6Q0EPT`.

Related context:

- `docs/alexandria/plans/484-foh-held-back/plan.md`, issue #490 section:
  EL5 consumes Front-of-House `section_confirmed` as a human-language prior.
- `docs/alexandria/plans/500-el5-section-summary-run-scope/plan.md`:
  scopes summary selection to the producing Front-of-House run.
- `docs/alexandria/plans/front-of-house-walk-reshape/issue-slice-d2-el5-consume.md`:
  original EL5 section-summary consume contract.

During planning, `gh issue view 499 --repo GetAlexandria/alexandria-internal
--comments` was attempted, but `gh` is not installed in this environment, so
the issue body in the prompt is the issue source.

## Sources Read

- Root `CLAUDE.md` and `README.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `EVALS.md`.
- `packages/alexandria-plugin/CLAUDE.md` and
  `packages/alexandria-plugin/README.md`.
- `packages/viewer/README.md`, because the existing bank conformance guard
  lives in viewer tests.
- `studio/README.md` and `studio/plays/README.md`.
- `studio/tools/bank.sh`.
- `studio/tools/check-play-conformance.mjs`.
- `packages/viewer/src/components/studio/bankConformance.test.ts`.
- `packages/viewer/src/components/studio/placeholderConformance.test.ts`.
- `packages/viewer/src/components/studio/riskMapConformance.test.ts`.
- `packages/viewer/src/components/studio/promptContract.test.ts`.
- `studio/plays/build-atomic-card/prompts/draft_or_repair.md`.
- `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md`.
- `packages/ax/tests/eval-cases/build-atomic-card/draft-against-confirmed-stub/config.json`.
- `packages/ax/tests/eval-cases/build-atomic-card/shelf-fit-grade-loop/config.json`.

## Scope

In scope:

1. Reconcile the Studio `build-atomic-card` source prompt with the shipped
   plugin prompt, preserving the plugin's current section-summary block rather
   than deleting it.
2. Keep the plugin prompt in parity with Studio after reconciliation.
3. Ensure the prompt placeholder spelling is the canonical single-`AX_` token:
   `__AX_INPUT_SECTION_SUMMARY__`.
4. Extend or preserve the bank/conformance guard so prompt bodies are compared
   for every banked play.
5. Add deterministic negative coverage for prompt body mismatch and
   present-on-one-side-only prompt files.
6. Keep existing workflow parity and structured Studio conformance checks
   intact.
7. Run plugin validation and EL5 structural evals because the shipped guided
   play prompt is in the touched behavior surface.

Out of scope:

- Do not change AX executor emission or `SECTION_SUMMARY` child-run binding.
  Issue #490/#500 own deterministic summary selection and input materialization.
- Do not change Front-of-House `section_confirmed` event emission.
- Do not change `atomic-card-planning` or `atomic-card-creation` prompts unless
  implementation discovers an actual local drift caused by this fix.
- Do not change unrelated play prompts.
- Do not write to `docs/alexandria/library`.
- Do not make Viewer product UI changes. The viewer package is only relevant
  because its Studio test suite currently houses the conformance gates.

## Current Gap

`studio/tools/bank.sh` treats Studio as the source of truth and mirrors the
deployable package into the plugin:

- `workflow.fabro`;
- `prompts/`, copied with `rsync -a --delete` when available.

That means a stale Studio prompt can overwrite a correct plugin prompt on the
next bank. The EL5 executor can still emit and bind `SECTION_SUMMARY`, but the
agent receives a prompt that no longer says to read the file.

Planning observation for the current checkout: the two
`draft_or_repair.md` files are already byte-identical and both contain:

- `Optional section summary prior: __AX_INPUT_SECTION_SUMMARY__`;
- instructions to read the JSON file when the path is non-empty;
- source-only fallback when the path is empty;
- "prior, not override" grounding language;
- `WHAT`/`WHERE`/`HOW` framing instructions.

That reconciled state must be preserved by implementation. It is not enough for
the actual tree to pass today; the guard needs fixture-level negative tests so a
future prompt mismatch or one-sided prompt file cannot pass silently.

The existing `packages/viewer/src/components/studio/bankConformance.test.ts`
already compares `workflow.fabro` and the prompt files for slugs present in both
Studio and plugin trees. Implementation should use that seam unless local code
has moved. If the current branch already has byte-for-byte prompt comparison,
the required work is to preserve it and add the explicit negative cases from
this issue.

## Architectural Boundaries

- Studio remains the source of truth for banked plays.
- `packages/alexandria-plugin` remains the shipped runtime payload. The plugin
  copy should be reconciled by banking or by an equivalent byte-for-byte update,
  not by weakening the Studio source.
- The guard belongs at the Studio/plugin bank seam. The current best home is
  `packages/viewer/src/components/studio/bankConformance.test.ts`, next to the
  existing Studio drift gates.
- `studio/tools/check-play-conformance.mjs` should not be broadened unless the
  implementation chooses that route deliberately. If left untouched, run it as a
  regression so existing brief/moves/risk-map checks still hold.
- AX runtime code should not change for this issue.
- Prompt content remains authored Markdown. Use exact byte comparison for parity
  rather than a semantic parser, because bank uses file copying, not semantic
  merging.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Studio source prompt | `studio/plays/build-atomic-card/prompts/draft_or_repair.md` | Must contain the same section-summary block as the plugin prompt, including `__AX_INPUT_SECTION_SUMMARY__`, read/fallback instructions, and prior-not-override wording. If already correct, preserve it. |
| Shipped plugin prompt | `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md` | Must remain byte-identical to the Studio prompt after reconciliation. Do not delete the section-summary block to make parity. |
| Bank conformance guard | `packages/viewer/src/components/studio/bankConformance.test.ts`, or a small helper imported by that test | Compare prompt file lists and bodies for every banked play, and report failures with the play slug and prompt path. Keep the existing `workflow.fabro` parity check. |
| Guard negative tests | Same test file or focused fixture/helper tests nearby | Add cases for bodies-equal pass, Studio missing the section-summary block while plugin has it, plugin/studio body mismatch, and prompt present on one side only. |
| Placeholder spelling guard | `packages/viewer/src/components/studio/placeholderConformance.test.ts` and `studio/tools/check-placeholder-spelling.sh` if touched | No intended behavior change; rerun to prove `__AX_INPUT_SECTION_SUMMARY__` remains runtime-substitutable. |
| Existing structured conformance | `studio/tools/check-play-conformance.mjs` and existing Studio conformance tests | No intended behavior change; rerun so brief/moves/risk-map checks still pass. |
| EL5 structural eval configs | `packages/ax/tests/eval-cases/build-atomic-card/*` | Ensure structural eval coverage still requires the section-summary prompt instructions. If the current config already checks them, preserve it and rerun. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven `build-atomic-card` drafter | No new behavior beyond #490. The work preserves the existing behavior: read `SECTION_SUMMARY` when non-empty, use it as a framing prior, and fall back to source-only when empty. | Plugin validation and EL5 structural eval reruns. |
| Raven source-only fallback | No behavior change. The prompt must continue to say an empty `SECTION_SUMMARY` means no section summary input exists. | Existing and structural eval checks must keep this wording covered. |
| Studio bank process | The conformance gate now explicitly proves prompt body parity, not only workflow/package shape. | Viewer Studio conformance tests and negative fixture coverage. |
| Atomic-card production skill | No change expected. It describes EL5 production inputs and high-level ground rules, not the child prompt body. | No skill eval beyond EL5 workflow evals unless implementation edits the skill. |
| AX executor | No change. It already emits and binds `SECTION_SUMMARY` in the related #490/#500 work. | No AX black-box CLI changes required for this issue. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Prompt parity | `diff -u studio/plays/build-atomic-card/prompts/draft_or_repair.md packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md` | Confirms the Studio and plugin draft prompt bodies are byte-identical. Expected output is empty. |
| Bank no-op check | `studio/tools/bank.sh --check studio/plays/build-atomic-card` | Exercises the real bank seam without copying. It should report the deployable package is in sync. If local `fabro` is unavailable, record that blocker and run `diff -ru` over `workflow.fabro` and `prompts/` as a fallback. |
| Prompt body guard | `cd packages/viewer && bun test src/components/studio/bankConformance.test.ts` | Proves actual banked plays are in parity and runs the new negative fixture cases. |
| Placeholder spelling | `cd packages/viewer && bun test src/components/studio/placeholderConformance.test.ts src/components/studio/placeholders.test.ts` | Proves the canonical `__AX_INPUT_SECTION_SUMMARY__` token is accepted by the shared placeholder rules. |
| Existing Studio conformance | `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` | Regression for the existing brief/moves/risk-map conformance script named by the issue. |
| Studio drift family regression | `cd packages/viewer && bun test src/components/studio/riskMapConformance.test.ts src/components/studio/moveCoverage.test.ts src/components/studio/promptContract.test.ts` | Keeps the adjacent Studio conformance gates green. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required by plugin package guidance when shipped workflow prompt behavior is touched. |
| EL5 structural evals | `pnpm eval -- run atomic-card-planning/all && pnpm eval -- run atomic-card-creation/all && pnpm eval -- run build-atomic-card/all` | `EVALS.md` maps EL5 workflow and `build-atomic-card` prompt changes to these eval groups. |
| Markdown lint | `pnpm run lint:markdown` | Validates changed Markdown prompt and plan files if implementation edits Markdown. |

## Eval Impact

This issue touches the shipped `build-atomic-card` prompt surface or verifies
that it remains unchanged in parity. Per `EVALS.md`, changes under
`packages/alexandria-plugin/workflows/build-atomic-card/*` require EL5 eval
coverage.

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `build-atomic-card` draft prompt | `packages/ax/tests/eval-cases/build-atomic-card/draft-against-confirmed-stub/config.json` already checks for `Optional section summary prior`, `Treat it as a prior, not an override`, empty-path fallback, `WHAT`, product-term `WHERE`, and slug-free `HOW`. | Preserve or add these checks. If missing in the implementation branch, extend this config rather than creating a duplicate case. | `pnpm eval -- run build-atomic-card/all` |
| `build-atomic-card` workflow and grading loop | `build-atomic-card/shelf-fit-grade-loop` checks the draft, validate, grade, revise, bail, publish routing. | Rerun to ensure prompt parity work did not disturb routing or grade prompt coverage. | `pnpm eval -- run build-atomic-card/all` |
| Atomic-card planning/creation EL5 family | Existing structural runner covers the EL5 family. | Rerun because `EVALS.md` groups `build-atomic-card` workflow prompt changes with the EL5 family. No new planning or creation cases are required unless those files are edited. | `pnpm eval -- run atomic-card-planning/all` and `pnpm eval -- run atomic-card-creation/all` |
| Guard negative cases | No eval harness coverage; this is deterministic file parity behavior. | Cover with Bun tests using temp fixture trees or a pure helper. | `cd packages/viewer && bun test src/components/studio/bankConformance.test.ts` |

No live model eval or judge case is required for this slice. The behavior under
test is prompt file presence and byte parity, plus existing structural prompt
contract strings.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Implementation restores parity by deleting the plugin's correct section-summary block. | Treat Studio as the source but copy the plugin's current correct content into Studio when needed. Acceptance requires the section-summary block to remain in both files. |
| The guard only checks the live repo and has no negative proof. | Add fixture-level tests or a pure comparison helper that proves mismatch and one-sided prompt files fail. |
| Prompt comparison checks only file names, not bodies. | Compare UTF-8 file contents byte-for-byte and include the prompt path in failure output. |
| Prompt comparison checks only `build-atomic-card` and misses future banked plays. | Discover banked slugs as plays present in both Studio and plugin trees, matching the current bank conformance model. |
| A nested prompt file or extra plugin prompt escapes a flat `readdirSync` check. | Prefer recursive relative file collection under `prompts/`. If implementation keeps flat collection because prompt dirs are flat today, add a follow-up or explicit comment; present-on-one-side files at the supported level must still fail. |
| Placeholder spelling drifts to the retired `__AX2_` or malformed `__AX...__` form. | Keep `__AX_INPUT_SECTION_SUMMARY__` exactly and rerun placeholder conformance. |
| `bank.sh --check` cannot run in a local environment because `fabro` is missing even though no copy is needed. | Record the tool blocker in the implementation handoff and run direct `diff -ru` parity checks. Do not skip the Bun conformance test. |
| The prompt eval config already contains the required strings, so the implementation assumes no work is needed. | Still add or preserve the guard negative cases and run the eval. The issue is about surviving future banks, not only current prompt content. |
| Existing brief/moves/risk-map conformance coverage regresses while changing the guard family. | Keep changes scoped to bank prompt parity and rerun `check-play-conformance.mjs` plus adjacent Studio conformance tests. |

## Implementation Steps

1. Reconfirm the prompt state:
   - read both `draft_or_repair.md` copies;
   - verify the plugin copy contains the section-summary block;
   - verify the Studio copy contains the same block;
   - if Studio is missing it, copy the plugin block/content into Studio.

2. Reconcile exact prompt parity:
   - run `diff -u` on the two prompt files;
   - if any difference remains, decide whether the Studio source should absorb
     the plugin's section-summary content or whether an unrelated drift needs a
     separate issue;
   - do not remove `__AX_INPUT_SECTION_SUMMARY__` from the plugin prompt to make
     the diff pass.

3. Inspect `packages/viewer/src/components/studio/bankConformance.test.ts`:
   - preserve the existing `workflow.fabro` byte-parity check;
   - ensure prompt parity compares sorted relative prompt file lists;
   - ensure each common prompt file body is compared byte-for-byte;
   - ensure failures name the play slug and prompt path.

4. Add explicit negative coverage:
   - refactor the comparison into a small helper that accepts Studio and plugin
     roots, or add test-local fixture helpers;
   - add a bodies-equal fixture that returns no errors;
   - add a `studio-missing-block` fixture where Studio lacks the
     section-summary paragraph and plugin has it, expecting a body mismatch
     error for `build-atomic-card/prompts/draft_or_repair.md`;
   - add a present-on-one-side fixture for a Studio-only prompt;
   - add a present-on-one-side fixture for a plugin-only prompt.

5. Keep actual-tree coverage:
   - the test must still discover at least one banked play from the real repo;
   - `build-atomic-card` must be included in the actual banked set;
   - the real `build-atomic-card` prompt parity assertion must pass.

6. Check placeholder spelling:
   - verify the prompt uses `__AX_INPUT_SECTION_SUMMARY__` exactly;
   - do not introduce any `__AX2_` or malformed `__AX...__` placeholders.

7. Preserve EL5 structural prompt eval coverage:
   - keep or add checks in
     `packages/ax/tests/eval-cases/build-atomic-card/draft-against-confirmed-stub/config.json`
     for the section-summary prior, empty fallback, prior-not-override wording,
     `WHAT`, product-term `WHERE`, and slug-free `HOW`.

8. Run the deterministic verification commands. If a tool is unavailable,
   record the exact skipped command and reason in the implementation handoff.

## Acceptance / Exit Criteria

1. `studio/plays/build-atomic-card/prompts/draft_or_repair.md` and
   `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md`
   are byte-identical.
2. Both prompt copies contain the canonical
   `__AX_INPUT_SECTION_SUMMARY__` placeholder.
3. Both prompt copies instruct Raven to read the section-summary JSON file when
   the path is non-empty and to use source-only fallback when it is empty.
4. Both prompt copies state that the section summary is a prior, not an
   override, and that source ranges remain the factual authority.
5. A bank check for `build-atomic-card` reports no deployable-package drift, or
   an unavailable `fabro` tool is explicitly recorded with direct diff parity
   as fallback evidence.
6. The conformance guard fails for a guarded play when a prompt body differs
   between Studio and plugin.
7. The conformance guard fails when a prompt exists only in Studio.
8. The conformance guard fails when a prompt exists only in the plugin.
9. The conformance guard passes on the reconciled `build-atomic-card` play.
10. Existing workflow parity checks still run as part of the bank conformance
    guard.
11. Existing brief/moves/risk-map conformance checks still pass.
12. EL5 structural eval coverage still verifies the section-summary prompt
    instructions.
13. The AX executor's `SECTION_SUMMARY` emission and binding behavior is
    unchanged.

## Deferred Follow-Ups

1. Generalize `studio/tools/check-play-conformance.mjs` beyond its current
   specialized Back-of-House shape only if a future issue wants a CLI-level
   all-play conformance runner. This issue can be handled at the bank seam.
2. Add recursive prompt parity to bank conformance if implementation keeps the
   current flat prompt-file collector and a later play introduces nested prompt
   directories.
3. Consider wiring `studio/tools/bank.sh --check` into a broader repo check
   matrix if future banking drift recurs outside the viewer Studio tests.
