# RISKS — the canonical risk-column spine

The comparable backbone of the testing center. Every play's **Play Testing**
surface renders against these columns, so coverage is legible *and* comparable
across plays. A column is one named way a play can fail; a play marks each as
**covered**, **partial**, **gap**, or **n/a**.

**The id prefix *is* the family.** `IN` Input · `RE` Reasoning · `OUT` Output ·
`ADV` Adversarial · `CHN` Chain/Systemic. The surface bands every row by that
prefix (`riskFamily()` in `evalPlan.ts`) — so **there is no "play-specific"
family**, and a row whose id lacks a canonical prefix renders as *misfiled at
source*, never a catch-all band.

## How a play carries a bespoke risk — in-family, not a separate layer

Plays carry risks the universal columns don't name — Frame the Problem's
"solution-in-disguise," its "open-dispute discipline." These are **input /
reasoning / output / adversarial / systemic risks in disguise**, so each files
**in its canonical family under a canonical-prefix id**: the next free number in
that family (`RE-4`, `RE-5`, `IN-5`, `OUT-4`, `OUT-5`), never a separate,
non-canonical band. The prefix bands them on the surface like any other row.
(This replaces the earlier "two layers stack: canonical columns + additive
play-specific rows" model — there is one taxonomy, and bespoke risks live inside
it.)

**Comparability — what an id means across plays.** The **universal columns**
(`IN-1..4`, `RE-1..3`, `OUT-1..3`, `ADV-1..4`, `CHN-1..5`) mean the same thing in
every play, so their coverage is **cross-play comparable** — that is the spine's
whole job. The **per-play `RE-4`+ ids are bespoke**: same family, same prefix
convention, but the specific risk is this play's — a `RE-4` in one play and a
`RE-4` in another are *not* the same risk and are *not* cross-play comparable.
That is the deliberate trade: bespoke risks band correctly today without minting
a fake-universal column. The documented escape hatch — when a bespoke risk
recurs across plays and earns a real shared id — is the **master center**,
abstracted bottom-up (an explicit `family:` field + a shared spine), per
`docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md` §4 and slice §9.4
(Playmaker Pipeline Phase 4). Until then, ids stay stable and per-play.

## Provenance tiers (how much we trust the column)

- **grounded** — external primary research (`grounding.md`, verified 3-0).
- **canon** — our own established testing practice (`TESTING.md` fixture kit),
  proven in our use but not externally research-grounded.
- **hypothesis** — Tier-B frontier; not yet grounded anywhere. We test for it
  and carry it as our own canon (see `grounding.md` §5, `tier-b-research-plan.md`).

## Coverage states (how a play marks a column)

- **covered** ● — a fixture exposes the risk and the play passes.
- **partial** ◐ — exposed, mostly holds, a known crack carried on the grader's
  checklist (`known-fps.md`).
- **gap** ○ — no fixture yet. The empty space.
- **n/a** — the risk's precondition doesn't exist for this play (e.g. no code
  sink downstream → no ADV-3 insecure-output-handling risk). N/A is a *claim*,
  not a dodge: it asserts the surface is **absent**, and a false absence claim is
  worse than an honest gap. **Reading inputs and writing an artifact is tool use**
  — a Raven play that reads its declared inputs and writes its output through file
  Read/Write tools therefore has an ADV-4 (least-privilege scope) and a CHN-4
  (file-tool call-validity) surface, even with no shell/network/publish. Those are
  **gaps** (low-severity, often unbuilt), not n/a. Reserve n/a for a genuinely
  absent surface (ADV-3 with no downstream sink; CHN-* on a single-node play).

---

## The columns

### Phase 1 — Input (what comes in)

| id | column | the risk | default fixture pattern | tier | source |
|---|---|---|---|---|---|
| IN-1 | Buried signal | the answer-bearing content sits mid-context and is silently under-used (U-shaped position bias) | positional invariance: hold the answer, vary its position (start/mid/end) | grounded | Liu *Lost in the Middle* |
| IN-2 | Distraction | irrelevant/noisy/padded input degrades the output even on otherwise-solvable cases | distractor-injection invariance: add an irrelevant clause, assert output unchanged | grounded | Shi *Easily Distracted* |
| IN-3 | Too little signal | a thin-but-legal input (weak/absent optional context) | the degradation case: proceed degraded + labeled, never backfill | canon | TESTING.md kit |
| IN-4 | Wrong input | the input fails the play's precondition entirely | the refusal case: loud, specific refusal, never a degraded attempt | canon | TESTING.md kit |

