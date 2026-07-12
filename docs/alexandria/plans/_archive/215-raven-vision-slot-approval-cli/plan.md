# Issue 215: First-Class CLI Approval For Raven Vision Slots

- Issue: GitHub #215, `Add first-class CLI approval for Raven Vision slots`
- Run ID: `01KT4YMP7AKC771X0V63V8S7WY`
- Product-plan anchor: none linked in the issue text; related Raven onboarding
  context lives in `docs/alexandria/plans/raven-onboarding-experience/plan.md`
  and the prior CLI collaboration slice
  `docs/alexandria/plans/feat-005-raven-slot-collaboration/plan.md`.
- Primary surfaces: `packages/ax-next` and
  `packages/alexandria-next-plugin`

## Goal

Add first-class AX2 commands for recording a director's explicit Raven Vision
slot approval or skip from a Claude Code mediated session:

```bash
ax2 raven vision slot approve --slot <slot-id> --json
ax2 raven vision slot skip --slot <slot-id> --json
```

The commands must use the same runtime-backed Raven Vision mutation path as
Viewer review actions, update projected state, broadcast coherent runtime state,
and record an honest CLI-mediated director actor. Raven must not self-approve.

## Scope

This slice includes:

1. Extend `ax2 raven vision slot` so help lists `update`, `approve`, and
   `skip`.
2. Add non-interactive `approve` and `skip` parsers with `--slot`, `--json`,
   `--help`, stable exit codes, and the same slot-id validation behavior as
   `update`.
3. Add individual help for:

   ```bash
   ax2 raven vision slot approve --help
   ax2 raven vision slot skip --help
   ```

4. Route both commands through the AX2 runtime client and runtime server Raven
   Vision mutation path, not through `ax2 inspect events append` and not through
   direct file writes.
5. Extend the runtime review mutation body, if needed, so CLI review requests
   can pass a validated actor while Viewer review requests keep their current
   no-body compatibility and Viewer actor.
6. Use an honest review actor for CLI-mediated director approval and skip,
   proposed as:

   ```json
   { "kind": "user", "host": "claude-code", "name": "Director" }
   ```

   This distinguishes "the director approved in a Claude Code conversation"
   from both `{ "kind": "user", "host": "viewer" }` and Raven's agent actor.
7. Return JSON output with stable, parseable fields that mirror the existing
   slot update command shape: command, actor, slot projection, Vision summary,
   and runtime lifecycle metadata.
8. Update `packages/ax-next/README.md` so the public AX2 command list and Raven
   Vision examples include approve and skip.
9. Update Alexandria Next plugin guidance so Raven records explicit
   director approvals or skips through the new CLI commands and never treats
   its own judgment as approval.
10. Add deterministic tests for CLI parsing, help text, invalid input, runtime
    state projection, ledger actor semantics, and stable stdout/stderr/exit-code
    behavior.

## Non-Goals

Out of scope:

1. Changing Alexandria 1 CLI, Viewer, plugin, skills, or evals.
2. Changing the Raven Vision slot manifest, slot statuses, reducer semantics, or
   banking rules.
3. Adding bulk approve, bulk skip, or any all-slot operation.
4. Adding a new interactive confirmation flow. These commands must remain
   headless-friendly.
5. Letting Raven infer approval from silence, from a positive draft reaction, or
   from its own confidence.
6. Treating generic `ax2 inspect events append` as the recommended Raven Vision
   review path.
7. Writing under `docs/alexandria/library/`.
8. Reworking Viewer review UX beyond preserving compatibility with the existing
   approve and skip runtime endpoints.

## Linked Product-Plan Summary

The broad Raven onboarding plan defines Vision as a nine-slot review surface
with `empty`, `needs_review`, `approved`, and `skipped` slot states. FEAT-005
added the first deterministic Raven CLI collaboration path:
`ax2 raven vision slot update`, which writes exactly one Raven-authored slot and
marks it `needs_review`.

Issue #215 is the review-side companion to FEAT-005. The runtime and reducer
already understand `raven.vision.slot.approved` and
`raven.vision.slot.skipped`; the missing piece is a first-class AX2 command
surface for a director who explicitly approves or skips inside Claude Code.

## Current Gap

Current implementation observations:

1. `packages/ax-next/src/commands/raven.ts` exposes `bank` and
   `slot update`, but `formatRavenVisionSlotHelp()` lists only `update`.
