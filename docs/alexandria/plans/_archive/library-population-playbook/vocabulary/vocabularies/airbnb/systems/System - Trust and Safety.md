---
type: System
prefLabel: Trust and Safety
altLabels:
  - Safety System
  - Trust System
  - Safety and Trust
category: [Systems]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/2855
  - https://www.airbnb.com/trust
---

# Trust and Safety

## WHAT: Definition

_Stub — the engine-internal system that monitors platform behavior for fraud, policy violations, and safety incidents, and routes enforcement actions. Trust and Safety ingests signal from [[Entity - Review|Reviews]], [[Entity - Message|Messages]], [[Entity - Resolution|Resolutions]], identity verification data, and payment fraud signals. Its outputs are account restrictions, listing suspensions, and escalations to [[Role - Customer Support]]. Trust and Safety is never surfaced by name to users — users encounter its outcomes (a flagged account, a removed listing) without seeing the system itself._

## WHERE: Ecosystem

_Stub — links to: [[System - Verification]] (the identity-verification subsystem that feeds Trust and Safety signals), [[Entity - Resolution]] (Resolutions routed through Trust and Safety), [[Role - Customer Support]] (the human layer that executes Trust and Safety escalations), [[System - AirCover]] (AirCover claims processed in conjunction with Trust and Safety findings)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Trust and Safety signal sources (profile completeness, verification status, booking behavior, review sentiment, message content); enforcement tiers (warning, listing suspension, account ban); how the Trust and Safety system interacts with [[System - Verification]]; how fraud pattern detection works at the payment layer._
