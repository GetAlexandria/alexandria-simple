---
type: Economy-instance
prefLabel: Plan
altLabels:
  - Subscription plan
  - Claude plan
  - Pro
  - Max
  - API
category: [Economy]
subcategory: [plan]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://claude.ai/pricing
---

# Plan

## WHAT: Definition

_Stub — the subscription tier structure that governs a User's access to Claude Code. Three primary shapes: (1) **Pro** — the base paid plan with monthly usage limits, suitable for individual developers with moderate Claude Code use; (2) **Max** — a higher-usage plan with 5x or 20x the Pro limit, suitable for heavy daily Claude Code workflows; (3) **API** — direct API access, pay-per-token, no subscription, suitable for programmatic or Routine-heavy use. Each Plan tier determines how many tokens the User can consume per month and whether usage is quota-bounded (Pro/Max) or per-call-billed (API)._

_Note on naming collision: "Plan" in Claude Code's economy vocabulary is entirely distinct from "Plan mode" (the user-facing state for think-without-acting) and from "plan" as an artifact (the written output of Plan mode). Three meanings; one word; the product holds the distinction by context. This is the highest-risk homonym in the Claude Code lexicon and should be flagged for monitoring. Directors building Claude Code-shaped products should consider whether to rename the subscription tier to avoid the collision._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Token Budget]] (Plans are denominated in token-equivalent usage limits), [[Economy-instance - Context Window]] (larger Plans may unlock larger Context Windows), [[Surface - CLI]] (the User's Plan determines which model and features are accessible at the CLI), [[Role - User]] (the User selects and manages their Plan)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the current Pro/Max/API pricing, the exact usage limits per tier, the model access by tier (which Claude models are available on which Plan), and the upgrade/downgrade flow._
