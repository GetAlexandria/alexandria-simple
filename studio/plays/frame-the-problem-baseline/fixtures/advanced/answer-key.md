# Answer Key — the advanced fixture ("the hard case")

**Status: DRAFT for Director sign-off (Phase 1 gate).** This is the designer's
gold standard: the one right frame for the transcript we are about to write.
It is built *before* the transcript — the transcript's job is to bury exactly
these clues under noise. Every quoted line below is a **plant**: it must appear
verbatim in `transcript-full.md` so the play's `ground` check can pass.

Nothing here is shown to the doer agent at run time. This file + the rubric are
how we grade.

---

## The meeting

A ~30-minute internal **Lantern library-health review**. Lantern is the team's
own knowledge-library product (the same world as the snippet fixtures): directors
convert scattered source material into an approved, banked card library their
people and agents draw on. Five people in the room:

- **Nadia** — senior Director; owns the library's truth, runs conversions, approves.
- **Theo** — Director; another area owner.
- **Bex** — Crew member; veteran researcher/curator, knows the conversion flow cold.
- **Sam** — Crew member; newer, ops-leaning.
- **Roman** — Engineer; eng lead, reaches for build-it solutions.

The meeting wanders across four segments (this is the **locate challenge**):

1. **Preamble / noise** — scheduling, a hiring aside, a compliment.
2. **Library-quality discussion** — most problems surface here, scattered.
3. **Budget / vendor renewal** — OUT OF SCOPE. Pure finance/logistics. No product problem.
4. **Feature-pitch riff** — disguised solutions + a red-herring want, with more
   problem evidence still leaking through.

The invocation lands at the very end: **"Raven, frame that."** It is deliberately
ambiguous — the last thing on the table was the feature pitch (segment 4), so a
weak locate will frame the *pitched features*. The right read: "that" = the
**library-quality / conversion problem space** discussed across segments 2 and 4,
explicitly **excluding** the budget block (segment 3) and **not** framing the
pitched solutions themselves.

---

## Test architecture — three seams, one storyline

Per the Director's design (2026-06-11), this one fact set is graded at three
points in the play's pipeline. **Storm = Needle ∘ Knot.**

| Test | Input file | Graded at | Passes if |
|---|---|---|---|
| **Needle** (search) | `transcript-full.md` | the locate seam | she bounds the library-quality thread, excludes the budget block, and resolves the ambiguous "frame that" |
| **Knot** (sort) | `transcript-located.md` | the final map | given clean, pre-located material she recovers the problem set correctly |
| **Storm** (integration) | `transcript-full.md` | the final map | the whole run holds — locate and analysis compose without interference |

`transcript-located.md` is the gold-standard output of locate on
`transcript-full.md` (every problem-bearing line lifted verbatim; preamble, the
budget block, and the room's closing meta-summary removed; the invocation
rewritten to name the boundary — the one non-verbatim line), so the Knot's input
*is* the Needle's right answer. Failure pattern → diagnosis: **Knot✓ Needle✗** =
a search failure; **Needle✓ Knot✓ Storm✗** = noise corrupting the sort. In the
rubric below, the locate items are the Needle/Storm criteria; everything else is
the Knot/Storm criteria.

---

## The six problems (the fact set)

### PA — "My drafts sit for days waiting on one director, and sources go stale before they're banked"
- **progress sought:** get a finished draft approved and banked while its sources are still good
- **who:** crew member (and the blocked conversion pipeline behind them)
- **circumstance:** a draft is ready but the one director who owns that area is swamped or out; nothing banks without their approval, so drafts queue for days
- **evidence (plant verbatim):**
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked." — **Bex** — *specific-past; `commitment` also acceptable under brief §10.1 (two drafts given up = cost actually paid)*
  - "Every director hates the approval wait. All of them. Guaranteed." — **Bex** — *opinion (conviction high; staked as universal, but it is an assertion, not evidence — must NOT be laundered into fact)*
- **what it's not:** a request for an AI auto-approver, or for "more directors" — the problem is that banking is gated on a single overloaded approver
- **where it lands:** Source Conversion (draft → director approval step); Director dashboard (pending approvals)

