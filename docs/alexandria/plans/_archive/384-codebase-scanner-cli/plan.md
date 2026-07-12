# Technical Plan

## Header

- Issue reference: `#384` — `[FEAT-059] Codebase scanner CLI (alxndr scan)`
- Goal: Add a deterministic `alxndr scan` CLI that performs the current Tier 1 scanner mechanics in software: scan framework-agnostic directory patterns, extract candidate nouns from file names, filter infrastructure names, group findings by domain structure, and emit structured JSON for the initialize flow.
- Linked product plan: `docs/alexandria/plans/progressive-codebase-discovery/plan.md`, `docs/alexandria/plans/progressive-codebase-discovery/tickets/DISC-002.md`, `docs/alexandria/library/product/systems/System - Codebase Scanner.md`

## Scope

- Add an `alxndr scan <path>` subcommand to the unified CLI router.
- Implement a deterministic Tier 1 scanner that walks the filesystem, matches scanner directories, extracts normalized candidate names, filters infrastructure/test/build noise, groups results, and assigns confidence/type hints from layer coverage.
- Emit JSON that captures scan counts, candidate/group summaries, and per-candidate evidence paths so initialize can consume scanner output without prompt-level file walking.
- Add deterministic integration coverage for CLI help/errors and representative scan results on fixture codebases.
- Update scanner-facing docs/skills so the prompt surface treats the CLI as the execution primitive for Tier 1 rather than re-describing file-tree heuristics as manual tool work.

## Non-Goals

- Implementing Tier 2 file-content reading, schema extraction, route analysis, or dead-code detection.
- Wiring the new CLI into Raven or the initialize runtime in this same slice.
- Adding stack-specific parsers or framework adapters beyond the checked-in heuristic directory patterns.
- Turning grouped scan output into confirmed library cards or skipping the noun-dialogue review step.
- Expanding this issue into generic repo file-search infrastructure unrelated to scanner behavior.

## Current Gap

- `skills/initialize/scanner.md` currently contains the Tier 1 mechanics as prompt instructions for Glob/Grep-style work rather than delegating them to a shipped CLI tool.
- The unified `alxndr` router has no `scan` subcommand, so there is no deterministic executable surface for codebase discovery.
- The repo has no test fixture or deterministic coverage for scanner noun extraction, infrastructure filtering, grouping, or confidence assignment.
- The product docs describe scanner behavior and grouped proposals, but the actual shipped implementation path is still agentic for a task that is mostly mechanical.

## Architectural Boundaries

- Keep deterministic scan logic in TypeScript under `src/tools/` and thin CLI argument handling under `src/cli/`.
- Limit this slice to Tier 1 file-tree scanning; do not read arbitrary file contents.
- Treat the CLI output as proposal data only. Human confirmation and later wizard orchestration remain prompt/agent concerns.
- Preserve framework-agnostic heuristics as checked-in software configuration rather than embedding stack-specific assumptions in the command.
- Keep scanner docs aligned with the new primitive without collapsing the broader initialize workflow into CLI-only behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/384-codebase-scanner-cli/plan.md` | Captures repo-specific implementation, testing, and eval boundaries for the issue |
| CLI router | `src/cli/main.ts`, new `src/cli/scan.ts` | Adds a shipped `alxndr scan` command with help/error handling |
| Scanner tool | New `src/tools/scan.ts` and any small helper module it needs | Moves Tier 1 scanner mechanics from prompt instructions into deterministic software that returns JSON |
| Deterministic CLI tests | `src/cli/main.test.ts`, new `src/tools/scan.test.ts` | Covers scan help/errors, JSON output, noun extraction, filtering, grouping, and confidence classification |
| Initialize scanner docs | `skills/initialize/scanner.md`, possibly nearby initialize docs that reference how scanning executes | Scanner guidance becomes CLI-first for Tier 1 while preserving proposal/human-review semantics |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Initialize scanner skill | Tier 1 scanning stops being described as manual Glob/Grep work and instead instructs use of the deterministic `alxndr scan` primitive | Keep scanner docs/examples aligned with the real CLI output shape and rerun impacted initialize evals if the prompt surface changes |
| CLI tools | New `alxndr scan <path>` command provides reusable scanner output for initialize and future workflows | Keep help text and integration tests aligned with the final command contract |
| Product scanner docs | The scanner system now has a shipped software primitive for Tier 1 instead of a purely prompt-level procedure | Update only the directly affected docs in this slice; defer broader initialize wiring |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused scan coverage | `bun test src/tools/scan.test.ts src/cli/main.test.ts` | Fast iteration loop for scan heuristics, JSON output, and CLI wiring |
| Repo formatting/lint/typecheck gate | `bun run check` | Required repo baseline after adding TypeScript and doc changes |
| Full deterministic suite | `bun test` | Required repo baseline to catch regressions outside the new command |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/initialize/scanner.md` / initialize scanner behavior | Likely covered through initialize evals if scanner prompting is exercised as part of `/library` behavior | Rerun impacted initialize eval coverage if the skill wording changes materially | `bin/alexandria-eval run initialize/all` |
| CLI scan tool | No eval-harness coverage; deterministic executable surface | No new eval required for the CLI itself | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Heuristic filtering could remove real product nouns that happen to use generic names | Prefer keeping ambiguous names at low confidence unless they clearly match infrastructure/test/build patterns; cover edge cases in fixture tests |
| Grouping logic could become overly clever and drift into hidden product judgment | Keep grouping rules mechanical: domain directories first, then shared prefixes, then `Ungrouped` fallback |
| The CLI output could diverge from scanner docs and leave initialize prompts referencing nonexistent fields | Update the scanner skill in the same slice and keep JSON structure explicit in tests |
| Recursive scanning could pick up dependency/build directories and produce noisy or slow output | Exclude known dependency/build/test directories during traversal and verify counts against small fixtures |
| Scope could spill into Tier 2 because the scanner docs mention it | Keep Tier 2 explicitly out of scope in code, docs, and tests for this issue |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/384-codebase-scanner-cli/`.
2. Design the scan output shape and implement a deterministic Tier 1 scanner in `src/tools/scan.ts`.
3. Add a thin `src/cli/scan.ts` wrapper and wire the new subcommand into `src/cli/main.ts`.
4. Add fixture-backed deterministic tests for extraction, filtering, grouping, confidence levels, and CLI help/error handling.
5. Update `skills/initialize/scanner.md` to treat the CLI as the Tier 1 execution path and keep the human confirmation boundary explicit.
6. Run focused tests, then `bun run check`, then `bun test`.
7. If the skill wording changed materially, run the relevant initialize evals and inspect for regressions.
8. Do a local review pass against the issue scope and the product-level scanner plan before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr scan <path>` exists and is discoverable through CLI help.
2. The command emits deterministic JSON for Tier 1 codebase discovery, including grouped candidates, confidence, type hints, and evidence paths.
3. The implementation does not read file contents.
4. Deterministic tests cover the new command and representative heuristic behavior.
5. `bun run check` passes.
6. `bun test` passes.
7. Any required initialize eval rerun completes without unresolved regression.

## Deferred Follow-Ups

1. Wire `alxndr scan` into the initialize/runtime flow so Raven and the scanner path consume the deterministic output directly.
2. Add Tier 2 selective content reading as a separate issue once the Tier 1 contract is stable.
3. Revisit whether scanner output should gain richer provenance or summary formatting once the initialize integration path is built.
