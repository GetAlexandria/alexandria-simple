---
plane: learning
status: stub
kind: distilled
origin: desk-research
grade: reported
confidence: high
altitude: value
evidence:
  - "A director-compiled field guide to high-reliability, high-tempo organizations across ten domains, citing alarm-rationalization practice and named incidents where alarm overload contributed to the failure"
  - "docs/alexandria/plans/learning-plane/design-log.md"
  - "docs/alexandria/plans/learning-plane/elicitation-results.md"
---

## WHAT

Every high-reliability domain in this corpus treats a person's attention as one of the
scarcest resources in the entire system, and engineers for it deliberately rather than
assuming it will simply hold up. Alarm rationalization — deciding which signals actually
deserve a human's notice, and suppressing the rest — is core engineering discipline in
these domains, not a cosmetic interface concern, because the well-documented failure mode
is not too few alerts, it is so many that the one that matters gets lost in the noise, or a
person learns to tune all of them out.

## WHY

This lesson matters because it reframes notification and status design for a team of AI
colleagues as safety-critical work, not a polish pass done at the end. A colleague-driven
company multiplies the number of things that could plausibly want a director's attention
at any moment, which is exactly the condition under which these high-reliability domains
learned, at real cost, that undisciplined alerting fails — quietly, until the one alert
that mattered is the one nobody noticed.

## WHERE

This lesson grounds the wager that
[[Bet - Colleagues as the Interaction Layer|colleagues succeed as the interaction layer]]
only if what deserves a director's attention is deliberately and continuously
curated, not merely generated.

It bears directly on the product's glanceable
[[Bet - The Control-Panel Tray|control-panel tray]], since a surface built for
status at a glance is exactly the kind of surface that lives or dies on disciplined
attention design.

## WHEN

This card's past is N/A — it opens here at its founding layer, drawing on documented
practice and named incidents from domains with decades of hard-won experience managing
attention at scale. What stands now is a reported-grade reading: the discipline is well
attested where alarms come from instruments and machines, but not yet tested against a
team of AI colleagues, each capable of generating its own stream of updates and requests
for a director's attention. What is intended next is that the product's own notification
and tray design, once used under real load, gives this lesson a demonstrated reading.

## HOW

The evidence is a desk-research synthesis of alarm-rationalization practice and its
documented failure cases across several high-stakes domains, not a measurement of how
directors experience attention load from this product's own colleagues. It establishes
that undisciplined alerting reliably fails once volume grows past what a person can
absorb; it does not yet establish where that threshold sits for a director managing a
growing team of AI colleagues rather than a fixed set of mechanical alarms, or how quickly
that threshold is reached as a colleague team's capability and workload both grow.
