# Issue 341 Technical Plan - make-a-play

Status: draft for approval
Issue: <https://github.com/GetAlexandria/alexandria-internal/issues/341>
Run ID: `01KVTZ7C9R47PF64ZQ9ZPDJXE4`
Plan path: `docs/alexandria/plans/playmaker-testing-streamline/plan.md`

## Goal

Build the self-hosting `make-a-play` meta-play so play production is itself a
three-module play:

- `ax run make-a-play:design`
- `ax run make-a-play:build`
- `ax run make-a-play:prove`

The play files under `Alexandria_Prime -> PlaymakerStudio -> Production`,
fronted by William. It must not appear in Product's golden-path chain, and
`built-by` provenance must be a Ledger fact, not a catalog or play filing field.

The implementation must keep the two human touch points explicit:

- Gate 1: confirm the design and the section 4 move graph, including each doer
  tag.
- Gate 2: the Prove module's auto-advance contract, with humans seeing only held
  exceptions and the failing condition for each hold.

## Sources Read

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `EVALS.md`
- `packages/ax/CLAUDE.md`
- `packages/ax/README.md`
- `packages/ax/docs/cli-design-principles.md`
- `packages/alexandria-plugin/CLAUDE.md`
- `packages/alexandria-plugin/README.md`
- `packages/viewer/README.md`
- `studio/README.md`
- `studio/plays/README.md`
- `studio/plays/make-a-play/brief.md`
- `studio/plays/frame-the-problem/brief.md`
- `studio/plays/frame-the-problem/risk-map.md`
- `studio/plays/TESTING.md`
- `studio/plays/PROJECTION.md`
- `studio/plays/AUTHORING.md`
- `studio/plays/RUNTIME.md`
- `studio/plays/research/testing/RISKS.md`
- `docs/alexandria/plans/studio-fixes/org-model.md`
- `docs/alexandria/plans/studio-fixes/studio-operations-quality-plan.md`
- `docs/alexandria/plans/335-studio-catalog-division-function/plan.md`
- `docs/alexandria/plans/337-play-re-sync/plan.md`
- current `registry.js`, `board-state.json`, Board model/UI, `bank.sh`, and
  `ax run` implementation.

`gh` is not installed in this environment, and tool discovery exposed only
GitHub comment-write tools, not issue-read tools. This plan uses the full issue
body supplied in the dispatch plus the local recovered brief and repo artifacts.

## Predecessor Plan Summary

This file previously held the broader `playmaker-testing-streamline` plan. Its
early waves have largely landed: placeholder conformance, output discipline,
banking, Board work-order cards, and Play Re-sync support exist in the repo.

For #341, this plan narrows the active implementation target to F8:
`make-a-play`. The older streamline work is treated as substrate, not as open
scope to rebuild.

## Scope

- Reconcile the recovered `studio/plays/make-a-play/brief.md` with the
  Company -> Division -> Function org model before Gate 1.
- Record Gate 1 as a real decision artifact before any workflow package is
  derived.
- Add deterministic validation that every section 4 node carries exactly one
  doer tag from `{judgment, command, human-gate, contract}`.
- Add module play ids to AX so the exact commands are valid:
  `make-a-play:design`, `make-a-play:build`, and `make-a-play:prove`.
- Add three workflow packages for the module runs, sourced from the Studio play
  and banked into `packages/alexandria-plugin`.
- Extend Studio banking/conformance only as needed for module subdirectories.
- Make the Board render Design / Build / Prove section headers over the existing
  six stages, without collapsing the underlying stage schema unless Gate 1
  explicitly rules otherwise.
- Make `make-a-play` board-visible as a Studio production card while keeping it
  out of Product's golden-path chain.
- Implement the Prove auto-advance contract as deterministic code that evaluates
  the five `TESTING.md` conditions:
  `tier-bar`, `proof-spec`, `no-unclassified-failure`, `no-regression`, and
  `independent-grade`.
- Add held-queue output that lists only held cards and the failing condition or
  conditions for each card.
- Add a Ledger provenance event for `built-by`, emitted when a produced play is
  registered live.
- Prove the contract against the `frame-the-problem` exemplar so it routes to
  held, not proven, because its current record is N=1 smoke/provisional with
  known open cracks.

## Non-Goals

- Do not build William's coin, onboarding, or PlaymakerStudio library.
- Do not implement F7 Review Levels.
- Do not implement F9 Curator.
- Do not redesign Play Re-sync; use the current Re-sync substrate where useful.
- Do not rewrite the `TESTING.md` or `RISKS.md` canon. Operationalize it only.
- Do not move Product plays into PlaymakerStudio because William built them.
- Do not add `built-by`, `builtBy`, or equivalent provenance fields to catalog
  records, play frontmatter, or produced play records.
