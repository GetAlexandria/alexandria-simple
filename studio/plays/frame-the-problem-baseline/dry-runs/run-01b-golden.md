<!-- Dry-run 1b · 2026-06-10 · retry after Gate-2 ruling patches (conviction capture, no-adjudication, char-exact quotes) · RESULT: content fixes landed; FAILED word budget (81) and soft side-taking ("I think they're siblings") -->

# Problem Map — capture-friction and duplicate-blindness in Lantern source work
framed with: surface map provided · users provided · prior map not provided
run: complete

## P1 — "By the time I sit down to convert, I've lost which tab had the thing — my best sources die in tabs"
- progress sought: get source material from the moment of encounter into the library without losing it to tab overload
- who: crew member (Maya, named; researcher/curator role confirmed in users context)
- circumstance: mid-research, days before a conversion session, working across dozens of browser tabs; the intake session is separate in time from the moment of discovery
- evidence:
  - "Every time I'm doing research I end up with like forty tabs, and by the time I sit down to do a conversion session I can't remember which tab had the thing. So stuff just never makes it in." — Maya — specific-past (ongoing recurring past experience)
  - "Half my best source material dies in tabs." — Maya — opinion (conviction high)
  - "That's real, I've watched you do it." — Dev — specific-past (direct witness corroboration)
  - "The point is capture-in-the-moment instead of capture-from-memory." — Maya — opinion (conviction high; this is her own distillation of the pain)
- what it's not: a request for a browser extension (that is the proposed solution; the problem is the temporal gap between encounter and intake session)
- where it lands: Source Conversion intake — Known seam: "Capture happens only inside a desktop intake session; nothing exists for capture at the moment of encounter (reading, browsing, meetings)"
- insight (my read): the pain is a timing mismatch — discovery happens continuously, intake is session-bound; any solution must bridge that gap, not just add a new entry point
- checks: pass

## P2 — "I don't know what's already in the library, so I end up adding things twice"
- progress sought: know before or during source gathering whether a source is already banked, to avoid duplicate work
- who: director (described by Maya as the speaker; role confirmed in users context — directors own the library's truth and approve conversions)
- circumstance: during or before a conversion session, considering whether to add a source; no "already banked" signal available outside the Library view itself
- evidence:
  - "directors keep telling us they don't know what's already in the library, so they re-add things." — Maya — opinion (conviction high; this is Maya reporting a pattern she has heard, not a quote from a director)
  - "every director has this problem, literally all of them, I'd bet anything." — Maya — opinion (conviction high; explicit staked claim, no director present to corroborate)
- what it's not: a search feature or a browser extension overlay; the underlying problem is absence of duplicate awareness at the point of intake, not absence of a particular UI
- where it lands: Search & duplicate awareness — "no global search, no 'already banked' signal anywhere outside the Library view itself"; also Source Conversion intake (duplicate detection runs only at atomize time, not at intake, per known seams)
- checks: pass

## Relationships
- P1 ↔ P2: sibling — both arise in the source-gathering workflow and were pitched together as one extension idea, but they are distinct: P1 is a crew-member timing problem (encounter vs. session), P2 is a director awareness problem (known vs. unknown library state). Dev named the distinction explicitly ("That's a different thing though. That's search."). Maya disputed it ("It's all the same thing, it's the extension!"). **Disputed (Maya vs. Dev, over whether P1 and P2 are one problem or two.)** Test: ask the next director who reports re-adding sources whether the problem occurs at intake (they couldn't check) or at atomize time (they didn't notice the duplicate prompt); that locates where the awareness gap actually bites and determines whether one intervention covers both users or two separate ones are needed.

## Hunch
Hunch (labeled as such): P1 is the root pain. Maya's own framing — "capture-in-the-moment instead of capture-from-memory" — describes a structural gap (the surface map confirms no capture exists outside a desktop session), and Dev witnessed it directly. P2 rests on reported director frustration with no director in the room to confirm it; it may be real, but the evidence is thinner. If the team has bandwidth for one, P1 is better grounded.

## Spoken (≤75 words)
"Framing the discussion that started with Maya's browser-extension pitch. Behind it sit two separate problems: Maya's own — sources die in tabs because discovery and intake don't happen at the same time — and a reported director problem, re-adding things that are already banked. Dev and Maya disagree on whether those are one thing or two; I think they're siblings. Maya's problem has a witness; the director claim doesn't. What would it take to get a director in the room to confirm it?"
