# Plan: /library Structural Pipeline Fix

- Origin: We Do session `c8be6d73-18ed-45aa-8e27-7a87596ecf61` (2026-04-06)
- Problem: First real `/library` greenfield run produced cards with wrong folder
  structure, wrong naming convention, and wrong type classification. No agent in the
  pipeline caught the structural failures before the user did.
- Goal: Fix every layer of the pipeline so structural violations are prevented,
  detected, and rejected — then lock the fix in with eval coverage.

## Session Failure Analysis

The We Do session ran `/library` (Raven wizard-mode) end-to-end on a greenfield
project. Three cascading failures occurred:

### Failure 1: Raven's handoff was structurally wrong

Raven's card-building handoff to Sam said:

> **Target path:** `docs/alexandria/library/`
> **Required structure:** Alexandria library cards with WHAT/WHY/WHERE/HOW/WHEN
> dimensions... Each card should be a standalone file in `docs/alexandria/library/`.

The correct structure is `docs/alexandria/cards/{rationale,product,experience}/` with
`Type - Name.md` naming. Raven never loaded `skills/sam/library-organization.md` or
any structural reference before composing the handoff. **Raven didn't know
Alexandria's own card structure.**

Root cause: `job-wizard-mode.md` Step 5 says to "Include the standard template or
schema Sam should follow" but doesn't tell Raven *where to find it*. Raven
synthesized a plausible-but-wrong structure from general knowledge.

### Failure 2: Sam complied with bad instructions

Sam read `card-creation.md` (which explicitly mentions `/rationale/standards/`,
`/rationale/product-thesis/`, type prefixes) but followed Raven's explicit path
instruction over its own skill files. Sam wrote flat files like `product-vision.md`
instead of typed cards like `Product Thesis - We Do Vision.md`.

Sam also never loaded `library-organization.md` which has the complete type-to-folder
mapping table.

Root cause: Sam has no instruction to validate handoff paths against its own
structural reference. When the orchestrator says "write here," Sam writes there.

### Failure 3: Conan graded without catching structural violations

Conan graded the 6 cards B+ overall. Conan noted "The library has no standard folder
structure or reference.md yet" but treated this as acceptable context rather than a
structural failure. Conan's grading rubric evaluates content dimensions
(WHAT/WHY/WHERE/HOW/WHEN) but does not enforce folder placement or naming.

Root cause: `job-grade.md` has no structural pre-gate. Conan grades content quality
assuming structural correctness, but nothing enforces that assumption.

### Failure 3.5: Nit was never invoked

The wizard-mode orchestration sent cards directly from Sam to Conan. Nit (sweeps 1-2)
would have caught the naming and folder violations as **critical** — Nit's sweep 2
explicitly checks `Type - Name.md` regex and correct layer folder placement. But
Raven's wizard-mode flow doesn't include a Nit pass.

## Existing Detection Surface

The tooling to catch these problems already exists but wasn't invoked:

| Tool | What it checks | Status in the session |
|------|---------------|----------------------|
| Nit sweep 2 | `Type - Name.md` naming, folder placement — both marked **critical** | Never invoked |
| Sam structural checks (`tests/eval-cases/sam/structural-checks.ts`) | Same checks: naming regex, layer folder, card quality | Only runs in eval harness, not in production flow |
| Conan job-grade | Content dimensions (WHAT/WHY/WHERE/HOW/WHEN) | Ran, but doesn't check structure |
| `library-organization.md` | Type-to-folder mapping table | Exists but neither Raven nor Sam loaded it |

## Non-Goals

- Changing the wizard engine, scoreboard, or gap analysis surfaces
- Reworking Sam's card-writing job definitions beyond adding a structural validation step
- Creating a general-purpose orchestration framework — this fixes the specific
  `/library` pipeline
