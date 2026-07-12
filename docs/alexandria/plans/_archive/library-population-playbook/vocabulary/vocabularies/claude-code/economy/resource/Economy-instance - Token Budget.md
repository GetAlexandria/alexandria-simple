---
type: Economy-instance
prefLabel: Token Budget
altLabels:
  - Tokens
  - Token count
  - Token usage
  - Token cost
category: [Economy]
subcategory: [resource]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/about-claude/models
---

# Token Budget

## WHAT: Definition

_Stub — the spendable resource unit within the Context Window. Every piece of text in the context — User messages, Agent responses, Tool inputs, Tool outputs, loaded Memory — is measured in tokens. The Token Budget is the quantified representation of the Context Window: the window is a size in tokens; each addition to the context reduces the remaining budget. Token Budget is also the pricing unit: API usage is billed per token consumed (input + output). On Claude.ai Pro and Max plans, usage is bounded by a usage limit rather than a per-token charge, but the underlying resource is the same._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Context Window]] (the Token Budget is the quantification of the Context Window), [[Economy-instance - Plan]] (Pro/Max plans have a usage limit denominated in token-equivalent usage), [[Capability - Tool Calling]] (Tool results consume Token Budget), [[Role - Subagent]] (each Subagent dispatch creates a new Token Budget draw)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the token counting mechanics (how prompts are tokenized), the difference between input tokens and output tokens in pricing, the Tool output token cost (some outputs are large — Bash stdout, file reads), and how to monitor token consumption during a Session._
