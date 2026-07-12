> **Inherited record — autopsy evidence; trusted as a historical record.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/PROMPT-REVIEW-FINDINGS.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Atomic Card Factory — Prompt Review Findings

> **RESOLUTION (hand-fix pass, commits `352ee86`→`9dd04d4`).** All P0–P3 findings below were
> fixed BY HAND in the live prompts (not regenerated — the factory is under separate
> investigation), grounded in the real legacy criteria (`source-skills/conan/rubrics.md`,
> `card-standards.md`, `grade-computation.md`) re-expressed in clean current vocabulary.
> - **P0:** score (real card rubric inlined), author (Library Reference → inlined type guide +
>   links→WHERE mapping), grade_compute (full grade tables, Rage Meter removed), consistency
>   (one ACP decision-file contract). 
> - **P1/P2/P3:** completeness_list/decompose/connect/grade_kickback; grade_gate, assign_area,
>   tense_decide, completeness_sweep, bank_review (Raven removed), self_check (now reads R/cards
>   from disk — was a no-op over ACP), build_order, plan_kickback, spot_verdict, spot_check, lint
>   (catalog-schema grounded inline), grounding; clean-run.sh + precondition.sh.
> - **Grammar (`MANIFEST-GRAMMAR.md`):** dropped the `(<Plane>)` suffix, added `recon: unjoinable`,
>   pinned "no rationale/status field"; conformed collisions/type_assign/type_resolve.
> Final state: 0 legacy leaks, both graphs validate. Remaining low-risk/cosmetic: emits-frontmatter
> convention is mixed (R/ shorthand vs full path vs decision_file:); grammar drift #2 (tense quoting)
> and #5 (per-prompt partial field-lists). Not yet verified by a live ACP run (pending tokens).


Human + Sonnet read of `danversfleury/atomic-factory-spec-fixes`.
Fixes go to the **spec** (`.fabro/workflows/prompt-factory-batch/specs/<move>.md`) for regeneration.

