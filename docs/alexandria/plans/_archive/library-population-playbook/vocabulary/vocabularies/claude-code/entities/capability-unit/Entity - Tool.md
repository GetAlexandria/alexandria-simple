---
type: Entity
prefLabel: Tool
altLabels:
  - Function
  - Built-in tool
  - Tool call
category: [Entities]
subcategory: [capability-unit]
facets: [Capabilities]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/tools
---

# Tool

## WHAT: Definition

_Stub — an atomic callable capability the Agent can invoke: Read, Edit, Bash, Glob, Grep, Write, WebFetch, and others. A Tool is a single-function call — it takes inputs, executes deterministically (or near-deterministically), and returns outputs. The Agent decides which Tool to call based on the task; the Tool itself does not reason or loop._

_Naming history: "Tool" is lingua franca across the agentic software landscape. MCP, OpenAI, LangChain, Cursor, Claude Code, CrewAI, LlamaIndex, and Vercel all converge on this term for "atomic callable capability." Families.md explicitly recommends: "Use 'Tool' — it's lingua franca. Don't reinvent." The convergence is rare in agentic vocabulary and should be preserved. Tool is distinct from Skill (a packaged workflow) and from Subagent (a separately-context-windowed agent loop)._

## WHERE: Ecosystem

_Stub — links to: [[Role - Agent]] (the Agent calls Tools), [[System - Tool Dispatcher]] (the runtime that resolves Tool calls), [[Entity - MCP Server]] (external Tools provided via MCP), [[Capability - Tool Calling]] (the act of calling a Tool), [[Pattern - Tool-Use Loop]] (the repeated think → call → observe cycle)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the built-in Tool inventory (Read, Edit, Bash, Glob, Grep, Write, WebFetch, etc.), the permission model for dangerous Tools (Bash especially), how the Agent selects Tools, and how MCP-provided Tools are indistinguishable from built-in Tools at invocation time._