2. `packages/ax-next/src/effects/runtime-client.ts` has
   `updateRavenVisionSlotThroughRuntime()` and
   `bankRavenVisionThroughRuntime()`, but no approve or skip client helper.
3. `packages/ax-next/src/effects/runtime-server.ts` already routes:

   ```text
   POST /api/raven/onboarding/vision/slots/:slotId/approve
   POST /api/raven/onboarding/vision/slots/:slotId/skip
   ```

   through `ravenVisionSlotMutationResponse()`.
4. The runtime review branch currently does not parse a request body for
   approve or skip. It therefore falls back to `VIEWER_RAVEN_ACTOR`, which is
   `{ "kind": "user", "host": "viewer" }`. That is correct for Viewer clicks
   but not for CLI-mediated director approval.
5. `packages/ax-next/src/domain/state-events.ts` already validates
   `raven.vision.slot.approved` and `raven.vision.slot.skipped` payloads with a
   manifest-backed `slotId`.
6. `packages/ax-next/src/domain/raven-vision.ts` already reduces approve and
   skip events into projected state.
7. `packages/ax-next/tests/raven-vision.test.ts`,
   `packages/ax-next/tests/events.test.ts`, and
   `packages/ax-next/tests/runtime-server.test.ts` already cover reducer,
   schema, and Viewer-style review behavior. They do not cover first-class CLI
   approve or skip commands.
8. The exact files named in the issue,
   `packages/alexandria-next-plugin/skills/raven-vision-drafting/SKILL.md` and
   `packages/alexandria-next-plugin/skills/raven-vision-elicitation/SKILL.md`,
   are not present in the current package checkout. The current Next plugin
   skills are `ax-next-start` and `alexandria-event-log`. Prototype
   `vision-drafting.md` and `vision-elicitation.md` files exist only under
   `docs/alexandria/plans/canvas-library-spike/prototype/skills/raven/` and
   use obsolete canvas-server mechanics.

## Architectural Boundaries

1. `packages/ax-next` owns deterministic CLI parsing, runtime client calls,
   runtime mutation validation, state projection, and black-box tests.
2. `packages/alexandria-next-plugin` owns guided play behavior and instructions
   for when Raven may call the deterministic AX2 commands.
3. Viewer behavior remains compatible with existing no-body approve and skip
   requests. CLI support must not force Viewer clients to send actor metadata.
4. The runtime server remains the mutation boundary. CLI code must not append
   raw events, write config directly, or special-case state projection.
5. The ledger actor records who performed the review action, while config state
   remains slot status and text. Do not add per-slot actor metadata to config in
   this slice.
6. If dedicated `raven-vision-drafting` or `raven-vision-elicitation` skills
   are added because the issue expects those package paths, they must be
   Alexandria Next AX2-runtime skills, not copies of the old canvas prototype
   instructions.
