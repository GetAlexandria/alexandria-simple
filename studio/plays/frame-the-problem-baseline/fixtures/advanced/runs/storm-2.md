<!-- Clean-room run · full transcript · run 2 · Sonnet · current prompt · no answer key seen -->

# Problem Brief — Nadia and Theo's library-health review: trust, coverage, approvals, and onboarding
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
The Lantern library has developed several distinct problems that have been running together in the room: banked cards carry no freshness signal, so directors are making consequential decisions off stale material without knowing it; coverage bars count stale and duplicated cards the same as current ones, so the bars are giving directors a false read on area health; approval drafts queue behind a single director, and crew work goes stale before it is ever banked; and new crew members have nowhere to learn how to work the conversion flow. How the coverage-bar problem is caused — whether by staleness, duplication, or both — is still an open dispute with a test the team can run.

## P1 — "I acted on what the library told me, and it cost me"
- progress sought: make sound decisions about where to direct team effort, with confidence the library's signal is accurate
- who: Director (Nadia, Theo — named in transcript)
- circumstance: during a conversion session or planning decision, when a director reads a banked card or checks a coverage bar and acts on it
- evidence:
  - "I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone. Nothing told me it was stale. It just sits there looking exactly as confident as a card from yesterday." — Theo — specific-past
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — Nadia — specific-past
  - "The library has no sense of time." — Nadia — opinion (conviction high)
- what it's not: a request for a date-stamp field on cards; the underlying problem is that directors cannot distinguish trustworthy signal from stale noise while working
- where it lands: Library (coverage bars and card graph); Director dashboard
- insight (my read): Both specific-past instances are from directors making resource or work decisions — not casual browsing. The cost is wasted work and misallocated effort, not just confusion.
- checks: pass

## P2 — "I can't trust what the coverage bar is actually telling me"
- progress sought: use the coverage bar as a reliable signal for area health so I can make staffing and prioritization decisions
- who: Director (Nadia — named in transcript)
- circumstance: when reviewing the Director dashboard or Library to decide which areas need attention or sessions
- evidence:
  - "Ninety percent full of corpses is still ninety percent to that bar." — Nadia — opinion (conviction high)
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — Nadia — specific-past
  - "That's the duplication. Dupes pad the bar — it's counting the same thing twice." — Roman — opinion (conviction high)
  - "It's not the dupes, it's the staleness. The bar counts a dead card the same as a live one." — Nadia — opinion (conviction high)
- what it's not: a request to redesign the coverage bar UI; the problem is that the input to the bar is not reliable
- where it lands: Library (coverage bars); Director dashboard
- checks: pass

## P3 — "My drafts just sit there, and the source material goes stale before anything gets banked"
- progress sought: move conversion work through to banked cards without losing the underlying sources to time
- who: Crew member (Bex — named in transcript)
- circumstance: mid-conversion run, when the approving director is unavailable for multiple days
- evidence:
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked. Nothing moves without a director's sign-off and the director is one person with a real job." — Bex — specific-past
  - "I'm a bottleneck and I know it." — Theo — commitment
  - "Every director hates the approval wait. All of them. Guaranteed. Nobody will say it on the record but it's true." — Bex — opinion (conviction high)
- what it's not: a request for AI auto-approval; the underlying problem is that the throughput constraint lets work expire before it completes
- where it lands: Source Conversion (draft → director approval step)
- checks: pass

## P4 — "There is no way to know when the same source has already been banked somewhere else"
- progress sought: avoid duplicating work that has already been done in another area, and avoid inflating coverage with content that is already present
- who: Crew member and Director (Nadia — named; "Priya" referenced as attributed source)
- circumstance: during intake or atomize, when a crew member or director has no way to check cross-area duplicates before banking
- evidence:
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in. So the same source can live in Strategy and Ops and nothing notices." — Nadia — specific-past
  - "We've got dupes everywhere." — Roman — opinion (conviction high)
- what it's not: a request for a global deduplication sweep or index rebuild; the underlying problem is that no cross-area signal exists at intake or atomize time
- where it lands: Source Conversion (atomize step); Search & duplicate awareness
- checks: pass

