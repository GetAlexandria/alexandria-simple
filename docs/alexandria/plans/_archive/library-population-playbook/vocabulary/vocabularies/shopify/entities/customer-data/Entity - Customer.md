---
type: Entity
prefLabel: Customer
altLabels:
  - Customer Account
  - Shopper Account
category: [Entities]
subcategory: [customer-data]
facets: [Roles]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/customer
  - https://help.shopify.com/en/manual/customers
---

# Customer

## WHAT: Definition

_Stub — the addressable shopper account; the data record that persists a [[Role - Customer|Shopper's]] identity across sessions and orders. A Customer record holds email address, name, saved shipping addresses, order history, and tags assigned by the [[Role - Merchant]]. Customer is the Entity facet of the [[Role - Customer]] concept — the role describes the shopper's relationship to the store; this Entity describes the stored record._

## WHERE: Ecosystem

_Stub — links to: [[Role - Customer]] (the Role facet of this same concept), [[Entity - Order]] (Orders attributed to this Customer), [[Entity - Cart]] (an active Cart may be associated with a Customer account), [[Surface - Admin]] (where the Merchant views and manages Customer records), [[Pattern - Abandoned Cart Recovery]] (Customer email enables recovery messaging)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Customer account creation paths (checkout opt-in, direct signup, admin manual creation); Customer tags for segmentation; the Customer metafields API; marketing email consent capture; customer account passwordless login (new Customer Accounts experience); Customer vs [[Role - Guest]] (Guests generate no Customer record unless they opt in); B2B Company affiliation for [[Role - B2B Buyer|B2B Buyers]]._
