# Issue 382 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#382`
- Goal: make unresolved `[[Type - Name]]` wikilinks actionable in `alxndr lint` by reporting the source line and keep Sam's self-check procedure aligned with that structural gate
- Linked product plan: none linked in the issue; product intent comes from issue `[FEAT-057]`

## Scope

- Keep unresolved wikilink validation in the existing sweep-3 graph lint path rather than adding a parallel target.
- Extend broken-wikilink findings so each report includes the source file, exact line, broken wikilink text, and a concrete fix suggestion.
- Add deterministic CLI coverage for valid and broken wikilinks using real library fixtures.
- Update Sam's checked-in self-check procedure so it explicitly runs the graph lint target before manual review.
- Close the touched parser gap where wikilinks embedded on section header lines are skipped, so sweep-3 remains truthful for every parsed section link occurrence.

## Non-Goals

- Reworking sweep-3 orphan or bidirectional-gap behavior.
- Adding auto-fix behavior or rewriting broken links automatically.
- Broadening lint to non-library markdown surfaces such as repo docs, agents, or skills.
- Changing Sam's writing heuristics beyond the specific self-check lint invocation needed for this issue.

## Current Gap

- `alxndr lint graph` already detects unresolved wikilinks through `Library.brokenLinks()`, so the repo has the core validation behavior today.
- The current sweep-3 finding uses `line: 0`, which makes the output less actionable than the issue requires.
- Sam's self-check entry point in `agents/sam.md` only runs `bin/alxndr lint cards ... --json` before manual review, so it can miss broken-link failures unless the later workflow steps are followed.
- The reusable procedure in `skills/sam/self-check.md` does not mention the graph lint gate, and `parseCard()` still skips wikilinks written on the same line as a `##` section header.

## Architectural Boundaries

- Line-aware broken-link reporting belongs in the shared graph/lint implementation, not in Sam-specific prompt logic.
- The source of truth for unresolved wikilinks should remain the parsed library graph built from on-disk cards.
- Sam's procedure should call the existing CLI target instead of describing a manual substitute for machine-checkable validation.
- This slice should not create a second lint rule that duplicates sweep-3 graph semantics under a new name.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Graph parsing / lint engine | `src/lib/graph.ts`, `src/tools/lint-core.ts` | Broken wikilink findings become line-aware and section-header wikilinks remain visible to the shared library graph |
| Deterministic graph and lint coverage | `src/graph.test.ts`, `src/tools/lint.test.ts` | Parser and CLI coverage verify actionable broken-link details plus the section-header wikilink edge case |
| Sam agent + skill procedure | `agents/sam.md`, `skills/sam/self-check.md` | Self-check explicitly invokes the graph lint target before manual review in both the wrapper and the reusable procedure |
| Repo planning docs | `docs/alexandria/plans/382-wikilink-target-exists/plan.md` | Captures repo-specific scope, tests, and eval boundary |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tool | `alxndr lint graph` reports broken wikilinks with exact line numbers instead of `line: 0`, including links embedded on section header lines | Update deterministic parser and CLI tests |
| Agents | Sam's self-check procedure explicitly runs graph lint as part of structural validation | Rerun Sam evals because `agents/sam.md` changes reusable behavior |
| Product skills | Sam's reusable self-check procedure names the graph lint gate instead of relying on manual link verification alone | Rerun Sam evals because `skills/sam/self-check.md` changes reusable behavior |
| Contributor skills | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Graph parser coverage | `bun test src/graph.test.ts` | Verifies source-line tracking and section-header wikilink parsing in the shared graph layer |
| Graph lint coverage | `bun test src/tools/lint.test.ts` | Verifies broken and valid wikilink behavior through the executable lint surface |
| Sam agent routing/help fallout | `bun test src/cli/main.test.ts` | Confirms no router/help regressions if lint-target behavior or docs expectations shift |
| Repo quality gate | `bun run check` | Required formatting, lint, shell, markdown, and typecheck gate |
| Full deterministic regression suite | `bun test` | Repo-required full deterministic suite before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | Deterministic coverage exists; no eval-harness coverage required for code-only lint changes | No lint-specific eval rerun needed | N/A |
| `agents/sam.md` and `skills/sam/self-check.md` | Sam has eval coverage | Rerun existing Sam eval suite after the self-check procedure change | `bin/alexandria-eval run sam/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Line-number reporting could drift if the graph stores only card-level edges | Extend parsed wikilink metadata once in `src/lib/graph.ts` so all downstream consumers share the same source location |
| Header-line wikilinks could remain invisible even after line-aware reporting ships | Parse section-header remainder text separately for link extraction and add deterministic tests that fail if the header-line case regresses |
| Broken-link findings could become noisy or duplicate if multiple identical links appear in one file | Preserve the current edge-based reporting model so each actual broken wikilink occurrence is reported with its own source line |
| Updating only `agents/sam.md` but not `skills/sam/self-check.md` would leave the reusable self-check procedure inconsistent | Update both surfaces in the same slice and rerun `sam/all` after local review |
| The slice could accidentally introduce a redundant lint target because the issue wording says "add a lint check" | Keep the implementation in sweep 3 and document in code/tests that unresolved wikilinks are part of graph lint |

## Implementation Steps

1. Add the issue plan under `docs/alexandria/plans/382-wikilink-target-exists/`.
2. Extend parsed wikilink/edge data to retain source line information for each link occurrence.
3. Parse wikilinks written on section header lines without changing unrelated section-content storage semantics.
4. Update sweep-3 broken-link findings to emit the stored source line while preserving the existing message/fix structure.
5. Add deterministic tests for one broken wikilink, one valid wikilink, the expected actionable finding fields, and the section-header wikilink edge case.
6. Update Sam's self-check procedure in both `agents/sam.md` and `skills/sam/self-check.md` to invoke or explicitly require `bin/alxndr lint graph ... --json` before the manual checklist.
7. Run targeted deterministic tests, local review, `sam/all`, `bun run check`, and `bun test`.

## Acceptance / Exit Criteria

1. `alxndr lint` flags unresolved `[[Type - Name]]` wikilinks in library cards.
2. Broken-link findings include the source file, exact line, broken wikilink text, and a fix suggestion.
3. Deterministic coverage exercises both broken and valid wikilinks.
4. Sam's checked-in self-check procedure explicitly calls or references the relevant lint target for broken wikilinks.
5. Section-header wikilinks remain visible to the parser and therefore to sweep-3 broken-link reporting.
6. The change lands without introducing a duplicate lint target for behavior already owned by sweep 3.

## Deferred Follow-Ups

1. If Sam still fabricates nonexistent links after this gate, consider adding a narrower self-check skill reminder or a dedicated eval case that asserts link-resolution discipline directly.
2. If other lint findings would benefit from source-line accuracy, extend the same metadata pattern to orphan-adjacent or conformance-adjacent reports where feasible.
