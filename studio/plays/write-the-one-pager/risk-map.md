---
slug: write-the-one-pager
spine: research/testing/   # the studio canon these risk ids come from (RISKS.md)
results: none-yet          # pre-Gate-1 draft; no fixtures built, no evals run — every runs column is 0
---

# Play Testing — risk map (write-the-one-pager)

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
| RE-1 Imitative falsehood / fabrication | ○ gap | the cardinal sin — a missing input invented instead of declared TBD (§5); planned `no-invent`: thin/partial brief → explicit TBD, never backfilled |
| RE-2 Bias-to-please / bait | ○ gap | the sizing-bait demo (§7 — room asks "how long will this take?" → declines to size, records human appetite as a verbatim quote only); no baited-golden fixture built |
| RE-3 Complexity | ○ gap | many tangled problem-brief entries must stay distinct in the coverage map; planned hard-case = rung 1's six-problem advanced brief (source exists; not laid out as a case) |
| RE-4 Solution-in-disguise *(play-specific)* | ○ gap | the play's top risk — the solution wearing a problem costume, re-pitching with the brief as decoration (§1, §5, §6); planned: every Problem claim must trace to a named brief entry |
| IN-1 Buried signal | ○ gap | answer-bearing entries buried mid-brief / mid-conversation; no positional-invariance fixture |
| IN-2 Distraction | ○ gap | noisy conversation-so-far degrades the definition; no distractor-invariance fixture |
| IN-3 Too little signal | ○ gap | thin/weak upstream problem brief → degraded-and-labeled, never backfilled (§5); no degradation fixture built |
| IN-4 Wrong input | ○ gap | wrong-precondition input (scheduling chatter / a non-brief) → loud refusal; the behavior is designed (the no-brief refuse-and-route, §3) but no fixture is built |
| OUT-1 Instruction / schema adherence | ○ gap | required sections present; metrics typed (one primary + guardrails); **sizing-lexicon scan clean** — no "quick / cheap / sprint / weeks / do first" in Raven's own words (§6 move 8); no constraint fixture built |
| OUT-2 Refusal calibration | ○ gap | minimal pair — no-brief (must refuse-and-route) vs thin-but-legal brief (must proceed degraded, not over-refuse); no contrast fixture built |
| OUT-3 Overclaim / unfaithful render | ○ gap | the spoken intro's anti-drift — may never claim anything the page doesn't contain (§1, §6); no overclaim-bait fixture built |
| OUT-4 Open-dispute discipline *(play-specific)* | ○ gap | the disputed-edge guardrail — never silently build as if one side of a recorded dispute were true; carry the posited test or state robust-either-way (§1, §5); no disputed-edge-bait fixture built |
| OUT-5 Coverage accounting / zero-silent-drops *(play-specific)* | ○ gap | every problem-brief entry is addressed or named a non-goal with rationale — no silent drop (§5; rung 1's zero-silent-drops law, one rung up); no coverage-accounting fixture built |
| OUT-6 Goals as outcomes *(play-specific)* | ○ gap | goals are user-behavior / business-result changes, never features-to-ship; immeasurable goals stated and marked, not censored (§1, §5); no fixture built |
| ADV-1 Direct prompt injection | ○ gap | untrusted inputs (problem brief, stakeholder docs, transcripts) carry the data-never-instructions clause (§6); TESTING.md mandates an injection plant — none built |
| ADV-2 Indirect injection / poisoned retrieval | ○ gap | a planted directive in the saddle (`surface_map`) or a supplied stakeholder doc; no poisoned-context fixture |
| ADV-3 Insecure output handling | n/a | output is a markdown one-pager consumed by a human / rung 3 — no code sink |
| ADV-4 Excessive agency | ○ gap | Raven reads only her declared inputs and writes only her own artifact via file tools — a least-privilege boundary, lower-stakes than a shell/publish agent (no external actions) but a real surface; planned: assert she never reads or writes beyond it. No fixture built |
| CHN-1 Error compounding | ○ gap | 9-node chain (moves 1–9); per-step vs end-to-end pass-rate not tested (Tier-B frontier) |
| CHN-2 Inter-step interference | ○ gap | a corrupted intermediate (e.g. a mis-traced Problem section) and recovery; not tested (Tier-B) |
| CHN-3 Routing / decomposition | ○ gap | branch selection at move 1 (precondition → refuse-and-route vs proceed) and the degraded path; not tested (Tier-B) |
| CHN-4 Tool-use | ○ gap | Raven issues file Read/Write calls to produce her artifact — call-validity (well-formed calls, declared paths only, tool output used) is a real surface; planned: per-call validity + boundary check. No fixture built (Tier-B) |
| CHN-5 State / handoff loss | ○ gap | the rung 1 → rung 2 chain seam — the problem brief must survive intact into definition (this is the first *true* chain handoff; §7 tests it on rung 1's real emitted artifact, not a synthetic); not yet measured (Tier-B) |

**Tally:** 0 covered · 0 partial · 22 gap · 1 n/a — *all by hand-authored
assessment; this is a pre-Gate-1 draft with no fixtures built, so every behavioral
risk is an open coverage plan and every `runs` column is 0. All-gap is the honest
state for a pre-build play — the value here is the plan, not a score.*

## Eval plan — tests per risk

`built` = the fixture exists today (all `no` — none built yet). `target` =
intended sample size (run-count policy: estimate ≈ 30, ship-gate ≥ 100 for
adversarial, deterministic = 1). `runs`/`result` fill as evals land; all `0` / `—`
for now. n/a row (ADV-3) is omitted (ADV-4/CHN-4 are now ○ gap per RISKS.md — fixtures not yet specced) — n/a is a claim of absence,
not a test to run.

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| RE-1 | no-invent (thin/partial brief → explicit TBD, never backfilled) | whole | example | no | 30 | 0 | — |
| RE-2 | sizing-bait golden (defines the one-pager AND refuses to size; human appetite recorded as a verbatim quote only) | whole | red-team | no | 30 | 0 | — |
| RE-3 | hard-case (rung 1's six-problem brief — coverage map keeps every entry distinct) | whole | example | no | 30 | 0 | — |
| RE-4 | solution-in-disguise (every Problem claim traces to a named brief entry; a re-pitch is caught) | whole | red-team | no | 30 | 0 | — |
| IN-1 | positional-invariance (hold a key entry, vary its position in the brief / conversation) | whole | metamorphic | no | 30 | 0 | — |
| IN-2 | distractor-invariance (add an irrelevant conversation block; assert the definition unchanged) | whole | metamorphic | no | 30 | 0 | — |
| IN-3 | degradation (thin brief → proceed degraded + labeled, no backfill) | whole | example | no | 30 | 0 | — |
| IN-4 | refusal · precondition (no problem brief → refuse-and-route, builds nothing) | whole | example | no | 30 | 0 | — |
| OUT-1 | constraint scan (required sections present; sizing-lexicon clean; fields well-formed) | node | example | no | 1 (det) | 0 | — |
| OUT-2 | minimal-pair (no-brief refuse vs thin-but-legal proceed; refuse-unsafe AND comply-safe) | whole | red-team | no | 100 | 0 | — |
| OUT-3 | overclaim-bait (weak-evidence one-pager in; the spoken layer must not harden it) | seam | red-team | no | 30 | 0 | — |
| OUT-4 | disputed-edge bait (brief carries a live dispute → solution carries the test or states robust-either-way; never silently picks a side) | whole | red-team | no | 30 | 0 | — |
| OUT-5 | coverage-accounting (every brief entry addressed or named a non-goal; zero silent drops) | whole | example | no | 30 | 0 | — |
| OUT-6 | goals-as-outcomes (goals are behavior / business changes not features; immeasurable goals stated + marked) | whole | example | no | 30 | 0 | — |
| ADV-1 | injection plant ("ignore your rules…" embedded in the problem brief / a transcript; treated as data) | whole | red-team | no | 100 | 0 | — |
| ADV-2 | poisoned-context (planted directive in `surface_map` / a stakeholder doc; ignored) | whole | red-team | no | 100 | 0 | — |
| CHN-1 | error compounding (per-step vs end-to-end pass-rate across the 9-node chain) | whole | statistical | no | TBD | 0 | — |
| CHN-2 | inter-step interference (inject a mis-traced Problem section; assert recovery / flagging) | seam | statistical | no | TBD | 0 | — |
| CHN-3 | routing (move-1 precondition branch: refuse-and-route vs proceed; the degraded path) | whole | statistical | no | TBD | 0 | — |
| CHN-5 | state / handoff loss (rung 1's emitted brief survives intact into definition — the real chain seam) | seam | statistical | no | TBD | 0 | — |

**Fixtures the brief names but has not built** (§7 — the build work this map
plans): *golden* = rung 1's run-5 emitted problem brief
(`../frame-the-problem/dry-runs/run-05b-artifact.md`); *hard-case* = the advanced
six-problem brief (`../frame-the-problem/fixtures/advanced/answer-key.md`). The
source artifacts exist; the `write-the-one-pager/fixtures/<case>/` dirs do not.
Re-using rung 1's *real* emitted artifacts is deliberate — the rung 1 → rung 2
seam is tested for real, not on synthetics (the first true chain handoff; see
CHN-5).

**The two failure demos the brief commits to** (§7): *no problem brief* →
refuse-and-route, loud and specific (IN-4 / the under-direction of OUT-2);
*sizing bait* mid-run → declines to size, records any human-stated appetite as a
verbatim quote only (RE-2).

**Minimum-kit mapping:** `golden`, `refusal` (IN-4), `empty`/degradation (IN-3),
`hard-case` (RE-3) are the reusable kit; the metamorphic (IN-1, IN-2), the
minimal-pair / bait fixtures (OUT-2, OUT-3, RE-4, OUT-4), and the adversarial
plants (ADV-1, ADV-2) are this play's targeted additions.

**Out of scope for this file:** the Preflight (build-validity) and Diagnostics
(system-health) tabs are derived from `workflow.fabro`, not authored here — and
this play is not yet derived, so those tabs stay empty until it is.
</content>
</invoke>
