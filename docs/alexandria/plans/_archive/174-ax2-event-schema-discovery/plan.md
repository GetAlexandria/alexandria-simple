# Issue 174: AX2 Event Schema Discovery

- Issue: <https://github.com/GetAlexandria/alexandria-internal/issues/174>
- Goal: add a programmatic AX2 command for discovering supported Alexandria
  state event types and append payload requirements:
  `ax2 inspect events schema --json`.
- Linked product plan: none. The GitHub issue is the product source of truth.
  Related prior repo plans are
  `docs/alexandria/plans/155-ax2-intent-based-cli/plan.md`,
  `docs/alexandria/plans/164-ax2-play-intent-surface/plan.md`, and
  `docs/alexandria/plans/ax2-state-contract-storage/plan.md`.

## Scope

- Add `schema` as a new `ax2 inspect events` subcommand in
  `packages/ax-next`.
- Provide stable JSON output for
  `ax2 inspect events schema --json` with:
  - a schema document version
  - supported state event types
  - payload field requirements for each event type
  - known literal/enumerated values where useful
  - append guidance for actor defaults, actor shape, idempotency keys, and
    payload delivery flags
- Add readable non-JSON output for `ax2 inspect events schema`, or keep it as a
  compact summary that points agents to `--json`.
- Update `inspect events` help so the `schema` subcommand is discoverable.
- Add focused black-box tests for help, exit codes, JSON parseability, required
  fields, optional fields, and important guidance fields.
- Keep the implementation deterministic and local. The schema command should not
  require an initialized Alexandria project, should not start or contact the
  runtime server, and should not read or mutate the state ledger.
- Keep Alexandria 1 and Alexandria Next separate.

## Non-Goals

- Do not change append, list, validate, projection, runtime server, idempotency,
  cursor, wake, monitor, or viewer behavior.
- Do not add a general AX2 command-introspection system in this slice.
- Do not generate a full JSON Schema dialect document unless implementation can
  do so cleanly from the current Effect schemas without broad refactoring.
- Do not add new event types or change existing event payload validation.
- Do not move product play guidance into `packages/ax-next`; the plugin remains
  the owner of guided play behavior.
- Do not update `docs/alexandria/library/` or files under `repos/`.
- Do not create a Next plugin eval harness case in this slice.

## Product-Plan Summary

Issue 174 asks for a machine-readable alternative to scraping
`ax2 inspect events append --help`. Agents need to discover the currently
supported Alexandria event log types and payload shapes before calling
`ax2 inspect events append`. The proposed command is:

```bash
ax2 inspect events schema --json
```

The command should expose event types, required and optional payload fields
where practical, and append guidance such as actor and idempotency-key
expectations. Existing `append`, `list`, and `validate` behavior must remain
unchanged.

## Current Gap

- `packages/ax-next/src/domain/state-events.ts` already has the source of truth
  for supported event types, actor shape, and Effect Schema payload validation.
- `packages/ax-next/src/commands/events.ts` exposes `append`, `list`, and
  `validate` under `ax2 inspect events`.
- `formatEventsAppendHelp()` prints valid event types in human-readable help,
  but the help text is not a stable machine-readable contract.
- Agents can infer valid event types from help text, but they cannot
  programmatically inspect required payload fields such as `playId`,
  `intentId`, `stepId`, `sourceEventId`, or event-specific optional fields.
- The event payload schemas are currently private to the domain module through
  `payloadSchemaFor()`, so a schema command needs either exported declarative
  metadata or a carefully bounded introspection helper.

## Architectural Boundaries

- `packages/ax-next` owns the deterministic CLI command, parse behavior,
  stdout/stderr separation, exit codes, and schema document contract.
- `packages/ax-next/src/domain/state-events.ts` should remain the event type and
  validation source of truth. The implementation should avoid duplicating event
  field definitions in command code.
- The schema document should be explicit and stable enough for agents, but it
  does not need to expose every internal Effect Schema detail.
- Prefer an exported event-schema descriptor next to the existing Effect Schema
  definitions, with validation schemas and discovery metadata kept adjacent so
  future event changes update both together.
- `packages/alexandria-next-plugin` owns guided play and wake-flow prose. Only
  update plugin guidance if current product-facing instructions need to mention
  the new discovery command.
