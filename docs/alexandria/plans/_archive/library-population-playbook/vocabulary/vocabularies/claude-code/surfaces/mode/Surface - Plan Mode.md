---
type: Surface
prefLabel: Plan Mode
altLabels:
  - Planning mode
  - Think mode
  - /plan
category: [Surfaces]
subcategory: [mode]
facets: [Patterns]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Plan Mode

## WHAT: Definition

_Stub — the named user-facing state where the Agent thinks but does not act. In Plan mode, the Agent reads the Workspace, reasons about the task, and produces a written plan — but makes no file changes, runs no commands, and takes no irreversible actions. The User reviews the plan and decides whether to proceed. The User opts into Plan mode explicitly (via `/plan` or a settings flag); it is not the Agent's default state._

_This is Claude Code's clearest implementation of the families.md recommendation to "name agent UI states from the operator's encounter, not from the orchestrator's state machine." Families.md contrasts Cursor (which has Tab as the inline-suggestion surface) with Claude Code (which has Plan mode as the think-before-act surface). Both are aesthetic-named: Cursor's Tab names the keyboard gesture; Claude Code's Plan mode names what the User is doing there (planning). Neither name describes the internal LLM state. The alternative — an internal-named state like "PreExecutionPhase" or "ReadOnlyPlanningStep" — would be mechanism-named and would require explanation. "Plan mode" is self-explaining: you're in the mode where it plans._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Plan-Then-Act]] (Plan mode is the user-facing implementation of the Plan-Then-Act pattern), [[Capability - Plan-and-Execute]] (the capability this surface enables), [[Surface - CLI]] (Plan mode is entered from the CLI), [[Role - User]] (the User controls entry and exit from Plan mode), [[Role - Agent]] (the Agent operates in a read-only reasoning mode when Plan mode is active)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Plan mode is entered and exited, what the Agent can and cannot do in Plan mode (read-only vs action-capable), how the plan artifact is rendered, and how the User approves a plan to transition to execution._
