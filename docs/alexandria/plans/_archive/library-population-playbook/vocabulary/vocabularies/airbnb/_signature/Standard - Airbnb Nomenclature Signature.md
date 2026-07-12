---
type: Standard
prefLabel: Airbnb Nomenclature Signature
altLabels: []
category: [Rationale]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help
  - https://www.airbnb.com/hosting
---

# Airbnb Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Airbnb's existing public vocabulary:

1. **Plain English nouns for marketplace primitives.** Listing, Booking, Reservation, Stay, Trip, Review, Rating. Universally recognizable in commerce-adjacent language. No invented compound terms (not "StayRequest," not "BookingArtifact"). If a word exists in ordinary English commerce vocabulary, use it.
2. **Felt-experience naming for Guest-facing surfaces.** Trip (not "Booking"), Wishlist (not "Saved Listings"), Stay (not "Reservation Period"), Trips Dashboard (not "My Bookings"). The Guest sees the lived experience; the system reasons about the transaction. Positive example: a Guest is going on a Trip, not executing a Reservation.
3. **Mechanism naming for Host-facing tools.** Calendar, Listing Editor, Smart Pricing, Earnings — descriptive utility names that tell a Host exactly what tool they are using. No felt-experience language in Host tools; Hosts are operators, not travelers.
4. **Compound tier names use plain modifiers.** Superhost (not "Premier Host"), Co-Host (not "Secondary Manager"), AirCover (the one branded exception — and it is a sold product, so the brand earns its keep). The rule: modify the base noun with a short English word, not a marketing word. "Super" + "host," "Co" + "host." Never "Elite," "Premier," "Diamond."
5. **Two-audience naming is structural, not incidental.** Many concepts have a Guest-facing word and a Host-facing word for the same underlying data — Trip vs Reservation is the cleanest case. This is a deliberate signature rule, not a naming accident or legacy inconsistency. When the audience changes, the name changes. Directors building two-sided products should adopt this rule explicitly rather than trying to find a single name that serves both.
6. **No invented vocabulary in the operational layer.** Reviews, Stars, Refunds — borrowed from established hospitality and commerce conventions. Airbnb does not coin new operational nouns where existing English words are adequate. The one exception is "AirCover" — an invented brand name for a sold insurance product, where brand identity earns its cost.

Airbnb is the `families.md` canonical exemplar for the two-audience problem made structural. Not just two audiences with different permissions on the same surface, but two separate product stacks on the same backend — Guest product and Host product as effectively separate applications sharing a data layer. The Trip/Reservation pair is the sharpest data point in any vocabulary in this corpus: the same database record, named differently depending on who is reading it, and the naming is consistent across every surface, notification, and help article. Directors building two-sided marketplaces should start here.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename._
