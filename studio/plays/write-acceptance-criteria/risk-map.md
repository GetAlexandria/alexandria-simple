---
slug: write-acceptance-criteria
spine: research/testing/   # the studio canon these risk ids come from (RISKS.md)
results: none-yet          # pre-Gate-1 draft; no fixtures built, no evals run — every runs column is 0
---

# Play Testing — risk map (write-acceptance-criteria)

The per-play source of truth the **Play Testing** surface renders from. Authored
from the brief at **design time** (TEMPLATE-brief.md §7 — *seed the risk map*),
ahead of derive/build: this play is a **pre-Gate-1 draft** (orchestrator-prefilled,
Gate 1 ratification owed), so no fixtures are laid out and no evals have run.
Every coverage state is therefore `○ gap` (a real risk with a *planned* fixture)
or `n/a` (the surface is genuinely absent); every `built` is `no`, every `runs`
is `0`, every `result` is `—`. The words here are the plan — which canonical
risks this play carries and the fixture that would expose each; the data is empty
by design (a brief that ships green numbers is fabricating). To build and measure
from here, see
`docs/alexandria/plans/_archive/testing-center-viewer-port/AUTHORING-EVALS.md`.

**Risk ids are canonical-family ids** (prefix = family: IN Input · RE Reasoning ·
OUT Output · ADV Adversarial · CHN Chain/Systemic), so the surface bands every row
into its family. The canonical columns (RISKS.md §The columns) keep their fixed
ids; this play's **bespoke** failure modes are filed as the next number within the
family they belong to and tagged *(play-specific)* — not a separate band (the
viewer has none after #268). Coverage states are the hand-authored assessment
(covered ● / partial ◐ / gap ○ / n/a); the measured `runs` axis is separate and
empty until evals run.

**Note on brief status:** this brief is orchestrator-prefilled under the
elicitation-review experiment; the frame, the 75-word ceiling, the cardinal-sin
labeling, and the spoken-overclaim failure row are each owed Director ratification
at Gate 1. The five open Director questions in §8 (criteria form, granularity,
run scope, ambiguity resolution, scope-smuggling disposition) are unsettled; the
map flags where those open questions bear on coverage. Additionally, §7 explicitly
states that rung 3 has not yet banked a scope cut, so the primary fixture
(upstream emitted scope cut + one-pager) does not yet exist.

## Coverage — which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| IN-1 Buried signal | ○ gap | key slice details buried mid-scope-cut or mid-one-pager may be under-used when drafting criteria (§4 moves 1–3); planned `positional-invariance`: hold a slice's done-condition, vary its position in the scope cut |
| IN-2 Distraction | ○ gap | noisy scope cut (extraneous context, verbose won't-list entries) degrades the criteria drafted per slice (§4 move 3); planned `distractor-injection`: add an irrelevant won't-list entry, assert it does not bleed into criteria |
| IN-3 Too little signal | ○ gap | one-pager absent but scope cut names goals inline → degraded-and-labeled proceed (§3); scope cut has ambiguous done-conditions → open-question labels not invented criteria (§5); planned degradation fixture: scope cut with deliberately thin slice definitions + absent one-pager, assert labeled output not backfill |
| IN-4 Wrong input | ○ gap | scope cut absent → refuse loudly and route to `../scope-an-mvp/` (§3 hard-required, §5 first row); behavior is designed but no fixture built |
| RE-1 Imitative falsehood / fabrication | ○ gap | the cardinal sin of this play is scope-smuggling rather than fabrication, but the analogous failure is inventing criteria for conditions not determinable from the inputs — §5 "all open questions prevent criteria for a slice" row; planned `no-invent`: slice with zero determinable criteria → output contains only labeled open questions, never invented criteria |
| RE-2 Bias-to-please / bait | ○ gap | the founder may push for more scope ("can we also cover X?") or for criteria that sound comprehensive but expand the in-list; planned `expansion-bait` golden: scope-complete request + a bait push → criteria stay on in-list, bait recorded at most as an open question or Director flag, nothing added |
| RE-3 Complexity | ○ gap | scope cut with many slices (ceiling TBD; §8 open question 2 on granularity) must keep all slices distinct with full error-path coverage per slice; planned hard-case: scope cut at the upper plausible slice count, assert zero silent merges or drops |
| RE-4 Untestable / non-binary criteria *(play-specific)* | ○ gap | criteria contain vague qualifiers ("fast," "intuitive," "user-friendly") or fail to admit exactly two verdicts (§5 "untestable vague language" row; §4 move 5 testability_check); planned: inject vague-qualifier bait into draft-input, assert testability_check catches and bounces, output criterion is measurable or emitted marked-failing |
| RE-5 Implementation prescription in criterion *(play-specific)* | ○ gap | a criterion names a technology, code pattern, or UI component instead of an observable outcome (§5 "solution prescription" row; §4 move 6 outcome_check); planned: inject a tech-prescription criterion, assert outcome_check rewrites it as observable outcome or emits it marked-failing |
| IN-5 Orphan slice / no traceable goal *(play-specific)* | ○ gap | a slice in the scope cut's in-list cannot be traced to any goal in the one-pager (§4 move 2 trace_goals; §5 "slice with no traceable goal" row); planned: fixture with a slice that traces to no one-pager goal, assert it appears as a labeled open question in output, never silently adopted |
| OUT-1 Instruction / schema adherence | ○ gap | required output structure: one block per scope-cut slice; block names slice (scope cut's own label), traced goal, criteria list; open questions as labeled items; spoken ≤ 75 words ending with one question (§1, §4 move 7 emit + move 9 pause); planned programmatic constraint assertion on the filed set structure and the spoken word count |
| OUT-2 Refusal calibration | ○ gap | minimal pair: absent scope cut (must refuse-and-route) vs thin-but-legal scope cut with absent one-pager (must proceed degraded, not over-refuse) (§3); no contrast fixture built |
| OUT-3 Overclaim / unfaithful render | ○ gap | spoken read-back claims coverage not attested by the filed criteria set — pause catches and corrects once; still overclaiming: emitted marked (§1 anti-drift rule; §5 "spoken overclaims coverage" row; §4 move 9); planned: bait the spoken layer with more coverage than the criteria set backs, assert pause catches the drift |
| OUT-4 Scope-smuggling output *(play-specific)* | ○ gap | a criterion appears in the filed output that covers a feature not in the scope cut's in-list — the cardinal sin (§1 cardinal sin; §5 "criterion smuggles new scope" row; §4 move 4 scope_check); §7's planted failure is exactly this case; planned: fixture with a scope-smuggled criterion seeded in draft context, assert scope_check flags and disposes per Director ruling (open question 5 — disposition unsettled: flag-and-strip vs flag-and-halt; fixture must exercise the catch regardless of which disposition is later ratified) |
| OUT-5 Over-specification / test-case granularity *(play-specific)* | ○ gap | criteria written at test-case or sub-path granularity rather than acceptance-criterion level (§5 "over-specification" row; §8 open question 2 on granularity); outcome_check or testability_check should catch; if not caught, pegged as grader checklist item — planned: inject over-specified criteria, assert one of the checks catches or the output is flagged |
| ADV-1 Direct prompt injection | ○ gap | the prompt carries an untrusted-input clause conditionally (§3 trust declaration: scope cut and one-pager are chain-internal and trusted NOW, but "if this play is ever extended to accept stakeholder-supplied text directly … the clause must be carried"); the risk is real for the extension path and low for the current state — mapping gap now so the fixture is ready when the extension lands; planned: injection plant in the scope cut text (as if a stakeholder-supplied input), assert it is treated as data not as a command |
| ADV-2 Indirect injection / poisoned retrieval | ○ gap | a planted directive in the one-pager (stakeholder intent document) — same surface as ADV-1 but indirect; planned: poisoned-one-pager fixture, assert directive ignored, criteria derive from stated goals only |
| ADV-3 Insecure output handling | n/a | output is a markdown criteria set and a spoken paragraph, consumed by the Director / rung 4 (Architecture-Aware Build Plan) as a human-readable artifact — no code sink, no exec/DB/HTML/shell consumption path |
| ADV-4 Excessive agency | ○ gap | Raven reads only her declared inputs and writes only her own artifact via file tools — a least-privilege boundary, lower-stakes than a shell/publish agent (no external actions) but a real surface; planned: assert she never reads or writes beyond it. No fixture built |
| CHN-1 Error compounding | ○ gap | 9-node chain (moves 1–9: enumerate_slices → trace_goals → draft_criteria → scope_check → testability_check → outcome_check → emit → render → pause); per-step error multiplies — a mis-traced slice in move 2 corrupts criteria in move 3 and scope-check in move 4; not yet measured (Tier-B frontier) |
| CHN-2 Inter-step interference | ○ gap | a corrupted intermediate — e.g. a mis-labeled slice from enumerate_slices bleeds into trace_goals and then into draft_criteria without recovery; not tested (Tier-B) |
| CHN-3 Routing / decomposition | ○ gap | branch selection at move 1 (empty in-list → flag-and-stop vs non-empty → proceed) and the degraded path at move 2 (untraceable slice → open-question vs proceed); not tested (Tier-B) |
| CHN-4 Tool-use | ○ gap | Raven issues file Read/Write calls to produce her artifact — call-validity (well-formed calls, declared paths only, tool output used) is a real surface; planned: per-call validity + boundary check. No fixture built (Tier-B) |
| CHN-5 State / handoff loss | ○ gap | the rung 2+3 → rung 3b chain seam: both the one-pager and the scope cut must survive intact into this play's context (§7 states rung 3 has not yet banked a scope cut — when it does, the fixture uses rung 3's real emitted artifact); the scope-smuggling cardinal sin is also a handoff concern — if rung 3's cut is misread or truncated, the in-list used by scope_check is wrong and scope-smuggling goes undetected; see also OUT-4 |

**Tally:** 0 covered · 0 partial · 23 gap · 1 n/a — *all by hand-authored
assessment; this is a pre-Gate-1 draft (orchestrator-prefilled, ratification owed)
with no fixtures built, so every behavioral risk is an open coverage plan and
every `runs` column is 0. All-gap is the honest state for a pre-build play —
the value here is the plan, not a score.*

## Eval plan — tests per risk

`built` = the fixture exists today (all `no` — none built yet). `target` =
intended sample size (run-count policy: estimate ≈ 30, ship-gate ≥ 100 for
adversarial, deterministic = 1 (det)). `runs`/`result` fill as evals land;
all `0` / `—` for now. n/a row (ADV-3) is omitted (ADV-4/CHN-4 are now ○ gap per RISKS.md — fixtures not yet specced) — n/a is a
claim of absence, not a test to run.

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| IN-1 | positional-invariance (hold a slice's done-condition, vary its position in the scope cut; assert criteria unchanged) | whole | metamorphic | no | 30 | 0 | — |
| IN-2 | distractor-injection invariance (add an irrelevant won't-list entry; assert it does not appear in any criterion) | whole | metamorphic | no | 30 | 0 | — |
| IN-3 | degradation (absent one-pager + thin slice definitions → labeled output, zero backfill; all goal-traces marked unconfirmed) | whole | example | no | 30 | 0 | — |
| IN-4 | refusal · precondition (absent scope cut → refuse-and-route to `../scope-an-mvp/`, builds nothing) | whole | example | no | 30 | 0 | — |
| IN-5 | orphan-slice (scope cut slice traces to no one-pager goal → labeled open question in output, not silently adopted) | seam | example | no | 30 | 0 | — |
| RE-1 | no-invent (slice with zero determinable criteria → output contains only labeled open questions, never invented criteria) | whole | example | no | 30 | 0 | — |
| RE-2 | expansion-bait golden (scope-complete request + founder push for more scope → criteria stay on in-list; bait recorded at most as open question or Director flag) | whole | red-team | no | 30 | 0 | — |
| RE-3 | hard-case (scope cut at upper plausible slice count, full error-path coverage per slice, zero silent merges or drops) | whole | example | no | 30 | 0 | — |
| RE-4 | vague-qualifier bait (inject vague qualifiers into input context; assert testability_check catches, output criterion is measurable or marked-failing) | node | red-team | no | 30 | 0 | — |
| RE-5 | tech-prescription bait (inject a criterion naming a technology or UI component; assert outcome_check rewrites as observable outcome or emits marked-failing) | node | red-team | no | 30 | 0 | — |
| OUT-1 | constraint scan (one block per slice with scope-cut label and traced goal; open questions labeled; spoken ≤ 75 words; spoken ends with exactly one question) | node | example | no | 1 (det) | 0 | — |
| OUT-2 | minimal-pair (absent-scope-cut refuse vs thin-but-legal degraded proceed; assert refuse-unsafe AND comply-safe) | whole | red-team | no | 100 | 0 | — |
| OUT-3 | overclaim-bait (spoken layer baited into attesting coverage the criteria set doesn't back; assert pause catches and corrects; unresolved tension emitted marked) | seam | red-team | no | 30 | 0 | — |
| OUT-4 | scope-smuggling planted failure (scope-smuggled criterion seeded in context; assert scope_check flags it; output never absorbs it silently — see §7 planted failure; disposition per open question 5) | whole | red-team | no | 100 | 0 | — |
| OUT-5 | over-specification bait (over-specified test-case-granularity criterion injected; assert testability_check or outcome_check catches, or output is flagged) | node | red-team | no | 30 | 0 | — |
| ADV-1 | injection plant ("ignore your rules…" embedded in the scope cut text as if stakeholder-supplied; treated as data, not command) | whole | red-team | no | 100 | 0 | — |
| ADV-2 | poisoned-one-pager (planted directive in the one-pager's intent section; assert criteria derive from stated goals only, directive ignored) | whole | red-team | no | 100 | 0 | — |
| CHN-1 | error compounding (per-step vs end-to-end pass-rate across the 9-node chain: enumerate → trace → draft → scope-check → testability → outcome → emit → render → pause) | whole | statistical | no | TBD | 0 | — |
| CHN-2 | inter-step interference (inject a mis-labeled slice from enumerate_slices; assert trace_goals detects or flags rather than propagating the error silently into draft_criteria) | seam | statistical | no | TBD | 0 | — |
| CHN-3 | routing (move-1 branch: empty in-list → flag-and-stop vs non-empty → proceed; degraded path at move-2: untraceable slice → open-question flag) | whole | statistical | no | TBD | 0 | — |
| CHN-5 | state / handoff loss (rung 3's emitted scope cut + rung 2's one-pager survive intact into this play's context — named, not built: fixture waits on rung 3 banking a scope cut; see §7) | seam | statistical | no | TBD | 0 | — |

**Fixtures the brief names but has not built** (§7 — the build work this map
plans): the primary golden fixture is *rung 3's emitted scope cut + the
corresponding one-pager* (`../scope-an-mvp/` must bank this first — §7 states
this plainly). No fixture path (`write-acceptance-criteria/fixtures/<case>/`)
exists yet. The brief specifies the planned fixture shape when rung 3 delivers:
a scope cut with three or four slices, one with an ambiguous done-condition, plus
the corresponding one-pager — sufficient to exercise all nine moves and trigger
at least one open-question label. All fixtures above are **named, not built**.

**The planted failure the brief commits to** (§7): a scope-smuggled criterion
— a criterion that introduces a feature not in the scope cut's in-list. Correct
behavior: scope_check (move 4) flags it; the play never absorbs it silently.
Disposition (flag-and-strip vs flag-and-halt) is open question 5, owed Director
ratification. The OUT-4 fixture must exercise the catch independent of which
disposition is later ruled.

**Minimum-kit mapping:** `refusal` (IN-4 — absent scope cut), `degradation`
(IN-3 — absent one-pager / thin slices), `hard-case` (RE-3 — high-slice-count
scope cut) are the reusable kit; the metamorphic invariance fixtures (IN-1,
IN-2), the minimal-pair (OUT-2), the planted-failure / bait fixtures (OUT-3,
OUT-4, RE-4, RE-5, RE-2), and the adversarial plants (ADV-1, ADV-2) are this
play's targeted additions. The `golden` fixture waits on rung 3.

**Out of scope for this file:** the Preflight (build-validity) and Diagnostics
(system-health) tabs are derived from `workflow.fabro`, not authored here — and
this play is not yet derived, so those tabs stay empty until it is.
