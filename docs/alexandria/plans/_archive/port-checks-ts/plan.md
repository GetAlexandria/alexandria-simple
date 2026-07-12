# FEAT-012 Plan: Port Structural Checks to TypeScript

## Scope

Port the nine per-skill structural check scripts from shell to TypeScript while
keeping them colocated with their eval cases and preserving the current
`structural-results.json` contract consumed by the eval runner and eval CLI.

Skills in scope:

- implementation-planning
- wizard
- ticket-writer
- conan
- sam
- raven
- nit
- bridget
- solomon

## Constraints

- Existing checked-in eval baselines should remain structurally comparable.
- The current eval runner is still shell-based, so the migration needs a bridge
  rather than a full harness rewrite.
- Shared logic should live in `src/` where type checking already exists.
- Per-skill structural checks must remain colocated with eval cases.

## Approach

1. Add a shared TypeScript structural-check framework in `src/`:
   - typed result shape
   - filesystem/search helpers
   - markdown/frontmatter helpers where useful
   - runner entry point that loads a skill's colocated structural check module

2. Port each shell script to `tests/eval-cases/<skill>/structural-checks.ts`:
   - export `structuralChecks(outputDir: string): StructuralResult[]`
   - keep check names and pass/fail semantics aligned with the shell versions
   - reuse shared helpers for common file discovery and text matching

3. Bridge the existing shell harness to TypeScript:
   - replace the shell `source` path in `tests/run-eval.sh` with a `bun run`
     invocation of the TypeScript structural-check runner
   - keep the emitted JSON shape unchanged

4. Update supporting code and tests:
   - eval CLI discovery should recognize TypeScript structural checks
   - add/update runner tests so structural checks still execute end-to-end

## Verification

- `bun test tests/eval-runner.test.ts`
- `bun test src/tools/eval-cli.test.ts`
- `bun run tsc --noEmit`
- targeted live comparison against existing checked-in eval output directories

## Risks

- Shell scripts lean heavily on `grep`/`find` behavior; the TypeScript port must
  preserve edge cases like transcript fallback and case-name inference.
- Some checks intentionally emit failing results on current baselines; preserving
  those exact failures matters as much as preserving passes.