- The schema command is read-only introspection. It should not load project
  storage, repair a ledger, start a temporary runtime server, or require
  `.alexandria-next/alexandria-config.json`.
- Expected command errors should follow existing `CliResult` and exit-code
  patterns: command data on stdout, diagnostics on stderr, invalid command input
  as exit code `2`.

## Proposed JSON Contract

The implementation should define and test a compact contract like this. Exact
field names can change during implementation if tests lock the approved shape.

```json
{
  "schemaVersion": 1,
  "command": "ax2 inspect events append",
  "stateEventSchemaVersion": 1,
  "eventTypes": [
    {
      "type": "play.intent.created",
      "payload": {
        "required": [
          { "name": "intentId", "type": "string" },
          {
            "name": "playId",
            "type": "string",
            "allowedValues": ["source-assessment"]
          }
        ],
        "optional": [
          { "name": "payload", "type": "object" }
        ],
        "additionalProperties": false
      }
    }
  ],
  "actor": {
    "default": { "kind": "process", "host": "ax2", "process": "cli" },
    "required": [{ "name": "kind", "type": "string" }],
    "optional": [
      { "name": "host", "type": "string" },
      { "name": "process", "type": "string" },
      { "name": "sessionId", "type": "string" },
      { "name": "name", "type": "string" }
    ],
    "allowedValues": {
      "kind": ["user", "agent", "process"],
      "host": ["viewer", "ax2", "claude-code", "codex"],
      "process": ["viewer-server", "host-adapter", "monitor", "cli"]
    },
    "additionalProperties": false
  },
  "append": {
    "payloadSources": ["--payload", "--payload-file"],
    "idempotencyKey": {
      "optional": true,
      "guidance": "Provide a stable non-empty key for retryable appends."
    },
    "jsonFlag": "--json"
  }
}
```

Implementation should include all currently supported event types:

