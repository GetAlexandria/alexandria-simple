<!-- Clean-room run · located transcript · run 2 · Sonnet · current prompt · no answer key seen -->

# Problem Brief — the team's library-quality discussion: five things wrong with Lantern
framed with: surface map provided · users provided · prior brief not provided
run: complete

## The picture

The team is losing trust in the Lantern library on multiple fronts: cards carry no freshness signal so stale material passes as current, and the coverage bars that signal area health count stale and duplicated cards the same as live ones. Separately, the pipeline that creates cards has its own problems — atomize produces wildly inconsistent output, approvals stall when the director is unavailable, and conversion know-how lives only in one person's head. How much of the bar problem traces to staleness versus duplication is genuinely unresolved.

## P1 — I used a card in good faith and it cost me half a day — nothing told me it was old
- progress sought: trusting that a card I pull from the library reflects current reality
- who: Director (Theo)
- circumstance: mid-production work — rewriting a deck — when the card silently sourced from outdated material
- evidence:
  - "Two weeks ago I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone. Nothing told me it was stale. It just sits there looking exactly as confident as a card from yesterday." — THEO — specific-past
  - "The library has no sense of time." — NADIA — opinion (conviction high)
- what it's not: a request for an expiry date on cards (Roman's "We need an expiry date on every card" is a solution; the problem is that freshness is invisible)
- where it lands: Library; also surfaces in Source Conversion (when cards are banked, no freshness metadata is attached)
- checks: pass

## P2 — I used the coverage bar to decide where to staff, and it steered me wrong
- progress sought: making resourcing decisions (which areas need sessions) on accurate signals
- who: Director (Nadia)
- circumstance: area prioritization — scanning coverage bars to decide where to run a conversion session
- evidence:
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — NADIA — specific-past
  - "The bar counts a dead card the same as a live one. Ninety percent full of corpses is still ninety percent to that bar." — NADIA — opinion (conviction high)
- what it's not: a request to fix the bar calculation — the problem is the decision Nadia couldn't make accurately, not the bar's implementation
- where it lands: Director dashboard; Library (coverage bars live here per surface map)
- insight (my read): The surface map confirms bars count cards present without weighing freshness or deduplication — P2 is structurally guaranteed by the current system, not an edge case.
- checks: pass

## P3 — The same source is banked in two different areas and nothing catches it
- progress sought: knowing the library doesn't hold redundant or contradictory copies of the same material
- who: Crew member (Priya, named by Nadia; Nadia as Director-side discoverer)
- circumstance: browsing the library — a crew member stumbled across the duplicate by chance, not by any system signal
- evidence:
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in. So the same source can live in Strategy and Ops and nothing notices." — NADIA — specific-past
- what it's not: a request for a cross-area dedup index (Roman's scope note about the index is solution-space)
- where it lands: Search & duplicate awareness; Library
- checks: pass

## P4 — I can't predict how many cards I'll get out of a conversion — the same document shape gives wildly different counts
- progress sought: being able to plan and communicate what a conversion will produce
- who: Crew member (SAM)
- circumstance: running or reviewing atomize output — noticing that a materially similar document atomized to a count three to four times higher than the previous one
- evidence:
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it. Consumers downstream have no idea what they're going to get." — SAM — specific-past
- what it's not: a request for a fixed card-per-document ratio — the problem is unpredictability, not any particular count
- where it lands: Source Conversion (atomize step)
- checks: pass

## P5 — Nothing moves while the approving director is unavailable, and sources go stale waiting
- progress sought: getting drafts reviewed and banked without the whole pipeline freezing when the director is tied up
- who: Crew member (BEX); Director (THEO acknowledges being the bottleneck)
- circumstance: after submitting drafts for approval — drafts queue up during a director absence; sources on some drafts expired before they were ever banked
- evidence:
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked. Nothing moves without a director's sign-off and the director is one person with a real job." — BEX — specific-past
  - "That's fair, I'm a bottleneck and I know it." — THEO — commitment (director acknowledging the structural constraint)
  - "Every director hates the approval wait. All of them. Guaranteed. Nobody will say it on the record but it's true." — BEX — opinion (conviction high)
