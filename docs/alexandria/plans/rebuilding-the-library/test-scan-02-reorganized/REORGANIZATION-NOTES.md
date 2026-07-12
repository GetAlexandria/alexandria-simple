# Reorganization notes — every move from scan-01 → scan-02

Each row is one card. Same body, different shelf (and sometimes a new type).
Reasoning is the framework, in one phrase.

## (a) Splits — one card became two (polysemy)

| scan-01 card | scan-02 a | scan-02 b | Why |
| --- | --- | --- | --- |
| `Entities/Entity - Studio Board.md` | `studio/surfaces/Surface - Studio Board.md` | `studio/read-models/Read Model - Studio Board.md` | DDD polysemy split: "Studio Board" means both the kanban UI you look at AND its derived state — two contexts, two cards, cross-referenced. |

## (b) Re-typings — same name, different kind

| scan-01 type | → scan-02 type | Card | Why |
| --- | --- | --- | --- |
| Entity | Aggregate | Atomic Card, Source Item, Source Conversion, Source of Truth, Area (was "Knowledge Bank Area"), Play, Play Run, Trigger, Ledger | ES + data model: these have a lifecycle and own state — they're Aggregates, not bare data. |
| Entity | Read Model | Library (was "Library Graph"), Knowledge Bank | Data model explicitly: "Knowledge Bank... derived. Never stored." Library is the federated view. Event Storming Read Model. |
| Entity | Component | Move | Data model: Move is "the leaf" inside a Play — a Component, not a standalone Aggregate. |
| Entity | Component | Vision Slot | One of nine pieces inside a Vision Source Conversion — no independent lifecycle. |
| Entity | Value | Production Stage | An enum of six labels with gate text — pure value object, no identity. |
| System | Surface | Agent Bench | A picker tray (chrome), not its own noun; the agents it shows are the Agents. |
| Entity | Implementation | Raven Connection | UL test fail — see (c) below. |

## (c) Demotions — moved off the product noun shelf

| Card | New shelf | Why |
| --- | --- | --- |
| Raven Connection | `runtime/implementation/Implementation - Raven Connection.md` | DDD Ubiquitous Language test: the architect doesn't say "Raven Connection" when describing the product. Whether Raven is currently connected is implementation-level presence state of an Agent session — not a card-worthy noun. Kept for audit trail. |

## (d) Merges — same noun on two shelves, collapsed

| scan-01 a | scan-01 b | Merged into | Why |
| --- | --- | --- | --- |
| `Entities/Entity - Library Card.md` | `Entities/Entity - Atomic Card.md` | `library/aggregates/Aggregate - Atomic Card.md` | Same noun viewed from two schema shapes (`LibraryGraphCard` render vs `AtomicCard` atomization output). The data model has one: Atomic Card. The other is its rendered projection in the Library Read Model — not a separate noun. Library Card preserved as an `altLabel`. |

## (e) Re-shelvings — type unchanged, context now explicit

These cards kept their type but moved from a type-bin to a part-bin. (No reshelf
warrants its own row — the framework is "every card now lives in its bounded
context.") Highlights:

| Card | Old (scan-01) | New (scan-02) | Why |
| --- | --- | --- | --- |
| Knowledge Bank | `Entities/` | `library/read-models/` | Library pillar — the data model says it's a derived view of the Library. |
| Knowledge Bank Area | `Entities/` | `library/aggregates/Aggregate - Area.md` | Library pillar — the architect calls it "Area"; "Knowledge Bank Area" is the agent-scoped view name. |
| Source Item / Source Conversion / Source of Truth / Atomic Card | `Entities/` | `library/aggregates/` | Library pillar — the Source Conversion pipeline lives here. |
| Vision Slot | `Entities/` | `library/components/` | Library pillar — part of a Vision Source Conversion (no own lifecycle). |
| Raven Vision Onboarding (Surface + Capability) | `Surfaces/` + `Capabilities/` | `library/surfaces/` + `library/capabilities/` | Library pillar — Vision is the first Area, this is the Source Conversion flow for it. |
| Info Hub | `Surfaces/` | `library/surfaces/` | Library pillar — the intake surface for Source Items. |
| Source Intake & Atomization | `Capabilities/` | `library/capabilities/` | Library pillar — the Source Conversion verb. |
| Play / Play Run / Move | `Entities/` | `playbook/` | Playbook pillar — the action layer's core nouns. |
| Raven / Damien | `Agents/` | `playbook/agents/` | Playbook pillar — per data model, Agent "holds a Job Title; the Job Title is responsible for a set of plays." |
| Playbook (Surface) | `Surfaces/` | `playbook/surfaces/` | Playbook pillar — the surface for the pillar's read side. |
| Run a Play / Human-in-the-Loop Feedback | `Capabilities/` | `playbook/capabilities/` | Playbook pillar — the verbs over Plays. |
| Event Ledger / Ledger surface | `Entities/` + `Surfaces/` | `ledger/aggregates/` + `ledger/surfaces/` | Ledger pillar — its own pillar. |
| Triggers | `Systems/` | `triggers/aggregates/Aggregate - Trigger.md` | Data model: "Triggers are the activation layer (their own mechanism, not part of the Ledger)." Re-typed System → Aggregate. |
| Fabro / Runtime Event Store / Codex Host | `Systems/` | `runtime/systems/` | Data model: "Execution Layer — referenced, in no pillar." Own context. |
| Initialize Project / Inspect Runtime State | `Capabilities/` | `runtime/capabilities/` | Verbs over the machine, not a pillar. |
| Play Maker's Studio / Play Tracker | `Surfaces/` | `studio/surfaces/` | The Studio is a recent invention, not in the data model — gets its own bounded context. |
| Production Stage | `Entities/` | `studio/values/Value - Production Stage.md` | Re-typed Entity → Value (an enum, no lifecycle) AND moved into Studio context. |
| Alexandria Home / Stone Top Bar / Viewer Shell / Agent Bench | `Surfaces/` + `Agents/Agent Bench` | `viewer/surfaces/` | Chrome surfaces — cross-cut all pillars, deserve their own context. |

## Totals

- **scan-01 input:** 40 cards (3 Agents + 6 Capabilities + 16 Entities + 11 Surfaces + 4 Systems).
- **scan-02 output:** 40 cards.
- **Split:** 1 (Studio Board → 2).
- **Merged:** 1 (Library Card + Atomic Card → 1).
- **Re-typed:** 11 (see table b).
- **Demoted:** 1 (Raven Connection).
- **Reshelved (context-only):** all remaining.
