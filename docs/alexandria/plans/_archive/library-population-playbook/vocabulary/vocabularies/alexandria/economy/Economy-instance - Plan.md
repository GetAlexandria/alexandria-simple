---
type: Economy-instance
prefLabel: Plan
altLabels:
  - Pricing Tier
  - Subscription Plan
  - Anthropic Plan
category: [Economy]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://anthropic.com/pricing
---

# Plan (Economy)

## WHAT: Definition

_Stub — the Plan is Alexandria's pricing tier — Pro, Max, or API (Anthropic's tiers), which determines the context window size, rate limits, and model access available to the Director running Alexandria. Alexandria is a Claude Code plugin, so its economy is Anthropic's economy: the Director's Plan determines how much the agents can do in a single session and at what cost. This is a thin Economy category for Alexandria — the product does not impose its own seat pricing or token-level billing on top of Anthropic's tier structure._

_Note: "Plan" in this card means the pricing tier (Economy sense). "Plan" in [[Entity - Plan]] means the implementation planning artifact (Entity sense). The same word covers two distinct concepts — a facet tension Alexandria should resolve in its vocabulary (which sense is the primary one for the Director encountering the word "Plan" for the first time?)._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Context Window]] (the Plan tier determines context window size), [[Role - Director]] (the Plan is the Director's subscription)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — Anthropic's current tiers (as of 2026-05): Pro, Max, API. Relevant dimensions for Alexandria usage: context window size (determines how many cards fit in a briefing), rate limits (determines how many agent invocations per hour), model access (Opus vs Sonnet vs Haiku — Haiku is insufficient for production library work)._
