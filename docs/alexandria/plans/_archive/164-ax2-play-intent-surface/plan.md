# Issue 164: AX2 Play Intent Surface Cleanup

- Issue: https://github.com/GetAlexandria/alexandria-internal/issues/164
- Goal: remove the stale, unreachable `ax2 play intent` implementation path and
  make the supported operator path for intent-style events explicit in AX2
  help, tests, and active docs.
- Linked product plan: none. The issue body is the source of truth. Relevant
  prior repo plans are `docs/alexandria/plans/155-ax2-intent-based-cli/plan.md`
  and `docs/alexandria/plans/ax2-state-contract-storage/plan.md`.

## Scope

- Keep the current public AX2 command surface from issue 155: `init`, `start`,
  `run`, `inspect`, `doctor`, `version`, and `upgrade`.
- Do not restore `ax2 play` as a top-level command.
- Choose `ax2 inspect events append` as the canonical operator path for
  creating and advancing play intent events in this slice.
- Delete or isolate the unreachable `play intent` parser, help, option types,
  runtime handlers, and private helpers from `packages/ax-next/src/commands/play.ts`.
- Keep `ax2 run <play-id>` focused on running known plays through Fabro; `intent`
  remains an invalid play id unless `intent` becomes a real play id later.
- Update CLI help and black-box tests so `ax2 play intent --help` fails as a
  removed route, `ax2 run intent --help` fails as an unknown play id, and
  `ax2 inspect events append --help` is the documented event-writing route.
- Update active AX2 docs, local playground or e2e docs, and plugin guidance only
  when they describe current operator commands. Preserve older historical plans
  as history unless an implementation step actively relies on them.

## Non-Goals

- Do not add `ax2 internal intent` or another hidden high-level intent writer.
- Do not move play intent mutation under `ax2 run`; `run` remains a play
  execution command, not a state mutation command group.
- Do not remove the `play.intent.*` state event types, projection logic, wake
  classification, monitor behavior, or runtime append support.
- Do not redesign the ledger schema, idempotency model, runtime server, cursor
  model, Fabro workflow execution, or viewer behavior.
- Do not change Alexandria 1 packages or the shipped Alexandria 1 plugin line.
- Do not edit files under `repos/` or write to `docs/alexandria/library/`.
- Do not create a Next plugin eval harness in this slice.

## Product-Plan Summary

No product-level plan is linked from issue 164. The issue asks for a decision
about the stale `packages/ax-next/src/commands/play.ts` intent implementation:
expose it again as `ax2 play intent`, move it under another surface, or delete
it in favor of another append path.

The decision for this plan is deletion in favor of the existing
`ax2 inspect events append` path. That matches issue 155's public command
surface, keeps `run` semantically narrow, and uses the schema-backed event
append command that already writes through the runtime server and projects
`play.intent.*` events.

## Current Gap

- `packages/ax-next/src/cli/router.ts` no longer dispatches `play`, and root
  help intentionally omits it.
- `packages/ax-next/src/commands/play.ts` still contains a full `ax2 play
  intent create|claim|complete|fail` implementation, including help text,
  parsing, JSON output, deterministic intent-id derivation, runtime append
  calls, and projection checks.
- `ax2 play intent ...` is rejected at the router as `Unknown subcommand: play`,
  so the implementation is dead code.
- `ax2 run intent --help` reaches the run parser and reports `intent` as an
  unknown play id because `run` expects a play id as its first argument.
- `packages/ax-next/tests/play-intent.test.ts` already verifies intent
  projection through `ax2 inspect events append`, but the CLI still carries the
  unreachable high-level writer and old help strings.
- Active docs expose `ax2 inspect events append ...`, but they do not yet give a
  focused operator recipe for intent-style events.

## Architectural Boundaries

- `packages/ax-next` owns deterministic CLI routing, parsing, exit codes,
  stdout/stderr separation, state event schema validation, runtime appends, and
  projection tests. Command execution should continue to return `CliResult`
  through existing Effect patterns.
- `packages/alexandria-next-plugin` owns guided play behavior. This slice should
  only update command references if current plugin guidance mentions stale
  intent commands; it should not add CLI implementation to the plugin.
- The local Web UI and operators should create intent-style events through the
  same append-only event substrate as other state writes:
  `ax2 inspect events append --type play.intent.created --payload <json>
  --idempotency-key <key> --json`.
- `ax2 run` stays bound to `PLAY_MANIFEST` play ids. Special-casing `run intent`
  would make `run` a mixed execution and mutation namespace and would conflict
  with the issue 155 command model.
- `ax2 internal` stays reserved for adapter and diagnostic plumbing such as
  host monitor commands. Intent creation is an operator-visible state append,
  not a hidden diagnostic command.
- Historical plans can continue documenting older command decisions. Active
  package docs, tests, help, e2e instructions, and local playground references
  should describe only the canonical current command.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX2 play/run command implementation | `packages/ax-next/src/commands/play.ts` | Remove dead `play intent` command types, help formatters, parsers, execution helpers, and private utilities used only by the unreachable route; keep `formatRunHelp`, `parseRunArgs`, and `runPlay` for `ax2 run <play-id>` |
