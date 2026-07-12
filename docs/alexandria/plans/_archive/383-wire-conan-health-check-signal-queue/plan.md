# Issue 383 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#383`
- Goal: wire Conan's health-check workflow to read
  `docs/alexandria/signal-queue.jsonl`, surface stale revisit claims in the
  deterministic health-check report, and align Conan-facing docs with the new
  signal-queue consumption path
- Linked product plan: none linked in the issue context; implementing directly
  from issue summary and checked-in signal-queue/health-check docs

## Scope

- Extend `alxndr health-check <path>` so its JSON report includes
  deterministic signal-queue status for the current Alexandria repo/library.
- Read `docs/alexandria/signal-queue.jsonl` when present, treat missing or empty
  queues as non-fatal, and identify unresolved claims whose `revisit_by` date is
  due or past due.
- Expose stale-claim information in a report section Conan can use during
  health check.
- Update Conan's health-check procedure and agent reference so they explicitly
  consume the signal queue during Health Check.
- Keep the existing health-check flow intact; this slice adds a new input, not a
  redesign of the maintenance play.

## Non-Goals

- Changing Solomon's signal-triage workflow or the signal-queue schema itself.
- Introducing write-back behavior that resolves or mutates signal-queue entries.
- Adding a new dedicated Conan health-check eval case in this slice.
- Expanding health check into a broader queue/provenance analytics rewrite
  beyond the stale-claim requirement in the issue.

## Current Gap

- `skills/solomon/signal-queue-schema.md` says Conan should flag claims past
  their revisit date during Health Check.
- `skills/conan/job-health-check.md` currently teaches Conan to read CLI
  `metrics`, `findings`, `inventory`, and `standards_health`, but says nothing
  about `signal-queue.jsonl`.
- `agents/conan.md` names Solomon and Bridget as Health Check inputs indirectly,
  but does not explicitly mention signal-queue stale-claim review in the Health
  Check surface.
- `alxndr health-check` currently emits no signal-queue section, so Conan has no
  deterministic pre-flight substrate for this responsibility.

## Architectural Boundaries

- Keep queue parsing in the deterministic health-check tool layer so Conan can
  consume a stable JSON substrate rather than re-parsing JSONL ad hoc in prompt
  instructions.
- Preserve the existing rule that health-check findings are report data, not
  command failures; missing or malformed queue input should degrade clearly
  without turning normal stale claims into CLI errors.
- Keep Conan's role judgment-led: the CLI should identify stale unresolved
  claims, while Conan decides how they affect the repair agenda and report.
- Treat the signal queue as repo-level Alexandria operational data outside the
  card library root; the implementation must resolve it from the canonical
  `docs/alexandria/` workspace, not from arbitrary sibling files.
- Keep docs general to any Alexandria product library; do not add product-
  specific examples beyond the existing schema terminology.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Health-check aggregation | `src/tools/health-check.ts` | Parses `docs/alexandria/signal-queue.jsonl`, summarizes queue availability/counts, and flags unresolved claims whose `revisit_by` date is on or before the run date |
