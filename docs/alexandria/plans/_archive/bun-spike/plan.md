# SPIKE-001: Validate Bun Runtime for Alexandria Tooling

**Issue:** sociotechnica-org/alexandria#109
**Branch:** symphony/109
**Status:** In progress

---

## Motivation

The beadification plan (Phase 1) calls for TypeScript tooling: a card parser, SQLite
index builder, and MCP server. The eval harness (`tests/run-eval.sh`) currently shells
out to `claude` CLI and uses `python3` for JSON parsing. Both could be rewritten or
extended in TypeScript.

Before committing to Bun as the runtime, we need to validate three specific risks:

1. **Child process spawning** — `Bun.spawn` must handle stdin/stdout piping to
   the `claude` CLI, including session resumption via `--resume` and process
   cleanup on timeout/kill.
2. **`bun test` patterns** — Temp dir creation, file I/O assertions, and subprocess
   spawning inside tests must all work without issues.
3. **YAML frontmatter parsing** — The card parser needs to read YAML frontmatter.
   Bun has no built-in YAML; we must confirm `gray-matter` (Node-compatible) works
   cleanly under Bun.

If any risk fails, we replan for Node.js + tsx.

---

## Success Criteria

| Area | Pass Condition |
|------|---------------|
| Child process spawning | `Bun.spawn` captures stdout, stdin piping works, exit codes are correct |
| Session resumption | Can pipe a prompt with `--resume <id>` and get back a valid response |
| Process cleanup | `proc.kill()` terminates the process; `proc.exited` resolves |
| `bun test` patterns | Temp dirs, file writes, reads, and subprocess spawning all pass |
| YAML frontmatter | `gray-matter` parses frontmatter, handles missing/malformed frontmatter |
| Overall | All spike tests pass with `bun test` |

---

## Scope

This is a **read-only spike** — no changes to existing agents, skills, or tests.
The spike lives in `spike/bun-runtime/` and is self-contained.

### What we're NOT deciding yet

- Whether to rewrite `run-eval.sh` in TypeScript
- Whether to use `bun test` vs `vitest` for the beadification package tests
- SQLite (`better-sqlite3`) compatibility — that's a separate spike if needed

---

## Implementation

### Files

```
spike/bun-runtime/
  package.json              — bun project, gray-matter dependency
  test-child-process.test.ts — Bun.spawn validation
  test-bun-patterns.test.ts  — bun test patterns (temp dirs, file I/O)
  test-yaml-parsing.test.ts  — gray-matter / YAML frontmatter parsing
  run.sh                    — install deps + run all tests, emit findings
```

### Test Areas

#### 1. Child Process Spawning (`test-child-process.test.ts`)

- Basic stdout capture from `echo`
- Stdin piping via `cat`
- JSON output parsing (simulate `claude --output-format json` via `echo`)
- Exit code propagation (`true` / `false` commands)
- Process kill + `proc.exited` resolution
- Working directory (`cwd`) option
- Live `claude` CLI invocation (skipped if `claude` not in PATH)

#### 2. bun test Patterns (`test-bun-patterns.test.ts`)

- `mkdtemp` + write + read + remove (Node fs compat)
- `Bun.write` + `Bun.file` API
- Multiple files in a temp directory
- Nested directory creation
- `afterEach` cleanup via `rmSync`
- Subprocess spawned from inside a test

#### 3. YAML Frontmatter (`test-yaml-parsing.test.ts`)

- Well-formed frontmatter (string, number, boolean fields)
- Multi-line YAML values
- No frontmatter at all
- Empty frontmatter block (`---\n---`)
- Malformed YAML (should not throw by default)
- Body content preserved correctly
- Typical context library card (type, status, version, modified fields)

---

## Decision Framework

After running the spike, populate `findings.md` in the same directory:

- **All tests pass** → Bun is validated. Proceed with TypeScript tooling using Bun.
- **Child process tests fail** → Fall back to Node.js + tsx for the eval harness;
  keep bash eval runner as-is.
- **gray-matter fails** → Evaluate alternative YAML parsers (`js-yaml` directly,
  `yaml` package) before abandoning Bun.
- **bun test patterns fail** → Evaluate whether `vitest` under Bun resolves the issues.

---

## Status

- [x] Plan written
- [x] Spike tests implemented
- [x] Spike tests run
- [x] Findings recorded
- [ ] PR merged