**Review lens:**
1. Voice / legacy contamination
2. Design-rationale leakage / rubric contamination (historical #1 defect)
3. Doer honesty (SW vs SK correctly tagged?)
4. Vocabulary discipline (three vocabs clean; no retired type names)
5. Clarity / cold-start executability (positive worked example?)
6. Inputs-as-data safety (prompt-injection guardrail)
7. NEW seam issues only
8. **Node-intent alignment (Director-flagged as #1 priority)**

---

## Overall grade: C+

The pipeline is architecturally coherent but cannot be called production-ready. Three nodes grade D or C with execution-blocking defects. The authoring and scoring stages (B2, B7, B8) will produce unreliable output regardless of how well Stage A performs.

---

## Per-node grades

| Node | File | Grade | Key issues |
|------|------|-------|------------|
| A1 | clean-run.sh | B | Rationale leakage in comments; glob misses runtime/run/*.decision |
| A2 | precondition.sh | B | Missing `-e` flag; silent fail if runtime/run/ absent |
| A3 | decompose.md | **C** | FAIL vocab (doer, Moves); FAIL intent (Pass 2 scope-creep into type-assign) |
| A4 | collision-join.md | A | Strongest Stage A prompt. Minor seam assumption on foundation.md structure |
| A5 | assign-area.md | B | Rationale leakage; `zone` ungrounded; no worked example |
| A6 | type-assign.md | B | Rationale leakage; one Alexandria vocab leak (Area in anti-example) |
| A7 | type-resolve.md | B | Rationale leakage; intent/scope mismatch (re-resolves ALL, not just ambiguous) |
| A8 | collisions.md | B | Rationale leakage; `Director` + `response.collision_join` meta-noun leaks |
| A9 | tense-decide.md | B | `Card` + `plan_kickback` vocab leaks; consumes vs. files path mismatch |
| A10 | connect.md | B | FAIL vocab (retired names `Prompt`/`Agent` live in containment table); FAIL seam (Governance rule contradicts guardrail) |
| A11 | build-order.md | B | `Areas` vocab collision; `build:` field format unspecified |
| A12 | plan-kickback.md | B | Fabro nouns `node`/`out-edges` in body; Kickback described inconsistently (exit vs round-trip) |
| B2 | author.md | **C** | FAIL cold-start (`Library Reference` undeclared); FAIL seam (emits mis-declared); links: handoff implicit; no worked example |
| B3 | lint.md | B | `lint_route` Fabro node name in body; undeclared input for cross-Area backlink check |
| B4 | self-check.md | A | Best Stage B prompt. Only defect: Fabro wiring nouns in body |
| B5 | grounding.md | B | One sentence of rationale leakage; otherwise clean |
| B6 | consistency.md | **C** | FAIL seam (JSON vs one-word output contradiction); FAIL seam (all cards vs target-Area contradiction); `route`/`graph` Fabro leaks |
| B7 | score.md | **D** | FAIL intent (no rubric/standard in scope — scoring is arbitrary); wrong boilerplate; output format underspecified; Fabro noun in body |
| B8 | grade-compute.md | **C** | FAIL cold-start (letter→points table truncated with `...`); FAIL seam (emits mis-declared); wrong boilerplate target; `Rage Meter` undefined |
| B9 | grade-gate.md | B | FAIL seam (`max_visits` check ungroundable — not in any consumed file); irrelevant boilerplate; intent understates 3-way logic |
| B10 | spot-check.md | B | Scoping rule deferred to wrong place; card_id identity implicit; emits mis-declared |
| B11 | spot-verdict.md | B | Rationale leakage (rubric re-teaching in body); emits mis-declared |
| B12 | grade-kickback.md | **C** | FAIL seam (wrong boilerplate — instructs reading files not in consumes); no signal-conflict rule; no worked example |
| B13 | completeness-list.md | **C** | FAIL seam (response.decompose vs R/manifest.md — two different artifacts named); FAIL seam (every-line vs area-filter contradiction) |
| B14 | completeness-sweep.md | B | Rationale leakage; R/cards/ scope conflict between body and footer |
| B15 | bank-review.md | B | `Raven` persona ungrounded; `zone` undefined; cross-section read conflict |

---

## Trouble spots (ordered by severity)

### B7 — score.md | D | EXECUTION-BLOCKING
- **No authoring standard in scope.** Scorer gets dimension names but zero rubric — no definition of A vs B vs C on any dimension. `author.md` not in `consumes:`. Scoring produces arbitrary impressions, not standard-referenced grades. This invalidates `grade_compute`, `grade_gate`, and `spot_verdict` downstream.
- Boilerplate "Append only this Move's field(s)" is actively wrong — `scores.md` is created fresh here.
- Output format underspecified for `grade_gate.md`'s parser.
- `grade_compute` Fabro move ID in body.
- **Spec edit:** Add `author.md` dimension table + a grading rubric (what distinguishes A/B/C on each dimension) to `consumes:` and inline a condensed version. Remove wrong boilerplate. Specify exact output layout.

### B2 — author.md | C | EXECUTION-BLOCKING
- **"Library Reference" undeclared.** Referenced as source for type-specific templates, no path, not in `consumes:` — cold agent cannot find it.
- `emits: output_schema: none` while real output is `R/cards/<area>--<unit-id>.md` which `lint.md` reads by exact path.
- `links:` field pre-computed by `connect` node never explicitly mapped to WHERE wikilinks — critical handoff left implicit.
- No worked example card output for an SK authoring task.
- **Spec edit:** Declare "Library Reference" as concrete path in `consumes:` or inline the templates. Fix `emits:`. Add explicit instruction to translate `links:` field into WHERE wikilinks.

### B6 — consistency.md | C | EXECUTION-BLOCKING
- **Output Contract says emit full JSON; Data Flow says write exactly one word to decision file.** Unreconciled contradiction. JSON blob breaks the graph router.
- **Inputs says read every card; Section Scope says read only target-Area files.** Direct contradiction.
- `route`/`routing` (5+ times) and `graph` Fabro plumbing in doer prompt.
- **Spec edit:** One format, one section. Explicit reconciliation rule for read scope (all cards for term pass; target-Area for link pass). Strip Fabro nouns.

### B8 — grade-compute.md | C | EXECUTION-BLOCKING
- **Letter→points table truncated with `...`** — B+/B/B-/C+/C/C-/D+/D/D- absent. Pure SW arithmetic cannot execute step 1.
- `emits: output_schema: none` while body writes `R/quality.md`.
- Boilerplate targets manifest.md, not quality.md.
- `Rage Meter` unexplained.
- **Spec edit:** Complete the full 12-letter-grade table. Fix `emits:`. Correct/delete boilerplate. Define or remove "Rage Meter."

### B13 — completeness-list.md | C | SEAM DEFECTS
- `consumes:` says `response.decompose`; Data Flow says `R/manifest.md` — different artifacts, ambiguous read path.
- Task body says "Read every line" (no filter); Section Scope footer says filter by target Area — contradictory, corrupts U computation in scoped runs.
- **Spec edit:** Pick one artifact, declare it consistently. Reconcile or remove Section Scope footer.

### A3 — decompose.md | C | SCOPE CREEP + VOCAB
- Pass 2 adds type-classification taxonomy (WHY-we-build / WHAT-exists / infrastructure / experience) — this is `assign_area`/`type_assign`'s job, not decomposition. Blurs pipeline responsibilities.
- `doer` (Fabro noun) and `Moves` (Alexandria noun) in prompt body.
- No worked output-line example; free-form list creates fragile downstream parse seam.
- **Spec edit:** Remove Pass 2 classification entirely. Strip `doer` and `Moves`. Add worked output-line example. Minimal output schema.

### A10 — connect.md | B (two FAILs)
- Retired type names `Prompt` and `Agent` live as a.k.a. aliases in the containment table — a doer may use them in output.
- Governance row instructs `parent->` for area spans; guardrail three sections later says area placement is never a containment link. Unresolvable conflict.
- **Spec edit:** Remove `(a.k.a. Prompt)` and `(a.k.a. Agent)`. Rewrite Governance row to not invoke `parent->` for area spans.

### B12 — grade-kickback.md | C | BOILERPLATE CONTAMINATION
- Section Scope boilerplate instructs reading `R/target-section.txt` + `R/manifest.md` and filtering by Area — those files are not in `consumes:` and area-filtering is not this node's job. Copy-paste from author-loop nodes.
- No synthesis rule for quality.md vs spot-verdict.md signal conflict.
- No worked example for core judgment call.
- **Spec edit:** Delete the boilerplate block. Add signal-priority rule. Add worked example with mixed verdict set.

### B9 — grade-gate.md | B (one FAIL)
- `max_visits` cap check instructed but no consumed file carries the visit count or cap limit — unexecutable.
- Section Scope boilerplate is irrelevant copy-paste onto a pure routing node.
- **Spec edit:** Declare visit-count carrier in `consumes:`. Delete Section Scope boilerplate.

---

## Systemic patterns

| Pattern | Nodes affected | Count |
|---------|---------------|-------|
| Design-rationale leakage (WHY commentary in deployed prompt) | A1, A2, A5, A6, A7, A8, A9, B5, B6, B9, B11, B13, B14 | 13/26 |
| Fabro meta-noun in doer prompt body (`route`, `graph`, node IDs, response.* names) | A3, A6, A8, A9, B3, B4, B6, B7, B13 | 9/26 |
| `emits: output_schema: none` while node actually writes a concrete file | A5, B2, B7, B8, B10, B11 | 6/26 |
| Copy-pasted Section Scope boilerplate applied to wrong node type (contradicts or is irrelevant) | B9, B12, B13, B14 | 4/26 |
| Missing worked examples on SK nodes | A3, A5, B2, B7, B12, B15 | 6 SK nodes |
| Intent/scope mismatch between node label and prompt body | A3, A7, B7, B8, B9 | 5/26 |
| Ungrounded vocabulary terms (`zone`, `Raven`, `Rage Meter`) | A5, B8, B15 | 3/26 |

---

## Clean passes

- **A4 — collision-join.md** (A): Strongest prompt in the pipeline. Bilateral worked examples, correct SK tag, explicit guardrails, no leakage.
- **B4 — self-check.md** (A): Best Stage B prompt. Intent precisely met, structural/semantic boundary maintained throughout. Only defect: Fabro wiring nouns.
- **B5 — grounding.md** (B, near-A): Sound structure, strong cold-start, proper fail-closed. One sentence of rationale leakage only.
- **A11 — build-order.md** (B): Clean SW node, no rationale leakage, correct tag. Two minor gaps.
- **A2 — precondition.sh** (B): Correct gate behavior, clean mechanics.

---

## Highest-priority single fix

**score.md (B7).** A scorer with no rubric and no authoring standard in scope produces letter grades that reflect model priors, not the standard — this invalidates the entire quality-scoring branch (grade_compute → grade_gate → spot_verdict). Fix this first.

---

## Specs needing edits + regeneration

| Spec | Priority | What to fix |
|------|----------|-------------|
| `score` | P0 | Add rubric + authoring standard to scope |
| `author` | P0 | Declare Library Reference path; fix emits; explicit links: → WHERE mapping |
| `consistency` | P0 | Reconcile JSON vs one-word output; reconcile read scope |
| `grade_compute` | P0 | Complete grade table; fix emits; fix boilerplate |
| `completeness_list` | P1 | Unify artifact name; reconcile read scope |
| `decompose` | P1 | Remove Pass 2 classification; strip meta-nouns |
| `connect` | P1 | Remove retired type aliases; fix Governance contradiction |
| `grade_kickback` | P1 | Delete wrong boilerplate; add signal-priority rule |
| `grade_gate` | P2 | Declare max_visits carrier; delete irrelevant boilerplate |
| `collisions` | P2 | Strip meta-nouns; strip rationale |
| `assign_area` | P2 | Strip rationale; define zone; add worked example |
| `tense_decide` | P2 | Strip vocab leaks; fix consumes/files mismatch |
| `completeness_sweep` | P2 | Fix R/cards/ scope conflict |
| `bank_review` | P2 | Define Raven and zone; fix cross-section read conflict |
| `type_resolve` | P3 | Update intent statement; strip rationale sentence; fix YAML inline comment |
| `type_assign` | P3 | Strip rationale sentences; fix anti-example vocab |
| `build_order` | P3 | Specify build: field format; fix Areas vocab collision |
| `plan_kickback` | P3 | Strip Fabro nouns; reconcile Kickback description |
| `spot_verdict` | P3 | Strip rationale; fix emits |
| `spot_check` | P3 | Reorder scoping rule; fix card_id definition; fix emits |
| `lint` | P3 | Strip lint_route node name; declare cross-Area input |
| `self_check` | P3 | Strip Fabro wiring nouns |
| `grounding` | P3 | Remove one rationale sentence |