7. Keep Alexandria 1 and Alexandria Next separate.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 Raven CLI | `packages/ax-next/src/commands/raven.ts`, possibly narrow helpers in the same module | Adds `slot approve` and `slot skip` parse, help, validation, output formatting, and runtime dispatch |
| AX2 runtime client | `packages/ax-next/src/effects/runtime-client.ts` | Adds typed approve/skip client methods and exported through-runtime helpers |
| AX2 runtime server | `packages/ax-next/src/effects/runtime-server.ts` | Allows approve/skip requests to carry validated actor metadata while preserving Viewer default behavior |
| AX2 README | `packages/ax-next/README.md` | Documents approve/skip as public Raven Vision slot commands |
| AX2 CLI tests | `packages/ax-next/tests/cli.test.ts` | Covers help text, parser validation, invalid slots, unknown options, stdout/stderr, and exit code `2` |
| AX2 runtime/state tests | `packages/ax-next/tests/runtime-server.test.ts`, optionally `state.test.ts` or `raven-vision.test.ts` if coverage needs strengthening | Covers successful CLI approve/skip, projected slot state, actor semantics, runtime lifecycle, and no duplicate raw append path |
| AX2 events tests | `packages/ax-next/tests/events.test.ts` only if actor schema or event schema output changes | Should remain unchanged unless implementation changes schema documentation |
| Next plugin skills | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`, `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`, and either newly added or restored `skills/raven-vision-drafting/SKILL.md` and `skills/raven-vision-elicitation/SKILL.md` if the package is expected to expose them | Documents explicit director approval and skip handling through the CLI, and Raven's prohibition on self-approval |
| Plugin validation | `packages/alexandria-next-plugin` | Validates changed or newly added skill payloads |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Raven Vision drafting guidance | Raven may draft or revise a slot with `slot update`, then must stop for review. If the director explicitly approves or skips in Claude Code, Raven records that instruction with `slot approve` or `slot skip`; Raven does not approve its own draft. | Update existing guidance or add the missing `raven-vision-drafting` skill with AX2-specific instructions; run plugin validation and markdown lint |
| Raven Vision elicitation guidance | During slot-specific elicitation, an explicit director decision such as "approve this" or "skip this" is actionable through the CLI. Ambiguous positive feedback is not approval. | Update existing guidance or add the missing `raven-vision-elicitation` skill with AX2-specific instructions; run plugin validation and markdown lint |
| `ax-next-start` | The Raven Vision Collaboration section should list update, approve, and skip commands and explain the explicit-approval gate. | Plugin validation |
| `alexandria-event-log` | Common Raven Vision review event handling should prefer the first-class commands over generic event append for CLI-mediated director review. | Plugin validation |
| AX2 CLI | Agents and humans can discover approve and skip from help instead of improvising raw event appends. | Black-box CLI tests |

## CLI Contract

Command shapes:

```bash
ax2 raven vision slot approve --slot <slot-id> [--idempotency-key <key>] [--json]
ax2 raven vision slot skip --slot <slot-id> [--idempotency-key <key>] [--json]
```

The issue examples without `--idempotency-key` must work:

```bash
ax2 raven vision slot approve --slot discovered-pain --json
ax2 raven vision slot skip --slot discovered-pain --json
```

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | Review event recorded or idempotent replay observed; projected state returned |
| `1` | Runtime, project-state, or operational precondition failure, such as Vision not started |
| `2` | Invalid CLI input, unknown option, missing `--slot`, invalid slot id, or empty idempotency key |

JSON output should be stable and parallel to `slot update`:

```json
{
  "command": "ax2 raven vision slot approve",
  "actor": { "kind": "user", "host": "claude-code", "name": "Director" },
  "slot": {
    "id": "discovered-pain",
    "status": "approved",
    "text": "..."
  },
  "vision": {
    "readyToBank": false,
    "slotCount": 9,
    "status": "in_progress"
  },
  "runtime": {
    "lifecycle": "temporary",
    "url": "http://127.0.0.1:..."
  }
}
```

For `skip`, `command` is `ax2 raven vision slot skip`, the returned slot status
is `skipped`, and text is expected to be cleared by the existing reducer.

Human output should avoid saying Raven approved the slot. Prefer wording such
as `Recorded director approval for Vision slot: <slot-id>` and
`Recorded director skip for Vision slot: <slot-id>`.

## Runtime Contract

Implementation should factor approve and skip through a shared review helper:

1. Runtime-client interface gains a method such as:

   ```ts
   reviewRavenVisionSlot(input: {
     action: "approve" | "skip";
     actor: AlexandriaActor;
     idempotencyKey?: string;
     slotId: RavenVisionSlotId;
   })
   ```

   or two explicit methods if that reads better in this package.
2. Exported helpers mirror existing patterns:

   ```ts
   approveRavenVisionSlotThroughRuntime(...)
   skipRavenVisionSlotThroughRuntime(...)
   ```

   A single `reviewRavenVisionSlotThroughRuntime(...)` is also acceptable if
   command code stays clear.
3. Runtime server review parsing should accept an empty body for Viewer
   compatibility and a JSON body with only `actor` and optional
   `idempotencyKey` for CLI calls.
4. Unknown review body fields return `400` before side effects.
5. Invalid actor shape returns `400` before side effects.
6. Unknown slot IDs still return `400` and list all valid slot IDs.
7. Review before Vision starts returns `409` and appends no review event.
8. Successful review appends exactly one of:
   `raven.vision.slot.approved` or `raven.vision.slot.skipped`, reduces it into
   config-backed state, persists config, broadcasts `state-event` and
   `project-state` for appended events, and returns the canonical Vision
   projection.
9. Idempotent replay, when an idempotency key is supplied, should follow the
   same projection behavior as the existing update path.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 CLI parsing and help | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves `slot --help` lists approve/skip, individual helps are stable, invalid slots exit `2`, and stdout/stderr separation holds |
| AX2 runtime review behavior | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves CLI approve/skip use runtime mutation, update projected state, preserve runtime lifecycle behavior, and record the CLI-mediated director actor |
| AX2 reducer projection | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Confirms approve/skip state transitions and ready-to-bank computation remain intact |
| AX2 state and event schema | `cd packages/ax-next && bun test tests/state.test.ts tests/events.test.ts` | Confirms inspect projection and event schemas still expose review state and valid slot IDs |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches command/runtime-client/server type drift |
| AX2 lint | `cd packages/ax-next && pnpm run lint` | Catches static code quality issues in touched CLI/runtime/tests |
| Next plugin tests | `cd packages/alexandria-next-plugin && bun test` | Ensures monitor wrapper package tests still pass after skill payload changes |
| Next plugin validation | `cd packages/alexandria-next-plugin && pnpm run validate` | Required because this slice changes plugin skills |
| Markdown lint | `pnpm lint:markdown` | Required because this slice changes Markdown plan and skill files |

Focused test cases to add or strengthen:

1. `ax2 raven vision slot --help` includes `approve`, `skip`, and `update`.
2. `ax2 raven vision slot approve --help` includes usage, `--slot`, `--json`,
   valid slot ids, examples, and exit codes.
3. `ax2 raven vision slot skip --help` includes the same contract.
4. `approve --slot not-a-slot --json` exits `2`, writes no stdout, and lists
   valid slot ids on stderr.
5. `skip --slot not-a-slot --json` has the same invalid-input behavior.
6. `approve --slot discovered-pain --json` after a Raven update returns
   `slot.status === "approved"` and `command === "ax2 raven vision slot approve"`.
7. `skip --slot discovered-pain --json` after a Raven update returns
   `slot.status === "skipped"` and cleared slot text.
8. `ax2 inspect state --json` after each command reports the same projected
   slot status.
9. Ledger events for CLI approve/skip use
   `{ "kind": "user", "host": "claude-code", "name": "Director" }`.
10. Viewer no-body approve/skip requests still use
    `{ "kind": "user", "host": "viewer" }`.
11. Review before Vision starts exits `1` through the CLI and appends no review
    event.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Raven CLI/runtime | Deterministic Bun tests already cover slot update, review reducers, event schemas, runtime APIs, and inspect projection | Add deterministic approve/skip CLI and runtime coverage. No LLM eval is required for this deterministic CLI behavior | `cd packages/ax-next && bun test tests/cli.test.ts tests/runtime-server.test.ts tests/raven-vision.test.ts tests/state.test.ts tests/events.test.ts` |
| Alexandria Next plugin guidance | Plugin validation exists. The current repo eval harness guidance in `EVALS.md` is oriented around the shipped Alexandria 1 plugin, while this slice changes the Next plugin payload | Run plugin validation and markdown lint. Do not claim eval-harness coverage unless implementation adds a real Next-plugin eval case | `cd packages/alexandria-next-plugin && pnpm run validate`; `pnpm lint:markdown` |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin-line skills | No rerun because Alexandria 1 is untouched | None |

If implementation creates substantial new autonomous Raven Vision drafting or
elicitation behavior rather than narrowly documenting command usage, revise
this section before merge and either add a Next-plugin eval case or document
the current harness blocker explicitly.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| CLI approve/skip accidentally records Viewer as the actor | Extend runtime review body parsing for actor metadata and add ledger actor tests for both CLI and Viewer paths |
| Raven self-approves its own slot text | Use a director actor, not the Raven agent actor, and update skill guidance to require explicit director language before running approve/skip |
| Ambiguous user praise is treated as approval | Skill wording must distinguish explicit instructions from reactions. Examples: "I approve this slot" is actionable; "looks good" is not unless the director clearly asks to mark it approved |
| Generic event append remains the easiest discovered path | Help text, README, and skills point to first-class commands; tests assert help discoverability |
| Runtime review body changes break Viewer | Keep empty-body/no-body approve and skip requests valid, defaulting to Viewer actor; add regression coverage |
| Duplicate review events from retries create noisy ledger history | Support optional `--idempotency-key` and runtime idempotency body handling consistent with update; document it in help |
| The issue names skill files that are absent in the current package | Implementation must either add AX2-specific `raven-vision-drafting` and `raven-vision-elicitation` skills or explicitly update the currently shipped `ax-next-start` and `alexandria-event-log` guidance while documenting why the named skill paths are not part of this checkout |
| Copying prototype skills reintroduces obsolete canvas-server commands | If dedicated skills are added, adapt only the relevant Raven behavior rules and use AX2 commands. Do not copy prototype canvas URLs, curl commands, or slot ids |

## Implementation Steps

1. Add CLI option types and help text in `packages/ax-next/src/commands/raven.ts`
   for `vision-slot-approve` and `vision-slot-skip`.
2. Factor shared slot-review parsing so approve and skip both validate
   `--slot`, optional `--idempotency-key`, `--json`, and unknown options before
   runtime side effects.
3. Add JSON and human output formatters that name the command, director actor,
   returned slot projection, Vision status summary, and runtime lifecycle.
4. Add runtime-client approve/skip methods and exported through-runtime helpers,
   following the existing `updateRavenVisionSlotThroughRuntime()` pattern.
5. Extend runtime-server review request parsing to accept empty bodies for
   Viewer and `{ actor, idempotencyKey }` bodies for CLI review actions.
6. Wire CLI approve and skip execution through the runtime helpers, with
   runtime failures mapped to exit `1` and invalid input mapped to exit `2`.
7. Update `packages/ax-next/README.md` public command list and Raven Vision
   examples.
8. Add or update `packages/ax-next/tests/cli.test.ts` cases for help and parser
   validation.
9. Add or update `packages/ax-next/tests/runtime-server.test.ts` cases for CLI
   approve/skip success, projection, actor semantics, Viewer compatibility, and
   pre-start failure.
10. Run targeted AX2 tests while iterating, then run typecheck and lint.
11. Update Next plugin skill guidance. Prefer updating the existing
    `ax-next-start` and `alexandria-event-log` surfaces because they are present
    today; add `raven-vision-drafting` and `raven-vision-elicitation` skill
    files only if this issue's acceptance needs those package paths.
12. Run plugin validation, plugin tests, and markdown lint.
13. Confirm no files under `docs/alexandria/library/` or Alexandria 1 package
    surfaces changed.

## Acceptance / Exit Criteria

1. `ax2 raven vision slot --help` lists `approve`, `skip`, and `update`.
2. `ax2 raven vision slot approve --slot discovered-pain --json` marks
   `discovered-pain` as `approved` in projected state.
3. `ax2 raven vision slot skip --slot discovered-pain --json` marks
   `discovered-pain` as `skipped` in projected state and clears its text.
4. Both commands validate slot ids before runtime side effects and list all
   valid slot ids on invalid input.
5. Both commands have stable stdout, stderr, JSON output, help text, and exit
   codes.
6. Both commands use the runtime mutation path, not raw
   `ax2 inspect events append`.
7. CLI-mediated approval and skip ledger events record an honest
   Claude Code/director actor, not Viewer and not Raven.
8. Viewer approve/skip behavior remains compatible and continues to record the
   Viewer actor.
9. `ax2 inspect state --json` agrees with the returned projection after approve
   and skip.
10. Runtime SSE/project-state coherence is preserved because the existing
    runtime mutation path is used.
11. Skills document that Raven must not self-approve and may only run approve or
    skip after explicit director instruction in Claude Code.
12. After successful approve or skip, Raven may proceed only according to the
    existing drafting trigger rules and current projected state.
13. Deterministic tests and plugin validation listed in this plan pass, or any
    environment-specific blocker is documented in the implementation handoff.

## Deferred Follow-Ups

1. Add a machine-readable AX2 command schema surface if the broader CLI
   introspection plan lands.
2. Add a dedicated Next-plugin Raven Vision eval once the eval harness can load
   `packages/alexandria-next-plugin` product skills directly.
3. Consider a future `ax2 raven vision slot review` umbrella command only if
   approve/skip duplication becomes costly. Do not add it in this slice.
4. Consider richer actor metadata such as session id if the host integration
   begins setting a stable Claude Code connection id for CLI-mediated actions.
5. Add explicit documentation for idempotency-key strategy across all Raven
   Vision slot mutation commands after more runtime mutation commands exist.
