<!-- Clean-room run · located transcript · run 1 · Sonnet · current prompt · no answer key seen -->

# Problem Brief — the team's library trust conversation: staleness, bar accuracy, dupes, atomize variance, approval bottleneck, and onboarding gap
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
The library has accumulated at least five distinct problems that compound each other: cards give no signal of age, which misleads the director in their work and also contaminates coverage bars that are used to make staffing decisions. Duplicate cards scattered across areas may be making the bar problem worse, but the room disagrees about whether staleness or duplication is the primary driver, and neither side has data. Running alongside those are three more independent problems: atomize produces wildly inconsistent output with no explanation, approval wait stalls conversion work when the director is stretched, and no written guide exists for how conversion actually works. What's still open is which of staleness and duplication is the real root of the bar-misleads problem.

## P1 — I used a card in good faith and it was stale, and I lost half a day
- progress sought: use library cards as a reliable input to real deliverables
- who: Director (Theo)
- circumstance: mid-work, pulling cards from the library to build a deliverable — no signal available that any card might be outdated
- evidence:
  - "Two weeks ago I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone. Nothing told me it was stale. It just sits there looking exactly as confident as a card from yesterday." — Theo — specific-past
  - "The library has no sense of time." — Nadia — opinion (conviction high)
  - "it's getting — harder? to trust." — Theo — opinion (conviction low — hedged with "I don't know how to say this exactly")
- what it's not: a request for an expiry date field (Roman's "We need an expiry date on every card" names one solution; the problem is the absence of any freshness signal, not specifically the absence of a date)
- where it lands: Library; no freshness signal is a named known seam in the surface map
- checks: pass

## P2 — I trusted the coverage bar to decide where to staff, and it lied
- progress sought: make accurate decisions about which areas of the library need attention and which are healthy
- who: Director (Nadia)
- circumstance: reviewing area coverage bars to plan session staffing — relied on ninety percent bar as a health signal
- evidence:
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — Nadia — specific-past
  - "The bar counts a dead card the same as a live one. Ninety percent full of corpses is still ninety percent to that bar." — Nadia — opinion (conviction high)
- what it's not: a request for a freshness-weighted bar (the problem is that the bar produces misleading coverage decisions, not a specific request for how to fix the bar)
- where it lands: Library (coverage bars), Director dashboard
- insight (my read): This problem and P1 share a root in the absence of any freshness signal. P2 is the decision-making harm; P1 is the wasted-work harm. They are distinct problems — attackable separately — but may share a fix.
- checks: pass

## P3 — The same source is banked in multiple areas and nothing tells anyone
- progress sought: maintain a library where a given piece of knowledge lives in one place and can be found reliably
- who: Director (Nadia, citing Priya); Crew member
- circumstance: working in or reviewing the library, not knowing whether cards in one area duplicate cards in another
- evidence:
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in. So the same source can live in Strategy and Ops and nothing notices." — Nadia — specific-past
  - "I'd bet it's mostly dupes. We've got dupes everywhere." — Roman — opinion (conviction high)
  - "We don't actually know. That's the point." — Nadia — opinion (conviction high, about the absence of data)
  - "Both of you are guessing, honestly." — Bex — opinion (conviction high)
- what it's not: a request for a cross-area dedup index (Roman's scope note about "months-long" cross-area work names a solution scope, not the problem itself)
- where it lands: Library; Search & duplicate awareness — area-local dedup is a named known seam in the surface map
- checks: pass

## P4 — Atomize produces wildly different output for similar documents, with no explanation
- progress sought: convert a source document and have a predictable, legible result that downstream consumers can rely on
- who: Crew member (Sam)
- circumstance: running atomize on source documents of similar shape, receiving output that varies with no discernible logic
- evidence:
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it. Consumers downstream have no idea what they're going to get." — Sam — specific-past
- what it's not: a request for a fixed or configurable atomize output count (the problem is the unexplained variance and the downstream uncertainty it creates, not the specific numbers)
- where it lands: Source Conversion (atomize step)
- checks: pass

