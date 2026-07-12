---
type: System
prefLabel: Indexing Pipeline
altLabels:
  - Codebase Indexer
  - Index Builder
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/context/codebase-indexing
---

# Indexing Pipeline

## WHAT: Definition

_Stub — the pipeline that processes the Workspace's files into the semantic Index used by Semantic Search. The Indexing Pipeline chunks files, embeds them, and stores the embeddings so that retrieval queries can find relevant code by meaning. The pipeline runs on first Index build and re-runs incrementally as files change. It is not user-visible; the Developer sees only the Index entity and the "Index codebase" action._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Index]] (the artifact the Indexing Pipeline produces), [[Entity - File]] (Files are the input to the pipeline), [[Entity - Workspace]] (the pipeline is scoped to the Workspace), [[Capability - Semantic Search]] (the capability the Index enables after the pipeline has run)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: embedding model used, chunking strategy, re-index triggers (file save, git pull), `.cursorignore` exclusion processing, and the storage location of index artifacts (local vs cloud)._
