# Issue 547: Back-of-House Scope Fence

## Header

- Issue: [#547](https://github.com/GetAlexandria/alexandria-internal/issues/547), "Back-of-House sweep scope fence: out-of-scope material becomes a suspect thread, not a container".
- Goal: make the Back-of-House sweep require an operator-declared product scope, suspend substantive out-of-scope piles as one director-facing `out_of_scope_suspect` thread per pile, and prevent those piles from becoming card containers in newly emitted bundles.
- Run ID from request: `01KWG52RKWZFB1KME4GMGVFYY0`.
- Linked product plan: none linked in the issue body. The issue text and the Director's 2026-07-01 `runs` ruling are the product contract.
- Related local context reviewed: `studio/plays/back-of-house-walk/{brief.md,moves.md,risk-map.md}`, `docs/alexandria/plans/pms-library-handoff/HANDOFF.md`, `docs/alexandria/plans/476-library-search-prior/plan.md`, `docs/alexandria/plans/546-keystone-conformance-gate/plan.md`, `docs/alexandria/plans/484-foh-held-back/plan.md`, and `docs/alexandria/plans/505-threads-json-ledger-derived-lifecycle/plan.md`.
- Issue comments: `gh` is not installed in this environment, so comments could not be fetched. The plan is grounded in the full issue body included in the request.

## Scope

This slice changes the Back-of-House scope contract and the existing thread and Front-of-House consumers.

In scope:

1. Add an explicit Back-of-House `scope` input to the Studio play contract. The operator writes this scope; the scanner does not infer it from source or from the Basic Product Description.
2. Define the scope file shape in the Back-of-House brief: product name, in-scope roots, optional in-scope topics, explicit out-of-scope roots/topics, and boundary notes.
3. Update Back-of-House move guidance so substantive piles outside or borderline to the declared scope are not carded and do not create bundle container directories.
4. Extend the `library-threads.v1` reference vocabulary with `kind: "out_of_scope_suspect"` while keeping the existing schema version and `family: "gap" | "hot_spot"` parser shape.
5. Use `family: "hot_spot"` for out-of-scope suspect threads so existing catalog and viewer family schemas continue to load them without a viewer schema migration.
6. Update Front-of-House deterministic support so a thread with `kind: "out_of_scope_suspect"` projects to a normal agenda item with `agendaItem.kind: "out_of_scope_suspect"` and can bank the director ruling as `library.front_of_house.answer_recorded`.
7. Update Raven's shipped Front-of-House skill so it presents suspect items as one ordinary ruling: "mine, include next sweep" or "not mine, drop", with no special gate mechanics and no card-body patching.
8. Add deterministic tests for thread parsing, Front-of-House agenda projection, state event schema/introspection, answer banking, and representative scope-fence output fixtures.

## Non-Goals

1. Do not remove or rewrite the existing `studio/sweeps/playmaker-studio/runs` container in this slice. The issue explicitly leaves that to the next conforming re-emit.
2. Do not spin Playmaker Studio out of Alexandria.
3. Do not write to `docs/alexandria/library/`.
4. Do not broaden Back-of-House into a newly shipped runtime play unless implementation explicitly chooses to derive/register it as a separate, larger slice.
5. Do not add a new Front-of-House gate type. Suspect rulings use the existing `record-turn`, `ax raven answer`, patch/residual, and `answer_recorded` path.
6. Do not change Viewer behavior unless implementation chooses a new thread family. This plan avoids that by keeping `family: "hot_spot"`.
7. Do not change confirmation hash behavior for `threads.json`; issue #505 already made thread lifecycle Ledger-derived.

## Linked Product-Plan Summary

The product decision is a disposition fence, not a detection rollback. The scanner should still notice substantive neighboring material, especially in a monorepo or nested-product repo. The failure mode is silently filing that neighboring pile as a first-class container.

The Director's `runs` reversal is the core example: `runs` looked out of scope when treated as Alexandria runtime, then became in scope when the Director recognized Playmaker Studio needs its own run machinery once independent. The product must surface that as an explicit banked question. A future product sharing the same repo may get the opposite ruling.

The intended behavior is:

1. declared in-scope material becomes normal cards and containers;
2. substantive out-of-scope or borderline material becomes one `out_of_scope_suspect` thread per pile;
3. suspect piles create no card files and no container directories in the emitted bundle;
4. Front-of-House walks the suspect as a normal agenda item and banks the Director's ruling as a normal answer event.

## Current Gap

Back-of-House currently has scope-adjacent concepts, but no hard scope fence:

1. `studio/plays/back-of-house-walk/brief.md` accepts `manifest`, `output_path`, optional `answer_key`, and optional `basic_product_description`. It does not require an operator-declared product scope.
2. The Basic Product Description's `What It's Not` can seed a prior fence, but that is inferred product prose, not the operator's explicit sweep scope.
3. `survey` and `emit_bundle` say high-confidence prior fence entries may prune and low-confidence entries become questions, but nothing prevents discovered neighboring product material from becoming cards or containers.
4. The current thread contract documents canonical kinds for gaps and hot spots only. `packages/ax/src/domain/library-catalog.ts` preserves unknown `kind` values, but `CANONICAL_THREAD_KINDS` does not name `out_of_scope_suspect`.
5. `studio/tools/check-threads.mjs` validates thread examples and swept outputs with the shipped parser. It has no fixture for the new kind.
6. Front-of-House currently derives agenda item kind from thread family: `gap -> stage2_question`, `hot_spot -> hot_spot`. A suspect thread would be rendered as a generic hot spot unless the thread kind is preserved into the agenda.
7. `FRONT_OF_HOUSE_AGENDA_ITEM_KINDS` and the state-event payload schemas only allow `stage2_question` and `hot_spot`, so a real `out_of_scope_suspect` agenda item cannot bank as `answer_recorded` until those literals and parsers are extended.
8. `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` has Section Comprehension and Held-Back Problems movements, but no suspect-pile movement or instruction to avoid patching nonexistent out-of-scope cards.
9. `PLAY_MANIFEST` currently registers `front-of-house-walk`, but not `back-of-house-walk`. Back-of-House is a Studio play record, not an executable shipped runtime play in this checkout.

## Architectural Boundaries

1. Back-of-House scope rules belong in `studio/plays/back-of-house-walk/brief.md` and `moves.md`, because that is the current source of truth for the EL2 producer.
2. `packages/ax` owns deterministic `library-threads.v1`, Front-of-House agenda projection, and Ledger event schemas. It should extend those contracts without moving Back-of-House prompt logic into AX.
3. Keep the thread schema version as `library-threads.v1`. This is a vocabulary and consumer extension, not a forked thread file format.
4. Keep `family: "hot_spot"` for `out_of_scope_suspect` records. A new family would require `packages/viewer/src/app/runtime/schemas.ts`, viewer filters, counts, and styling changes that are not needed for this issue.
5. Front-of-House should use thread `kind` to project `agendaItem.kind: "out_of_scope_suspect"`, then handle answer/residual lifecycle through the same existing Ledger event types.
6. Suspect rulings should normally produce an empty resolved patch, or an unresolved patch if the Director defers. The patch planner must not invent card updates for cards that were intentionally not emitted.
7. Existing `studio/sweeps/playmaker-studio` remains historical evidence. Do not edit it to satisfy this issue.
8. If implementation chooses to make Back-of-House executable in this slice, that is a scope expansion: add `PLAY_MANIFEST`, plugin workflow, CLI fixture, and plugin validation work explicitly before claiming run-level sweep acceptance.

## Proposed Thread Shape

Use the existing thread schema with one new canonical kind:

```json
{
  "id": "out-of-scope-suspect-runs",
  "family": "hot_spot",
  "kind": "out_of_scope_suspect",
  "concerns": [{ "type": "context", "context": "runs" }],
  "confidence": "medium",
  "severity": "medium",
  "status": "open",
  "question": "The scan found a substantive Runs pile outside the declared scope. Is this part of this product and should it be included in the next sweep, or should it be dropped?",
  "emittingMove": "pass2_carve",
  "sourceEvidence": [
    "studio/plays/RUNTIME.md:31",
    "studio/plays/board-state.json:55"
  ],
  "reason": "The pile has card-worthy run, gate, and output-banking material, but the declared scope did not include runtime execution machinery. Proposed disposition: suspend for Director ruling; do not card in this bundle."
}
```

Rules:

1. The `id` is stable and derived from the normalized pile name, not from a run id.
2. `concerns` uses a context concern because no card exists in the bundle for the suspect pile.
3. `sourceEvidence` carries the card-worthy refs that made the pile substantive.
4. `question` gives the Director the adoption/disowning ruling.
5. `reason` carries the scanner's proposed disposition and the builder-register detail.
6. The bundle must contain no container directory and no card file for the same suspect pile.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Back-of-House Studio play contract | `studio/plays/back-of-house-walk/brief.md` | Adds required `scope` input, scope-file shape, borderline-as-suspect rule, no-card/no-container rule for suspect piles, and an embedded `out_of_scope_suspect` thread example. |
| Back-of-House moves overlay | `studio/plays/back-of-house-walk/moves.md` | Mirrors the scope input and the survey/carve/emit/check behavior in reader-facing move prose. |
| Back-of-House risk map | `studio/plays/back-of-house-walk/risk-map.md` | Adds or refines a scope-boundary risk and fixture obligations for excluded-pile suspension, all-in-scope regression, and idempotent re-sweep. |
| Thread parser/reference vocabulary | `packages/ax/src/domain/library-catalog.ts` | Adds `out_of_scope_suspect` to the canonical thread-kind reference set and TypeScript type vocabulary while preserving free-string parsing. |
| Thread parser tests | `packages/ax/tests/library-catalog.test.ts` | Proves the new canonical kind loads, preserves evidence, sorts deterministically, and does not create gap fill-readiness side effects. |
| Studio thread guard fixtures | `studio/tools/fixtures/threads/good/threads.json`, `studio/tools/check-threads.test.mjs` | Adds a valid suspect thread fixture and keeps `check-threads` parser parity green. |
| Front-of-House agenda domain | `packages/ax/src/domain/library-front-of-house.ts` | Adds `out_of_scope_suspect` to agenda item kinds, maps suspect thread kind to that agenda kind, parses/render current-item artifacts, and ranks suspects in the trailing problem movement. |
| Front-of-House state events | `packages/ax/src/domain/state-events.ts` | Extends `FrontOfHouseAgendaItemKindSchema` and event schema introspection literals for turn, answer, and residual events. |
| Front-of-House answer banking | `packages/ax/src/effects/front-of-house-answer-banking.ts` and tests | Existing code should work once current-item parsing allows the new kind; add regression coverage that a suspect banks as `answer_recorded`. |
| Front-of-House CLI tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, `packages/ax/tests/front-of-house-answer-banking.test.ts`, `packages/ax/tests/events.test.ts` | Cover agenda projection, `prepare-agenda`, `stage-next`, event schema, output fields, exit codes, idempotency, and normal answer banking for suspect items. |
| Shipped Front-of-House skill | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | Adds a suspect-pile movement and updates Section Comprehension / Held-Back guidance so suspect items are not section reads or card-body patch requests. |
| Front-of-House workflow prose and patch prompt | `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`, `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | Generalizes "Stage-2 question or Hot Spot" wording to agenda item and tells patch planning to write an empty resolved patch for adopted/dropped suspect rulings unless a real emitted card update is explicitly safe. |
| Front-of-House eval configs | `packages/ax/tests/eval-cases/front-of-house-walk/out-of-scope-suspect-contract/config.json` | Adds structural coverage that Raven presents one suspect ruling, uses ordinary language, and keeps the normal answer loop. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Back-of-House Walk | The scanner must read an explicit scope before scanning. Material outside or borderline to that scope is suspended as a suspect thread and excluded from cards/containers. | Update `brief.md`, `moves.md`, `risk-map.md`, and Studio thread fixtures. Run Studio checks. |
| Front-of-House Walk deterministic artifacts | `out_of_scope_suspect` becomes a first-class agenda item kind while using the same runtime files and Ledger events. | Update AX domain, state-event schemas, and black-box CLI tests. |
| Raven Front-of-House skill | Raven asks the Director to rule one suspect pile as "mine, include next sweep" or "not mine, drop"; no special gate, no body fill, no invented card patch. | Update skill, prompt/workflow wording, structural eval case, and plugin validation. |
| Viewer | No planned change. Suspect threads remain `family: "hot_spot"` and render with existing family filters/counts; `kind` label displays as `out of scope suspect`. | No viewer validation required unless implementation changes family/schema or viewer rendering. |
| Back-of-House runtime play | No planned registration change. | If implementation registers Back-of-House in `PLAY_MANIFEST`, add CLI black-box tests and plugin workflow validation in the same slice. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX catalog/thread parser | `cd packages/ax && bun test tests/library-catalog.test.ts` | Proves the new thread kind is canonical, parse-safe, and does not alter existing gap/hot-spot behavior. |
| Studio thread guard | `bun studio/tools/check-threads.mjs` and `bun test studio/tools/check-threads.test.mjs` | Validates the Back-of-House embedded example and committed thread fixtures through the shipped parser. |
| Front-of-House domain | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves agenda projection, parse/render, ordering, residual projection, and idempotency for the new agenda item kind. |
| Front-of-House CLI | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Black-box coverage for `prepare-agenda`, `stage-next`, stdout/stderr, exit codes, and stable runtime artifacts with a suspect item. |
| Answer banking | `cd packages/ax && bun test tests/front-of-house-answer-banking.test.ts` | Proves the normal `ax raven answer` path appends `library.front_of_house.answer_recorded` for a suspect agenda item. |
| Event schemas | `cd packages/ax && bun test tests/events.test.ts` | Proves schema validation and `ax inspect events schema --json` expose the new agenda item kind. |
| AX typecheck and format | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run format:check` | Catches TypeScript literal and formatting drift in changed AX files. |
| Front-of-House structural evals | `pnpm eval -- run front-of-house-walk/all` | Runs existing structural Front-of-House skill checks plus the new suspect movement case. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required because the shipped Front-of-House skill and workflow prompt/prose change. |
| Studio full guard | `sh studio/tools/check.sh` | Ensures Back-of-House brief examples and Studio validators remain green. |
| Back-of-House play conformance | `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` | Run if the existing checker supports the touched Back-of-House contract checks; otherwise record why it is not applicable. |

If implementation registers Back-of-House as an executable play, add black-box CLI verification for `ax run back-of-house-walk --input manifest=... --input scope=... --input output_path=... --json` covering excluded-pile suspension, all-in-scope regression, and idempotent rerun.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Front-of-House skill | Existing structural cases under `packages/ax/tests/eval-cases/front-of-house-walk` cover opener, section comprehension, and drift reconciliation. | Add a sibling `out-of-scope-suspect-contract` case and rerun the family. | `pnpm eval -- run front-of-house-walk/all` |
| Back-of-House Studio play | Risk-map fixture obligations exist, but the current checkout does not have an executable Back-of-House runtime play. | Update risk-map fixture obligations. Do not claim stochastic sweep-run eval coverage until Derive/Prove or registration exists. | No `pnpm eval` run unless implementation packages Back-of-House. |
| AX deterministic thread/agenda behavior | Covered by Bun unit and black-box tests. | Add/update deterministic tests listed above. | No LLM eval needed for AX-only contract code. |
| Plugin package | Skill/workflow prompt text changes require plugin validation; structural eval covers the shipped skill wording. | Run plugin validation and Front-of-House structural evals. | `claude plugin validate ./packages/alexandria-plugin`; `pnpm eval -- run front-of-house-walk/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The scope input becomes another inferred prior rather than an operator boundary. | Add a required `scope` input in the Back-of-House contract and state that Basic Product Description `What It's Not` can only supplement, never replace, the declared scope. |
| The scanner still cards a borderline pile because it seems useful. | Put "borderline is out-of-scope" in survey, carve, emit, and check guidance. Add fixture obligations and tests that a suspicious pile has a thread but no container. |
| A new thread family forces viewer schema and filter changes. | Keep `family: "hot_spot"` and add only `kind: "out_of_scope_suspect"` plus a Front-of-House agenda-kind projection. |
| Front-of-House loses suspect semantics by rendering the thread as a generic hot spot. | Map thread `kind` to `agendaItem.kind: "out_of_scope_suspect"` and include that literal in current-item parsing and event schemas. |
| The Director ruling tries to patch cards that do not exist. | Update Raven skill and `plan_bundle_patch.md` so adopted/dropped suspect rulings normally produce an empty resolved patch, leaving inclusion to the next sweep. |
| Re-runs duplicate suspect threads. | Require stable IDs derived from normalized pile name and stable sorted evidence refs. Add idempotency tests against synthetic suspect-thread bundles or the executable runner if present. |
| All-in-scope behavior regresses because every nontrivial pile gets suspended. | Add all-in-scope regression coverage: no suspect threads and unchanged agenda behavior for existing normal `gap`/`hot_spot` fixtures. If an executable Back-of-House runner exists, compare emitted bundle bytes. |
| The existing PMS `runs` container causes tests to fail even though this issue says not to remove it. | Use synthetic scope-fence fixtures for new tests. Do not assert the historical `studio/sweeps/playmaker-studio` bundle is already conforming. |
| The plan overclaims run-level proof for a non-registered Back-of-House play. | Keep run-level acceptance conditional on deriving/registering Back-of-House. Otherwise update contract, parser, FOH support, and risk-map fixture obligations honestly. |

## Implementation Steps

1. Update `studio/plays/back-of-house-walk/brief.md`:
   - add required `scope` knowledge after `manifest`;
   - define the scope file shape with product name, in-scope roots/topics, out-of-scope roots/topics, and boundary notes;
   - state that the manifest says what can be read, while scope says what can become product cards;
   - state that material outside or borderline to scope becomes an `out_of_scope_suspect` thread and never a card/container in this bundle.
2. Update the Back-of-House move guidance:
   - `survey` reads and records the scope before selecting reads;
   - `pass1_events` may record out-of-scope events as evidence for a suspect pile but must not turn them into the product timeline;
   - `pass2_carve` classifies each candidate pile as in-scope or suspect before carding;
   - `emit_bundle` writes one stable suspect thread per out-of-scope pile and suppresses that pile's directory/cards;
   - `check_bundle` fails REPAIR if a suspect pile also has cards or a container directory.
3. Update `studio/plays/back-of-house-walk/moves.md` with the same scope and suspect behavior in reader-facing prose.
4. Update `studio/plays/back-of-house-walk/risk-map.md`:
   - add a scope-fence risk or extend OUT-7;
   - add fixture obligations for excluded-pile suspension, all-in-scope regression, and idempotent re-sweep;
   - keep `studio/sweeps/playmaker-studio/runs` as historical grounding, not as a passing fixture.
5. Extend `packages/ax/src/domain/library-catalog.ts`:
   - add `out_of_scope_suspect` to the canonical thread-kind vocabulary;
   - keep parser tolerance and schema version unchanged;
   - add tests proving it parses and sorts as authored.
6. Extend Studio thread fixtures and guard tests:
   - add an `out_of_scope_suspect` record to the good fixture or a focused new fixture;
   - update `check-threads.test.mjs` to assert it parses through `parseLibraryCatalogThreads`.
7. Extend `packages/ax/src/domain/library-front-of-house.ts`:
   - add `out_of_scope_suspect` to `FRONT_OF_HOUSE_AGENDA_ITEM_KINDS`;
   - change `agendaKindFromThread` so `thread.kind === "out_of_scope_suspect"` wins over family mapping;
   - update parse/render helpers and movement ordering so suspect items stage in the trailing problem movement and remain normal agenda items.
8. Extend `packages/ax/src/domain/state-events.ts`:
   - update `FrontOfHouseAgendaItemKindSchema`;
   - update event schema introspection literals for turn, answer, and residual events.
9. Update Front-of-House tests:
   - unit test agenda projection from a suspect thread;
   - black-box `prepare-agenda` and `stage-next` on a bundle with a suspect thread;
   - answer-banking test proving `answer_recorded.payload.agendaItemKind === "out_of_scope_suspect"`;
   - events schema test proving the new literal is valid and introspectable;
   - regression tests proving normal all-in-scope `gap`/`hot_spot` fixtures keep existing behavior.
10. Update `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`:
    - add an `### Out-of-Scope Suspects` movement;
    - tell Raven to ask one adoption/drop ruling in ordinary language;
    - state that "mine" means include in the next Back-of-House sweep, not patch this bundle with cards that were intentionally absent;
    - state that "not mine" means drop from this product's bundle;
    - keep the same `record-turn` and `ax raven answer` loop.
11. Update workflow prose/prompt files as needed:
    - generalize `legs.json` wording from "Stage-2 question or Hot Spot" to "agenda item";
    - update `plan_bundle_patch.md` so suspect rulings produce an empty resolved patch unless a safe existing emitted card update is explicitly identified.
12. Add a structural eval case under `packages/ax/tests/eval-cases/front-of-house-walk/out-of-scope-suspect-contract/config.json`.
13. Run the deterministic verification and eval commands listed above.
14. If implementation also derives/registers Back-of-House as executable, add the conditional CLI tests for real sweep-run acceptance before claiming the issue's run-level criteria.

## Acceptance / Exit Criteria

1. Back-of-House documentation requires an explicit operator-written scope and distinguishes readable manifest roots from in-scope product filing roots.
2. Back-of-House contract states that substantive out-of-scope or borderline piles emit exactly one `out_of_scope_suspect` thread and zero cards/container directories.
3. `library-threads.v1` parser and Studio `check-threads` fixtures accept `kind: "out_of_scope_suspect"` without a schema fork.
4. Front-of-House `prepare-agenda` projects a suspect thread to `agendaItem.kind: "out_of_scope_suspect"`.
5. `stage-next`, `record-turn`, `ax raven answer`, residual accounting, and event parsing handle suspect agenda items through the same path as existing items.
6. A Director ruling on a suspect item banks as `library.front_of_house.answer_recorded` with no special gate event.
7. Normal all-in-scope gap and hot-spot fixtures preserve existing agenda behavior.
8. Re-running the same suspect fixture is stable: one thread id per pile, no run-id-based duplicates.
9. The existing `studio/sweeps/playmaker-studio/runs` directory is untouched.
10. Required deterministic tests, Front-of-House structural evals, plugin validation, and Studio checks pass, or any environment-limited command is explicitly reported in the implementation handoff.
11. If Back-of-House remains unregistered as a runtime play, the implementation handoff must say that full stochastic sweep-run acceptance is not CI-proven yet and point to the new risk-map fixture obligations.

## Deferred Follow-Ups

1. Re-emit `studio/sweeps/playmaker-studio` with the scope fence, then remove or adopt `runs` according to the banked Director ruling from that conforming run.
2. Derive and register Back-of-House as a shipped runtime play if Alexandria wants literal `ax run back-of-house-walk` CI coverage for scope-fence acceptance.
3. Add viewer-specific suspect styling only if product feedback shows `family: "hot_spot"` plus `kind: "out_of_scope_suspect"` is not legible enough.
4. Add a materialized scope-file parser in AX only if multiple producers need deterministic validation of scope config beyond the Back-of-House prompt contract.
5. Once Back-of-House has graded fixtures, add measured runs for excluded-pile suspension, all-in-scope regression, and idempotent re-sweep to the Studio risk map.
