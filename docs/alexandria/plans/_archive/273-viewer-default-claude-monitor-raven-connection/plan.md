# Issue 273: Viewer Counts Default Claude Code Monitor As Raven Connection

- Issue: GitHub #273, `Viewer ignores active default Claude Code monitor lease when determining Raven connection state`
- Run ID: `01KVBDYFNVJXM1Y3D88V27ZKV0`
- Product plan: none linked in the issue prompt
- Goal: make the canonical Viewer report Raven as connected when the Alexandria Claude Code plugin monitor has an active default lease, even when the connection id is `host:claude-code:default` and no selected metadata contains the literal substring `raven`.

## Source Notes

The issue URL points at the private `GetAlexandria/alexandria-internal`
repository. The browser could not load the issue page in this environment, and
`gh` is not installed, so issue comments could not be fetched directly. This
plan uses the full issue text supplied in the run prompt as the issue source.

Repository guidance reviewed for this planning slice:

1. `CLAUDE.md`
2. `README.md`
3. `skills/maintainer/technical-planning/SKILL.md`
4. `skills/maintainer/technical-planning/plan-template.md`
5. `packages/ax/CLAUDE.md`
6. `packages/ax/docs/cli-design-principles.md`
7. `packages/alexandria-plugin/CLAUDE.md`
8. `packages/alexandria-plugin/skills/ax-start/SKILL.md`
9. `EVALS.md`
10. Current canonical Viewer, AX runtime, and plugin monitor files referenced below

There is no `packages/viewer/CLAUDE.md`, so Viewer work follows root guidance,
nearby package scripts, and existing `packages/viewer` patterns.

## Scope

This slice changes only the canonical Viewer connection interpretation and its
tests.

In scope:

1. Update `packages/viewer` Raven connection classification so an active
   Alexandria Claude Code plugin monitor lease counts as a Raven connection
   even when its id is `host:claude-code:default`.
2. Keep support for existing explicit Raven connections such as
   `host:freeq-raven:*` and owner/name metadata containing `Raven`.
3. Make the Knowledge Bank connection list include the active default Claude
   Code plugin monitor connection when it is present in `/api/connections`.
4. Preserve the rule that inactive leases do not make Raven connected.
5. Add negative coverage so incidental non-Alexandria or non-monitor
   connections are not shown as Raven.
6. Add focused Viewer unit and browser fixture coverage for the default monitor
   lease.

## Non-Goals

Out of scope:

1. Do not change `packages/ax` runtime connection lease creation, CLI commands,
   exit codes, or `/api/connections` response shape.
2. Do not change `packages/alexandria-plugin/scripts/claude-monitor.sh` or make
   the default connection id contain `raven`.
3. Do not revive obsolete `tmp`, `packages/ax-next`, `packages/viewer-next`, or
   `packages/alexandria-next-plugin` paths from prior stale work.
4. Do not add new Raven subscriptions, events, project config fields, or
   persisted connection state.
5. Do not change guided play behavior, skills, agents, or eval cases.
6. Do not write to `docs/alexandria/library/`.

## Linked Product-Plan Summary

No separate product-level plan was linked. The relevant product requirement is
contained in Issue #273: the Viewer should treat the active Alexandria Claude
Code plugin monitor as Raven's live connection, because the plugin monitor is
the local Claude Code loop that receives Raven Vision wake subscriptions.

The manual workaround starts the monitor with `host:claude-code:raven`, which
works only because the current Viewer predicate searches for the substring
`raven`. The durable product behavior should not depend on that naming
workaround.

## Current Gap

`packages/viewer/src/components/library/useRavenConnectionState.ts` currently
classifies Raven connections by checking whether selected string fields contain
`raven`:

1. `connection.owner?.name`
2. `connection.owner?.host`
3. `connection.connectionId`
4. `connection.delivery?.host`

That misses the canonical plugin monitor default:

```json
{
  "active": true,
  "connectionId": "host:claude-code:default",
  "delivery": { "host": "claude-code", "mode": "plugin-monitor" }
}
```

The same hook drives both:

1. Home status text in `AlexandriaHome`, including `Raven connection active`
   versus `No active Raven connection`.
2. `RavenKnowledgeBankStatus` connection rows through
   `ravenConnectionsFromSummary`.

The existing unit test asserts that an active default Claude Code plugin monitor
lease stays disconnected. That test encodes the bug and must be replaced with
the expected Issue #273 behavior.

## Architectural Boundaries

AX owns runtime lease projection. Viewer must continue to consume
`/api/connections` through `packages/viewer/src/app/runtime/client.ts`; it
should not read `.runtime/connections` files or duplicate lease expiry and PID
liveness logic.

