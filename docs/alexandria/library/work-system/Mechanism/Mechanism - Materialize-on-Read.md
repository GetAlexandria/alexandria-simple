---
plane: product
status: confirmed
confidence: high
altitude: context
evidence:
  - packages/ax/src/effects/system-generation.ts
  - packages/ax/src/effects/runtime-server.ts
  - docs/alexandria/plans/work-system/plan.md
links:
  related_to:
    - Entity - System
    - Entity - Work Board
    - Entity - Work Item
---

## WHAT

How a System's work actually comes into being: nothing runs on a timer.
Whenever the board is read, each planted System's pattern rules are
checked, and any rule whose current window — this month, this quarter,
this year — has no card yet gets one written into the record at that
moment. Reading twice never duplicates: one card per rule per window,
ever.

## WHY

Nothing in this setup is always-on — there is no scheduler to trust and
no server that must stay up — so due work materializing at the moment
of looking is the honest mechanism: cards appear exactly when someone
can see them, which is when they matter, and the record stays a plain
file with no invisible machinery behind it. The chosen trade-off is
explicit: work nobody has looked at does not exist yet, but neither
does anyone exist to miss it, and health is computed at look-time
anyway.

## WHERE

Inside the reading of the [[Entity - Work Board]] — the single choke
point through which every viewer and colleague sees the work.

## HOW

Windows are anchored to the calendar for months, quarters, and years
(the annual report belongs to a calendar year, not a rolling 365 days)
and to steady strides for hours, days, and weeks. Missed windows are
never backfilled — three weeks away must not mint three stale chores —
they become misses in the [[Entity - System|System's]] history instead,
feeding its on-time rate and overdue signal. Each minted
[[Entity - Work Item]] carries its provenance (which system, which
rule, which window), inherits the rule's delegate, and joins the
System's room the moment it exists.
