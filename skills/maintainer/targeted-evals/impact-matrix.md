# Eval Impact Matrix

Use this as a starting point. Prefer behavior reasoning over path matching when the two
disagree.

## Existing Coverage

| Changed surface | Default eval action |
|-----------------|---------------------|
| `skills/library/SKILL.md` or `skills/initialize/*` | `pnpm eval -- run initialize/all` |
| `skills/implementation-planning/*` | `pnpm eval -- run implementation-planning/all` and `ticket-writer/all` |
| `agents/conan.md` or `skills/conan/*` | `pnpm eval -- run conan/all` |
| `agents/bridget.md` or `skills/context-briefing/*` | `pnpm eval -- run bridget/all` |
| `agents/sam.md` or `skills/sam/*` | `pnpm eval -- run sam/all` |
| `agents/raven.md` or `skills/raven/*` | `pnpm eval -- run raven/all` |
| `agents/solomon.md` or `skills/solomon/*` | `pnpm eval -- run solomon/all` |
| `docs/initialize/initialize-engine.yaml` | `pnpm eval -- run initialize/all` and `bun test tests/qa-initialize.test.ts` |
| `src/tools/eval-harness.ts` | `bun test tests/eval-runner.test.ts`, then rerun impacted eval suites |

## Additional Heuristics

### Shared docs or templates

If a changed shared file alters how a skill behaves in user-facing output, rerun the skill
that consumes it even if the path is outside the skill directory.

### New reusable behavior

If the change adds a new product-facing reusable behavior:

1. decide whether it produces a durable artifact or a structured report
2. if yes, add eval coverage in the same slice when practical
3. if no direct eval is practical yet, note the missing coverage explicitly in the PR

Contributor skills in `contributor-skills/` are excluded from this default rule unless
they are being promoted into the product surface.

If a reusable product surface is intentionally removed, remove its eval cases and checked-in
results in the same slice instead of rerunning coverage for a surface that no longer ships.

### Agent + skill combinations

If a change spans both an agent prompt and a helper file under its skill directory, treat
that as one behavior surface and rerun the agent's eval suite once, not twice.
