---
name: lead-card-context-coverage
description: >-
  Use when writing or revising a library context's LEAD card body — the
  highest-altitude card whose how-it-does-it story the Index renders for the
  whole context. The lead must account for every other card in the context:
  narrate and link its direct children, and `relegates:` its deep internals, so
  the Index reads as a story instead of a pile of unused words. Applies where
  card bodies are authored (EL5/atomize), using the relationships Front-of-House
  has settled.
---

# Lead-card context coverage

The library **Index** shows each context as its **lead card's how-it-does-it
story plus the full list of the context's member cards**. When the lead story
only talks about itself, the members become a **pile of listed-but-unnarrated
nouns** — twenty words under a paragraph that uses two of them. (The **Catalog**
tab never shows this: it draws the context as a diagram, where a card is a node
whether or not a sentence names it.) This skill makes the lead story account for
its whole context.

Use it whenever you write or revise a context's **lead card** — the top-altitude
card of a context. Its `## HOW` is doing double duty: it is both that card's
story *and* the Index's story for the whole context.

## The one rule

**The lead card's `## HOW` accounts for every other card in the context. Each
member is either narrated-and-linked or relegated — nothing is left silent.**

Three dispositions, one per member (from R7, "no orphans"):

1. **Narrate + link** — a *direct child*: name it as a `[[wikilink]]` welded to a
   verb in the story, AND add a matching `links:` entry. Both are required: a
   story wikilink to an in-context member only counts if the lead also links it,
   or the diagram-parity lint fires ("story noun X is missing from the diagram
   connectors"), because the diagram is derived from `links:`.
2. **Relegate** — a *deep internal* that belongs to a sub-part one altitude down
   and would clutter the lead's story: add it to `relegates:` (no story mention
   needed). It's covered without being narrated.
3. **Remove** — it's misfiled; it belongs in another context.

Narrate the direct children; relegate the internals. That keeps the lead story at
its own altitude instead of cramming a sub-part's guts into it.

## What the pile looks like (the thing you are fixing)

Index, playbook context — the lead names one noun; CONTAINS lists eighteen:

> **HOW** It contains every registered [[Entity - Play]]; agents pick plays from
> it when work fires.
> **CONTAINS** Play · Play Run · Move · Play Skill · Workflow Package · Human
> Gate · Review Gate · Vision Slot · Slot Status · Provenance Record · … *(18
> nouns, 17 never mentioned)*

Seventeen nouns listed, never used in a sentence. That is the pile.

## Worked example — narrate the direct children

**Before — `## HOW`:**

> It contains every registered [[Entity - Play]]; agents pick plays from it when
> work fires.

**After — `## HOW`** (one causal paragraph; every member verb-welded, deep parts
nested under their parent — never a comma-list of nouns):

> The Playbook holds every registered [[Entity - Play]]. A play is defined by two
> parts — a [[Component - Workflow Package]], the runnable graph of ordered
> [[Component - Move]]s the engine steps through, and a [[Component - Play Skill]],
> its spoken procedure read in session. When work fires the play is instantiated
> as an [[Entity - Play Run]] … whose four [[Component - Vision Slot]] pieces each
> move through [[Economy - Slot Status]] values, draw on attached
> [[Entity - Source Item]] material, and resolve into the
> [[Entity - Source of Truth]] the library later builds from.

Every fact was already true on the member cards; nothing was invented. Use the
honest link type — `contains` for a true part, `produces` / `operates_on` /
`derived_from` / `conforms_to` where the member's card states it, else
`related_to`.

## Relegation — for deep internals

If a context is broad, some members are internals of a sub-part, not things the
top-level story should carry (altitude discipline). Relegate them instead of
loose-linking and over-narrating:

```yaml
links:
  contains:
    - Entity - Play
  related_to:
    - Entity - Play Run
    - Mechanism - Fabro Orchestrator
  relegates:
    - Component - Move
    - Component - Play Skill
    - Economy - Slot Status
    - Component - Run Labels
```

Then the lead's `## HOW` narrates Play, Play Run, and the orchestrator (the
direct children), and does NOT have to mention Move, Play Skill, Slot Status, or
Run Labels — they are covered by `relegates:`. A relegated member emits a
"relegates"-labeled diagram connector: the `no-orphans` lint counts it as
covered, and diagram-parity does not require it in the story. Relegation is what
keeps a lead story tight without leaving orphans.

Reach for `relegates:` when a member is genuinely a sub-part's internal. Do NOT
use it to dodge writing the story for a real direct child.

## How to cover one member

1. **Read the member card.** Take the relationship from its own `## HOW` /
   `links:`. Never invent one.
2. **Decide the disposition by altitude.** Direct child of the lead → narrate +
   link. Internal of a sub-part → `relegates:`. Misfiled → move it out.
3. **If narrating:** weld it to a verb (*"each [[Entity - Play]] is built from
   [[Component - Move]]s"*), never a bare-noun list, and add the matching
   `links:` entry with the honest type.
4. **Keep it product English** — no paths, identifiers, routes, or `event N` in
   the body; those live in `source_evidence` / `rulings`.

## Negative cases

- A `## HOW` that lists the members as bare nouns after a colon (*"It holds Play,
  Move, Play Skill, …"*) **violates this skill** — that is the pile in sentence
  clothing. Weld each noun to a verb.
- Naming `[[Entity - Play Run]]` in the story but not adding it to `links:`
  **violates this skill** — it fails diagram-parity.
- Adding `contains: [Component - Move]` to the Playbook lead to satisfy the gate
  **violates this skill** — Playbook does not contain Move; use the honest type
  or `relegates:`. Never a false relationship to pass a lint.
- Relegating a genuine direct child to avoid writing its sentence **violates this
  skill** — relegation is for internals, not for skipping the story.

## The gate

```
bun packages/ax/src/tools/library-catalog-story-lint.ts \
  --project-root . --library-root <bundle-path>
```

Zero `orphan card` lines for the context, and no new `diagram-parity` line on the
lead. A green gate is the **floor, not the ceiling** — it proves every member is
accounted for, not that the story reads well. Read it back: a director should
learn how the whole context works from that one paragraph.

## Never

- Never satisfy the gate with a false or invented relationship. Honest link type,
  relegate, or do not name it.
- Never write the lead story as a list of nouns. One verb-welded chunk per
  narrated member.
- Never leak machine tokens into the body.
- Never edit a member card, or the lead's `source_evidence` / `status` /
  `rulings` / `prefLabel` / `context` / `plane` / `altitude`, to make coverage
  "work."

## Where this runs (deployment)

Card bodies are authored at **EL5 / atomize**, using the relationships
**Front-of-House** has settled. That is where this skill applies — the lead's
story can only be written once its context's membership and links are trustworthy.
Running it at **Back-of-House** would weave relationships the scanner only guessed
and Front-of-House is about to rewrite (rework on a moving target).
