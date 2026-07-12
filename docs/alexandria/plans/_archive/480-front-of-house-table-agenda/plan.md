# Issue 480 - Front-of-House Table Agenda

Status: implementation plan, 2026-06-30.

Issue: GitHub #480, "Front-of-House: set the table - context-grouped,
triaged agenda (confidence/origin + plane->context + card links,
orphan-safe)".

Goal: reshape `ax internal front-of-house prepare-agenda` so the Front-of-House
agenda remains a thread-backed projection, but each item carries triage and
placement data and the flat agenda list is ordered as the director will walk it:
search frame first, then canonical plane -> context groups, then Unfiled.

Linked product plan: this is the consumer half of Route B-hybrid item C in
`docs/alexandria/plans/front-of-house-handshake/plan.md`. The issue also
references `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`; that
file is not present in this checkout, so this plan treats the issue text and the
handshake plan as the controlling scope and leaves the methodology reshape as a
downstream consumer.

Issue comments checked: the only current issue comment records Fabro run
`01KWC0H34FJFSV97GXG2YTCY38`; it adds no extra technical requirements.

## Scope

This slice changes only the deterministic Front-of-House agenda projection and
its generated runtime artifacts in `packages/ax`.

In scope:

1. Extend `FrontOfHouseAgendaItem` with derived `confidence`, `origin`,
   optional `basis`, `context`, `plane`, and retained `concerns` card links.
2. Keep `agenda.json` at `schemaVersion: 1` and keep `threads.json` at
   `library-threads.v1`; no thread schema write or producer dependency is added.
3. Resolve placement from thread concerns plus bundle cards, with orphan-safe
   fallbacks.
4. Sort the flat agenda list as `frame -> canonical plane -> context -> Unfiled`.
5. Update `current-item.md`, `for-raven.md`, and `RESIDUAL-GAPS.md` readback so
   Raven and the director can see triage and placement.
6. Add or update deterministic unit and black-box CLI tests for the full issue
   matrix.

## Non-Goals

1. Do not change the Back-of-House producer, `threads.json`, or
   `library-search-prior.json`.
2. Do not add status mutation, endpoints, or new Ledger event types.
3. Do not change the shipped plugin workflow or Raven skill prompts in this
   slice.
4. Do not implement the EL3 methodology reshape: plane thesis opener,
   held-back hot-spot sequencing, `section-confirmed`, and Notepad mirroring are
   follow-ups.
5. Do not write to `docs/alexandria/library/`.

## Current Gap

Current code in `packages/ax/src/domain/library-front-of-house.ts` projects open
threads into:

```ts
FrontOfHouseAgendaItem {
  evidenceRefs;
  id;
  kind;
  sourcePath;
  text;
  title;
}
```

That projection drops `thread.concerns`, `thread.confidence`, and
`thread.emittingMove`; it preserves only `sourceEvidence` as `evidenceRefs`.
`buildFrontOfHouseAgenda` also preserves the incoming thread order, which means
the director sees a flat queue instead of a plane/context walk.

Current `runPrepareAgenda` in `packages/ax/src/commands/front-of-house.ts` reads
only `threads.json`. It does not inspect bundle cards, so it cannot resolve
`cardId -> cardPath/context/plane` or fall back from concern context to the
context's plane.

Current `for-raven.md`, `current-item.md`, and `RESIDUAL-GAPS.md` do not cite
origin, confidence, basis, placement, or concerned cards. A low-confidence
search-prior inference therefore reads the same as a source-discovered gap, and
an unresolved inference loses the prior basis in residual readback.

## Architectural Boundaries

`packages/ax` owns this slice. The CLI remains deterministic and
non-interactive.

`buildFrontOfHouseAgenda` must stay pure. It should receive threads plus a
resolver or precomputed card/context map; it should not read the filesystem.

`runPrepareAgenda` has bundle access and should build the resolver. Use the
existing catalog loader path where practical, but use it only as resolver input:
catalog metadata warnings must not become a new `prepare-agenda` failure mode.
The existing hard failure remains invalid `threads.json` syntax/schema.

