# Context Briefing

## Task Frame

**Task:** Build manifest-dissolution Slice 1 — add frontmatter fields to library cards
(`status`, `source`, `classification_rationale`), add `expected_cards: [...]` to
`alexandria-config.json`, implement `ax cards list` CLI subcommand with `--status`,
`--type`, `--area` flags and `--json` output, and apply frontmatter to the 3 cards from
PR #88.

**Target type:** Capability (new composable inventory tool that operates on the Knowledge
Graph and reads the Card primitive)

**Task type:** feature (new behavior added to an existing CLI system; the card primitive
and graph machinery already exist)

**Constraints:**
- Do NOT parse `manifest.md` in the new tool. The new tool reads frontmatter from cards
  on disk and `expected_cards` from `alexandria-config.json`. `lint-manifest.ts` and
  `health-check.ts` are out of scope for Slice 1 — leave them untouched.
- Do NOT bind the new schema to the legacy manifest shape. The two data sources
  (built cards via frontmatter, missing cards via config) are joined on card name in
  the CLI; they are not normalized against the manifest's table structure.
- Do NOT assume `type:` and `area:` frontmatter fields exist yet. The three fields
  being introduced in Slice 1 are `status`, `source`, and `classification_rationale`.
  `type:` and `area:` belong to the beadification thread and may or may not be present;
  the new tool must degrade gracefully when they are absent.
- Slice 1 does not delete or modify `manifest.md`.
- `expected_cards` in config uses the same schema as built-card frontmatter (the
  plan.md schema is authoritative — see below).

**Acceptance criteria:**
1. `ax cards list --status built` returns the 3 built cards from PR #88 (read from
   frontmatter).
2. `ax cards list --status missing` returns the hand-authored expected-but-unbuilt cards
   from `expected_cards` in `alexandria-config.json`.
3. Flags `--type <T>` and `--area <A>` filter both sources.
4. `--json` outputs machine-readable JSON; default output is a human-readable table.
5. Frontmatter applied to `Primitive - Card`, `Principle - Each Card Type Makes One Kind
   of Claim`, and `Standard - Type Claim Test` with `status: built`, `source: [...]`,
   and `classification_rationale: ...`.
6. `bun run check` and `bun test` pass.

---

## Primary Cards (full content)

### Primitive - Card

**Type:** Primitive
**Relevance:** The Card primitive is the data entity the new `ax cards list` tool
inventories. Understanding what makes something a Card — the five-section structure,
the `Type - Name.md` naming convention, placement in the typed folder — is what the
tool's card-discovery logic must implement. The HOW section's "What Makes Something a
Card" is the detection algorithm.

> **WHAT:** A Card is the irreducible noun of the Alexandria library — the atomic
> knowledge unit from which every other construct is made. A Card exists as a *kind*
> before any structure is imposed on it: it is a bounded piece of knowledge that makes
> exactly one claim, has a type, carries a name, and is connected to other Cards through
> explicit relationships.
>
> **WHERE:**
> - Production shape: [[Template - Card]] — five-section structure (WHAT/WHERE/WHY/WHEN/HOW)
> - Contained by: [[Section - Card Repository]] — the typed-folder filesystem realization
> - Forms nodes in: [[System - Knowledge Graph]] — Cards are nodes; wikilinks are edges
> - Constrained by: [[Standard - Five-Dimension Card Requirements]]
> - Governed alongside: [[Principle - One Concept Per Card]]
>
> **WHY:** [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]]
> — the library's power as an AI retrieval surface depends on Cards being discrete, typed,
> and connected. Without a Card primitive, the library is a folder of files with no unit
> of composition.
>
> **WHEN:** Card concept established at product design. `Primitive - Card` created
> 2026-04-25 to fill a self-referential gap. Stability: **Stable** (Card as irreducible
> noun); **Evolving** (encoding — current Markdown with five H2 sections may shift as
> beadification progresses).
>
> **HOW — What Makes Something a Card:**
> 1. Filename following `Type - Name.md` convention
> 2. Type from the 21-type taxonomy
> 3. Encodes exactly one claim
> 4. Placed in the folder corresponding to its type
> 5. Has five H2 sections (WHAT, WHERE, WHY, WHEN, HOW)
> 6. Connects to other Cards via wikilinks with context phrases
>
> Card vs. Its Descriptions:
> | Card | Claim-Kind | Claim |
> |------|------------|-------|
> | `Primitive - Card` | Ontology | Card exists as an irreducible noun |
> | `Template - Card` | Production | When you make a card, here is its five-section shape |
>
> **Anti-examples:**
> - A Card encoding two claims — must be split.
> - A markdown file (README, plan doc) without the five-section structure — not a Card.

