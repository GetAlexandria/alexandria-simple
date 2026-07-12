---
plane: learning
status: stub
altitude: pillar
target: >-
  Real, sustained fair-market value delivered per AI colleague each month, comfortably ahead
  of what running and directing them costs — the elicitation's own reference point is roughly
  a thousand dollars or more per colleague, well clear of a token and time-in cost that stays
  a small fraction of it.
trend: >-
  Not yet reading — no colleague has been priced, rated, and summed into a first figure.
evidence:
  - "docs/alexandria/plans/learning-plane/design-log.md"
  - "docs/alexandria/plans/learning-plane/elicitation-results.md"
---

## WHAT

The quantity is the fair-market value of the work Alexandria's AI colleagues actually
deliver, priced the way a company prices any employee's labor: for every task a colleague
completes, ask what a human at the appropriate job level would fairly have been paid to do
the same work, discount that price by a quality rating so work that merely ran is not
counted the same as work that was good, and sum the result across every colleague and every
task the team asks of them. That sum is then weighted by how heavily the whole roster is
actually used — a brilliant colleague nobody calls on is worth little, and a middling one
used constantly by the whole team can outweigh it — and netted against what it costs to run
and to direct them: the tokens and compute spent, plus the time a director puts into
onboarding, training, and collaborating with each colleague day to day. What comes out the
other end is a single return figure, and it sits at the apex of the measurement shelf, the
one number every other reading on this shelf ultimately exists to help interpret.

## WHY

This is the number the whole strategy is staked on, watched continuously rather than checked
once: a reading that climbs on volume alone while quality erodes, or where cost outpaces the
value returned, looks like a win and is actually the company going backward. Holding it as
one figure — not separate impressions of adoption, capability, and cost — lets a reader ask
the only question that matters: is real, fairly priced work accumulating faster than it is
spent. Every wager claims to move this number if it is right, so it is the shared object the
wagers point at rather than each inventing its own sense that things are working.

## WHERE

Reads from wherever a colleague finishes work: every completed [[Entity - Play Run]] carries
the job level of the work it stood in for and how long it took, and the [[Entity - Ledger]]
is the record a reading is drawn from. Two terms no ledger supplies are read by people
instead of sensed: a quality rating on the work done, and the time a director spent managing
the colleague. The learning and strategy keystones cite this reading as proof the plane and
the wagers are paying off, and it is the same reading the wager that
[[Bet - Colleagues as the Interaction Layer|colleagues are the interaction layer]]
already names as its own north star.

## WHEN

There is no past yet: N/A — no colleague has been instrumented against this reading. In the
present the definition is fixed and the family beneath it is named, but nothing reads yet.
Intended next: instrumentation against real use, first inside the team's own dogfooding, then
a first reading on people who did not build Alexandria once the ten-director pilot begins.

## HOW

Auto-computed from ledger records once a colleague finishes work: job level and time assumed
set the fair-market price directly. Quality and time-in are read by people on a cadence
instead: a monthly review that rates quality and tunes how the colleague is used, and a
daily best-and-worst pull — an andon-cord check — that surfaces trouble early, since a low
pull count hides defects rather than proving their absence. Limits: it prices against a human
wage that is itself a judgment call, and its quality term is only as honest as the reviewers
behind it. A reading that crosses statistical power and says something notable does not
change what this measure is — it emits a fresh Research card, where a stage and verdict can
attach.