- Do not write to `docs/alexandria/library/`.

## Current Implementation Gap

The repo now has a recovered brief at `studio/plays/make-a-play/brief.md`, and
the catalog already contains a PlaymakerStudio / Production seed row for
`make-a-play`. That row points at `README.md`, uses `prio: "studio"`, and is
excluded from the production Board. The brief itself is still pre-Gate-1 and
still refers to older framing such as `frame-the-problem-next`.

AX currently accepts only play ids present in `PLAY_MANIFEST`, and the manifest
contains `frame-the-problem`, `source-assessment`, and
`vision-prerequisite-placeholder`. The module commands in the issue therefore do
not parse or run yet.

The plugin contains workflow packages for existing plays, but not the three
`make-a-play` module workflows. `bank.sh` assumes a single root
`workflow.fabro` and `prompts/` per Studio play, so it cannot yet bank a
three-module workflow package from one play directory.

The Board still renders six stage columns directly. It has enough data model
support for work-order cards, but no Design / Build / Prove banding and no
board-visible Studio production card for `make-a-play`.

The Ledger schema has play lifecycle and human-input events, but no provenance
event for "this produced play was built by this factory." That fact cannot be
recorded in the intended place until a new validated event type is added.

The risk-map parser and measurement policy exist in the Viewer Studio testing
surface, but the Prove auto-advance contract does not exist as deterministic AX
behavior.

## Architecture Boundaries

- `packages/alexandria-plugin` owns guided play behavior and the banked workflow
  packages. The three module workflows and any minimal make-a-play guidance
  belong there after derivation.
- `packages/ax` owns deterministic CLI behavior: parsing module play ids,
  running workflows, evaluating the auto-advance contract, emitting validated
  Ledger events, and returning stable JSON/exit codes.
- `studio/` remains the authoring and review source for play briefs, Board
  state, derived renderings, and Studio-only conformance tools.
- `packages/viewer` should not receive duplicate AX domain models. Only touch it
  if the implementation reuses or moves the risk-map measurement parser; static
  Studio Board changes live under `studio/`.
- The catalog filing key stays `division` plus `function`; the face agent is
  derived from the division. Built-by stays on the Ledger.
- Human gates must follow the runtime contract: non-blocking and event-sourced
  for detached runs, never a hidden self-answer.

## Data And State Contracts

### Catalog

Update the `make-a-play` catalog row so it points at
`make-a-play/brief.md`, files as:

```text
division: PlaymakerStudio
function: Production
face: William (derived)
```

Make this row board-visible without making every `prio: "studio"` seed
board-visible. Preferred v1 shape: add an explicit board visibility flag, for
example `board: true`, and update `appearsOnBoard()` to include that row while
continuing to exclude the F7/F9/Re-sync design seeds.

### Board

Keep the canonical stage keys:

```text
backlog -> sourced -> designed -> built -> proven -> live
```

Render them under module bands:

```text
Design: backlog, sourced, designed
Build: built
Prove: proven, live
```

The Board-banding sub-decision remains a Gate 1 detail. The implementation
should preserve the six-stage schema unless Gate 1 explicitly approves a
different shape.

### Gate Records

Add a durable Gate 1 record before build can proceed. Use a small artifact under
the play directory, for example:

```text
studio/plays/make-a-play/gates/gate-1.json
```

Minimum fields:

```json
{
  "gate": "gate-1",
  "play": "make-a-play",
  "decision": "approved",
  "decidedAt": "YYYY-MM-DD",
  "decidedBy": "director",
  "approvedDoerTags": {
    "ground": "judgment"
  },
  "notes": "..."
}
```

`make-a-play:build` must refuse with exit code 2 if the Gate 1 approval record
is missing or not approved.

### Module State And Idempotency

Each module writes a module report under the play directory, keyed by module and
target slug:

```text
studio/plays/make-a-play/runs/<target-slug>/<module>.json
```

The report records the module, target play, input stage, output stage, run id,
created/updated timestamp, and artifact paths. Re-running a module when the
target is already at the module's resting stage should be a no-op with JSON
`"noOp": true`, not a duplicate stage advance.

### Ledger Provenance

Add a new validated event type, tentatively `play.provenance_recorded`, with a
payload like:

```json
{
  "playId": "produced-play",
  "factoryDivision": "PlaymakerStudio",
  "factoryFunction": "Production",
  "factoryAgent": "William",
  "producedByPlayId": "make-a-play",
  "playRunId": "..."
}
```