---

### Standard - Type Claim Test

**Type:** Standard
**Relevance:** Slice 1 applies frontmatter to the three cards from PR #88. The
`classification_rationale` field is the prose justification produced by applying this
test. The implementer must apply the test to each of the three cards when writing their
`classification_rationale` strings.

> **WHAT:** The Type Claim Test is the 21-row rubric for verifying a card is correctly
> typed. A card is well-typed when (1) its content summarized in one sentence matches
> exactly one of the 21 canonical claim-sentences, and (2) it is assigned the type that
> owns that claim-sentence.
>
> **WHERE:**
> - Implements: [[Principle - Each Card Type Makes One Kind of Claim]]
> - References: [[Artifact - Type Taxonomy]]
> - Conforms alongside: [[Standard - Five-Dimension Card Requirements]]
> - Governs via filename: [[Artifact - Naming Convention]]
>
> **WHY:** [[Principle - Each Card Type Makes One Kind of Claim]] — without a testable
> threshold, type assignment remains subjective. The 21 sentences convert the principle
> into a pass/fail gate any agent can apply.
>
> **WHEN:** Established 2026-04-25. Stability: **Stable** (structure); **Evolving**
> (individual sentences may be refined as edge cases surface).
>
> **HOW — The 21-Row Claim Table (abbreviated):**
> ```
> Product Thesis   — "We believe X is true about the market/product/world."
> Principle        — "We hold that X is how we operate."
> Standard         — "To count as good, X must meet these criteria."
> ...
> Primitive        — "X is an irreducible noun in this system."
> ...
> Capability       — "X is a skill the system can perform."
> ```
> Full table in the card at `docs/alexandria/library/rationale/standards/Standard - Type Claim Test.md`.
>
> Applying the test: (1) summarize the card's core assertion in one sentence; (2) scan
> the 21 claim-sentences for a clean match; (3) one clean match → type is correct; zero
> matches → flag; two or more matches → split the card.

---

### Principle - Each Card Type Makes One Kind of Claim

**Type:** Principle
**Relevance:** This principle is the WHY behind the `classification_rationale` frontmatter
field and behind the type-aware filtering in `ax cards list --type <T>`. Understanding
that type categorizes claim-shape (not content) is critical for writing correct
`classification_rationale` strings and for reasoning about what `--type` filtering means.

> **WHAT:** Card types categorize *claim-shape*, not content topic. Every one of the 21
> canonical types makes exactly one kind of claim. The same noun can legitimately appear
> under multiple card types (e.g., `Primitive - Card` and `Template - Card`) because
> each makes a *different* claim about that noun. Type assignment is determined by asking
> "what kind of claim does this card make?" — not "what subject does it describe?"
>
> **WHERE:**
> - Operationalized by: [[Standard - Type Claim Test]]
> - Illustrated by: [[Artifact - Type Taxonomy]]
> - Constrained alongside: [[Standard - Five-Dimension Card Requirements]]
> - Governs: [[Template - Card]], [[Primitive - Card]]
>
> **WHY:** [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]]
> — a typed knowledge graph is only as strong as the precision of its types. Conflating
> claim-kinds produces ambiguous nodes that retrieval profiles cannot discriminate.
>
> **WHEN:** Established 2026-04-25. Stability: **Stable** (the insight); **Evolving**
> (individual claim sentences in the Standard may be refined).
>
> **HOW — Discriminator Test:** State the card's core assertion as one sentence and ask:
> which of the 21 claim-sentences from Standard - Type Claim Test does it match cleanly?
> That answer is the type.
>
> **Anti-examples:**
> - Typing by subject: classifying an "irreducible noun" card as Artifact because it
>   describes a document-like thing — wrong, the claim drives the type.
> - Treating type ambiguity as a content problem: if two claim-sentences fit, split the
>   card; don't add content until one "feels right."

---

### System - Knowledge Graph

