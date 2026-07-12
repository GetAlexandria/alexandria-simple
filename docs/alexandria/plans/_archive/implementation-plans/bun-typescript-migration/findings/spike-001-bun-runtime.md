# SPIKE-001 Findings: Bun Runtime Validation

**Source ticket:** `SPIKE-001`
**Date:** 2026-03-28
**Bun version:** 1.3.11
**Node compatibility version:** v24.3.0
**Recommendation:** Proceed with Bun for the TypeScript migration, with the implementation constraints below carried forward into production code.

## What was tested

`SPIKE-001` validated three specific risks before committing the Bun migration:

1. child process spawning for `claude` CLI interaction and session resumption
2. `bun test` patterns used by the planned toolchain
3. YAML frontmatter parsing for ticket and outcome files

The concrete test harness lived under `spike/bun-runtime/` during the spike and covered:

- `Bun.spawn` stdout/stdin piping, exit codes, process kill/cleanup, `cwd`, and live `claude` CLI invocation
- temp directories, file I/O, subprocesses, and Bun-native file APIs inside `bun test`
- `gray-matter` parsing behavior for well-formed, empty, missing, and malformed frontmatter

## Decision

The spike cleared the initial feasibility bar for Bun.

That means:

- Bun is good enough to proceed with the planned TypeScript tooling work.
- Later production slices are still the real validation for the card parser, SQLite indexing, and MCP server behavior.
- The migration should preserve the caveats found here as explicit implementation rules.

## Durable findings

### 1. `Bun.spawn` requires `await proc.exited` before trusting `exitCode`

Reading stdout does not guarantee the child process has exited.

```ts
const text = await new Response(proc.stdout).text();
await proc.exited;
const exitCode = proc.exitCode;
```

Production implication:

- subprocess wrappers must `await proc.exited` before checking exit status
- eval-style harness code must not treat drained stdout as proof of successful completion

### 2. `gray-matter` throws on malformed YAML

Malformed frontmatter is not silently tolerated.

```ts
let parsed: matter.GrayMatterFile<string>;
try {
  parsed = matter(content);
} catch (error) {
  // handle malformed card frontmatter explicitly
}
```

Production implication:

- card parsing must use explicit error handling
- malformed cards should become a first-class parser outcome, not an unhandled exception

### 3. Live `claude` tests need longer timeouts

Two sequential `claude -p` calls, including `--resume`, exceeded the default 5s Bun test timeout.

Production implication:

- live CLI integration tests must set longer per-test timeouts
- slow external round trips should not be interpreted as Bun incompatibility by default

## Behaviors validated without special caveats

- `Bun.spawn` stdout capture, stdin piping, and stderr capture worked as expected
- exit code propagation worked for successful and failing commands
- `cwd` worked correctly
- `proc.kill()` and `proc.exited` behaved correctly for cleanup/timeout patterns
- Node `fs` compatibility used in the tests worked
- `Bun.write` / `Bun.file` worked for the tested patterns
- nested directory creation and cleanup hooks worked
- subprocess spawning inside `bun test` worked
- `gray-matter` handled well-formed frontmatter, arrays, body preservation, and stringify round-trips

## What this spike did not validate

This spike did **not** prove the entire migration end to end. It did not validate:

- the actual production card parser implementation
- SQLite library choice and runtime behavior
- MCP server behavior on Bun
- the full Bun TypeScript release working together as one production system

Those remain the responsibility of the later migration tickets.

## Follow-through for later tickets

Later Bun migration work should preserve these rules:

- always `await proc.exited` before reading subprocess success/failure
- wrap frontmatter parsing in `try/catch`
- use longer timeouts for live `claude` integration tests

If a later production slice violates one of those rules, it is regressing a validated spike finding rather than discovering something new.
