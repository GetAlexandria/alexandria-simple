---
type: Capability
prefLabel: Commenting
altLabels:
  - Comment
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/comments
---

# Commenting

## WHAT: Definition

_Stub — adding threaded discussion to an Issue. Comments support mention syntax (`@Member`) that routes notifications to specific Roles via [[System - Notification Routing]]. Commenting is the primary asynchronous coordination mechanism on an Issue; it does not change the Issue's [[System - Workflow State]], but it does generate [[Surface - Activity Feed]] events and [[Surface - Inbox]] notifications for the assignee and mentioned Members._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Issue]] (the Entity Comments are attached to), [[Role - Member]] (the Role that writes and receives Comments via mention), [[System - Notification Routing]] (mention syntax triggers routing), [[Surface - Inbox]] (Comment mentions appear in the mentioned Member's Inbox)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: threading depth (flat vs nested replies); editing and deleting comment rules; emoji reaction support; whether Guests can Comment; the relationship between Comments and Issue description edits in the Activity Feed._
