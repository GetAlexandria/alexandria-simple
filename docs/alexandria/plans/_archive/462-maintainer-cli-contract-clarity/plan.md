# Issue 462 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#462` — `[FEAT] Tighten maintainer CLI contract clarity for grade, initialize, tensions, and eval`
- Goal: make the remaining maintainer-facing CLI seams explain their role in the Alexandria workflow clearly enough that a maintainer can discover the right command and input contract without already carrying the campaign context in their head.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; this plan is derived from the sanitized issue summary, the checked-in CLI report, and the current command/test implementations.

## Scope

- Clarify the help text for `bin/alxndr grade` so it explains that the command consumes per-card grading assessments, computes roll-ups, and optionally blocks on structural pre-gate failures before maintainers use the results downstream.
- Clarify the help text for `bin/alexandria-initialize` so it explains that the command is the maintainer-facing engine behind library initialization and that `--validate` is an engine-table validation workflow, not the normal product-entry path.
- Clarify the help text for `bin/alexandria-tensions` so it explains that the command is a pre-screen for extracted claims against the library and signal queue rather than a generic freeform analysis tool.
- Make `bin/alexandria-eval list` degrade to a plain, log-friendly contract in non-TTY contexts instead of always assuming rich terminal presentation.
- Update the checked-in CLI report and deterministic tests so the clarified contract is documented and locked in.

## Non-Goals

- Changing the JSON schemas, grading math, initialize engine computation, or tension-detection heuristics.
- Migrating additional standalone tools under `alxndr`.
- Adding or rerunning product-skill eval-harness coverage; this slice changes maintainer CLI behavior and deterministic tests/docs only.
- Redesigning every `alexandria-eval` subcommand; only the `list` presentation contract is in scope here.

## Current Gap

- `alxndr grade --help` explains flags but still assumes the maintainer already knows where the input JSON comes from and where grading fits relative to the structural lint pre-gate.
- `alexandria-initialize --help` states the required flags but does not connect the command to the library initialization workflow or distinguish compute vs validation modes in Alexandria terms.
- `alexandria-tensions --help` lists the JSON shape but does not explain the command’s decision boundary: claim pre-screening against the library graph and signal queue for specific tension classes.
- `alexandria-eval list` always renders in a rich terminal style, including ANSI escapes and box-drawing characters, even when stdout is piped or captured; that weakens the contract in CI/logging/non-TTY use.

## Architectural Boundaries

- Keep the behavior changes in CLI-facing copy and presentation helpers, not in grading, initialize-engine, or tension-analysis core logic.
- Preserve the existing command names and invocation shapes; this slice is about contract clarity, not surface redesign.
- Keep `alexandria-eval` non-TTY handling localized to the list/output formatting seam instead of broad terminal refactors across unrelated subcommands.
- Update maintainer docs only where they describe the shipped CLI contract directly; do not widen this into a general docs rewrite.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/462-maintainer-cli-contract-clarity/plan.md` | Captures the repo-specific implementation slice, boundaries, and verification for issue `#462` |
| Grade CLI help contract | `src/tools/grade.ts`, `src/cli/main.test.ts`, `src/tools/grade.test.ts` | `alxndr grade --help` explains where the JSON comes from, what the command computes, and how the structural pre-gate fits into the grading workflow |
| Initialize CLI help contract | `src/tools/initialize.ts`, `src/tools/initialize-cli.test.ts` | `alexandria-initialize --help` explains the maintainer role of the initialize engine and distinguishes compute vs validate usage clearly |
| Tensions CLI help contract | `src/tools/tensions.ts`, `src/tools/tensions.test.ts` | `alexandria-tensions --help` explains the command as a claim pre-screen for specific tension classes and names the expected Alexandria paths more clearly |
| Eval list presentation | `src/tools/eval-cli.ts`, `src/tools/eval-cli.test.ts`, `tests/cli-smoke.test.ts` | `alexandria-eval list` becomes plain and log-friendly in non-TTY contexts while remaining readable in terminal use |
| Maintainer CLI report | `docs/alexandria/cli-report.md` | Records the clarified role/contract for the affected commands and the non-TTY `eval list` behavior |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | The affected maintainer CLIs explain their Alexandria workflow role and input/output contract more explicitly; `alexandria-eval list` becomes more stable outside interactive terminals | Keep CLI tests and `docs/alexandria/cli-report.md` aligned with the shipped help/output text |
| Setup / distribution workflow | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Grade CLI contract | `bun test src/tools/grade.test.ts src/cli/main.test.ts` | Verifies direct and routed help/output contract updates for `alxndr grade` |
| Initialize CLI contract | `bun test src/tools/initialize-cli.test.ts` | Verifies the clarified initialize help/output contract |
| Tensions CLI contract | `bun test src/tools/tensions.test.ts` | Verifies the clarified tensions help/output contract |
| Eval list contract | `bun test src/tools/eval-cli.test.ts tests/cli-smoke.test.ts` | Verifies non-TTY-safe `alexandria-eval list` output through both tool-local and wrapper-level coverage |
| Repo quality gate | `bun run check` | Covers formatting, markdown checks, shell checks, and typecheck for the touched surfaces |
| Regression sweep | `bun test` | Confirms the full deterministic suite still passes after the contract wording/output changes |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Maintainer CLI help/output only | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are the quality gate |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Help text could become more verbose without becoming clearer | Keep the new copy role-oriented and workflow-specific, then lock it with direct help assertions in tests |
| Non-TTY `alexandria-eval list` changes could accidentally break the interactive terminal experience | Keep terminal formatting behavior for TTY output and add an explicit non-TTY test path instead of flattening all output unconditionally |
| Documentation could drift from the new contract again | Update `docs/alexandria/cli-report.md` in the same slice and base the wording on the implemented/tested behavior |
| Clarifying command roles could overreach into product-specific examples | Keep examples and wording generic to Alexandria workflows rather than any one downstream product domain |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/462-maintainer-cli-contract-clarity/`.
2. Update `src/tools/grade.ts`, `src/tools/initialize.ts`, and `src/tools/tensions.ts` help text so each command explains its Alexandria workflow role and its exact contract more directly.
3. Update `src/tools/eval-cli.ts` so `list` detects non-TTY output and switches to a plain, log-friendly rendering.
4. Extend the focused CLI tests to lock in the new help/output contract and non-TTY behavior.
5. Update `docs/alexandria/cli-report.md` so the checked-in maintainer audit matches the shipped command contract.
6. Run the targeted CLI suites, then `bun run check`, then `bun test`.

## Acceptance / Exit Criteria

1. `alxndr grade --help` explains the JSON-input grading workflow and structural pre-gate role clearly, not just the flags.
2. `alexandria-initialize --help` distinguishes compute vs validate usage and explains where the command sits in the library initialization workflow.
3. `alexandria-tensions --help` clearly identifies the command as claim-tension pre-screening against the library and signal queue.
4. `alexandria-eval list` emits a plain, readable contract in non-TTY contexts without raw ANSI formatting noise.
5. The focused deterministic tests reflect the new contract and pass.
6. `docs/alexandria/cli-report.md` matches the shipped help/output behavior.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. If future CLI audit work finds other standalone tools that still assume too much campaign context, extend the same contract-clarity pass command by command rather than rewriting the whole CLI surface at once.
2. If non-TTY/styled-output issues recur across more `alexandria-eval` subcommands, factor a shared terminal-formatting helper in a dedicated follow-up rather than broadening this slice now.
