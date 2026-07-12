---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels:
  - canvas mechanism
  - artifact review loop
evidence:
  - packages/ax/src/domain/state-events.ts       # canvas.step.saved · canvas.review.requested
  - packages/ax/src/domain/project-state.ts       # deriveCanvasProjection
  - packages/alexandria-plugin/skills/ax-start/SKILL.md   # default wake registration
links:
  contains:
    - Entity - Canvas Step
  related_to:
    - Capability - Wake
---

## WHAT

**Meant to be:** a generic, content-agnostic "build an interactive artifact → request
review → wake a human" mechanism — reusable scaffolding any Raven power-up could use to
put a worked artifact (an explainer, a draft, a diagram) in front of the director and
pull a live reviewer to it. **Dormant today:** zero shipped UI, and no play invokes it.
Only the skeleton exists — the `canvas.*` events and their projector — never wired to a
power-up. It is **not a Surface** (it fronts no screen), and not the viewer's
`canvas` CSS (that word means "the main content area" — a different, dropped sense).

## WHY

The canvas is meant to be the built scaffolding behind the wager that
work lives on a single visualized surface a director moves through,
rather than separate lists and boards —
[[Bet - Map-First Work Surface]] — and, more broadly, the wager that the
whole work environment must be visual and traversible,
[[Bet - A Visual, Traversible Work Environment]]. Its dormancy today is
exactly the gap those wagers still have to close: the scaffolding exists,
but nothing yet puts a worked artifact in front of the director through
it.

## WHERE

The canvas event family in the ledger — a saved unit of canvas work and a review
request against a step — plus the derived canvas projection and a default wake
subscription that lets a review request reach a live agent. No UI renders it; no play
emits it today.

## HOW

An actor saves work as a [[Entity - Canvas Step]] under a (freeform) canvas id; a
review request references that step and, being wake-eligible, rides the
[[Capability - Wake]] to whoever should review — the same generic wake path every event
uses. The review-request is part of *this* mechanism, not a standalone capability. When a
real interactive-artifact power-up is built, it wires in here; until something claims it,
it stays dormant — and is a deprecation candidate if it never does.
