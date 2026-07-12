---
type: Entity
prefLabel: Skill
altLabels:
  - Slash Command
  - Packaged Workflow
category: [Entities]
subcategory: [composite]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/artifacts/Artifact - Decision: Skill Naming Convention.md
  - docs/alexandria/CLAUDE.md
---

# Skill

## WHAT: Definition

A Skill is a packaged repeatable workflow with instructions — a named, invocable procedure that orchestrates one or more agents toward a defined outcome. Alexandria inherits this term from Claude Code (its primary host environment), where Skills are slash commands. In Alexandria's vocabulary, Skills are how the product's capabilities reach the Director: `/ax-library` invokes Raven, `/ax-grade` invokes Conan, `/ax-build` invokes Sam. A Skill is distinct from a Tool (a single atomic capability) and from a Capability (the abstract agent function a Skill may invoke). The Skill is the packaged, invocable, director-facing wrapper.

The "Skill means three different things across products" hazard documented in families.md Family 2 applies here: Alexandria uses Skill in the Claude Code sense (packaged workflow), not the gamification sense (learned ability) or the agentic-framework sense (a named Tool). This sense is declared at [[Artifact - Decision: Skill Naming Convention]] in the existing library.

## WHERE: Ecosystem

_Stub — links to: [[Artifact - Decision: Skill Naming Convention]] (the decision that fixes which sense of Skill Alexandria uses), [[Role - Director]] (Skills are the Director's primary invocation surface), [[Role - Raven the Maven]] (Raven is invoked via `/ax-library`), [[Capability - Card Building]] (invoked via a Skill)._

## WHY: Rationale

_Stub — owner-supplied. Skills are the seam between the Director's intent and the agent's execution. Without named, stable Skills, the product has no repeatable entry points._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — Skills in Alexandria follow the Claude Code slash-command convention. Each Skill has a name, an invoking agent, and a defined output contract. Skills are versioned and eval-tested before promotion. The Implementation Planning skill is the most complex, orchestrating multiple agents in sequence._
