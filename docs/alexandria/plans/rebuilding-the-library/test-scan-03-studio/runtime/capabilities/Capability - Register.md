---
type: capability
prefLabel: Register
altLabels: [Register, registration, PLAY_MANIFEST entry]
category: runtime
subcategory: capability
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L66-95; studio/plays/PROJECTION.md L319-321
context: runtime
altitude: capability
---

## WHAT
_Stub —_ the operation that makes a banked play runnable as `ax run <slug>`: the workflow package lands in `packages/alexandria-next-plugin/workflows/<slug>/` AND a `PLAY_MANIFEST` entry is added in `packages/ax-next/src/domain/plays.ts`.

## WHERE
Orchestrator-executed step 8 of [[Aggregate - The Loop]]. Moves a play from Proven → Live.

## WHY
"A banked play is a runnable workflow package, not a prompt file." Live means users can run it; that requires both the package on disk AND the manifest entry.

## WHEN
After Gate 2. `ax run <slug>` smoke-proven before declaring Live.

## HOW
- Two surfaces touched: the workflow package and the manifest.
- Hot Spot H12 — the studio has its own registry (registry.js for identity); the runtime has its (PLAY_MANIFEST). Register syncs the two.
- Reverse-derived plays land in the manifest by other paths (the atomic-card family pre-dated the 0.12.0 rename).
