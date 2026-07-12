# Forward Plan — 1-page template

The Forward Plan is *what's coming, what's deferred, and the release sequence.* It collects everything the product points at but hasn't built yet, organized into three tiers — **Now**, **Next**, **Later** — plus a short tail of items explicitly refused. This is the single tiered document, not atomic cards; atomization is downstream.

Load-bearing constraints (don't break these when sharpening):

- The template must accept Raven's bank-time inputs: every Walk stop with `built: false` or `built: partial` (plus its `forward_plan_note`), and every `parking_lot.future` entry.
- The director's own framing wins. Raven's tier-guesses are marked *(inferred)* so the director can re-tier on review without losing the original signal.
- Refused items live in their own tail section — they are NOT a fourth tier, because they're decisions, not sequence.

## How to use this form

- **Fill the three tiers in any order.** Sequence is what they encode; the act of filling them isn't sequenced.
- **One entry per planned item.** If a stop and a parking-lot entry describe the same item, fold them into one entry and list both sources.
- **Carry the director's framing verbatim where you have it.** Use `raven_notes`-style quotes inside the *why this tier* field when the director gave one.
- **Mark inferences.** Any tier placement Raven made without director framing gets *(inferred)* in the entry header.
- **Don't atomize.** Each entry is a paragraph-shaped sketch, not a card. Cards come later, from the Forward Plan bar's own build slice.
- Each tier follows the same schema: *Prompt · Length · Pulling for · Quick test · Entries.*

---

## Intro — release posture

*Length: 2–4 sentences · Pulling for: the shape of the road ahead in the director's voice · Quick test: would the director read this back and say "yes, that's where we are"?*

A short opener naming where the product is right now and what the next stretch of road looks like. Not a roadmap. Not commitments. A posture: *"we're heads-down on X, the bench is the next big region, everything else is parked until those land."*

> *Your answer here.*

---

## Now

*Prompt: what's actively being built or about to start. Items the team is committed to and would name if asked "what are you working on this month?"*
*Length: 1–5 entries · Pulling for: in-flight or imminent work with a known shape · Quick test: would the director be surprised if this slipped past the next 4–6 weeks?*

Pull from stops marked `built: partial` where the `forward_plan_note` reads like active work, and `parking_lot.future` entries tagged `planned` with near-term framing.

### Entries

#### Item name *(inferred)*

- **Source:** *stop `<id>` / parking-lot future entry / both*
- **Why this tier:** *director's framing if given, else Raven's reasoning*
- **Dependencies:** *what must land first, or "none known"*
- **Evidence:** *the `forward_plan_note` or parking-lot `note` and `context` verbatim*

*(Repeat per item.)*

---

## Next

*Prompt: planned but not yet started. The director can name the shape; the team isn't on it yet.*
*Length: 2–8 entries · Pulling for: items with a named shape and a believable place in the sequence · Quick test: could the director sketch what "done" looks like in one paragraph?*

Pull from stops marked `built: false` where the director gave a `forward_plan_note` that reads like committed-but-not-started, and `parking_lot.future` entries tagged `planned` or `considered` with mid-range framing.

### Entries

#### Item name *(inferred)*

- **Source:** *stop `<id>` / parking-lot future entry / both*
- **Why this tier:** *director's framing if given, else Raven's reasoning*
- **Dependencies:** *what must land first, or "none known"*
- **Evidence:** *the `forward_plan_note` or parking-lot `note` and `context` verbatim*

*(Repeat per item.)*

---

## Later

*Prompt: aspirational, exploratory, or sequence-unclear. The product points at it; nobody's promising a date.*
*Length: open · Pulling for: future shape that's real enough to name but not real enough to schedule · Quick test: would the director be comfortable saying "we want this, no timeline"?*

Pull from stops marked `built: false` without a concrete `forward_plan_note`, and `parking_lot.future` entries tagged `considered` or `other` with long-range or open-ended framing.

### Entries

#### Item name *(inferred)*

- **Source:** *stop `<id>` / parking-lot future entry / both*
- **Why this tier:** *director's framing if given, else Raven's reasoning*
- **Dependencies:** *what must land first, or "none known"*
- **Evidence:** *the `forward_plan_note` or parking-lot `note` and `context` verbatim*

*(Repeat per item.)*

---

## Deferred / refused

*Length: 0–5 entries · Pulling for: items the director explicitly chose NOT to build, with the reason · Quick test: is the refusal load-bearing — would building this undermine something?*

Pull from `parking_lot.future` entries tagged `refused`, and from stops where the `forward_plan_note` reads as an explicit "not building." This is not a tier. These items have been decided against; capturing them here keeps the decision visible so the same conversation doesn't get re-litigated.

### Entries

#### Item name

- **Source:** *stop `<id>` / parking-lot future entry / both*
- **Why refused:** *director's reasoning verbatim where available*
- **Evidence:** *the `forward_plan_note` or parking-lot `note` and `context` verbatim*

---

*Deeper per-tier guidance and worked examples will come in a later slice.*