- `play.intent.created`
- `play.intent.claimed`
- `play.intent.completed`
- `play.intent.failed`
- `play.started`
- `play.completed`
- `play.failed`
- `assessment.recorded`
- `canvas.step.saved`
- `canvas.review.requested`
- `session.wake.requested`
- `session.wake.delivered`
- `session.wake.failed`

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Event domain schema metadata | `packages/ax-next/src/domain/state-events.ts` or a new adjacent domain module such as `state-event-schema-descriptors.ts` | Export a stable descriptor for event payload shapes, actor shape, event schema version, and append guidance while keeping validation schemas authoritative |
| Event CLI parser and help | `packages/ax-next/src/commands/events.ts` | Add `schema` parsing, help text, execution, human summary output, and JSON output without changing `append`, `list`, or `validate` |
| Inspect/root help coverage | `packages/ax-next/tests/cli.test.ts` | Assert `ax2 inspect events --help` lists `schema` and `ax2 inspect events schema --help` documents `--json` and exit codes |
| Event schema command tests | `packages/ax-next/tests/events.test.ts` or a focused new test file | Add black-box assertions for JSON contract fields, parseability, exit code `0`, no stderr, and invalid option exit code `2` |
| AX2 README | `packages/ax-next/README.md` | Add `schema` to the public `inspect events` command list and optionally include the discovery command near the append recipe |
| Next plugin guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` or related active skill/docs only if needed | Optional: mention schema discovery before event appends if implementation finds current guidance tells agents to append events directly |
| Historical plans and library docs | `docs/alexandria/plans/**`, `docs/alexandria/library/**` | Do not rewrite historical plans or write to the library in this slice |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| AX2 CLI tools | Agents can discover supported event types and payload field requirements through JSON instead of scraping append help | Black-box tests for `schema --json`, command help, invalid options, and unchanged append/list/validate behavior |
| Local event-log wake flows | Agents can call `ax2 inspect events schema --json` before choosing an append payload | No runtime behavior change; document only if active plugin guidance currently instructs direct appends |
| `ax-next-start` skill | No required behavior change from the files read in planning; the skill currently covers init, state inspection, and play running, not event append payload construction | Run plugin validation only if plugin files change |
| Alexandria 1 plugin skills and agents | Not touched | No eval-harness rerun required |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX2 tests | `pnpm --filter @alexandria/ax-next run test` | Covers black-box command behavior, help, JSON output, exit codes, and unchanged event append/list/validate behavior |
| Focused event tests during development | `pnpm --filter @alexandria/ax-next exec bun test packages/ax-next/tests/events.test.ts packages/ax-next/tests/cli.test.ts` | Faster loop for the changed command surface |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Confirms exported schema descriptors and command option types stay coherent |
| AX2 lint | `pnpm --filter @alexandria/ax-next run lint` | Catches unused helpers, accidental duplication, and command parser mistakes |
| AX2 format check | `pnpm --filter @alexandria/ax-next run format:check` | Confirms TypeScript, JSON, and YAML formatting |
| Plugin validation, if plugin files change | `claude plugin validate ./packages/alexandria-next-plugin` | Required by package guidance if Next plugin skill or manifest files are edited |
| Focused command audit | `rg -n "inspect events list\\|append\\|validate" packages/ax-next packages/alexandria-next-plugin` | Ensures active command lists and examples include `schema` where appropriate and no stale discovery guidance remains |

Targeted black-box coverage to add:

1. `ax2 inspect events --help` exits `0`, lists `append`, `list`,
   `validate`, and `schema`.
2. `ax2 inspect events schema --help` exits `0`, documents
   `Usage: ax2 inspect events schema [--json]`, `--json`, and exit codes.
3. `ax2 inspect events schema --json` exits `0`, writes valid JSON to stdout,
   writes nothing to stderr, and does not require `ax2 init`.
4. The JSON output includes `schemaVersion`,
   `stateEventSchemaVersion`, `eventTypes`, `actor`, and `append`.
5. The JSON output includes all values from `ALEXANDRIA_STATE_EVENT_TYPES`
   exactly once.
6. Representative payload assertions:
   - `play.intent.created` requires `intentId` and `playId`, and marks
     `payload` optional.
   - `play.intent.failed` requires `intentId` and `error`.
   - `play.started` requires `playId` and marks `fabroRunId`,
     `workflowPath`, `acpProvider`, and `intentId` optional.
   - `assessment.recorded` requires `source`, `assessment`, and `readiness`.
   - `canvas.step.saved` requires `stepId` and `contentHash`.
   - `session.wake.requested` requires `sourceEventId`, `cursorId`, `host`,
     `reason`, and `message`.
7. Actor metadata includes the default AX2 actor and allowed actor enum values.
8. Append metadata identifies `--payload`, `--payload-file`, `--actor`,
   `--idempotency-key`, and `--json`.
9. `ax2 inspect events schema --unknown` exits `2`, writes no stdout, and
   includes schema help plus a precise unknown-option message on stderr.
10. Existing append/list/validate tests continue to pass without output shape
    changes.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX2 CLI command behavior | Deterministic Bun tests under `packages/ax-next/tests` | Add focused black-box tests and rerun AX2 tests | `pnpm --filter @alexandria/ax-next run test` |
| Event schema validation and projection | Existing event, state, play-intent, runtime-server, wake, and monitor tests cover validation/projection behavior | Keep existing behavior unchanged; schema command tests should assert discovery metadata matches representative validation rules | Covered by AX2 test command |
| Alexandria Next plugin guidance | No current repo eval harness targets `packages/alexandria-next-plugin`; plugin validation is available | No eval-harness coverage required unless this slice changes product skill behavior; run plugin validation if plugin files change | `claude plugin validate ./packages/alexandria-next-plugin` if changed |
| Alexandria 1 plugin evals | Not touched | No eval rerun | None |

No `pnpm eval` rerun is required for the core slice because the change is a
deterministic AX2 CLI introspection command. If implementation changes
product-facing skill instructions in the Next plugin, the PR should call out
that the current eval harness does not yet cover `packages/alexandria-next-plugin`
and rely on plugin validation plus deterministic CLI tests for this slice.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Discovery metadata drifts from the Effect schemas that actually validate appends | Keep descriptors adjacent to the existing schema definitions, export one event-schema catalog, and add tests that compare descriptor event types to `ALEXANDRIA_STATE_EVENT_TYPES` plus representative required/optional fields |
| Attempting to auto-introspect Effect Schema internals creates brittle code tied to library implementation details | Prefer explicit descriptors maintained next to validation schemas unless Effect exposes a simple stable helper already used in the repo |
| The JSON contract becomes too verbose for agent context | Keep the first version compact: event type, required fields, optional fields, simple type strings, allowed literals, and append guidance; defer full JSON Schema export |
| The schema command accidentally starts a runtime server or requires project config | Implement it as pure command output with no `loadProjectStorage` or runtime-client calls; add a test from an uninitialized temp directory |
| Adding `schema` changes existing subcommand parsing or help behavior for append/list/validate | Add targeted tests for existing help and run the existing `events.test.ts` suite |
| Agents over-treat the schema document as a permission to hand-write JSONL | Include append guidance that `ax2 inspect events append` is the write path and direct ledger writes are not supported |
| Plugin guidance could lag behind the new discovery command | Audit active Next plugin skill/docs references; update only current guidance that instructs event appends, then run plugin validation |

## Implementation Steps

1. Add failing black-box tests for `ax2 inspect events schema --help`,
   `ax2 inspect events schema --json`, invalid schema options, and
   uninitialized-project behavior.
2. Define a stable descriptor type for event schema discovery in the AX2 domain
   layer. Keep it near `state-events.ts` and include:
   `schemaVersion`, `stateEventSchemaVersion`, event descriptors, actor
   descriptor, and append guidance.
3. Populate descriptors for all existing state event types using the current
   validation rules from `state-events.ts`. Include required/optional payload
   fields and allowed values for known literals such as actor enums, host enums,
   wake host values, readiness values, play completion statuses, and known play
   ids.
4. Export a helper such as `getStateEventSchemaDocument()` from the domain layer
   so command code does not duplicate payload definitions.
5. Extend `packages/ax-next/src/commands/events.ts` option types and parser with
   a `schema` command that accepts `--json` and `--help`, rejects unknown
   options with exit code `2`, and returns a `CliResult`.
6. Implement `runSchema` as a pure Effect program or synchronous branch
   consistent with existing `runEventsCli` patterns. JSON output should use the
   existing pretty `toJson()` formatting.
7. Add human output for `ax2 inspect events schema`, such as a compact list of
   event types and a line pointing to `--json` for field details.
8. Update `formatEventsHelp()` and add `formatEventsSchemaHelp()` so the new
   subcommand appears beside `append`, `list`, and `validate`.
9. Update `packages/ax-next/README.md` to include
   `ax2 inspect events schema --json` in the event inspection surface.
10. Audit active Next plugin guidance and AX2 docs. Update only current
    product-facing event-append guidance if it should direct agents to the new
    schema command.
11. Run deterministic verification. If plugin files changed, run plugin
    validation too.

## Acceptance / Exit Criteria

1. `ax2 inspect events schema --json` exits `0` in an uninitialized directory,
   writes stable JSON to stdout, and writes nothing to stderr.
2. The JSON document includes every supported state event type exactly once and
   exposes required and optional payload fields for each type.
3. The JSON document includes actor defaults, actor allowed values, payload
   source flags, idempotency-key guidance, and a clear pointer that appends
   should go through `ax2 inspect events append`.
4. `ax2 inspect events schema --help` and parent `inspect events` help expose
   the new subcommand and exit-code behavior.
5. Invalid schema command input exits `2`, emits diagnostics to stderr, and does
   not write command data to stdout.
6. Existing `append`, `list`, and `validate` command behavior and tests remain
   unchanged.
7. AX2 README or active docs list the schema discovery command.
8. Plugin validation passes if any Alexandria Next plugin files are changed.
9. No Alexandria 1 package, vendored repo, or `docs/alexandria/library/` file is
   changed.
10. The verification commands in this plan pass, or any unavailable external
    tool is documented with its exact blocker.

## Deferred Follow-Ups

1. Generate a broader machine-readable AX2 command schema for all commands once
   the CLI surface is stable enough to share one source for help and agent
   introspection.
2. Consider exporting a formal JSON Schema document for event payloads if
   downstream tools need schema validators rather than a compact agent-oriented
   field catalog.
3. Add Next-plugin eval harness coverage for event-log wake flows once
   `packages/alexandria-next-plugin` eval execution exists.
4. Add higher-level event append helpers if agents still struggle to construct
   valid payloads from the discovery schema alone.
