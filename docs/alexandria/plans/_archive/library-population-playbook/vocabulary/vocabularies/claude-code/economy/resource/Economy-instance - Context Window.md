---
type: Economy-instance
prefLabel: Context Window
altLabels:
  - Context
  - Context length
  - Window
  - Token window
category: [Economy]
subcategory: [resource]
facets: [Surfaces, Mechanisms]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/memory
---

# Context Window

## WHAT: Definition

_Stub — the Agent's total budget for everything in the current turn: the conversation history, loaded Memory, Tool call inputs and outputs, and the Agent's own reasoning. The Context Window is finite; when it fills, the Agent must compact, summarize, or fail. Every Tool call output consumes part of the window. Every loaded Memory file consumes part of the window. The longer the Session, the more the window fills._

_This noun resists all 10 universal categories — the finding that families.md calls out explicitly for agentic software and Claude Code specifically. It is simultaneously: (1) an **Economy** concept (a budget with a hard limit, a pricing axis — larger models have larger windows, priced accordingly); (2) a **Surfaces** concept (the boundary of what the Agent "can see" at any moment — it is the Agent's viewport onto all available information); (3) a **Mechanisms** concept (a runtime resource with fill semantics, compaction rules, and failure modes); (4) a **Capabilities** constraint (the Agent cannot attend to information outside the window); (5) a **Memory** boundary (Memory only matters when it is loaded into the window). No framework has resolved this multi-facet nature into a single clean category. Families.md flags Context Window as the strongest candidate for an Alexandria-coined term — a new noun that names the budget+surface+memory+capability+pricing axis as a single first-class concept rather than leaving it as an overloaded technical term._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Token Budget]] (the spendable units within the Context Window), [[Entity - Memory]] (Memory consumes Context Window budget when loaded), [[Entity - Session]] (Context Window fills across a Session; compaction resets it), [[Capability - Tool Calling]] (each Tool result adds to the window), [[Role - Subagent]] (each Subagent gets a separate, fresh Context Window — isolation is the point)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the window size for each Claude model (tokens), the compaction strategy when the window nears capacity, the User's visibility into how full the window is, and the pricing relationship between window size and API cost._
