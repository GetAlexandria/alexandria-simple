# Issue 348 Technical Plan: EL3 Front-of-House Walk

## Header

- Issue reference: `GetAlexandria/alexandria-internal#348`
- Project: Library Rebuild, Phase 2
- Goal: build the EL3 Front-of-House Walk as a Raven-mediated, asynchronous Product / Library Operations play that consumes an EL2 draft library bundle and produces a director-confirmed draft bundle, director-answer Ledger events, and an explicit residual-gap list.
- Plan path: `docs/alexandria/plans/library-elicitation-plays/plan.md`
- Blocked by: EL2 Back-of-House Walk Gate 1 reconciliation, which supplies the Small-floor draft bundle, `STAGE-2-BRIEF.md`, and `HOT-SPOTS.md`.
- Blocks: EL4 Empty Library Confirm and the EL5 atomizer re-point.
- Runtime precedent: shipped Raven Vision collaboration plus `studio/plays/frame-the-problem/` non-blocking human-input unit and wake loop.

## Linked Product-Plan Summary

The library elicitation chain remains:

1. EL1 Source Sweep gathers product inputs and emits a manifest.
2. EL2 Back-of-House Walk reads the source and emits a draft empty-library bundle plus `EVENTS.md`, `STAGE-2-BRIEF.md`, `HOT-SPOTS.md`, and `READ-COHERENCE.md`.
3. EL3 Front-of-House Walk, this issue, walks the Stage-2 brief and Hot Spots with the director at section/shape altitude.
4. EL4 confirms the empty library as a gate before atomization.
5. EL5 atomizes source material onto the confirmed shelves.
6. EL6 handles living updates later.

EL3 is not a card-body fill play. It confirms and corrects the customer/product-facing structure that EL2 could not infer: context boundaries, names, planes, relationships, bets, product language, and unresolved Hot Spots. The director is ground truth. Where source and director disagree, the director's answer wins and the Ledger event is the source of record.

## Scope

This slice lands the core EL3 capability:

- Add a runnable `front-of-house-walk` play to the shipped Alexandria plugin and AX play manifest.
- Add Studio design/catalog records for the EL3 play under Product -> Library Operations, fronted by Raven, with PlaymakerStudio recorded only as provenance.
- Launch EL3 detached through `ax run front-of-house-walk --input bundle=... --json` using the existing non-blocking play runtime.
- Drive one Stage-2 question or Hot Spot at a time through `play.human_input_requested` wakes, with Raven mediating in Claude Code and answering through `ax raven answer`.
- Record every director answer as a validated Ledger event with `actor.kind = user`.
- Record Raven's presented agenda item / mediation turn as a Ledger event with `actor.kind = agent`.
- Convert answered agenda items into validated bundle patches that may update only `context`, `prefLabel`, `plane`, and relationships on affected stub cards.
- Preserve Brick 0 Small-floor frontmatter on every touched card.
- Emit `RESIDUAL-GAPS.md` listing every Stage-2 question or Hot Spot that was not answered or not resolved.
- Add deterministic tests for detached launch, pending human input, resume, ledger events, bundle write-back, residual gaps, and negative no-silent-fill behavior.
- Add product-skill eval coverage for Raven's Front-of-House mediation behavior, because this introduces a new user-facing guided play skill.

## Non-Goals

- Do not fill card bodies. EL5 owns WHAT/WHY/WHEN/HOW body population.
- Do not harden per-noun identity. EL4.5 / noun hardening is a separate altitude.
- Do not write directly to `docs/alexandria/library/` as part of this planning work.
- Do not introduce a blocking `--interactive` live path for EL3. The generic `ax run --interactive` option may continue to exist for other dry-run uses, but EL3's shipped Raven path must not depend on it.
- Do not build the EL4 visual confirmation gate or a new Viewer UI for EL3 in this slice.
- Do not generalize the whole library mutation system. This slice needs the narrow EL3 bundle patcher and its validation rules.
- Do not re-point the atomizer or run conan/sam/bridget/solomon atomizer evals here.
- Do not treat PlaymakerStudio as the filing home for the play.

## Current Gap

