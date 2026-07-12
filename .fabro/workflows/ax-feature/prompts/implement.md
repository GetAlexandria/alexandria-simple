# Implement

Implement the Alexandria feature plan.

Before editing files:

- Read the plan under `docs/alexandria/plans/<stable-feature-slug>/plan.md`.
- Read and obey `CLAUDE.md` plus package-local `CLAUDE.md`, README, and
  guidance files for every package or surface touched by the plan.
- Treat package-local guidance as owning implementation workflow, tests, evals,
  and validation for the touched package.

Work rules:

- Stay scoped to the plan, its named package/surface boundaries, and
  directly necessary shared configuration.
- Do not freehand-edit `docs/alexandria/library`; it is the live product
  library. Only touch that path when the approved plan explicitly owns a
  library migration or generated card update.
- Do not broaden the plan during implementation. This stage no longer routes
  through a human approval gate. If the planned slice cannot be implemented
  coherently without expanding scope, do not turn the stage into plan-only work:
  implement the smallest coherent planned slice if possible, otherwise leave a
  clear blocking note in the final response for review/human intervention.
- When changing `packages/ax`, model command execution as Effect programs
  returning `CliResult`, put command data on stdout and diagnostics on stderr,
  preserve stable exit codes, and add or update black-box tests for CLI
  behavior.
- When changing `packages/alexandria-plugin`, keep guided play behavior in
  plugin assets and avoid moving deterministic CLI logic there.
- When changing `packages/viewer`, keep browser UI state in Viewer-owned
  components/helpers and add the unit, build, and browser coverage required by
  the plan.
- If this stage is reached after a validation failure, inspect the validation
  output from the prior stage and fix the smallest relevant issue.
- Run the deterministic validation and eval checks named in the plan
  when they are in scope for the implementation.

Before finishing, inspect `git diff --stat` and summarize the implemented
changes.
