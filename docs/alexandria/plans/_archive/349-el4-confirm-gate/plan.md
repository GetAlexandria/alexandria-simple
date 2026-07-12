# Issue 349 Technical Plan: EL4 Empty Library Confirm Gate

## Header

- Issue reference: `GetAlexandria/alexandria-internal#349`
- Project: Library Rebuild, Phase 2
- Goal: add the EL4 confirm gate so the director can review a post-EL3 draft empty-library bundle as a catalog, confirm or reject it, and make approval a durable ledger fact that downstream atomization can gate on.
- Plan path: `docs/alexandria/plans/349-el4-confirm-gate/plan.md`
- Blocked by:
  - EL3 Front-of-House Walk, which supplies the post-walk draft bundle.
  - VB1 Empty Library View, which renders catalog cards, gaps, and provenance without card bodies.
  - Provenance on the Ledger, because the approval is a typed actor-attributed event.
- Blocks: EL5 atomizer re-point.
- Linked plans and docs:
  - `docs/alexandria/plans/library-elicitation-plays/plan.md`
  - `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md`
  - `docs/alexandria/plans/340-library-viewer-empty-library-view/plan.md`
  - `studio/plays/front-of-house-walk/brief.md`

## Scope

- Add the EL4 play identity to Studio as `empty-library-confirm`, filed under Product / Library Operations and fronted by Raven. PlaymakerStudio is provenance only.
- Add typed ledger event support for `library.confirmed`, with `actor.kind = user` required by the confirm path and approval projection.
- Add a typed rejection/edit-list event that records the director's requested EL3 corrections without ever satisfying the approval gate.
- Add an AX approval projection that answers whether a product/bundle/version is approved from ledger events alone.
- Add bundle-aware catalog loading for the Empty Library View so EL4 can inspect a post-EL3 draft bundle, not only the configured workspace library.
- Add bundle version metadata and validation so approval is scoped to version `N` and does not cover version `N+1`.
- Add viewer controls in the existing Empty Library View to confirm or reject the catalog at structure granularity only.
- Add runtime API support for confirm/reject mutations through the AX event store; the viewer must not write files or ledger JSONL directly.
- Make the resulting `library.confirmed` event observable through ledger listing (`ax inspect events list`, `/api/events`, and the viewer ledger list surface if enabled in the implementation slice).
- Add deterministic tests for schema validation, idempotent confirmation, rejection, ledger-derived approval, stale-version negatives, runtime API behavior, and viewer behavior.
- Add or rerun product-skill eval coverage if new or changed Raven guidance ships with this gate.

## Non-Goals

- Do not build VB1 from scratch. The Empty Library View and catalog projection are dependencies; this slice only adds bundle opening and gate controls where needed.
- Do not fill or review card bodies. EL4 reviews frontmatter and typed edges only.
- Do not build EL5 atomization or re-point the atomizer. This slice only exposes the approval helper EL5 will later call.
- Do not write directly to `docs/alexandria/library/`.
- Do not store approval in card frontmatter, a bundle file, project config, or any parallel status flag.
- Do not treat a rejection as an approval. Rejection records an edit list and routes back to EL3.
- Do not build a broad ledger explorer, query builder, or audit dashboard beyond the narrow event-list visibility needed to observe the approval event.
- Do not let Raven or an agent self-approve the bundle. The confirm event must be a user ruling.

## Linked Product-Plan Summary

The elicitation chain is EL1 source sweep, EL2 back-of-house draft, EL3 front-of-house correction, EL4 empty-library confirmation, EL5 atomization, and later EL6 living updates. EL4 is the only blocking human gate before token-heavy atomization. The director reviews the whole empty library as a catalog: Small-floor card fields (`type`, `prefLabel`, `context`, `plane`, `status`) plus typed relationship topology, gaps, and provenance. Card bodies are absent.

`work-with-the-ledger.md` decides that rulings and provenance are ledger events, not hand-maintained fields. This plan adopts that decision directly: `library.confirmed` is the approval source of truth. Downstream code must not infer approval from a file flag, a status string on the bundle, or positive wording in a rejection/edit list.

The issue's frozen event contract names `data`; AX's shipped state-event envelope uses `payload`. Implementation should preserve the AX envelope and put the frozen fields in the event payload:

