---
type: Entity
prefLabel: Skill
altLabels:
  - Slash skill
  - Custom command
  - Packaged workflow
category: [Entities]
subcategory: [capability-unit]
facets: [Capabilities]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/skills
---

# Skill

## WHAT: Definition

_Stub — a packaged repeatable workflow with instructions, invoked by the User via a slash command (`/skill-name`). A Skill is a named bundle of prompt instructions that tells the Agent how to approach a recurring task — code review, release cutting, plan creation, security audit. The User runs a Skill the same way they'd run a shell script: one command, known output shape, repeatable results. Skills live in a designated folder in the Workspace and are discovered at startup._

_The families.md "Skill means three incompatible things" finding is the most important disambiguation in agentic software. Across products: (1) some use Skill to mean an atomic Tool-like capability (LangChain-adjacent usage); (2) some use Skill to mean a persona or trained behavior profile (Copilot usage); (3) Claude Code uses Skill to mean a packaged workflow with instructions — closer to a named runbook or macro than to a capability or persona. Claude Code's choice is deliberate: a Skill is what the User invokes, not what the Agent inherently can do (that's a Tool) and not who the Agent is (that's not a Claude Code concept). Directors adopting Claude Code's vocabulary must declare "Skill = packaged workflow" explicitly and hold it — the term has enough cross-product contamination to be the highest-risk vocabulary item in this lexicon._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Slash Command]] (the invocation gesture for a Skill), [[Role - Agent]] (the Agent executes the Skill's instructions), [[Capability - Skill Invocation]] (the act of invoking), [[Entity - Memory]] (Skills may reference Memory files as part of their instructions), [[Role - Subagent]] (distinguished from Skill — a Subagent is agent-dispatched; a Skill is user-invoked)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the file format for Skill definitions (Markdown with prompt instructions), the discovery mechanism, how the User invokes a Skill via `/name`, how arguments are passed, and the difference between project-local Skills and global Skills._
