---
type: Surface
prefLabel: "Alexandria Web App"
altLabels: ["viewer", "ViewerShell", "ViewerApp"]
category: [Surfaces]
subcategory: [shell, navigation]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/shell/ViewerShell.tsx
  - packages/viewer/src/app/ViewerApp.tsx
  - packages/viewer/src/app/navigation/TopNavigation.tsx
---

## WHAT
_Stub —_ The single-page web application that renders all of Alexandria's product surfaces; wears the "ΛLEXΛNDRIΛ" wordmark and a stone-tab top bar.

## WHERE
_Stub —_ Root container hosting every routed surface: [[Surface - Alexandria Home]], [[Surface - Library]], [[Surface - Playbook]], [[Surface - Info Hub]], [[Surface - Ledger]], [[Surface - Play Maker's Studio]], plus the Raven surfaces. Top bar = [[Surface - Stone Top Bar]].

## WHY
_Stub —_ Code shows it is the "visualizes everything else" surface (per plugin guidance). Exact product rationale for one unified app vs. separate tools is NOT derivable from code alone.

## WHEN
_Stub —_ Served locally via `ax start viewer`; the user's primary window into a project's product knowledge.

## HOW
_Stub —_ Astro page mounts a React shell; client-side routing via `parseViewerRoute`/`serializeViewerRoute` over path + search params.
