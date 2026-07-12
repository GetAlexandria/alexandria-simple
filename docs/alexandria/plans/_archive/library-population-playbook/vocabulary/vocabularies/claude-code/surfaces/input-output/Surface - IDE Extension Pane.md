---
type: Surface
prefLabel: IDE Extension Pane
altLabels:
  - VS Code extension
  - JetBrains plugin
  - Editor pane
  - Extension panel
category: [Surfaces]
subcategory: [input-output]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# IDE Extension Pane

## WHAT: Definition

_Stub — the in-editor surface for Claude Code, available in VS Code and JetBrains IDEs. The IDE Extension Pane brings the Claude Code Agent loop into the User's existing editor rather than requiring a separate terminal window. The core interaction model (prompt → Stream → Diff Review) is identical to the CLI; the IDE Extension Pane adds editor-native affordances: file context from the open editor, inline diff display within the file, and keyboard shortcuts bound to editor conventions._

## WHERE: Ecosystem

_Stub — links to: [[Surface - CLI]] (the primary surface the IDE Extension Pane adapts), [[Surface - Stream]] (the Agent's output is streamed in the pane), [[Surface - Diff Review]] (diffs are displayed in-editor), [[Role - User]] (the User works in the pane instead of a terminal), [[Entity - Workspace]] (the open project in the IDE is the Workspace)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: VS Code extension installation, JetBrains plugin installation, how the pane maps to the CLI feature set, which features are CLI-only vs pane-only, and keyboard shortcut conventions in each editor._
