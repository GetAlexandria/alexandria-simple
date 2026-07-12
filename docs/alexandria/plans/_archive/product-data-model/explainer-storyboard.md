# Explainer Storyboard — "How Alexandria Thinks" (for Jess, build-grade)

*A high-visual, low-word, scaffolded deck built from `alexandria-product-data-model.md`.
**The diagram is one living object that grows piece-by-piece across the whole deck.**
Two parts: **(I) the frame** — three pillars + the loop; **(II) into the guts** — each
pillar walked **noun → relationship → state**, building its diagram, tagging every box
**STORED** vs **DERIVED**.*

> Purpose: Jess is mid-prototype and the data model feels overwhelming. He keeps asking
> *"Is this a view? How does this bar fill? Is this a separate thing to track?"* — those
> are all the **stored-vs-derived** question. This deck makes that legible.

---

## Brand kit (from getalexandria.ai)
Ink-navy bg · parchment text · **luminous-gold** = "the one thing that matters" · cool
holographic cyan secondary. Architectural sans. Motifs: classical **columns**, **ship's
log/compass**, **ancient library** of glowing cards, **ships/maps** (hand-off), faint
circuit overlays, the **raven**. Voice: scholarly, visionary, confident, no hype.
Close on *"shipping at the speed of imagination."*

## The visual language (introduce on slide 5, then use everywhere)
- **Solid gold box = STORED** — a thing you persist and track.
- **Dashed / glowing box = DERIVED (a VIEW)** — computed on read; *don't* store it.
- **Grey outline = MACHINE** — referenced, lives outside (code, a person, software).
- **Edge labels = the verbs + cardinality** (`1`, `*`, `1→*`).

This convention is the answer to all three of Jess's questions, read straight off the diagram.

---

# PART I — THE FRAME

## Slide 1 — Title
- **ON SLIDE:** *How Alexandria Thinks* · *Library · Playbook · Ledger*
- **VISUAL:** three gold **columns** on ink-navy, faint circuitry, a raven perched.
- **SAY:** "One frame for the whole system, then we go into the guts of each piece."

## Slide 2 — The job
- **ON SLIDE:** *Hand a colleague's memory to an agent — in 10 seconds.*
- **VISUAL:** one ship hands a glowing **log** to another at sea (Navy watch hand-off).
- **SAY:** "A captain hands off by handing over the log, not a 50-minute briefing. That's the bar we're building to."

## Slide 3 — Three pillars + the loop *(the whole frame, one slide)*
- **ON SLIDE:** **LIBRARY** *knowledge* · **PLAYBOOK** *action* · **LEDGER** *time*
- **VISUAL:** three columns connected into a loop; a **Trigger** spark on the Ledger→Playbook edge.
  ```mermaid
  graph LR
    LIB[LIBRARY] -->|"a Play REQUIRES cards"| PB[PLAYBOOK]
    PB -->|"runs EMIT events"| LEDGER[LEDGER]
    LEDGER -->|"watched by"| TRG{{TRIGGERS}}
    TRG -->|"FIRE"| PB
    LIB -.->|"cards CITE events"| LEDGER
  ```
- **SAY:** "Knowledge gates action; action records to time; triggers fire action. Hold this picture — we'll now open each pillar."

## Slide 4 — Model vs. machine *(what is / isn't a card)*
- **ON SLIDE:** *The map is not the territory.*
- **VISUAL:** left a glowing **card** (a writeup); right the **machine** it points at (skill=code, person, software); thin gold link between. *cards represent · never contain.*
- **SAY:** "Cards are intent. The skill, the software, the person are the machine. The library points at them — it isn't them."

## Slide 5 — The key: STORED vs. DERIVED *(the legend)*
- **ON SLIDE:** *Store the truth. Compute the views.*
- **VISUAL:** the legend — **solid gold = STORED**, **dashed/glow = DERIVED (view)**, **grey = machine**. Two examples: a *card* (solid) vs a *bar* (glowing).
- **SAY:** "Jess — your three questions are all this one question. A bar, a Knowledge Bank, a lock — those are **derived**, computed on read, *not* stored. The graphs underneath are stored. Watch for solid vs. glowing as we build."

---

# PART II — INTO THE GUTS (noun → relationship → state, per pillar)

> Each pillar = three slides: **nouns** (boxes appear, tagged), **relationships** (edges +
> cardinality appear), **state** (what's stored, what's derived, key verbs, lifecycle).
> The diagram only ever *adds*; never redraws.

