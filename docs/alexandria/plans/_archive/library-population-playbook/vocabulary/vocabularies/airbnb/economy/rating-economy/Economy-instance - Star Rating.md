---
type: Economy-instance
prefLabel: Star Rating
altLabels:
  - Overall Rating
  - Review Score
  - Rating Average
category: [Economy]
subcategory: [rating-economy]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/1257
  - https://www.airbnb.com/help/article/828
---

# Star Rating

## WHAT: Definition

_Stub — the aggregate [[Economy-instance]] that converts individual [[Entity - Rating|Ratings]] into the public-facing trust signal displayed on [[Entity - Listing|Listings]] and Host profiles. Star Rating is the economy-layer resource that accumulates over time — each completed [[Entity - Stay]] can add a new data point. A high Star Rating earns distribution advantages via [[System - Search Ranking]] and is a prerequisite for [[Economy-instance - Superhost Status]]. Airbnb uses the conventional 1–5 star scale, normalized to display one decimal point (e.g., "4.9")._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Rating]] (the individual Rating inputs that aggregate into this resource), [[Economy-instance - Superhost Status]] (the higher-order Economy resource earned in part via Star Rating), [[Pattern - Superhost Qualification]] (the pattern that uses Star Rating as a threshold), [[System - Search Ranking]] (Star Rating is a ranking signal), [[Surface - Search]] (where aggregate Star Rating is displayed on Listing cards)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the aggregate rating is calculated (simple average vs weighted); minimum review count before rating is publicly displayed; how sub-dimension ratings (cleanliness, accuracy, etc.) aggregate to overall; how new reviews affect the displayed average; Star Rating as the primary trust signal in the two-sided marketplace._
