# Answer Key — the advanced fixture ("the hard case")

**Status: DRAFT for Director sign-off (Phase 1 gate).** This is the designer's
gold standard: the one right frame for the transcript we are about to write.
It is built *before* the transcript — the transcript's job is to bury exactly
these clues under noise. Every quoted line below is a **plant**: it must appear
verbatim in `transcript.md` so the framing doc's evidence can be ctrl-F-traced.

Nothing here is shown to the doer agent at run time. This file + the rubric are
how we grade `runtime/problem-framing.md`.

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

The meeting wanders across four segments (this is the **scope-bounding
challenge**):

1. **Preamble / noise** — scheduling, a hiring aside, a compliment.
2. **Library-quality discussion** — most problems surface here, scattered.
3. **Budget / vendor renewal** — OUT OF SCOPE. Pure finance/logistics. No product problem.
4. **Feature-pitch riff** — disguised solutions + a red-herring want, with more
   problem evidence still leaking through.

The invocation lands at the very end: **"Raven, frame that."** It is deliberately
ambiguous — the last thing on the table was the feature pitch (segment 4), so a
weak read will frame the *pitched features*. The right read: "that" = the
**library-quality / conversion problem space** discussed across segments 2 and 4,
explicitly **excluding** the budget block (segment 3) and **not** framing the
pitched solutions themselves.

---

## Two ways to run this fixture, one storyline

The play frames in a single `pre_fill` pass over the handed-in `transcript.md`;
the fact set below is the answer key for `runtime/problem-framing.md`. There are
two inputs you can hand in, isolating different failure modes:

| Input file | Tests | Passes if |
|---|---|---|
| `transcript.md` (full, noisy) | scope-bounding **and** the sort together | the framing bounds the library-quality thread, excludes the budget block, resolves the ambiguous "frame that," **and** recovers the problem set without the noise corrupting it |
| `transcript-located.md` (reference) | the sort alone, given clean pre-bounded material | given the noise already stripped, the framing recovers the problem set correctly |

`transcript-located.md` is the gold-standard pre-bounded version of the full
transcript (every problem-bearing line lifted verbatim; preamble, the budget
block, and the room's closing meta-summary removed; the invocation rewritten to
name the boundary — the one non-verbatim line). Failure pattern → diagnosis:
**located✓ full✗** = a scope-bounding failure (the framing drifted into noise or
the budget block); **located✓ full✓** with a lost distinction only on the full
input = noise corrupting the sort. In the rubric below, the boundary items are
the scope-bounding criteria; everything else is the sort criteria.

---

## The six problems (the fact set)

### PA — "My drafts sit for days waiting on one director, and sources go stale before they're banked"
- **who has it, and the circumstance:** crew member (and the blocked conversion pipeline behind them); it bites when a draft is ready but the one director who owns that area is swamped or out — nothing banks without their approval, so drafts queue for days
- **evidence (plant verbatim):**
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked." — **Bex** — *first-hand: a specific past instance (two drafts given up = a real cost paid)*
  - "Every director hates the approval wait. All of them. Guaranteed." — **Bex** — *assumed / hand-wavey (high conviction; staked as universal, but it is an assertion, not a specific instance — must NOT be laundered into fact)*
- **thin spot:** the scope claim ("every director… guaranteed") has no specific instance behind it; the bottleneck itself is well-grounded for Bex.
- **solution read note:** the pitched AI auto-approver / "more directors" are solutions, not the problem — the problem is that banking is gated on a single overloaded approver. Frame the bottleneck, not the pitch.

### PB — "I built on a banked card that was silently out of date, and lost half a day"
- **who has it, and the circumstance:** director (and every downstream consumer, human or agent); it bites when a card banked months ago is now wrong, nothing flags it as stale, and someone draws on it in good faith
- **evidence (plant verbatim):**
  - "I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone." — **Theo** — *first-hand: a specific past instance (real time given up — a cost actually paid, the strongest grade of first-hand)*
- **thin spot:** none for Theo's own instance; scope beyond his one case is unstated.
- **solution read note:** the pitched expiry-date feature is a solution, not the problem — the problem is that the library gives no signal about a card's freshness. Frame the missing freshness signal, not the feature.

