> **Inherited record — autopsy evidence; trusted as a historical record.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/model/doer-honesty-audit.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Doer-honesty audit — Atomic Conversion `[SW]` moves

Status: findings (Director to ratify the splits/retags). Run after the `tense_check` collapse, to
check whether other moves tagged `[SW]` (mechanical, a closed rule a tool could run) are actually
judgment-in-disguise — the same fault that made `tense_check` silently miss "*replacing* the wheel".

The bar (Solomon #5): a move tagged mechanical must be a **genuinely closed rule** — a competent
engineer could implement the exact algorithm from the prompt with no paragraph-reading. If the real
operation is reading-and-deciding wearing a rule's costume, it is `[SK]`.

## Verdicts

| Move | Verdict | Where the judgment hides | Concrete failure case | Recommendation |
|---|---|---|---|---|
| **spot_check** | **JUDGMENT-IN-DISGUISE** ⚠️ most dangerous | The cascade/reverse-link count is closed, but the rubric application is all reading: "HOW has *actual spec*?", "WHY is *reasoning not assertion*?" | A Standard's HOW says "thresholds are tuned per release per the guidelines." The check "HOW has thresholds?" sees the word *thresholds* and ticks PASS — but there is no actual value. A word-presence proxy passes a hollow Standard. | **Split:** keep `[SW]` cascade/reverse-link count + the verdict table; **retag the rubric application `[SK]`.** Do NOT ship as a closed tool. |
| **type_assign** | **JUDGMENT-IN-DISGUISE** | Every gate is a comprehension question ("do builders *consciously interact* with it?", the System-vs-Standard tie-break) — none computable from the unit text. | "Drop Tables by Level" lands cleanly on `Standard` *and* `Data Entity` *and* `System` — decided only by reading intent. The tree gives no deterministic answer. | **Split:** thin `[SW]` *string-validator* (emit only the 15 catalog strings) + the existing `[SK]` `type_resolve`; the walk itself is `[SK]`. Do NOT build `ax cards type` as a closed tool. |
| **collisions** | **HYBRID** | The three set ops are closed *given the keys*; the hidden judgment is the **join** — "planned unit maps onto an existing card" is concept-equivalence, not string equality. The prompt never defines the match function. | "Material Drop Tables" vs banked "Loot Tables by Level": a name/id join says no collision → emits a duplicate. "Provisions" (food) vs "Provisioning" (servers): false collision. | **Split:** `[SW]` set-difference *given an explicit id join* + an `[SK]` concept-equivalence step that produces the join. Only tool the set-diff. |
| **lint** | **HYBRID** | Count/presence/path/graph checks are closed; ~4 smuggled checks need comprehension: "link has a real *context phrase*", "*containment parent* linked", "linked note is *substantive*", "describes *behavior not rationale*". | WHERE has `[[Foraging System]] — see also`. The naked-link check passes ("has a context phrase") on a string that means nothing. | **Split:** ship `ax lint` for the pure count/presence/path/graph checks; **retag the context-quality / containment-parent / substantive / behavior-not-rationale checks `[SK]`** (they overlap `self_check`). The prompt's "no semantic judgment" claim is false for those bullets. |
| **build_order** | **CLOSED** ✅ | none | — (8 fixed phase buckets keyed on the assigned `card_type`, topological sort on the assigned `depends-on` DAG; a cycle is a defined error to *surface*, not a judgment). | **Keep `[SW]`, build the tool.** Real `ax` candidate — the cleanest of the seven. |
| **grade_compute** | **CLOSED** ✅ | none | — (weighted sum + lookup tables, all tabulated in `grade-computation.md`). Soft edges are *inputs it doesn't own* (expected count; the Vision-Capture WHEN flag) — pin those as typed inputs. | **Keep `[SW]`, build the tool.** Real `ax` candidate. |
| **completeness_list** | **CLOSED** ✅ the model citizen | none — it explicitly forbids the disguise: joins **by recorded id only**, refuses name-similarity ("that is NLP, not a closed rule"), surfaces unjoinable cards instead of guessing. | none as written. | **Keep `[SW]`, build the tool.** This is the **honesty template** the other moves should be rewritten against. |

## Bottom line — ranked by danger of the mislabel

1. **`spot_check` is the next `tense_check`, and the most dangerous** — it's a quality *gate* whose
   "mechanical" rubric ticks pass cards on word-presence, so it green-lights exactly the hollow
   Standards it exists to catch, and a false PASS cascades to every card that leans on that Standard.
   *(Adjacent to the grading-for-truth gap — see `grounding` move.)*
2. **`type_assign`** — comprehension all the way down; a confident mistype mis-shelves a card and
   poisons `build_order` and `lint`'s type-keyed checks downstream.
3. **`collisions` and `lint`** — hybrids hiding a real failure (the undefined concept-join silently
   duplicating cards; the "context phrase"/"containment parent" checks passing on string presence).
4. **`build_order`, `grade_compute`, `completeness_list`** — the three genuinely closed `ax` tools;
   build these as-is, with `completeness_list` as the template.

The pattern is identical to the contamination root cause: a doer claimed to be one thing while doing
another. The fix is the same discipline — make the claim honest (split the mechanical half from the
judgment half), and only tool the genuinely closed half.
