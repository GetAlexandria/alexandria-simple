---
type: Entity
prefLabel: Listing
altLabels:
  - Property Listing
  - Rental Listing
  - Space
category: [Entities]
subcategory: [listing]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/2503
  - https://www.airbnb.com/help/article/43
---

# Listing

## WHAT: Definition

_Stub — the marketplace primitive: the published supply unit that [[Role - Host|Hosts]] create and [[Role - Guest|Guests]] browse and book. A Listing is what makes a [[Entity - Property]] discoverable and bookable on Airbnb. It contains the nightly rate, availability calendar, photos, amenity list, house rules, cancellation policy, and location. The Listing is the atomic unit of supply — the Host's unit of commerce, the Guest's unit of choice. This is the load-bearing Entity for the whole product: every surface, capability, and transaction in the Airbnb system ultimately references or derives from a Listing._

_A single Host may publish multiple Listings; a single [[Entity - Property]] corresponds to exactly one Listing at a time (though properties can be relisted if taken down). The Listing ID is the stable external identifier that persists across edits, price changes, and calendar updates. Airbnb chose "Listing" over "Property" for the published unit because Listing is the commerce artifact — the thing that can be booked — rather than the physical thing. The physical thing is separately named as [[Entity - Property]]._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Property]] (the physical thing this Listing represents), [[Role - Host]] (the principal who publishes and manages this Listing), [[Surface - Listing Detail Page]] (the Guest-facing surface where this Listing is presented), [[Surface - Listing Editor]] (the Host-facing tool for managing this Listing), [[Entity - Reservation]] (the transaction a Guest creates against this Listing), [[Surface - Search]] (the surface where Guests discover Listings)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Listing states (Draft / Active / Deactivated / Suspended); the Listing content structure (title, description, photos, amenities, house rules, check-in/check-out times, minimum stay, maximum occupancy); Listing types (Entire Place, Private Room, Shared Room); how Listing quality affects [[System - Search Ranking]]; Listing's relationship to the [[Surface - Calendar]]._