**Type:** System
**Relevance:** `ax cards list` operates on the Knowledge Graph. Cards are nodes; the tool
discovers them by walking the filesystem (the graph's storage layer). The graph's typed
node structure (`Type - Name.md` filenames, typed folders) is the detection surface the
new tool walks. The HOW section explains why type is encoded in filename and folder — the
implementer must use `lib/graph.ts`'s existing `CARD_NAME_RE`, `KNOWN_TYPES`, and
`Library` class rather than re-implementing card detection.

> **WHAT:** The Knowledge Graph is the typed, wikilink-connected graph structure underlying
> all library operations. Cards are nodes; wikilinks (`[[Type - Name]]`) are edges. Builders
> interact with cards, not the graph — the graph is invisible infrastructure that makes
> retrieval, assembly, cascade analysis, and blast radius calculations possible. Stored as
> markdown files in a folder structure that encodes the type taxonomy.
>
> **WHERE:**
> - Conforms to: [[Standard - Five-Dimension Card Requirements]]
> - Depends on: [[Principle - One Concept Per Card]]
> - Consumed by: [[System - Retrieval and Assembly Engine]], [[System - Quality Grading Engine]],
>   [[System - Gap Analysis Engine]], [[Capability - Grading]], [[Capability - Health Check]],
>   [[Agent - Conan the Librarian]], `ax lint` CLI
>
> **WHY:** [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]]
> — typed, linked, machine-traversable knowledge serves AI builders better than narrative
> documents. Without a graph structure, blast radius is invisible and cascade analysis
> cannot exist.
>
> **HOW — Graph Properties:**
> - **Nodes** are cards, typed by the taxonomy. Type is encoded in filename prefix and
>   folder path.
> - **Edges** are wikilinks with context phrases.
> - **Traversal depth** varies by node type: leaf = 1 hop, mid-graph = 2 hops, hub = 3 hops.
>
> The storage format (current: Markdown files) is an implementation detail separable from
> the graph abstraction. The graph abstraction — typed nodes, typed edges, directional
> traversal — is stable.

---

### Capability - Inventory

**Type:** Capability
**Relevance:** `ax cards list` is the composable successor to the current Inventory
capability. Understanding what Inventory does today (produce a manifest, bind Sam and
Conan) and how its output is consumed by health-check and linting tells the implementer
what the new tool must preserve and what it can simplify. Notably: the current Inventory
capability produces `manifest.md`; the Slice 1 goal is to make that production unnecessary
by making the same data queryable from frontmatter + config.

> **WHAT:** Inventory is the capability where Conan reads assessed source material and
> produces a manifest of every card that should exist in the library. The manifest
> specifies each card's type, source reference, build order, and classification rationale.
> It is the contract between agents: Sam builds to this manifest, Conan grades against it.
>
> **WHERE:**
> - Performed in: [[Domain - Library Interior]], [[Section - Source Material]]
> - Operated by: [[Agent - Conan the Librarian]]
> - Populates: [[System - Knowledge Graph]], [[System - Wizard Configuration Engine]]
> - Related: [[Capability - Source Assessment]], [[Capability - Card Building]]
>
> **WHY:** [[Product Thesis - Better Context Produces Better Agent Output]] — the inventory
> determines what the library will contain; a well-scoped inventory means the library
> covers the knowledge areas that matter most.
>
> **HOW — Key insight for the implementer:**
> The current inventory capability produces a flat manifest document. Slice 1 moves the
> same data into two machine-readable sources: frontmatter on built cards (`status: built`,
> `source: [...]`, `classification_rationale: ...`) and `expected_cards: [...]` in
> `alexandria-config.json` for expected-but-unbuilt cards. The CLI joins these two sources
> on card name and filters by status/type/area. The guiding principle from the plan:
> *"Code does the manual work, LLMs do the judgment, the judgment gets stored."*

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Standard - Five-Dimension Card Requirements]] | Standard | Every card — including the 3 from PR #88 receiving frontmatter — must satisfy WHAT/WHERE/WHY/WHEN/HOW; the frontmatter fields are additive, not a replacement for the five-section structure. |
| [[Capability - Linting]] | Capability | `lint-manifest.ts` is the current manifest parser (the `layers` sweep 4 target); Slice 1 does NOT modify it. Understanding Sweep 4 shows what the new tool must eventually replace but must not touch yet. |
| [[Capability - Health Check]] | Capability | `health-check.ts` currently reads the manifest via `parseInventoryManifests()`; Slice 1 does not modify this. Its `expectation_source: "inventory_manifests"` interface is the legacy contract that will be replaced in a later slice. |
| [[Section - Card Repository]] | Section | The typed-folder structure where all cards live; this is the filesystem surface `ax cards list` walks to discover built cards. |
| [[System - Gap Analysis Engine]] | System | The existing engine that compares expected vs. actual graph coverage; `ax cards list --status missing` is the composable surface for the same concern. |
| [[Artifact - Type Taxonomy]] | Artifact | Full 21-type taxonomy ordered by information flow; the `--type <T>` filter flag maps to types in this taxonomy. |

