---
plane: product
status: confirmed
confidence: medium
altitude: value
altLabels: []
evidence:
  - packages/ax/src/domain/atomic-card-categories.ts
  - docs/alexandria/plans/library-word-legibility/library-update-worklog.md
  - docs/alexandria/plans/strategy-plane-rebuild/design-log.md
links:
  related_to:
    - Entity - Atomic Card Category
    - Entity - Type
    - Entity - Research
    - Principle - Director Ruling
    - Bet - Colleagues as the Interaction Layer
---

## WHAT

The original catch-all bucket for the why behind a choice — a
hypothesis or a justification, not the choice's product embodiment.
Retired: the two shapes it used to hold, a falsifiable wager and a
normative rule, are first-class types in their own right —
[[Bet - Colleagues as the Interaction Layer|Bet]] and Principle —
rather than kinds nested under a single Rationale type. Rationale
survives as vocabulary history, not as a live bucket a card's Type can
carry.

## WHY

Splitting a choice's justification from its product embodiment is what
lets the wager on atomic knowledge atomize the reasoning itself into a
card a colleague can cite, rather than leaving it buried in whatever it
produced,
[[Bet - Atomic, Agent-Readable Knowledge|the wager on atomic knowledge]].
In practice the product's own whys have migrated up a level: the reasons
behind Alexandria's choices now live as Bets and Principles on the
Strategy plane, kept there rather than mixed into the Product plane's
container cards, so a director always knows which plane to check for the
reasoning behind a choice, [[Principle - Legible Graph]].

## WHERE

No longer a value [[Entity - Type]] carries. The Strategy plane speaks
its two more specific words directly: a Bet is a falsifiable wager, and
a Principle is a rule held regardless of how any wager turns out — both
first-class Strategy-plane types, not refinements of Rationale.

## HOW

Rationale, formerly one of the buckets in the
[[Entity - Atomic Card Category]], differed from its nearest neighbor,
[[Entity - Research]], by being the why reasoned in advance rather than
the evidence gathered after. Its former exemplar,
[[Principle - Director Ruling]], is now carded as a Principle (kind:
ruling) rather than a Rationale: it records a ruling's reasoning ahead
of its consequences, the way
[[Bet - Colleagues as the Interaction Layer]] stakes a wager on how the
company wins — while Research remains what comes back once a wager has
been tested.
