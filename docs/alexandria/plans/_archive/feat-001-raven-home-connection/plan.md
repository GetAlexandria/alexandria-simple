# FEAT-001: Home Shows Raven Connection State

- Issue: GitHub #187, `[FEAT-001] Home shows Raven connection state`
- Run ID: `01KSWS1B5D0PCXZZHFJ4CGAZJG`
- Product plan: `raven-onboarding-experience`
- Source context:
  `docs/alexandria/plans/raven-onboarding-experience/plan.md`,
  `docs/alexandria/implementation-plans/raven-onboarding-experience/tickets/FEAT-001.md`,
  and `docs/alexandria/implementation-plans/raven-onboarding-experience/CONTEXT_BRIEFING.md`
- Goal: make Viewer Next's first screen clearly show whether Raven is connected,
  keep Raven on the bottom agent shelf, and route the connected user toward the
  later Vision power-up without building Vision onboarding in this slice.

## Scope

This slice changes the initial Alexandria Next Home state only.

In scope:

1. Add a real Home surface to the currently mounted Viewer Next route.
2. Keep the existing bottom agent shelf visible on Home and Library.
3. Drive Raven's inert/glowing coin state from the existing runtime/plugin
   connection projection.
4. Show `Connect Raven` when there are no active Alexandria Next plugin
   connections.
5. Show `Power up Raven: Vision` when at least one active plugin connection
   exists.
6. Keep top navigation app-level: explicit Home/Library affordances, Playbook,
   Info Hub, and Ledger, with no Raven top-level tab.
7. Add focused AX2/runtime and Viewer tests for disconnected and connected
   projections.

## Non-Goals

This slice does not build the Vision onboarding flow.

Out of scope:

1. Source intake state, `sourcesPath`, and source processing APIs.
2. Raven Vision slots, Knowledge Bank persistence, and Source of Truth output.
3. New Raven play contracts or plugin skill behavior.
4. Multi-agent connection modeling.
5. `agents.raven.connection` or any other persisted Raven connection field in
   `.alexandria-next/alexandria-config.json`.
6. Library card generation or writes to `docs/alexandria/library/`.
7. Alexandria 1 viewer, CLI, skills, or plugin behavior.

## Linked Product-Plan Summary

The broader Raven onboarding plan says the first-run experience starts on
Alexandria Home, not inside the prototype's old `1.1` to `1.9` onboarding rail.
Raven appears as an agent shelf affordance, not as top-level navigation. Raven's
first connection state is runtime-derived: for this slice, any active
Alexandria Next plugin connection means Raven is connected. When disconnected,
Home asks the user to connect Raven. When connected, Home should show Raven's
coin glowing and offer `Power up Raven: Vision`.

The broader plan also introduces shared source intake, Vision slot review,
Knowledge Bank state, and play unlocks. Those remain deferred follow-ups for
FEAT-002, FEAT-003, and later implementation slices.

## Current Gap

Viewer Next currently ships `packages/viewer-next/src/pages/index.astro`, which
mounts `LibraryBrowserApp`. That app starts with the Library open and uses
`LibraryBrowserShell`, `StoneTopBar`, and `RavenBench`.

Current behavior:

1. Clicking the Alexandria wordmark calls `onHome`, but the main area becomes
   blank instead of rendering a Home surface.
2. The Library tab is an explicit way back to Library, but Home is reachable
   only through the wordmark.
3. `RavenBench` renders Raven on the bottom shelf, but its lit state is tied to
   hover/open UI state, not runtime connection state.
4. The Raven Quick Bar contains prototype labels such as `Wake Raven`, not the
   Home CTA state required by this issue.
5. Viewer runtime code can fetch `/api/state`, `/api/events`, and
   `/api/health`, but it does not decode `/api/connections`.

AX2 already has the important runtime projection:

1. `GET /api/connections` returns `activeCount`, `totalCount`, individual
   connection rows, and warnings.
2. `ax2 inspect connections list --json` exposes the same connection summary
   for CLI verification.
3. Connection activity is derived from lease expiry and process liveness in
   `packages/ax-next/src/domain/connection-status.ts`.

The missing implementation is Viewer consumption and rendering of this existing
projection, plus a narrowly focused disconnected test case for the runtime
endpoint if current coverage is not explicit enough.

## Architectural Boundaries

AX2 owns deterministic connection projection. Viewer Next should consume that
projection through the local runtime API; it should not read connection lease
files directly and should not infer connection state from local storage or UI
interaction.

Viewer Next owns Home, navigation, and the agent shelf presentation. Pure
visual components should receive ordinary props such as
`ravenConnectionState`; Effect code should remain in `src/app/runtime/*` and in
small React hook adapters.

The Next plugin owns guided play behavior. This slice should not add or change
plugin plays, agents, skills, or monitors. Existing plugin connections are only
observed.

