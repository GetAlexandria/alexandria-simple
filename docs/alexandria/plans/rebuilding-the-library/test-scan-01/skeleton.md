# Skeleton — topological read (test-scan-01)

## Overall shape (one paragraph)
Alexandria is a **product-knowledge graph** for a software product: it ingests a
codebase and other sources, and with a small team of **specialized agents** (only
Raven "Product Owner" and Damien "Demo Producer" ship today) turns that material
into a browsable **Library** of typed knowledge cards, while running **guided
workflows ("plays")** through a workflow engine (Fabro) to keep the codebase
aligned with product intent. The web **Viewer** is the window onto everything —
a stone-tabbed shell over Library / Playbook / Info Hub / Ledger, an agent bench,
a Vision onboarding flow, and a Director-gated **Play Maker's Studio** for
authoring and proving plays. Under the hood it is **event-sourced**: an append-only
ledger projects into the live state every surface reads. (The product's headline,
verbatim from `plugin.json`: "A knowledge graph for your product. Five specialized
agents plus deterministic CLI tooling keep your codebase aligned with product
intent.")

## Entry surfaces
- **[[Surface - Alexandria Home]]** (`/`) — the front door; foregrounds Raven and a
  single CTA ("Connect Raven" → "Power up Raven: Vision"). (confirmed)
- **`ax init`** — the CLI entry that bootstraps a project before any surface has
  data. (confirmed)
- **`ax start viewer`** — launches the Viewer web app that hosts all surfaces.
  (confirmed)

## Hubs (inbound / outbound)
- **[[Surface - Viewer Shell]]** — the central UI hub.
  - inbound: Home CTA, Stone Top Bar tabs, agent bench, routes.
  - outbound: Library, Playbook, Info Hub, Ledger, Studio, Vision, Knowledge Bank.
- **[[Entity - Library Graph]]** — the knowledge hub.
  - inbound: atomization pipeline (sources → cards). 
  - outbound: every card node rendered in [[Surface - Library]] + Card Drawer.
- **[[System - Runtime Event Store]]** — the state hub (behind-the-scenes).
  - inbound: every play/agent/CLI action appends events.
  - outbound: projected state for Library, Playbook, Vision, Play Runs, Ledger.
- **[[Surface - Play Maker's Studio]]** — the production hub (Director-facing).
  - inbound: play records, board state, factory run ids.
  - outbound: Board, Play page, Factory runs, Play Tracker, Raven/Damien tabs.

## Main-path chain
Two intertwined main paths emerge from the code:

**Knowledge path:**
`ax init` → [[Surface - Alexandria Home]] → connect [[Agent - Raven]] →
[[Capability - Raven Vision Onboarding]] (nine [[Entity - Vision Slot]]s) →
bank Vision into [[Entity - Knowledge Bank]] → [[Capability - Source Intake and Atomization]]
([[Entity - Source Item]] → [[Entity - Source Conversion]] → [[Entity - Source of Truth]] →
[[Entity - Atomic Card]]) → [[Entity - Library Graph]] → browse [[Surface - Library]]. (mostly inferred at the joins)

**Play path:**
[[Surface - Playbook]] (or `ax run`) → launch [[Entity - Play]] →
[[System - Fabro Workflow Engine]] executes [[Entity - Move]]s → [[Entity - Play Run]] →
(on a human move) [[Capability - Human Feedback Loop]] → events to
[[Entity - Event Ledger]] → watched in [[Surface - Play Tracker]]. (confirmed shape)

## Side-trips
- **[[Agent - Damien]]** + Demo-video stations (Demo Thesis → Story Spine → Demo Path)
  — a marketing branch off the main knowledge product. (confirmed it exists; depth not scanned)
- **[[Surface - Ledger]]** — read-only history view; currently locked in nav. (confirmed locked)
- **[[Capability - Inspect Runtime State]]** / `ax doctor` — observability/admin trips. (confirmed)
- **[[System - Triggers]]** — automated play-firing; mechanism present, usage thin. (inferred usage)

## Behind-the-scenes processes
- **Event-sourcing + projection** — [[System - Runtime Event Store]] turns the
  JSONL ledger into live state. (confirmed)
- **Fabro run bridge** — streams factory-run stages into ledger events + tracker
  legs. (confirmed)
- **Coding-tool host integration** — [[System - Codex Host Integration]] runs agents
  inside Codex/ACP (Claude adapter optional); the [[Entity - Raven Connection]]
  reflects that link. (confirmed mechanism; product framing inferred)
- **Director-gated production** — cards advance the Studio Board only on a human
  "confirm." (confirmed)
