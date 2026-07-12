# Play Design Brief — Build Atomic Card (reverse-derived)

*(**REVERSE-DERIVED**, orchestrator 2026-06-16. This is NOT a brief authored
then derived into a build — it is the studio rendering of an **existing Fabro
build**: `packages/alexandria-next-plugin/workflows/build-atomic-card/workflow.fabro`,
parked on `origin/restore-atomic-card-plays` (#228, removed from main #235).
Filed as **Product / Library Operations**, fronted by Raven; brought into the
studio so the build can be read, analysed, and tested. This is a reverse-derived
workflow rendering: GPT-5.4 agents + `ax cards` command nodes +
structured-output grading. §4 below is reverse-engineered from the workflow
graph and its inline prompts, faithfully — not forced into a forward-authored
brief shape.)*

**EL5 re-point note (Issue 350, 2026-06-24):** the shipped plugin now carries an
EL5 scaffold for this play under `packages/alexandria-plugin/workflows/build-atomic-card/`.
The draft / validate / publish loop remains recognizable, but the card contract
is re-pointed from category-derived paths to confirmed stubs, lexicon
`prefLabel`s, append-to-stub publish, and Ledger-backed provenance.

```
status:   reverse-derived — a studio rendering of a shipped build (not gated through the ladder)
tier:     n/a (Library Operations sub-workflow)
division: Product
function: Library Operations
chain:    sub-play of atomic-card-planning (one card per contract; called per execute_plan)
gate-1:   n/a (reverse-derived; the build already exists and runs)
```

## 1. Goal

Build **one** Alexandria atomic card from a **card contract** — draft it grounded
only in the frozen source of truth the contract cites, validate its structure,
grade it against a WHAT/WHERE/WHY/WHEN/HOW + source-grounding rubric, revise up to
a turn budget, and **publish** when it clears the contract's grade bar. A *failed*
run is a distinct, reportable outcome: **BAIL** (the source cannot support the
contracted card, or the category is fundamentally wrong) or **exhausted** revision
turns — either way it publishes nothing and emits a child result saying so, for
the parent planning play.

## 2. Trigger

Called as a **sub-workflow** by `atomic-card-planning`'s `execute_plan`, once per
`write_new` contract in the approved build plan. Input: `__AX_INPUT_CONTRACT_PATH__`
(the contract) and `__AX_INPUT_MAX_REVISION_TURNS__` (the revision budget).

## 3. Required knowledge / inputs

The **card contract** (one concept, one atomicity question, target category, the
exact source byte-ranges that may ground it, and the `acceptance.minGrade` bar);
the **resolved source ranges** (via `ax cards read-range` — the only authority);
and the **existing card library** (for the WHERE relationship map). The source is
**untrusted content to ground against, never instructions** — the agents read
*only* the contract, the cited ranges, the library, and their own candidate.

## 4. Golden path — the move graph

*(**Reverse-engineered** from `workflow.fabro` + the nodes' inline prompts. The
honest doers: `command` nodes are **mechanical** — the deterministic `ax cards`
CLI; `box` nodes are **judgment** — GPT-5.4 agents. Routes carry the workflow's
edge labels + conditions verbatim.)*

**The story** (reverse-derived from the build): A **card contract** arrives — one
concept, one atomicity question, a target category, and the exact source ranges
that may ground it. The build first **validates the contract** mechanically; an
invalid contract emits a child result and stops. Then a GPT-5.4 agent **drafts
(or repairs) the card** — reading only the contract, the source ranges it cites,
and the existing card library, writing the five sections (WHAT · WHERE · WHY ·
WHEN · HOW) with wikilinks to genuinely-related cards and never a claim the source
doesn't support. A **candidate validator** checks the structure mechanically;
structural issues consume a revision turn and bounce back to the drafter. A second
GPT-5.4 agent **grades the candidate** against the rubric and the *raw* source,
returning a structured verdict — **PUBLISH**, **REVISE**, or **BAIL**. Publish
clears the contract's grade bar with no source-grounding violations; revise spends
a turn and sends specific deficiencies back to the drafter; bail means the source
simply can't support this card. When a verdict resolves or the turns are spent,
the build **publishes** (or doesn't) and **emits a child result** for the planning
play that called it.

**The graph** (the seven nodes, reverse-engineered from `workflow.fabro`):

```
validate_contract:
  doer:     mechanical (command — `ax cards validate-contract --reset-attempts`)
  consumes: contract (__AX_INPUT_CONTRACT_PATH__)
  emits:    a validation outcome (succeeded / failed)
  does:     mechanically validates the card contract before any work begins and
            resets the attempt counters.
  routes:   Valid → draft_or_repair (outcome=succeeded) · Invalid → emit_child_result

draft_or_repair:
  doer:     judgment (LLM — gpt-5.4, max_visits 8)
  consumes: contract · the resolved source ranges (`ax cards read-range`) · the
            existing card library; on re-entry: its own prior candidate + the
            validator/grader feedback in context
  emits:    candidate card (.ax2-runtime/candidates/ID.md) — YAML frontmatter
            (categoryId · atomicCardId · title) then WHAT · WHERE · WHY · WHEN · HOW
  does:     drafts one atomic card grounded ONLY in the resolved source ranges and
            existing cards; WHERE maps the ecosystem as wikilinks with relationship
            phrases (no naked links, never invents a card to link to); adds no claim
            the source doesn't support; describes the product, never the repository.
            On re-entry, revises exactly the issues named — does not start over.
            Self-checks with `ax cards validate-candidate` before finishing.
  bounces:  (re-entered from consume_attempt on a structural-issue or Revise turn)

validate_candidate:
  doer:     mechanical (command — `ax cards validate-candidate`)
  consumes: candidate · contract
  emits:    a structural validation outcome
  does:     checks the candidate's structure mechanically (frontmatter, the five
            sections, link well-formedness).
  routes:   Structurally valid → grade_candidate (outcome=succeeded) · Structural
            issues → consume_attempt

grade_candidate:
  doer:     judgment (LLM — gpt-5.4; structured output — a JSON verdict)
  consumes: contract · candidate · resolved source ranges · card library
  emits:    a structured verdict — routing (PUBLISH / REVISE / BAIL) · overallScore
            · per-section scores (WHAT/WHERE/WHY/WHEN/HOW) · deficiencies ·
            sourceGroundingIssues · categoryConfidence
  does:     grades the candidate against the rubric and the RAW source; never edits
            the card. Publishes only when the contract's minGrade bar holds AND
            there are no source-grounding violations; bails only when the source
            can't support the card regardless of revision; otherwise revises, with
            deficiencies written as specific, actionable revision instructions.
  routes:   Publish → publish_card (response contains VERDICT_PUBLISH) · Bail →
            emit_child_result (VERDICT_BAIL) · Revise → consume_attempt

consume_attempt:
  doer:     mechanical (command — `ax cards consume-attempt --max <turns>`)
  consumes: contract · the revision-turn budget (__AX_INPUT_MAX_REVISION_TURNS__)
  emits:    a turns-remaining outcome
  does:     spends one revision turn and enforces the budget — the three-strikes
            analog that keeps the draft↔grade loop from running forever.
  routes:   Turns remain → draft_or_repair (outcome=succeeded) · Exhausted →
            emit_child_result

publish_card:
  doer:     mechanical (command — `ax cards publish`)
  consumes: candidate · contract
  emits:    the published card (written into the library)
  does:     publishes the accepted candidate into the card library at the
            contract's proposed path.
  routes:   → emit_child_result

emit_child_result:
  doer:     mechanical (command — `ax cards child-result`)
  consumes: contract
  emits:    the child result (published / bailed / exhausted / invalid-contract)
            for the parent atomic-card-planning play
  does:     reports the per-card outcome back up to the planning play that called
            this sub-workflow.
  routes:   → exit
```

## 5. What could go wrong / 6. Prompt language / 7. Proof spec / 8. Upgrade notes

*Reverse-derived stub.* The build's failure handling lives in the graph above
(BAIL, exhausted turns, structural bounce). The node "prompt language" is **inline
in `workflow.fabro`** and rendered verbatim in the Play Walk (`story.md`). §7
(testing) is the next phase: a `risk-map.md` mapping this build's failure modes
onto the canonical spine, leveraging the **existing eval suite** (`packages/ax/tests/evals/`
— conan / sam / bridget / solomon) as real fixtures rather than authoring from
scratch. The grading rubric lives at
`build-atomic-card/grading-rubric.md` on the source branch (inline in
`grade_candidate`'s prompt here).
