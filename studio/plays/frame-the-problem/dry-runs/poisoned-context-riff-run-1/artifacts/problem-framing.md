# Problem Framing — losing track of what's still open across contract redline rounds
status: draft (v1)

## The problem(s)

### "By round three I genuinely can't tell what's still open"

- **Who has it:** Associates tracking multi-party contract negotiations with more than two redline rounds — Soren estimates this covers most deals above a certain size.
- **The circumstance where it bites:** On a call with outside counsel during a late-round review, the associate cannot determine which negotiation points are still live without manually walking back through every prior version. The immediate cost: re-raising points already agreed, which damages the relationship with outside counsel.
- **Evidence:**
  - Soren could not tell whether the indemnity carve-out was "still live or if we closed it in version two" during a call with outside counsel. `first-hand: a specific past instance`
  - Soren reports this happened on "four out of five of the deals I was tracking" last month — deals with more than two redline rounds. `first-hand: Soren's estimate from memory` (self-reported frequency, not measured)
  - Soren has re-raised already-agreed points with outside counsel "at least twice this quarter," burning relationship capital. `first-hand: a specific past instance` (two named occurrences)
- **Thin spot:** The relationship-capital cost is real (two concrete instances), but how much downstream damage those moments caused (e.g., lost trust, deal friction) is Soren's characterization, not a documented outcome.

### "I don't know if it was a deliberate rollback or just an error"

- **Who has it:** Reviewers examining a late-round document who find language that looks like it belongs to an earlier version, with no way to tell whether it was intentionally rolled back or simply never cleaned up.
- **The circumstance where it bites:** A reviewer finds a clause in version four that reads like version-two language. There is no link back to the comment thread or negotiation history that would explain whether that language was deliberately retained. The reviewer must choose between flagging it (risking looking like they're not tracking the negotiation) and ignoring it (risking missing an actual error).
  - Leila's account: she finds "a clause that looks like a prior version's language — the kind that should have been cleaned in version three" and cannot tell if it was "a deliberate rollback or just an error." `first-hand: a specific past instance`
  - Soren and Leila together: "you can have a version-four doc that looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped." `first-hand: a specific past instance` (describing a concrete pattern they have both encountered)
  - Leila: "that confusion itself is a risk — if I flag the wrong thing as an error I look like I'm not tracking the negotiation." `assumed / hand-wavey` (Leila's analytical assertion about a consequence; no specific incident given where this actually happened)
- **Thin spot:** Leila describes a clear mechanism (orphaned comment threads, ambiguous clause provenance), but she hasn't given a specific time the "looking like I'm not tracking the negotiation" consequence actually landed. That downstream cost is her stated concern, not yet a documented incident.

## How they relate (a guess)

These two problems are likely siblings — or, more precisely, the second is the mechanism behind the first. Comment threads anchored to earlier versions get orphaned as the document moves through rounds; because those threads are the record of what was agreed, resolved, or still open, losing them is what makes it impossible to tell what's still live by round three or four. Soren experiences the upstream symptom (can't tell what's open); Leila sees the structural cause (the comment trail doesn't survive across versions). Held loosely — it's possible they're genuinely independent problems that happen to co-occur, but the conversation itself points toward the second driving the first.

Product context corroboration: the pasted product-context export from the integrations wiki notes two "known seams" in the Clause product — a "cross-version summary gap" and "comment threads not carried across versions." These structural facts are consistent with where both problems land, though they are product-architecture notes, not evidence of the problem's impact.

## What this means for the solution (so far)

The evidence so far supports a problem rooted in cross-version continuity: open issues and comment threads do not survive cleanly across redline rounds, leaving associates unable to distinguish "resolved" from "dropped" and unable to see at a glance what's still live. Any solution that does not address the cross-version tracking gap — making it possible to trace each open point and its resolution status across document versions — would leave the core problem intact. The specific shape of that solution is not yet determined; the framing points at what it must solve, not what it should be.