Use an idempotency key derived from produced play id plus module run id so a
retry does not append duplicate provenance. The produced play record and catalog
record must not gain any `built-by` field.

## Module Contracts

### Design: `ax run make-a-play:design`

On-screen phases:

```text
Ground -> Draft -> Harden -> Gate 1
```

Resting stage:

```text
designed
```

Behavior:

- Reads the target slot, source canon, and recovered brief.
- Reconciles the brief to the org model:
  PlaymakerStudio / Production, William-fronted, not Product/Raven.
- Updates stale references such as `frame-the-problem-next` to the current
  canonical `frame-the-problem` exemplar where appropriate.
- Validates the section 4 move graph shape and exact doer tags.
- Emits or refreshes `research/grounding.md`, `hardening.md`, and the Gate 1
  review packet.
- Moves the card to `designed` and marks it ready for Gate 1 review.
- Does not derive `workflow.fabro`, prompts, plugin workflow files, or live
  manifest entries before the Gate 1 approval record exists.

### Build: `ax run make-a-play:build`

On-screen phases:

```text
Derive -> Lint -> Fixtures -> Register-to-run
```

Resting stage:

```text
built
```

Behavior:

- Refuses unless Gate 1 is approved.
- Derives the three module workflow packages and their prompts from the
  approved section 4 graph and section 6 language.
- Runs Protocol A-E parity checks plus placeholder, workflow-edge, and move
  coverage checks.
- Bounces closed-rule lint failures inside the module run. These do not become
  human gates.
- Authors/seeds fixtures and risk-map material needed to prove the meta-play,
  including the `frame-the-problem` exemplar fixture and negative/idempotent
  cases.
- Registers the module workflows as run-enabled but not yet live/proven.
- Rests the card at `built`.

### Prove: `ax run make-a-play:prove`

On-screen phases:

```text
Run -> Grade -> Write-back -> Advance/Hold -> Register-live
```

Resting stage:

```text
proven -> live
```

Behavior:

- Replays the `frame-the-problem` exemplar as the golden regression fixture.
- Runs grading independently from the authoring run. The contract must record
  grader identity/run id and fail `independent-grade` when independence cannot
  be demonstrated.
- Writes results back to risk-map/run records through deterministic tooling, not
  hand transcription.
- Evaluates the five auto-advance conditions:
  - `tier-bar`
  - `proof-spec`
  - `no-unclassified-failure`
  - `no-regression`
  - `independent-grade`
- Routes all-pass cards to `register_live` with tag `auto` and probationary
  provenance.
- Routes any miss to held with the failing condition names.
- Emits no held item for a card with no surfaced failure.
- Emits the `play.provenance_recorded` Ledger fact only when registering live.

## Auto-Advance Contract

Implement the contract as deterministic AX-domain code, not as prompt prose.

Inputs:

- target play id
- target tier / required bar
- risk-map coverage rows
- eval-plan rows
- grade report rows
- baseline result summary
- author run identity
- grader run identity

Output JSON:

```json
{
  "play": "frame-the-problem",
  "decision": "held",
  "tag": "held",
  "conditions": {
    "tier-bar": {
      "pass": false,
      "reason": "N=1 smoke is below required estimate/ship gate"
    }
  },
  "failingConditions": ["tier-bar"],
  "held": [
    {
      "play": "frame-the-problem",
      "conditions": ["tier-bar"],
      "reason": "..."
    }
  ]
}
```

Rules:

- A stochastic row with `runs < target` cannot satisfy `tier-bar`.
- Any coverage state `gap` for an applicable risk fails `proof-spec`.
- Any `partial` row with an unclosed known crack fails `proof-spec` unless the
  proof spec explicitly allows probationary live for that crack.
- Any grade item classified as `unclassified` fails
  `no-unclassified-failure`.
- Any result below the stored baseline fails `no-regression`.
- Missing or matching author/grader identity fails `independent-grade`.
- All conditions must pass to auto-register live.

