> **Design proposal — captured 2026-06-22** to park F9 without losing the thinking. Not for building today. Reframes "the Curator" (F9) as one corner of a larger thing the director named: a **Playmaker Studio Operations Division** of operations plays, derived from the **operations manual**. Sits under the [Operations & Maintenance Quality Plan](studio-operations-quality-plan.md).

# PROPOSAL — Playmaker Studio Operations (a Division of operations plays)

## Why this exists

Walking F9 (the Curator) surfaced that it's underbaked because the nouns under it aren't real yet — and that it gestures at something much bigger than one play. This proposal captures that larger thing so momentum isn't lost. **We are not building it today.**

## The reframe — "rulebook" → operations manual → operations plays

We kept calling the scattered governance docs a "rulebook." The director's better noun: an **operations manual** — the procedures and conventions for operating and maintaining Playmaker Studio, today scattered across `README.md`, `AUTHORING.md`, `PROJECTION.md`, `TESTING.md`, and the `inheritance/` folders. It's not a real single artifact; it's prose agents are *supposed to read* — which is exactly why it drifts (the F8 problem).

The move (director): **just like plays and playbooks, we need a series of plays and a Division for Playmaker Studio Operations.** The operations manual gets **broken down into operations plays** — each one part **(a) an English description of what should happen** and part **(b) the Fabro play that makes it happen**. The same pattern as every play (brief + `workflow.fabro`). So the operations manual stops being prose-you're-supposed-to-follow and becomes **operations plays that run.** (This is the F8 self-hosting principle, applied to operating the Studio.)

## The structure — Division → Function

**`Playmaker Studio : Operations`** is a **Division** holding a **series of operations plays** (the maintenance / management / quality plays), organized by **Function** (the canonical 8). This is the Division→Function storage already ruled — and here's its power: **a backlog item can be play-specific OR system-specific**, and either way it lives in its Division/Function cell. (That resolves the Capture-scope question: per-play work and studio-wide work both fit the same structure; the Board's per-play cards and a studio-level backlog are two reads of one model.)

Named-agent ownership stays a **view**, not the container — "the Curator" (if we keep the name) is an agent-lens over the maintenance plays, not where they're stored.

## The defining feature — triggers vary wildly

Unlike the **production** pipeline (one forward flow: Ground → … → Live), **operations** plays fire on **wildly varied triggers**:
- **Director-invoked** — the director runs it (e.g. "deprecate this rule," "groom the backlog").
- **Timer-based** — runs on a schedule (e.g. a periodic audit, a staleness sweep).
- **Quality-reaction** — event-triggered by new work (e.g. a Play Re-sync *Catch* → a Bug card; a new ruling → a Capture; an inherited file lands → a Quarantine).

That trigger variety is what distinguishes the operations Division from the single-flow production pipeline. (It also maps cleanly onto the ledger: a trigger is an event; a disposition is an appended event.)

## What the Curator (F9) becomes

F9's three "triggers" were really three **operations plays** in this Division:

| F9 trigger | As an operations play | Likely trigger |
|---|---|---|
| **Capture** | a **backlog play** — logs ideas/improvements, play-specific *or* system-specific (the studio-level sibling of the Board's per-play cards) | director-invoked · quality-reaction |
| **Deprecate** | a **manual-maintenance play** — retires a procedure the proven play outgrew (template-vs-exemplar drift); **F8 makes much of this self-healing** | quality-reaction · timer |
| **Quarantine** | an **inheritance-intake play** — sequesters ported/inherited cruft (the old Conan library, the jury-rigged ports) until verified; never load-bearing until promoted | on intake of foreign material |

So **"the Curator" is not one play** — it's a name for the *maintenance corner* of the Operations Division. F9 is hereby **parked**: its mechanism detail feeds this proposal; its three jobs become operations plays here.

## The ecosystem framing

This is **product-level maintenance & management** — running and maintaining Playmaker Studio as a living product, programmatically, by agents. It is the **maintenance half** of the Quality Plan's macro-story made concrete: a Division of operations plays, triggered variously, filing work (play- or system-level) by Division→Function. Product-level management is a real, valuable thing on its own — having agents do it programmatically is the prize.

## What we are NOT doing today

Not building. This captures the design thinking:
- The **reframe**: operations *manual* (not rulebook); a **Division of operations plays** derived from it.
- The **structure**: Division→Function; backlog items play-specific *or* system-specific.
- The **trigger variety**: director / timer / quality-reaction.
- F9's three jobs as example operations plays; the Curator parked into this.

## Open / future (when this gets its design pass)

- **The operations-manual decomposition** — which scattered procedures become which operations plays. (The Quality Plan §2 inventory is the seed list.)
- **Agent-as-view** — is "the Curator" an agent-lens over the maintenance plays, or do we drop the name?
- **Dependency on F8** — operations plays *are* plays, so they ride on play-writing-being-a-play; and on the **ledger** (triggers + dispositions as events; the D5 event-type gap).
- **The one near-term actionable piece** — the inheritance / build-mess cleanup (Quarantine the Conan/ported cruft).