## — LIBRARY (start here; it's where the bars live) —

## Slide 6 — Library · NOUNS
- **ON SLIDE:** *What exists.*
- **VISUAL:** boxes fade in, tagged: **Director**(solid) · **Source material**(grey/ref) · **Source Conversion**(solid) · **SOT**(solid, "frozen") · **Atomic Card**(solid) · **Area**(solid) · **Plane**(solid) · **Library zone**(solid) · **Artifact**(grey/ref) · **Knowledge Bank**(**glow=derived**).
- **SAY:** "Most are stored. Note one already glows — Knowledge Bank is a *view*, not a store. Hold that."

## Slide 7 — Library · RELATIONSHIPS *(the conversion pipeline)*
- **ON SLIDE:** *How they connect.*
- **VISUAL:** edges draw in, left→right pipeline:
  ```mermaid
  erDiagram
    PLANE ||--o{ AREA : groups
    AREA ||--o{ SOURCE_CONVERSION : "filled by"
    DIRECTOR ||--o{ SOURCE_CONVERSION : runs
    SOURCE_CONVERSION ||--|| SOURCE_OF_TRUTH : produces
    SOURCE_OF_TRUTH }o--o{ ATOMIC_CARD : "atomizes / revises"
    ATOMIC_CARD }o--|| AREA : "classified under"
    ATOMIC_CARD }o--|| LIBRARY : "home zone"
    ATOMIC_CARD }o--o{ ATOMIC_CARD : "links-to / supersedes"
  ```
- **SAY:** "Source material → a Conversion → one frozen SOT → atomized into Cards. Cards link into a graph. *To an agent, that graph is the diagram.*"

## Slide 8 — Library · STATE — *"How does the bar fill?"*
- **ON SLIDE:** *The bar is computed, not stored.*
- **VISUAL:** an **Area** with a filling bar; below it the **Source Conversion** stages light up in sequence — *source intake → drafted → approved → banked* — and the bar fills as cards get **built**. The bar drawn as a **glowing (derived)** element reading from stored stages + card coverage. Knowledge Bank shown glowing = "your slice of the cards."
- **SAY:** "Here's your bar question, Jess. The bar is **derived** — it reads the conversion's stage and how many expected cards are *built*. You don't store a bar; you store the conversion stage and the cards, and the bar falls out. Same for the Knowledge Bank — it's the agent's *view* of the cards its plays need."
- **ANSWERS:** *Is this a view? → KB & bar: yes.* · *How does the bar fill? → derived from stage + card coverage.* · *Track separately? → store SOT (frozen) + Cards; not the bar.*

## — PLAYBOOK —

## Slide 9 — Playbook · NOUNS
- **ON SLIDE:** *What exists.*
- **VISUAL:** **Play**(solid) · **Move**(solid, "the leaf") · **Job Title**(solid) · **Agent**(solid) · **Play Run**(solid, "live state") · **Participant**(grey/machine) · **Playbook page**(**glow=derived**).
- **SAY:** "A Play is built of Moves (leaves) and/or other Plays. Play Run is the *live state* of one execution — stored, so you can freeze/resume. Playbook page glows: a view."

## Slide 10 — Playbook · RELATIONSHIPS
- **ON SLIDE:** *How they connect.*
- **VISUAL:**
  ```mermaid
  erDiagram
    JOB_TITLE ||--o{ PLAY : "responsible for"
    AGENT }o--|| JOB_TITLE : holds
    PLAY }o--o{ PLAY : "composed-of / variant-of"
    PLAY ||--o{ MOVE : "composed-of (leaves)"
    MOVE }o--o| PARTICIPANT : "binds a doer"
    PLAY }o--o{ ATOMIC_CARD : "requires (the super-seam)"
    PLAY ||--o| PLAY_RUN : "instantiated as"
  ```
- **SAY:** "The gold edge — **Play requires Cards** — is the super-seam back to the Library. A Move binds one doer (software / agent+skill / human). A running play *is* a Play Run."

