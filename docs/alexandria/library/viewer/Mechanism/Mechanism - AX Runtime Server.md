---
plane: product
status: stub
confidence: high
altitude: component
altLabels:
  - runtime server
evidence:
  - packages/ax/src/cli/router.ts
links:
  related_to:
    - Surface - AX CLI
    - Surface - Viewer
---

## WHAT
The engine behind the surfaces — the local runtime process the CLI's start
command brings up. It is not itself a place: it serves the surfaces and
holds the runtime state (sessions, subscriptions) they read.

## WHY
Separating the running state from any one surface that reads it means a
session in progress survives a surface restarting, switching modes, or
simply not being open yet. The terminal and the visual surface can both
draw on the same live account of what's happening because neither of them
is the thing actually holding it. That separation is what keeps two
different front doors from silently disagreeing about the state of the
world.

## WHERE
Started from the command line, in either a server-only or viewer mode; the
viewer reaches it over the local runtime API.

## HOW
It is started from the [[Surface - AX CLI]] and serves the
[[Surface - Viewer]] on its local port; sessions lease connections against
it.