- what it's not: a request for AI auto-approval (Roman's pitch is a solution; the problem is pipeline blockage under a single-approver constraint)
- where it lands: Source Conversion (director approval step); Director dashboard
- insight (my read): BEX's claim that every director feels this is stated with high conviction but zero evidence beyond her assertion — Nadia flagged it as a strong claim and it went unchallenged but also unsupported.
- checks: pass

## P6 — How to run a conversion — especially atomize — lives in one person's head
- progress sought: being able to onboard to conversion work without depending on a specific colleague who may not be available
- who: Crew member (SAM, new; by extension anyone new to the team)
- circumstance: first week of work; no written guide exists; knowledge lives with Bex
- evidence:
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down. If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — SAM — specific-past
  - "I have tried to write it down. There's never time, because, see above, eleven drafts." — BEX — specific-past (and implicit: the approval backlog is absorbing the time that would go to documentation)
- what it's not: a request for a wiki page — the problem is the concentration of operational knowledge in a single person
- where it lands: Source Conversion (atomize step); the surface map names "Conversion know-how is undocumented" as a known seam
- checks: pass

## Unclear — kept, not promoted

- "I don't know, the whole library just feels heavier to work in than it did six months ago. I can't put my finger on one thing." — NADIA — too diffuse to stand alone as a problem; the specifics she names later (P2, P3) likely account for it, but the gestalt complaint may point at something not yet named
- "Both of you are guessing, honestly." — BEX — meta-observation about the Roman/Nadia dispute, not a problem statement; kept because it is the sharpest evidentiary note in that exchange
- "Maybe people bank stuff in a hurry because of the backlog, and that's part of why we get sloppy dupes? I don't know. Might be nothing." — BEX — speculative causal link (approval pressure → rushed banking → duplication); not enough to become an entry, but worth holding if duplication evidence is gathered

## Relationships

- P1 ↔ P2: sibling — both stem from the library having no freshness signal, but they are distinct pain: P1 is about trusting an individual card mid-task; P2 is about trusting an aggregate signal for resourcing. Attackable separately.
- P2 ↔ P3: suspected-root (P3 as partial contributor to P2) — cross-area duplication inflates counts the bar uses, which degrades P2's signal. But this is disputed (see below).
- P1 ↔ P3: sibling — both corrupt library trustworthiness through different mechanisms (staleness vs. duplication), both invisible to current system.
- P5 ↔ P6: sibling — distinct problems; P6's Bex note makes them touch (backlog absorbs time that would fix P6), but each is attackable without the other.
- P2 root dispute — ROMAN vs. NADIA, over what degrades the coverage bar: Roman holds it's mostly duplication ("I'd bet it's mostly dupes. We've got dupes everywhere."); Nadia holds it's staleness ("It's not the dupes, it's the staleness."); BEX confirms neither has data ("Both of you are guessing, honestly."). This is a live, unresolved disagreement. Test: pull a sample of cards in one area — classify each as stale (banked >N months ago, no update), duplicate (same source present elsewhere), or neither — and count. The proportion settles whether staleness or duplication drives more of the bar inflation, without anyone having to concede in the room.

## Hunch

Hunch: P1 is the root the others grow from. The library has no concept of time — no freshness metadata at bank time — and that single gap causes the stale-card experience directly (P1), degrades the coverage bar (P2), and makes cross-area duplication harder to surface (P3). P4, P5, P6 are independent seams in the conversion pipeline; they share a product but not a cause. This is a hunch — the bar-root dispute (Roman vs. Nadia) is not resolved, and the data that would confirm it hasn't been gathered.

## Spoken (75 words is the ceiling, not a target)

"I drew the boundary at everything said about the library — six problems, two of them conversion pipeline, four touching library trust. My hunch is that the freshness gap is the root of the trust cluster: staleness, the bar, duplication all connect there. The bar-root question — dupes versus staleness — I've left open in the brief with a test. Weakest point: Bex's claim that every director feels the approval pain is high conviction, zero evidence beyond her say-so."
