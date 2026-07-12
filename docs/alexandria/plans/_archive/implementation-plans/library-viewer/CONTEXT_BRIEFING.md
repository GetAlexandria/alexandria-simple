# Context Briefing: Alexandria Library Viewer

A local web interface (Bun + Astro + React) for browsing the product knowledge
library. CLI tool to generate and serve a static site from `docs/alexandria/`
markdown, with rendered cards, clickable wikilinks, dashboard overview, sidebar
navigation, plans section, file watching, and Alexandrian branding.

---

## Primary Cards

- **[[Artifact - Library Card]]** -- The atomic unit the viewer renders. Every
  card has five H2 sections (WHAT, WHERE, WHY, WHEN, HOW), typed by the
  taxonomy, named `Type - Name.md`, placed in type-encoding folders. The viewer
  must parse and present this structure faithfully, preserving the five-dimension
  layout as a first-class visual element.

- **[[Artifact - Library Folder Structure]]** -- The filesystem convention that
  encodes type taxonomy into directories. The viewer's sidebar tree must mirror
  this structure: `library/rationale/`, `library/product/`, `library/experience/`
  as top-level groups, with type-plural subfolders underneath. The folder layout
  IS the navigation hierarchy.

- **[[System - Knowledge Graph]]** -- The graph structure where cards are nodes
  and wikilinks are edges. The viewer must render wikilinks as clickable
  navigation links, resolve them against the card inventory, and visually
  distinguish resolved links from broken ones. The graph parser in
  `src/lib/graph.ts` already implements the full parse/resolve/traverse pipeline.

- **[[Experience Goal - Legible Graph]]** -- The north star for how the graph
  should feel when navigated. Every link carries a context phrase explaining the
  relationship. The viewer should display these context phrases alongside links,
  not just render bare card names. Legibility at every scale: single card,
  folder/zone, and system-wide.

- **[[Experience Goal - Well-Run Franchise]]** -- The overarching aesthetic
  goal. Every library deployment should feel the same. The viewer's visual
  language should be consistent, professional, and predictable -- not creative
  or surprising. Alexandrian branding serves identity and recognition, not
  decoration.

## Supporting Cards

- **[[Artifact - Type Taxonomy]]** -- The 18-type classification system. The
  viewer dashboard needs type distribution data (how many cards of each type
  exist) and should use type as a primary facet for browsing. Types include:
  Product Thesis, Principle, Standard, Domain, Section, Governance, Template,
  Component, Artifact, Capability, Primitive, System, Agent, Prompt, Loop,
  Journey, Experience Goal, Force.

- **[[Artifact - Naming Convention]]** -- `Type - Name.md` file naming and
  `[[Type - Name]]` wikilink syntax. The viewer must parse both patterns.
  Card names displayed in the UI should strip the `.md` extension but preserve
  the `Type - Name` format for recognition.

- **[[Standard - Five-Dimension Card Requirements]]** -- The structural contract
  every card must satisfy. The viewer can use this to visually indicate card
  completeness: which dimensions are present, which are missing, link counts
  per section.

- **[[Artifact - Decision 3: Markdown Over Database]]** -- Alexandria chose
  markdown files over a database. The viewer reads markdown from disk, not from
  an API. This decision shapes the entire architecture: filesystem as source of
  truth, file watcher for change detection, static site generation from files.

- **[[Artifact - Decision 4: AI-Native Over Human-Forward]]** -- The library is
  designed for AI retrieval, not human browsing. The viewer is the first
  human-forward surface for the library. This creates a design tension: the
  viewer must make AI-native structure legible to humans without changing the
  underlying format or encouraging human-first edits.

- **[[Principle - Structural Quality Before Functional Quality]]** -- Graph
  structure (links resolve, cards are typed, folders are correct) matters more
  than prose quality. The viewer dashboard should surface structural health
  metrics: broken links, orphans, type distribution, link density.

- **[[Agent - Bridget the Briefer]]** -- Bridget assembles context briefings
  from the library. The viewer serves a complementary purpose: while Bridget
  assembles task-scoped slices for AI agents, the viewer provides humans with
  full-library browsing. The implementation plans section of the viewer shows
  how Bridget's work product (briefings, releases, tickets, outcomes) is
  organized.