---

## Relationship Map

- `ax cards list` operates-on [[Primitive - Card]] (Card is the data entity being inventoried)
- `ax cards list` reads [[System - Knowledge Graph]] storage layer (walks typed folders to discover built cards)
- `ax cards list` reads `alexandria-config.json` `expected_cards` field for missing cards
- `ax cards list` invokes [[Capability - Inventory]] logic (composable successor to manifest-based inventory)
- [[Primitive - Card]] constrained-by [[Standard - Five-Dimension Card Requirements]] (quality contract that built cards must satisfy; frontmatter is additive)
- [[Standard - Type Claim Test]] implements [[Principle - Each Card Type Makes One Kind of Claim]] (operationalizes the principle as the 21-row rubric)
- [[Capability - Linting]] reads `manifest.md` via `lint-manifest.ts` (current manifest parser; Slice 1 does not modify this)
- [[Capability - Health Check]] reads `manifest.md` via `parseInventoryManifests()` (current manifest consumer; Slice 1 does not modify this)
- `packages/ax/src/lib/graph.ts` provides-to `ax cards list` card discovery (`CARD_NAME_RE`, `KNOWN_TYPES`, `Library` class should be reused, not reimplemented)
- `packages/ax/src/cli/main.ts` registers `ax cards` (new `cards` key in `SUBCOMMANDS` record, pointing to a new `runCardsSubcommand` function)

---

## Existing Tooling Reference

The implementer must read these files before starting:

### CLI wiring pattern (`packages/ax/src/cli/main.ts`)

The `SUBCOMMANDS` record maps command names to `{ description, run }` objects. Each
`run` function receives the remainder of `args` after the subcommand name and returns
`CliResult | Promise<CliResult>`. The `ax cards list` subcommand is a two-level
dispatch: `cards` dispatches to a `list` sub-subcommand. The `dag.ts` pattern (a thin
`runDagSubcommand` shim in `src/cli/dag.ts` that delegates to `src/tools/dag.ts`) is
the canonical pattern to follow.

Pattern:
1. Add `cards` to `SUBCOMMANDS` in `main.ts`, pointing to `runCardsSubcommand` imported
   from `./cards.js`
2. Create `packages/ax/src/cli/cards.ts` — parses the `list` sub-subcommand and flags
3. Create `packages/ax/src/tools/cards.ts` — contains the implementation logic

### Card discovery (`packages/ax/src/lib/graph.ts`)

- `CARD_NAME_RE = /^(.+?) - (.+)$/` — use this to detect card filenames
- `KNOWN_TYPES` — the canonical set of valid type strings
- `extractTypeName(cardName)` — parses `[type, name]` from a card name string
- `Library` class — loads and indexes all cards from a library root directory;
  use `new Library(libraryRoot)` rather than rolling your own filesystem walker
- Cards have a `.frontmatter` property (parsed YAML) if the card has a frontmatter
  block; check this library before implementing frontmatter parsing from scratch

### Manifest parser (`packages/ax/src/tools/lint-manifest.ts`)

Do NOT import from or modify this file in Slice 1. It is the current manifest parser that
reads `manifest*.md` files. Understanding its `ParsedManifestCard` interface shows what
the new `expected_cards` schema must provide as a typed alternative. Slice 1 replaces
its *data source* (config JSON vs. markdown table), not its sweep logic.

### Config shape (`docs/alexandria/alexandria-config.json`)

Extend with a top-level `expected_cards: [...]` field. Schema per each entry (from
`plan.md`):
```json
{
  "name": "Standard - Hit Print Minimum",
  "type": "Standard",
  "area": "1.1",
  "source": ["sources/usability-standards.md#Hit Print"],
  "classification_rationale": "Minimum viable output spec..."
}
```
Hand-author 5–10 entries spanning Standards and at least one other type. These entries
are the demo seed for `ax cards list --status missing`.

### Frontmatter schema for built cards

Add YAML frontmatter to the 3 PR #88 cards:
```yaml
---
status: built
source:
  - docs/alexandria/plans/_archive/type-claim-taxonomy/plan.md#The Reification Plan
classification_rationale: |
  [one-sentence claim test result]
---
```
`type:` and `area:` may be omitted from Slice 1 (they belong to the beadification thread)
or included if already planned — but `ax cards list` must not crash when they are absent.

