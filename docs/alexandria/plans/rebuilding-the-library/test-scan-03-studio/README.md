# Playmaker's Studio — standalone data model (test scan 03)

*(Blind back-of-house scan, 2026-06-20. No answer key. Sources: `studio/plays/`
governance docs in full + two sample plays + the inheritance README. Pipeline
applied in order: Event Storming → DDD bounded contexts → C4 altitudes. See
`STUDIO-EVENTS.md` for the Pass-1 timeline + Hot Spots; this README is the
navigation map.)*

This folder is a draft data model for **Playmaker's Studio** treated as its
own product (not as a sub-component of Alexandria). 68 cards in 7 bounded
contexts.

## How to read this

Open `STUDIO-EVENTS.md` first — the Pass-1 timeline of ~22 Domain Events plus
the Hot Spots (places the governance docs disagree or punt) anchors everything
else. Then walk the contexts below; every card body has `[[wikilinks]]` to
related cards in WHERE.

## Folder structure

```
test-scan-03-studio/
  README.md                 ← you are here
  STUDIO-EVENTS.md          ← Pass-1 (the headline artifact)
  STAGE-2-BRIEF.md          ← what the docs can't answer (for the director)
  READ-LIKE-WHAT.md         ← honest self-assessment

  <context>/                ← lowercase context folder per bounded context
    <type>/                 ← lowercase type folder
      <Type> - <Name>.md    ← one card per noun/verb/value
```

## The six bounded contexts

The carving criterion was "where the language changes." From the Pass-1
events, six contexts fell out — each owns a coherent vocabulary and a
distinct subset of the lifecycle.

| Context | What it owns | Card count |
|---|---|---|
| **brief/** | The design surface — what the Director authors, the Hardener interviews, Gate 1 confirms. The *intent* layer. | 11 |
| **workflow/** | The deployable artifact + the projection rules + renderings. What the Director's design becomes mechanically. | 12 |
| **board/** | The Director's confirm flow + play identity + stage/status vocab. The *production progress* layer. | 8 |
| **grading/** | Fixtures + lint + risk maps + run records + Gate 2 + measurement bars. The *proving* layer. | 10 |
| **runtime/** | Run lifecycle + events + wake + human-input units + the agents that author and verify. The *execution* layer. | 12 |
| **production-line/** | Studio itself + the loop + the director/orchestrator roles + big-edit playbook + handoff/closeout + surfaces. The *meta* layer. | 11 |
| **inheritance/** | The autopsy archive + quarantine + promotion lifecycle. The *trust-the-past-carefully* layer. | 4 |

## Type vocabulary (the row-2 folders)

Per scan-02 convention:

- **aggregates/** — lifecycle-bearing things (have identity + state transitions).
- **components/** — pieces inside an aggregate; no independent lifecycle.
- **values/** — no identity; meaning-by-content (e.g., a status enum, a tag class).
- **read-models/** — derived views (e.g., the rendered registry).
- **surfaces/** — human-facing rendered things (workshop page, the server).
- **capabilities/** — verbs / operations / gates that move state.
- **agents/** — the named LLM roles in the loop (Hardener, Author, Checker, Grader, Doer).

`brief/` carries the *design* aggregates; `workflow/` carries the *projected*
aggregates; the two are deliberately separated because the docs draw the line
clearly (the brief is what's edited; the workflow is what's derived).

## Altitude tagging

Per C4 — frontmatter `altitude:` on every card:

- **pillar** — Studio's top-of-product nouns (Aggregate - Playmaker's Studio; Aggregate - Board).
- **context** — a bounded part (The Loop; Inheritance).
- **aggregate** — lifecycle-bearing thing (Play, Brief, Workflow Package, Run, Fixture Kit…).
- **component** — piece inside (Node Prompt, Diagram, Story View, Lint Verdict…).
- **value** — no identity (Doer, Bounce, Fidelity, Stage, Status, Event, Wake, Run Mode…).
- **capability** — operation/verb (Gate 1, Gate 2, Derive, Bank, Register, Three Strikes Then Freeze).

## How the contexts relate at run time

```
            ╭──── inheritance/ (historical record + promotion path)
            │
production-line/ (Studio, The Loop, BIG-EDIT, Handoff/Closeout)
  │
  ├── brief/   ─── Gate 1 ───┐
  │   (design)               │
  │                          ▼
  ├── workflow/ ──── Derive ──── Bank ──┐
  │   (projected)                       │
  │                                     ▼
  ├── grading/ ─── Gate 2 ─── Register ─┐
  │   (proving)                         │
  │                                     ▼
  └── runtime/  ─── Run / Wake / Human Input Unit
      (execution)
```

The Board sits across all of them — it's how the Director sees state.

## What's a stub here means

Every card body opens with `_Stub —_` and the WHY section sometimes says
"docs don't say." That's intentional: this scan deliberately surfaced what
the docs leave open rather than filling it in. The matched companion
`STAGE-2-BRIEF.md` is the question list for the director-led walk that
follows.

## Source ladder used

- **Tier 1** (read in full): HANDOFF.md, README.md, RUNTIME.md, AUTHORING.md,
  PROJECTION.md, TESTING.md, BIG-EDIT.md, CLOSEOUT.md, ATOMIC-CARDS.md,
  TEMPLATE-brief.md, registry.js, board-state.json — 12 files.
- **Tier 2** (sample plays): frame-the-problem (brief.md L1-100, risk-map.md
  L1-80, story.md L1-40, known-fps.md L1-30, improvements.md L1-25, plus dir
  listing); atomic-card-planning (brief.md L1-50, plus dir listing) — 2 plays,
  ~7 partial reads.
- **Tier 3** (inheritance): inheritance/README.md — 1 file. PARKING-LOT.md
  + AUTHORING-moves.md skim — 2 partial reads.

Total: ~22 file reads (under the 25-35 cap).