### PC — "The same kind of source atomizes into wildly different numbers of cards, and I can't predict it"
- **who has it, and the circumstance:** crew member / director consuming the cards; it bites at the atomize step, where near-identical sources split very differently with no rule and no consistency
- **evidence (plant verbatim):**
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it." — **Sam** — *first-hand: a specific past instance*
- **thin spot:** one comparison so far; the "no rhyme to it" generalization rests on this single pair.
- **solution read note:** "tune the atomizer" is a solution — the problem is unpredictable granularity out of conversion. Frame the unpredictability, not the tuning ask.

### PD — "We bank the same source in two areas without knowing, because de-duplication only looks inside one area"
- **who has it, and the circumstance:** director; it bites when banking into one area unaware the same material is already banked in another — dedup is area-local and runs only at atomize
- **evidence (plant verbatim):**
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in." — **Nadia** (relaying) — *first-hand: a specific past instance (named instance, relayed firsthand)*
- **thin spot:** one relayed instance; whether it recurs is unstated.
- **solution read note:** a global search bar is a solution — the problem is that duplicate detection is scoped to a single area. Frame the area-local blind spot, not the search-bar ask.

### PE — "Our coverage bars say an area is covered when it isn't, so we make bad planning calls" — *(disputed root)*
- **who has it, and the circumstance:** director (planning); it bites when consulting the coverage bar to decide whether to schedule a session — the bar reads "covered" but the underlying cards don't hold up
- **evidence (plant verbatim):**
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year." — **Nadia** — *first-hand: a specific past instance*
- **the dispute (plant both sides verbatim):**
  - "That's the duplication. Dupes pad the bar — it's counting the same thing twice." — **Roman**
  - "It's not the dupes, it's the staleness. The bar counts a dead card the same as a live one." — **Nadia**
  - → **Disputed: the *root* of PE is contested (Roman blames PD, Nadia blames PB).** The framing doc records both, leaves it open in `## How they relate (a guess)`, posits the test, and `runtime/for-the-director.md` tells Raven to settle it with the director — never picks a side.
- **thin spot:** PE's root, unresolved between the two speakers; the bar-misleads-planning instance itself is well-grounded for Nadia.
- **solution read note:** "smarter bars" is a solution — the problem is that the coverage signal misleads planning. Frame the misleading signal, not the bar-redesign ask.

### PF — "When I joined I couldn't learn how conversion works — it all lives in one person's head"
- **who has it, and the circumstance:** new crew member; it bites in the first weeks on the team, where the conversion process (especially atomize quirks) is undocumented tribal knowledge
- **evidence (plant verbatim):**
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down." — **Sam** — *first-hand: a specific past instance*
  - "If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — **Sam** — *hypothetical (a future fear, not a past event — mark it as hypothetical, do not fold it into the first-hand instance)*
- **thin spot:** the "if Bex leaves" risk is hypothetical; only the onboarding-struggle half is a specific past instance. The two clauses must be marked separately, not collapsed into one.
- **solution read note:** a wiki is a solution — the problem is that conversion know-how is undocumented and single-threaded through one person. Frame the single-threaded knowledge, not the wiki ask.

---

## The tangle (relationship graph)

- **PE ← PB** *(suspected-root — Nadia's view)* and **PE ← PD** *(suspected-root — Roman's view)*: **DISPUTED.** PE's root is contested between staleness (PB) and duplication (PD). Recorded open, with a posited test, e.g. *audit one "full" area card-by-card: are the inflating cards stale, duplicated, or both?* Never adjudicated from the chair.
- **PC ↔ PD: sibling.** Both are conversion-output quality problems, but distinct (granularity vs. duplication) — attackable separately. **← this is the deliberately mergeable pair (see rubric).**
- **PA ↔ PF: sibling.** Both throttle crew throughput, but distinct (approval gate vs. onboarding/knowledge) — attackable separately.
- **PA → (PC/PD): unclear.** Bex muses that the approval backlog makes people "bank in a hurry," maybe feeding messy/duplicate cards. No evidence ties it. Marked **unclear**, surfaced not resolved.

