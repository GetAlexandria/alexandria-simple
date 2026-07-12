---
type: Entity
prefLabel: Trip
altLabels:
  - Booking
  - Reservation
  - Stay
category: [Entities]
subcategory: [booking]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/461
  - https://www.airbnb.com/trips
---

# Trip

## WHAT: Definition

_Stub — the Guest-facing name for a [[Entity - Reservation]]: the lived-experience framing of the same underlying data object. The [[Surface - Trips Dashboard]] is the Guest's primary post-booking surface; every confirmed, upcoming, completed, or cancelled booking appears there as a "Trip." Airbnb's deliberate choice to surface "Trip" to Guests while calling the same object a "Reservation" in Host and platform contexts is the product's cleanest two-audience naming case: Trip is what the Guest is going on; Reservation is what the system manages. Trip evokes the experience; Reservation evokes the contract._

_This is not a naming accident or legacy inconsistency — it is a deliberate signature rule (rule 2: felt-experience naming for Guest-facing surfaces). The same date range, same property, same confirmation number: called Trip when the Guest is the audience, called Reservation when the Host or system is the audience. Directors building two-sided products should treat this pair as the reference example for intentional two-audience naming._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Reservation]] (the transaction-layer name for this same data), [[Surface - Trips Dashboard]] (the surface where this Trip is managed by the Guest), [[Entity - Stay]] (the active-occupancy period within this Trip), [[Role - Guest]] (the principal for whom this is a "Trip"), [[Role - Co-Traveler]] (others traveling on this Trip)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Trip states as seen by the Guest (Upcoming, Currently Staying, Past, Cancelled); Trip detail view contents (check-in instructions, house rules, Host contact, itinerary); how Trip cards display in the Trips Dashboard; how Trip relates to travel documents and itinerary export._
