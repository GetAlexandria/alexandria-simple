---
type: Capability
prefLabel: "Initialize a Project"
altLabels: ["ax init", "init", "bootstrap"]
category: [Capabilities]
subcategory: [setup, lifecycle]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/commands/init.ts
  - packages/ax/src/domain/config.ts
  - packages/alexandria-plugin/skills/ax-start/SKILL.md
---

## WHAT
_Stub —_ The capability of setting Alexandria up in a codebase: writing `.alexandria/alexandria-config.json`, choosing a workspace, and optionally installing orchestration.

## WHERE
_Stub —_ `ax init [all|project|orchestration]`; gates whether [[Surface - Play Maker's Studio]] and other surfaces have anything to load.

## WHY
_Stub —_ Establishes the project as the canonical state; the product reasoning for a `docs/alexandria` workspace default is implied, not argued.

## WHEN
_Stub —_ Once, when adopting Alexandria in a repo.

## HOW
_Stub —_ Detects existing config (ax-start), then writes config + workspace scaffolding; modes split project setup from agent/orchestration install.