---

## External Context — Required Reading

**The implementer must read this section before starting implementation:**

`docs/alexandria/plans/_archive/type-claim-taxonomy/plan.md` — specifically:
- **"Dissolve manifest.md into composable CLI tools"** — the architectural argument for
  why `manifest.md` is being dissolved and what replaces each section.
- **"Section-by-section breakdown"** — walking the current `manifest.md` top-to-bottom
  and mapping each section to its composable replacement.
- **"Frontmatter schema this implies"** — the exact schema for built-card frontmatter
  and the `expected_cards` config field.
- **"What Conan does after migration"** — the toolset Conan will use; `ax cards list` is
  the first entry in that toolset.

The guiding principle from the plan: *"Code does the manual work, LLMs do the judgment,
the judgment gets stored."* Every column in the current manifest is either (a) a fact
computable from the filesystem (type, count, status) or (b) a judgment written once
(`classification_rationale`). The new schema separates these two categories cleanly.

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| WHAT | Library card for `Capability - Cards List` or `System - Inventory CLI` | yes | no | No card exists for the new `ax cards list` tool. Expected — this is a new capability being built. Sam should create it post-implementation. |
| HOW | Frontmatter schema contract for library cards (beyond YAML being planned) | yes | partial | `Primitive - Card` mentions beadification will introduce typed YAML frontmatter; the exact schema for `status`/`source`/`classification_rationale` is only in `plan.md`. No library card declares this schema. A card describing the frontmatter schema (possibly `Standard - Card Frontmatter Schema`) is a gap for Sam to fill. |
| HOW | `ax cards list` CLI contract (flags, output format, JSON shape) | yes | no | No library card describes the CLI interface contract. The CLI convention is implicit in `main.ts` source. Consider a card or ADR once Slice 1 ships. |
| WHERE | Relationship between `alexandria-config.json` and the Knowledge Graph | yes | partial | `alexandria-config.json` sits in the toolchain but has no library card. The config is referenced in `Capability - Inventory` and `System - Wizard Configuration Engine` but its role as the `expected_cards` seed is undocumented. |
| WHEN | `ax health-check` and `lint-manifest.ts` transition timeline | yes | no | The plan says Slice 2 will update these consumers, but no library card captures the transition commitment or timeline. This is expected — it is future work. |
| WHY | Product Thesis link for the manifest-dissolution architecture | yes | partial | The plan articulates the WHY well (code does computable work, LLMs store judgment). This rationale is not yet a library card. `Artifact - Decision 34: DAG Computation Is Software Not LLM` is the closest analogue but covers DAG specifically. A `Decision - Dissolve Manifest Into CLI Tools` card would capture this settled architectural choice. |

---

## Anti-Patterns to Avoid

1. **Do not parse `manifest.md` in the new tool.** `ax cards list` reads frontmatter from
   card files and `expected_cards` from config. `lint-manifest.ts` is not a model to
   follow — it is the legacy parser being replaced in future slices.

2. **Do not bind the `expected_cards` schema to the manifest table shape.** The manifest
   table has columns (Card, Source, Status, Classification Rationale) that happen to
   align with the new schema fields — but the new schema is designed for JSON config, not
   Markdown table scraping. Do not import or extend `ParsedManifestCard`.

3. **Do not assume `type:` or `area:` frontmatter exists.** Slice 1 only introduces
   `status`, `source`, and `classification_rationale`. When filtering with `--type <T>`,
   the tool must fall back to parsing the type from the filename prefix (using
   `CARD_NAME_RE` / `extractTypeName`) when `type:` frontmatter is absent.

4. **Do not implement your own card filesystem walker.** `lib/graph.ts` has `Library`,
   `CARD_NAME_RE`, and related utilities. Use them.

5. **Do not bulk-migrate the 138 manifest entries into config.** Hand-author 5–10
   `expected_cards` entries as the demo seed. Bulk migration is explicitly out of scope.

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

**Concern:** The library has no cards describing the `ax cards` CLI interface contract,
the card frontmatter schema being introduced, or the dissolution architecture as a settled
Decision. These are expected gaps for a new capability being built — the briefing surfaces
them honestly. The plan doc (`type-claim-taxonomy/plan.md`) contains the authoritative
design; the implementer must read it directly. Sam should create a `Decision - Dissolve
Manifest Into CLI Tools` card and a `Standard - Card Frontmatter Schema` card after
Slice 1 ships, to lock in the architectural choices made here.
