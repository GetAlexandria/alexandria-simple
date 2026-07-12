# Type Claim Taxonomy

## Status: In Progress

Working session 2026-04-25. Discussion that started as scoreboard cleanup
(PR #87) opened up a deeper architectural conversation about how cards bind
to knowledge areas, why the current matcher table is fundamentally wrong,
and what kind of claims each of the 21 canonical card types actually makes.

This plan reifies the taxonomy work into the library so it stops living in
chat logs and code comments.

## What This Plan Reifies

Three intertwined threads from the conversation:

1. **The 21 card types each make ONE kind of claim.** Type isn't a category
   of *content*, it's a category of *claim-shape*. That distinction is the
   discriminator that unblocks several other problems.

2. **Cards should self-declare their knowledge area in YAML frontmatter**,
   not be matched into areas by filename/keyword heuristics. The current
   matcher table in `packages/ax/src/tools/scoreboard-derive-matchers.ts`
   systematically misfiles ~5/24 cards we sampled (every Principle and
   Standard gets forced into area 1.2).

3. **Area↔type binding belongs in config, not code.** Once cards self-declare
   `area:` and `type:` in frontmatter, the matcher-table model collapses.
   Per-library `alexandria-config.json` becomes the canonical place to
   define areas (with optional suggested types). Custom areas become
   trivially expressible without editing typed code.

## Background: How We Got Here

### Starting point — PR #87 (scoreboard cleanup)

Three field-hardening tickets: FEAT-076 (reconcile KNOWN_TYPES), FEAT-077
(orphan audit), FEAT-078 (clean-slate matchers). Removed 8 orphan type
strings (Anti-Pattern, Competitive Analysis, Market Requirements, Noun
Vocabulary, Product Entities, Product Vision, Roadmap, User Personas) from
the matcher table. Added a canary test that fails if any matcher references
a non-canonical type. Verified against `../alexandria-st` and `../lifebuild`
that the collapse direction matches the latest taxonomy thinking.

### The architectural questions that surfaced

After cleaning up matchers, the user pushed on the design itself:

- Why does the scoreboard rely on filename prefixes for type detection?
- Why is completeness measured by file presence rather than card quality
  (Conan grades)?
- Why is the area↔type binding hidden in typed code rather than declared
  in config?

The answer to all three: **it's legacy from before frontmatter existed as
a typing surface.** Beadification (`docs/design/beadification-plan.md`)
already plans to introduce typed YAML frontmatter. This plan extends that
to areas as well.

### The Card → Area → Type relationship

Worked through cardinality with 24 real cards from the library. Findings:

- **One primary area per card** holds up cleanly. ~17/24 are dead-clear
  single-area assignments.
- **Multi-area cross-references belong as graph edges**, not as area
  membership. (A pricing memo informing both C2.1 and C4.1 should be one
  card with `informs:` edges, or two cards.)
- **Cards self-declare both type and area** in frontmatter; lint validates.
- **Areas don't constrain types** in the schema; areas can optionally list
  `suggested_types` for soft authoring guidance.

### The Primitive/Template/Artifact fuzz

The hardest distinction in the type vocabulary. Three plausible classifications
exist for most product nouns. The library's own tension:
`Template - Card` and `Artifact - Library Card` both exist, describing the
same noun. Raven sharpened the test:

- **Primitive** — claim about *ontology* ("X exists as an irreducible kind")
- **Template** — claim about *production* ("when you make an X, here is the
  shape it takes")
- **Artifact** — claim about *circulation* ("X is a document that plays role
  R in workflow W")

Extended that test to all 21 types, Conan audited (caught 5 issues — Domain
& Section needed navigability framing, Governance was wrong-register,
System needed the invisibility gate, Prompt needed scope tightening to
Agent only). Result: a 21-row claim table organized by layer with within-layer
information flow.

## The 21-Row Claim Table

Final, Conan-audited, information-flow-ordered:

```
RATIONALE: belief → stance → threshold
1. Product Thesis    — strategic belief: "We believe X is true about the market/product/world."
2. Principle         — normative stance: "We hold that X is how we operate."
3. Standard          — normative threshold: "To count as good, X must meet these criteria."

PRODUCT: where → what → how built → how it acts
4. Domain            — navigational container (top): "X is a top-level workspace builders navigate to."
5. Section           — navigational container (nested): "X is a navigable subdivision within a Domain."
6. Governance        — cross-domain presence: "X is a persistent element visible across all Domains."
7. Primitive         — ontology (atom): "X is an irreducible noun in this system."
8. Template          — production: "When you make an X, here is the shape it takes."
9. Component         — production (sub-shape): "X is a structural part of a Template."
10. Artifact         — circulation: "X is a document that plays role R in workflow W."
11. System           — invisible mechanism: "X is a mechanism that operates on the product — builders don't consciously invoke it."
12. Agent            — behavioral actor: "X is an actor with a role and verbs."
13. Prompt           — agent implementation: "X is the instruction set that implements an Agent's behavior."
14. Capability       — behavioral skill: "X is a skill the system can perform."

EXPERIENCE: target → pressure → unit → arc
15. Experience Goal  — quality target: "When using the product, X should feel true."
16. Force            — dynamic pressure: "X is a pressure that shapes how the system evolves."
17. Loop             — recurring cycle: "X is a cycle that repeats with a clear trigger and outcome."
18. Journey          — temporal arc: "X is a path composed of Loops, traversed over time."

TEMPORAL: past → present → future
19. Decision         — settled past choice: "On date D, we chose X over Y because Z."
20. Initiative       — active commitment: "We are doing X now, until done."
21. Future           — anticipated state: "We expect X to become true by horizon H."
```

**Cross-layer flow**: rationale (why) → product (what) → experience (how-feels)
→ temporal (when). A Thesis implies Principles grounded by Standards. Those
shape the Product. The Product produces an Experience. The Experience unfolds
in time.

## The Reification Plan

Per Raven's recommendation: three cards plus two fixes, shipped together.

### New cards

1. **`Principle - Each Card Type Makes One Kind of Claim`**
   The normative stance. Types categorize claim-shape, not content.
   Stable; rarely edited.

2. **`Standard - Type Claim Test`**
   The testable threshold. The 21 sentences become the rubric. Used by
   Conan during card audits and by Sam during card construction. Will
   evolve as edge cases emerge.

3. **`Primitive - Card`**
   Currently missing. Card is the irreducible noun of Alexandria; not
   having a Primitive card for it is the kind of self-referential gap the
   new Standard catches.

### Updates

4. **Update `Artifact - Type Taxonomy`**
   Keep as the descriptive reference (the layered table, the ordering, the
   meta-stack). Cite the Principle and Standard rather than re-litigate.

### Deletions

5. **Delete `Artifact - Library Card`**
   Duplicates `Template - Card`. "Library Card" isn't a separate workflow
   role — just Card-in-its-native-habitat. Once `Primitive - Card` exists,
   `Template - Card` narrows to production-shape, `Artifact - Library Card`
   becomes redundant.

## Out of Scope (But Connected)

The conversation surfaced several larger architectural threads that need
their own plans / decisions:

### Beadification (existing plan)

`docs/design/beadification-plan.md` already covers typed YAML frontmatter,
schema migration, and MCP server. This taxonomy work *feeds into* that
plan: the discriminator test becomes part of the frontmatter schema check.

### Area-binding via frontmatter

Future work: cards declare `area:` in frontmatter, scoreboard groups by
that field directly, matcher tables retire. This is the natural follow-on
to FEAT-079 (the area↔type unification ticket already in the backlog).

### Areas in config

Future work: `alexandria-config.json` becomes the canonical area definition
surface. Per-library `areas[]` entries gain optional `suggested_types: [...]`
for authoring guidance. Custom areas become first-class. The matcher table
in code becomes a *seed* the initialize engine writes into the config when
generating a library, not the runtime source of truth.

### Conan grades in frontmatter, not scoreboard

Future architectural shift the user articulated: Conan should write grades
into each card's YAML frontmatter (with a timestamp), and the scoreboard
should read those grades rather than count file presence. This makes the
scoreboard quality-weighted instead of presence-weighted.

A drift-lint check would compare card frontmatter (`type:`, `area:`) against
filename and folder, surfacing mismatches.

### Dissolve manifest.md into composable CLI tools

`docs/alexandria/manifest.md` is currently a hand-maintained inventory:
expected cards, classification rationale, Status (Missing/Built/Retired),
section headcounts ("Standards (10)", "Principles (17)"), and a
hand-tracked Summary table totaling expected-vs-existing.

Two production readers parse it programmatically:

- `ax lint` Sweep 4 (`packages/ax/src/tools/lint-manifest.ts`,
  `lint-core.ts`) — emits `sweep4.manifest_missing_on_disk`,
  `manifest_missing_on_manifest`, and `manifest_cross_reference` by
  table-scraping every `manifest*.md` file.
- `ax health-check` (`packages/ax/src/tools/health-check.ts`) — uses
  parsed manifest cards as `expectation_source: "inventory_manifests"`
  to score completeness.

The brittleness is mechanical: adding three cards in this PR required
hand-editing two section headers, adding a new section, and updating
the Summary table — purely so the lint and health-check readers stay
honest. Status, headcounts, and the Summary are 100% derivable from
`ls` + frontmatter once cards self-declare `type:` and `area:`.

#### The endgame: no manifest file at all

Don't render the manifest as a single document. Instead, **delete
`manifest.md` and replace it with composable CLI subcommands** that
Conan (the only consumer) is taught to use when he needs a particular
slice. The "manifest" becomes a virtual thing — assembled in Conan's
context on demand, never serialized to disk as a single artifact.

This pairs naturally with the "Conan grades in frontmatter" thread
above and the "areas in config" thread — same direction of travel:
move ground truth onto the cards themselves and into config, treat
any rendered overview as a transient view.

#### Guiding principle

**Code does the manual work, LLMs do the judgment, the judgment gets
stored.** Every column in the manifest today is either a fact
computable from the filesystem (status, count, type bucket) or a
judgment a human/LLM made once and wrote down (classification
rationale, dependency edges, conformance claims). The current file
mashes both together and re-derives the computable parts by hand on
every edit. The future shape separates them: facts become a
deterministic schema; judgments become typed frontmatter fields
written once and queried forever.

#### Section-by-section breakdown

Walking the current `manifest.md` top to bottom and asking, for each
section: derivable, editorial-but-storable, or drop?

##### 1. Header (lines 1–14)

Source files, date, "Configuration: Factory × High Novelty × High
Complexity", covered/deferred areas.

- Doesn't belong in the manifest at all. This is *library
  configuration*, already the wizard's domain. Already in
  `alexandria-config.json` (or moves there).
- Surface via `ax config show`.

##### 2. Expected Cards — typed sections (lines 18–292)

Per row: `Card | Source | Status | Classification Rationale | (Parent | Flag)`.
Section headers carry counts (`### Standards (10)`).

| Column | Source | Frontmatter need |
|---|---|---|
| Card name | filename | — |
| Type bucket / section | filename prefix or folder | optional `type:` for safety |
| Status (Built / Retired) | file existence + explicit retire flag | `status: retired` only |
| Status (Missing) | absence from disk + presence in config seed | config entry |
| Source | not on filesystem | `source: [path#section, ...]` |
| Classification Rationale | judgment | `classification_rationale: ...` |
| Parent (Components only) | judgment | `parent: Structure - Card` |
| Section count "(10)" | computed | groupBy(type) |

"Missing" cards have no file to carry frontmatter, so the
expected-card list lives as a `expected_cards: [...]` field inside
`alexandria-config.json` — same schema as built-card frontmatter.
Avoids adding a new file (`manifest-seed.yaml` was an earlier draft
of this idea; folding it into the existing config keeps surfaces flat).

Surface via `ax cards list [--type <T>] [--area <A>] [--status <S>]`.

##### 3. Enumeration Decisions (lines 296–306)

"User Assumptions: 7 rules → one card. Why: ..."

- Each row *is* a Decision. Promote each into its own first-class
  `Decision - <Topic>` card (Decision is now a canonical type).
- Surface via `ax cards list --type Decision`.

##### 4. Conformance Map (lines 312–322)

`Standard → constrains [card list]`.

- **Derivable** from frontmatter on each Standard card:
  `constrains: [Card - A, Card - B]`. (Or invert: each constrained
  card declares `conforms_to: [Standard - X]`. Centralizing on the
  Standard side is denser.)
- The Standard cards' WHERE sections already mention these
  relationships informally — formalizing into frontmatter makes them
  queryable and lint-checkable.
- Surface via `ax conformance show [--standard <S>]`.

##### 5. Build Order — Phases 1–8 (lines 326–461)

Per row: `Order | Card | Depends On | Rationale`.

- **Derivable as a topological sort** over a `depends_on:` DAG declared
  on each card. "Phase 1: Standards" emerges naturally — it's the
  layer with no upstream dependencies.
- Per-row rationale is optional: usually the DAG is self-explanatory.
  Where it isn't, add `build_order_rationale:` on the card.
- Surface via `ax dag build-order` (the existing `ax dag` tool likely
  already does most of this).

##### 6. Summary (lines 467–502)

Count table, total, Existing/Missing tallies.

- **100% derivable**: `groupBy(type, status)` over disk + config.
- Surface via `ax cards count` or fold into `ax cards list --summary`.

##### 7. Flags — HUMAN JUDGMENT NEEDED & BUILD_TO_LEARN (lines 508–540)

| Sub-section | Approach |
|---|---|
| HUMAN JUDGMENT NEEDED | Each item is an open Decision. Promote to its own `Decision` card with `status: open` (or a `Future - <Resolution>` card). Surface via `ax cards list --type Decision --status open`. |
| BUILD_TO_LEARN | **Cut.** Not pulling its weight; meaning is unclear. Drop the flag and the section entirely. |

##### 8. Completion Status (lines 544–552)

"DONE_WITH_CONCERNS" + concerns list.

- **Cut from the manifest now.** Eventual home is the **Ledger** —
  a future shared data layer for cross-library run state, grades,
  and event records. Out of scope for this plan; a Ledger card or
  ADR will define it when the time comes.

#### Anti-patterns are not a card type

Resolving Open Question 2 (below): **Anti-Pattern is not a canonical
type and should not be reintroduced.** Any "anti-pattern" content can
be expressed as the negatively-stated form of an existing type:

- "Don't let agents translate emergently" → `Principle - Agents Stay
  in Lane` (stated normatively).
- "Reject compensatory pool expansion" → `Decision - Reject
  Compensatory Pool Expansion` (a settled choice with rejected
  alternative).
- "Mock/prod divergence masks bugs" → `Standard - Integration Tests
  Hit Real Database` (testable threshold).

The 6 existing `Artifact - Anti-Pattern: ...` cards in the manifest
need rehoming. Most read as Principles (state the rule normatively)
or Decisions (record the rejection of a specific approach). Migration
debt for the next sweep.

#### Frontmatter schema this implies

Per built card:

```yaml
type: Standard                    # already planned
area: 1.1                         # already planned
status: built                     # built | retired
source: [sources/usability-standards.md#Progressive Disclosure]
classification_rationale: |
  Numbered tier structure (1/2/3) with defined boundaries. Testable.
depends_on: [Product Thesis - Better Context]
constrains: [Capability - Context Assembly, Capability - Card Building]
parent: Structure - Card          # Components only
flags: [human_judgment_needed]    # optional
```

Per `alexandria-config.json` (new field):

```json
{
  "expected_cards": [
    {
      "name": "Standard - Hit Print Minimum",
      "type": "Standard",
      "area": "1.1",
      "source": ["sources/usability-standards.md#Hit Print"],
      "classification_rationale": "Minimum viable output spec..."
    }
  ]
}
```

#### What Conan does after migration

Conan is taught the toolset and composes queries on demand instead of
consulting a static document:

| Need | Tool |
|---|---|
| What's expected vs. built? | `ax cards list --status missing` |
| What does a Standard constrain? | `ax conformance show --standard <S>` |
| What's the build order? | `ax dag build-order` |
| What's open as a Decision? | `ax cards list --type Decision --status open` |
| What does config say? | `ax config show` |
| Who depends on this card? | `ax dag dependents <Card>` |

Lint Sweep 4 and `ax health-check` stop being manifest-parsers. They
read `alexandria-config.json` for expected-card seed and walk the
filesystem for actual cards. The `manifest*.md` regex in
`lint-manifest.ts` is deleted; the file `parseInventoryManifests`
function dissolves.

#### What stays editorial

After the migration, the only *manually-written prose* is:

- The `classification_rationale` strings (in config for expected
  cards; in frontmatter for built ones).
- The body of any Decision card promoted from Enumeration Decisions
  or HUMAN JUDGMENT NEEDED.

Everything else — counts, tables, totals, dependency phases, the
conformance map, the manifest *file itself* — is gone or generated.
That's the win: the human/LLM judges once, writes the judgment into
a typed slot, and the slot is queryable forever.

### Plugin templates folder rename

Minor: `packages/alexandria-plugin/templates/` competes semantically with
the Template card type. Rename to `scaffolds/` (or `init-files/`) to stop
the conflation. Defer until a natural breaking change.

## Migration Debt

Conan's audit during this session also surfaced these violators that should
be addressed in the same change as reification:

- `Artifact - Library Card` → deleted (above)
- `Primitive - Card` → created (above)

Conan's recommendation for further drift: don't do a manual sweep before
reifying. Land the Standard, then run a focused Conan audit pass with the
new rubric. That's the sweep, automated and rubric-driven.

## Open Questions

1. **Is Card actually a Primitive?** Raven's pushback: maybe the true
   primitives of the system are coarser (Knowledge Unit, Workflow Step,
   Relationship). **Punt** — keep `Primitive - Card` as-is for now;
   refactor Card into smaller primitives later if/when the need surfaces.

2. ~~**Anti-Pattern as type?**~~ **Resolved: no.** Anti-Pattern is not a
   canonical type. Any "anti-pattern" content can be expressed as the
   negatively-stated form of an existing type — most fit as Principles
   (state the rule normatively) or Decisions (record rejection of an
   alternative). The 6 existing `Artifact - Anti-Pattern: ...` cards in
   the manifest need rehoming. See "Anti-patterns are not a card type"
   above.

3. **Should areas constrain types in schema?** Current recommendation: no,
   `suggested_types` only. But some types (Domain, Journey, Experience Goal)
   are area-locked in practice. Worth revisiting once frontmatter `area:`
   ships.

## Related

- PR #87 (scoreboard cleanup) — shipped the matcher orphan removal
- FEAT-079 (backlog) — area↔type unification ticket
- `docs/design/beadification-plan.md` — typed frontmatter migration
- `docs/design/system-story.md` — system-level architecture
- `Artifact - Type Taxonomy` (existing) — the document this updates
