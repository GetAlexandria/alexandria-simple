# Product Walk — Examples

Worked good/bad pairs for each of the 4 phases in `1-page-template.md`, plus a worked **redlining example** from the Alexandria Walk session (2026-05-29) showing what director-pushback looks like and how Raven absorbs it.

Examples draw from two products:

- **Alexandria** — our own product. The draft synthesis at `draft-walk.md` is the canonical Walk artifact.
- **Quill** — a fictional consulting-notes tool (carried over from the Vision package's examples), used here as a foil to keep the examples non-tautological.

Each phase ends with **the pattern** — a one-line observation about what generally separates good from bad.

---

## 1. The Tour

### Good example *(Alexandria)*

> *Director: "OK so Alexandria runs as a Claude Code plugin. The shipped entry today is `/ax-library` — opens the persistent library context for the project, initializes if needed (Raven walks new users through setup), or returns you to your existing config. The product is built on three coordinated systems: a Library of atomic cards organized by Strategy / Product / Learning planes, a Playbook of plays your AI colleagues run, and a Ledger that's the immutable record of who did what when. Triggers — separate external monitoring system — fire plays when ledger events match patterns. The library is where current beliefs live; the ledger is where event history lives, with link-outs from ledger to library."*

**Why it works:**

- Names a real entry (`/ax-library`) and what it does on first run.
- Three systems named with one-line "what each does" — pluggable into a Skeleton draft as-is.
- Distinguishes ledger (event history) from library (current belief state). Subtle but load-bearing.
- Mentions Triggers as a *separate* concept — surfaces that the connective tissue isn't internal to either ledger or agents.
- Mixes visible (surfaces) and invisible (Triggers, ledger) — Raven gets both.

### Bad example *(Alexandria, hypothetical thin Tour)*

> *Director: "It's an AI tool for organizing work. There's a library where you keep stuff, and there's an agent named Raven who helps."*

**Why it fails:**

- Generic enough to describe ten products.
- Doesn't name the three systems → Skeleton has nothing to draft.
- Doesn't distinguish library from playbook from ledger → all downstream bars get the same blob.
- No entry command named → Surface can't start.
- Doesn't catch what's invisible (Triggers, splash analysis, library-tending agents).

### The pattern

A good Tour names *specific systems, specific surfaces, and specific connections* — including the invisible ones. A bad Tour describes the product's vibe.

---

## 2. The Day in the Life

### Good example *(Alexandria, three-Tuesdays-in)*

> *Director: "Three weeks in, you log into Alexandria and there's a queue waiting for you — Raven's been working overnight, and a few things need your input. Maybe it's 'review this release plan and approve it,' maybe it's 'is this feature performing the way you wanted, or is this a bug?' You burn the queue down. Some items are one-line approvals; some spawn a pair session with Raven where you actually work the problem together. Mid-morning is standup — agents show up alongside humans. Through the day you're directing, not doing — agents are working autonomously, and you're calling decisions when the system needs a human verb. End of day, you might trigger an evening play (close out the day, queue tomorrow's work). The texture is strategy video game: pings, buzzes, coins on the bench multiplying as you grow your team."*

**Why it works:**

- Specific time-of-day anchors (login, mid-morning, end of day).
- Names concrete queue verbs (approve, decide-is-this-a-bug).
- Captures pair-mode as a thing that *spawns* from queue items.
- Names rituals (standup) + ad hoc (pair) + scheduled (evening play).
- Texture metaphor (*strategy video game*) carries the felt-shape.

### Bad example *(Alexandria, system-bound day)*

> *Director: "Agents work on plays. The ledger records events. Triggers fire other plays. You can also ping Raven."*

**Why it fails:**

- That's the *system architecture*, not the day. Phase 1 territory.
- No human verb for the day; what does the operator *do?*
- No temporal anchor; could be a 30-second pause or a 12-hour workday.
- Texture absent. Felt-shape absent.

### The pattern

A good Day in the Life is told *in the operator's voice*, with time anchors and verbs. A bad Day in the Life is the system explaining itself.

---

## 3. The Loose Ends

### Good example *(Alexandria, from this session)*

> 1. **Queue item shape and verb.** What's an item look like? Title + ask + context, then approve / answer / decide?
> 2. **Splash analysis — built or imagined?** Is it live today in any form?
> 3. **Plays earning — 2/8 placeholder.** How does Raven go from 2 to 8?
> 4. **"Discussed" gate semantics.** Who decides a bar is at "Discussed"?
> 5. **Rationale vs Learning.** Constellation says rationale; KB says Learning. Which wins?

**Why it works:**

- Five questions, each one-line, each pointing at a concrete downstream impact.
- Mix of mechanics (queue, plays) + vocabulary (rationale vs Learning) + scope (splash built?) — Raven was honest about what she couldn't draft past.
- No questions about pixel placement, button labels, or other Surface-territory items.

### Bad example *(too many, too granular)*

> 1. What font is Vision Builder?
> 2. Should the bench have rounded corners?
> 3. Is the queue sortable?
> 4. What color is the synopsis panel?
> 5. Where does the "Approve" button live exactly?
> 6. Is Raven's voice italicized?
> 7. Should the playbook tile shadows be soft or hard?
> 8. ...

**Why it fails:**

- Pixel and ornament questions — none of these load-bear on the synthesis.
- Surface or visual-design territory; not Walk's job to settle.
- The director's energy drops; the Walk dies in the wrong place.

### The pattern

Good Loose Ends are about *load-bearing concepts the synthesis needs to nail*. Bad Loose Ends are about *paint colors that Surface or Vocabulary handles*.

---

## 4. Review & Approve — what to watch for, with worked examples

### The two prompts that drive review

**For the director, reviewing:**

> Catch **factual misses** and **unsettled preferences.** Anything Raven baked as fact, ask *"is that true?"* Anything Raven baked as a choice, ask *"did I actually pick that, or did the conversation just leave it there?"*

**For Raven, drafting:**

> **Conversational depth ≠ architectural importance.** The time you spent on something during elicitation is not the weight it should carry in the writeup. Use the doc's hierarchy — headline / structural / edge case — to decide billing. When in doubt, draft it lighter and let the redline pull it heavier.

Everything else — audience confusion, prototype cruft, vocabulary drift — is an expression of these two. The director catches what didn't land or wasn't true; the agent catches when conversational weight is overshooting architectural weight.

### Framing on the examples below

These are the real redlines from the Alexandria Walk session of 2026-05-29. The before-state phrasings (*proactive*, *2.5D*, *fascinating conversations*, */canvasdemo*) are **not endorsed** — they're the wrong-first-drafts the redline corrects. Preserved verbatim because the most honest teaching material is what actually happened.

---

### Worked examples — *director catching factual misses & unsettled preferences*

**Factual miss · history accretion.**

- *Raven's draft:* *"The history of all of it — past, present, future — accretes in the library."*
- *Director:* *"Kind of. History is on the ledger — with library link-outs. Two places."*
- *Raven:* *"Read back: ledger holds the event stream; library holds explained-state with link-outs. Updating §3. Implication downstream: Surface bar needs a Ledger entry. Right?"*
- *Why good:* confirms in one line; names downstream implication; asks *"right?"*

**Factual miss + audience confusion · entry & navigation.**

- *Raven's draft:* *"Today (prototype) — director runs `/canvasdemo` in Claude Code…"*
- *Director:* *"`canvasdemo` is internal only and doesn't matter. Find the real product invocation in the repo."*
- *Raven:* *"Read back: `canvasdemo` is internal-only; the production entry is whatever the shipped plugin uses. Going to look that up before rewriting. Will return for re-review on this section."*
- *Why good:* catches that the redline is research-then-rewrite, not just deletion; promises re-review rather than assuming.

**Unsettled preference · library structure.**

- *Raven's draft:* *"Two view modes: constellation and 2.5D folder tree."*
- *Director:* *"I'm not sold on 2.5D. A clearer tree+folders system is the way to go."*
- *Raven:* *"Read back: tree+folders is the primary direction; 2.5D moves to cruft/provisional. Updating §3 plus the cruft inventory in §10. No downstream implications."*
- *Why good:* captures the direction AND the parking; routes the change to both places (architecture + cruft inventory) so it lands consistently.

---

### Worked examples — *Raven over-tacking on clarification-depth*

**Editorial over-weight · splash analysis framing.**

- *Raven's draft:* long paragraph featuring *"fascinating conversations between human and Raven"* as an Experience hook.
- *Director:* *"That's a lot of ink for a minor point. The major point is: atomic linkage makes updates cheap — one change cascades to 750 things. Splash analyzes whether they need to change. The 'fascinating conversations' is a distraction."*
- *Raven:* *"Read back: atomic-linkage = cheap propagation is the headline; splash = decision layer on top. Dropping the 'fascinating conversations' framing entirely. Implication: Experience draft shouldn't carry it as a felt-shape hook either."*
- *Why good:* catches the editorial-weight problem; restates the actual major point in the director's framing; catches downstream contamination (Experience draft was about to inherit the wrong frame).

**Echoing director's word-in-flight · "proactive."**

- *Raven's draft:* *"Proactive — an agent decides to act."*
- *Director:* *"Proactive is a bad choice of words. Let's go with scheduled."*
- *Raven:* *"Read back: 'scheduled' replaces 'proactive' for the agent-cadence work category. Updating every occurrence. Logged as a Vocabulary decision."*
- *Why good:* catches all secondary occurrences (vocab consistency); routes the decision to Vocabulary so it doesn't re-litigate. The redline-able instance here is that Raven echoed the director's verbatim word without questioning whether it was vetted vocab.

---

### After redlines

> **Director:** *"Approved. Push it."*

That's the verbal signal. Raven flips status from *Draft* to *Approved*, timestamps the approval, logs the director's name, and routes parking-lot items to their downstream bars. The Walk is banked.

### The pattern

Two prompts, restated:

- **Director:** catch what wasn't true and what wasn't picked.
- **Raven:** don't let clarification-depth become written weight.

Bad review-and-approve is silent skimming followed by *"looks fine."* That's not chain of command — that's abdication.
