---
plane: strategy
status: stub
confidence: low
cost: high
altitude: aggregate
evidence:
  - docs/alexandria/source-of-truth/raven/vision/source-of-truth.md
  - "packages/ax/src/domain/agents.ts:13"
risks:
  - tag: Value
    note: "Directors may want closer oversight and frequent check-ins rather than trusting deep autonomy, making a shallower assistant the better fit."
  - tag: Reversibility
    note: "Hard to walk back once colleagues are trusted with real autonomy and workflows are built around it; unwinding toward supervised execution disturbs how work is already assigned."
links:
  derived_from:
    - Bet - Colleagues as the Interaction Layer
  related_to:
    - Bet - The Play as Unit of Ownership
---

## WHAT

The wager: a colleague executes a task or project as independently as a
human peer would — not a prompt window awaiting instructions, but a
team member trusted to run with real work and check in only when it
matters.

## WHY

What a director is willing to hand over without checking in first marks
the gap this wager is trying to widen — between a colleague treated as a
tool that waits and one trusted to run with real work. Success widens
that gap in the company's favor, moving more of a director's actual
workload from human hands to colleague ownership over time. A loss is
expensive to walk back, though, because workflows and assignments get
built around the assumption of autonomy, and retreating toward closer
supervision means unwinding work already running rather than trimming a
feature nobody used.

## WHERE

A product-level refraction of the corporate bet that colleagues are the
interaction layer — it charters up to
[[Bet - Colleagues as the Interaction Layer]]. It is embodied by the
degree of autonomy built into how work is assigned and run — a play,
once launched through [[Capability - Run a Play]], pauses at the
[[Mechanism - Human Gate|human gate]] only when a decision genuinely
needs the director — most concretely through
[[Bet - The Play as Unit of Ownership]], the mechanism that
operationalizes this independence.

## HOW

If the wager holds, a colleague fits the rhythm and culture of a
director's own workflows — relied on the way a human peer would be, not
managed like a feature. If it is wrong — directors want closer oversight
and frequent check-ins — the product's autonomy model recedes toward a
supervised, narrower assistant, and a play's default independence
becomes a configurable ceiling rather than the baseline.

The wager is watched by [[Measure - Fair-Market Value Delivered|fair-market value delivered]] and [[Measure - Needed But Undone Hours|needed-but-undone hours]]: autonomy only counts if it turns into valuable work and leaves less wanted work uncovered. [[Experiment - Ten-Director Library Pilot|The ten-director pilot]] is the first planned independent read on whether directors keep using a colleague that takes that kind of ownership.
