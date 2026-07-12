---
type: Capability
prefLabel: Semantic Search
altLabels:
  - Codebase Search
  - AI Search
category: [Capabilities]
subcategory: [search]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/context/codebase-indexing
---

# Semantic Search

## WHAT: Definition

_Stub — the capability of retrieving relevant code snippets and files from the Workspace by meaning rather than exact text match. The Developer or Agent issues a natural-language query and Cursor retrieves the most relevant sections of the codebase using the Index. Semantic Search is what the Index enables — without a built Index, retrieval falls back to keyword-based approaches._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Index]] (the Index backs Semantic Search), [[System - Indexing Pipeline]] (the pipeline that makes the Index available for retrieval), [[Entity - Workspace]] (Semantic Search is scoped to the Workspace), [[Role - Agent]] (Agents use Semantic Search as a tool call during autonomous loops)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the Developer invokes Semantic Search explicitly (vs it running automatically during Chat/Composer), retrieval granularity (file-level vs chunk-level), relevance ranking, and the `@Codebase` context attachment in Chat._
