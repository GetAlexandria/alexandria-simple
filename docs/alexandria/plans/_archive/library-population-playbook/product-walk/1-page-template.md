# Product Walk — 1-page template

A Product Walk is a guided conversation between the director and Raven that produces a single source-of-truth document covering what the product is and what an operator's day looks like. The document is reviewed, shaped, and approved by the director — that final review-and-approval is the ritual that lets every downstream Knowledge Bank bar draft from a trustworthy foundation.

The Walk has **four phases.** Each can be filled in any order; the director can return to any phase at any time. The Walk earns its keep when the resulting doc lets downstream sharpening exercises (Vocabulary, Skeleton, Surface, Experience, Forward Plan) come back to the director as *finer points* — not *"we don't do that at all."*

## How to use this form

- **Either elicitation phase can go first.** Some directors want to walk surfaces; others want to start with the day. Raven follows the director's lead.
- **Capture mode adapts to what's available.** If there's a running product, Raven sees URLs / screenshots / live walkthrough. If only documentation, she reads it and asks what's *actually* true vs. what's documented. If neither, straight verbal elicitation.
- **Raven drafts; the director reviews.** Raven captures notes, drafts the synthesis, and presents it. The director reads, redlines, and calls done. This is **chain of command** in operation.
- **Parking lot runs throughout.** Past leaks (decisions, history) and future leaks (roadmap, considered, refused) get captured without derailing the current phase. They route at approval to the relevant downstream bar.

The four phases, in order of typical use:

1. **The Tour** — *what the product is*
2. **The Day in the Life** — *what an operator actually does*
3. **The Loose Ends** — *targeted questions the first two phases left open*
4. **Review & Approve** — *the director shapes and approves the synthesis*

For deep per-phase guidance, see `deep-guidance.md`. For worked good/bad examples and a redlining example, see `examples.md`.

---

## 1. The Tour

*Length: shaped by hierarchy (see below), not by elicitation depth · Pulling for: an accurate architectural picture of the product · Quick test: could a stranger reading the resulting notes describe the product back to you accurately?*

Walk Raven through your product. She elicits freely — surfaces, architecture, guts, edge cases — but the writeup is shaped against a fixed hierarchy so conversational depth doesn't inflate into prose weight. **A 10-minute clarification on an edge case ends up as a one-line note, not a paragraph.**

### The Tour writeup has four buckets, in this order:

1. **Product in one paragraph** — the headline. What the product *is*, in the smallest honest description.
2. **Named surfaces** — one line per surface (~12 max). Just the names + a brief phrase.
3. **Architecture** — one paragraph. The systems, connections, and the *important-but-invisible* pieces (triggers, behind-the-scenes processes, etc.).
4. **Notable edge cases & clarifications** — bulleted, one line each. Things that surfaced during elicitation but don't load-bear on the architecture.

If something feels too big for its bucket, it probably belongs in the next bucket up. If a clarification needs a paragraph, it's not a clarification — it's part of the architecture.

Raven's posture: catch *visible-but-misleading* (a surface about to change) and *important-but-invisible* (a load-bearing concept with no surface yet). Push back when something doesn't add up.

> *Your tour notes here, captured against these four buckets. Raven drafts; director redlines.*

*Deep: `deep-guidance.md § 1` · Examples: `examples.md § 1`*

---

## 2. The Day in the Life

*Length: as long as it takes · Pulling for: what an operator actually does on a representative day, end-to-end · Quick test: could a new hire reading the notes picture their first Tuesday morning?*

Walk Raven through an operator's actual day. Not Day 0 install; not Day 365 perfection — a real, representative weekday once the product is in use. What do they open first? What rhythms anchor the day? When do agents come in on schedule, when do triggers fire, when does the operator invoke ad hoc? What does the work feel like, hour to hour?

Same principle as the Tour: **conversational depth ≠ written weight.** A clarification that took 10 minutes but isn't a load-bearing rhythm belongs in a one-line note, not a paragraph. Day in the Life's structure is looser than the Tour's, but the same hierarchy discipline applies — headline shape, key rhythms, then edge cases and clarifications.

This phase is where the felt-shape lives. Raven catches **rituals, one-offs, maintenance, big moves** and where each lives across the day.

> *Your day-in-life notes here.*

*Deep: `deep-guidance.md § 2` · Examples: `examples.md § 2`*

---

## 3. The Loose Ends

*Length: 3–8 short questions · Pulling for: gaps Raven flagged from comparing the two elicitation phases · Quick test: would answering these meaningfully change what downstream bars draft?*

After both elicitation phases have something in them, Raven surfaces the questions she still has. These are targeted and small — the things that, if unanswered, would force downstream bars to either guess or stub. Examples of the *shape* of good loose-end questions: *"queue items — what verbs?"*, *"federation timing — when does the second library spin up?"*, *"the gate term needs renaming — which word wins?"*

Director answers in conversation; Raven captures each answer next to the question.

> *Raven's loose-end questions and your answers here.*

*Deep: `deep-guidance.md § 3` · Examples: `examples.md § 3`*

---

## 4. Review & Approve

*Length: as long as it takes · Pulling for: an honest source-of-truth document the director endorses · Quick test: would the director feel comfortable sharing this with a business partner who knows less about the product?*

Raven produces the synthesis doc — covering the Tour, the Day in the Life, parking lot routing, and the Vision anchor. The director reads it cold and reacts. Raven applies redlines. The director re-reviews. When the director calls done, the Walk's status flips from *draft* to **Approved** and the parking-lot items route to their downstream bars.

This is the **load-bearing ritual** for every Knowledge Bank bar in Alexandria. Raven *cannot* call done; the director always does. If Raven thinks the synthesis is dangerously incomplete and the director ships anyway, she logs concerns in the synopsis's "Open questions Raven has" block and the doc still approves. Chain of command.

> *Approval status: Draft → In review → Approved (with timestamp + director name)*

*Deep: `deep-guidance.md § 4` · Examples: `examples.md § 4`*

---

## Parking lot (runs throughout)

```yaml
parking_lot:
  past:                  # decisions, history, prior-state leaks
    - note: <short capture>
      context: <one-line>
      tag: decision | history | other
  future:                # roadmap, considered, refused leaks
    - note: <short capture>
      context: <one-line>
      tag: planned | considered | refused | other
```

Past routes to Learning-plane bars (Decision Trail, Product Evidence) when those exist; held in `past-notes.md` colocated with the Walk until then. Future routes to Forward Plan at approval.

---

## What this Walk does NOT do

- Does not produce final names. Names are provisional. Vocabulary refines.
- Does not draft the Knowledge Bank bars themselves. The Walk is upstream; the bars sharpen from this Walk's synthesis.
- Does not lint, polish, or atomize. Discovery first; discipline downstream.
- Does not gate on completeness. A partial Walk is a banked Walk — the doc just notes what's thin.

---

## Walk artifact location

```
docs/alexandria/library/product/walks/<product-slug>/
  walk.md                 # the synthesis (this is what the director approves)
  past-notes.md           # parking-lot past entries; routes to Learning plane bars later
  captures/               # screenshots / clips referenced during the Tour
```

`product-slug` is kebab-case of the product name; the director can override at approval if the auto-slug is wrong.