```yaml
type: library.confirmed
actor: { kind: user, ... }
payload: { product: "<slug>", bundlePath: "<path>", libraryVersion: <N> }
```

## Current Gap

- `packages/ax/src/domain/state-events.ts` has typed event schemas for play lifecycle, Studio operations, sources, atomic cards, assessments, canvas, wake events, Raven Vision, and EL3 front-of-house events, but no `library.confirmed` approval event.
- The ledger primitive already exists: `ax inspect events append|list|validate|schema`, runtime `/api/events`, JSONL append idempotency, actor validation, and SSE projection. EL4 should reuse this instead of creating a second store.
- `packages/ax/src/domain/library-catalog.ts`, `packages/ax/src/effects/library-graph-loader.ts`, and `packages/viewer/src/components/library/EmptyLibraryView.tsx` now support a catalog projection, but the runtime endpoint currently loads the configured workspace library at `docs/alexandria/library`; it does not open an arbitrary post-EL3 bundle path with product/version/gate metadata.
- The current catalog shape intentionally omits card bodies, which is correct for EL4, but it has no approval state, no confirm/reject controls, and no bundle version identity.
- EL3 front-of-house support exists in `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/commands/front-of-house.ts`, `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`, and `packages/alexandria-plugin/workflows/front-of-house-walk/`. It records answers, patches, and residual gaps, but it does not yet publish an EL4-ready bundle version contract.
- `studio/plays/registry.js` has Product / Library Operations and the EL3 play, but no EL4 confirm-gate play record.
- `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md` recognizes EL3 events, but does not yet classify `library.confirmed` or the rejection event.
- The viewer runtime client can list `/api/events`, but the visible Ledger tab is currently a placeholder/disabled route in the library shell. The implementation must make the approval event observable through an existing or minimally enabled ledger list surface.

## Architectural Boundaries

- AX owns the ledger event vocabulary, event append validation, bundle version inspection, approval derivation, and runtime APIs.
- AX must expose approval as a projection from ledger events. A fresh process that reads only the ledger events and a requested `{ product, bundlePath, libraryVersion }` must be able to derive approved or not-approved.
- The viewer owns the human UI: loading the bundle catalog, showing version/approval status, collecting a structured rejection edit list, and calling AX runtime APIs. It must not read workspace files or ledger JSONL directly.
- The plugin owns Raven's guided behavior: how Raven frames EL4, how it routes a rejection back to EL3, and how it explains that only a user ruling can approve. The plugin must not become the approval source of truth.
- Studio owns the play catalog identity and Board bookkeeping. The EL4 home is Product / Library Operations, fronted by Raven; PlaymakerStudio appears only as built-by provenance in the brief.
- EL3 may need a narrow update to emit or refresh bundle version metadata. That is allowed because EL4 depends on a versioned post-walk bundle, but EL3's answer/patch semantics must not be reworked in this slice.
- EL5 remains out of scope. This slice should export a small approval helper that EL5 can call later, plus negative tests proving unconfirmed and stale versions are not approved.

## Event And Approval Contract

Add a new state event type:

```ts
type LibraryConfirmedPayload = {
  product: string;
  bundlePath: string;
  libraryVersion: number;
};
```

Rules:

- Event type is exactly `library.confirmed`.
- The supported confirm paths require `actor.kind = "user"` and reject any other actor kind.
- The event payload contains exactly the product slug, canonical bundle path, and numeric library version required by the issue.
- The stable idempotency key is `library.confirmed:<product>:<canonical-bundle-path>:v<libraryVersion>`.
- A second confirm for the same product/path/version returns the existing event as `already_appended`; it must not append another `library.confirmed` line.
- The approval projection ignores malformed or non-user `library.confirmed` events. A process-authored or agent-authored confirm-looking event is visible in the ledger but does not approve the bundle.
- Approval is keyed by exact product, canonical bundle path, and library version. A confirm for version `N` never approves version `N+1`.
- No frontmatter, bundle metadata, project-state field, or viewer local state is an approval source.

Add a rejection event type:

```ts
type LibraryConfirmationRejectedPayload = {
  product: string;
  bundlePath: string;
  libraryVersion: number;
  editList: Array<{
    kind:
      | "context_boundary"
      | "noun_placement"
      | "plane_assignment"
      | "relationship_topology";
    target: string;
    requestedChange: string;
    rationale?: string;
  }>;
  routeToPlayId: "front-of-house-walk";
};
```