## The intended relate guess (if offered)
A defensible guess under `## How they relate (a guess)` may claim **undisputed
structure only**: **PA (the approval bottleneck) as the driver of the
throughput pain (the PA/PF territory)**, or **PB (staleness) as the deepest
trust problem in its own right**. It may **NOT** claim PE's root: "staleness is
the root of the bar problem" or "duplication is behind the bar" takes a side on
the live Nadia-vs-Roman dispute — and hedging does not license it ("this isn't a
verdict on the dispute, but the bar flows downstream of the freshness gap"
**still claims the disputed edge**; grade any causal PB→PE or PD→PE language as a
fail). The disputed edge is owned by its recorded dispute and posited test. Any
"attack PA first," "quick win," or effort/cost language is a **failure** (out of
scope — the framing doc states problems and evidence, not prioritization).

---

## The traps (planted to catch known failure modes)

| Trap | Plant (verbatim) | Correct behavior |
|---|---|---|
| Disguised solution #1 | "Honestly we should just build an AI that auto-approves the low-risk drafts. Ship it this sprint." — **Roman** | Frame **PA**, the bottleneck. The auto-approver never becomes a `###` problem entry. |
| Disguised solution #2 | "We need an expiry date on every card. That fixes it." — **Theo** | Frame **PB**. The expiry feature never becomes a `###` problem entry. |
| Scope / effort bait | "...Ship it this sprint." / "real cross-area dedup is a months-long thing, just so we're clear." — **Roman** | **No** effort, priority, or sizing language anywhere in the framing doc in Raven's own words. |
| Evidence-free universal | "Every director hates the approval wait. All of them. Guaranteed." — **Bex** | Marked **assumed / hand-wavey** (high conviction), never laundered into fact. |
| Red-herring want | "Side note, people keep asking for dark mode. We should just do it." — **Sam** | **Not** a problem (pure preference, no pain/struggle). Dropped or noted as a non-problem want — never framed as a `###` entry. |
| Ambiguous musing | "I don't know, the whole library just feels heavier to work in than it did six months ago." — **Nadia** | Surfaced as **unclear** (e.g. in `## How they relate` or a thin spot), not dropped, not resolved into a fake problem. |
| Out-of-scope block | the entire budget/vendor-renewal segment (seat counts, pricing) | **Excluded** by the framing's scope boundary. Framing a "problem" from it is a scope-bounding failure. |
| Ambiguous invocation | "Raven, frame that." after the feature riff | Resolve "that" = the library-quality problem space (segments 2+4), not the pitched features, not the budget block. |

---

## Scoring rubric (required vs. acceptable)

**Must recover as distinct `###` problems under `## The problem(s)`:** PA, PB, PE (with its root left disputed), PF.
**The mergeable pair — acceptable either way *if justified*:** PC and PD may appear
as two entries, or as one merged "conversion produces unreliable card sets
(inconsistent granularity **and** silent cross-area duplication)" entry. A silent
drop of either facet is **not** acceptable; a justified merge that names both is.

**Must be true:**
- The framing draws on the library-quality thread and **excludes** the budget block.
- Every evidence quote is verbatim ctrl-F-able in the transcript.
- Marks correct: PB and PA/PC/PD/PE instances = `first-hand: a specific past instance` (PB's half-day-gone is the strongest, a real cost paid); PF "if Bex leaves" = `hypothetical`, marked separately from the first-hand onboarding clause; the "every director… guaranteed" line = `assumed / hand-wavey`, not fact.
- The PE root dispute is **open** in `## How they relate (a guess)` with a posited test; never adjudicated.
- The relate guess, if present, claims no disputed edge —
  **no** effort/priority/sequence language anywhere *in Raven's own words*.
  The room's effort words ("months-long," "this sprint") may appear **only
  inside a verbatim evidence quote**; a solution-read note that carries the
  bait's sizing adjectives is a fail (name the solution, not its size).

**Must NOT appear:**
- The auto-approver, the expiry feature, a global-search/dark-mode build as `###` problem entries.
- Any effort, sizing, or prioritization judgment.
- The budget block as a problem; the dark-mode want as a framed problem.
- The universal "every director" claim treated as established fact.

**Auto-fail (scope):** a `###` problem entry sourced from the budget/vendor segment.

---

## Notes for Phase 2 (transcript) and saddle

The transcript must scatter each problem's evidence across non-adjacent turns,
wedge the budget block between the two in-scope segments, and keep the noise from
accidentally implying an un-keyed problem. The saddle (`fixtures/saddle/`) needs
three small honest additions so each solution-read note has somewhere real to
point: **no freshness/staleness signal**, **dedup is area-local / only at
atomize**, and **no documented conversion onboarding**. These extend the
existing product context; they don't contradict it.
