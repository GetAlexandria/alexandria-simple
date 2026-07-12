# Issue #537: Front-of-House Reactions Answer Banking

Issue reference: GitHub issue `GetAlexandria/alexandria-internal#537`,
"ax run --reactions must bank Front-of-House director answers (receipt +
Ledger event) like ax raven answer".

Goal: make `ax run front-of-house-walk --reactions <file>` submit scripted
answers through the same Front-of-House answer-banking contract as
`ax raven answer`, so each answered `director_review` gate has a durable
`library.front_of_house.answer_recorded` event and a
`runtime/front-of-house/answers/<questionId>.json` receipt before the workflow
resumes into patch planning.

Linked product plan: no separate linked product plan. The issue body is the
direct product contract. Related context is in
`docs/alexandria/plans/library-elicitation-plays/plan.md`,
`docs/alexandria/plans/front-of-house-handshake/plan.md`, and existing
Front-of-House provenance/patch plans such as
`docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md`.

## Scope

- Move the existing Front-of-House answer banking logic out of
  `packages/ax/src/commands/play-answer.ts` into a shared AX implementation
  used by both `ax raven answer` and `ax run --reactions`.
- Keep the stored event payload, actor, idempotency key, receipt filename, and
  receipt JSON shape byte-shape-compatible with the current `ax raven answer`
  path, modulo generated ids and timestamps.
- In the scripted reactions path, bank a Front-of-House answer before calling
  `submitFabroAnswer`, matching the manual command's "bank before resume"
  ordering.
- Preserve existing `--reactions` parsing and file format. Existing
  `reactions.json` fixtures remain valid.
- Preserve existing non-Front-of-House reactions behavior, including the
  make-a-play review-gate fact special case.
- Add deterministic tests for event/receipt banking, the full small-el2
  scripted walk, make-a-play non-leakage, and exhausted reaction queues.

## Non-Goals

- Do not change the Front-of-House workflow graph, prompt contract, or event
  schemas unless implementation discovers a direct incompatibility.
- Do not add a scripted/director marker to answer events or receipts.
- Do not change `reactions.json` syntax or require a new `--bundle` flag on
  `ax run --reactions`.
- Do not change how `ax raven answer` handles already-resolved questions,
  Fabro rejection, make-a-play gate confirmations, or `--bundle`.
- Do not make non-Front-of-House plays write
  `library.front_of_house.answer_recorded` events.
- Do not address issue #536's bad-patch degradation path in this slice, beyond
  keeping the small-el2 "hold" reaction observable as a residual gap.
- Do not write to `docs/alexandria/library/`.

## Current Gap

`ax raven answer` currently does the right Front-of-House work:

- reads the requested answer spec;
- confirms the Fabro question is pending;
- detects a `front-of-house-walk` human-input request;
- finds `runtime/front-of-house/current-item.json` from `--bundle` or by
  inference;
- appends `library.front_of_house.answer_recorded` with actor
  `{ kind: "user", host: "claude-code", name: "Director" }`;
- writes `runtime/front-of-house/answers/<questionId>.json`;
- then posts the answer to Fabro.

`ax run --reactions` currently bypasses that banking path. In
`packages/ax/src/commands/play.ts`, `driveScriptedAnswers` calls
`submitFabroAnswer` directly. It already has a play-specific post-submit branch
for make-a-play review gates (`appendReviewGateConfirmedFact`), but no
Front-of-House branch. The result is that the `director_review` gate clears,
the workflow resumes, and `plan_bundle_patch` correctly stops with
`NO_DIRECTOR_ANSWER_RECEIPT` because no receipt exists.

One important implementation detail: the current `ax raven answer` helper uses
the ledger's `play.human_input_requested` event to detect the FoH play and
recover `playRunId`. A reactions run is explicitly allowed to operate without
the runtime bridge, so the shared banker must not require that event for the
scripted path. `ax run` already knows `playId`, `playRunId`, `fabroRunId`,
`questionId`, and the resolved `bundle` input, so the reactions caller should
pass those facts directly into the shared core banking function.

## Architectural Boundaries

- AX owns this fix. The changed behavior is deterministic CLI orchestration in
  `packages/ax`.
