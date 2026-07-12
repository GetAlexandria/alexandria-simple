# Phase 2 Smoke Test Results

- Ticket: `LIB2-009`
- Date: `2026-04-03`
- Status: `blocked`
- Environment:
  - repo: `sociotechnica-org/alexandria`
  - branch: `symphony/236`
  - local time at first live attempt: `2026-04-03 04:49:48 EDT`
  - Claude auth: `claude.ai` Max subscription
  - smoke worktree: `/tmp/alexandria-236`

## Summary

The smoke test advanced farther than the earlier quota-blocked run, but it still did not
complete honestly. The current behavior is:

- Scenario 1 greenfield interactive flow starts and Raven behaves plausibly
- Raven successfully delegates and writes `docs/alexandria/alexandria-config.json`
- after that first artifact, the room stalls before producing the next source artifact
  or `docs/alexandria/assessment.md`
- Scenario 2 continuation also stalls before Raven produces a visible turn, even when
  global MCP configuration is stripped out

This is therefore a product/runtime blocker in the current `/library` flow, not a
remaining quota problem.

## Prepared Smoke Workspace

Scenario 1 was prepared in a real local git repo under:

`/tmp/alexandria-236/.tmp/manual-smoke/lib2-009/greenfield-product`

Setup performed:

```bash
mkdir -p .tmp/manual-smoke/lib2-009/greenfield-product
cd .tmp/manual-smoke/lib2-009/greenfield-product
git init
```

The repo was intentionally left with no `docs/alexandria/` state so `/library` would
enter the first-time greenfield path. The same workspace was then reused for the
returning-session continuation attempt after `alexandria-config.json` existed.

## Scenario 1: Greenfield Run

Initial one-shot check after quota recovered:

```bash
claude -p \
  --dangerously-skip-permissions \
  --plugin-dir /tmp/alexandria-236 \
  "Run /library to configure a context library for this project. This is a new project with no existing docs yet. I want to build a collaborative urban gardening app that helps neighbors share plots, seeds, and care schedules. Guide me conversationally."
```

Observed result:

```text
Raven produced a real opening turn instead of a quota error.
```

Interactive session then used:

```bash
claude \
  --dangerously-skip-permissions \
  --plugin-dir /tmp/alexandria-236
```

Conversation summary:

- Raven opened conversationally, without step numbers or form language
- value exchange / agreement phase felt appropriate
- Frankenstein diagnostic happened early and correctly shaped the room
- inferred configuration:
  - AI mode: collaborative / pair-programmer style
  - novelty: moderate
  - complexity: high
- Raven explicitly treated `Noun Vocabulary` as foundational when the user emphasized it
- Raven then delegated to Sam and successfully wrote:
  - `docs/alexandria/alexandria-config.json`

Verified artifact:

```bash
jq '.' docs/alexandria/alexandria-config.json >/dev/null
```

Result:

```text
OK
```

Actual file created:

`/tmp/alexandria-236/.tmp/manual-smoke/lib2-009/greenfield-product/docs/alexandria/alexandria-config.json`

What failed next:

- after `alexandria-config.json` was written, Raven moved toward the first source artifact
  (Product Vision)
- the session then stopped making visible progress
- no additional files were written
- specifically, no source artifact and no `docs/alexandria/assessment.md` were created

## Scenario 2: Returning-Session Continuation

After `alexandria-config.json` existed, the smoke test re-entered the same repo to verify
room reconstruction and continuity.

First interactive continuation attempt:

```bash
env TERM=dumb claude \
  --dangerously-skip-permissions \
  --plugin-dir /tmp/alexandria-236
```

This surfaced a misleading infrastructure problem:

```text
1 MCP server needs auth
```

Root cause:

- not Alexandria-specific
- the active global Claude profile at `~/.claude` points to `~/.claude-personal`
- that personal profile includes globally configured Gmail and Google Calendar MCP state
- those global MCP servers leaked into the smoke run and triggered an auth pause

Relevant local evidence:

- `~/.claude -> /Users/jessmartin/.claude-personal`
- `/Users/jessmartin/.claude-personal/mcp-needs-auth-cache.json`

That was corrected by rerunning with strict MCP isolation:

```bash
claude -p \
  --strict-mcp-config \
  --dangerously-skip-permissions \
  --plugin-dir /tmp/alexandria-236 \
  "Run /library in the current project. docs/alexandria/alexandria-config.json already exists from an earlier session. This is a smoke test continuation, so reconstruct the current room from disk, continue from the existing state, and proceed to draft the next appropriate source artifact and docs/alexandria/assessment.md without asking follow-up questions unless blocked by missing required information. Be honest about what is inferred versus verified."
```

And again in interactive bare mode:

```bash
env TERM=dumb claude \
  --bare \
  --strict-mcp-config \
  --dangerously-skip-permissions \
  --plugin-dir /tmp/alexandria-236
```

Observed continuation behavior after isolating MCP:

- no auth pause
- no visible Raven continuation turn
- no additional files written
- no `docs/alexandria/assessment.md`

So the continuation failure reproduces even when the global MCP pollution is removed.

## What Was Verified

- `claude` is installed locally at `/Users/jessmartin/.local/bin/claude`
- `bun` and `gh` are installed locally
- Claude authentication is present and valid
- `/library` can start a real greenfield Raven conversation
- Raven can infer the configuration and delegate a write to Sam
- `docs/alexandria/alexandria-config.json` is written and parses as valid JSON
- the earlier MCP auth interruption was caused by global personal Claude config, not by
  Alexandria
- the underlying continuation stall reproduces even with `--strict-mcp-config`

## What Was Not Verified

The following acceptance-critical behavior is still not honestly verified:

- Scenario 2 returning-session continuity
- scoreboard rendering accuracy
- source artifact production after the initial configuration handoff
- `docs/alexandria/assessment.md` creation and structural completeness

## Follow-Up Disposition

- Product defects found:
  - `/library` stalls after writing `alexandria-config.json` instead of continuing to the
    next source artifact and `assessment.md`
  - returning-session continuation also stalls before producing a visible turn or new
    artifact
- Environment defect observed:
  - global personal Claude MCP configuration leaks into project smoke runs unless
    `--strict-mcp-config` is used
- Follow-up tickets opened from this smoke pass: none yet
- Scope change noted on issue `#236`: yes; the blocker is now product/runtime behavior,
  not host quota

## Rerun Instructions

After the `/library` continuation bug is fixed, rerun the smoke test from the prepared
workspace:

1. Start from:
   `/tmp/alexandria-236/.tmp/manual-smoke/lib2-009/greenfield-product`
2. Use `--strict-mcp-config` when invoking Claude so unrelated global MCP servers do not
   pollute the run.
3. Re-run Scenario 1 and confirm it creates:
   - `docs/alexandria/alexandria-config.json`
   - `docs/alexandria/assessment.md`
4. Validate:
   - `alexandria-config.json` parses as JSON
   - `assessment.md` exists and is structurally complete
5. Re-enter the same repo for Scenario 2 and record:
   - scoreboard continuity
   - surfaced deltas
   - whether Raven avoids re-asking settled configuration questions
6. Confirm Raven can continue past the first config artifact into at least one source
   artifact write.