Runtime-derived Raven connection state must stay out of project config. No
implementation in this slice should add `agents.raven.connection` or create a
Raven config branch.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Viewer mounted route | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `LibraryBrowserShell.tsx` | Initial app can render Home instead of a blank area; Library remains explicitly reachable |
| Viewer Home UI | New small component near `packages/viewer-next/src/components/library/` or `packages/viewer-next/src/app/home/` | Home shows disconnected and connected Raven CTAs from runtime state |
| Viewer agent shelf | `packages/viewer-next/src/components/library/RavenBench.tsx` | Raven coin glow is driven by connection state, not by hover/open state |
| Viewer top navigation | `packages/viewer-next/src/components/library/StoneTopBar.tsx` | Adds an explicit Home affordance while preserving app-level tabs and omitting Raven |
| Viewer runtime boundary | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decodes and fetches `/api/connections` with narrow browser-facing schemas |
| Viewer fixtures/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts`, component/story tests as needed | Covers disconnected Home, connected Home, Raven shelf, and no Raven top nav |
| AX2 runtime tests | `packages/ax-next/tests/runtime-server.test.ts` and existing connection CLI tests | Confirms `/api/connections` exposes active and inactive connection summaries for viewer use |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | None in this slice | No plugin eval rerun; run plugin validation only if implementation unexpectedly touches the plugin package |
| Raven guided behavior | None in this slice | Vision onboarding and Raven play contracts are deferred |
| AX2 CLI behavior | No new command expected; existing `ax2 inspect connections list --json` remains the CLI projection | Add or preserve black-box coverage for output fields if tests are touched |
| Viewer user behavior | Home now communicates Raven readiness and offers the correct CTA | Viewer tests and stories should cover both runtime projections |

## Runtime Contract

Use the existing `GET /api/connections` response as the Raven connection
projection for this slice.

Viewer-facing interpretation:

```ts
type RavenConnectionState = "disconnected" | "connected";