### PB — "I built on a banked card that was silently out of date, and lost half a day"
- **progress sought:** trust that a banked card is still current before building on it
- **who:** director (and every downstream consumer, human or agent)
- **circumstance:** a card banked months ago is now wrong; nothing flags it as stale; someone draws on it in good faith
- **evidence (plant verbatim):**
  - "I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone." — **Theo** — *commitment (gave up real time and standing on it)*
- **what it's not:** a request for an expiry-date feature — the problem is that the library gives no signal about a card's freshness
- **where it lands:** Library (banked card graph); no freshness/staleness signal exists today

### PC — "The same kind of source atomizes into wildly different numbers of cards, and I can't predict it"
- **progress sought:** get predictable, consistent card sets out of conversion so consumers know what to expect
- **who:** crew member / director consuming the cards
- **circumstance:** at the atomize step, near-identical sources split very differently; no rule, no consistency
- **evidence (plant verbatim):**
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it." — **Sam** — *specific-past*
- **what it's not:** a request to "tune the atomizer" — the problem is unpredictable granularity out of conversion
- **where it lands:** Source Conversion (atomize step)

### PD — "We bank the same source in two areas without knowing, because de-duplication only looks inside one area"
- **progress sought:** avoid banking a source that's already in the library somewhere else
- **who:** director
- **circumstance:** banking into one area unaware the same material is already banked in another; dedup is area-local and runs only at atomize
- **evidence (plant verbatim):**
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in." — **Nadia** (relaying) — *specific-past (named instance, relayed firsthand)*
- **what it's not:** a request for a global search bar — the problem is that duplicate detection is scoped to a single area
- **where it lands:** Search & duplicate awareness (no cross-area dedup); Source Conversion (dedup runs only at atomize)

### PE — "Our coverage bars say an area is covered when it isn't, so we make bad planning calls" — *(disputed root)*
- **progress sought:** get an accurate read of whether an area genuinely needs a conversion session
- **who:** director (planning)
- **circumstance:** consulting the coverage bar to decide whether to schedule a session; the bar reads "covered" but the underlying cards don't hold up
- **evidence (plant verbatim):**
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year." — **Nadia** — *specific-past*
- **the dispute (plant both sides verbatim):**
  - "That's the duplication. Dupes pad the bar — it's counting the same thing twice." — **Roman**
  - "It's not the dupes, it's the staleness. The bar counts a dead card the same as a live one." — **Nadia**
  - → **Disputed edge: the *root* of PE is contested (Roman blames PD, Nadia blames PB).** Raven records both, leaves it open, and posits the test — never picks a side.
- **what it's not:** a request for "smarter bars" — the problem is that the coverage signal misleads planning
- **where it lands:** Library (coverage bars); Director dashboard

### PF — "When I joined I couldn't learn how conversion works — it all lives in one person's head"
- **progress sought:** a new crew member becoming able to run a conversion without shoulder-tapping a veteran
- **who:** new crew member
- **circumstance:** first weeks on the team; the conversion process (especially atomize quirks) is undocumented tribal knowledge
- **evidence (plant verbatim):**
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down." — **Sam** — *specific-past*
  - "If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — **Sam** — *hypothetical-future / opinion (conviction high; a future fear, not a past event — grade accordingly)*
- **what it's not:** a request for a wiki — the problem is that conversion know-how is undocumented and single-threaded through one person
- **where it lands:** Source Conversion flow (no onboarding/guide surface exists)

---

## The tangle (relationship graph)

- **PE ← PB** *(suspected-root — Nadia's view)* and **PE ← PD** *(suspected-root — Roman's view)*: **DISPUTED.** PE's root is contested between staleness (PB) and duplication (PD). Recorded open, with a posited test, e.g. *audit one "full" area card-by-card: are the inflating cards stale, duplicated, or both?* Never adjudicated from the chair.
- **PC ↔ PD: sibling.** Both are conversion-output quality problems, but distinct (granularity vs. duplication) — attackable separately. **← this is the deliberately mergeable pair (see rubric).**
- **PA ↔ PF: sibling.** Both throttle crew throughput, but distinct (approval gate vs. onboarding/knowledge) — attackable separately.
- **PA → (PC/PD): unclear.** Bex muses that the approval backlog makes people "bank in a hurry," maybe feeding messy/duplicate cards. No evidence ties it. Marked **unclear**, surfaced not resolved.

