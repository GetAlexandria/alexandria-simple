# Problem Brief — Losing source material and duplicating library work because nothing connects research browsing to the library
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
Maya's team captures source material only through desktop conversion sessions, so anything found while browsing has to survive in open tabs until someone sits down to convert — and much of it doesn't. Separately, directors have no way to check whether material is already in the library without leaving the conversion flow, so they re-add things. Maya proposed a browser extension to solve both at once; Dev thinks they're different problems. That question is open.

## P1 — "Half my best source material dies in tabs."
- progress sought: Get source material from the moment of encounter into the library without relying on memory to bridge the gap to a conversion session.
- who: Crew member (Maya — researcher/curator who gathers and stages source material across browser tabs over days)
- circumstance: Mid-research, with dozens of tabs open over days. The only intake path is a desktop conversion session, so everything found while browsing has to survive in tabs. By the time Maya sits down to convert, the link between source and context is broken — which tab had it, why it mattered — and material never enters the library.
- evidence:
  - "Every time I'm doing research I end up with like forty tabs, and by the time I sit down to do a conversion session I can't remember which tab had the thing." — Maya — specific-past
  - "So stuff just never makes it in." — Maya — specific-past
  - "Half my best source material dies in tabs." — Maya — opinion (conviction high)
  - "That's real, I've watched you do it." — Dev — specific-past
  - "The point is capture-in-the-moment instead of capture-from-memory." — Maya — opinion (conviction high)
- what it's not: Not a request for a browser extension specifically. The extension is Maya's proposed solution; the problem is the time-gap between encountering material and having any place to put it. The form factor is open.
- where it lands: Source Conversion surface; known seam: "Capture happens only inside a desktop intake session; nothing exists for capture at the moment of encounter."
- checks: pass

## P2 — "Directors keep telling us they don't know what's already in the library, so they re-add things."
- progress sought: Know, at the moment it matters, whether source material is already banked — so work isn't duplicated and the library doesn't accumulate redundant cards.
- who: Director (reported secondhand by Maya, who fields director questions about what's already in the library)
- circumstance: During or before a conversion session, when a director is deciding whether material is worth converting. There is no "already banked" signal outside the Library browse view, so checking coverage means leaving the conversion flow and manually browsing. The result is redundant work.
- evidence:
  - "directors keep telling us they don't know what's already in the library, so they re-add things." — Maya — specific-past (secondhand but describes real events)
- what it's not: Not a request for search-in-an-extension or better browse navigation. The problem is the absence of a visibility signal at the moment the director is handling source material. Dev explicitly separates this from the capture problem: "That's a different thing though. That's search."
- where it lands: Search & duplicate awareness surface; known seam: "Duplicate detection runs only at atomize time, not at intake — and it is area-local."
- checks: pass

## Unclear — kept, not promoted
- "every director has this problem, literally all of them, I'd bet anything." — Maya — Asserts universal prevalence of the duplicate-awareness problem but stakes it on a bet, not observed data. Amplifies P2's scope without new evidence of who hurts or when.
- "A whole extension? That's a big surface." — Dev — Could be friction about implementation scope or a neutral question. No problem is stated; Dev doesn't say the scope causes pain or blocks progress.
- "That's a different thing though. That's search." / "It's all the same thing, it's the extension!" — Dev / Maya — A disagreement about whether capture and duplicate-awareness belong to the same solution surface. This is a solution-architecture debate, not a problem statement. It informed the decision to separate P1 and P2.

## Relationships
- P1 ↔ P2: sibling — distinct problems, attackable separately. P1 is about intake timing (no capture path at the moment of encounter; crew members mid-research). P2 is about visibility (no "already banked" signal at conversion time; directors deciding whether material is worth converting). Different roles, different circumstances, different surfaces. Neither causes the other.
- P1 ↔ P2: disputed — Maya vs Dev, over whether these belong to the same solution surface. Maya treats them as one ("It's all the same thing, it's the extension!"); Dev separates them ("That's a different thing though. That's search."). The dispute is about solution bundling, not causal structure. Test: build capture-at-encounter without duplicate-awareness, and duplicate-awareness without changing capture timing. If each independently reduces pain for its respective user, the problems are separable regardless of whether a single surface eventually serves both.

## Hunch
None earned. The two problems are siblings — distinct failure modes on different surfaces, affecting different roles, with independent evidence trails. The room's dispute about whether they share a solution surface is live and unsettled; claiming a root through that disputed territory would take a side.

## Spoken (75 words is the ceiling, not a target)
"Maya pitched a browser extension, but the conversation surfaced two separate problems. Crew members lose source material between finding it and sitting down to convert it. Directors duplicate work because they can't tell what's already banked. The room disagrees on whether those share a solution — the brief lays out a test for that. The duplicate-awareness problem rests on one secondhand report. Is there a director who can speak to it directly?"