| AX2 router and root help contract | `packages/ax-next/src/cli/router.ts`, `packages/ax-next/tests/cli.test.ts` | Preserve `play` as a removed top-level command; add explicit coverage that `run intent --help` is rejected as an unknown play id with exit code `2` |
| Event append help and docs | `packages/ax-next/src/commands/events.ts`, `packages/ax-next/README.md`, any active local playground/e2e docs found by `rg` | Make `ax2 inspect events append` discoverable as the canonical operator path for `play.intent.*` writes without adding a new command group |
| Intent projection tests | `packages/ax-next/tests/play-intent.test.ts`, `packages/ax-next/tests/events.test.ts`, `packages/ax-next/tests/state.test.ts` | Keep intent lifecycle coverage through schema-backed event appends; add any missing help, exit-code, JSON-field, or invalid-route assertions |
| Wake and monitor behavior | `packages/ax-next/src/domain/wake-classification.ts`, `packages/ax-next/tests/wake-classification.test.ts`, `packages/ax-next/tests/claude-monitor.test.ts` | No intended behavior change; rerun tests to prove `play.intent.created` still wakes and lifecycle events still project |
| Next plugin guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` and nearby current docs if needed | Confirm no stale `ax2 play intent` guidance remains; update only if active guidance needs the canonical append command |
| Archived planning references | Older files under `docs/alexandria/plans/` | Leave historical references intact unless the implementation team identifies a current local playground plan or runbook that operators still use |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| AX2 CLI tools | Operators and agents no longer have dead help text or dead code for `ax2 play intent`; event creation guidance points at `ax2 inspect events append` | Black-box CLI tests for help, invalid routes, exit codes, JSON output, and projection |
| `ax-next-start` skill | No planned behavior change if the current skill remains limited to `ax2 init`, `ax2 inspect state --json`, and `ax2 run <play-id> --json` | Confirm with `rg`; run plugin validation only if the skill or plugin files change |
| Local Web UI / playground docs | Any active operator docs should use the canonical event append command for intent events | Update active docs and examples; do not rewrite archived design-history plans |
| Wake classification and monitor | No intended behavior change; the event type remains `play.intent.created` and still produces wake requests | Existing deterministic tests continue to cover the behavior |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX2 black-box/unit tests | `pnpm --filter @alexandria/ax-next run test` | Covers CLI routing, help, event append behavior, state projection, monitor behavior, and exit codes |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Confirms removal of dead intent types/helpers does not leave TypeScript references behind |
| AX2 lint | `pnpm --filter @alexandria/ax-next run lint` | Catches dead imports, unused helpers, and route cleanup mistakes |
| AX2 format check | `pnpm --filter @alexandria/ax-next run format:check` | Confirms TS/JSON/YAML formatting after code, test, and doc-adjacent changes |
| Focused command audit | `rg -n "ax2 play|play intent|Usage: ax2 play|Unknown option for ax2 play" packages/ax-next packages/alexandria-next-plugin` | Ensures active packages no longer carry stale command references except tests that intentionally assert removed behavior |
| Plugin validation, if plugin files change | `claude plugin validate ./packages/alexandria-next-plugin` | Required only if current Next plugin skill/docs are edited |

Targeted black-box coverage to add or preserve:

1. `ax2 play intent --help` exits `2`, writes `Unknown subcommand: play` to
   stderr, and writes nothing to stdout.
2. `ax2 run intent --help` exits `2`, writes `Unknown play id: intent` plus
   `Usage: ax2 run <play-id>` to stderr, and writes nothing to stdout.
3. `ax2 inspect events append --help` exits `0`, includes
   `play.intent.created`, `play.intent.claimed`, `play.intent.completed`, and
   `play.intent.failed` in the event type list, and documents exit codes.
4. `ax2 inspect events append --type play.intent.created --payload
   '{"intentId":"intent-1","playId":"source-assessment"}'
   --idempotency-key <key> --json` exits `0` and returns JSON with `status`,
   `event`, `ledgerPath`, and `runtime`.
5. Repeating the same append with the same idempotency key returns
   `already_appended`; reusing the key with a different payload fails with
   exit code `1`.
6. Invalid play intent payloads, such as missing `playId` on
   `play.intent.created` or missing `error` on `play.intent.failed`, fail with
   exit code `2` through schema validation.
7. `ax2 inspect state --json` projects created, claimed, completed, and failed
   play intents from appended events.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX2 CLI command behavior | Deterministic Bun tests under `packages/ax-next/tests` | Update and rerun deterministic tests; no eval-harness rerun | `pnpm --filter @alexandria/ax-next run test` |
| AX2 event schema and projection | Existing event, state, play-intent, runtime-server, wake, and monitor tests | Preserve coverage while deleting the dead high-level writer | Covered by AX2 test command |
| Alexandria Next plugin guidance | No current repo eval harness for `packages/alexandria-next-plugin`; `ax-next-start` is product-facing but currently only references live commands | Run plugin validation only if plugin files change; no new eval case in this slice | `claude plugin validate ./packages/alexandria-next-plugin` if changed |
| Alexandria 1 plugin skills and agents | Not touched | No eval-harness coverage required | None |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Deleting the high-level writer removes validation that `inspect events append` does not provide, such as derived intent ids or terminal-state checks | Keep the event append path schema-backed and idempotent; document that this slice is an operator/debug path, and defer any future high-level lifecycle command to a separate approved design |
| Operators may miss the canonical command because raw event append is more verbose than `play intent create` | Add explicit README/help/test coverage for `play.intent.*` event appends and include copy-pasteable examples in active docs |
| `run intent --help` might look like a broken subcommand instead of a clear invalid play id | Add a targeted black-box test that locks the exit code and error text, including the valid play-id list in run help |
| Dead helpers in `play.ts` may be entangled with `ax2 run` lifecycle event appends | Remove incrementally and rely on typecheck plus `ax2 run` tests to catch accidental deletion of play-run helpers |
| Historical plan references could be mistaken for live docs during review | Scope the sweep to active packages and operator docs; leave archived plans intact and mention this boundary in the implementation PR |
| A local playground may still depend on the old command string outside `packages/ax-next` | Run a focused `rg` before exit and update any active playground/runbook reference to the canonical append command |
| Future product work may still need a concise high-level intent command | Defer that as a separate command-design issue; this slice removes stale unreachable code rather than designing a new stable lifecycle API |

## Implementation Steps

1. Add or update failing tests for `ax2 run intent --help`,
   `ax2 inspect events append --help`, and intent append JSON/error behavior.
2. In `packages/ax-next/src/commands/play.ts`, remove `formatPlayHelp`,
   `formatPlayIntent*Help`, `parsePlayArgs`, intent option types, intent
   parsers, derived intent-id helper, intent execution helpers, and the
   `PlayOptions` union branch that handled non-`run` commands.
3. Narrow exported command behavior to `formatRunHelp`, `parseRunArgs`, and
   `runPlay` for `PlayRunOptions`. Keep play-run lifecycle event appends and
   Fabro orchestration unchanged.
4. Confirm `packages/ax-next/src/cli/router.ts` imports only run-specific
   exports from `commands/play.ts` and still rejects `play` as an unknown
   top-level command.
5. Update `packages/ax-next/src/commands/events.ts` help if needed so the event
   type list and examples make `play.intent.*` appends discoverable.
6. Update `packages/ax-next/README.md` and any active local playground/e2e docs
   to show the canonical intent event append recipe.
7. Run `rg` for stale active references to `ax2 play`, `play intent`, and
   `Usage: ax2 play`; preserve only historical plan references and tests that
   intentionally assert removal.
8. Run deterministic verification. If plugin guidance changed, run plugin
   validation as well.

## Acceptance / Exit Criteria

1. `packages/ax-next/src/commands/play.ts` no longer contains `ax2 play` or
   `ax2 play intent` help, parsers, option types, or execution branches.
2. `ax2 play intent --help` remains rejected with exit code `2` as a removed
   top-level command.
3. `ax2 run intent --help` is intentionally rejected with exit code `2` as an
   unknown play id, and the error includes run help.
4. `ax2 inspect events append --help` clearly exposes the valid
   `play.intent.*` event types and exit codes.
5. A play intent can be created, claimed, completed, failed, and projected by
   appending validated events through `ax2 inspect events append`.
6. Idempotent append behavior for intent events is covered: duplicate logical
   writes return the same event and conflicting duplicate keys fail.
7. Active AX2 docs and local playground references use the canonical append
   command for intent-style events.
8. Alexandria Next plugin guidance has no stale `ax2 play intent` references,
   or plugin validation passes if plugin files were changed.
9. No Alexandria 1 package, vendored repo, or `docs/alexandria/library/` file
   changes are required.
10. The verification commands in this plan pass, or any unavailable external
    tool is documented with the exact blocker.

## Deferred Follow-Ups

1. Design a future high-level intent lifecycle command only if operators need a
   less verbose stable API than `inspect events append`; consider `ax2 intent`
   or an `inspect events append --intent-*` helper in that separate issue.
2. Add machine-readable AX2 command schema/introspection once the command
   surface is stable enough to generate help and agent-facing docs from one
   source.
3. Add a Next plugin eval harness path for `ax-next-start` and local Web UI
   collaboration flows when `packages/alexandria-next-plugin` eval execution is
   available.
4. Revisit lifecycle-level validation for play intents if concurrent viewers or
   agents need guardrails beyond append-only schema validation.
5. Leave historical `docs/alexandria/plans/` references as archived design
   context unless a future documentation cleanup issue explicitly scopes them.