- `docs/alexandria/plans/library-elicitation-plays/plan.md` previously named EL3 conceptually, but did not specify implementation surfaces, events, commands, tests, or evals.
- `studio/plays/back-of-house-walk/` exists and is ready for Gate 1; no `studio/plays/front-of-house-walk/` package exists.
- `studio/plays/registry.js` has EL2 and Product / Library Operations, but no EL3 row.
- `packages/ax/src/domain/plays.ts` has no `front-of-house-walk` play id.
- `packages/alexandria-plugin/workflows/` has no EL3 workflow package.
- `packages/alexandria-plugin/skills/` has Raven Vision and frame-the-problem mediation skills, but no Front-of-House Walk skill.
- The generic runtime already emits `play.human_input_requested`, `play.human_input_resolved`, and `play.status_observed`, and `ax raven answer` can resume a pending Fabro human gate, but the answer text is not itself banked as a user-authored Ledger event.
- Existing library catalog code can read Small-floor-ish card frontmatter for display, but there is no deterministic EL3 bundle patcher that validates director-answer provenance before changing stub card values.
- There are no checked-in EL3 fixtures, dry runs, deterministic tests, or eval cases.

## Architectural Boundaries

- Plugin owns the guided behavior:
  - `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/*`
  - updates to `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md` and `ax-start/SKILL.md` only where wake routing must recognize EL3.
- AX owns deterministic support:
  - play manifest registration
  - state event schema validation
  - first-class event append helpers for EL3 answer/turn/patch facts
  - bundle parsing, patch validation, patch application, and residual-gap accounting
  - CLI tests for exit codes and JSON shapes.
- Studio owns play design and catalog state:
  - `studio/plays/front-of-house-walk/brief.md`
  - `studio/plays/front-of-house-walk/risk-map.md`
  - optional `moves.md`, `synopsis.md`, and fixtures once derived/proven
  - `studio/plays/registry.js`
  - `studio/plays/board-state.json`.
- Viewer is out of scope unless implementation changes existing Studio rendering code. If touched, run Viewer tests and keep runtime reads through AX APIs, not direct JSONL or workspace reads.
- Ledger is the durable provenance source. Card `source_evidence` entries may project Ledger event ids, but card frontmatter must not become a second "who said what" record.

## Runtime Contract

EL3 must use the same live-loop shape as frame-the-problem:

1. Raven confirms the current session is connected and wake subscriptions are registered.
2. Raven launches the play detached:

   ```bash
   ax run front-of-house-walk --input bundle=/abs/path/to/el2-bundle --json
   ```

3. The command returns promptly with play and Fabro run ids.
4. The AX runtime bridge observes the Fabro run and emits `play.human_input_requested` when the workflow reaches an agenda item.
5. The wake payload carries `fabroRunId`, `questionId`, `playId`, `playRunId`, and prompt details.
6. Raven reads the current agenda artifact, talks with the director, and sends exactly one agreed answer:

   ```bash
   ax raven answer --run <fabroRunId> --question <questionId> --text-file /abs/path/to/answer.md --json
   ```

7. The resumed workflow records the director answer as a Ledger event with `actor.kind = user`, then plans and applies any validated bundle patch.
8. If no answer arrives, the run stays `needs_human_feedback` / awaiting input. It must not fail because no director was present at launch.

EL3 prompts and skills must explicitly forbid `--interactive`, `--wait`, and `--auto-approve` in the live Raven path.

## Event Contract

Add focused state event types under `packages/ax/src/domain/state-events.ts`:

| Event type | Actor | Required payload | Purpose |
|------------|-------|------------------|---------|
| `library.front_of_house.turn_recorded` | `agent` | `playRunId`, `fabroRunId`, `questionId`, `agendaItemId`, `agendaItemKind`, `prompt`, `evidenceRefs` | Raven presented a Stage-2 question or Hot Spot with the evidence context. |
| `library.front_of_house.answer_recorded` | `user` | `playRunId`, `fabroRunId`, `questionId`, `agendaItemId`, `agendaItemKind`, `answerText` | Durable director answer. This is the required provenance for any director-attributed card correction. |
| `library.front_of_house.bundle_patch_applied` | `process` | `playRunId`, `bundlePath`, `patchId`, `answerEventId`, `touchedCardPaths`, `contentHash` | Deterministic record that a validated patch changed bundle files. |
| `library.front_of_house.residual_gap_recorded` | `process` | `playRunId`, `bundlePath`, `agendaItemId`, `agendaItemKind`, `reason` | A Stage-2 question or Hot Spot was left unresolved and carried to `RESIDUAL-GAPS.md`. |

