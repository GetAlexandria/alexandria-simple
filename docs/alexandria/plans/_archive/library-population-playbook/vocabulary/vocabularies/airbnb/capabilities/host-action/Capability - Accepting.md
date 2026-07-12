---
type: Capability
prefLabel: Accepting
altLabels:
  - Accept Booking
  - Approve Request
  - Accept Reservation
category: [Capabilities]
subcategory: [host-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/188
  - https://www.airbnb.com/help/article/217
---

# Accepting

## WHAT: Definition

_Stub — the [[Role - Host]]'s response action in Request-to-Book mode: explicitly confirming a [[Role - Guest]]'s [[Capability - Booking]] request to create a confirmed [[Entity - Reservation]]. Accepting is the Host counterpart to Guest Booking in non-Instant-Book flows. The Host has a 24-hour window to Accept or Decline; if they don't respond, the request expires. A Host's acceptance rate and response speed feed into [[System - Search Ranking]] and [[Pattern - Superhost Qualification]] metrics._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Reservation]] (the Reservation confirmed by Accepting), [[Capability - Booking]] (the Guest action that initiates the request this Capability responds to), [[Surface - Host Dashboard]] (where pending requests surface for acceptance), [[System - Search Ranking]] (acceptance rate influences ranking), [[Pattern - Superhost Qualification]] (acceptance rate is a Superhost threshold metric)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Accept vs Decline flow mechanics; Host message to Guest at acceptance; 24-hour response window; how declining affects the Host's response rate; pre-approval as an alternative (sends a link the Guest can use to book at their discretion); how Instant Book bypasses this Capability entirely._
