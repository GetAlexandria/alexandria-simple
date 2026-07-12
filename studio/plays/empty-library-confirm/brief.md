# Play Design Brief - Empty Library Confirm

```
status:   built
tier:     senior
division: Product
function: Library Operations
fronted-by: Raven
chain:    EL4 of the library-elicitation chain
proven:   no
```

## 1. Goal

Give the director one deliberate gate before atomization. The play consumes the
post-EL3 draft empty-library bundle and opens it as a catalog: card
frontmatter, typed edges, gaps, and provenance. Card bodies are absent from the
review surface.

Confirmation appends one user-authored `library.confirmed` Ledger event for the
product, canonical bundle path, and library version. Rejection appends a
structure-only edit list and routes the bundle back to `front-of-house-walk`.

## 2. Trigger

Raven opens the bundle in the viewer:

```bash
ax start viewer
```

Then the director reviews `/library/empty?bundlePath=<path>&product=<slug>`.
The deterministic support path is:

```bash
ax internal library-confirm status --bundle <path> --json
ax internal library-confirm confirm --bundle <path> --json
ax internal library-confirm reject --bundle <path> --edit-list <json> --json
```

## 3. Required Knowledge

- The post-EL3 bundle directory.
- `runtime/empty-library/bundle.json`, including product, content hash, and
  numeric `libraryVersion`.
- The Ledger. Approval is derived from `library.confirmed` events only.
- Empty Library catalog projection: Small-floor fields plus relationship
  topology, gaps, and provenance.

## 4. Golden Path

1. `open_catalog` loads the bundle as an Empty Library catalog and omits bodies.
2. `derive_gate_state` reads the Ledger and manifest to show approved,
   not-approved, or not-ready.
3. `director_confirm` appends `library.confirmed` with `actor.kind = user`.
4. `ledger_observe` shows the event through the Ledger list.
5. Downstream consumers can derive approval for the exact product/path/version
   from the Ledger alone.

## 5. Rejection Path

The director records one or more edits at structure altitude:

- context boundaries
- noun placements
- plane assignments
- relationship topology

The play appends `library.confirmation_rejected` with
`routeToPlayId: "front-of-house-walk"` and no confirmation event.

## 6. Output Contract

- Confirmation is a typed Ledger event, never a status flag in the bundle.
- The approving actor is always `actor.kind = user`.
- Approval is keyed by product, canonical bundle path, and library version.
- A stale approval for version `N` does not approve version `N+1`.
- Rejection never satisfies the approval gate.
- Built by PlaymakerStudio is provenance only. Filing remains Product / Library
  Operations, fronted by Raven.

## 7. Proof Spec

Minimum proof before Proven:

- The viewer opens a post-EL3 bundle catalog with no body content displayed.
- Confirm appends exactly one `library.confirmed` event for a bundle/version.
- Re-confirm returns the existing event.
- Reject appends a structured edit list and no confirm event.
- A fresh Ledger read derives approved/not-approved without another flag.
- Missing, rejected, non-user, and stale-version cases remain not approved.