Implementation details:

- Extend `ALEXANDRIA_STATE_EVENT_TYPES`, schema descriptors, payload schemas, and append validation.
- Use stable idempotency keys: `foh:turn:<playRunId>:<agendaItemId>`, `foh:answer:<playRunId>:<questionId>`, `foh:patch:<playRunId>:<patchId>`, and `foh:residual:<playRunId>:<agendaItemId>`.
- Use `actor.kind = user` only for director answer events. Raven turn events use `actor.kind = agent`, `host = claude-code`, `name = Raven`.
- Keep existing `play.human_input_*` lifecycle events unchanged; they describe runtime state, not answer provenance.

## Bundle Patch Contract

Add a narrow EL3 bundle domain module in AX. It should parse the EL2 bundle, Stage-2 brief, Hot Spots, card frontmatter, and relationship blocks without modifying card bodies.

Patch file shape:

```json
{
  "schemaVersion": 1,
  "patchId": "stage2-Q1-001",
  "agendaItemId": "stage2:Q1",
  "answerEventId": "<ledger-event-id>",
  "resolution": "resolved",
  "cardUpdates": [
    {
      "cardPath": "runtime/agents/Agent - Raven.md",
      "set": {
        "prefLabel": "Raven",
        "context": "Product Management",
        "plane": "Product"
      },
      "relationships": {
        "related_to": ["Role - Director"]
      }
    }
  ]
}
```

Validation rules:

- `answerEventId` must exist in the Ledger and reference a `library.front_of_house.answer_recorded` event whose actor is `user`.
- `agendaItemId` must match the answer event.
- `cardPath` must resolve inside the EL2 bundle.
- Updates are limited to `context`, `prefLabel`, `plane`, `status`, and structured relationship lists. `status` may move only from draft/stub-like values to director-confirmed draft wording agreed in the brief.
- Required Small-floor fields `type`, `prefLabel`, `context`, `plane`, and `status` must still exist after the write.
- Card bodies must not be filled or rewritten except for preserving existing content.
- A director-attributed frontmatter value must either be supported by the referenced answer event or be rejected.
- If an agenda item has no answer event, it may only produce a residual gap, never a card update.

`RESIDUAL-GAPS.md` should be generated from the agenda ledger/accounting pass, not hand-maintained. It must list every unresolved item with `agendaItemId`, title, kind (`stage2_question` or `hot_spot`), reason, and any source evidence refs from EL2.

## Workflow Shape

Create `packages/alexandria-plugin/workflows/front-of-house-walk/` with a small-loop workflow:

```text
prepare_agenda
  -> draft_raven_turn
  -> director_review
  -> record_answer
  -> plan_bundle_patch
  -> apply_bundle_patch
  -> next_item
  -> finalize_accounting
  -> exit
```

Move contracts:

- `prepare_agenda`: reads `bundle`, `STAGE-2-BRIEF.md`, and `HOT-SPOTS.md`; emits `runtime/front-of-house/agenda.json` with stable item ids for every question and Hot Spot.
- `draft_raven_turn`: writes `runtime/front-of-house/current-item.md` and `runtime/front-of-house/for-raven.md`; appends `library.front_of_house.turn_recorded`.
- `director_review`: human-input unit. It asks for the director's answer through Raven and suspends. No blocking terminal prompt.
- `record_answer`: after resume, appends `library.front_of_house.answer_recorded` with `actor.kind = user`.
- `plan_bundle_patch`: judgment step that turns the answer into a structured patch or marks the item unresolved. It must cite the answer event id.
- `apply_bundle_patch`: deterministic command/tool step that validates and applies the patch or records a residual.
- `next_item`: chooses the next unresolved agenda item; loops until every Stage-2 question and Hot Spot is resolved or residual.
- `finalize_accounting`: writes `RESIDUAL-GAPS.md`, copies/updates any run reports, and fails if any agenda item is neither resolved nor residual.

