---
type: Concept
prefLabel: "Playmaker's Studio"
plane: product
context: _index
status: stub
confidence: medium
proposed_by: scanner
altitude: keystone
altLabels:
  - Studio
  - Playmaker Studio
  - the Studio
source_evidence:
  - "studio/sweeps/playmaker-studio/READ-COHERENCE.md"
  - "studio/plays/README.md:1-19"
---

## WHAT

What it does. Playmaker's Studio lets a Director design, prove, and ship reliable AI plays — small, reusable workflows — by reading and judging plain-English artifacts instead of code, so a team can turn an idea into a registered, trustworthy play without betting on a black box.

How it does it. It designs each play in the [[brief]], derives it into a runnable package in the [[workflow]], and proves it in [[proving]] — carrying every play up the [[production-line]]'s fixed ladder, advancing only when the Director confirms a gate. The [[board]] shows the work live and the [[catalog]] files it; [[make-a-play]] runs that whole loop as a play itself, and [[operations]] keeps the rulebook it all follows.

## WHY

The governance-first wager: the Director never reads code, and every checkpoint emits a plain-English artifact a human can read and judge. That — with the startup-floor reliability bar — is what separates the Studio from enterprise workflow tooling.

## WHERE

The Studio surface is the viewer's `/studio` tab; its records live under `studio/`. Each container above is a bounded context with its own vocabulary, drilled into from this thesis.
