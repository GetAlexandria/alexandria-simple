# Issue 341 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#341`
- Goal: add a deterministic sweep-6 internal-consistency lint target that catches same-file mismatches between YAML frontmatter arrays and markdown prose/table structure
- Linked product plan: `docs/alexandria/implementation-plans/architecture-review-hardening/release.md`, `docs/alexandria/implementation-plans/architecture-review-hardening/outcomes/O-2.md`, `docs/alexandria/implementation-plans/architecture-review-hardening/tickets/FEAT-041.md`

## Scope

- Add a new named `alxndr lint internal-consistency <repo-root>` target under sweep 6.
- Scan designated repo markdown surfaces where Alexandria already mixes frontmatter with prose and tables: agents, product skills, contributor skills, checked-in plan docs, and design docs.
- Implement the deterministic subset explicitly called for by `FEAT-041`:
  - frontmatter array length vs prose count claims in the same file
  - frontmatter string-list membership vs markdown table rows for the same concept
  - frontmatter `steps` / `phases` array length vs numbered prose sections
- Include the target in `alxndr lint all` when the repo root contains candidate files.
- Add black-box tests and top-level CLI router/help coverage for matching and mismatching cases.

## Non-Goals

- Semantic contradiction detection across arbitrary prose.
- Comparing non-frontmatter YAML blocks, pseudocode, mermaid graphs, or free-form dependency annotations in this slice.
- Auto-fixing files or rewriting stale prose/tables.
- Broad natural-language inference such as deciding whether two differently worded concepts are "the same thing."
- Reworking other sweep-6 targets beyond wiring the new target into shared lint dispatch.

## Current Gap

- Sweep 6 policy in `skills/nit/sweeps.md` calls out internal consistency as a Nit/manual family, but `alxndr lint` has no dedicated internal-consistency target yet.
- The lint engine currently implements repo-root sweep-6 helpers for `plans`, `counts`, `briefings`, and `wizard`, plus library/path checks, but nothing that compares structured data within one markdown file.
- The repository contains many files with YAML frontmatter plus prose examples, tables, and numbered procedures, but there is no deterministic guard against those structures drifting apart.

## Architectural Boundaries

- Keep internal-consistency parsing in a dedicated helper module rather than embedding more sweep-6-specific parsing logic into `lint-core.ts`.
- Limit the first slice to explicit, deterministic frontmatter-driven comparisons. If a check cannot be justified by exact structure matching, it does not belong in this issue.
- Prefer normalized key/header matching and exact count/set comparisons over fuzzy NLP or synonym guessing.
- Preserve the existing repo-root lint architecture: validation in `lint-core.ts`, focused execution in a helper, black-box tests through `bin/alxndr`.
- Keep the skill/doc update minimal and factual if the public sweep definition needs alignment with the new CLI target.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts`, new helper `src/tools/lint-internal-consistency.ts` | Adds a new sweep-6 target, path validation, and `all`-mode inclusion for internal same-file consistency checks |
| CLI help / routing | `src/cli/lint.ts`, `src/cli/main.test.ts` | `alxndr lint --help` lists `internal-consistency`, and router dispatch accepts a repo-root input for the target |
| Deterministic lint coverage | `src/tools/lint.test.ts` | Black-box tests cover count drift, set drift, matching cases, numbered-step drift, and `all`-mode inclusion |
| Nit sweep definition | `skills/nit/sweeps.md` | Sweep-6 docs reflect that internal consistency is now a CLI target rather than purely manual |
| Repo planning docs | `docs/alexandria/plans/341-lint-internal-consistency/plan.md` | Captures scope, risks, tests, and eval boundary for the issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | `alxndr lint internal-consistency <repo-root>` becomes a new deterministic sweep-6 target; `alxndr lint all <path>` includes it when candidate files exist | Update deterministic CLI tests and router/help coverage |
| Product skills | `skills/nit/sweeps.md` should describe internal consistency as CLI-implemented if that file is edited in this slice | Run targeted Nit evals and check in refreshed baselines if the eval output changes |
| Agents | None | None |
| Contributor skills | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Internal-consistency target coverage | `bun test src/tools/lint.test.ts` | Verifies the new sweep-6 behavior through the executable lint surface |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms target listing and dispatch through the top-level CLI |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell checks, linting, and typecheck for the touched slice |
| Full deterministic regression suite | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` deterministic CLI | No eval-harness coverage applies to helper-only CLI behavior | No eval needed for code-only changes | N/A |
| `skills/nit/sweeps.md` | Nit has eval coverage | If the sweep definition file changes, rerun existing Nit coverage | `bin/alexandria-eval run nit/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Generic matching rules could create noisy false positives across unrelated tables or prose | Restrict comparisons to top-level frontmatter arrays, explicit count phrases, and tables whose headers normalize to the same key |
| Table parsing could miss common markdown formatting variants or misread list cells | Support the repo's actual table shapes, normalize wikilinks/backticks/comma-separated cells, and cover those variants in tests |
| `all` target semantics could drift if the new repo-root target runs in contexts with no candidate files | Gate inclusion behind a dedicated `hasInternalConsistencyLintRoot(...)` helper, matching the existing repo-root target pattern |
| Updating Nit docs could force eval work late in the slice | Keep the doc change minimal, run targeted Nit evals only if the skill file actually changes, and avoid broader wording churn |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/341-lint-internal-consistency/`.
2. Implement a focused helper that discovers candidate markdown files, parses frontmatter arrays, extracts deterministic prose/table structures, and emits sweep-6 findings.
3. Wire the new target into `lint-core.ts`, CLI help text, path validation, and `all`-mode aggregation.
4. Extend `src/tools/lint.test.ts` with mismatching and matching fixtures for count, set, and numbered-step cases.
5. Extend `src/cli/main.test.ts` with help-text and router coverage for `internal-consistency`.
6. Update `skills/nit/sweeps.md` if needed to keep the documented sweep-6 surface aligned.
7. Run targeted tests, then repo-wide gates, then targeted Nit evals if the skill file changed.

## Acceptance / Exit Criteria

1. `alxndr lint internal-consistency <repo-root>` reports count mismatches between frontmatter arrays and prose count claims in the same file.
2. The target reports set differences between frontmatter arrays and markdown table rows for the same normalized concept in the same file.
3. The target reports `steps` / `phases` array count drift against numbered prose sections when those structures exist.
4. Matching structures produce no findings.
5. The target integrates with existing lint output and appears in CLI help and router dispatch.
6. `alxndr lint all <path>` includes internal-consistency findings when candidate files are present.
7. Deterministic tests cover the new behavior.

## Deferred Follow-Ups

1. Expand beyond frontmatter to same-file YAML code blocks or mermaid/dependency-graph comparisons if real repo usage justifies it.
2. Add richer key/header aliases only after concrete false negatives appear in checked-in files.
3. Revisit whether more sweep-6 manual families in `skills/nit/sweeps.md` should now move into CLI-backed targets.
