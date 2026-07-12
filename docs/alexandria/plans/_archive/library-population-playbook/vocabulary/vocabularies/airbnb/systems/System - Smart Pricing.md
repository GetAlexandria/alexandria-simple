---
type: System
prefLabel: Smart Pricing
altLabels:
  - Dynamic Pricing
  - Automated Pricing
  - Smart Price
category: [Systems]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/1175
  - https://www.airbnb.com/help/article/1880
---

# Smart Pricing

## WHAT: Definition

_Stub — the dynamic pricing engine that automatically adjusts a [[Entity - Listing]]'s [[Economy-instance - Nightly Rate]] based on demand signals, local market comparables, seasonality, and event-driven demand spikes. Smart Pricing is engine-internal — [[Role - Host|Hosts]] enable it and set floor/ceiling price bounds, but the per-night rate calculation is automated and not directly controllable. Host-side, Smart Pricing surfaces as a [[Surface - Calendar]] overlay. User-side, it's invisible — Guests see only the resulting price, not how it was calculated. The [[Economy-instance - Smart Pricing]] economy-instance is the Host-facing named feature that corresponds to this system._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Smart Pricing]] (the Host-facing named feature backed by this system), [[Surface - Calendar]] (where Smart Pricing suggestions and activations are displayed to the Host), [[Economy-instance - Nightly Rate]] (the rate this system modifies), [[System - Search Ranking]] (price competitiveness is a ranking signal, so Smart Pricing indirectly affects rank)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: signals Smart Pricing uses (local demand, competitor pricing, occupancy rate, special events, days-to-booking lead time, historical booking data); floor and ceiling price configuration; how Smart Pricing interacts with Host-set custom prices on specific dates; Smart Pricing's effect on occupancy rates (Airbnb's published research on enablement outcomes)._