To avoid tightening bundle path behavior, load the bundle as its own catalog
root when building the resolver, for example `loadLibraryCatalogRoot(bundle,
bundle)`. That keeps absolute scratch bundle paths valid and avoids requiring
the bundle to live under the project workspace.

The resolver should map:

1. `cardId`/`sourceCardId` -> `{ context, plane, cardPath }` from
   `catalog.cards`.
2. `context` -> `plane` from `catalog.areas` when the context has a single
   unambiguous plane.
3. Canonical plane order from the existing catalog helper. If
   `orderProductCardPlanes` remains local, export it or add a narrow exported
   wrapper rather than duplicating the ranking.

Origin derivation is projection-only and never throws:

1. `frame` when `thread.emittingMove === "translate_search_prior"` and the
   current producer's search-frame discriminator matches `thread.kind ===
   "missing_context"`.
2. `inference` when `thread.emittingMove === "translate_search_prior"` and it is
   not the frame item.
3. `source` otherwise, including absent or unknown `emittingMove`.

Placement derivation is projection-only and never drops an item:

1. Frame items get `context: "framing"` and `plane: "framing"` and sort first.
2. For normal items, resolve each concern in authored order:
   `context = concern.context ?? card.context ?? "unfiled"`.
3. Resolve plane as
   `concern.plane ?? card.plane ?? contextPlane(context) ?? "unfiled"`.
4. Use the first concern that yields a non-`unfiled` placement as the item's
   primary `context`/`plane`.
5. If no concern resolves, use `context: "unfiled"` and `plane: "unfiled"`.
6. Retain all concerned-card links as
   `{ cardId: concern.cardId ?? concern.sourceCardId, cardPath?: card.path }`.
   A missing card keeps `cardId` and omits `cardPath`.

Ordering should be implemented by an agenda-specific comparator, not by reusing
the current catalog `compareThreads` order. The issue requires:

1. Frame items first.
2. Non-unfiled groups next, with planes in canonical order:
   `strategy -> product -> learning`; unknown planes sort after canonical planes
   but before Unfiled.
3. Contexts sorted stably within each plane, matching the Index's top-down shape
   for the current catalog: canonical plane order plus deterministic context
   label ordering.
4. Items within a context sorted by severity high -> medium -> low, then family
   (`gap` / `stage2_question` before `hot_spot`), then kind/title/id for
   deterministic ties.
5. `plane: "unfiled"` groups last. A known context with an unresolved plane
   still sorts in the Unfiled plane group rather than being dropped.

Parsing should stay compatible with the unchanged `agenda.json` schema version.
Freshly prepared agendas must include the new fields. For stale runtime agenda
files that lack additive fields, `parseFrontOfHouseAgenda` may apply
legacy-safe defaults (`origin: "source"`, `context/plane: "unfiled"`,
`concerns: []`, and a conservative confidence value) so existing runtime files
do not fail only because `schemaVersion` stayed `1`.

State events remain unchanged. `record-turn`, answer recording, patch
validation, and thread lifecycle write-back should continue to use the existing
event payload shape unless a separate issue extends event schemas.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH agenda domain | `packages/ax/src/domain/library-front-of-house.ts` | Add agenda item fields, pure placement/origin projection, agenda comparator, parser support, markdown/residual rendering |
| Catalog ordering helper | `packages/ax/src/domain/library-catalog.ts` | Export canonical plane ordering or a narrow rank/order helper for FoH reuse |
| FoH CLI command | `packages/ax/src/commands/front-of-house.ts` | `prepare-agenda` builds a card/context resolver from the bundle and passes it into the pure agenda builder |
| Catalog loader import | `packages/ax/src/effects/library-graph-loader.ts` consumer only | Reuse `loadLibraryCatalogRoot` from the command path; no loader behavior change expected |
| Unit tests | `packages/ax/tests/library-front-of-house.test.ts` | Cover projection fields, origin, placement fallback, sorting, parser, renderer, residual readback |
| Black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Cover `prepare-agenda` output fields/order, current/for-raven markdown, orphan safety, source-only regression |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Shipped plugin skills | None in this slice | No plugin validation or eval rerun required for skill behavior |
| FoH Raven runtime input files | `for-raven.md` and `current-item.md` include placement and triage fields for the staged item | Deterministic ax tests assert the generated markdown; methodology prompt changes are deferred |
| CLI JSON artifact | `agenda.json` item objects gain additive fields while `schemaVersion` remains `1` | Parser and tests must tolerate additive fields and preserve existing command exit behavior |
| Ledger events | None | Do not change event schema tests except as needed to prove no regression |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves pure projection, ordering, rendering, and residual readback |
| FoH CLI black-box tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Proves `prepare-agenda`, staged files, exit codes, and important output fields |
| Related confirmation CLI regression | `cd packages/ax && bun test tests/library-confirmation-cli.test.ts` | Guards the existing prepare-agenda integration path used by confirmation flow tests |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches interface changes across commands/tests |
| AX lint/format check | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript in package style |

If time is tight during implementation, run the first three commands before
handoff and name any skipped package-wide checks explicitly.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `packages/ax` deterministic CLI | Covered by Bun unit and integration tests | Add/adjust deterministic tests in this slice | Commands listed above |
| Shipped `front-of-house-walk` skill/workflow | Existing eval rows are owed by the broader FoH proof work, not changed here | No eval rerun required because this slice does not edit plugin skills, agents, prompts, or workflows | None |
| Contributor planning skill | Used only to create this plan | No eval-harness coverage required | None |

Rationale: the change is a deterministic CLI projection and artifact-rendering
slice. It changes what Raven will read from generated files, but it does not
change reusable agent or skill instructions. The EL3 methodology reshape should
decide whether to add or rerun FoH walk evals when it edits the plugin prompts
or workflow.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The resolver turns catalog metadata warnings into new prepare failures | Treat catalog load output as best-effort resolver data; keep invalid `threads.json` as the only new-input failure gate |
| `orderProductCardPlanes` is copied and later drifts from the Index | Export/reuse the existing helper or a narrow rank wrapper from `library-catalog.ts` |
| A multi-concern thread links cards in several contexts but the item has one placement | Pick the first authored concern with a resolved placement, retain all card links, and test the rule |
| Search-frame detection overfits the current producer discriminator | Isolate origin detection in one helper and document the current rule: `translate_search_prior` + `missing_context` |
| Same `agenda.json` schema version but new fields breaks stale runtime files | Parser accepts legacy agenda items with defaults; freshly prepared agenda tests assert real derived values |
| Existing source-only fixtures use noncanonical legacy planes | Keep source-only regression expectations focused on `origin: "source"` and a single group; use dedicated canonical-plane fixtures for ordering tests |
| Orphan concern crashes card lookup | Resolver returns `undefined` for missing cards, retains `cardId`, omits `cardPath`, and lands the item in Unfiled |
| Residual markdown loses inference basis again | Extend `FrontOfHouseResidualGap` from agenda items and add direct markdown assertions for `origin`, `confidence`, and inference `basis` |

## Implementation Steps

1. Export or expose canonical plane ordering from `library-catalog.ts`.
   Prefer a small exported helper over duplicating the `strategy -> product ->
   learning` ranking in FoH code.

2. Extend FoH domain types in `library-front-of-house.ts`:
   add `FrontOfHouseAgendaOrigin`, concerned-card link type, and the new fields
   on `FrontOfHouseAgendaItem`. Import `LibraryCatalogConfidence` as a type.

3. Add pure agenda projection helpers:
   `originFromThread`, `basisFromThread`, `placementFromThread`, and an
   agenda-specific comparator. Keep these helpers deterministic and covered by
   unit tests.

4. Change `buildFrontOfHouseAgenda` to accept resolver input, such as:
   `resolveCard(cardId)`, `resolveContextPlane(context)`, and optional plane
   ordering. Preserve a default resolver for simple unit tests, but ensure the
   command path passes the real bundle resolver.

5. Update `parseFrontOfHouseAgenda` and current-item parsing so the new fields
   round-trip through `agenda.json` and `current-item.json`. Preserve
   schema-version `1` and apply legacy defaults only when reading old artifacts.

6. Update markdown renderers:
   `renderFrontOfHouseCurrentItemMarkdown` and `renderFrontOfHouseForRaven`
   should include a plane/context placement header plus `kind`, `origin`,
   `confidence`, optional `basis`, evidence refs, and concerned-card links.
   Since the current architecture renders only the staged item, do not create a
   new full-agenda markdown surface.

7. Extend residual accounting:
   add `confidence`, `origin`, optional `basis`, `context`, `plane`, and
   `concerns` to `FrontOfHouseResidualGap`; populate them from agenda items in
   `unresolvedFrontOfHouseGaps` and the `runFinalize` replay path; render
   `origin`, `confidence`, and inference `basis` in `RESIDUAL-GAPS.md`.

8. Update `runPrepareAgenda`:
   after parsing `threads.json`, load the bundle catalog root best-effort,
   build `cardId -> card metadata` and `context -> plane` maps, pass the
   resolver into `buildFrontOfHouseAgenda`, then write agenda/current files as
   today. Do not change stdout/stderr success contracts except for existing
   `itemCount` reflecting the sorted agenda.

9. Add unit tests in `library-front-of-house.test.ts` for:
   source/inference/frame origin derivation; basis on inference items; concern
   context over card fallback; card fallback; missing-card Unfiled; frame-first
   ordering; canonical Strategy/Product/Learning ordering; Unfiled last;
   severity-before-family ordering; retained `cardId`/`cardPath`; markdown
   headers; and residual readback.

10. Add black-box tests in `library-front-of-house-bundle.test.ts` for:
    a multi-context prior-bearing bundle; search-frame first; source-only
    single-context regression; orphan-safe missing card; `for-raven.md`
    placement/triage output; `agenda.json` additive fields; and unchanged
    command exit codes.

11. Run the deterministic verification commands and update any snapshots or
    expectations only where they reflect the new additive agenda contract.

## Acceptance / Exit Criteria

1. `prepare-agenda` emits a flat `agenda.json` whose items all include
   `confidence`, `origin`, optional `basis`, `context`, `plane`, and retained
   `concerns` links.
2. `origin` is derived as: search-frame `missing_context` +
   `translate_search_prior` -> `frame`; other `translate_search_prior` ->
   `inference`; absent/other emitting moves -> `source`.
3. The frame item has `origin: "frame"`, `context: "framing"`, and sorts first.
4. Agenda ordering is contiguous by `plane -> context`, with canonical
   `strategy -> product -> learning` plane order and Unfiled last.
5. Within a context, items sort by severity high -> medium -> low, then family,
   then deterministic tie-breakers.
6. Concern card links are retained with `cardId` and `cardPath` when resolvable;
   missing cards do not crash and do not invent paths.
7. A concern with no resolvable context lands in `context: "unfiled"` and
   `plane: "unfiled"` and is not dropped.
8. `for-raven.md` and `current-item.md` show the staged item's plane/context
   header plus triage fields.
9. `RESIDUAL-GAPS.md` cites unresolved items' `origin` and `confidence`, and
   cites `basis` for inference items.
10. Source-only single-context bundles still prepare successfully with
    `origin: "source"` on every item and no frame or Unfiled groups.
11. `agenda.json` remains `schemaVersion: 1`; `threads.json` remains
    `library-threads.v1`; no new write path or status mutation is introduced.
12. The verification commands in this plan pass, or any skipped command is
    explicitly called out with the reason.

## Deferred Follow-Ups

1. EL3 methodology reshape: plane-thesis opener, held-back hot-spots,
   section-walk pacing, and `section-confirmed`.
2. Library Notepad viewer mirroring of the same triage/grouping.
3. Producer-side discriminator hardening if future search-prior threads need a
   more explicit frame marker than `translate_search_prior` + `missing_context`.
4. Event schema enrichment for turn/residual events if downstream analytics need
   origin/confidence/placement outside `agenda.json`.
5. FoH walk eval additions or reruns when plugin prompts/workflow change in the
   methodology slice.
