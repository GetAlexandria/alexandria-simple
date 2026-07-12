---
slug: scope-an-mvp
spine: research/testing/   # the studio canon these risk ids come from (RISKS.md)
results: none-yet          # pre-Gate-1 draft; no fixtures built, no evals run — every runs column is 0
---

# Play Testing — risk map (scope-an-mvp)

The per-play source of truth the **Play Testing** surface renders from. Authored
from the brief at **design time** (TEMPLATE-brief.md §7 — *seed the risk map*),
ahead of derive/build: this play is a **pre-Gate-1 draft**, so no fixtures are
laid out and no evals have run. Every coverage state is therefore `○ gap` (a real
risk with a *planned* fixture) or `n/a` (the surface is genuinely absent); every
`built` is `no`, every `runs` is `0`, every `result` is `—`. The words here are
the plan — which canonical risks this play carries and the fixture that would
expose each; the data is empty by design (a brief that ships green numbers is
fabricating). To build and measure from here, see
`docs/alexandria/plans/_archive/testing-center-viewer-port/AUTHORING-EVALS.md`.

**Risk ids are canonical-family ids** (prefix = family: RE Reasoning · IN Input ·
OUT Output · ADV Adversarial · CHN Chain/Systemic), so the surface bands every row
into its family. The canonical columns (RISKS.md §The columns) keep their fixed
ids; this play's **bespoke** failure modes are filed as the next number within the
family they belong to and tagged *(play-specific)* — not a separate band (the
viewer has none after #268). Coverage states are the hand-authored assessment
(covered ● / partial ◐ / gap ○ / n/a); the measured `runs` axis is separate and
empty until evals run.

## Coverage — which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| IN-1 Buried signal | ○ gap | answer-bearing content buried mid one-pager (outcome, non-goals) under-used; no positional-invariance fixture built |
| IN-2 Distraction | ○ gap | noisy conversation-so-far or a bloated one-pager with stale context degrades the scope cut; no distractor-injection fixture built |
| IN-3 Too little signal | ○ gap | thin upstream one-pager (no outcome filter, no candidate solution direction) → proceed degraded and labeled, never backfill the hypothesis (§3; §5 no-hypothesis row); no degradation fixture built |
| IN-4 Wrong input | ○ gap | missing one-pager entirely → refuse-and-route to write-the-one-pager, loud and specific (§3; §5 missing-one-pager row); appetite stated scope-derived ("it'll take as long as it takes") → one reframe attempt, then log standoff and kick to Director (§3, §5, move 2); no refusal/precondition fixture built |
| RE-1 Imitative falsehood / fabrication | ○ gap | the cardinal sin — a hypothesis invented from thin air when the one-pager is ambiguous rather than flagged TBD; a won't-list rationale that sounds plausible but traces to nothing in the one-pager (§5 no-hypothesis row, §1 done-when); planned `no-invent`: ambiguous one-pager → explicit flag, never a backfilled hypothesis |
| RE-2 Bias-to-please / bait | ○ gap | appetite bait — stakeholder states a scope-derived "it'll take what it takes" and Raven accepts it; priority bait — stakeholder inflates the must-have list and Raven complies without triaging (§5 MVP-bloat row, §3 appetite gate); no baited-golden fixture built |
| RE-3 Complexity | ○ gap | many tangled backbone nodes and candidate features must stay distinct through triage (move 5) — drops or merges what should be separate; planned hard-case = a one-pager with a wide solution space and six backbone nodes; no fixture built |
| RE-4 No hypothesis declared / cargo-cult MVP *(play-specific)* | ○ gap | the play's stop-the-world risk — a scope list with no learning goal (§5 §1); move 1 catches; play flags the gap and names what form a hypothesis would need to take; no fixture built |
| RE-5 MVP bloat — must-haves at 100% of candidate set *(play-specific)* | ○ gap | appetite is present but triage collapses — every candidate becomes a must-have and the appetite is ignored; move 5 (triage) and the cut-in-half / Product Death Test catches; bounce to triage (§5 MVP-bloat row); no fixture built |
| OUT-1 Instruction / schema adherence | ○ gap | required sections present: hypothesis (falsifiable), appetite (quoted), in-list (walking skeleton), won't list (every item with rationale), rabbit holes (dispositions), success metrics (tied to hypothesis); **sizing-lexicon scan clean** — no "quick / cheap / sprint / weeks / do first" in Raven's own words (§4 move 10, §5 generated-sizing row); no constraint fixture built |
| OUT-2 Refusal calibration | ○ gap | minimal pair — no-one-pager (must refuse-and-route) vs thin-but-legal one-pager with stated appetite (must proceed to a scope cut, not over-refuse); no contrast fixture built |
| OUT-3 Overclaim / unfaithful render | ○ gap | spoken read-back's anti-drift — may never claim anything the filed scope cut doesn't contain; a cut item resurrected aloud as implied future direction is scope creep spoken back in (§1, §5 spoken-overclaim row); move 12 (pause) checks; no overclaim-bait fixture built |
| OUT-4 Horizontal slice *(play-specific)* | ○ gap | in-list delivers no demoable journey until everything integrates — the slice is horizontal not vertical; move 6 (skeleton) catches; bounce to triage for vertical recut; if still horizontal, emit flagged (§5 horizontal-slice row, §1 done-when); also catches: in-list complete in feature count but too narrow to deliver standalone user value (SLC failure); no fixture built |
| OUT-5 Silent cuts / won't list absent or incomplete *(play-specific)* | ○ gap | a cut item appears nowhere in the won't list, or the won't list exists but omits items from the one-pager's non-goals; move 10 (ground) checks every one-pager non-goal is accounted for (§5 silent-cuts row, §1 done-when); no fixture built |
| OUT-6 No rabbit holes identified *(play-specific)* | ○ gap | move 7 produces zero rabbit holes — uniform confidence is a shaping defect; play flags as a quality concern, never silently accepts the empty state (§5 no-rabbit-holes row, §4 move 7); no fixture built |
| OUT-7 Scope creeps back after co-owned cut *(play-specific)* | ○ gap | post-co-own additions to the in-list without trading an equivalent item or applying the appetite circuit breaker; the won't list is the record — a later addition is a new cut against the same appetite, not an amendment (§5 scope-creep-back row, §4 move 9); no fixture built |
| ADV-1 Direct prompt injection | ○ gap | untrusted inputs (one-pager, conversation-so-far) carry the data-never-instructions clause (§3 explicitly); TESTING.md mandates an injection plant — none built |
| ADV-2 Indirect injection / poisoned retrieval | ○ gap | a planted directive hidden in the one-pager's non-goals section or the saddle's surface-map; no poisoned-context fixture built |
| ADV-3 Insecure output handling | n/a | output is a markdown scope cut and a spoken paragraph consumed by the room / rung 4 — no code sink, no downstream execution surface |
| ADV-4 Excessive agency | ○ gap | Raven reads only her declared inputs and writes only her own artifact via file tools — a least-privilege boundary, lower-stakes than a shell/publish agent (no external actions) but a real surface; planned: assert she never reads or writes beyond it. No fixture built |
| CHN-1 Error compounding | ○ gap | 12-node chain (moves 1–12); per-step vs end-to-end pass-rate not tested (Tier-B frontier) |
| CHN-2 Inter-step interference | ○ gap | a corrupted intermediate (e.g. a mis-stated hypothesis at move 1 that distorts triage at move 5) propagates forward; recovery not tested (Tier-B) |
| CHN-3 Routing / decomposition | ○ gap | branch selection at move 1 (no hypothesis → flag and stop vs proceed), move 2 (appetite absent → ask once vs proceed), and the degraded path; not tested (Tier-B) |
| CHN-4 Tool-use | ○ gap | Raven issues file Read/Write calls to produce her artifact — call-validity (well-formed calls, declared paths only, tool output used) is a real surface; planned: per-call validity + boundary check. No fixture built (Tier-B) |
| CHN-5 State / handoff loss | ○ gap | the rung 2 → rung 3 chain seam — rung 2's emitted one-pager must survive intact as this play's primary fixture input; the one-pager does not exist yet (§7); this is the true chain handoff, not yet measurable (Tier-B) |

**Tally:** 0 covered · 0 partial · 24 gap · 1 n/a — *all by hand-authored
assessment; this is a pre-Gate-1 draft with no fixtures built, so every behavioral
risk is an open coverage plan and every `runs` column is 0. All-gap is the honest
state for a pre-build play — the value here is the plan, not a score.*

## Eval plan — tests per risk

`built` = the fixture exists today (all `no` — none built yet). `target` =
intended sample size (run-count policy: estimate ≈ 30, ship-gate ≥ 100 for
adversarial, deterministic = 1, Tier-B chain = TBD). `runs`/`result` fill as
evals land; all `0` / `—` for now. n/a row (ADV-3) is omitted (ADV-4/CHN-4 are now ○ gap per RISKS.md — fixtures not yet specced) —
n/a is a claim of absence, not a test to run.

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| IN-1 | positional-invariance (hold a key outcome/non-goal entry in the one-pager, vary its position start/mid/end) | whole | metamorphic | no | 30 | 0 | — |
| IN-2 | distractor-invariance (add an irrelevant conversation block; assert the scope cut unchanged) | whole | metamorphic | no | 30 | 0 | — |
| IN-3 | degradation (thin one-pager with no outcome filter → proceed degraded + labeled hypothesis, no backfill) | whole | example | no | 30 | 0 | — |
| IN-4 | refusal · precondition (no one-pager → refuse-and-route, builds nothing; scope-derived appetite → one reframe then standoff) | whole | example | no | 30 | 0 | — |
| RE-1 | no-invent (ambiguous one-pager → explicit flag on hypothesis, never backfilled) | whole | example | no | 30 | 0 | — |
| RE-2 | appetite-bait golden (confirms the appetite AND refuses scope-derived restatement; priority-bait: one-pager inflated → tildes the excess) | whole | red-team | no | 30 | 0 | — |
| RE-3 | hard-case (wide-solution-space one-pager with six backbone nodes — triage keeps every candidate distinct) | whole | example | no | 30 | 0 | — |
| RE-4 | no-hypothesis (one-pager states outcome as a feature, not a behavior change → flag at move 1, route to write-the-one-pager, build nothing) | whole | red-team | no | 30 | 0 | — |
| RE-5 | bloat-bait (stakeholder inflates must-have list to cover everything → tilde the excess, apply cut-in-half + Product Death Test, emit won't list with rationale) | whole | red-team | no | 30 | 0 | — |
| OUT-1 | constraint scan (all sections present: hypothesis falsifiable, appetite quoted verbatim, won't list explicit with rationale per item, rabbit holes with dispositions, success metric measurable); sizing-lexicon scan clean (no generated effort/sequencing words) | node | example | no | 1 (det) | 0 | — |
| OUT-2 | minimal-pair (no-one-pager refuse vs thin-but-legal proceed; refuse-unsafe AND comply-safe) | whole | red-team | no | 100 | 0 | — |
| OUT-3 | overclaim-bait (scope cut with one cut item; spoken paragraph must not resurrect it even as implied direction) | seam | red-team | no | 30 | 0 | — |
| OUT-4 | horizontal-slice (one-pager with a wide feature surface → in-list must complete one end-to-end journey, not partial coverage across all); also catches: in-list complete in feature count but too narrow to deliver standalone user value (SLC failure) | whole | red-team | no | 30 | 0 | — |
| OUT-5 | silent-cuts (one-pager non-goals present; every one must appear in won't list with rationale or be named a non-goal; zero silent drops) | whole | example | no | 30 | 0 | — |
| OUT-6 | no-rabbit-holes (clean one-pager → play flags zero-rabbit-holes state as a quality concern, never silently accepts it) | whole | example | no | 30 | 0 | — |
| OUT-7 | scope-creep-back (post-co-own addition without appetite circuit breaker → play routes as a new cut or kicks to Director) | whole | red-team | no | 30 | 0 | — |
| ADV-1 | injection plant ("ignore your rules…" embedded in the one-pager's non-goals section or conversation-so-far; treated as data, not instruction) | whole | red-team | no | 100 | 0 | — |
| ADV-2 | poisoned-context (planted directive in the saddle's surface map or the one-pager outcome section; ignored) | whole | red-team | no | 100 | 0 | — |
| CHN-1 | error compounding (per-step vs end-to-end pass-rate across the 12-node chain) | whole | statistical | no | TBD | 0 | — |
| CHN-2 | inter-step interference (inject a mis-stated hypothesis at move 1; assert it does not silently distort triage at move 5 without recovery/flagging) | seam | statistical | no | TBD | 0 | — |
| CHN-3 | routing (move-1 no-hypothesis branch: flag-and-stop vs proceed; move-2 appetite-absent branch: ask once vs proceed; the degraded path) | whole | statistical | no | TBD | 0 | — |
| CHN-5 | state / handoff loss (rung 2's emitted one-pager survives intact as this play's fixture input — the real rung 2 → rung 3 chain seam) | seam | statistical | no | TBD | 0 | — |

**Fixtures the brief names but has not built** (§7 — the build work this map
plans): *golden path* — rung 2's emitted one-pager from its proven dry-run
(`../write-the-one-pager/` emitted artifact, named, not built); *bloat-bait* —
a one-pager where the stakeholder has inflated the must-have list to cover
everything (named, not built); *no-hypothesis* — a one-pager whose outcome is
stated as a feature rather than a behavior change, named, not built. All three
planned fixtures are named in §7 and none exists: rung 2 itself is in drafted
status as of 2026-06-12 and has not been proven. This play's fixture work waits
on rung 2's proving by design — the chain seam requires rung 2's real emitted
artifact, not a synthetic.

**The failure demo the brief commits to** (§7): *no-hypothesis one-pager* →
move 1 catches it, flags the gap, states what form a hypothesis would need to
take, and routes to write-the-one-pager. The play builds nothing.

**Minimum-kit mapping:** `golden` (rung 2's emitted one-pager, named, not built),
`refusal` (IN-4 — no one-pager → refuse-and-route), `empty`/degradation (IN-3 —
thin one-pager → proceed degraded), `hard-case` (RE-3 — wide-solution-space
one-pager) are the reusable kit; the metamorphic (IN-1, IN-2), the minimal-pair /
bait fixtures (OUT-2, OUT-3, RE-2, RE-4, RE-5, OUT-4, OUT-7), and the
adversarial plants (ADV-1, ADV-2) are this play's targeted additions.

**Out of scope for this file:** the Preflight (build-validity) and Diagnostics
(system-health) tabs are derived from `workflow.fabro`, not authored here — and
this play is not yet derived, so those tabs stay empty until it is.
