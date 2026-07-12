---
type: Entity
prefLabel: Workspace
altLabels:
  - Organization
  - Account
category: [Entities]
subcategory: [container]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/workspace
---

# Workspace

## WHAT: Definition

_Stub — the top-level tenant boundary. Per the families.md framework, declare which kind of boundary: billing, access, vocabulary, or all three. Linear's Workspace is all three — one Workspace has one billing contract, one access-control plane, and one set of Labels/Workflows/Custom-fields (vocabulary boundary)._

## WHERE: Ecosystem

_Stub — links to: [[Role - Owner]] (the singular Role that owns this boundary), [[Role - Admin]], [[Entity - Team]] (Workspace contains Teams), [[System - Permission Model]] (the rules at this boundary), [[Economy-instance - Plan]] (the Workspace's billing tier)._

## WHY: Rationale

_Stub — owner-supplied. Probably: "Workspace is the unit of trust and billing for our customers; team-level boundaries are too small for purchasing, individual boundaries are too small for collaboration."_

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: invitation/domain-claim mechanics, deletion safeguards, transfer rules between Owners, the SSO/SAML enforcement model that sits at this boundary._