| CLI contract coverage | `src/cli/main.test.ts`, `src/tools/health-check.test.ts` | Black-box coverage expands to assert signal-queue report shape plus missing/empty/stale handling |
| Conan health-check skill | `skills/conan/job-health-check.md` | Conan now reads the signal-queue report section during pre-flight/source alignment and explicitly carries stale claims into the health report |
| Conan agent reference | `agents/conan.md` | Health Check and division-of-labor wording explicitly include stale signal-queue review as Conan input |
| Health-check capability docs | `docs/alexandria/library/product/capabilities/Capability - Health Check.md` | Product-facing reference names signal-queue stale-claim review alongside feedback/provenance inputs so checked-in docs stay aligned |
| Signal-queue system docs | `docs/alexandria/library/product/systems/System - Signal Queue.md` | Signal-queue reference names Conan as a reader and removes the stale "no automated processing yet" claim |
| Repo technical planning | `docs/alexandria/plans/383-wire-conan-health-check-signal-queue/plan.md` | Captures scope, verification, and the residual eval-coverage boundary |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/conan/job-health-check.md` | Conan reads the signal-queue report section and flags claims that are due or overdue for `revisit_by` during Health Check | Keep wording aligned with the implemented JSON shape and Conan's existing inline report contract |
| `agents/conan.md` | Health Check responsibilities explicitly include stale signal-queue review | Keep division-of-labor language aligned with Solomon's signal-queue schema |
| `Capability - Health Check` | Health Check's maintenance inputs now explicitly include signal-queue stale claims | Update in the same slice so user-facing docs do not lag behind behavior |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Health-check helper behavior | `bun test src/tools/health-check.test.ts` | Covers queue parsing helpers and degradation behavior that can be tested without the full CLI |
| Health-check CLI/report contract | `bun test src/cli/main.test.ts` | Verifies JSON output shape plus missing/empty/stale signal-queue handling through the real subcommand |
| Repo quality gate | `bun run check` | Validates the touched TypeScript and Markdown surfaces under repo policy |
| Regression suite | `bun test` | Confirms no broader regressions across the Bun-native deterministic suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan agent/skill surface | Conan has existing eval coverage, but no dedicated health-check case | Rerun Conan evals for collateral prompt drift and document that the new health-check behavior still lacks direct eval coverage | `bin/alexandria-eval run conan/all` |
| Health-check CLI/tool behavior | Deterministic black-box tests exist; no eval harness applies directly | No separate eval rerun beyond Conan's required skill/agent gate | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Signal-queue entries may appear in multiple historical JSONL shapes, not just the current session-level `items[]` schema | Parse conservatively, support the shapes already checked into the repo, and keep tests for both direct-entry and session-entry forms if needed |
| Date handling could become nondeterministic across time zones or runtime locale | Compare against an explicit UTC calendar date derived from the run clock and keep tests anchored to fixed dates |
| Missing or malformed queue files could make the health-check command noisy or brittle | Treat queue absence/emptiness as available status information, not fatal errors; only mark the queue section unavailable when parsing truly fails |
| Conan docs could overclaim direct eval coverage for the new health-check behavior | State plainly in the final handoff that `conan/all` is only collateral coverage because no dedicated health-check eval case exists |
| Repo docs could drift if only the skill changes | Update the agent and capability references in the same slice |

## Implementation Steps

1. Add the issue-specific technical plan under
   `docs/alexandria/plans/383-wire-conan-health-check-signal-queue/`.
2. Extend `src/tools/health-check.ts` with signal-queue path resolution,
   parsing, stale-claim detection, and JSON report output.
3. Add deterministic tests for missing, empty, and stale queue cases through the
   real `alxndr health-check` command, plus any focused helper tests needed.
4. Update `skills/conan/job-health-check.md` so Conan reads the new report
   section and carries stale claims into the health report.
5. Update `agents/conan.md` and the checked-in health-check capability doc so
   the docs match the new behavior.
6. Run local review, targeted deterministic tests, `bun run check`, `bun test`,
   and `bin/alexandria-eval run conan/all`.

## Acceptance / Exit Criteria

1. `alxndr health-check <path>` reads `docs/alexandria/signal-queue.jsonl` when
   present.
2. The health-check JSON reports unresolved claims whose `revisit_by` date is
   due or past due.
3. Missing or empty signal queues are handled gracefully without failing the
   command.
4. Conan's health-check docs explicitly tell Conan to review stale signal-queue
   claims.
5. Conan's broader agent/capability docs stay aligned with the new signal-queue
   input.
6. `bun test src/tools/health-check.test.ts`,
   `bun test src/cli/main.test.ts`, `bun run check`, `bun test`, and
   `bin/alexandria-eval run conan/all` complete successfully.

## Deferred Follow-Ups

1. Add a dedicated Conan health-check eval case if maintainers want direct
   coverage of stale signal-queue handling in the conversational report path.
2. If Health Check later needs richer queue analytics than stale-claim review
   (for example, grouping by affected card or tension type), extend the JSON
   contract deliberately in a separate issue.
