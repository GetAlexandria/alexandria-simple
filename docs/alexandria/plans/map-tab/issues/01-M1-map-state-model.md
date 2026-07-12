# M1: Map state model — schema, validators, and ax endpoints

**Flight:** 0 — Model · **Depends on:** nothing · **Plan:** `docs/alexandria/plans/map-tab/plan.md`

## Context

The Map tab (plan §1) is built on Domain → Context → Work-to-be-done-or-doing. This issue
authors that model fresh, in house style, before any UI exists. Everything later conforms to
this schema; nothing in this issue is ported from Lifebuild.

## Scope

- New `docs/alexandria/map/map-state.json` seeded with the fixture shape from plan §1.3
  (domains with `half`/`owner`/`region`, contexts with `domainId` + optional
  `libraryContext`, entities `kind: project|system` with `contextId`/`lifecycle` (+
  `colleague`/`cadence` for systems), positions with one-entity-per-hex).
- Schema + types in `packages/ax` (mirroring the `info-hub-board.ts` pattern) and shared with
  the viewer via the existing schemas module.
- `GET /api/map/state` and `POST /api/map/state` on the ax runtime server: atomic
  temp-file+rename write, `mutationSemaphore` guard, full-document validation on read and
  write, one-entity-per-hex and entity-context-domain referential checks rejected with
  structured errors.
- Additive optional `contextId` and `entityId` fields on Info Hub cards (both schema sides).
  No migration; existing boards stay valid.
- Unit tests: schema validation (valid/invalid documents), conflict rejection, atomic-write
  behavior, card-schema backward compatibility.

## Acceptance criteria

- [ ] `map-state.json` exists, validates, and round-trips through GET/POST unchanged.
- [ ] POST with a duplicate hex, unknown `contextId`, or unknown `domainId` is rejected with
      a structured error; the file on disk is untouched.
- [ ] Existing `board-state.json` loads unmodified; a card with `contextId`/`entityId` also
      validates.
- [ ] Tests pass; no viewer/UI changes in this PR.

## QA script

1. `ax start viewer`, then `curl localhost:4321/api/map/state` — see the seed document.
2. POST a valid position change; confirm the file changed and is pretty-printed/mergeable.
3. POST a second entity onto an occupied hex; confirm rejection and unchanged file.
4. Hand-corrupt the JSON; confirm GET returns a structured error, not a crash.

## Out of scope

Any rendering, any Lifebuild code, placement UI, signals.
