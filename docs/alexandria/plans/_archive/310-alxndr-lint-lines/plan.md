# Issue 310 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#310`
- Goal: add the missing `alxndr lint lines` checks for tab indentation, fenced code block language tags, and terminology variants without changing the broader lint CLI surface.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-034.md`

## Scope

- Extend sweep 1 in the shared lint engine with tab indentation detection.
- Extend sweep 1 with fenced code block opening-fence checks that require a language tag.
- Extend sweep 1 with a small deterministic terminology-variant ruleset for known Alexandria terms.
- Add deterministic black-box coverage in the existing lint CLI test suite for each new line-level rule.

## Non-Goals

- Adding new lint targets or changing `alxndr lint` routing, help text, or formatter behavior.
- Implementing the library-wide terminology cluster report; FEAT-036 owns sweep 5 terminology work.
- Expanding terminology enforcement into a project-configurable noun vocabulary system in this slice.
- Renaming repository docs, skills, agents, or product-library content to resolve existing terminology drift outside the new lint findings.

## Current Gap

- `skills/nit/sweeps.md` defines line-level checks for tab indentation, fenced code block language tags, and terminology consistency.
- `src/tools/lint-core.ts` currently implements heading-skip, wikilink-format, naked-URL, and trailing-whitespace checks for sweep 1, but not the three FEAT-034 rules.
- `src/tools/lint.test.ts` has black-box coverage for the existing sweep 1 behavior but no cases for the missing checks or their expected severities.

## Architectural Boundaries

- Keep all new rule logic inside the shared lint engine so both `alxndr lint` and the legacy compatibility wrapper inherit the behavior automatically.
- Keep terminology enforcement deterministic and repo-local: a short source-controlled variant table is in scope, not dynamic vocabulary loading or sweep-5 clustering.
- Treat fenced code block detection as a line-level markdown hygiene rule only. Do not add full markdown parsing; only track enough fence state to recognize common Markdown fences, including CommonMark-style 0-3 leading spaces before a fence, and suppress prose-oriented checks inside code examples.
- Limit this slice to CLI behavior that naturally changes because of new findings. No separate docs or agent/skill updates are required unless the implementation proves otherwise.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts` | Sweep 1 emits warning findings for tab characters in prose, info findings for bare opening fences across common backtick and tilde markers with up to 3 leading spaces, warning findings for known terminology variants, preserves trailing-whitespace findings on every non-empty line, and skips the other prose-oriented checks inside fenced code blocks |
| Deterministic CLI coverage | `src/tools/lint.test.ts` | Black-box tests verify each new `alxndr lint lines` rule, cover indented fences, and fail descriptively if the CLI does not emit JSON as expected |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | `alxndr lint lines` reports three additional rule families through the existing output formats | Update deterministic lint tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Sweep 1 regression coverage | `bun test src/tools/lint.test.ts` | Verifies the new lines findings through the real CLI entry point |
| Repo quality gate | `bun run check` | Covers formatting, linting, markdown checks, shell checks, and typecheck for the touched slice |
| Regression sweep | `bun test` | Confirms the new sweep 1 behavior does not break the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior only |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Code fence detection may miss common Markdown usage or mistake closing fences for missing-language opening fences | Track the active fence marker and minimum length so only true openings emit findings and common 3+ backtick or tilde fences with up to 3 leading spaces close correctly |
| Prose-oriented rules may overfire on code examples inside fenced blocks | Use the tracked code-fence state to skip heading, tab, terminology, wikilink, and naked URL checks while inside fenced code, while preserving the historical trailing-whitespace check on every non-empty line |
| Terminology matching may overfire on unrelated prose or partial words | Use explicit regex boundaries and a small curated variant list with black-box fixtures for each pair |
| New warning/info rules could accidentally change exit semantics if implemented as errors | Assert on severity values in JSON output and keep `hasErrors` derived from `error` findings only |
| The slice could drift into sweep-5 terminology clustering work | Keep the implementation limited to per-line findings and defer cross-library aggregation to FEAT-036 |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/310-alxndr-lint-lines/`.
2. Add deterministic sweep 1 helpers for tab, code-fence, and terminology checks in `src/tools/lint-core.ts`.
3. Add or reuse a small terminology-variant table in source so the rule set is explicit and testable.
4. Extend `src/tools/lint.test.ts` with black-box fixtures that exercise each new rule and verify severity where it matters.
5. Run targeted lint tests, then `bun run check`, then `bun test`.
6. Review the diff for rule scope, severity, and false-positive risk before PR handoff.

## Acceptance / Exit Criteria

1. A prose line containing a tab character in card content produces a sweep 1 warning finding.
2. An opening fenced code block line with only fence markers and optional spaces produces a sweep 1 info finding for common 3+ backtick and tilde fences, including fences indented by up to 3 spaces.
3. Tabs and the other prose-oriented sweep 1 checks do not fire for lines inside fenced code blocks, but trailing whitespace continues to be reported there.
4. A known terminology variant such as `wiki-link` produces a sweep 1 warning finding.
5. Existing sweep 1 findings still work through the real `alxndr lint lines` CLI surface.
6. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-036 will add the sweep 5 library-wide terminology inconsistency cluster report.
2. A future slice can externalize terminology variants if the lint surface needs project-specific vocabulary policy.
