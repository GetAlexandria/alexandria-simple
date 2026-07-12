---
type: Agent
prefLabel: "Raven"
altLabels: ["raven", "Product Owner"]
category: [Agents]
subcategory: [product, built-in]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/domain/agents.ts
  - packages/viewer/src/app/agents/agent-bench.fixtures.ts
  - packages/alexandria-plugin/skills/raven-vision-drafting/SKILL.md
---

## WHAT
_Stub —_ The built-in "Product Owner" agent — the primary collaborator who drafts Vision, builds product knowledge, and mediates plays. Owns the five knowledge-bank subjects.

## WHERE
_Stub —_ Occupies the "Product" seat on the [[System - Agent Bench]]; fronted as a coin on [[Surface - Alexandria Home]]; runs [[Capability - Run a Play]] and [[Capability - Raven Vision Onboarding]]; lives in a coding tool, reached via [[Entity - Raven Connection]].

## WHY
_Stub —_ Raven is clearly the protagonist agent; the choice of a single product-owner persona as the default is implied, not justified in code.

## WHEN
_Stub —_ Present from first launch; the default agent for plays.

## HOW
_Stub —_ Built-in agent with knowledgeBankAreaIds [vision, vocabulary, bets, guardrails, user-research] and skills/workflows for vision drafting + frame-the-problem/source-assessment.