The first fixture for this contract is the current `frame-the-problem` record.
Expected result: held, not proven.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX play manifest | `packages/ax/src/domain/plays.ts` | Add `make-a-play:design`, `make-a-play:build`, `make-a-play:prove`; include tracker legs and fixture dirs as needed |
| AX run parser/tests | `packages/ax/src/commands/play.ts`, `packages/ax/tests/ax.integration.test.ts` | The three module ids parse, run, return stable JSON, and reject invalid modes/inputs consistently |
| AX auto-advance | new `packages/ax/src/domain/make-a-play-*` modules | Deterministic stage/idempotency/doer-tag/advance-contract evaluation |
| AX event schema | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Add validated built-by provenance event |
| Plugin workflows | `packages/alexandria-plugin/workflows/make-a-play/...` | Banked module workflow packages |
| Plugin skill guidance | optional minimal `packages/alexandria-plugin/skills/make-a-play/SKILL.md` | Guides William/maintainer behavior around Gate 1 and held exceptions without building a coin |
| Studio source play | `studio/plays/make-a-play/**` | Approved brief, module source workflows/prompts, fixtures, risk-map, gate records, run reports |
| Studio banking | `studio/tools/bank.sh` or sibling module-aware bank helper | Bank three module workflow packages from one Studio play |
| Studio catalog | `studio/plays/registry.js`, `studio/tools/check-catalog.mjs` | `make-a-play` points to its brief, is board-visible, and remains PlaymakerStudio / Production |
| Studio Board | `studio/plays/board.html`, `board-ui.js`, `board-model.js`, `board-state.json`, `check-board-state.mjs` | Render Design / Build / Prove bands over six stages; include the make-a-play card and testing card |
| Studio conformance | new `studio/tools/check-make-a-play-graph.mjs` or equivalent | Enforce doer tags, Gate 1 state, no pre-gate derivation, no built-by filing field |

## Changed Behavior Surfaces For Agents And Skills

| Surface | Change | Downstream updates |
|---|---|---|
| William / make-a-play guidance | A minimal shipped skill may be added so the human gate and held queue are mediated consistently | Add one eval case if the skill lands; keep it narrow and avoid William coin/onboarding |
| Raven/Product skills | No intended behavior change | No Raven eval reruns unless shared event-log guidance changes |
| AX CLI | New module play ids and deterministic contract behavior | Black-box CLI tests for parse, exit codes, JSON fields, idempotency, and fixture behavior |
| Studio maintainers | Board and conformance tools now recognize make-a-play as a real production card | Update Studio docs only where they point to the meta-play or module commands |
| Plugin workflow package | New banked workflows | `claude plugin validate ./packages/alexandria-plugin` |

## Deterministic Tests And Validation

Add or update tests:

```bash
bun test packages/ax/tests/make-a-play.test.ts
bun test packages/ax/tests/ax.integration.test.ts
bun test packages/ax/tests/events.test.ts
bun test packages/ax/tests/fixtures.test.ts
node studio/tools/check-catalog.mjs
node studio/tools/check-board-state.mjs
node studio/tools/check-make-a-play-graph.mjs studio/plays/make-a-play
python3 studio/tools/board-server.test.py
node studio/tools/board-model.test.mjs
claude plugin validate ./packages/alexandria-plugin
pnpm --filter @alexandria/ax run typecheck
pnpm --filter @alexandria/ax run lint
```

If implementation touches `packages/viewer`, also run:

```bash
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run build
```

Black-box cases to cover:

1. `ax run make-a-play:design --json` is a known play id and returns stable
   module/run fields.
2. Design on an empty/pre-Gate-1 card reaches Gate 1, rests at `designed`, and
   creates no workflow package or plugin files before approval.
3. Build refuses with exit code 2 when Gate 1 is missing or unapproved.
4. Build after Gate 1 emits the derived workflow package and rests at `built`.
5. A lint failure bounces inside Build and does not create a held-queue item.
6. Prove against `frame-the-problem` routes to held with named failing
   condition(s), not proven/live.
7. All-pass contract fixture routes to `register_live` and emits one
   provenance event.
8. No-surfaced-failure fixture does not create a held item.
9. Re-running each module at its resting stage is a no-op and does not duplicate
   stage membership, run reports, held items, or Ledger provenance.
10. Catalog/brief/output records reject `builtBy`, `built_by`, and `built-by` as
    filing fields for produced plays.
11. `make-a-play` appears under PlaymakerStudio / Production and not under any
    Product function or golden-path group.
12. Board rendering groups stages under Design / Build / Prove while preserving
    the six canonical stage keys.

## Eval Impact

| Surface | Existing coverage | Required action |
|---|---|---|
| AX deterministic behavior | Existing Bun tests for `ax run`, events, fixtures, and Studio tools | Add deterministic tests; no eval harness needed for these pure CLI paths |
| Plugin workflows | Plugin validation exists; no LLM eval for workflow presence alone | Run plugin validation and the real/fake Fabro smokes listed above |
| New make-a-play skill, if added | No existing eval case | Add `tests/eval-cases/make-a-play/gate-1-basic` and run `pnpm eval -- run make-a-play/all`; compare before merge |
| Existing Raven/frame-the-problem skill | Not changed by default | No rerun unless shared event-log or frame-the-problem skill files change |
| Studio static Board | Deterministic site/server tests | No eval harness; use Board/server tests and a browser smoke if UI markup changes materially |

