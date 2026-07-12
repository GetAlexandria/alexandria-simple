<!-- Clean-room run · full transcript · run 1 · Sonnet · current prompt · no answer key seen -->

# Problem Brief — Nadia and Theo's library-health review: can we trust what's in it?
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture

The Lantern library has become harder to trust: stale cards are indistinguishable from current ones, coverage bars count those stale and duplicate cards as full coverage, and the approval queue creates a bottleneck that slows the whole conversion pipeline. There is also an onboarding gap — knowledge of how to run conversions lives in one veteran crew member's head. Whether staleness or duplication is the bigger driver of the coverage-bar problem is an open dispute: neither side has checked.

## P1 — "I built real work on a card that turned out to be old, and nothing warned me"
- progress sought: confidently using library cards to do director-level work (briefings, onboarding decks, strategy)
- who: Director
- circumstance: deep in a time-consuming work product, drawing on a banked card that looked current
- evidence:
  - "Two weeks ago I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone. Nothing told me it was stale. It just sits there looking exactly as confident as a card from yesterday." — Theo — specific-past
  - "The library has no sense of time." — Nadia — opinion (conviction: medium)
- what it's not: a request to add an expiry date field to cards (that is one possible mechanism; the problem is that freshness is invisible, not that a specific field is missing)
- where it lands: Library (banked card graph); Director dashboard
- checks: pass

## P2 — "The coverage bar told me an area was healthy, but it was full of old cards — I almost missed a session that area badly needed"
- progress sought: using the coverage bar to make accurate staffing and resource decisions across the library
- who: Director
- circumstance: area planning — evaluating which areas need conversion sessions
- evidence:
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — Nadia — specific-past
  - "The bar counts a dead card the same as a live one. Ninety percent full of corpses is still ninety percent to that bar." — Nadia — opinion (conviction: high)
  - "Dupes pad the bar — it's counting the same thing twice." — Roman — opinion (conviction: medium)
- what it's not: a request to redesign the coverage bar UI; the problem is that the number the bar reports is not trustworthy as a planning input
- where it lands: Library (coverage bars); Director dashboard
- insight (my read): P2 is downstream of P1 — the same invisible-staleness condition that burned Theo on a card also corrupted Nadia's area-level signal. They are symptoms of the same root; see Relationships.
- checks: pass

## P3 — "The same source ended up banked in two areas and nothing caught it"
- progress sought: knowing the library doesn't already contain what I'm about to add, and trusting that the library doesn't hold redundant copies of the same thing
- who: Director; crew member (both encounter this)
- circumstance: after a conversion session; also at area-planning time when coverage counts feel off
- evidence:
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in. So the same source can live in Strategy and Ops and nothing notices." — Nadia — specific-past
  - "We've got dupes everywhere." — Roman — opinion (conviction: high)
  - "I'd bet it's mostly dupes." — Roman — opinion (conviction: high)
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it. Consumers downstream have no idea what they're going to get." — Sam — specific-past (atomization inconsistency sub-point), opinion (conviction: medium) on consumer confusion
- what it's not: a request to build global search — the problem is that cross-area duplication is invisible, not that search is absent
- where it lands: Search & duplicate awareness; Source Conversion (atomize step)
- checks: pass

## P4 — "When the director is unavailable, my drafts just sit — and by the time approval comes, the sources have gone stale"
- progress sought: moving a conversion through to banking without the pipeline stalling on a single person's calendar
- who: crew member
- circumstance: mid-conversion, drafts ready and waiting, director is legitimately unavailable (travel, meetings, out of office)
- evidence:
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked. Nothing moves without a director's sign-off and the director is one person with a real job." — Bex — specific-past
  - "That's fair, I'm a bottleneck and I know it." — Theo — commitment (Theo, a director, conceding the bottleneck on the record)
  - "Every director hates the approval wait. All of them. Guaranteed. Nobody will say it on the record but it's true." — Bex — opinion (conviction: high)
