# Does scan-02 read like the architect's data model?

Honest assessment, pillar by pillar. The data model is the answer key; scan-02
is a code-derived attempt at the same shape, with one pipeline pass applied.

## Overall: yes, partially — the *backbone* is right, the *texture* is wrong.

The pipeline lifted the scan from a five-type-bin classification into the
architect's three-pillar-plus-execution-layer-plus-triggers shape. A reader
walking `library/`, `playbook/`, `ledger/`, `triggers/`, `runtime/`, `studio/`,
`viewer/` will recognize the architect's mental model immediately. That is the
big win.

What's still missing is **the human-scale nouns the code can't see**: Director,
Plane, Job Title, Briefing, Human-Role, Skill/Software, Grant, Membership.
These are the nouns that make the data model feel like an *org chart of a
company* rather than a parts list of a viewer. Adding them requires
human-authored cards, not another scan pass.

## Pillar-by-pillar scores

### Library — score: 7/10

**Where it matches.** Atomic Card, Source Item, Source Conversion, Source of
Truth, Area, Knowledge Bank (as Read Model), Library (as Read Model) — all
present, all correctly typed. The Source Conversion pipeline reads exactly as
the architect's "In Action — Filling the Product Roadmap" walks it. The
Vision-onboarding flow as a *Source Conversion for the Vision Area* is now
explicit.

**Where it diverges.** The data model names **Director** and **Plane** in the
Library pillar; both are gaps in the scan. The Plane (Strategy/Product/Learning)
shows up as a tagged grouping inside the Knowledge Bank Read Model body but has
no card of its own. **Membership** (Director ↔ zone) and **Library (zone)** vs
**Library (the whole graph)** distinction is also missing. **Artifact**
(referenced human-friendly supporting material) — gap. The five subjects
(vision/vocabulary/bets/guardrails/user-research) appear in the code as
Knowledge Bank Areas but aren't individually carded — that may be fine, since
the data model treats them as instances of Area, not types.

### Playbook — score: 7/10

**Where it matches.** Play and Play Run are split correctly into definition vs.
live state. Move as Component (the leaf). Agent as a separate type (Raven,
Damien). Playbook surface present. The Capability cards for "Run a Play" and
"Human-in-the-Loop Feedback" name the verbs without trying to be Aggregates.

**Where it diverges.** **Job Title** is the biggest gap — the data model is
explicit that Job Title carries authority level + responsibilities, and an
Agent *holds* one. Without it, Raven and Damien look like bare characters.
**Grant / Authorization** is also missing (the two-layer authority model is
absent). **Human-Role** and **Skill / Software** (the two doer-kinds of a Move)
are gaps. **Playbook page** (the agent-scoped Read Model) is not yet a card,
though Knowledge Bank's twin would be a natural addition.

### Ledger — score: 6/10

**Where it matches.** Ledger as Aggregate. Ledger surface as a Surface (locked
in nav). Confirms the data model's "append-only, source of truth for
time/provenance + the primary trigger source."

**Where it diverges.** **Ledger Event** is not a card of its own — the
architect treats it as a first-class noun with a widening type vocabulary
(run / revision / failure / observation / assessment / note / instruction /
decision / finding). **Briefing** (the agent-/situation-scoped derived view —
"the context-handoff superpower") is completely missing, which is the biggest
single gap in this pillar. The Ledger pillar is the most under-served.

### Studio — score: 8/10 (within the experiment's scope)

**Where it matches.** Treated as its own bounded context (not in the data
model) — correct. Studio Board polysemy split into Surface + Read Model.
Production Stage retyped Surface → Value. Play Tracker is a Surface tab inside
the Studio. The "Studio = recent invention, own context" framing matches the
architect's prior comments.

**Where it diverges.** No card for **Director** (the protagonist of the
Studio's Director-gated process). The "Director ruling" referenced in code
isn't carded. The Studio Board Read Model still admits it's persisted to
`board-state.json` — the architect's "derived, never stored" rule is asserted
in the body but not enforced; that's a real tension the implementation has not
caught up to.

### Runtime / Execution Layer — score: 8/10

**Where it matches.** Treated as referenced-but-in-no-pillar — exactly the
data model's framing. Fabro, Runtime Event Store, Codex Host Integration as
Systems. Raven Connection demoted to Implementation. Capability cards for
init/inspect kept here, where they belong (not under any pillar's verbs).

**Where it diverges.** The data model says Skills/Software, Humans, Kits, and
"live Plays" are all part of the machine, "referenced, in no pillar" — but the
scan only saw Fabro/EventStore/CodexHost. **Skill** as a *referenced*
executable capability is a gap. The runtime is the right context to host
**Participant** if it ever cards.

### Triggers — score: 6/10

**Where it matches.** Triggers correctly extracted from "Systems" and given its
own activation-layer bounded context, with Trigger retyped to Aggregate. Notes
the watch-targets (Ledger / live run-state / schedule / external).

**Where it diverges.** The architect's two governance ideas — **authority-gated
firing**, **standing grant** (a fired play runs on a pre-issued Director
grant) — are not carded. The deferred mechanics (debounce, one-shot vs
recurring) are correctly absent.

## Big-picture gaps (across all pillars)

These are the nouns the data model has and scan-02 doesn't:

- **Director** (Library + Studio + Triggers + everywhere)
- **Plane** (Library)
- **Job Title** (Playbook)
- **Grant / Authorization** (Playbook + Triggers — authority model)
- **Membership** (Library — Director ↔ zone)
- **Briefing** (Ledger — the "download the admiral's memory" Read Model)
- **Ledger Event** (Ledger — first-class with typed widening)
- **Skill / Software** + **Human-Role** + **Participant** (Execution Layer)
- **Artifact** (Library — referenced human-friendly supporting material)

The code couldn't see any of these because they're either *human concepts the
machine doesn't materialize* (Director, Membership, Grant, Job Title) or
*nouns the architect added that the implementation hasn't caught up to yet*
(Plane as a closed grouping, Briefing as a first-class derived view, Artifact).

## Over-promotions the scan made

Looking back, scan-01's "Agent Bench" as a System was an over-promotion — it's
chrome, not infrastructure. Fixed in scan-02. "Raven Connection" as an Entity
was the same shape — fixed in scan-02. "Library Card" vs "Atomic Card" as two
nouns was a schema artifact — merged in scan-02. These are all healthy moves.

## Conclusion

The pipeline did its job: from a code-derived type-binned dump, **the
backbone of the architect's three-pillar model is now legible at the folder
level**. A Director can open `library/` and see the model layer; `playbook/`
and see the action layer; `ledger/` and see the record. The polysemy split on
Studio Board, the demotion of Raven Connection, the re-typing of Play Run /
Library / Knowledge Bank — these are all *exactly* the dissolutions the
architect couldn't resolve from inside the type-bin view.

What the pipeline can't do is **invent the human-scale nouns the code never
materialized**. For that, a human-authored next pass against the data model is
required.

## Overall scores

- Library: 7
- Playbook: 7
- Ledger: 6
- Studio: 8 (within its bounded scope)
- Runtime / Execution: 8
- Triggers: 6

Mean: ~7/10. The pipeline buys the backbone; humans owe the texture.