- The Alexandria plugin owns the play contract. Do not redefine
  Front-of-House workflow semantics in AX; AX should only bank the director
  answer according to the existing contract.
- The shared banking core should live in an AX effect/domain module, not inside
  a command file. Command modules should orchestrate it.
- Keep the Ledger event schema unchanged. Any event written by the scripted path
  must validate against the existing `library.front_of_house.answer_recorded`
  schema.
- Keep the banking operation before Fabro submission. If banking fails, the
  scripted driver must not submit the answer and strand the workflow without
  provenance.
- Keep make-a-play review-gate confirmation in its existing lane. Scripted
  make-a-play answers may still append `play.review_gate_confirmed`, but must
  not pick up FoH answer receipts.
- Use existing Effect patterns in `packages/ax` (`Effect.fn`, `FileSystem`,
  `promiseBoundary`, and `NodeFileSystem` in tests).

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared FoH answer banking | New module such as `packages/ax/src/effects/front-of-house-answer-banking.ts`, plus imports from `library-front-of-house.ts`, `state-events.ts`, and `project-state-loader.ts` | Provides one core implementation that appends `library.front_of_house.answer_recorded` and writes the answer receipt. Supports both direct known-FoH inputs and the manual command's request-event lookup. |
| Manual answer command | `packages/ax/src/commands/play-answer.ts`, `packages/ax/tests/play-answer.test.ts`, existing FoH bundle tests | Replaces local banking helpers with the shared helper without changing `ax raven answer` output, exit codes, actor, event payload, receipt shape, or idempotency behavior. |
| Scripted run command | `packages/ax/src/commands/play.ts` | For `playId === "front-of-house-walk"` and `--reactions`, resolves the input bundle, banks the answer through the shared helper, then calls `submitFabroAnswer`. Existing make-a-play reactions behavior remains after successful submit. |
| Scripted answerer effect | `packages/ax/src/effects/scripted-answerer.ts`, `packages/ax/tests/scripted-answerer.test.ts` | Queue semantics should stay unchanged: one reaction per new question, clean `exhausted` status when reactions run out, rejected status when submit returns `ok: false`. Only tests may need small additions if the submit callback behavior is factored for coverage. |
| FoH black-box tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` and/or `packages/ax/tests/ax.integration.test.ts` | Add coverage that a scripted FoH answer writes the same event/receipt shape as `ax raven answer`, that small-el2 reaches finalize, that the held item remains residual, and that fewer reactions fail cleanly. |
| Plugin payload | `packages/alexandria-plugin/workflows/front-of-house-walk/*`, `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | No planned behavior change. Validate only if implementation discovers the existing prompt/fixture contract is inconsistent with the fixed CLI behavior. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | `ax run front-of-house-walk --reactions <file>` now banks each scripted director answer before resuming the gate. JSON output remains the existing reactions output shape (`mode`, `status`, `reactionsAnswered`, ids). | Add black-box CLI tests for exit codes and output fields. Update no help text unless diagnostics are clarified. |
| Raven / Front-of-House product skill | No user-facing skill behavior change. The skill already expects `ax raven answer` to bank answers; this slice makes the deterministic dry-run path match it. | No skill edits or eval baseline changes required unless implementation touches plugin files. |
| make-a-play reactions path | No behavior change intended. | Add regression coverage proving no FoH answer event/receipt is written for a make-a-play reactions run. |
| Eval harness | No reusable agent/skill behavior changes planned. | See Eval Impact. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Scripted answerer and parser tests | `pnpm --filter @alexandria/ax test -- tests/scripted-answerer.test.ts` | Confirms reactions parsing, queue exhaustion, rejection, timeout, and unchanged answer ordering. |
| Manual answer command regression | `pnpm --filter @alexandria/ax test -- tests/play-answer.test.ts tests/library-front-of-house-bundle.test.ts` | Confirms `ax raven answer` still banks FoH answers, make-a-play facts still work, and existing FoH patch provenance still validates. |
| New full scripted FoH fixture test | Add to the most appropriate AX black-box suite, then run it with the targeted AX tests above. | Exercises `ax run front-of-house-walk --fixture small-el2 --reactions ... --json` through a deterministic Fabro/ACP harness or a working local ACP adapter and asserts `status: "completed"` and `reactionsAnswered: 4`. |
| Non-FoH regression | Same targeted AX tests, with a make-a-play reactions case. | Verifies no `library.front_of_house.answer_recorded` events or FoH receipt files leak into non-FoH plays. |
| Typecheck | `pnpm --filter @alexandria/ax run typecheck` | Guards the shared helper signature and Effect wiring. |
| Lint | `pnpm --filter @alexandria/ax run lint` | Catches import/style issues in the touched AX package. |
| Adapter-backed smoke | `ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json` | Final real-command acceptance with a working ACP adapter. Expected JSON includes `status: "completed"` and `reactionsAnswered: 4`. |
| Plugin validation, conditional | `claude plugin validate ./packages/alexandria-plugin` | Run only if plugin workflow, prompt, skill, or packaged metadata files change. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|--------------------|
| `ax run --reactions` CLI behavior | Deterministic AX tests cover reactions parsing and driver behavior. This issue adds missing FoH banking and full fixture coverage. | Add/extend deterministic tests. No eval-harness rerun required for AX-only orchestration changes. | Not required. |
| Front-of-House product skill and prompt | Structural metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/`, and product skill eval guidance applies if plugin skill/prompt behavior changes. | No action if this slice only touches AX. If plugin files change, inspect the affected front-of-house eval case configs and rerun when the harness supports it. | Conditional: `pnpm eval -- run front-of-house-walk/all`; if the broader harness is unavailable, document that and run plugin validation plus deterministic AX tests. |
| make-a-play reactions path | Deterministic behavior is AX-owned. | Add regression test; no eval rerun. | Not required. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The shared helper still depends on `play.human_input_requested`, so reactions runs without the runtime bridge keep failing to bank. | Split the implementation into a core banker that takes known `playRunId` and bundle/current-item context, plus a manual-command wrapper that looks up the FoH human request. The reactions path should call the core with its known `playRunId` and resolved `inputs.bundle`. |
| The reactions path cannot find the bundle because fixture bundles live under `studio/plays/...`, not necessarily under `docs/alexandria`. | Derive the FoH bundle path from resolved workflow inputs after fixture and explicit `--input` merging. For `front-of-house-walk`, require/use `inputs.bundle` rather than workspace scanning. |
| Banking after `submitFabroAnswer` lets the workflow resume and reach patch planning before the receipt exists. | Preserve the manual path ordering: bank first, submit second. Add a test that submit is not called when banking fails. |
| The scripted path writes an event shape that differs from `ax raven answer`. | Use the same core function for both callers and add a normalized comparison test for actor, payload keys, idempotency key, and receipt keys, ignoring only generated id/timestamp. |
| Non-FoH plays start writing FoH answer events because the helper is too broad. | Gate the direct reactions call on `options.playId === "front-of-house-walk"`. Keep the manual wrapper no-op unless it finds a FoH request. Add make-a-play regression coverage. |
| An exhausted reactions file banks or submits more than the available answers. | Keep `driveScriptedAnswers` queue semantics unchanged and add a FoH negative test with fewer reactions than gates that returns `status: "exhausted"`, nonzero exit, and the expected `reactionsAnswered` count. |
| The full small-el2 fixture test becomes flaky because it depends on a live model-backed ACP adapter. | Prefer a deterministic fake ACP/Fabro harness for CI. If current infrastructure cannot drive the workflow end to end without a real adapter, keep a targeted deterministic banking test in CI and document the adapter-backed smoke as a required local acceptance command before merge. |
| Existing `ax raven answer` behavior regresses while extracting helpers. | Keep current play-answer tests green and add a focused test that the manual command's JSON output still includes `frontOfHouseAnswerFact` with the same status/event fields. |

## Implementation Steps

1. Create a shared AX Front-of-House answer banking module. Move the receipt
   filename sanitizer, current-item parsing/inference, event append, receipt
   write, and `DIRECTOR_GATE_ACTOR` into it.
2. Structure the shared module as two layers:
   - a core function that requires known FoH context (`playRunId`,
     `fabroRunId`, `questionId`, `answerSpec`, and either `bundle` or a
     resolved current-item location) and performs the event append plus receipt
     write;
   - a manual-command helper that preserves current `ax raven answer`
     behavior by looking up the matching FoH `play.human_input_requested`
     event and returning `null` for non-FoH questions.
3. Update `packages/ax/src/commands/play-answer.ts` to import the manual helper
   and actor from the shared module. Keep its control flow unchanged:
   pending check, FoH bank, Fabro submit, make-a-play fact append, response.
4. In `packages/ax/src/commands/play.ts`, after fixture and explicit input
   resolution, capture the resolved Front-of-House bundle path when
   `options.playId === "front-of-house-walk"`. This should be `inputs.bundle`,
   already made absolute by fixture resolution or supplied by `--input`.
5. In the reactions `submit` callback, before `submitFabroAnswer`, call the
   shared core banker only for `front-of-house-walk`, passing `playRunId`,
   `fabroRunId`, `questionId`, `spec`, `cwd: projectRoot`, and the resolved
   bundle path. If banking fails, do not call `submitFabroAnswer`.
6. Leave the make-a-play `appendReviewGateConfirmedFact` branch in place after
   successful Fabro submission. Do not run it for failed or unsubmitted FoH
   banking attempts.
7. Add or update tests that prove the shared helper writes an event and receipt
   identical in shape to the existing manual path. Normalize event id and
   timestamp only; actor, idempotency key, payload keys, payload values, and
   receipt keys should match.
8. Add a scripted FoH test that stages a current item, feeds a reaction through
   the scripted submit path, and asserts the receipt exists before the fake
   Fabro submit is observed.
9. Add the full small-el2 scripted walk test. The test should run:

   ```bash
   ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json
   ```

   It should assert exit `0`, JSON `status: "completed"`,
   `reactionsAnswered: 4`, one answer receipt per answered gate, one
   `library.front_of_house.answer_recorded` event per gate, and a residual-gap
   artifact/event for the held reaction.
10. Add a make-a-play regression test for a reactions run at the current review
    level. Assert existing review-gate fact behavior remains and no
    `library.front_of_house.answer_recorded` event or
    `runtime/front-of-house/answers` directory is created.
11. Add a negative FoH reactions test with fewer reactions than pending gates.
    Assert nonzero exit, JSON `status: "exhausted"`, a useful `message`, and no
    silent completion.
12. Run the deterministic verification commands. If plugin files were touched,
    run plugin validation and follow the conditional eval-impact row.

## Acceptance / Exit Criteria

1. `ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json` reports `status: "completed"` and `reactionsAnswered: 4` with a working ACP adapter.
2. Each answered Front-of-House gate creates exactly one
   `library.front_of_house.answer_recorded` Ledger event with actor
   `{ kind: "user", host: "claude-code", name: "Director" }` and the existing
   payload shape.
3. Each answered Front-of-House gate writes one receipt under
   `runtime/front-of-house/answers/<questionId>.json` with the same receipt
   fields as the manual `ax raven answer` path.
4. Scripted FoH banking and manual `ax raven answer` banking are shape-equal
   modulo generated event ids and timestamps.
5. The small-el2 fixture's fourth "hold" reaction still produces
   `library.front_of_house.residual_gap_recorded` and a `RESIDUAL-GAPS.md`
   entry; scripted reactions do not force-resolve the held item.
6. A non-FoH reactions run, including make-a-play at its current review level,
   has no FoH answer events, no FoH answer receipts, and unchanged existing
   make-a-play review-gate behavior.
7. A FoH reactions file with fewer reactions than gates fails cleanly with
   nonzero exit and JSON `status: "exhausted"` rather than silently completing.
8. Targeted AX tests, AX typecheck, and AX lint pass. Plugin validation is run
   only if plugin files change.

## Deferred Follow-Ups

1. Issue #536: make one bad patch degrade into a residual instead of killing
   the full walk. This issue only ensures the scripted path supplies the answer
   provenance that patch planning requires.
2. Consider consolidating `observeAlexandriaRuns`, `fetchPendingInterview`, and
   `submitFabroAnswer` test harness seams if future CLI work needs more
   end-to-end fake Fabro coverage.
3. If the full small-el2 test initially requires a live ACP adapter, replace it
   with a deterministic fake ACP/Fabro harness so CI can prove the full walk
   without external model availability.