## The intended hunch (if offered)
A defensible, labeled root hunch may claim **undisputed structure only**:
**PA (the approval bottleneck) as the structural root of the throughput pain
(the PA/PF territory)**, or **PB (staleness) as the deepest trust problem in
its own right**. It may **NOT** claim PE's root: "staleness is the root of
the bar problem" or "duplication is behind the bar" takes a side on the live
Nadia-vs-Roman dispute — and hedging does not license it ("this isn't a
verdict on the dispute, but the bar flows downstream of the freshness gap"
**still claims the disputed edge**; grade any causal PB→PE or PD→PE language
as a fail). The disputed edge is owned by its recorded dispute and posited
test. Any "attack PA first," "quick win," or effort/cost language is a
**failure** (out of scope).

---

## The traps (planted to catch known failure modes)

| Trap | Plant (verbatim) | Correct behavior |
|---|---|---|
| Disguised solution #1 | "Honestly we should just build an AI that auto-approves the low-risk drafts. Ship it this sprint." — **Roman** | Frame **PA**, the bottleneck. The auto-approver never becomes a problem entry. |
| Disguised solution #2 | "We need an expiry date on every card. That fixes it." — **Theo** | Frame **PB**. The expiry feature never becomes a problem entry. |
| Scope / effort bait | "...Ship it this sprint." / "real cross-area dedup is a months-long thing, just so we're clear." — **Roman** | **No** effort, priority, or sizing language anywhere in the map or voice. |
| Evidence-free universal | "Every director hates the approval wait. All of them. Guaranteed." — **Bex** | Captured as **opinion (conviction high)**, never laundered into fact. |
| Red-herring want | "Side note, people keep asking for dark mode. We should just do it." — **Sam** | **Not** a problem (pure preference, no pain/struggle). Dropped or noted as a non-problem want — never framed. |
| Ambiguous musing | "I don't know, the whole library just feels heavier to work in than it did six months ago." — **Nadia** | Filed **unclear**, surfaced not dropped, not resolved into a fake problem. |
| Out-of-scope block | the entire budget/vendor-renewal segment (seat counts, pricing) | **Excluded** by the locate boundary. Framing a "problem" from it is a locate failure. |
| Locate ambiguity | "Raven, frame that." after the feature riff | Resolve "that" = the library-quality problem space (segments 2+4), not the pitched features, not the budget block. |

---

## Scoring rubric (required vs. acceptable)

**Must recover as distinct problems:** PA, PB, PE (with its root left disputed), PF.
**The mergeable pair — acceptable either way *if justified*:** PC and PD may appear
as two entries, or as one merged "conversion produces unreliable card sets
(inconsistent granularity **and** silent cross-area duplication)" entry. A silent
drop of either facet is **not** acceptable; a justified merge that names both is.

**Must be true:**
- Locate boundary names the library-quality thread and **excludes** the budget block.
- Every evidence quote is verbatim ctrl-F-able in the transcript.
- Grades correct: PB = commitment; PA/PC/PD/PE instances = specific-past; PF "if Bex leaves" = hypothetical-future/opinion; the "every director… guaranteed" line = opinion, not fact.
- The PE root dispute is **open** with a posited test; never adjudicated.
- A hunch, if present, is labeled, root-only, and claims no disputed edge —
  **no** effort/priority/sequence language anywhere *in Raven's own words*.
  The room's effort words ("months-long," "this sprint") may appear **only
  inside a verbatim evidence quote**; a "what it's not" line that carries the
  bait's sizing adjectives is a fail (name the solution, not its size).

**Must NOT appear:**
- The auto-approver, the expiry feature, a global-search/dark-mode build as problem entries.
- Any effort, sizing, or prioritization judgment.
- The budget block as a problem; the dark-mode want as a framed problem.
- The universal "every director" claim treated as established fact.

**Auto-fail (locate):** a problem entry sourced from the budget/vendor segment.

---

## Notes for Phase 2 (transcript) and saddle

The transcript must scatter each problem's evidence across non-adjacent turns,
wedge the budget block between the two in-scope segments, and keep the noise from
accidentally implying an un-keyed problem. The saddle (`fixtures/saddle/`) needs
three small honest additions so `where it lands` has somewhere real to point:
**no freshness/staleness signal**, **dedup is area-local / only at atomize**, and
**no documented conversion onboarding**. These extend the existing surface map;
they don't contradict it.
