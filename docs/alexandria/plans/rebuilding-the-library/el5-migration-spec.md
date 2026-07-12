# EL5 — Atomizer Migration Spec

*(**Scoping doc, 2026-06-20.** Read-only inventory + diff. Does not implement.
A future implementer — agent or human — uses this to brick EL5 of
`library-elicitation-plays/plan.md` (which is Brick 5 of
`rebuilding-the-library/plan.md`) safely.)*

## What we're migrating from / to

- **From:** three Fabro builds on `origin/restore-atomic-card-plays` (PR #228,
  reverted off `main` in #235), under `packages/alexandria-next-plugin/
  workflows/`. Their CLI (`ax2 cards …`) lived in `packages/ax-next/`, which
  was promoted to canonical `packages/ax/` at 0.12.0 — but the cards
  subcommand did not come with it. Reference snapshot, not runnable on `main`.
- **To:** three plays re-pointed for **EL5**: input changes from "a frozen
  source + a card budget" to "the EL4-confirmed empty library (shelves +
  Vocabulary lexicon) + the EL1 source-of-truth docs"; triage stops inventing
  categories (no-shelf → gap-report); naming is lexicon-constrained. The
  draft → grade → publish loop inside `build-atomic-card` does not need
  reshape; the contract handed to it does.

Reverse-derived studio docs at `studio/plays/{atomic-card-planning,
atomic-card-creation, build-atomic-card}/` are accurate mirrors of the parked
builds and stay the reference texture.

## Inventory — what exists on the parked branch

Five Fabro files under `packages/alexandria-next-plugin/workflows/`:

| Path | Bytes | Lines | Shape |
|---|---|---|---|
| `atomic-card-planning/workflow.fabro` | 11,623 | 113 | 10 nodes (1 mech goal-gate + 3 judgment LLM + 3 mech validators + 1 mech orchestrator + 1 human hex + 1 mech check); 3 inline prompts |
| `atomic-card-creation/workflow.fabro` | 1,082 | 39 | 3 nodes strictly linear: `validate_plan → execute_plan → verify_plan`; no judgment |
| `build-atomic-card/workflow.fabro` | 10,324 | 81 | 7 nodes (2 judgment LLM incl. structured-output grader + 5 mech commands); 2 inline prompts |
| `build-atomic-card/grading-rubric.md` | 2,487 | n/a | Human mirror of grader's inline rubric |
| `source-assessment/workflow.fabro` | 579 | n/a | Unrelated ACP smoke — **not in EL5 scope** |

Supporting TS on parked branch (`packages/ax-next/src/domain/`):
`atomic-card-build-plan.ts`, `atomic-card-candidate.ts`,
`atomic-card-categories.ts` (hardcoded 10-category enum), `atomic-card-contract.ts`
(~440 lines incl. schemas). CLI: `packages/ax-next/src/commands/cards.ts` and
`tests/cards.test.ts`. All prompts are **inline** via `__AX2_*__` placeholders
(no separate `prompts/<move>.md` files yet — extraction required).

## Calls to migrate (`ax2 cards` → `ax cards`)

Unique subcommands per workflow:

| Workflow | Subcommands |
|---|---|
| `atomic-card-planning` | `verify-source`, `find-range`, `validate-inventory`, `validate-plan`, `execute-plan`, `verify-plan` |
| `atomic-card-creation` | `validate-plan`, `execute-plan`, `verify-plan` |
| `build-atomic-card` | `validate-contract`, `read-range`, `validate-candidate`, `consume-attempt`, `publish`, `child-result` |

**12 distinct subcommands**; literal `ax2 cards` token appears **18 times**
across the three Fabro files (commands invoked from `script=` and also
embedded in agent prompts as self-check instructions).

**New-world status:** per `packages/ax/src/cli/router.ts` on `main`, there is
**no `ax cards` subcommand**. Canonical `ax` ships only `init`, `start`,
`codex`, `run`, `raven`, `inspect`, `doctor`, `version`, `upgrade`. The cards
surface was not promoted at 0.12.0. Migration is **port-then-rename**, not
`s/ax2/ax/`.

**Per-call mapping:** `verify-source` / `find-range` / `read-range` are
pure-functional source primitives — port verbatim;
`validate-{inventory,plan,contract,candidate}` + `verify-plan` are
schema-and-shape validators (port verbatim, but their **schema content** is
what the input-shape change edits — see below); `consume-attempt`, `publish`,
`child-result` are runtime-state mutators (`.ax2-runtime/` →
`.alexandria/` per 0.12.0 rename); `execute-plan` is the orchestrator that
spawns one `build-atomic-card` sub-run per contract.

**Placeholder rename:** workflows use 16+ `__AX2_*__` placeholders. Per
[[play-edit-connective-tissue]] the convention has moved to single-`AX_`
(e.g. `__AX_INPUT_*__`); studio briefs already render the prompts under this
convention. The Fabro files themselves still use `__AX2_*__` and must be
renamed when ported.

## Input-shape change — the load-bearing rework

### Current input contract (parked)

`atomic-card-planning` takes five inputs (§3): `SOURCE_PATH`, `PLAN_ID`,
`MAX_CARDS`, `MIN_GRADE`, `MAX_REVISION_TURNS`. Triage self-categorises
against a hardcoded enum of **10 categories** in
`atomic-card-categories.ts` (`rationale, research, roles, domains, surfaces,
entities, capabilities, mechanisms, patterns, economy`), mirrored in the
prompt; mints its own names; reads the existing library only as a duplicate
check. `build-atomic-card`'s drafter links to whatever it finds in
`ls library` — no schema check on approved shelves; empty library → prose.

### New input contract (per EL5 spec)

`atomic-card-planning` (re-pointed) takes:

- `CONFIRMED_LIBRARY_PATH` — the EL4-approved empty library on disk (folders +
  `<Type> - <Name>.md` stubs with frontmatter + wikilinks, empty bodies).
  EL2 → EL3 → EL4 output in worked-data format. **Replaces** the freeform enum.
- `VOCABULARY_LEXICON_PATH` — the canonical Vocabulary lexicon for the product
  (`_signature` + worked vocabularies). Constrains naming via lexicon's
  `prefLabel`.
- `SOURCE_OF_TRUTH_DOCS` — the EL1 manifest (a set, not one file); the
  existing `sourceOfTruthId` + `contentHash` discipline generalises per-doc.
- Optional `PRIOR_AUDIT_PATH` for re-run.
- Keep `PLAN_ID`, `MIN_GRADE`, `MAX_REVISION_TURNS`. **`MAX_CARDS` becomes
  advisory** — the empty library bounds the work; gap-reports capture overflow.

### Where the change hits

**`atomic-card-planning` — three nodes change, others stay:**

- `verify_source` — generalise one-path → manifest; CLI accepts `--manifest`
  alongside `--source`.
- `inventory` — minor: candidates gain a `shelfPath` (EL4 folder it maps to) +
  `lexiconMatch` (`prefLabel` it resolves to), or flags `unShelved` /
  `unNamed`. Recall job unchanged; placement moves to triage.
- **`triage` — heaviest rewrite.** Disposition enum expands: `write_new`
  (on a confirmed shelf, lexicon-named), `covered_existing`, **`gap_report`**
  (NEW — real concept with no shelf or no lexicon match — the constraint),
  `defer_human`, `reject`. Folder-from-category-id mapping (`rationale/`,
  `systems/`, …) is **deleted**; shelf paths come from EL4. The
  10-category definitional preamble is removed entirely.
- `validate_plan` — schema bumps: `atomic-card-build-plan.v1` adds
  `gapReports[]`; per-contract `targetCard.shelfPath` replaces derived
  `proposedPath`; `targetCard.lexiconMatch` is required.
- `review_build_plan` — surface gap-reports prominently (director rules:
  promote to new shelf, defer, or was EL4 missing this shelf).
- `execute_plan`, `verify_plan`, `audit` — **largely unchanged**. Audit
  gains "Gap-reports promoted/parked"; "Category drift" becomes
  "Shelf-misplacement" (card body doesn't fit its EL4 shelf semantics).

**`atomic-card-creation` — minimal change.** Three mechanical commands.
Bump `validate-plan` to the new schema; otherwise verbatim.

**`build-atomic-card` — two prompt edits:**

- `draft_or_repair`'s WHERE: under EL5 the empty library is fully stubbed,
  so prose-fallback is rare and linking-bar tightens; lose the "if the library
  is empty, links are impossible" branch.
- `grade_candidate` gains a **shelf-fit check**: does the candidate's body
  fit the EL4 shelf it was contracted for? (Replaces the old
  category-confidence number.)

### What "constrained triage" means mechanically

Today: triage reads `ls -R library`, per candidate decides one of 10 enum
categories, mints a Title-Case name, writes a contract. Folder is derived
from category id by hardcoded mapping.

Tomorrow: triage reads the EL4 confirmed library (folder tree with empty
stubs) + the Vocabulary lexicon (JSON of `{prefLabel, altLabels, type,
category}` rows). Per candidate it produces *either*:

- A contract resolving to an existing stub: `targetCard.shelfPath` is an EL4
  folder, `lexiconMatch` is a lexicon `prefLabel` the source-quoted text
  aligns to, `proposedPath` is the stub's path. Synonyms collapse via
  `altLabels`.
- A **gap-report entry**: `{ candidate, why, sourceRefs, missingShelf?,
  missingLexiconEntry? }`. Director rules at the gate (bucketed:
  shelf-needed / lexicon-needed / both / neither-belongs).

Concretely an enum-to-graph swap. The schema enforces it; the prompt cannot
invent a graph node that isn't there.

## Eval re-proof plan

**Critical correction:** the named evals `conan / sam / bridget / solomon` are
**NOT tests of the AC1/AC2/AC3 Fabro plays.** They are eval-cases for the
shipped Alexandria **agent skills** (`packages/alexandria-plugin/skills/
{conan,sam,bridget,solomon}/`), run via `packages/ax/src/tools/eval-harness.ts`.
Each `config.json`'s `route_file` points to e.g. `skills/conan/job-inventory.md`,
not to any Fabro workflow. They predate AC1 and use the Claude-Code-skill
runtime. The studio briefs name them as the AC eval suite — but they grade
what the **human skill author** does, not what the Fabro plays do.

Fixture inventory at `packages/ax/tests/eval-cases/`:

| Eval | Subcases | What it tests | EL5 relation |
|---|---|---|---|
| `conan/` | `inventory`, `grade`, `grade-type-audit`, `surgery` | Conan skill's inventory + grading job, TaskFlow fixture lib | Same conceptual job as AC1's `inventory` and `build-atomic-card`'s `grade_candidate`. **Will not run as-is** against Fabro. Useful as **judge-criteria source**. |
| `sam/` | `create-cards`, `fix-cards` | Sam skill drafting + repairing cards | Same as `build-atomic-card/draft_or_repair`. Judge criteria (`sam/judge-criteria.json` — WHAT-standalone, WHERE-with-context, WHY-trace, HOW-example+anti-example, WHEN-temporal) **directly portable** as Fabro grader rubric. |
| `bridget/` | `assembly` | Bridget skill assembling `CONTEXT_BRIEFING.md` | **Unrelated to EL5.** |
| `solomon/` | `exec-directive`, `meeting-notes`, `raven-handoff` | Solomon skill triaging source material | **Unrelated to EL5.** |

Per-eval decision:

- `conan/inventory` — **re-tune** for shelf-constrained triage output. The
  17-card TaskFlow fixture can stand in as a synthetic "EL4 library";
  **new fixture** needed: a Vocabulary lexicon for TaskFlow.
- `conan/grade`, `conan/grade-type-audit`, `conan/surgery` — **re-run as-is**
  for skill regression; **new fixtures** for Fabro shelf-fit (cards that pass
  old rubric but fail shelf-fit, and vice versa).
- `sam/create-cards`, `sam/fix-cards` — **re-run as-is** for skill regression;
  **re-tune** if used against Fabro `draft_or_repair` (hand the agent a
  contract + EL4 stub, not freeform).
- `bridget/`, `solomon/` — out of EL5 scope.

**Plus unit suite:** `packages/ax-next/tests/cards.test.ts` +
`tests/ax2.integration.test.ts` cover the 12 CLI commands. **Re-run as-is
after rename** (`ax2 cards`→`ax cards`, `.ax2-runtime/`→`.alexandria/`).
New schema-bump tests needed for `atomic-card-build-plan.v1`.

**Summary: 0 of 4 named evals survive untouched. ~2 re-run for skill
regression, ~3 re-tune for the Fabro contract, ~2 need new fixtures
(Vocabulary lexicon + shelf-fit corner cases). Unit suite ports cleanly
modulo the rename.**

## Dependency chain

EL5 cannot start without:

- **Brick 0 — Pin foundations.** Category taxonomy + frontmatter schema +
  link-type vocabulary. The 10-category enum the parked triage hardcodes
  (`atomic-card-categories.ts`) is the **trapped artifact** — Brick 0 either
  confirms or replaces it; EL5 inherits the ruling. **Hard gate.**
- **Brick 1 — Vocabulary (C3).** `lexiconMatch` is meaningless without a
  canonical validated lexicon. EL5 needs at minimum (a) the rename fix +
  (b) the frontmatter reconciliation from §C3.
- **Brick 2 — Skeleton + Surface (C4).** Together with Vocabulary, produces
  the empty-library bundle EL5 consumes. **EL5 cannot land without the
  empty-library file format.**
- **Brick 3 — Brownfield sourcing (C5).** Indirect: EL5 reads EL4 output,
  not scanner output, but the *quality* of EL5's atomization is bounded by
  what EL2/EL3 surfaced for confirmation.
- **Brick 4 — Confirm gate + empty-library view (C2).** **The hard gate.**
  EL5's first input is the EL4-confirmed empty library — that artifact must
  exist on disk in a stable schema with a Ledger approval event before EL5
  has anything to atomize against.
- **Plan B VB1** — the viewer surface renders the empty library for the EL4
  gate. Doesn't block EL5 mechanically (EL5 reads the filesystem); blocks
  the Director realistically passing the EL4 gate.

EL-chain-internal: EL5 is gated on **EL1 → EL2 → EL3 → EL4** all being live.

## Risks

- **Irreversible writes.** `execute_plan`'s `publish_card` writes to
  `library/` + Ledger. Under the new contract publish targets a specific EL4
  stub — the migration must **append to** the stub, never overwrite the
  human-confirmed frontmatter/wikilinks. Wrong target selection = silent
  overwrite of director-approved structure. **High severity.**
- **Conformance-gate machinery may not survive the input-shape change.** Per
  [[playmaker-testing-streamline-waves]] the gate stack (Wave 1: shared
  `placeholders.ts`, conformance gate, AUTHORING output-discipline) is the
  studio's defence against this exact regression class. AC plays predate
  Wave 1, use `__AX2_*__` inline (no shared module), have no `lint.md`, and
  the TS schemas aren't wired into the gate. **Migration must add EL5 to
  the gate's coverage**; the existing manual "keep grading-rubric.md aligned
  with grader prompt" discipline is the same shape, already brittle.
- **Eval fragility.** Per above: 0/4 named evals survive untouched; ~3
  re-tune, ~2 need new fixtures. **Fixtures are load-bearing** — building a
  Vocabulary-lexicon fixture is a Vocabulary-elicitation exercise in miniature.
- **Partial-migration drift.** If Planning bumps `plan.v1` but Creation's
  `validate-plan` is still on `v0`, Creation silently rejects every plan
  Planning emits. Per play-edit connective-tissue, the **three Fabro files
  + studio brief/moves/story/diagram + prompts/ extractions are six surfaces
  that must move together**.
- **Substrate deleted.** `packages/ax-next/` does not exist on `main`.
  Migration is "port + rename," not edit-in-place. ~440 lines of TS schemas
  need porting.
- **Hardcoded 10-category enum.** Every prompt and validator references it.
  Brick 0 rules whether it stays, is replaced, or is **parameterised**
  (read from the EL4 library at runtime — arguably what the EL5 contract
  demands).

## Suggested execution order

Once Brick 0 ruling exists, Brick 1 (a+b) is done, Brick 2 emits an
empty-library bundle, and Brick 4 has the gate live:

1. **Mechanical port** (Director gate after). Port the three workflows to
   `packages/alexandria-plugin/workflows/…` (0.12.0 convention); port
   `packages/ax-next/src/{commands,domain}/cards*` → `packages/ax/src/`;
   rename `__AX2_*__` → `__AX_*__`, `ax2 cards` → `ax cards`,
   `.ax2-runtime/` → `.alexandria/`. **No semantic change.** Ported
   `cards.test.ts` + `ax2.integration.test.ts` green is the gate. Extract
   inline prompts to per-move `prompts/<id>.md` (per
   [[studio-reverse-derived-rendering]] + `studio/tools/extract-prompts.py`).
   Re-derive studio diagram + moves.
2. **Schema + contract change** (Director gate after). Bump
   `atomic-card-build-plan` → `v1` (gapReports, shelfPath, lexiconMatch);
   rewrite triage prompt for constrained shelves + lexicon; rewrite
   verify-source CLI for manifest input; gap-report rendering in
   review_build_plan. New unit tests; Vocabulary-lexicon loader TS.
3. **Eval re-tune + fixtures** (Director gate after). Re-tune
   `conan/inventory`; new fixtures `taskflow-empty-library/` +
   `taskflow-vocabulary.json`; shelf-fit corner cases under `conan/grade`;
   new `sam/build-against-stub` case; EL5-specific judge criteria
   (`gap-report-honesty`, `shelf-fit-correctness`, `lexicon-fidelity`);
   run targeted-evals.
4. **Dogfood** (joint with Brick 6). Point EL5 at Alexandria's own
   EL4-confirmed empty library + EL1 manifest.

Each sub-step is a separate non-stacked PR per
[[feedback-separate-prs-for-qa]].

## What this spec does NOT cover

- **The implementation itself.** Scoping doc; the future implementer writes
  the technical plan, ports, and runs the evals.
- **Brick 0's frontmatter ruling.** Spec assumes Brick 0 produces a single
  canonical category taxonomy + frontmatter schema; EL5 adopts whatever those
  rulings say. The enum drift between parked `ATOMIC_CARD_CATEGORY_IDS`,
  the on-disk `docs/alexandria/library/` planes, and Vocabulary's worked
  `vocabularies/alexandria/` is Brick 0's problem.
- **Atomizer runtime monitoring** (live progress UI, partial-run recovery,
  viewer-rendered intermediate cards) — **VB5** territory.
- **EL6 (Living Updates).** Post-MVP; needs VB4.
- **The `source-assessment` workflow.** Unrelated ACP smoke.