Viewer owns Raven readiness presentation. The classification that maps runtime
connection rows to Raven UI state belongs near
`useRavenConnectionState.ts`, where Home and Knowledge Bank already share the
same state.

The plugin owns monitor startup and guided play behavior. This slice should not
alter `claude-monitor.sh`, `ax-start`, or subscription registration. The plugin
default of `host:claude-code:default` is valid and should be supported by
Viewer.

CLI behavior remains deterministic and unchanged. Because this plan does not
change `packages/ax`, no new CLI black-box test is required for this slice.

## Classification Contract

Replace the substring-only predicate with an explicit classifier that recognizes
two classes of Raven runtime rows.

1. Explicit Raven rows:
   - Preserve the existing metadata-based behavior for known Raven connections,
     including `delivery.host === "freeq-raven"`, connection ids containing
     `raven`, or owner metadata naming Raven.
2. Alexandria Claude Code plugin monitor rows:
   - Treat a row as Raven-capable when all of these are true:
     - `connection.connectionId` starts with `host:claude-code:`
     - `connection.delivery?.host === "claude-code"`
     - `connection.delivery?.mode === "plugin-monitor"`

The second rule is the durable replacement for requiring `raven` in the
connection id. It accepts the default `host:claude-code:default` lease and other
valid Alexandria Claude Code monitor connection ids, while avoiding unrelated
connections that merely use the same host name or default id without the
plugin-monitor delivery tuple.

`ravenConnectionStateFromSummary` must still require an active recognized row
before returning `connected`.