## P5 — Nothing moves through conversion while the director is stretched, and sources go stale waiting
- progress sought: get converted drafts reviewed and banked within a timeframe where the underlying sources are still fresh
- who: Crew member (Bex); Director acknowledges being the bottleneck (Theo)
- circumstance: conversion in progress, director is occupied or out — drafts sit in the approval queue with no path forward
- evidence:
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked. Nothing moves without a director's sign-off and the director is one person with a real job." — Bex — specific-past
  - "That's fair, I'm a bottleneck and I know it." — Theo — commitment (acknowledged standing; Theo is the Director)
  - "It's not really that I want a robot approving things, it's that nothing moves while one person's underwater." — Bex — opinion (conviction high — clarifying the actual problem against Roman's AI solution)
  - "Every director hates the approval wait. All of them. Guaranteed. Nobody will say it on the record but it's true." — Bex — opinion (conviction high; no supporting evidence beyond assertion)
- what it's not: a request for AI auto-approval (Roman's "we should just build an AI that auto-approves the low-risk drafts" names one solution; Bex explicitly reframes the actual problem as pipeline paralysis, not as a desire for automated review)
- where it lands: Source Conversion (draft → director approval step); Director dashboard
- insight (my read): Bex also speculates that this bottleneck may cause sloppy banking (see Unclear below), but Bex herself hedged it; left out of this entry.
- checks: pass

## P6 — How conversion actually works lives in one person's head, and new crew members are left to find it by shadowing
- progress sought: come up to speed on running conversions — especially atomize — without depending entirely on a veteran crew member
- who: new Crew member (Sam)
- circumstance: first week, trying to learn conversion workflow; specifically the atomize step has undocumented quirks
- evidence:
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down. If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — Sam — specific-past
  - "I have tried to write it down. There's never time, because, see above, eleven drafts." — Bex — specific-past (names the blocker; also connects to P5)
- what it's not: a request for documentation (the problem is the knowledge-transfer failure and concentration risk, not the absence of a specific artifact)
- where it lands: Source Conversion; surface map names "Conversion know-how is undocumented" as a known seam
- checks: pass

## Unclear — kept, not promoted

- "maybe people bank stuff in a hurry because of the backlog, and that's part of why we get sloppy dupes? I don't know. Might be nothing." — Bex — hypothetical speculation with no supporting evidence; Bex explicitly walked it back ("might be nothing"); not enough to form an entry, but it is a named possible link between P5 and P3
- "People keep asking for dark mode. We should just do it. Easy win, everyone loves it." — Sam — explicitly scoped out by Theo ("That's a different universe, Sam"); no problem behind it was voiced; not a library problem

## Relationships

- P1 ↔ P2: sibling — both stem from the absence of a freshness signal (P1 is the direct work-harm; P2 is the decision-making harm) but are independently attackable
- P2 ↔ P3: disputed — Roman vs Nadia, over what is the primary driver of bar inaccuracy. Roman claims duplication pads the bar; Nadia claims staleness does. Both agree the bar is wrong; neither has data on the composition of the inaccuracy. Test: pull the coverage calculation on one area's cards and classify each card as stale (age > threshold), duplicate (same source appears elsewhere), or neither — the mix of those categories settles which driver dominates. Could be gathered by a one-area audit.
- P1 ↔ P3: sibling — distinct problems (stale cards vs duplicate cards) that both degrade library trustworthiness; either could exist without the other
- P5 → P6: P5 is suspected root of the documentation gap in P6 — Bex explicitly says "there's never time, because, see above, eleven drafts." If the approval bottleneck were removed, Bex's stated blocker for writing it down would be removed. Labeled a hunch.
- P4 ↔ P6: sibling — both involve the atomize step; P4 is the output-variance problem (affects all users), P6 is the knowledge-transfer problem (affects onboarding); each is attackable without the other

## Hunch

Hunch: P1 (staleness) is the suspected root of P2 (bar misleads). The bar mismeasures health because it counts cards without any freshness weighting — the same cause as P1. If cards carried freshness signal (the P1 problem), the bar could use that signal. This hunch is about the problem structure, not about which fix to pursue. It does not settle the Roman-vs-Nadia dispute about whether staleness or duplication is the bigger driver of bar inaccuracy — that question cuts across both P1 and P3 and needs the area audit named above.

## Spoken (75 words is the ceiling, not a target)

"I'm framing everything said about the library. Six distinct problems, not one — the brief has them all. The structure I found: staleness may be the root of the bar problem, but Roman and Nadia read the cause differently, and neither side has data. The brief has a one-area audit that would settle it. The one open question I'd flag: is the approval bottleneck also the reason the atomize guide never gets written?"
