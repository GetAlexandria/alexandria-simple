# FEAT-004 Vision Source Intake

## Summary

FEAT-004 adds the Vision source strip and one-at-a-time source intake MVP for
Alexandria Next. Users can add a file, a URL, or a typed note from the Vision
onboarding screen. Each intake creates a shared Alexandria `SourceItem`,
rewrites the shared source projection at `sourcesPath`, and attaches the source
ID to Raven Vision onboarding.

This is the detailed technical scope artifact for GitHub issue #190. The
product-plan placement for this work is preserved in
`docs/alexandria/plans/raven-onboarding-experience/plan.md` under
`## FEAT-004: Vision Source Intake Adds Real Source Items`, directly after the
FEAT-003 section.

## Product Context

- Product plan: `raven-onboarding-experience`
- Ticket: `[FEAT-004] Vision source intake adds real source items`
- Run ID: `01KSX5VHA1EB084YWMW0P5ACFD`
- Outcome: O-2
- Tier: must
- Blocked by: FEAT-003
- Blocks: FEAT-005, FEAT-006
- Base: FEAT-003 merged at `cc20edfca0aa689dfbd70aba895f5c946b6b2240`
- Primary packages: `packages/ax-next`, `packages/viewer-next`

FEAT-004 builds on the FEAT-003 manual Vision slot-review baseline. It must not
replace, shrink, or reinterpret the broader Raven onboarding plan.

## Goals

1. Show an `Add sources` area at the top of Vision onboarding.
2. Create durable shared `SourceItem` records for file, URL, and typed-note
   intake.
3. Store captured originals under `docs/alexandria/sources/originals/`.
4. Rewrite the source projection at `.alexandria-next/sources.jsonl` through
   the configured `sourcesPath`.
5. Attach created source IDs to `agents.raven.onboarding.vision.sourceItemIds`.
6. Preserve existing Vision slot text and status when sources are added.
7. Prove behavior through Web UI and CLI/runtime verification.

## Non-Goals

1. Source-code processing. The schema may include `kind: "source_code"`, but
   processing source-code directories is out of scope.
2. Folder expansion, repository scanning, or source-code directory ingestion.
3. Source deletion, removal from Vision, title editing, or source card actions.
4. Voice note or conversation capture.
5. Raven drafting Vision slots from source material.
6. Banking Vision or generating Source of Truth artifacts.
7. Source sliders, source-depth ratings, or a textarea that accepts one source
   per line.
8. Alexandria 1 CLI, viewer, plugin, skill, or eval behavior.
9. Writes to `docs/alexandria/library/`.

## Source Ownership Boundary

Sources are shared Alexandria state, not Raven-specific state. The source
inventory belongs to the general Library/source inbox model. Raven Vision only
stores shared source IDs in `sourceItemIds`.

Do not introduce a `RavenSourceItem` shape. The core `SourceItem` record should
stay compact. Original URL, capture type, typed-note metadata, fetch timestamp,
and similar intake details belong in the generated Markdown file under
`sources/originals/`, not in the core source projection.

## Source State Contract

Add a shared source item model in `packages/ax-next`:

```ts
interface SourceItem {
  id: string;
  kind: "file" | "source_code";
  title: string;
  sourcePath: string;
  pathType: "file" | "directory";
  status: "unprocessed" | "processing" | "processed" | "failed";
  addedBy: "user" | "agent";
  addedAt: string;
  updatedAt: string;
  contentHash?: string;
  latestSummaryPath?: string;
  latestSummaryExcerpt?: string;
}
```

MVP rules:

1. File, URL, and typed-note intake all create `kind: "file"` source items.
2. Runtime-created source items use `pathType: "file"`.
3. New items start with `status: "unprocessed"`.
4. `sourcesPath` defaults to `.alexandria-next/sources.jsonl`.
5. `sourcesPath` is JSONL with one JSON object per current source item.
6. Reducers rebuild the source inventory from ledger events and rewrite the
   projection atomically or through the existing safe-overwrite helper.
7. Retried source creates should avoid duplicate records through a stable
   source ID or idempotency key.

## Event Contract

Add validated ledger event types with `additionalProperties: false`:

