# Issue 301 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#301`
- Goal: add `alxndr lint paths <path>` so the CLI can mechanically detect broken file-path references in skill and agent markdown.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-025.md`, `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a new `paths` lint target to the shared lint engine and `alxndr lint` help surface.
- Scan markdown under `skills/`, `agents/`, and repo-local `contributor-skills/` for deterministic file-path references that point at checked-in repo files.
- Resolve both repo-relative paths and paths written relative to the referencing markdown file when they are mechanically identifiable.
- Emit warning-severity findings for missing targets and cover the behavior with black-box CLI tests.

## Non-Goals

- Implementing the other sweep-6 rule families from the nit hardening plan such as plan status, wizard arithmetic, grade-evidence reconciliation, briefing compliance, or regression detection.
- Adding markdown parsing sophisticated enough to infer every possible prose mention of a file; this slice should start with explicit, path-shaped references only.
- Rewriting agent or skill text to eliminate any currently valid path references unless the implementation reveals a broken checked-in reference that must be fixed.
- Broad documentation rewrites outside the minimum `alxndr lint` command-surface updates caused by the new target.

## Current Gap

- `src/tools/lint-core.ts` currently supports targets and sweep coverage for lines, cards, graph, layers, library, and all; there is no path-resolution target.
- The upstream FEAT-025 ticket requires scanning `skills/**/*.md` and `agents/*.md` for file references and warning when targets are missing.
- This repo also uses checked-in repo-maintainer skills under `contributor-skills/` with the same path-reference style, so excluding them would leave a real repo surface unprotected.
- Existing lint tests cover targets through `library` only and do not build fixtures for path-resolution findings.

## Architectural Boundaries

- Keep the rule in the shared lint engine so both `alxndr lint` and the legacy compatibility wrapper inherit the same behavior.
- Treat path resolution as a repo-root check, but infer that repo root from the provided path when `lint all` is invoked on a nested library directory inside the same checkout.
- Limit detection to deterministic path-like strings found in markdown text, inline code, or command examples. Skip abstract placeholders such as `<path>` and environment-variable prefixes that cannot be resolved without runtime context.
- Keep severities at `warning` for missing files and do not make path findings affect the `hasErrors` exit path unless future requirements explicitly promote them.
- Do not represent this slice as full sweep-6 completion in docs or tests; it is the FEAT-025 path-resolution subset only.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts` | Adds path-reference discovery, resolution, and warning findings under a new `paths` target backed by sweep 6 |
| Lint CLI surface | `src/cli/lint.ts`, legacy help in `src/tools/lint-core.ts` | `alxndr lint --help` lists `paths`; legacy help documents sweep 6 availability carefully enough to avoid implying the entire sweep family is complete |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, optionally `src/cli/main.test.ts` if help text changes need direct router assertions | Black-box tests verify valid references stay clean and missing targets warn with stable rule metadata |
| Nit agent guidance | `agents/nit.md` | The agent prompt treats path resolution as CLI-automated instead of manual-only so repo guidance matches the new target |
| Repo planning docs | `docs/alexandria/plans/301-alxndr-lint-paths/plan.md` | Records scope, verification, and the repo-specific decision to include `contributor-skills/` in the scan |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | Agent markdown gains mechanical lint coverage for broken file references, and Nit's operator guidance now names `paths` as CLI-automated instead of manual-only | Update deterministic lint tests and rerun Nit evals if `agents/nit.md` changes |
| Product skills | None to runtime behavior; skill markdown gains mechanical lint coverage for broken file references | Update deterministic lint tests only unless a broken checked-in path must be fixed |
| Contributor skills | Repo-maintainer skill markdown also gains the same broken-path protection because this repo relies on those files operationally | No eval rerun needed unless the implementation forces contributor-skill text edits |
| CLI tools | `alxndr lint paths <repo-root>` becomes a real target and `alxndr lint all <repo-root>` includes it as an available target | Update help assertions and black-box lint fixtures in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Path-lint behavior | `bun test src/tools/lint.test.ts` | Verifies the new target through the real CLI entry point with valid and broken references |
| CLI router/help | `bun test src/cli/main.test.ts` | Confirms help text and routed `alxndr lint` behavior still match the target list |
| Repo quality gate | `bun run check` | Covers formatting, TypeScript, shell, and markdown checks for the touched slice |
| Regression sweep | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No eval-harness coverage required for this deterministic CLI slice | No eval rerun | N/A |
| Nit agent guidance | Existing Nit coverage applies because `agents/nit.md` changes how Nit is instructed to use the CLI | Rerun Nit eval suite after the prompt update | `bin/alexandria-eval run nit/all` |
| Other agents / product skills | Files are only scanned, not behaviorally changed in this planned slice | None | N/A |
| Contributor skills | Maintainer workflow only; no eval-harness requirement | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Path detection overfires on prose fragments that resemble paths but are not meant to resolve | Restrict matching to explicit path-shaped tokens with known repo prefixes or absolute/home prefixes, and skip placeholders such as `<path>` or `${VAR}`-prefixed examples |
| The repo uses both repo-relative and file-relative examples, creating false broken-path findings or leaking escaped absolute paths in warnings | Resolve candidate paths against the repo root first when the string is repo-shaped, resolve relative examples from the source file, and drop candidates that escape outside the inferred repo root |
| Adding `paths` to `all` could be mistaken for completing all of sweep 6 | Keep the plan, tests, and help text framed around “available targets” rather than “full sweep 6,” and avoid broad docs claims outside this issue slice |
| Real checked-in docs may already contain stale references, causing the new target to fail the repo immediately | Use fixture-based tests first, then run the target on the repo and fix only concrete checked-in path breakage discovered by the new rule |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/301-alxndr-lint-paths/`.
2. Extend the shared lint target tables and CLI help to include `paths`.
3. Implement deterministic path-reference extraction and resolution in `src/tools/lint-core.ts` for scanned markdown under `skills/`, `agents/`, and `contributor-skills/`.
4. Add black-box tests covering valid repo-relative paths, valid file-relative paths, and missing-path warnings.
5. If Nit-facing guidance changes during review follow-through, rerun the Nit eval suite and check results against baseline.
6. Run targeted tests, then `bun run check`, then `bun test`.
7. Review the diff and the repo’s own `lint paths` output for false positives before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint paths <repo-root>` scans checked-in markdown under `skills/`, `agents/`, and `contributor-skills/`.
2. Missing file targets produce warning-severity findings with stable file, line, rule, and message fields.
3. Valid repo-relative references such as `docs/...` or `skills/...` do not produce findings.
4. Valid references written relative to the referencing markdown file also resolve cleanly.
5. `alxndr lint all <path>` includes the `paths` target when the provided path is the repo root or a nested library directory inside that repo.
6. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-026 through FEAT-031 will add the remaining cross-system checks rather than widening this path-resolution rule opportunistically.
2. If path matching needs more syntax coverage later, extract the detector into a small shared helper with explicit fixture expansion rather than broadening the regex blindly.