If the implementation chooses not to add a plugin skill, record that in the PR
and rely on deterministic CLI/workflow tests plus plugin validation.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Derivation happens before Gate 1 approval | Build command refuses without the Gate 1 record; conformance check fails if workflow package files exist before approval |
| Doer tags drift into prose-only assertions | Add a parser/checker over brief section 4 and require exactly one closed-set tag per node |
| `make-a-play` leaks into Product's golden path | Board/catalog visibility is explicit for this one Studio production card; catalog tests assert PlaymakerStudio / Production only |
| Module ids with colons break play id schemas or move ids | Add event schema, run parser, manifest, and tracker tests for colon ids |
| Auto-advance becomes a prompt judgment instead of a contract | Implement it as AX deterministic code with fixture tests for each condition |
| `frame-the-problem` accidentally auto-advances because its smoke result reads like proof | Add a fixture using the current risk-map and assert held on `tier-bar`/open-crack conditions |
| Grade independence is satisfied only on paper | Contract requires distinct grader identity/run metadata and fails closed when absent |
| Held queue becomes a dumping ground | Held entries must name failing conditions; no-failure fixture asserts no held item |
| Built-by becomes a filing field again | Catalog and produced-play checks reject built-by fields; provenance is accepted only as a Ledger event |
| Re-running modules duplicates stages or events | Module reports and Ledger writes use deterministic ids/idempotency keys; tests rerun every module |
| Module banking fights the existing single-workflow bank tool | Extend banking with a module-aware path and keep the original single-workflow behavior covered |

## Implementation Steps

1. Add the make-a-play graph checker and reconcile the recovered brief to the
   current org model and canonical `frame-the-problem` exemplar. Do not derive
   workflow files yet.
2. Add Gate 1 record support and the pre-derive conformance rule.
3. Add AX manifest support for the three module ids and tests that they parse as
   known play ids.
4. Add the module source layout under `studio/plays/make-a-play/` and extend
   banking to copy module workflow packages into the plugin.
5. Build the Design module workflow and deterministic stage/ready updates.
6. After Gate 1 approval is recorded, build the Build module workflow and its
   lint/fixture/register-to-run deterministic nodes.
7. Add the auto-advance contract evaluator and fixtures for all five conditions.
8. Build the Prove module workflow, held queue report, and register-live path.
9. Add the `play.provenance_recorded` event type and wire register-live to emit
   it idempotently.
10. Update Studio catalog and Board rendering so `make-a-play` is board-visible
    under PlaymakerStudio / Production and stages are banded under Design /
    Build / Prove.
11. Add plugin guidance/eval only if the implementation needs a shipped skill to
    mediate Gate 1 and held exceptions.
12. Run the deterministic and plugin validations listed above; run the new eval
    only if a skill is added.

## Acceptance And Exit Criteria

- `make-a-play` is registered under PlaymakerStudio / Production and derives
  face agent William from the division.
- `make-a-play` does not appear in Product's golden-path chain or any Product
  Function catalog group.
- `ax run make-a-play:design`, `ax run make-a-play:build`, and
  `ax run make-a-play:prove` are valid commands with stable JSON output.
- Design rests at `designed`, Build rests at `built`, and Prove routes to
  `proven -> live` only through the contract.
- Gate 1 approval exists before any derived workflow package is produced.
- Every section 4 node has exactly one doer tag from the closed set.
- Prove's contract routes the current `frame-the-problem` exemplar to held, not
  proven.
- Held output names failing conditions and omits cards with no surfaced failure.
- Re-running modules at their resting stages is idempotent.
- Register-live writes one Ledger provenance fact and no play/catalog
  `built-by` filing field.
- Plugin validation and targeted deterministic tests pass.
- Eval rerun is complete if a make-a-play skill is added.

## Deferred Follow-Ups

- William coin and onboarding.
- F7 Review Levels composition on top of the three modules.
- F9 Curator.
- Play Re-sync as a full edit-path play built through make-a-play.
- General arbitrary-target UX beyond the self-hosting/default target path, if
  the v1 needs a narrower launch contract.
- Moving shared Studio risk-map parsing into a dedicated shared package if AX
  and Viewer parser duplication becomes material.