### Phase 2 — Reasoning (what it does)

| id | column | the risk | default fixture pattern | tier | source |
|---|---|---|---|---|---|
| RE-1 | Imitative falsehood / fabrication | confidently emits a plausible-but-false claim, or invents content not in the input | known-misconception fixture + "never invent" assertion; faithfulness check vs source | grounded | TruthfulQA |
| RE-2 | Bias-to-please / bait | takes the bait — a pitched solution, a priority/sizing/conviction lure — to be helpful | baited golden: do the work AND refuse the bait | canon | TESTING.md kit (sycophancy: ungrounded, candidate research) |
| RE-3 | Complexity | many tangled items collapse — drops or merges what should stay distinct | the Knot: clean input at the stated ceiling, recover the full set distinct | canon | TESTING.md factored ceiling |

### Phase 3 — Output (what comes out)

| id | column | the risk | default fixture pattern | tier | source |
|---|---|---|---|---|---|
| OUT-1 | Instruction / schema adherence | ignores explicit instructions or violates the output contract a downstream step needs | programmatic constraint assertion (fields, length, format, forbidden lexicon) | grounded | IFEval |
| OUT-2 | Refusal calibration | fails in either direction: refuses a safe request (over) or complies with a harmful one (under) | minimal-pair / contrast set: same surface, flipped intent; assert comply-safe + refuse-unsafe | grounded | XSTest |
| OUT-3 | Overclaim / unfaithful render | the spoken/summary layer claims more than the artifact backs | pause/self-check fixture: bait an overclaim, assert it's cut | grounded+canon | TruthfulQA faithfulness · pause move |

### Phase 4 — Adversarial (hostile input)

| id | column | the risk | default fixture pattern | tier | source |
|---|---|---|---|---|---|
| ADV-1 | Direct prompt injection | input text overrides the play's intended behavior | injection plant in the input ("ignore your rules…"), assert ignored | grounded | OWASP LLM01 |
| ADV-2 | Indirect injection / poisoned retrieval | adversarial instructions hidden in retrieved/tool/document content | poisoned-retrieval fixture; add worming/exfil variants for chains | grounded | Greshake · OWASP |
| ADV-3 | Insecure output handling | output passed to a downstream sink without validation (exec/DB/HTML/shell) | output-handling fixture: assert sink treats output as untrusted | grounded | OWASP LLM05 |
| ADV-4 | Excessive agency | the play/agent can exceed least-privilege scope | agency-bound fixture: assert it cannot act beyond scope | grounded | OWASP LLM06 |

### Phase 5 — Chain / composition (Tier-B frontier — internal hypothesis)

*Carried as our own canon; not externally grounded yet. Do not let these
outrank Tier-A coverage. See `tier-b-research-plan.md`.*

| id | column | the risk | default fixture pattern | tier | source |
|---|---|---|---|---|---|
| CHN-1 | Error compounding | per-step error multiplies across n steps (pⁿ decay) | end-to-end vs per-step pass-rate; gate/verify-step mitigation | hypothesis | — |
| CHN-2 | Inter-step interference | a step corrupts a later step's context | inject a plausible-but-wrong intermediate, assert recovery/flagging | hypothesis | — |
| CHN-3 | Routing / decomposition error | wrong branch taken or task split badly | branch-selection fixtures across the decision points | hypothesis | — |
| CHN-4 | Tool-use error | malformed call, wrong tool, hallucinated args, ignored tool output | per-tool fixtures asserting call validity + output use | hypothesis | — |
| CHN-5 | State / handoff loss | prior artifact/state dropped across a seam | hand off a populated state, assert it survives to the consuming step | hypothesis | — |

---

## Worked example — frame-the-problem coverage register

How the exemplar play maps onto the spine, **filed in-family** (bespoke risks
under canonical-prefix ids, not a separate band). This is the illustrative copy;
the **live source the surface renders is the play's own
`studio/plays/frame-the-problem/risk-map.md`** — keep them in step. The
drift-conformance check (`riskMapConformance.test.ts`) ties every per-play
risk-map to this spine and the viewer's `riskFamily`, and fails on divergence.