- **[[Template - Implementation Plan]]** -- The output format for implementation
  plans at `docs/alexandria/implementation-plans/`. Each plan has a directory
  with `release.md`, `library-updates.md`, `outcomes/`, and `tickets/`
  subdirectories. The Plans section of the viewer must render this structure.

## Relationship Map

```
Artifact - Library Card
  ├── conforms to ──► Standard - Five-Dimension Card Requirements
  ├── placed in ────► Artifact - Library Folder Structure
  ├── named by ─────► Artifact - Naming Convention
  ├── typed by ─────► Artifact - Type Taxonomy
  └── node in ──────► System - Knowledge Graph

System - Knowledge Graph
  ├── parsed by ────► src/lib/graph.ts (Library, Card, Edge classes)
  ├── shaped by ────► Experience Goal - Legible Graph
  └── stored as ────► Artifact - Decision 3: Markdown Over Database

Experience Goal - Legible Graph
  ├── part of ──────► Experience Goal - Well-Run Franchise
  └── enforced by ──► Standard - Five-Dimension Card Requirements

Artifact - Library Folder Structure
  ├── encodes ──────► Artifact - Type Taxonomy
  └── navigated by ─► [Library Viewer sidebar tree]

Agent - Bridget the Briefer
  ├── reads ────────► System - Knowledge Graph
  ├── produces ─────► CONTEXT_BRIEFING.md (implementation plans)
  └── complements ──► [Library Viewer human browsing]

Template - Implementation Plan
  ├── validated by ─► System - DAG Engine
  └── rendered in ──► [Library Viewer plans section]
```

## Gap Manifest

| Gap | Impact | Notes |
|-----|--------|-------|
| No human-browsing surface exists | High | The library has no visual interface today. All interaction is via agents (Bridget, Raven) or CLI tools. The viewer is entirely new. |
| No branding assets or design system | High | Alexandrian branding is referenced in aesthetic goals but no color palette, typography, logo, or visual design system exists. Must be created from scratch, guided by the "crisp, not chaotic" and "professional, not daffy" aesthetic pairs. |
| No card rendering specification | Medium | How a card's five-dimension structure should be visually presented is undefined. The viewer must invent the visual card format (collapsible sections, link rendering, metadata display). |
| No implementation plan rendering spec | Medium | The `implementation-plans/` directory structure (release, outcomes, tickets) has no defined visual presentation. The viewer must decide how to render plan status, ticket states, and outcome tracking. |
| No dashboard metrics specification | Medium | The graph parser produces `typeDistribution`, `layerDistribution`, `linkDensity`, `brokenLinkCount`, `orphanCount` -- but no specification exists for how to present these as a dashboard. |
| No wikilink rendering convention | Low | Wikilinks in markdown are `[[Type - Name]]` with context phrases. The viewer must decide: render context phrase inline? Show it as tooltip? Strip it and show only the link? The legible graph goal suggests showing context. |
| No search/filter specification | Low | The library has type-based and layer-based filtering via the graph parser, but no specification for how search should work in a browser UI. |

## Anti-Patterns

**Human-First Format by Default** (`Artifact - Anti-Pattern: Human-First Format
by Default`). The viewer is a read-only rendering layer. It must not encourage
or enable editing the library in human-friendly formats that diverge from the
AI-native card structure. The viewer shows the library; it does not replace the
construction system.

**QA by Dumping** (`Artifact - Anti-Pattern: QA by Dumping`). The dashboard
should surface actionable metrics (broken links, orphan cards, missing
sections), not dump raw data. Presenting 120 cards with all their metadata in
a flat list is the visual equivalent of this anti-pattern.

**Emergent Agent Behavior** (`Artifact - Anti-Pattern: Emergent Agent Behavior`).
The viewer's behavior should be predictable. No AI-powered features that
surprise the user. The viewer is a deterministic rendering of the filesystem --
the same files always produce the same site.

**Temporal Folder Structure** (`Artifact - Anti-Pattern: Temporal Folder
Structure`). The sidebar navigation should follow the type taxonomy folder
structure, not reorganize cards by temporal status (past/present/future). WHEN
information belongs inside cards, not in the navigation hierarchy.

**Planning Without Library Separation** (`Artifact - Anti-Pattern: Planning
Without Library Separation`). Implementation plans live at
`docs/alexandria/implementation-plans/`, separate from the library at
`docs/alexandria/library/`. The viewer must keep these as distinct sections,
not merge plans into the library card view.