For the Knowledge Bank list, use the same recognized active Raven rows for the
Issue #273 behavior so stale inactive leases do not create visible readiness
signals. If maintainers later want an operator cleanup view for inactive Raven
leases, add that as a separate list with separate copy instead of mixing it
into the active Raven connection list.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Viewer Raven connection classifier | `packages/viewer/src/components/library/useRavenConnectionState.ts` | Recognizes structured Claude Code plugin monitor leases as Raven connections without relying on a `raven` substring |
| Viewer classifier unit tests | `packages/viewer/src/components/library/useRavenConnectionState.test.ts` | Replaces the bug-encoding default lease test and adds active, inactive, legacy Raven, and incidental non-Raven cases |
| Viewer browser fixture | `packages/viewer/tests/serve-viewer-fixture.ts` | Adds or adjusts a fixture mode that returns an active `host:claude-code:default` plugin-monitor connection |
| Viewer e2e behavior | `packages/viewer/tests/library-browser.spec.ts` | Covers Home connected state and Knowledge Bank listing for the default plugin monitor lease |
| AX runtime API | `packages/ax/src/domain/connection-status.ts`, `packages/ax/src/effects/runtime-server.ts` | No intended change; observed to already expose `delivery.host`, `delivery.mode`, `connectionId`, and `active` |
| Plugin monitor wrapper | `packages/alexandria-plugin/scripts/claude-monitor.sh` | No intended change; its default `host:claude-code:default` is the input Viewer must handle |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Viewer user behavior | Home and Knowledge Bank now treat an active default Claude Code plugin monitor as Raven connected | Viewer unit and e2e tests |
| `ax` CLI behavior | None | No CLI black-box test required unless implementation unexpectedly edits `packages/ax` |
| Alexandria plugin monitor | None | No plugin validation required unless implementation unexpectedly edits `packages/alexandria-plugin` |
| `ax-start` skill and Raven guided behavior | None | No skill eval rerun required |
| Eval harness | None | No eval-harness baseline changes required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer focused classifier tests | `cd packages/viewer && bun test src/components/library/useRavenConnectionState.test.ts` | Proves default active monitor connects, inactive monitor does not, legacy Raven rows still work, and incidental rows are ignored |
| Viewer package unit tests | `cd packages/viewer && pnpm run test` | Catches regressions in runtime client and library component tests already included in the package script |
| Viewer browser behavior | `cd packages/viewer && pnpm run test:e2e -- tests/library-browser.spec.ts` | Proves Home status and Knowledge Bank list use the default plugin monitor fixture |
| Viewer type/static check | `cd packages/viewer && pnpm run check` | Catches Astro, React, and TypeScript drift |
| AX runtime tests | `cd packages/ax && bun test tests/runtime-server.test.ts` only if implementation touches AX runtime code | Confirms `/api/connections` projection if the runtime layer changes |
| CLI black-box tests | Not required for the intended slice | No CLI behavior changes are planned |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` only if plugin files are touched | The intended slice does not edit plugin packaging or skills |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Viewer Raven connection state | Bun unit tests and Playwright e2e tests | Extend deterministic tests; no LLM eval needed | `cd packages/viewer && pnpm run test`; `cd packages/viewer && pnpm run test:e2e -- tests/library-browser.spec.ts` |
| `ax` CLI and runtime | Bun tests cover runtime server and connection projection | No eval action; run AX tests only if AX files change | `cd packages/ax && bun test tests/runtime-server.test.ts` if touched |
| Alexandria plugin skills/agents | Eval harness covers product-facing reusable skills per `EVALS.md` | No rerun because no skill or agent behavior changes | None |

No eval-harness coverage is required for this slice. The behavior is a
deterministic Viewer interpretation of runtime connection rows, not reusable
agent, skill, or eval-backed behavior.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The fix over-broadly treats any Claude Code row as Raven | Require the structured AX monitor shape: `connectionId` prefix `host:claude-code:`, `delivery.host` `claude-code`, and `delivery.mode` `plugin-monitor`; add negative tests for missing or different delivery mode |
| The fix breaks existing Freeq Raven or owner-name Raven connections | Preserve explicit Raven metadata classification and keep unit/e2e coverage for a `freeq-raven` row |
| Inactive default leases make Home look connected | Keep connected state dependent on `connection.active === true`; add an inactive default monitor test |
| Knowledge Bank shows stale inactive leases as live Raven connections | Use recognized active rows for the Knowledge Bank list in this slice; defer any stale-lease cleanup UI to a separate operator view |
| Implementation changes the plugin default instead of fixing Viewer | Keep `packages/alexandria-plugin/scripts/claude-monitor.sh` out of scope and explicitly test `host:claude-code:default` in Viewer |
| Prior stale AX2/Viewer Next paths are edited again | Restrict touch map and verification to canonical `packages/viewer`, with AX/plugin files observed but unchanged |

## Implementation Steps

1. In `useRavenConnectionState.ts`, split the classifier into small helpers:
   explicit Raven metadata and Alexandria Claude Code plugin monitor metadata.
2. Add constants for `host:claude-code:`, `claude-code`, and
   `plugin-monitor` to avoid another free-form substring rule.
3. Update `ravenConnectionStateFromSummary` so it returns `connected` only when
   at least one recognized Raven connection is active.
4. Update `ravenConnectionsFromSummary` so the Knowledge Bank receives the same
   active recognized Raven rows required by Issue #273.
5. Replace the existing unit test that expects
   `host:claude-code:default` to stay disconnected with a test that expects an
   active default plugin monitor lease to connect.
6. Add unit tests for:
   - active default Claude Code plugin monitor connects
   - active default Claude Code plugin monitor appears in returned connection
     rows
   - inactive default Claude Code plugin monitor is ignored
   - active Freeq Raven connection still connects
   - active owner-name Raven connection still connects
   - active incidental `host:claude-code:default` without
     `delivery.mode === "plugin-monitor"` is ignored
   - active incidental non-`host:claude-code:` connection with
     `delivery.host === "claude-code"` is ignored
7. Extend `serve-viewer-fixture.ts` with a fixture mode for an active default
   Claude Code plugin monitor connection, while preserving the existing
   `freeq-raven` fixture mode if useful for legacy coverage.
8. Update `library-browser.spec.ts` so Home renders
   `Raven connection active` and the connected CTA from the default monitor
   fixture.
9. Update or add a Knowledge Bank e2e assertion that the connection list
   includes `host:claude-code:default` for the default monitor fixture.
10. Run the deterministic verification commands listed above.

## Acceptance / Exit Criteria

1. When `/api/connections` includes an active row with
   `connectionId: "host:claude-code:default"` and
   `delivery: { "host": "claude-code", "mode": "plugin-monitor" }`, Home shows
   `Raven connection active`.
2. The same default active plugin monitor row appears in the Knowledge Bank
   connection list.
3. An inactive default plugin monitor row does not make Home connected and is
   not shown as an active Raven connection.
4. Existing explicit Raven rows, including `freeq-raven` runtime connections
   and owner-name Raven rows, still count when active.
5. Incidental active rows that do not match explicit Raven metadata and do not
   match the structured Claude Code plugin monitor shape are ignored.
6. No `packages/ax` CLI behavior, plugin monitor default id, skill behavior, or
   library content changes are included in the implementation.
7. Focused Viewer unit tests and browser tests pass.

## Deferred Follow-Ups

1. Add a separate operator cleanup UI for inactive Raven leases if maintainers
   still need to see and disconnect stale rows.
2. Consider adding a runtime-projected connection purpose or capability field
   in a future AX contract so Viewer can classify Raven readiness without any
   client-side convention.
3. Review whether `RuntimeConnectionStatusSchema` should decode
   `subscriptions` for future UI diagnostics. This issue does not require it
   because the default monitor can be recognized from existing stable fields.