## P5 — "Atomize gives wildly different results for documents that look the same to me"
- progress sought: predict how a document will atomize so I can plan conversion work and set expectations for downstream consumers
- who: Crew member (Sam — named in transcript)
- circumstance: when staging and converting vendor or reference documents, after having done this before and getting inconsistent output
- evidence:
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it. Consumers downstream have no idea what they're going to get." — Sam — specific-past
- what it's not: a request for a fixed atomize ratio; the problem is unpredictability in the conversion step that prevents planning
- where it lands: Source Conversion (atomize step)
- checks: pass

## P6 — "New crew members have nowhere to learn how to work the conversion flow"
- progress sought: onboard into Lantern and reach independent proficiency without having to rely on a single veteran colleague
- who: Crew member (Sam — named in transcript, describing his own first week)
- circumstance: first weeks of joining, when trying to learn the conversion flow and specifically the atomize step
- evidence:
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down. If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — Sam — specific-past
  - "I have tried to write it down. There's never time, because, see above, eleven drafts." — Bex — specific-past
- what it's not: a request to document a specific procedure; the problem is that operational knowledge of the product is not findable by someone who doesn't already have it
- where it lands: Source Conversion (conversion know-how); no dedicated onboarding surface exists (noted as known seam in surface map)
- checks: pass

## Unclear — kept, not promoted
- "it's getting — harder? to trust" — Theo — framing remark, not a specific problem; the concrete specifics from Theo land in P1 and the staleness dimension of P2
- "the whole library just feels heavier to work in than it did six months ago. I can't put my finger on one thing." — Nadia — ambient complaint; no specific moment described; does not produce a distinct entry beyond P1–P2
- "It's not one thing though. That's the problem. It's like five things wearing a trenchcoat." — Bex — meta-commentary on the conversation structure; not a problem statement
- "maybe people bank stuff in a hurry because of the backlog, and that's part of why we get sloppy dupes? I don't know. Might be nothing." — Bex — speculative causal chain; Bex self-qualifies it as "might be nothing"; if true it would link P3 and P4, but there is no specific-past evidence to support it; held here rather than promoted
- "people keep asking for dark mode. We should just do it. Easy win, everyone loves it." — Sam — Theo dismisses it as out of scope; no problem voiced, only a solution request; not enough to form an entry

## Relationships
- P1 ↔ P2: subset-of — P2 (unreliable coverage bars) is a specific manifestation of P1 (acting on untrustworthy library signal); a director misreading area health is one instance of acting on stale or inflated information
- P2 ↔ P4: disputed — Roman vs. Nadia over whether the coverage-bar problem is caused primarily by staleness (Nadia) or duplication (Roman). Bex: "Both of you are guessing, honestly." Test: audit a representative area — count cards that are stale-only, duplicate-only, and both; compare the bar impact of each category. Could be gathered by Roman's team running a point-in-time query against the Library.
- P3 ↔ P6: sibling — distinct problems; P3 is about throughput during active conversion; P6 is about new-crew capability. They share that Bex's bandwidth is implicated in both (she's the approval bottleneck and the knowledge holder), but they are independently attackable.
- P3 ↔ P4: unclear — Bex speculated that approval backlog pressure causes hasty banking and therefore more dupes. No specific-past evidence. Held in Unclear rather than promoted.
- P5 ↔ P6: sibling — both concern the atomize step and crew-side experience, but P5 is about unpredictability for anyone doing conversion, P6 is specifically about onboarding; attackable separately.

## Hunch
Hunch (labeled): P1 — the absence of a freshness signal — is the suspected root. The two clearest specific-past instances in the room (Theo's half-day rewrite, Nadia's misread area deprioritization) are both cases where directors trusted a card or a bar that carried no age signal. The bar problem (P2) flows downstream of that same gap: the bar cannot weigh freshness it was never given. This is a hunch about the problem structure, not a claim about what to build first.

## Spoken (75 words is the ceiling, not a target)
"We're framing the library-health thread — from Theo's opener through the onboarding point, minus the Acme block. I see six problems. Two specific-past moments ground the trust problem clearly: Theo's wasted half-day and Nadia's misread area. Whether the bar problem is mostly staleness or duplication is still open — Bex called it a guessing match. The brief has a test for that dispute. My hunch is the freshness gap is the root, but I want to hear if the room reads it differently."