## Key Technical Context

### Graph Parser (`src/lib/graph.ts`)

The existing graph parser is the foundation the viewer should build on. Key
exports:

- `Library.fromDirectory(path)` -- scans a directory, parses all cards, builds
  the edge graph. Returns a `Library` instance.
- `Library.toDict()` -- serializes to `LibraryDict` with card count, edge count,
  broken links, orphans, type/layer distribution, link density, and per-card
  metadata. This is the dashboard data source.
- `Library.neighbors(cardName, hops, direction)` -- BFS traversal from a card.
  Useful for rendering "related cards" in the viewer.
- `Library.orphans()` -- cards with no resolved incoming or outgoing edges.
- `Library.brokenLinks()` -- edges where the target card does not exist.
- `Library.cardsByType(type)` / `Library.cardsByLayer(layer)` -- filtered
  card lists.
- `Card` class -- `path`, `cardName`, `cardType`, `cardLabel`, `layer`,
  `sections` (Map of canonical name to content), `allLinks` (WikiLink array),
  `rawContent`, `totalWordCount`, `linkCount`, `missingSections`.
- `WikiLink` interface -- `target`, `targetType`, `targetName`, `context`,
  `sourceSection`.
- `WIKILINK_RE` (`/\[\[([^\]]+)\]\]/g`) -- the regex for extracting wikilinks.
  The viewer's markdown renderer must use this same pattern to convert wikilinks
  to clickable links.
- `KNOWN_TYPES` -- the canonical set of 18+ card types.
- `LAYER_FOLDERS` -- maps folder names to layer identifiers (rationale, product,
  experience, temporal, releases, sources).
- `SKIP_FILES` -- files the scanner ignores (README.md, CONVENTIONS.md, etc.).

The graph parser already handles the full pipeline: scan directories, parse H1
titles, split by H2 sections, extract wikilinks with context, detect layers from
folder paths, build directed edges, compute broken/orphan/bidirectional metrics.
The viewer should import and use this directly rather than reimplementing.

### CLI Wrapper Pattern (`bin/`)

Every Alexandria CLI tool follows the same wrapper pattern:

1. A bash script in `bin/` (e.g., `bin/alxndr dag`) resolves symlinks to
   find `SCRIPT_DIR`.
2. Sources `bin/_alexandria-wrapper-lib.sh` for shared helpers.
3. Calls `alexandria_exec "$SCRIPT_DIR" "<output-name>" "<source-relpath>" "$@"`.
4. `alexandria_exec` prefers a compiled binary at `$compiled_dir/<output-name>`,
   falls back to `bun run $plugin_root/<source-relpath>`.

A new `bin/alexandria-viewer` (or `bin/alexandria-serve`) script should follow
this pattern, calling a TypeScript entry point that handles site generation and
serving.

### Aesthetic Direction (from `sources/aesthetic-goals.md`)

Five pairs define the aesthetic:

1. **Crisp, not chaotic** -- Scannable. Tables, not paragraphs. Clean output
   formats.
2. **Orderly, not wild** -- Disciplined, like Navy SEALs. Purpose and sequence
   maintained.
3. **Collegial, not emergent** -- Consistent team execution. No surprises. "A
   well-run franchise."
4. **Swift, not surprising** -- Fast feedback. Predictable process. No emergent
   invention.
5. **Professional, not daffy** -- Personality serves legibility, not
   entertainment.

The north star: **"A well-run franchise."** The viewer should feel like walking
into a well-organized library -- clean, quiet, purposeful. Visual design should
emphasize clarity and navigability over visual flair.

### Implementation Plans Structure

Plans live at `docs/alexandria/implementation-plans/<name>/` and contain:

- `release.md` -- release definition with YAML frontmatter (title, status,
  scope tier)
- `library-updates.md` -- library cards to create/update as part of this work
- `outcomes/O-*.md` -- outcome definitions with acceptance criteria
- `tickets/FEAT-*.md` or `tickets/<PREFIX>-*.md` -- individual work items
- `CONTEXT_BRIEFING.md` -- Bridget's briefing for the implementation (optional)

The Plans section of the viewer should render this hierarchy, showing plan
status, outcome completion, and ticket state.