function ravenConnectionState(summary: { activeCount: number }) {
  return summary.activeCount > 0 ? "connected" : "disconnected";
}
```

Disconnected state:

1. Raven coin is inert.
2. Home shows `Connect Raven`.
3. The Power-up CTA is absent.

Connected state:

1. Raven coin glows.
2. Home shows `Power up Raven: Vision`.
3. The `Connect Raven` CTA is absent.

Failure/loading behavior:

1. While `/api/connections` is loading, default Raven to inert and avoid showing
   `Power up Raven: Vision`.
2. If `/api/connections` fails, keep the UI inert and show `Connect Raven`
   rather than implying readiness.
3. Do not write any fallback state to config or local storage.

## Home / Navigation Plan

Home should be the first screen for Viewer Next. The existing Library browser
remains one click away.

Implementation shape:

1. Change `LibraryBrowserApp` to start in `home` view instead of opening the
   Library immediately.
2. Render a Home component when the active view is `home`.
3. Keep the existing Library browser content behind the Library tab.
4. Update `StoneTopBar` so the wordmark may still link Home, but a separate
   visible Home control also exists.
5. Keep `Library`, `Playbook`, `Info Hub`, and `Ledger` as app-level tabs.
6. Do not add Raven to `stoneTabs`.
7. Ensure no production Home UI renders the prototype numeric onboarding rail.

CTA behavior:

1. `Connect Raven` should be a real button or link-style button with stable
   accessible text. It may open Raven's shelf/Quick Bar or a minimal connection
   panel, but it must not mutate config.
2. `Power up Raven: Vision` should be a real button with stable accessible text.
   Until FEAT-002/FEAT-003 land, it can route to a disabled/placeholder Vision
   target or open Raven's Quick Bar, but it must be clearly distinct from the
   disconnected CTA.
3. The implementation must not start Vision onboarding state or write
   `agents.raven`.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 runtime connection projection | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Confirms `/api/connections` exposes enough active/inactive projection for Viewer |
| AX2 connection CLI projection | `cd packages/ax-next && bun test tests/claude-monitor.test.ts tests/codex-monitor.test.ts` or narrower existing connection tests | Preserves `ax2 inspect connections list --json` output fields and exit code behavior |
| AX2 state/config guard | `cd packages/ax-next && bun test tests/state.test.ts` | Confirms `ax2 inspect state --json` remains deterministic and no Raven connection config is introduced |
| Viewer runtime client | `cd packages/viewer-next && bun test src/app/runtime/client.test.ts` | Proves `/api/connections` schema decoding covers activeCount `0` and `1` |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves disconnected and connected Home CTAs, Raven coin state, top nav, and Library return path |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro/React/TypeScript drift |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files are touched | The intended slice does not touch plugin payloads |

Manual verification:

1. Open Viewer Next with no active connection and verify inert Raven plus
   `Connect Raven`.
2. Start or fixture an active Alexandria Next plugin connection and verify
   glowing Raven plus `Power up Raven: Vision`.
3. Verify the top navigation includes no Raven tab and provides explicit Home
   and Library navigation.
4. Inspect `.alexandria-next/alexandria-config.json` and confirm no
   `agents.raven.connection` field exists.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Viewer Next Home and shelf | Playwright and browser runtime tests | Add deterministic e2e/component/runtime coverage; no LLM eval needed | `cd packages/viewer-next && pnpm run test:e2e` plus runtime tests |
| AX2 connection projection | Bun tests for runtime and monitor connections | Add or preserve focused tests for disconnected and connected summaries | `cd packages/ax-next && bun test tests/runtime-server.test.ts` |
| Alexandria Next plugin skills/agents | Plugin validation and future play evals | No change in this slice | None unless plugin files are touched |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin behavior | No rerun because Alexandria 1 is untouched | None |

No eval-harness case is required for FEAT-001 because the slice changes
deterministic Viewer and AX2 runtime behavior, not reusable agent or skill
behavior. If implementation unexpectedly edits product-facing skill files, use
`EVALS.md` to choose the relevant rerun set before merge.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Raven appears connected because the user opened or hovered the coin | Separate visual open/hover state from `RavenConnectionState`; add tests that disconnected hover/open does not reveal the connected CTA |
| Stale connection leases make Raven glow after the plugin is gone | Use `/api/connections.activeCount`, which already filters by expiry and PID liveness; keep AX2 tests around stale leases |
| Viewer starts on a blank Home again | Add e2e coverage for Home heading/CTA and for returning to Library through the Library tab |
| Home becomes a hidden Vision prototype | Keep this slice to CTA and shelf state; do not add slots, source intake, Knowledge Bank, or config reducers |
| Raven leaks into top-level navigation | Keep Raven actions in the shelf/Quick Bar and assert top nav does not contain a Raven tab |
| Connection state gets persisted in `alexandria-config.json` | Treat runtime connections as projection-only and inspect config in tests/manual verification |
| Duplicated Viewer shell paths drift further | Patch the currently mounted `LibraryBrowserApp` path for product behavior; leave consolidation with `src/app/ViewerShell` as a follow-up |

## Implementation Steps

1. Add a narrow Viewer runtime schema and client operation for
   `/api/connections`.
2. Add a small React hook/adapter that resolves `RavenConnectionState` from the
   connection summary and defaults to disconnected on loading/error.
3. Add the Home component with the disconnected and connected CTA variants.
4. Update `LibraryBrowserApp` and `LibraryBrowserShell` to use an explicit
   `home`/`library` view model and start on Home.
5. Update `StoneTopBar` with a visible Home control and keep Raven out of
   `stoneTabs`.
6. Update `RavenBench` so Raven receives `connectionState` and renders inert or
   glowing coin imagery from that state.
7. Adjust Raven Quick Bar copy only as needed for this entry point; avoid
   implementing Vision or Knowledge Bank behavior.
8. Add Viewer runtime tests for decoding `activeCount: 0` and `activeCount: 1`.
9. Add Viewer e2e tests for disconnected Home, connected Home via fixture/mock,
   Library return, and no Raven top-level navigation.
10. Add or confirm AX2 runtime/CLI tests cover the relevant connection
    projection and no config-backed Raven connection field.
11. Run the deterministic verification commands listed above.

## Acceptance / Exit Criteria

1. Viewer Next opens on Home, not on the old prototype rail and not on a blank
   area behind overlays.
2. The bottom agent shelf is visible and includes Raven.
3. With no active plugin connection, Raven's coin is inert and Home shows
   `Connect Raven`.
4. With an active plugin connection, Raven's coin glows and Home shows
   `Power up Raven: Vision`.
5. The wordmark can still return Home, and a separate explicit Home control also
   exists.
6. Library remains explicitly reachable through app-level navigation.
7. Top-level navigation does not include Raven.
8. Viewer consumes runtime connection projection through `/api/connections`;
   it does not read lease files directly.
9. No `agents.raven.connection` field is written to
   `.alexandria-next/alexandria-config.json`.
10. Focused AX2 and Viewer tests cover disconnected and connected projections.

## Deferred Follow-Ups

1. FEAT-002 / FEAT-003 Vision onboarding surfaces and state reducers.
2. Shared source intake, `sourcesPath`, and source processing.
3. Raven Knowledge Bank persistence and Source of Truth generation.
4. Play unlock projection from Knowledge Bank state.
5. Consolidation of the mounted `LibraryBrowserShell` with the newer
   `src/app/ViewerShell` architecture.
6. Next-specific Raven play evals once guided Raven behavior changes.
