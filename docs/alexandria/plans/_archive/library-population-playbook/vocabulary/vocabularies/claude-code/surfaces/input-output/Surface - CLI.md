---
type: Surface
prefLabel: CLI
altLabels:
  - Terminal
  - Command line
  - Shell interface
category: [Surfaces]
subcategory: [input-output]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# CLI

## WHAT: Definition

_Stub — the terminal-based input/output surface. The User types prompts, slash commands, and interrupt signals at the CLI; the Agent streams responses back to the same surface. The CLI is the primary, canonical surface of Claude Code: the product was designed terminal-first, and every other surface (IDE Extension Pane) is an adaptation of the CLI model into a richer UI container._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Slash Command]] (Slash Commands are typed at the CLI), [[Surface - Stream]] (the Agent's output arrives as a Stream in the CLI), [[Surface - Diff Review]] (diffs are rendered inline in the CLI), [[Role - User]] (the User operates at the CLI), [[Entity - Session]] (Sessions are initiated at the CLI)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: invocation command (`claude`), flags and options, how the CLI renders streaming output, how Tool call progress is displayed, and the keyboard shortcuts for interrupt and mode-switching._
