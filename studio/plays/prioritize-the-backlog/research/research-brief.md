> **PARKED — 2026-06-12.** This play was pulled from the golden path by the
> source-canon audit (Director ruling, 2026-06-12, source-canon audit) — the
> most Fortune-1000 play in the library, with a DSDM/SAFe skeleton its own
> cited startup voices argue against. The research below stands unedited as
> the record of what was found; the dated reweighting amendment at the end of
> [grounding.md](grounding.md) records which canon survives. Revival
> re-skeletons on Shape Up's betting table with the failure-mode canon
> (Cutler, Perri, Torres) promoted to the spine. See
> [PARKING-LOT.md](../../PARKING-LOT.md) and
> [AUDIT-2026-06-12-source-canon.md](../../AUDIT-2026-06-12-source-canon.md).

# Research brief — Prioritize the Backlog (step 0)

Drafted 2026-06-11 by the synthesis-and-verification agent. Executed same
day; this is the first research run under the **ground before design** rule
(README, Director ruling 2026-06-11) and carries the standard two-mandate
structure.

**How this play was surfaced:** existing inventory slot (strategy, manager).
Identified by rung-3 research as the home of the MoSCoW triage compound.
The architectural note: rung 3 consumes a triaged candidate set when one
exists, meaning this play's output is a prerequisite input for at least one
downstream rung.

> Research not only the best practices for our output (its form, its
> attributes) but also explores the questions we ask in the elicitation
> we're about to do — filling out our interview manifest with expert
> answers and examples found online.

So this brief has two mandates:

**A. Ground the output.** What the artifact *is* — its forms, structures,
attributes, and when each form fits.

**B. Pre-answer the elicitation.** The brief conversation runs on
`../../TEMPLATE-brief.md`'s sections. For each, find the expert answer
before asking the Director, so design time is spent ruling on researched
options, not generating from scratch:
- §1 Goal — what a successful run of "prioritize the backlog" produces;
  the done-condition; what a *failed* one looks like.
- §2 Trigger — when, in expert practice, this step fires in a product
  process (what must exist first; what fires it).
- §3 Required knowledge — the inputs experts say you need in hand, and
  what practitioners do when one is missing.
- §4 Golden path — the expert step-by-step method for running a
  prioritization session.
- §5 What could go wrong — documented failure modes and **root causes of
  failure**, with severity.
- §7 Proof spec — how experts judge a ranked backlog: review checklists,
  rubrics, what separates a strong artifact from a weak one.

**The framework-selection question (central open question):** no single
framework works universally; the play must either (a) specify one primary
framework for the play's scope (MoSCoW compound is already committed by
rung-3 design) or (b) carry a framework-selection gate before any scoring
begins. Research maps the full landscape; the Director rules on scope at
design time.

## Segments researched

The raw research was delivered as two reports by Sonnet agents:

1. **Method report** — covering RICE, MoSCoW, WSJF/CoD, Kano, Opportunity
   Scoring, ICE, Value-vs-Effort 2x2, hybrid/layered approaches, decision
   log mechanics, and re-prioritization cadences. Primary sources: Intercom
   (RICE/McBride), Agile Business Consortium (MoSCoW/DSDM), Scaled Agile
   Framework (WSJF), Wikipedia (Kano), RoadmapOne (Opportunity Scoring),
   LaunchNotes (decision log), plus practitioner comparison guides (Fygurs,
   KickassDevelopers, ProductPlan).

2. **Quality/failure report** — covering framework failure modes, HiPPO
   dynamics, backlog anti-patterns, output-vs-outcome confusion, input
   fabrication risks, score staleness, and eyeball-rubric construction.
   Primary sources: TheLinuxCode RICE playbook, Rock.so RICE critique,
   Product Coalition authority-gap survey, Dovetail HiPPO, John Cutler
   Medium / Black Swan Farming, Melissa Perri build-trap, Age of Product
   anti-patterns, fev.al economic framework, Elastic Tier, LaunchNotes,
   Teresa Torres / Product Talk.

## Claim discipline

Every claim carries its source (URL + attribution); quotes verbatim where
available; primary sources preferred and fetched. Anything unverifiable is
flagged, not dropped or laundered. Raw claims and tags land in
`extracted-claims.md`; verification verdicts on the load-bearing
search-snippet-only claims appear there; confirmed material graduates to
`grounding.md`, caveats inline.

## Open Director questions — carried to this play's brief conversation

(Surfaced by the step-0 synthesis, 2026-06-11.)

1. Framework scope: does this play own only MoSCoW triage (the rung-3 compound) or also the RICE pass on the filtered shortlist? If RICE is separate, define the handoff artifact now.
2. Authority precondition: canon says no DACI/RAPID assignment → decorative outputs. Block, or proceed declared-degraded with the risk flagged? (Director-challenge class.)
3. Foundational work: single ranked list (accepting RICE's known tech-debt underranking) or two-tier output (strategic queue + enabler queue)?
