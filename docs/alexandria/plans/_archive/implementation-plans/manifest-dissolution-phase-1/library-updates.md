# Library Updates from Manifest Dissolution Phase 1

Ask Conan to review this list and produce a transient surgery plan for
Sam in the conversation, not as a checked-in file.

| Action | Card | What Changed | Source |
|--------|------|--------------|--------|
| Create | Standard - Card Frontmatter Schema | New Standard documenting the active stored card frontmatter schema and the rule that new fields ship only with writer and reader behavior. Layer is derived from type; `area:` is the primary area binding read by `ax cards list`; provenance/classification fields, status/retirement, and graph edges are deferred to their own horizontal slices. | Step 4 (gap analysis); plan.md lines 365-378; FEAT-096 schema review; FEAT-097 |
| Create | Standard - Graph Edge Schema | New Standard documenting how machine-readable graph edges should capture the full richness of card WHERE sections without flattening them into under-specified fields. Should cover relationship verbs such as Implements, Conforming, Governs, Affects, Contained by, Parent, Depends on, References, and Related; directionality; cardinality; and whether edges live in frontmatter, structured WHERE blocks, or derived indexes. | Schema review during FEAT-096 |
| Create | Artifact - Decision: Dissolve Manifest Into CLI Tools (Phase 1) | New Decision card recording the Phase 1 scope, the Phase 2 deferred list with explicit blockers, the connection to the beads + ledger future, and the rationale for keeping manifest.md narrowed (not deleted). Should enumerate every deferred item from `release.md` so the decision is queryable from the library. Layer: temporal. | Step 4 (gap analysis); release.md Deferred section |
| Update | Capability - Inventory (WHEN) | Record the introduction of `ax cards list`, `ax cards list --json`, `--area`, `ax config show`, `--summary`, `--help`, and the shift from manifest-table reads to CLI for inventory queries. | Step 5 (FEAT-096 through FEAT-099, FEAT-104) |
| Update | Capability - Linting (WHEN) | Record the Sweep 4 inventory-source migration (manifest.md → CLI for the on-disk side); record the new `frontmatter_area_drift` check from FEAT-105. | Step 5 (FEAT-100, FEAT-105) |
| Update | Capability - Health Check (WHEN) | Record the inventory-source migration; note that expectation_source remains `inventory_manifests` for the gap half through Phase 1. | Step 5 (FEAT-101) |
| Update | Agent - Conan (WHEN) | Record the prompt update: Conan now calls `ax cards list`, `ax cards list --summary`, `ax cards list --json`, and `ax config show` for inventory queries. Manifest.md reads narrow to expected-cards and judgment-notes sections. | Step 5 (FEAT-102) |
| Update | Section - Card Repository (WHEN) | Record that cards now self-declare `area:` in frontmatter (FEAT-103); area attribution mechanism shifts from path-based matchers to frontmatter-driven (FEAT-104). | Step 5 (FEAT-103, FEAT-104) |
| Update | Artifact - Type Taxonomy | Note that area-binding shifted from the matcher table to frontmatter `area:`; reference `Standard - Card Frontmatter Schema` for the canonical schema. | Step 5 (FEAT-104) |

## Notes for Conan / Sam

These are requested library updates, not implementation-side writes. During
implementation, changes under `docs/alexandria/library/` must go through Conan's
review and Sam's drafting loop.

The new cards (`Standard - Card Frontmatter Schema`, `Standard - Graph Edge
Schema`, and the Decision card) are Phase 1's primary library deliverables.
They should be drafted early in the execution phase so the rest of the work can
cite them as canonical references.

`Standard - Card Frontmatter Schema` documents the active stored schema, not
computed inventory fields. This is intentional: the schema is the spec for what
belongs on individual cards, and fields become canonical only when writer and
reader behavior exist in the same slice. `area:` is active once FEAT-097's
reader contract and FEAT-103's Conan/Sam population work have both landed. `source` and
`classification_rationale` should be handled by FEAT-107, not backfilled as
parser-only fields.

The Decision card must include the full deferred list verbatim from
`release.md`, with explicit blockers per item. Future planning sessions
will read this card to understand what was punted and why; clarity here
prevents re-deriving the constraints.

WHEN section updates should reference the FEAT IDs (e.g., "FEAT-097
introduced `ax cards list` filters in 2026-04") so the temporal trail is
queryable.
