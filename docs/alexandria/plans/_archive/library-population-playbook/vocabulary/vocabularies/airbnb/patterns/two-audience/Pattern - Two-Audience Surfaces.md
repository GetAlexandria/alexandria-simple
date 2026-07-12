---
type: Pattern
prefLabel: Two-Audience Surfaces
altLabels:
  - Guest-Host Split
  - Dual Surface Architecture
  - Two-Sided Product Surfaces
category: [Patterns]
subcategory: [two-audience]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/hosting
  - https://www.airbnb.com/help/article/1387
---

# Two-Audience Surfaces

## WHAT: Definition

_Stub — the structural pattern by which Airbnb maintains distinct surface stacks for its two primary audiences: [[Role - Guest]] surfaces ([[Surface - Search]], [[Surface - Listing Detail Page]], [[Surface - Booking Flow]], [[Surface - Wishlist]], [[Surface - Trips Dashboard]]) and [[Role - Host]] surfaces ([[Surface - Host Dashboard]], [[Surface - Calendar]], [[Surface - Listing Editor]], [[Surface - Earnings]]). Guest surfaces are discovery and experience-oriented, named for the felt action (Search, Wishlist, Trips); Host surfaces are management and utility-oriented, named for their mechanism (Calendar, Listing Editor, Earnings). The same underlying data — an [[Entity - Reservation]] — surfaces differently to each audience with different affordances and names._

_Airbnb is the `families.md` canonical exemplar for the two-audience problem made structural. Not just two audiences accessing different views on the same surface, but two entirely different product surfaces on the same backend. The Guest product and the Host product could nearly be described as separate applications sharing a data layer. This is the reference Pattern for any director building a two-sided marketplace: don't fight the split, name both sides deliberately, and let the structural divide show in the vocabulary. Trip vs Reservation is the cleanest data point — the same entity, named for its audience._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Communication Thread]] (the per-thread version of the two-audience split), [[Entity - Reservation]] (the canonical two-name data object: Trip for Guests, Reservation for Hosts), [[Role - Guest]] (one audience), [[Role - Host]] (the other audience)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the full inventory of which nouns are Guest-side vs Host-side vs shared; how the Airbnb app switching between Guest and Host mode works; how Co-Hosts experience the Guest/Host surface boundary; the implications for API design (single API with mode flags vs separate endpoint paths)._
