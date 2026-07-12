# Library Model

> How the workspace and library are laid out, what a card looks like, and the
> current taxonomy transition state. Load before deep library work, and adapt
> to what the workspace actually contains — this file describes the shapes you
> may find, not a guarantee of which one you will.

## The workspace

- `.alexandria/alexandria-config.json` — persistent project config; points to
  the Alexandria workspace, and its `library.root` field names the library's
  location (default: `<workspace>/library`). Start there — never assume a
  path.
- `docs/alexandria/` — the default workspace root.
- `docs/alexandria/ledger/events.jsonl` — the Ledger: append-only, immutable
  history of what has happened (card work, rulings, play runs). Provenance for
  card changes lives in Ledger events, not in hand-authored frontmatter.
- `docs/alexandria/sources/` and `docs/alexandria/source-of-truth/` — frozen
  provenance material outside the library root. The Raven Vision source of
  truth (generated from approved Vision slots) typically lives at
  `docs/alexandria/source-of-truth/raven/vision/`.

## Cards, in either taxonomy

- Named `Type - Name.md`. The `[[Type - Name]]` wikilinks between cards are
  relationship edges — read the library as a graph.
- Cards make the product's knowledge atomic: one concept, one card, densely
  linked.

## The two-taxonomy transition

Two card taxonomies coexist in shipped code, and the ruling between them is an
open question. Check which one the workspace uses before making structural
claims.

### Classic layout

Older libraries organize cards in layers:

- `rationale/` — WHY-layer cards: Product Theses, Principles, Standards
- `product/` — product-layer cards: Domains, Sections, Capabilities, Systems,
  Components, Templates, Artifacts, Agents
- `experience/` — experience-over-time cards: Loops, Journeys, Experience
  Goals, Forces
- a temporal layer — Decisions, Initiatives, Futures

Classic card bodies use five dimensions: WHAT, WHERE, WHY, WHEN, HOW.

### Atomic-card layout

Newer libraries use eleven category folders:

`bets/`, `principles/`, `research/`, `roles/`, `domains/`, `surfaces/`,
`entities/`, `capabilities/`, `mechanisms/`, `patterns/`, `economy/`

(The old `rationale/` catch-all bucket was retired 2026-07-06: it refined
into `Bet` — a falsifiable wager — and `Principle` — a normative rule — as
first-class strategy-plane types. Older libraries may still carry it.)

Card types include Concept, Entity, Capability, Mechanism, Component, Surface,
Pattern, Reference, Economy, Role, Bet, and Principle. Frontmatter carries
structured fields —
typically `type`, `prefLabel`, `plane` (strategy / product / learning),
`context`, `status` (e.g. stub), `confidence`, `altitude` (e.g. keystone), and
`altLabels`. Bodies use WHAT / WHY / WHERE sections. A `library.json` catalog
(`product-card.v1`) may sit alongside the folders; shipped code also carries
an explicit `legacy` mode for the classic shape.

### How to handle the seam

- Inspect the library root first; let what you find set your vocabulary.
- Raven's reference material (thinking lenses, diagnostic patterns, traversal
  doors) uses classic card-type names illustratively — translate to the
  workspace's actual types rather than treating the names as canonical.
- If both shapes are present, say so: the seam itself is a finding worth
  naming to the director.