Rules:

- The recommended event type is `library.confirmation_rejected`.
- Rejection requires `actor.kind = "user"` through the supported path.
- Rejection appends no `library.confirmed` event.
- The edit list is structure-only. It must not accept card body prose, body replacement text, or atomization instructions.
- The approval projection always returns not-approved for a rejected bundle/version unless a separate matching user-authored `library.confirmed` event exists later through an explicit confirm path.
- The implementation should reject attempts to append a rejection for a bundle/version that is already approved, unless the bundle has first moved to a new version.

## Bundle Version Contract

EL4 needs a stable numeric `libraryVersion`. Add a small version manifest inside the draft bundle, for example:

```json
{
  "schemaVersion": 1,
  "product": "alexandria",
  "libraryVersion": 1,
  "contentHash": "sha256:...",
  "generatedByPlayId": "front-of-house-walk",
  "updatedAt": "2026-06-24T00:00:00.000Z"
}
```

Recommended path: `runtime/empty-library/bundle.json`.

Implementation rules:

- EL3 `finalize` should create the manifest when it produces the post-walk draft bundle.
- Any later EL3 loopback edit to the bundle must bump `libraryVersion` and refresh `contentHash`.
- EL4 confirm/reject commands and runtime APIs read product/version from the manifest by default and reject missing, non-numeric, or stale metadata with exit code 2 / HTTP 400.
- The canonical `bundlePath` in events should match the normalized path AX uses for EL3 bundle events. Do not compare raw user input paths.
- `contentHash` is diagnostic and guards dirty working bundles before confirmation, but the approval event's required payload remains product/path/version.
- A dirty bundle whose current content hash no longer matches its manifest must read as not-ready-to-confirm, not approved by a stale event.

## Runtime And UI Flow