The workflow should include a bounded loop backstop. If the agenda loop exceeds the number of agenda items plus a small retry allowance, fail with a diagnostic rather than silently skipping items.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Studio EL3 design | `studio/plays/front-of-house-walk/brief.md`, `risk-map.md`, optional `moves.md` / `synopsis.md` | Defines the EL3 play contract, proof spec, residual-gap rules, and no-body-fill boundary |
| Studio catalog and board | `studio/plays/registry.js`, `studio/plays/board-state.json` | Adds EL3 under Product / Library Operations, fronted by Raven; tracks production status without treating PlaymakerStudio as filing |
| Plugin workflow | `packages/alexandria-plugin/workflows/front-of-house-walk/*` | Adds the runnable Fabro workflow and prompt files for the async agenda loop |
| Plugin Raven skill | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | Teaches Raven how to launch detached, handle wakes, read current agenda artifacts, mediate with the director, and answer gates |
| Plugin wake guidance | `packages/alexandria-plugin/skills/ax-start/SKILL.md`, `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md`, monitor wrapper tests if needed | Routes `front-of-house-walk` human-input wakes to the new skill and documents new Ledger event meanings |
| AX play manifest | `packages/ax/src/domain/plays.ts` | Adds `front-of-house-walk` to `PlayId`, `PLAY_MANIFEST`, required inputs, and workflow paths |
| AX event schema | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Adds validated EL3 event types and schema-document output |
| AX bundle domain | new `packages/ax/src/domain/library-front-of-house.ts` and/or effects module | Parses agenda, validates patch provenance, applies allowed frontmatter/relationship updates, writes residual gaps |
| AX CLI/runtime tests | `packages/ax/tests/*front-of-house*.test.ts`, `run-bridge.test.ts`, `play-answer.test.ts`, `cli.test.ts` as needed | Verifies detached launch, resume, ledger, patching, residuals, exit codes, and JSON output |
| Plugin validation | `packages/alexandria-plugin/tests/claude-monitor-wrapper.test.ts` if subscriptions change | Keeps packaged plugin and monitor behavior valid |
| Eval harness | new front-of-house eval case and baseline paths when harness directories are present | Covers Raven's user-facing mediation behavior |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Raven Front-of-House skill | New product-facing skill for EL3 launch and wake handling | Add adaptive eval case; update event-log and ax-start routing; plugin validation |
| Alexandria event-log skill | Recognizes EL3 answer, turn, patch, and residual events | Update examples and "do not edit JSONL directly" guidance |
| AX deterministic CLI | Adds play registration, event schemas, and bundle patch support | Add black-box command tests for JSON, exit codes, invalid patches, and missing answer events |
| Studio play behavior | New play design and catalog filing | Run Studio catalog checks and keep Product / Library Operations filing |
| Viewer | No planned behavior change | Run Viewer tests only if implementation touches Viewer code |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX unit and CLI tests | `cd packages/ax && bun test tests/events.test.ts tests/run-bridge.test.ts tests/play-answer.test.ts tests/play-run-input.test.ts tests/cli.test.ts` | Protects existing runtime bridge, answer command, schemas, and CLI behavior |
| EL3 domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Verifies agenda parsing, patch validation, no-silent-fill, and residual generation |
| Runtime server regression | `cd packages/ax && bun test tests/runtime-server.test.ts tests/claude-monitor.test.ts` | Guards runtime event append/projection and wake delivery if touched |
| Studio catalog | `node studio/tools/check-catalog.mjs` | Confirms Product / Library Operations filing and no retired catalog fields |
| Studio play conformance | `node studio/tools/check-play-conformance.mjs studio/plays/front-of-house-walk` once the check understands EL3, or the equivalent focused check | Confirms the play declares async unit+wake, residual gaps, and no body fill |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Ensures the shipped plugin package remains valid |
| Plugin monitor tests | `cd packages/alexandria-plugin && bun test tests/claude-monitor-wrapper.test.ts` | Required if wake subscriptions or monitor wrapper behavior changes |
| Detached smoke | `ax run front-of-house-walk --fixture small-el2 --json` with runtime running | Confirms launch returns instead of blocking and the run later reaches awaiting input |
| Scripted resume smoke | `ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json` | Exercises one Stage-2 question and one Hot Spot without live `--interactive` |
| Negative unanswered item | fixture run that leaves one item unanswered | Confirms residual gap output and no card mutation for the unanswered item |
| Viewer checks | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run check` only if Viewer code changes | Viewer is out of scope unless touched |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|---------------------|
| New `front-of-house-walk` Raven skill | No checked-in EL3 eval exists | Create at least one adaptive eval case for Raven mediating a small EL2 bundle agenda | `pnpm eval -- run front-of-house-walk/all` after the case exists |
| Existing Raven / event-log behavior | Raven Vision and frame-the-problem guidance are precedents, not EL3 coverage | Rerun Raven-related evals if existing `raven/all` cases are available after skill/event-log edits | `pnpm eval -- run raven/all` when listed by `pnpm eval -- list`; otherwise document absence in implementation notes |
| AX deterministic runtime | Covered by Bun tests, not LLM evals | No LLM eval required | AX tests listed above |
| Studio play design docs | No eval-harness coverage by default | No LLM eval required for design docs; use Studio conformance and Director Gate review | `node studio/tools/check-catalog.mjs` and focused play conformance |
| Atomizer / EL5 | Existing downstream conan/sam/bridget/solomon eval plans belong to EL5 | Defer | No atomizer eval rerun in EL3 |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| EL3 reintroduces a blocking human prompt and deadlocks detached runs | Use only Fabro human-input units surfaced by the AX run bridge; Raven skill forbids `--interactive`, `--wait`, and `--auto-approve`; add detached and unanswered-run tests |
| Director answers resume the play but are not durably banked | Make `record_answer` a required post-gate workflow step; final accounting fails if an answered item lacks `library.front_of_house.answer_recorded` |
| Cards receive director-attributed values without a user event | Bundle patcher rejects any patch whose `answerEventId` is missing, not a user event, or mismatched to the agenda item |
| Agent fills card bodies while trying to be helpful | Patch schema excludes body fields; tests seed body text and assert it is unchanged; skill and prompts name EL5 as body owner |
| Residual gaps are silently dropped at the end of a long agenda | `finalize_accounting` compares the full agenda to resolved and residual events; tests leave an unanswered item and assert `RESIDUAL-GAPS.md` contains it |
| Source evidence and Ledger provenance split into two sources of truth | Cards may reference Ledger event ids in `source_evidence`, but event payloads remain the durable answer text and actor record; no separate director-provenance prose fields |
| Relationship updates corrupt card frontmatter | Add focused parser/writer tests for nested `links` blocks and Small-floor preservation; fail closed on unknown patch fields |
| EL3 filing drifts into PlaymakerStudio because the play is built there | Registry row uses Product / Library Operations; brief records built-by provenance only; catalog checks reject retired built-by filing fields |
| Dynamic agenda loop loses place across wakes | Persist `agenda.json`, current item, and per-item status under `runtime/front-of-house/`; use stable agenda ids and idempotency keys |
| Follow-up-question generation becomes too broad for the core slice | Implement one focused Raven prompt per agenda item first; defer richer sub-agent question generation and k~30 sampling discipline to child issues |

## Implementation Steps

1. Create `studio/plays/front-of-house-walk/` with a brief, risk map, and initial fixtures describing the EL2 bundle input, agenda loop, answer Ledger events, bundle patch rules, and residual-gap output.
2. Register `front-of-house-walk` in `studio/plays/registry.js` as `EL3`, Product / Library Operations, `fronted by Raven` via the Product division face, with PlaymakerStudio provenance only in the brief.
3. Add the play to `studio/plays/board-state.json` at the appropriate pre-live stage for implementation, without claiming it is proven or live until workflow validation and proof pass.
4. Add `front-of-house-walk` to `packages/ax/src/domain/plays.ts` with required input `bundle` and workflow path `workflows/front-of-house-walk/workflow.fabro`.
5. Add EL3 state event schemas and schema-document descriptors to `packages/ax/src/domain/state-events.ts`; extend event tests for valid and invalid payloads.
6. Add the EL3 bundle domain:
   - parse agenda from `STAGE-2-BRIEF.md` and `HOT-SPOTS.md`;
   - parse and write card frontmatter/relationship blocks;
   - validate patch files against user answer events;
   - apply allowed updates only;
   - generate `RESIDUAL-GAPS.md`.
7. Add narrow AX commands or internal command-node helpers for `record_answer`, `apply_bundle_patch`, and `finalize_accounting`, returning stable JSON and exit codes.
8. Build `packages/alexandria-plugin/workflows/front-of-house-walk/`:
   - `workflow.fabro`;
   - prompts for agenda prep, Raven turn drafting, patch planning, and final accounting;
   - any command nodes needed for deterministic validation/write-back.
9. Add `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`:
   - connection safeguard;
   - detached launch instructions;
   - wake handling for `play.human_input_requested` with `playId = front-of-house-walk`;
   - answer routing through `ax raven answer`;
   - never-self-answer and no-`--interactive` rules.
10. Update `ax-start` and `alexandria-event-log` guidance to route EL3 wakes and explain the new event types.
11. Add fixtures:
   - `small-el2` with one Stage-2 question, one Hot Spot, two stub cards, and a reactions file;
   - `unanswered-gap` where one item remains unanswered;
   - `invalid-director-patch` where a card update lacks a matching user event.
12. Add AX tests for event schemas, patch validation, Small-floor preservation, residual generation, and CLI JSON/exit codes.
13. Add plugin tests or update monitor wrapper tests if wake subscription behavior changes.
14. Add a product-skill eval case for Raven's EL3 mediation; run it or document why the harness is unavailable in the implementation handoff.
15. Run deterministic verification and plugin validation; record any skipped checks with reasons.

## Acceptance / Exit Criteria

1. `ax run front-of-house-walk --input bundle=<fixture> --json` launches detached and returns without waiting for director input.
2. An unanswered agenda item leaves the run awaiting input / `needs_human_feedback`, not failed due to no launch-time director.
3. A Raven-mediated answer through `ax raven answer` resumes the workflow.
4. Each director answer has a `library.front_of_house.answer_recorded` Ledger event with `actor.kind = user`.
5. Raven's presented turn has a `library.front_of_house.turn_recorded` Ledger event with `actor.kind = agent`.
6. The updated bundle reflects director-confirmed `context`, `prefLabel`, `plane`, and relationship changes on affected cards.
7. Touched card frontmatter still contains the Small-floor fields `type`, `prefLabel`, `context`, `plane`, and `status`.
8. Every Stage-2 question and Hot Spot is accounted for as resolved with a user answer event or listed in `RESIDUAL-GAPS.md`.
9. Negative no-silent-fill passes: an unanswered Stage-2 item does not change any card and appears on the residual-gap list.
10. Negative provenance passes: no director-attributed card update is accepted without a matching user answer event.
11. The play resolves in Studio catalog as Product / Library Operations, fronted by Raven; PlaymakerStudio is provenance only.
12. Plugin validation and targeted AX tests pass.
13. Eval impact is handled: a new front-of-house eval exists and is run, or the implementation handoff documents why the eval harness was unavailable.

## Deferred Follow-Ups

1. Rich follow-up-question generation sub-agent beyond the first focused Raven prompt per agenda item.
2. k~30 per-product sampling/proof discipline for stochastic agenda quality and patch quality.
3. Viewer surface for reviewing EL3 progress or residual gaps.
4. EL4 Empty Library Confirm gate and empty-library catalog rendering.
5. EL4.5 noun hardening.
6. EL5 atomizer re-point to consume the director-confirmed bundle.
7. Generalized library mutation/provenance projection beyond this EL3 bundle patcher.
8. Broader YAML/frontmatter parser extraction if later library workflows need the same write path.
