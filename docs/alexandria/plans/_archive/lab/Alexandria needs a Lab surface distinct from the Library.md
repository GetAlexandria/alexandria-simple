---
status: speculative
captured: 2026-04-23
epistemic: far-out
surface: lab
---

# Alexandria needs a Lab surface distinct from the Library

> This note is itself a Lab note. It describes the surface it lives on. It is speculative, unsettled, and not ready to plan.

## The claim

Alexandria currently has one durable surface for product knowledge: the **Library**. Library cards are *settled claims* — graded by Conan, structured, wikilinked, consumed by builder agents. The currency is **confidence**.

There is a second kind of thinking that happens around Alexandria but has no home: *unsettled investigations, hypotheses, research threads, "we might want X"* — captured in scratchpads, `/updates/`, feedback queue fragments, auto-memory. This activity is real but scattered.

Alexandria likely wants a **Lab** surface where this thinking lives. The currency is **generativity**, not confidence. Lab notes succeed by linking to other notes and making patterns visible, not by being well-sourced and consistent with the graph.

## Why not just use the Library for this

Library cards claim settledness. Putting speculative thoughts in the Library either:
- forces premature settling (the idea has to pretend to be a claim before it's ready), or
- pollutes the Library with low-grade material that drags on grading and retrieval

The "future cards" instinct feels heavy/permanent for a reason — it's asking a claim to behave like it's already settled.

## The shape

**Compost, not queue.** Not FIFO. Not inbox. Items don't want to be *processed*. They want *time and adjacency* until rereading produces recognition or a trigger fires.

**Zettelkasten-style.** Atomic notes, dense linking, emergent structure from links rather than imposed taxonomy. Titles are claims, not topics.

**One filesystem, two read modes.** `docs/alexandria/lab/Note Title.md` lives next to `docs/alexandria/library/Rationale - X.md`. Wikilinks work across both. Conan grades only `library/`. Graduation is literally `git mv`.

**Structure at reread time, not write time.** Write-time friction kills capture. Structure should emerge when the human comes back and rereads.

## The Lab agent

Lab likely wants its own agent — the 6th Alexandria agent — because the *verb* is different from every existing agent:

| Agent | Verb |
|-------|------|
| Solomon | triage |
| Conan | grade |
| Sam | write-of-record |
| Bridget | brief |
| Raven | think-toward-product |
| **Lab agent** | **think-toward-clarity** |

Core loop: `atomize → link → restate → surface patterns → scout graduation`.

Candidate archetypes: gardener (evergreen-garden), weaver (threads-into-fabric), cartographer (mapping terrain of thinking).

Candidate names: Iris, Linnea, Ariadne, Ezra.

Open design questions:
1. Voice — challenging ("this note is fuzzy, rewrite it"), surfacing ("here are three connected notes"), or both?
2. Drafting stance — does the agent ever write notes *for* the human? Matuschak-orthodox says no (writing is the thinking). Alexandria-pattern says yes (Sam drafts, Bridget assembles, humans review). Pick on purpose.
3. Read boundary — Lab-only (pure, no graduation scouting) vs Lab + Library (powerful, can cross-pollinate and scout graduation). Which failure mode is worse?

## Why Raven probably shouldn't read the Lab — yet

The Lab ↔ Library relationship isn't defined. If Raven reads Lab during product conversation, speculative thinking leaks into product reasoning, and Raven's groundedness gets diluted. Until we know what graduation means and what cross-pollination looks like, keep Raven's read-surface on the Library. Lab is for the human (and the Lab agent).

## Notebook is parked

Jess has a 20+ year journaling habit. The Notebook surface (chronological reflections, never processed, reread for recognition) is clearly different from Lab and not the active design question. `/ax-complete-plan` retros may already be de-facto Notebook entries.

## What this note does not decide

- Whether Lab is a 6th agent or a separate plugin entirely
- The Lab agent's name or voice
- The graduation trigger (belief? demand? convergence?)
- Whether Lab notes get a minimal frontmatter or are totally freeform
- How the linking ritual actually happens (solo, agent-assisted, both)
- Whether Lab has eval coverage

These are live questions. This note is the *container* for them, not the answer.

## Links

*(None yet — this is the first Lab note. When the second one is written, it should link back here if the connection exists. That act is the point.)*

## Provenance

- 2026-04-23 — Captured during thinking-partner dialogue with Raven after closing out three implementation plans. Trigger: recognition that the orchestration-engine thought (fabro.sh) and the customer feedback waiting to be processed had no home in Alexandria. Named the shape through dialogue — compost → research lab → Zettelkasten → Lab + Lab agent. Still speculative. Do not plan from this yet.