- Addressing content quality issues (Conan's grading rubric is fine for content)

## Tasks

Ordered by dependency. Tasks within a layer can be parallelized.

### Layer 1: Make the pipeline structurally correct (prompt fixes)

These are the behavioral changes. Each is a targeted edit to an existing skill file.

#### Task 1: Raven loads structural reference before card handoffs

**File:** `skills/raven/job-wizard-mode.md` (Step 5)

**Change:** Before composing any card-building Raven-to-Sam handoff, Raven must:
1. Load `${CLAUDE_PLUGIN_ROOT}/skills/sam/library-organization.md`
2. Include the type-to-folder mapping in the handoff's **Required structure** field
3. Include `Type - Name.md` naming convention in **Known constraints**
4. Specify `docs/alexandria/cards/{layer}/` as the target path, not `docs/alexandria/library/`
5. Require Sam to classify each card by type before choosing its folder

**Why:** This is the root cause. Raven composed the handoff from general knowledge
instead of Alexandria's actual structural specification. The specification exists
(`library-organization.md`) — Raven just didn't read it.

**Acceptance:** The handoff block template in Step 5 explicitly references
`library-organization.md` and includes structural constraints that would have
prevented the We Do failure.

#### Task 2: Sam validates handoff paths against structural reference

**File:** `agents/sam.md` (Card-Building Rules section) and
`skills/sam/card-creation.md` (Before You Start section)

**Change:** Add an explicit instruction:

> Before writing any card, verify the target path and filename against
> `${CLAUDE_PLUGIN_ROOT}/skills/sam/library-organization.md`. If a handoff
> specifies a path or naming convention that contradicts the type-to-folder mapping,
> use the correct path and note the correction in your completion report. The
> structural reference overrides handoff instructions.

**Why:** Sam is the last line of defense before files hit disk. Even with a perfect
Raven handoff, Sam should independently verify structure. Sam already knows the rules
(card-creation.md mentions folder paths) but has no instruction to enforce them when
they conflict with a handoff.

**Acceptance:** Sam's agent definition and card-creation procedure both contain
explicit "verify before writing" instructions that reference `library-organization.md`.

#### Task 3: Raven's wizard-mode requires Nit before Conan

**File:** `skills/raven/job-wizard-mode.md` (Step 5, after Sam returns)

**Change:** After Sam returns from a card-building job and before dispatching Conan
for grading, Raven must dispatch Nit for sweeps 1-2. If Nit reports critical
violations, Raven sends Sam back to fix structural issues before grading proceeds.

The flow becomes: Sam builds → Nit sweeps 1-2 → fix if critical → Conan grades.

**Why:** Nit's sweep 2 already checks naming and folder placement and marks violations
as **critical**. The machinery exists — it just wasn't in the wizard-mode flow.
Running Nit before Conan catches structural problems mechanically (cheap, fast,
deterministic) before the expensive content grading step.

**Acceptance:** `job-wizard-mode.md` Step 5 includes a Nit gate between Sam card
creation and Conan grading, with a fix loop for critical violations.

#### Task 4: Conan refuses to grade structurally invalid cards

**File:** `skills/conan/job-grade.md` (Procedure, before step 1)

**Change:** Add a structural pre-gate to the grading procedure:

> **Step 0: Structural pre-check.** Before grading content, verify that every card in
> scope passes basic structural checks: `Type - Name.md` naming convention and
> correct layer folder placement per the type taxonomy. If any card fails these
> checks, report `**Status: BLOCKED** — structural violations must be fixed before
> content grading`. Do not grade cards that are in the wrong folder or have wrong
> naming — content quality is meaningless if the card can't be found by the graph.

**Why:** Defense in depth. Even if Nit is skipped (as it was in the We Do session),
Conan should refuse to grade cards that are structurally broken. This prevents the
misleading "B+" grade on cards that are fundamentally wrong.

**Acceptance:** `job-grade.md` has a Step 0 pre-gate that blocks grading on structural
violations, with a BLOCKED status output.

### Layer 2: Eval coverage (lock it in)

These tasks create eval cases that exercise the fixed pipeline and prevent regression.

#### Task 5: Create `/library` greenfield eval case

**Directory:** `tests/eval-cases/library/greenfield-household-app/`

**Files to create:**
- `config.json` — skill: `library`, adaptive mode, max_turns: ~20, timeout: 900,
  expected_files: `wizard-config.json` plus card files
- `persona.md` — User describing a household task app (derived from the We Do
  session but genericized). Persona must: describe the product clearly, confirm
  configuration when asked, ask Sam to build cards, and — critically — NOT catch
  structural problems themselves (the pipeline should catch them)
- `inputs.md` — Turn 1 kickoff

**Why:** This is the critical path that broke. The eval exercises Raven → Sam → Nit →
Conan end-to-end on a greenfield project. If cards end up in the wrong folder or with
wrong naming, the eval fails.

**Acceptance:** Eval case exists and can be run with `bin/alexandria-eval run library/greenfield-household-app`.

#### Task 6: Structural checks for `/library` eval

**File:** `tests/eval-cases/library/structural-checks.ts`

**Checks to implement:**
1. `wizard-config.json` exists in `docs/alexandria/`
2. Source cards exist in `docs/alexandria/sources/`
3. **No files in flat `docs/alexandria/library/`** (the anti-pattern from the We Do session)
4. Card files exist in `docs/alexandria/cards/` subdirectories
5. Cards are distributed across at least 2 layer folders (`rationale/`, `product/`,
   `experience/`)
6. Every card file passes the existing `checkCardQuality` checks (reuse from
   `tests/eval-cases/sam/structural-checks.ts`): naming regex, layer folder, 5 H2
   sections, wikilinks with context, word count

**Why:** These are deterministic assertions that would have caught every failure in the
We Do session. They don't require LLM-as-judge — just file existence and regex checks.

**Acceptance:** Structural checks file exists, imports shared check utilities, and
covers all 6 check categories above.

#### Task 7: Judge criteria for `/library` eval

**File:** `tests/eval-cases/library/judge-criteria.json`

**Criteria to include:**
1. Configuration accuracy — wizard-config.json reflects the product description
2. Source material fidelity — source cards capture the user's product description
3. Card type classification — cards use appropriate Alexandria types, not generic topics
4. Orchestration flow — Raven delegates to Sam with structural constraints visible in
   the transcript
5. Structural compliance — cards follow naming and folder conventions (overlaps with
   structural checks but judges the transcript for evidence of structural awareness)

**Why:** Structural checks catch the mechanical failures. Judge criteria catch the
qualitative failures — did Raven's handoff show structural awareness? Did Sam classify
types correctly? These are harder to check deterministically.

**Acceptance:** Judge criteria file exists with categorical scoring levels.

#### Task 8: Conan structural-rejection eval case

**Directory:** `tests/eval-cases/conan/structural-rejection/`

**Files to create:**
- `config.json` — skill: `conan`, grade job
- `inputs.md` — "Grade these cards" pointing at the fixture
- `fixture/` — A library with cards deliberately in the wrong folder and with wrong
  naming (e.g., `docs/alexandria/library/product-vision.md` instead of
  `docs/alexandria/cards/product/Product Thesis - Vision.md`)

**Structural check:** Conan's output contains `BLOCKED` status, not a grade.

**Why:** Tests the gate added in Task 4. If Conan grades structurally broken cards
instead of rejecting them, this eval fails.

**Acceptance:** Eval case exists, fixture contains deliberately malformed cards, and
structural checks verify BLOCKED status in output.

### Layer 3: Verify and baseline

#### Task 9: Run all affected evals, establish baselines

**Commands:**
```bash
bin/alexandria-eval run library/greenfield-household-app
bin/alexandria-eval run conan/structural-rejection
bin/alexandria-eval run sam/all
bin/alexandria-eval run raven/all
bin/alexandria-eval run conan/all
```

**Procedure:**
1. Run the two new eval cases first (library greenfield, Conan rejection)
2. Re-run existing Sam, Raven, and Conan evals to verify no regressions
3. Review transcripts for any new failure patterns
4. Check in baselines for all passing evals

**Acceptance:** All evals pass or have documented, understood failure modes. Baselines
are checked in.

## Dependency Graph

```
Task 1 (Raven loads ref)     ─┐
Task 2 (Sam validates)       ─┤
Task 3 (Raven adds Nit gate) ─┼──> Task 5 (library eval case)  ─┐
Task 4 (Conan pre-gate)      ─┤    Task 6 (structural checks)  ─┤
                               │    Task 7 (judge criteria)      ─┼──> Task 9
                               └──> Task 8 (Conan rejection eval)─┘    (run + baseline)
```

- Tasks 1-4 are independent of each other (parallel)
- Tasks 5-7 depend on Tasks 1-3 being in place (the pipeline must be fixed before
  the eval can pass)
- Task 8 depends on Task 4
- Task 9 depends on all prior tasks

## Files Touched

| File | Task | Change |
|------|------|--------|
| `skills/raven/job-wizard-mode.md` | 1, 3 | Load structural ref before handoff; add Nit gate |
| `agents/sam.md` | 2 | Add structural validation instruction to Card-Building Rules |
| `skills/sam/card-creation.md` | 2 | Add "verify before writing" step to Before You Start |
| `skills/conan/job-grade.md` | 4 | Add Step 0 structural pre-gate |
| `tests/eval-cases/library/greenfield-household-app/config.json` | 5 | New |
| `tests/eval-cases/library/greenfield-household-app/persona.md` | 5 | New |
| `tests/eval-cases/library/greenfield-household-app/inputs.md` | 5 | New |
| `tests/eval-cases/library/structural-checks.ts` | 6 | New |
| `tests/eval-cases/library/judge-criteria.json` | 7 | New |
| `tests/eval-cases/conan/structural-rejection/config.json` | 8 | New |
| `tests/eval-cases/conan/structural-rejection/inputs.md` | 8 | New |
| `tests/eval-cases/conan/structural-rejection/fixture/` | 8 | New (deliberately malformed cards) |

## Risks

| Risk | Mitigation |
|------|------------|
| Raven loading `library-organization.md` adds a file read to every card handoff | One small file read is cheap; the cost of wrong structure is an entire session wasted |
| Sam overriding handoff paths could cause confusion if Raven's path was intentionally different | Sam reports the correction explicitly; Raven can adjust on the next turn |
| Conan's structural pre-gate could block grading on edge cases (e.g., a new card type not yet in the mapping) | The pre-gate checks naming convention and layer folder, not type exhaustiveness; unknown types still pass if they follow `Type - Name.md` |
| The `/library` eval is expensive (multi-turn, multi-agent) | Run it less frequently than unit evals; it's a gate for Raven/Sam/Conan skill changes, not every PR |
| Eval may be flaky due to LLM non-determinism in multi-agent orchestration | Structural checks are deterministic; judge criteria handle the qualitative variance. Run 2-3 times to establish reliability before treating as a hard gate. |

## Relationship to Prior Plans

- **234 (Raven-Sam artifact delegation):** That plan defined the handoff block format
  but explicitly deferred eval coverage. This plan fills that gap and fixes the
  structural blind spot the handoff format didn't address.
- **236 (end-to-end smoke test):** That plan covers general smoke testing. This plan
  is narrower — specifically the structural pipeline for card creation.
- **231 (Raven wizard-mode job):** The wizard-mode job file is the primary edit
  surface. This plan adds structural awareness to the existing wizard-mode procedure
  rather than reworking it.