1. Raven or the director opens the Empty Library route with a post-EL3 bundle reference, for example `/library/empty?bundlePath=<encoded-path>&product=<slug>`.
2. The viewer calls an AX runtime catalog endpoint. Existing `/api/library/catalog` behavior with no bundle path remains compatible; with a bundle path, AX loads the bundle as the catalog root, excludes EL3 operational markdown such as `STAGE-2-BRIEF.md`, `HOT-SPOTS.md`, `RESIDUAL-GAPS.md`, and `runtime/**`, and returns catalog records without card bodies.
3. AX includes a gate summary in the response: product, canonical bundle path, library version, approval status, matching confirmation event id when present, and any latest rejection/edit-list event for the same version.
4. The Empty Library View renders the catalog and gate controls. It should show confirm/reject actions only at structure altitude: context boundaries, noun placements, plane assignments, and relationship topology.
5. On confirm, the viewer calls a dedicated runtime mutation, such as `POST /api/library/confirmations`, with action `confirm`, product, bundle path, library version, and actor `{ "kind": "user", "host": "viewer" }`.
6. AX validates the bundle manifest, checks for an existing matching confirm event, appends `library.confirmed` through the state event store if needed, and returns the event plus `approved: true`.
7. On reject, the viewer collects a structured edit list and calls the same runtime mutation with action `reject`. AX appends `library.confirmation_rejected`, returns `approved: false`, and returns `routeToPlayId: "front-of-house-walk"`.
8. Raven guidance should treat the rejection event as the handoff back to EL3. It should not infer approval from a polite rejection, partial acceptance, or empty edit list.
9. The ledger list surface should show the appended event. At minimum, `ax inspect events list --type library.confirmed --json` and `/api/events?type=library.confirmed` must work; if the viewer Ledger route remains disabled, enable a narrow recent-event list backed by the existing runtime client.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Studio EL4 play identity | New `studio/plays/empty-library-confirm/brief.md`, `risk-map.md`, optional fixtures; `studio/plays/registry.js`; `studio/plays/board-state.json` | Adds EL4 as Product / Library Operations, fronted by Raven, with PlaymakerStudio provenance only |
| AX state event schema | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts`, `packages/ax/tests/cli.test.ts` | Adds `library.confirmed` and `library.confirmation_rejected` payload schemas, schema docs, append/list coverage, and help visibility |
| AX confirmation domain | New `packages/ax/src/domain/library-confirmation.ts` and focused tests | Derives approval from ledger events, validates actor kind, product/path/version matching, idempotency, rejection edit-list shape, dirty bundle state, and stale-version negatives |
| AX internal CLI support | New `packages/ax/src/commands/library-confirmation.ts`, router wiring under `ax internal library-confirm ...`, black-box tests | Provides deterministic `status`, `confirm`, and `reject` helpers for Raven, tests, and future EL5 gating without hand-writing JSONL |
| AX EL3 bundle versioning | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/src/domain/library-front-of-house.ts`, existing front-of-house tests | Writes or refreshes `runtime/empty-library/bundle.json` during EL3 finalize and bumps version on loopback edits |
| AX catalog loader/runtime | `packages/ax/src/domain/library-catalog.ts`, `packages/ax/src/effects/library-graph-loader.ts`, `packages/ax/src/effects/runtime-server.ts`, `packages/ax/tests/viewer.test.ts`, `packages/ax/tests/runtime-server.test.ts` | Loads catalog data from a requested bundle path, returns gate metadata, and exposes confirm/reject runtime mutations through the ledger store |
| Viewer runtime schemas/client | `packages/viewer/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decodes bundle catalog gate metadata and exposes confirm/reject calls |
| Empty Library View | `packages/viewer/src/components/library/EmptyLibraryView.tsx`, `LibraryBrowserApp.tsx`, `viewer-routes.ts`, stories, unit tests | Adds confirm/reject controls, structured rejection edit-list UI, approved/not-approved states, and no-body assertions |
| Viewer ledger list | `packages/viewer/src/components/library/SurfacePlaceholders.tsx` or a new focused Ledger component; runtime client list-events support already exists | Makes `library.confirmed` observable in a human ledger list without building a broad explorer |
| Viewer browser tests | `packages/viewer/tests/library-browser.spec.ts`, `packages/viewer/tests/serve-viewer-fixture.ts` | Covers bundle catalog open, no bodies, confirm, reject, ledger visibility, unconfirmed negative, and stale-version negative |
| Plugin Raven guidance | New `packages/alexandria-plugin/skills/empty-library-confirm/SKILL.md`; updates to `ax-start/SKILL.md` and `alexandria-event-log/SKILL.md` | Guides Raven through EL4, explicit user approval, rejection loopback to EL3, and new event meanings |
| Plugin validation/evals | `claude plugin validate`, eval cases under `tests/eval-cases/empty-library-confirm/` if skill added | Keeps shipped guidance and user-facing Raven behavior covered |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Raven EL4 confirm skill | New product-facing guidance for opening a versioned bundle in the Empty Library View, explaining structural review, and refusing to self-approve | Add adaptive eval coverage for confirm vs reject behavior; plugin validation |
| Alexandria event-log skill | Recognizes `library.confirmed` as a durable user ruling and `library.confirmation_rejected` as an EL3 loopback edit list | Update event meanings; rerun targeted Raven/event-log evals if present |
| ax-start skill | If wake subscriptions or routing include library confirmation/rejection events, document the route to the EL4 skill | Plugin validation; monitor wrapper tests if subscriptions change |
| AX deterministic CLI/runtime | Adds event types, approval projection, internal commands, and runtime mutations | Black-box CLI/API tests for exit codes, JSON fields, idempotency, and negatives |
| Viewer | Adds human gate controls and optional ledger list visibility | Viewer unit, build, Storybook, and browser validation |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX event schema and generic ledger CLI | `cd packages/ax && bun test tests/events.test.ts tests/cli.test.ts` | Verifies new event types appear in schema/help, validate payloads, and remain listable |
| AX confirmation domain and internal CLI | `cd packages/ax && bun test tests/library-confirmation.test.ts tests/library-confirmation-cli.test.ts` | Verifies approval derivation, actor-kind rules, idempotent confirm, rejection, missing confirm negative, stale version negative, and exit codes |
| AX runtime API | `cd packages/ax && bun test tests/runtime-server.test.ts tests/viewer.test.ts` | Verifies bundle catalog loading, confirm/reject API behavior, `/api/events` visibility, and concurrent idempotent appends |
| EL3 regression | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Ensures adding bundle version metadata does not break EL3 answer, patch, body-preservation, or residual behavior |
| Viewer runtime/unit | `pnpm --filter @alexandria/viewer run test` | Covers schema decoding, client calls, route parsing, and gate state rendering |
| Viewer static checks | `pnpm --filter @alexandria/viewer run check` | Astro/TypeScript validation |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Ensures the route and components build |
| Viewer browser | `pnpm --filter @alexandria/viewer run test:e2e` | Verifies catalog open, no body display, confirm/reject flows, ledger visibility, desktop/mobile layout, and negative states |
| Storybook | `pnpm --filter @alexandria/viewer run storybook:build` | Verifies visual states for unapproved, approved, rejected, and stale-version catalogs |
| Studio catalog | `node studio/tools/check-catalog.mjs` | Confirms EL4 filing as Product / Library Operations and no retired built-by catalog fields |
| Studio play conformance | Add or extend a focused check for `studio/plays/empty-library-confirm`, then run it | Confirms the play brief declares user-authored approval, rejection loopback, no body review, and ledger source of truth |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Ensures shipped plugin payload remains valid |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|---------------------|
| New EL4 Raven skill | No checked-in EL4 eval exists | Create at least one adaptive eval where Raven opens the bundle for review, refuses self-approval, records explicit user confirmation, and handles rejection loopback | `pnpm eval -- run empty-library-confirm/all` after the case exists |
| Event-log / ax-start guidance | Existing Raven-related eval coverage may not include library confirmation events | Rerun Raven/event-log evals if listed by `pnpm eval -- list`; otherwise document absence in the implementation handoff | `pnpm eval -- run raven/all` when available |
| AX confirmation runtime | Deterministic Bun tests cover this better than LLM evals | No eval-harness rerun required | AX tests listed above |
| Viewer confirm controls | Deterministic unit, Storybook, and Playwright coverage | No eval-harness rerun required | Viewer checks listed above |
| EL5 atomizer | Not changed in this slice | Defer atomizer evals to the EL5 re-point issue | No conan/sam/bridget/solomon atomizer eval rerun here |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Approval becomes a file flag or frontmatter status because the viewer needs fast state | Keep approval projection in AX over ledger events; viewer receives derived state only; add tests that deleting any local UI state and rereading ledger still derives approval |
| A stale confirm covers a changed bundle | Gate by exact product/path/version; require version manifest; make dirty hash mismatch not-ready-to-confirm; add version `N` approved / version `N+1` not-approved tests |
| Double-clicks or concurrent confirm requests append multiple approval events | Use a stable idempotency key and preflight lookup for matching approval events; add runtime concurrency/idempotency tests |
| Rejection accidentally satisfies the gate | Use a separate rejection event type; approval helper only accepts `library.confirmed` with `actor.kind = user`; add reject negative tests |
| Generic event append can create an agent/process-authored `library.confirmed` event | Confirm command/API enforce `actor.kind = user`; approval projection ignores non-user confirm-looking events; event-log guidance says agent confirms are not approvals |
| Viewer invites body-level review | Catalog response contains no body fields; Empty Library View copy and controls refer only to structure; browser tests seed body text and assert it never appears |
| Bundle path handling allows arbitrary filesystem reads | Resolve bundle paths inside the project root or configured workspace boundary; reject traversal/outside paths with precise 400/exit 2 diagnostics |
| Rejection loopback to EL3 is ambiguous | Rejection payload carries `routeToPlayId: "front-of-house-walk"` and structured edit-list items; Raven guidance consumes that event as the handoff |
| Enabling a ledger list becomes a broad new product surface | Keep it to a recent event list backed by existing `/api/events`, with enough detail to observe `library.confirmed`; defer filtering/search/audit UX |
| EL3 version metadata changes regress existing front-of-house tests | Keep manifest writing isolated to finalize/version helpers; rerun existing EL3 tests and fixture smokes |

## Implementation Steps

1. Add `studio/plays/empty-library-confirm/brief.md` and `risk-map.md` describing EL4 as the director's structural catalog gate, with `division: Product`, `function: Library Operations`, and built-by provenance in the brief only.
2. Register `empty-library-confirm` in `studio/plays/registry.js` as EL4, fronted by Raven, and update `studio/plays/board-state.json` with an implementation/testing card without marking it live or proven.
3. Add `library.confirmed` and `library.confirmation_rejected` to `packages/ax/src/domain/state-events.ts`, including payload schemas and schema descriptors. Update events and CLI help tests.
4. Add `packages/ax/src/domain/library-confirmation.ts` with:
   - canonical product/path/version matching;
   - approval derivation from ledger events;
   - user-actor validation for supported confirm/reject paths;
   - rejection edit-list validation;
   - idempotency key construction;
   - stale-version and dirty-bundle helpers.
5. Add the bundle version manifest reader/writer and wire EL3 finalize to create it. If EL3 consumes an EL4 rejection edit list in this slice, ensure that loopback edits bump the version.
6. Add `ax internal library-confirm status|confirm|reject` with `--bundle`, optional `--product`, optional `--library-version`, `--actor`, `--edit-list`, and `--json`. Keep stdout data-only, stderr diagnostics-only, and exit code 2 for invalid input.
7. Extend catalog loading so `/api/library/catalog` can accept a safe bundle path and build a catalog from the bundle root while excluding EL3 operational markdown and runtime files.
8. Add gate metadata to the catalog response without breaking existing workspace-library callers.
9. Add runtime confirm/reject endpoints that call the same AX domain helpers and append through the existing event store under the runtime mutation semaphore.
10. Extend viewer runtime schemas/client tests for bundle catalog gate metadata and confirm/reject mutations.
11. Update `viewer-routes.ts` and `LibraryBrowserApp.tsx` so `/library/empty` can carry a bundle path/product/version and load that catalog.
12. Update `EmptyLibraryView.tsx` with confirm and reject controls, approved/rejected/not-approved states, structured edit-list input, disabled states for already-approved or dirty/stale bundles, and no body-review affordances.
13. Enable or add a minimal viewer Ledger list that displays recent events from `client.listEvents`, enough to observe `library.confirmed`.
14. Add viewer fixtures and Playwright coverage for confirm, reject, ledger visibility, body absence, no matching confirm, and stale version.
15. Add `packages/alexandria-plugin/skills/empty-library-confirm/SKILL.md` and update `alexandria-event-log` / `ax-start` only as needed for EL4 routing and new event meanings.
16. Add adaptive eval coverage for the EL4 skill, or document why the eval harness was unavailable in the implementation handoff.
17. Run deterministic verification, plugin validation, and targeted evals. Record any skipped checks with reasons.

## Acceptance / Exit Criteria

1. The director can open a post-EL3 draft bundle in the Empty Library View as a catalog, with Small-floor frontmatter, typed edges, gaps, and provenance visible, and card bodies absent.
2. The EL4 play is present in the Studio catalog as Product / Library Operations, fronted by Raven, with PlaymakerStudio only as provenance.
3. Confirming through the supported path appends exactly one `library.confirmed` event for the product, canonical bundle path, and library version.
4. The confirm event has `actor.kind = user`.
5. The confirm event is visible through ledger listing.
6. A fresh ledger read derives the bundle approved at version `N` without reading any approval flag from frontmatter, bundle metadata, or config.
7. Re-confirming the same product/path/version returns the existing event and leaves only one matching `library.confirmed` event in the ledger.
8. Rejecting records a structured edit list at context-boundary, noun-placement, plane-assignment, or relationship-topology granularity.
9. Rejecting appends no `library.confirmed` event and routes the bundle back toward EL3 via `routeToPlayId: "front-of-house-walk"`.
10. A bundle/version with no matching user-authored `library.confirmed` event reads as not approved.
11. A confirmed bundle at version `N` reads as not approved at version `N+1` until the director confirms that version.
12. A non-user `library.confirmed` event does not satisfy the approval projection.
13. Viewer, AX, Studio, plugin validation, and targeted eval checks listed above pass or are explicitly documented as unavailable.

## Deferred Follow-Ups

1. EL5 atomizer re-point to call the approval helper before atomization.
2. Richer ledger explorer filtering/search beyond the minimal approval-event list.
3. Automated EL3 relaunch from a rejection event if this slice only returns the route instruction.
4. EL4.5 noun hardening and identity reconciliation.
5. Long-term bundle versioning extraction if more library workflows need the same manifest.
6. Provenance projection cleanup so catalog provenance reads only from ledger events once EL5 emits consistent atomic-card provenance.
