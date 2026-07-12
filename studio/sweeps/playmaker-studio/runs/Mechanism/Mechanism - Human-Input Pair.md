---
type: Mechanism
prefLabel: Human-Input Pair
context: runs
plane: Product
status: stub
altitude: capability
altLabels: [human_input_requested, human_input_resolved, Non-Blocking Gate]
source_evidence:
  - studio/plays/RUNTIME.md:61
  - studio/plays/RUNTIME.md:70
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Component - Review Unit
  related_to:
    - Mechanism - Wake
    - Reference - Raven Vision
    - Surface - Play Tracker
---

## WHAT
The non-blocking, event-sourced human gate — the heart of the contract and the place
the old canon was wrong. The agent does one unit, marks it awaiting review
(`play.human_input_requested`), and ends its turn; the director resolves
asynchronously (`play.human_input_resolved`), which wakes the next unit. Never a
blocking Fabro node (it deadlocks a detached run).

## WHERE
RUNTIME.md §3 ("Human judgment is non-blocking"); the shipped instance is Raven
Vision's slot review.

## HOW
The Human-Input Pair operates on a [[Component - Review Unit]] (it keys writes by the
unit id), the resolving event fires a [[Mechanism - Wake]], and the model is ported
from [[Reference - Raven Vision]]; the [[Surface - Play Tracker]] shows the pending
state as "Raven needs you".
