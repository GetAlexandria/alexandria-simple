---
type: Entity
prefLabel: "Knowledge Bank"
altLabels: ["knowledge bank", "RavenKnowledgeBank", "knowledge-bank"]
category: [Entities]
subcategory: [knowledge, agent-scoped]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/viewer/src/components/library/RavenKnowledgeBankStatus.tsx
  - packages/ax/src/domain/plays.ts
---

## WHAT
_Stub —_ An agent's structured store of product context, organized into five subjects — Vision, Vocabulary, Bets, Guardrails, User-research — grouped under three bands: Strategy, Product, Learning.

## WHERE
_Stub —_ Surfaced at `/raven/knowledge-bank`; each subject is a [[Entity - Knowledge Bank Area]] that, once banked, yields [[Entity - Atomic Card]]s. Owned by [[Agent - Raven]].

## WHY
_Stub —_ The five-subject / three-band taxonomy is a deliberate product model; the reasoning for these exact five is NOT in code.

## WHEN
_Stub —_ Filled progressively; Vision is the first available subject ("first Raven power-up").

## HOW
_Stub —_ Each subject carries a status (available→in_progress→ready_for_atomization→banked→locked) and an optional frozen [[Entity - Source of Truth]].