- what it's not: a request to build an auto-approver; the problem is that the conversion pipeline has a single point of human dependency that blocks flow
- where it lands: Source Conversion (draft → director approval step)
- checks: pass

## P5 — "Nobody wrote down how to run a conversion, so I had to learn it by walking to Bex's desk"
- progress sought: running the conversion pipeline — especially the atomize step — without depending on a specific veteran being physically present
- who: crew member (newer)
- circumstance: first week, or any time an unfamiliar conversion type comes up
- evidence:
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down. If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — Sam — specific-past, opinion (conviction: high)
  - "I have tried to write it down. There's never time, because, see above, eleven drafts." — Bex — specific-past (confirming nothing is written); also implicates P4 as a contributing condition
- what it's not: a request to write a wiki page; the problem is that conversion know-how has no durable home
- where it lands: Source Conversion; surface map notes this seam explicitly: "Conversion know-how is undocumented"
- checks: pass

## Unclear — kept, not promoted

- "It's not one thing though. That's the problem. It's like five things wearing a trenchcoat." — Bex — evocative framing, but no specific pain named; captured as orientation for the boundary, not a problem entry
- "I don't know, the whole library just feels heavier to work in than it did six months ago. I can't put my finger on one thing." — Nadia — general sentiment, no specific circumstance; may be the gestalt of P1–P4, or may point to something not yet surfaced
- "maybe people bank stuff in a hurry because of the backlog, and that's part of why we get sloppy dupes? I don't know. Might be nothing." — Bex — hypothesized causal link (approval wait → rushed banking → duplication), flagged as uncertain by the speaker; relevant to Relationships but not itself a named problem

## Relationships

- P1 ↔ P2: suspected-root. P1 (invisible staleness on individual cards) is likely what causes P2 (coverage bars that misrepresent area health). Both Nadia and Roman also assert duplication (P3) contributes to bar inflation. This is a hunch, not settled — see Hunch.
- P2 ↔ P3: disputed — Nadia vs. Roman, over what is the bigger driver of bar inflation. Nadia asserts it's staleness; Roman asserts it's duplication. Bex noted both sides are guessing. Test: pull a sample of the Ops area (or any area where the bar recently surprised a director), count how many cards are stale (banked > X months ago with no refresh) versus how many are cross-area duplicates; compare the two counts. Both can be gathered from existing bank records without new instrumentation. Nadia's specific-past (Ops at 90%, half from last year) is on the table but does not settle the duplication fraction.
- P3 ↔ P4: sibling. Both are distinct pipeline problems; P3 is about what ends up in the library, P4 is about what can leave the conversion queue. Bex's aside suggests P4 may contribute to P3 (rushed banking under backlog pressure), but the speaker immediately disclaimed it — left open.
- P4 ↔ P5: sibling. Both live in the conversion pipeline and affect crew members, but are separately attackable. Bex's line ("There's never time, because, see above, eleven drafts") suggests P4 makes P5 worse — worth noting, not asserting.
- P1 ↔ P5: unclear. Sam's atomization inconsistency observation (twelve cards vs. three for similar docs) could point to a sub-problem in how cards are generated, which might relate to staleness — but the transcript doesn't develop this far enough to connect it to P1.

## Hunch

Hunch: P1 (no freshness signal on individual cards) is likely the root of the library-trust cluster. If cards had a visible freshness signal, Nadia's coverage bar (P2) could weight it — but the bar can't weigh what the card doesn't surface. P3 (cross-area duplication) also inflates the bar, but Nadia's specific example names stale cards as the cause of her near-miss, not duplicates. This is a hunch about the problems, not a verdict on the Roman/Nadia dispute — that dispute needs its test run first.

## Spoken (75 words is the ceiling, not a target)

"The boundary is the library-health review — everything from Theo's stale-card story through to the approval bottleneck and Sam's onboarding gap. I see five distinct problems. My hunch is that invisible staleness is the root of the trust cluster, but Roman and Nadia read the bar problem differently, and the brief has a test for that. The weakest point in the brief: Bex's claim that every director feels the approval wait — that's an untested bet."
