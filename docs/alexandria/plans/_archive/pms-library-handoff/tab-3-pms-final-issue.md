# Issue draft — Tab 3 · PMS-Final (director approval)

> Factory-style draft for review. Build **after** PMS-Drafts (Tab 2). Its own
> PR, off `main`. Posting to GitHub is the director's call.

## Job to be done

Give the director the approval surface: review the tuned library and **confirm**
it as the last step before it is built. This is the third pure state —
**PMS-Back → PMS-Drafts → PMS-Final** — the only one where the director acts.

## Discipline (load-bearing)

- **Approval is the director's, and only here.** Back is read-only; Drafts is
  Raven's editable layer; Final is where the director confirms. Keep the three
  states distinct.
- The thing approved is the **Drafts** result (Back + resolved FoH patches), not
  a fresh edit — Final reviews, it doesn't author.

## What will be true (observable)

- A **PMS-Final** tab renders the approvable library (the Drafts result) for
  director review.
- The director can **confirm** via the confirm gate; on confirm, a
  `library.confirmed` state is recorded for this library.
- A confirmed library is visibly distinguished from an unconfirmed one; the
  Back and Drafts states are unchanged by confirmation.

## Interface contract (freeze before building)

- **Reuse the empty-library confirm gate.** The shipped path is the `GatePanel`
  in `EmptyLibraryView` driven by `catalog.gate` +
  `runtimeClient.confirmLibrary` / `rejectLibrary`, with confirmation status
  from `getLibraryConfirmationStatus` (`library-confirmation.ts`). Wire the
  PMS-Final tab so the gate is populated for the PMS library (today an
  explicit-`libraryRoot` load has no gate — that's what this issue adds).
- **Confirmed-state representation** — how `library.confirmed` is keyed to this
  standing PMS library (vs. the empty-library bundle product/version path the
  gate uses today). Decision needed: reuse the bundle confirmation event model
  or a standing-library variant.

## Decisions / open questions

- Whether PMS-Final confirmation feeds the same `library.confirmed` /
  `front-of-house-walk` confirm flow as the empty-library bundle, or a parallel
  standing-library confirmation. Pin against `library-confirmation.ts` before
  building.

## Verification

- Load PMS-Final; the confirm gate is present and reflects the unconfirmed
  state.
- Confirm; `library.confirmed` is recorded and the surface reflects approval.
- Reject-with-edits routes back to the FoH/Drafts flow (if in scope).
- Back and Drafts states are unchanged by confirmation; the three states stay
  distinct.

## Non-goals

- Diagrams (Seam 1) and the §5b category-vocabulary work.
- Re-running BoH/FoH (those are Tabs 1 and 2).
