# Library Updates from Bun/TypeScript Tooling Migration

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

## Card updates (from what actually shipped)

| Action | Card | What Changed | Source |
|--------|------|-------------|--------|
| Update | System - Eval Harness (WHEN, HOW) | Rewritten from bash (1,000 lines) to TypeScript (1,213 lines) on Bun. Runner is now `src/tools/eval-harness.ts`. Structural checks are TS functions imported by harness. All 3 modes (single-prompt, multi-turn, adaptive) work identically. 521 bun tests replace bash test suites. | FEAT-011, FEAT-012 |
| Update | System - DAG Engine (WHEN, HOW) | Rewritten from Python (552 lines) to TypeScript (541 lines). Uses shared graph library at `src/lib/graph.ts`. Same CLI contract preserved via bash shim in `bin/`. | FEAT-004 |
| Update | System - Quality Grading Engine (WHEN, HOW) | Rewritten from Python (310 lines) to TypeScript (416 lines). Uses shared graph library. | FEAT-005 |
| Update | Capability - Linting (WHEN, HOW) | Rewritten from Python (572 lines) to TypeScript (693 lines). Uses shared graph library. | FEAT-006 |
| Create | Artifact - Decision: Bun as Tooling Runtime | Chose Bun over Node.js for all CLI tooling. Validated via SPIKE-001 (PR #132). Native TS execution, built-in test runner, `bun build --compile` for standalone binaries. gstack precedent. Three caveats: `await proc.exited`, gray-matter try/catch, longer test timeouts. | Planning Decision 1 |
| Create | Artifact - Decision: Three-Tier Bin Wrapper | All `bin/` scripts are bash shims that prefer compiled binary → fall back to `bun run` → error with install instructions. This separates distribution (compiled) from development (bun run) without requiring Bun at runtime. | Execution Decision E1 |
| Create | Artifact - Decision: Test-First Migration Strategy | Port tests to bun test first (calling existing executables), then rewrite tools with tests as safety net. Validates behavioral equivalence. Strategy was correct but execution order was violated by label-driven factory — lesson captured in retro. | Planning Decision 4 |
| ~~Create~~ | ~~Artifact - Lesson: Factory Label-Driven Queuing~~ | Removed — factory orchestration concern, not library | — |
| ~~Create~~ | ~~Artifact - Lesson: Reconciliation Workflow~~ | Removed — factory orchestration concern, not library | — |