| Event type | Required payload fields | Notes |
|------------|-------------------------|-------|
| `source.added` | `sourceId`, `kind`, `title`, `sourcePath`, `pathType`, `addedBy` | Optional `contentHash`; reducer owns status and timestamps |
| `raven.vision.source_attached` | `sourceId` | Appends the shared source ID to Vision `sourceItemIds` |

The existing FEAT-003 `raven.vision.started` and slot event contracts remain
unchanged.

## Raven Vision Attachment Contract

Extend FEAT-003 Vision onboarding state additively:

```ts
interface RavenVisionOnboardingState {
  schemaVersion: 1;
  status: "not_started" | "in_progress" | "ready_to_bank";
  sourceItemIds: string[];
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  startedAt?: string;
  updatedAt?: string;
}
```

Rules:

1. Missing `sourceItemIds` in FEAT-003-era config parses as `[]`.
2. `raven.vision.source_attached` appends the ID if it is not already present.
3. Attaching a source updates Vision timestamps but does not alter slot text,
   slot status, reviewed timestamps, or `ready_to_bank` computation.
4. Attaching a source before Vision starts should return a structured runtime
   error unless implementation chooses an explicit combined start-and-add path.

## Runtime API Contract

Add local runtime endpoints under the existing AX2 runtime server:

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/sources` | Return the shared source projection from `sourcesPath` |
| `POST` | `/api/sources` | Create one source item from one file, URL, or typed note |
| `POST` | `/api/raven/onboarding/vision/source-items` | Attach an existing shared source ID to Vision |
| `GET` | `/api/raven/onboarding/vision` | Return FEAT-003 Vision projection plus attached source IDs and rows |

Runtime requirements:

1. Validate input before side effects.
2. Accept exactly one source per create request.
3. Copy uploaded file bytes into `sources/originals/` before appending events.
4. Fetch only `http:` and `https:` URLs, with timeout and response-size bounds.
5. Save fetched URLs as Markdown captures under `sources/originals/`.
6. Save typed notes as Markdown captures under `sources/originals/`.
7. Include capture metadata in generated Markdown files.
8. Append both `source.added` and `raven.vision.source_attached` for
   successful Vision intake.
9. Reuse the runtime mutation semaphore so event append, reducer updates,
   projection rewrite, and config persistence do not interleave.

## Viewer UX Contract

The FEAT-003 Vision onboarding view gains a top source area.

Required behavior:

1. Show an `Add sources` area above the slot grid.
2. Provide explicit one-at-a-time controls for file, URL, and typed note.
3. Render attached sources in a Vision source strip.
4. Show source title, kind, path, and processing status at minimum.
5. Reload the viewer and show the same attached sources from runtime state.
6. Preserve the existing slot cards, status chips, text editors, approve/skip
   behavior, and `Bank Vision` availability behavior.
7. Show inline source-intake errors without clearing the last known Vision
   projection.
8. Do not add sliders or one-source-per-line textarea behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 config and paths | `packages/ax-next/src/domain/config.ts`, `paths.ts`, `commands/init.ts`, `tests/init.test.ts` | Add `sourcesPath` defaults and source originals helpers |
| AX2 source domain | `packages/ax-next/src/domain/sources.ts` and focused tests | Add `SourceItem`, reducer, projection parse/serialize, hashing, and atomic rewrite |
| AX2 events | `packages/ax-next/src/domain/state-events.ts`, `tests/events.test.ts` | Add source and Vision attach event validation |
| AX2 Raven Vision | `packages/ax-next/src/domain/raven-vision.ts`, `tests/raven-vision.test.ts` | Add `sourceItemIds` and attach reducer behavior |
| AX2 state/CLI | `packages/ax-next/src/domain/project-state.ts`, `effects/project-state-loader.ts`, `commands/state.ts`, `tests/state.test.ts`, `tests/cli.test.ts` | Expose source projection and attached source IDs |
| AX2 runtime | `packages/ax-next/src/effects/runtime-server.ts`, `tests/runtime-server.test.ts` | Add source create/read APIs, capture writes, projection rewrite, and attach endpoint |
| Viewer runtime | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decode source projections and add create/attach operations |
| Viewer Vision UI | `packages/viewer-next/src/components/library/VisionOnboardingView.tsx` and nearby components | Add source area and source strip above the existing slot grid |
| Viewer e2e fixture | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Cover file, URL, note, reload, and slot preservation |
| Alexandria Next plugin | No files expected | No guided play behavior changes planned |

## Verification Plan

Automated verification:

| Area | Command | Purpose |
|------|---------|---------|
| AX2 config/state | `cd packages/ax-next && bun test tests/init.test.ts tests/state.test.ts` | Proves `sourcesPath`, originals paths, projection, and state output |
| AX2 events | `cd packages/ax-next && bun test tests/events.test.ts` | Proves event schema validation |
| AX2 Vision reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves source attachment preserves slots |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves file, URL, note, projection rewrite, ledger events, and errors |
| AX2 CLI black-box | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves output fields and exit-code behavior |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches domain and config type drift |
| Viewer runtime | `cd packages/viewer-next && pnpm run test` | Proves runtime schemas and client calls |
| Viewer browser | `cd packages/viewer-next && pnpm run test:e2e` | Proves intake, strip, reload, and no forbidden controls |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files change | Required only if plugin payload changes |

Manual verification:

1. Add a file source and verify it appears in the Vision source strip.
2. Add a URL source and verify it appears as a file-backed source item.
3. Add a typed note and verify it appears as a file-backed source item.
4. Reload the viewer and verify sources remain visible.
5. Inspect `.alexandria-next/sources.jsonl` and verify one JSONL record per
   source item.
6. Inspect `docs/alexandria/sources/originals/` and verify file, URL, and note
   captures are stored there.
7. Inspect the ledger and verify `source.added` and
   `raven.vision.source_attached` events.
8. Confirm Vision slot text and statuses are unchanged after source additions.

## Eval Impact

No eval-harness rerun is required for FEAT-004 as scoped because the slice
changes deterministic AX2 runtime behavior and Viewer UI behavior, not reusable
agent, skill, or eval-backed play behavior.

If implementation changes Alexandria Next plugin skills, guided Raven behavior,
or reusable agent behavior, revise this section before merge and use `EVALS.md`
to select a targeted rerun or add a Next Raven eval case.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Source state becomes Raven-specific | Implement shared `SourceItem` state and store only IDs in Vision |
| Source metadata bloats core records | Put capture metadata in Markdown originals |
| Adding sources mutates Vision slot state | Add reducer/runtime/e2e tests that assert slot text/status before and after |
| FEAT-003 config fails to parse | Treat missing `sourcesPath` as default and missing `sourceItemIds` as `[]` |
| Projection writes race with other mutations | Reuse runtime mutation semaphore and atomic/safe-overwrite helpers |
| File upload path is not durable | Copy uploaded bytes to `sources/originals/` before event append |
| URL fetch hangs or stores too much content | Restrict protocols and add timeout and response-size bounds |
| Retried create duplicates source rows | Use stable source IDs or idempotency keys |
| UI regresses into prototype controls | Add e2e assertions for no sliders and no one-source-per-line textarea |

## Acceptance Criteria

1. Vision onboarding shows an `Add sources` area at the top.
2. Adding a file creates a `SourceItem` in the `sourcesPath` projection.
3. Adding a URL fetches the URL and saves a Markdown file under
   `docs/alexandria/sources/originals/`.
4. Adding a typed note saves Markdown under
   `docs/alexandria/sources/originals/`.
5. New source items are attached to
   `onboarding.vision.sourceItemIds`.
6. Existing slot text/status is unchanged when sources are added.
7. No source sliders or "one per line" textarea is introduced.
8. Web UI verification covers file, URL, note, source strip, and reload.
9. CLI/runtime verification covers `sourcesPath`, originals, ledger events,
   and atomic or safe-overwrite projection rewrites.

## Deferred Follow-Ups

1. FEAT-005 Raven slot-by-slot collaboration from attached source items.
2. FEAT-006 adding more sources during mixed slot review states.
3. Source processing and summaries under
   `docs/alexandria/sources/processed/<sourceId>/<runId>.md`.
4. Source deletion/removal, source title editing, and source card actions.
5. Top-level Sources or Inbox destination outside Vision.
6. Source-code intake and processing.
7. Voice note and conversation capture.
8. Rich URL extraction, authenticated fetches, and readability-style Markdown
   conversion.
9. Vision banking and Raven Source of Truth generation.
