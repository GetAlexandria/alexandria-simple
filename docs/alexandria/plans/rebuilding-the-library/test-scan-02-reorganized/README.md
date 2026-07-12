# test-scan-02-reorganized

A pipeline-driven re-shelving of the 40 cards in `../test-scan-01/`. Same bodies,
new shelves: cards are now grouped by **bounded context** (the architect's three
pillars + a few extras the data model implies) and re-typed where Event Storming
or DDD demanded.

## How to read the folder tree

The top level is **part / bounded context**, not card type. Card type is the
folder *inside* a context. This is the inversion the experiment exists to test:
in scan-01 a Director asking "what does the Library look like?" had to walk five
type-folders and pull cards from each; in scan-02 the answer is `library/`.

```
library/         the Library pillar — model / record (intent cards live here)
  aggregates/    Atomic Card, Source Item, Source Conversion, Source of Truth, Area
  read-models/   Library, Knowledge Bank   (derived views — "never stored")
  surfaces/      Library, Card Drawer, Info Hub, Raven Vision Onboarding
  capabilities/  Source Intake & Atomization, Vision Power-Up
  components/    Vision Slot

playbook/        the Playbook pillar — action / orchestration
  aggregates/    Play, Play Run            (Play Run = live state of a Play)
  components/    Move                     (the leaf inside a Play)
  agents/        Raven, Damien            (delegation surfaces)
  surfaces/      Playbook
  capabilities/  Run a Play, Human-in-the-Loop Feedback

ledger/          the Ledger pillar — the immutable event record
  aggregates/    Ledger
  surfaces/      Ledger

triggers/        the activation layer — fires Plays
  aggregates/    Trigger

runtime/         Execution Layer — referenced, in no pillar (the machine)
  systems/       Fabro Workflow Engine, Runtime Event Store, Codex Host Integration
  capabilities/  Initialize Project, Inspect Runtime State
  implementation/  Raven Connection (demoted — not a product noun)

studio/          Playmaker's Studio — recent invention, own bounded context
  surfaces/      Play Maker's Studio, Play Tracker, Studio Board (the UI half)
  read-models/   Studio Board (the state half — polysemy split)
  values/        Production Stage

viewer/          shell / chrome — surfaces that don't belong to any pillar
  surfaces/      Alexandria Web App, Stone Top Bar, Alexandria Home, Agent Bench
```

## Card types in use

| Type           | Meaning                                                          |
| -------------- | ---------------------------------------------------------------- |
| Aggregate      | A thing with a lifecycle, owns state                             |
| Component      | A piece inside an Aggregate (no independent identity)            |
| Value          | A small named bundle of data, no identity / lifecycle            |
| Read Model     | A derived view ("never stored") — new in scan-02                 |
| Surface        | A user-visible part of the UI                                    |
| Capability     | A verb / something the user can do                               |
| Agent          | A delegation surface (Raven, Damien)                             |
| System         | Machine / mechanism — referenced, not part of any pillar         |
| Implementation | Demoted from product noun to plumbing (auditable trail)          |

## Frontmatter additions

Every card now carries:

- `context:` — the top-level bounded context (`library`, `playbook`, etc.)
- `altitude:` — C4 altitude tag: `pillar`, `context`, `aggregate`, `component`,
  or `value` (no new folders for this; it's a tag).
- `type:` — updated where Event Storming / DDD required (e.g. `Surface → Read Model`).

Original fields (prefLabel, altLabels, category, source_evidence…) are preserved.

## Where to look first

- `REORGANIZATION-NOTES.md` — every move, with a one-sentence why.
- `THREE-CONFUSIONS.md` — explicit verdict on the architect's three confusions.
- `READ-LIKE-DATA-MODEL.md` — honest assessment vs. the architect's data model.
