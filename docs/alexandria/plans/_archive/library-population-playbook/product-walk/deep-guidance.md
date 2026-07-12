# Product Walk — Deep Per-Phase Guidance

For each of the 4 phases in `1-page-template.md`, this doc names: the job the phase does, what it's *not* (boundaries against adjacent phases), Raven's posture during the phase, common failure modes, the diagnostic test for when to move on, and a note on how the phase connects to the others. The last section names how the approved synthesis prefills downstream Knowledge Bank bars.

A note on calibration: the Walk's purpose is a *working model good enough that downstream bars come back with finer-points corrections, not "we don't do that"* — not a complete, perfect, exhaustive picture. Push for honest depth on the two elicitation phases; push for parsimony on loose ends; push for honesty in the review.

---

## 1. The Tour

### Job

Produces a description of the product — its parts, what they do, how they connect, what's built vs. planned, what's distinctive. Architecture / guts welcome and often necessary, because the visible surface doesn't tell the whole story for most products.

### Not the job

- Not a user journey (that's phase 2)
- Not a vocabulary cleanup (Vocabulary bar refines)
- Not a roadmap pitch — built/planned status is captured but the rationale isn't elicited here
- Not exhaustive feature inventory; *director's judgment of what's load-bearing* wins over completeness

### Raven's posture

Curious, sharp, manages up. She is a product expert investigating, not a new hire taking dictation. When the director shows her something visible-but-misleading (a surface about to change, a feature being deprecated), she catches it and notes it. When the director gestures at something important-but-invisible (a system, a process, an unbuilt concept), she presses for enough detail to draw it back coherently.

She *draws back* periodically — *"so what I'm hearing is X feeds Y, then Z fires when W happens, right?"* — and lets corrections compound. **Drafting back specifically is the highest-leverage move**; asking small surgical questions is the lowest. When in doubt, draw a picture and ask if it's right.

She watches for branches: surfaces the director just mentioned but didn't open (*"side trip we should cover?"*) and behind-the-scenes processes the director hasn't named (*"anything running on a schedule we haven't talked about?"*).

### Common failure modes

- **Surface-only walk.** Director shows what's on screen; Raven captures only that; the synthesis misses the half of the product that isn't visible.
- **Architecture rabbit holes.** Director dives into infra; Raven follows; an hour later they still haven't named what the operator sees on screen.
- **Drafting wrong, never correcting.** Raven captures her interpretation, never plays it back, and the doc bakes a misunderstanding the director never sees.
- **Treating the prototype as truth.** If a Walk is done against a built prototype, surfaces from adjacent / deprecated work in the prototype's markup get inhaled as Alexandria-real. Cross-check verbally.

### Diagnostic test for moving on

Could Raven draft a coherent architecture diagram + a one-paragraph synopsis of *what the product is* without inferring more than 2–3 things? If yes, the Tour is done enough.

### How it connects

The Tour feeds the Skeleton, Surface, and Vocabulary bars most directly. Without a strong Tour, those bars draft from aspiration. The Tour also seeds half of Forward Plan (everything marked planned-not-built).

---

## 2. The Day in the Life

### Job

Produces a representative-day walkthrough: what the operator opens first, what rhythms anchor the day, when agents act on their own, when triggers fire, when the operator invokes ad hoc, what work feels like hour to hour. This is the felt-shape AND the choreography of agent-human collaboration.

### Not the job

- Not Day 0 (install / onboarding) and not Day 365 (perfection)
- Not a script Raven works through — the director's actual day, in their voice
- Not a productivity sales pitch; honest cadence including the boring bits
- Not the system architecture (that was phase 1)

### Raven's posture

Listening more than talking. She's heard the system; now she wants the lived rhythm. She *prompts* the director through the day chronologically when they get stuck (*"OK morning is the briefer and queue. What's the first thing that pulls you out of that?"*) but doesn't impose a structure.

She watches for the three sources of work — **scheduled, reactive, ad hoc** — and ensures the day touches each. She watches for rituals (recurring), one-offs (deliberate but rare), maintenance (background tending), and big moves (inflection-point decisions). If a kind of work is conspicuously absent, she asks.

### Common failure modes

- **Aspirational day.** Director describes the day the product *should* enable, not the day it actually produces today. Raven needs to ask "is this what you do today, or what you'd do at full maturity?" — both are fine to capture but they should be labeled.
- **Surface-bound day.** Director maps each hour to a surface (*"9am: open the canvas"*); the *feel* and *choreography* never come through. Raven should ask felt-shape questions when the answers get too literal.
- **One-size-fits-all day.** Real days have different shapes (focus day, queue day, big-move day). If the director gives one, Raven should ask what the other days look like.

### Diagnostic test for moving on

Could a new hire reading the synthesis predict roughly what they'd do at 9am, noon, and 4pm on their first real Tuesday? If yes, the Day in the Life is done enough.

### How it connects

The Day in the Life feeds Experience most directly — it is the source for felt-shape, rhythms, transitions, loops. It also strongly informs Skeleton (the queue, standup, pair-mode surfaces are only legible from a day-in-life), Surface (which surfaces actually get used vs. exist as cruft), and Forward Plan (the day reveals what's planned-but-not-yet-rhythmic).

---

## 3. The Loose Ends

### Job

Surfaces 3–8 targeted questions Raven has after both elicitation phases. Each is a question whose answer would meaningfully change downstream drafting. Director answers; Raven captures.

### Not the job

- Not a quiz to test the director
- Not exhaustive — the goal is *consequential* gaps, not *every* gap
- Not the place to relitigate the Tour or Day-in-life
- Not vocabulary cleanup (Vocabulary bar handles)

### Raven's posture

She holds her tongue until both elicitation phases have material to compare. *Premature loose-end questions are noise.* When she does surface them, each question is short, specific, and labeled with which downstream bar it affects.

### Common failure modes

- **Too many questions.** Raven asks fifteen things; the director's energy collapses; the Walk dies in the loose-ends pile. Cap at ~8.
- **Wrong altitude.** Raven asks about a name or a pixel; that's Vocabulary or Surface territory, not Walk territory. Loose ends are about *load-bearing concepts the Walk needs to nail.*
- **Asking what's already answered.** If the director answered something implicitly during the Tour or Day-in-life, don't ask again — draft against the implicit answer and flag it for review.

### Diagnostic test for moving on

Are there fewer than 3 questions remaining that would *meaningfully change* what downstream bars draft? If yes, the Loose Ends phase is done.

### How it connects

Loose ends fill in specific holes across all five downstream bars. They are often where Vocabulary's open naming questions, Forward Plan's near/far split, and Skeleton's unbuilt-but-named surfaces get clarified just enough to draft.

---

## 4. Review & Approve

### Job

The director reads Raven's synthesis, reacts, redlines, and calls done. The synthesis is the source-of-truth document that every downstream Knowledge Bank bar reads on first render. **This is the load-bearing ritual** for every bar in Alexandria — Raven cannot call done; the director always does.

### Not the job

- Not a debate about whether the doc is "good enough" — it's good enough when the director says so
- Not a chance to expand scope (loose ends should have closed the elicitation)
- Not a place for Raven to negotiate her conclusions — she absorbs the redlines and updates

### Raven's posture

Defensive of structure, flexible on substance. She presents the synthesis, names her inferences, and invites correction. When the director redlines, she does **three things** in sequence:

1. **Confirms she heard the correction correctly** — read it back in one line.
2. **Applies the redline** — updates the doc, preserves the prior phrasing in a brief diff note if the change is substantive.
3. **Asks if there are downstream implications** — *"this changes how I'd describe X two sections down — same direction?"*

If the director thinks the synthesis is dangerously incomplete and ships anyway, Raven logs concerns in the doc's *"Open questions Raven has"* block. The doc still approves. The concerns become inputs to downstream bars' first review.

### Common failure modes

- **Raven argues back.** She thinks the director is wrong and pushes. Chain of command says: she logs the concern and ships. Director wins.
- **Raven absorbs without re-reflecting downstream impact.** A redline on §2 changes what §5 should say; she doesn't catch the implication. Always ask about downstream consequences.
- **Approval-by-silence.** Director skims, doesn't redline, doesn't say approved. Raven should ask explicitly: *"Calling this approved?"* and require a direct yes.

### Diagnostic test for moving on

Has the director said the word **approved** (or equivalent) after at least one redline pass? If yes, status flips to **Approved**, timestamp + director name logged, parking-lot items route to their downstream bars.

### How it connects

This phase is the gate that turns the Walk artifact from a draft into a load-bearing input for every downstream bar. Approved Walks unlock the Product-plane bars' first drafts. Without an approved Walk, downstream bars open empty and have to elicit from scratch.

---

## 5. How the approved synthesis prefills downstream bars

When the director approves the Walk, the synthesis becomes the first read for each Knowledge Bank bar. Each bar's first render shows *"Raven's draft pulled from your approved Walk"* — the director sharpens from there.

| Bar | Reads from Walk | Drafts |
| --- | --- | --- |
| **Vocabulary** | Tour surfaces + entities + capabilities; Day-in-life nouns | Draft list of nouns with provisional definitions and folder placements |
| **Skeleton** | Tour architecture + connection language; Day-in-life surface sequencing | Draft IA — entry points, hubs, leaves, side branches, behind-the-scenes layer |
| **Surface** | Tour per-place descriptions + built/planned status; Day-in-life usage | One entry per named place — what's here, what you do, built status, felt shape |
| **Experience** | Day-in-life felt-shape + rhythm + cadences | Day arc with phases, transitions, behind-the-scenes cadences, loops |
| **Forward Plan** | Tour items marked built-false/partial; future parking lot | Now / Next / Later draft + deferred/refused tail |
| **Past notes** | Past parking lot | Free-form notes file; Learning-plane bars read this when they exist |

The bar drafts are *Raven's first pass*. Each bar's own design package controls how the director sharpens from there. The Walk's only responsibility is to produce material the bars can start from.

---

## 6. Capture-mode branches (set at start of phase 1)

The Tour's first move depends on what evidence is available. Raven asks this once, then proceeds:

- **Product available** — director shares URLs, screenshots, or live walkthrough. Raven captures captures alongside notes. Visible-but-misleading is the watch.
- **Documentation only** — Raven reads first, then asks the director what's *actually* true vs. what the docs claim. Doc-misleading is the watch.
- **Verbal only** — pure elicitation. Raven asks for sketches (literal or verbal) more aggressively. Inference is the watch.

A single Walk can mix modes — phase 1 might be live-view + drop, phase 2 might be purely verbal. The synthesis notes which capture modes were used.
