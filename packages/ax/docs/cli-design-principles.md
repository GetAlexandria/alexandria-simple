# ax CLI Design Principles

This copy applies to `ax` and the provisional `ax` binary. It is copied
from the current `@alexandria/ax` package so the Next CLI has local design
guidance while it evolves independently.

This is the design standard for new or changed `ax` CLI features. Treat it as a
design checklist before implementation, not as cleanup after code is written.
Existing commands may predate this standard; preserve compatibility and use
aliases or migrations rather than breaking callers.

## Design Checklist

Every CLI feature design should explicitly cover:

1. Interaction mode: how it behaves in headless use, TTY use, and confirmation
   flows.
2. Output contract: human output, JSON output, stderr diagnostics, and stable
   exit codes.
3. Validation behavior: when invalid input is rejected, which valid values are
   listed, and what example invocation is shown.
4. Mutation boundary: whether the command mutates state, how dry runs work, and
   how retries avoid duplicate work.
5. Response bounds: limits, filters, pagination, truncation metadata, and
   summary-first behavior.
6. Introspection impact: whether help text, machine-readable command schema, or
   skill manifests need updates.

## Tier 1: Table Stakes

These rules prevent agent-hostile CLI behavior.

### 1. Non-Interactive by Default

- Commands must complete in headless use without blocking prompts.
- If a prompt is needed for a human flow, provide a non-interactive path.
- Use `--yes` for confirmation prompts that accept the proposed action.
- Use `--force` for explicit destructive overrides, not for ordinary
  confirmations.
- Use `--no-input` when a command needs to reject all prompt paths rather than
  assume consent.
- Detect TTYs honestly. Do not prompt when stdin or stdout is not interactive.

### 2. Structured, Parseable Output

- Put command data on stdout.
- Put diagnostics and errors on stderr.
- Use `--json` as the consistent flag for JSON output.
- Do not introduce new JSON-only surfaces that require `--format=json`; keep
  legacy format flags only as compatibility aliases where needed.
- Document stable non-zero exit codes for each command. Shared meanings should
  stay consistent across commands.

### 3. Errors That Teach and Enumerate

- Validate enum, schema, path, and dependency inputs before side effects.
- When rejecting a constrained value, list the valid options.
- Include a working example invocation when it helps the caller recover.
- Prefer precise errors over generic usage dumps.

### 4. Safe Retries and Explicit Mutation Boundaries

- Make creates idempotent through a natural key or idempotency token.
- Return stable identifiers for created, updated, deleted, or submitted work.
- Provide `--dry-run` for consequential or destructive operations.
- Require explicit non-default flags for destructive operations.
- For async work, persist submitted job identifiers in a durable ledger so a
  retry can recover or observe the existing job instead of duplicating it.

### 5. Bounded Responses at Every Layer

- Commands that enumerate data must have pagination, filters, or sensible
  default limits.
- JSON output should include truncation metadata when results are incomplete.
- Human output should include a hint for narrowing the next query when results
  are truncated.
- Prefer summary-first responses for large result sets.
- Keep MCP, schema, and manifest descriptions concise enough for agent context.
  Enforce a token budget per exposed tool.

## Tier 2: Compounding Standards

These rules make the CLI easier for agents and humans to learn over time.

### 6. Cross-CLI Vocabulary Consistency

- Use common verbs: `get`, `list`, `create`, `update`, and `delete`.
- Use common flags: `--json`, `--yes`, `--force`, `--dry-run`, `--limit`, and
  `--profile`.
- Avoid one-off synonyms such as `info`, `ls`, `--format=json`, or
  `--skip-confirmations` on new surfaces.
- Enforce naming rules in shared parsers, schemas, generators, or tests rather
  than relying only on review.

### 7. Three-Layer Introspection

- Layer 1: human help through `--help`, including usage, option descriptions,
  and examples.
- Layer 2: machine-readable command schema with a schema version. A future
  command such as `ax agent-context` should expose this for agents.
- Layer 3: skill manifests that describe workflows and tasks, not only command
  arguments.
- Generate all three layers from the same source when practical, and update all
  affected layers in the same change.

### 8. Async-Aware Execution

- Every async submit command should support `--wait`.
- The CLI owns the poll loop, including backoff and jitter.
- Maintain a durable job ledger such as `~/.ax/jobs.jsonl`.
- Provide `jobs list`, `jobs get`, and `jobs prune` when durable jobs exist.
- `--wait` must support disconnect recovery rather than requiring resubmission.

### 9. Persistent Identity Through Profiles

- When configuration bundles are needed, implement `profile save`, `profile use`,
  `profile list`, `profile show`, and `profile delete`.
- Support a root `--profile <name>` flag for selecting a saved bundle.
- Apply precedence in this order: explicit flag, environment variable, profile,
  default.
- Expose available profiles and profile contents through the same
  machine-readable introspection surface.

### 10. Two-Way I/O

- Use `--deliver` for output routing when a command needs destinations beyond
  stdout.
- Supported schemes should be explicit, for example `stdout`, `file:<path>`, and
  `webhook:<url>`.
- File delivery must use atomic writes.
- Unknown delivery schemes should fail with structured refusals and list valid
  schemes.
- Provide a built-in `feedback` command when the CLI needs product feedback from
  real usage. It should log local JSONL and optionally post upstream to a
  configured endpoint.
- Delivery options and feedback capability must be discoverable through
  machine-readable introspection.