## Slide 11 — Playbook · STATE — *"Is this unlocked? a separate thing?"*
- **ON SLIDE:** *Unlocked is computed. Run-state is stored.*
- **VISUAL:** a Play with a glowing **`unlocked`** badge (derived: *required cards exist + child plays unlocked*); beside it a solid **Play Run** card with `{running, frozen, …}`.
- **SAY:** "`unlocked` is **derived** — don't store it; compute it from whether the required cards exist. But the **Play Run** — progress, freeze points — *is* stored, because you resume it. So: store the Play, the Moves, the Run; derive `unlocked` and the Playbook page."
- **ANSWERS:** *Track separately? → Play/Move/Play Run = stored; unlock + page = derived.*

## — LEDGER —

## Slide 12 — Ledger · NOUNS
- **ON SLIDE:** *What exists.*
- **VISUAL:** **Ledger**(solid) · **Ledger Event**(solid, "immutable, typed") · **Trigger**(solid, "registry") · **Briefing**(**glow=derived**).
- **SAY:** "Your immutable event log, Jess — flat, append-only. One typed Event. A Trigger is a stored rule in a registry. Briefing glows — it's a view."

## Slide 13 — Ledger · RELATIONSHIPS
- **ON SLIDE:** *How they connect.*
- **VISUAL:**
  ```mermaid
  erDiagram
    LEDGER ||--o{ LEDGER_EVENT : records
    LEDGER_EVENT }o--o| LEDGER_EVENT : "annotates (below-line note)"
    ATOMIC_CARD }o--o{ LEDGER_EVENT : cites
    PLAY }o--o{ LEDGER_EVENT : "run emits"
    TRIGGER }o--o{ PLAY : fires
    TRIGGER }o--o| LEDGER : "may watch"
  ```
- **SAY:** "Cards cite events; runs emit events; an assessment is just an event that *annotates* a fact-event — that's the Navy 'below-line note,' and the log stays flat. Triggers watch the log and fire plays."

## Slide 14 — Ledger · STATE — *"What do I actually persist?"*
- **ON SLIDE:** *Append-only forever. The Briefing is computed.*
- **VISUAL:** a stack of immutable event lines (stored, never edited); a glowing **Briefing** porthole pulling a *compacted slice* (callback to slide 2's hand-off).
- **SAY:** "Store: events (append-only), triggers (registry). Derive: the Briefing — a compacted slice of the log handed to an agent. That's the 10-second memory download from slide 2."

## — REASSEMBLE —

## Slide 15 — The whole picture, stored vs. derived
- **ON SLIDE:** *Store the spine. Compute the lenses.*
- **VISUAL:** the full three-pillar loop, now fully built — **solid** boxes (the graphs, events, runs, triggers) vs **glowing** (Knowledge Bank, Playbook page, Briefing, bars, locks, `unlocked`). One glance = "persist these, compute those."
- **SAY:** "Everything solid you persist. Everything glowing you compute on read. That's the whole stored-vs-derived map of the system."

## Slide 16 — The seam: yours vs. the model's *(triggers)*
- **ON SLIDE:** *You build the engine. The model gives the invariants.*
- **VISUAL:** **MODEL** (registry exists · authority-gated · loop-safe · one auditable place) | **MECHANICS — yours** (debounce · one-shot vs recurring · conflict/priority).
- **SAY:** "On triggers specifically: the model hands you the registry, the authority gating, and the loop-safety invariants. The firing mechanics are yours."

## Slide 17 — Close
- **ON SLIDE:** *Three pillars. One loop. Store the truth, compute the views.*
- **VISUAL:** full loop fully lit, raven overhead, luminous ship sailing out. *shipping at the speed of imagination.*
- **SAY:** "Same map, same words. Solid = persist, glow = compute. From here we're pointing at the same thing."

---

## Build notes
- **The diagram never redraws — it accretes.** Reuse one canvas; each slide *adds*
  boxes/edges or *lights up* the part under discussion. The evolution *is* the teaching.
- **Stored vs. derived is the spine.** The solid/glow convention (slide 5) is what
  directly answers Jess's "is this a view / how does the bar fill / do I track this."
  Every pillar's third slide ("STATE") is where that lands.
- **Per-pillar rhythm is identical** (nouns → relationships → state), so once Jess learns
  the rhythm on the Library, Playbook and Ledger go fast.
- **Jess's three literal questions are answered on:** slide 5 (the legend), slide 8 (the
  bar), slide 11 (unlocked / track-separately), slide 14 (what to persist).
- **Shorter cut (9 slides):** 1, 3, 5, 6–8 (Library full), 15, 16, 17 — teach the rhythm
  once on the Library, show the reassembled stored/derived map, done.