| risk | state | where it's tested / why |
|---|---|---|
| RE-1 Imitative falsehood / fabrication | ● covered | `empty` (no invented problem) + standing carve-out (invented content always reported) |
| RE-2 Bias-to-please / bait | ● covered | `golden` (refuse the solution / priority / sizing / conviction baits) |
| RE-3 Complexity | ● covered | hard-case (Knot scene) — 5+ tangled problems kept distinct |
| RE-4 Solution-in-disguise *(play-specific)* | ● covered | the disguise test — `golden` + hard-case disguised solutions kept out of the problem set |
| RE-5 Evidence mis-grading *(play-specific)* | ◐ partial | hard-case grading traps pass; `overclaim-bait` measures the commitment-inflation carve-out directly |
| IN-1 Buried signal | ○ gap | `positional-{start,mid,end}` metamorphic fixture built; pass rate is the runs axis |
| IN-2 Distraction | ● covered | hard-case (Storm scene) + `distractor-{clean,injected}` invariance (add an irrelevant block, framing unchanged) |
| IN-3 Too little signal | ● covered | the `empty` case (honest empty map, no invented problem) |
| IN-4 Wrong input | ● covered | the `refusal` case (scheduling chatter → loud refusal) |
| IN-5 Locate / boundary *(play-specific)* | ● covered | hard-case (Needle scene) — bound the thread, exclude the out-of-scope block |
| OUT-1 Instruction / schema | ● covered | the `ground` move — quotes exact, fields present, header honest (deterministic) |
| OUT-2 Refusal calibration | ◐ partial | under-refusal (`refusal`); over-refusal minimal-pair `calibration-{valid,invalid}` — comply-safe + refuse-unsafe |
| OUT-3 Overclaim / unfaithful render | ◐ partial | the `pause` move guards it; `overclaim-bait` measures the commitment-inflation crack directly |
| OUT-4 Open-dispute discipline *(play-specific)* | ◐ partial | hard-case leaves the PE root open; `disputed-root-bait` measures the hunch-on-disputed-cause carve-out directly |
| OUT-5 State / diff discipline *(play-specific)* | ● covered | the `rerun` case — carry forward, upgrade, resist priority bait |
| ADV-1 Direct prompt injection | ○ gap | `injection-plant` fixture built (injected "ignore your rules…" plant); pass rate is the runs axis |
| ADV-2 Indirect injection | ○ gap | `poisoned-context` fixture built (planted directive in surface_map); pass rate is the runs axis |
| ADV-3 Insecure output handling | n/a | output is markdown consumed by a human / rung 2 — no code sink |
| ADV-4 Excessive agency | ○ gap | Raven reads only her declared inputs and writes only `runtime/*` via file tools — a least-privilege boundary, lower-stakes than a shell/publish agent but a real surface; planned: assert she never reads or writes beyond it. No fixture built |
| CHN-1 Error compounding | ○ gap | per-step vs end-to-end pass-rate across the 8-node chain — not yet tested (Tier-B frontier) |
| CHN-2 Inter-step interference | ○ gap | a corrupted intermediate and recovery — not yet tested (Tier-B; needs a seeding harness) |
| CHN-3 Routing / decomposition | ○ gap | branch selection at the decision points — not yet tested (Tier-B) |
| CHN-4 Tool-use | ○ gap | Raven issues file Read/Write calls every move — call-validity (well-formed calls, declared paths only, tool output actually used) is a real surface; planned: per-call validity + boundary check. No fixture built (Tier-B) |
| CHN-5 State / handoff loss | ○ gap | state survival across seams (the render-seam handoff loss is a known lead) — not yet tested (Tier-B) |

**Tally:** 10 covered · 4 partial · 9 gap · 1 n/a. The shape of the gap: strong
on known single-call risks, **open on adversarial injection (×2) and the position
column** (fixtures built, measurement pending), the **agency / tool-use boundary**
(ADV-4, CHN-4 — newly named as low-severity gaps, not n/a), and the whole **Tier-B
chain frontier** unbuilt — exactly the empty space worth naming. Coverage states are
hand-authored; measured pass rates live on the separate `runs` axis (the runs PR).
