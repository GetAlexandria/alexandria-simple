---
type: Entity
prefLabel: Index
altLabels:
  - Codebase Index
  - Semantic Index
category: [Entities]
subcategory: [index]
facets: [Mechanisms]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/context/codebase-indexing
---

# Index

## WHAT: Definition

_Stub — the semantic search index built over the Workspace's codebase. The Index enables Cursor to retrieve relevant files and code snippets when the Developer asks questions or the Agent needs context. The Developer can trigger explicit indexing ("Index codebase") and the Index is kept updated as files change._

_Naming-history note: Index is a mechanism-named borderline case within Cursor's otherwise aesthetics-first vocabulary — it names the data structure rather than the felt encounter. It works in this product because "Index" is universally understood in developer-tool contexts (database indexes, search indexes, package indexes) and carries no ambiguity about what the concept does. The families.md MDA-inversion diagnostic does not flag every mechanism-adjacent noun — it flags nouns that require documentation to decode. "Index" decodes immediately for the target audience. This is the correct threshold for a borrowing from technical vocabulary: the term is recognizable without onboarding. Compare with OpenAI's `Vector Store` — same underlying mechanism, but opaque to a developer who hasn't read the docs. "Index" wins by recognizability._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Workspace]] (the Index is scoped to the Workspace), [[System - Indexing Pipeline]] (the pipeline that builds and maintains the Index), [[Capability - Semantic Search]] (the capability the Index backs), [[Entity - File]] (Files are the source material the Index is built from)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: indexing triggers (automatic vs manual), file exclusion rules (.cursorignore), index freshness guarantees, and the retrieval mechanism used during Semantic Search._
