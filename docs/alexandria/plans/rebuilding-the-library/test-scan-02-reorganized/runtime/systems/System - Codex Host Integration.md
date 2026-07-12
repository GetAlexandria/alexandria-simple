---
type: System
prefLabel: "Coding-Tool Host Integration"
altLabels: ["codex", "ACP", "codex-app-server", "host"]
category: [Mechanisms]
subcategory: [integration, agent-host]
context: runtime
altitude: context
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/commands/codex.ts
  - packages/ax/src/domain/codex-integration.ts
  - packages/ax/src/effects/codex-app-server.ts
---

## WHAT
_Stub —_ The integration that connects Alexandria's agents to a coding tool (Codex / ACP, and a Claude adapter) so agents run where the code lives. Per the data model: machine / Execution Layer — referenced, in no pillar.

## WHERE
_Stub —_ `ax codex` launches Codex wired to local services; provides the host behind agent-presence implementations; lets [[Agent - Raven]]/[[Agent - Damien]] act in the editor.

## WHY
_Stub —_ Confirms the product's "keep your codebase aligned with product intent" thesis by living in the coding tool; the provider strategy (codex default, claude optional) is in config, not rationale.

## WHEN
_Stub —_ When an agent session attaches to a project.

## HOW
_Stub —_ Codex app-server client + host supervisor; an init `--acp-provider` selects codex or claude as the play executor adapter.
