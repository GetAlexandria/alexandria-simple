---
type: System
prefLabel: Tab Engine
altLabels:
  - Autocomplete Engine
  - Tab Model
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/tab/overview
---

# Tab Engine

## WHAT: Definition

_Stub — the model and inference pipeline behind Tab suggestions. The Tab Engine receives the Developer's current file context (code before and after the cursor), runs inference, and returns a completion suggestion that the Tab surface renders as ghost text. The Tab Engine is not user-visible; the Developer interacts only with the Tab surface, never with the engine directly._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Tab]] (the user-visible surface the Tab Engine serves), [[Capability - Tab Completion]] (the capability the Tab Engine enables), [[Economy-instance - Fast Request]] (premium-model invocations may be used for Tab suggestions depending on plan and settings)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the model(s) the Tab Engine uses, latency targets, context window size for Tab inference, how the engine is selected (plan-dependent model routing), and the speculative decoding / fill-in-the-middle techniques used._
