# Issue 312 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#312`
- Goal: add a library-wide terminology inconsistency sweep to `alxndr lint library` so sweep 5 can cluster known variant usage across cards and warn on the minority form.
- Linked product plan: [FEAT-036](../../implementation-plans/nit-cli-hardening/tickets/FEAT-036.md), [O-5](../../implementation-plans/nit-cli-hardening/outcomes/O-5.md)

## Scope

- Add a shared terminology-variant catalog aligned with the FEAT-034 line-level terminology ruleset.
- Extend sweep 5 in the shared lint engine to scan every card body for known terminology variants, aggregate counts and card locations by cluster, and emit warning findings for minority-form usage.
- Add deterministic black-box CLI coverage for cluster summaries, file-location reporting, majority/minority behavior, and the no-findings case when terminology is already consistent.

## Non-Goals

- Changing `alxndr lint` routing, help text, or formatter structure outside the new sweep 5 findings and metrics payload.
- Rewriting existing library cards, docs, skills, or agents to normalize terminology in this slice.
- Adding configurable terminology policy or loading terminology rules from project files.
- Expanding beyond the FEAT-034 terminology catalog; new variant families belong in future issue work.

## Current Gap

- `src/tools/lint-core.ts` sweep 5 currently reports only library metrics, missing-core-type notices, link-density warnings, and JSONL validation for queue files.
- FEAT-036 requires a terminology sweep that detects library-wide inconsistency clusters, not just per-line variants.
- The current branch does not yet carry FEAT-034's line-level implementation, so there is no shared terminology catalog available locally to reuse.
- `src/tools/lint.test.ts` has only smoke-level sweep 5 coverage for metrics and no assertions around terminology clustering or minority-form warnings.

## Architectural Boundaries

- Keep the terminology catalog and clustering logic inside the shared lint engine so both `alxndr lint` and the legacy compatibility wrapper reuse one deterministic implementation.
- Treat terminology clustering as a library-wide read-only analysis pass over parsed card content. It should not inspect unrelated docs under the repository root or mutate card files.
- Reuse the FEAT-034 terminology vocabulary, but keep the line-level and library-level reporting modes separate: sweep 1 flags individual lines, sweep 5 summarizes cluster drift across the library.
- Prefer stable, human-readable summary messages over adding a new output mode or overloading metrics with primary finding content.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Shared lint engine | `src/tools/lint-core.ts` | Sweep 5 gains terminology-cluster discovery, count aggregation, minority-form warning findings, and cluster metadata in metrics |
| Deterministic CLI coverage | `src/tools/lint.test.ts` | Black-box tests verify mixed-variant cluster reporting, location summaries, and consistent-library no-op behavior |
| Repo planning docs | `docs/alexandria/plans/312-lint-library-terminology-sweep/plan.md` | Records the repo-specific scope, constraints, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint library` reports aggregate terminology inconsistency clusters in addition to the existing sweep 5 metrics and queue checks | Update deterministic lint tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Sweep 5 regression coverage | `bun test src/tools/lint.test.ts` | Verifies the new terminology-cluster behavior through the real CLI surface |
| Repo quality gate | `bun run check` | Covers formatting, linting, markdown checks, shell checks, and typecheck for the touched slice |
| Wider regression suite | `bun test` | Confirms the new sweep 5 behavior does not break the broader Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | No eval-harness coverage applies to this deterministic CLI slice | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The local branch lacks FEAT-034's shared terminology implementation, so sweep 5 could drift from the upstream variant list | Encode the FEAT-034 catalog directly in shared helpers now and keep the initial catalog limited to the checked-in upstream rule set (`wikilink` family) |
| Aggregate reporting could duplicate one warning per match and overwhelm output instead of surfacing clusters | Emit one warning per minority variant within a cluster, with counts and compact file-location summaries in the message |
| Terminology matching could overfire inside URLs or `[[wikilinks]]`, repeating FEAT-034 false positives at library scope | Reuse the same protected-range approach as the line-level design so matches inside URLs and wikilinks are excluded from clustering |
| The majority form could be ambiguous when counts tie, creating unstable findings | Only report clusters when one canonical/preferred form is clearly the minority against at least one preferred-form occurrence; equal split usage stays informationally absent in this slice |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/312-lint-library-terminology-sweep/`.
2. Introduce shared terminology helper types and the FEAT-034-aligned variant catalog in `src/tools/lint-core.ts`.
3. Extend sweep 5 to scan card content, build cluster summaries, and emit warning findings for minority-form usage with counts and file locations.
4. Include cluster metadata in sweep 5 metrics so JSON output remains inspectable without parsing text messages only.
5. Extend `src/tools/lint.test.ts` with black-box fixtures that cover mixed usage, location reporting, and consistent terminology.
6. Run targeted tests, then `bun run check`, then `bun test`, then do a local diff review.

## Acceptance / Exit Criteria

1. `alxndr lint library <path>` scans all cards for the known terminology variant family or families.
2. Mixed terminology usage produces warning findings that include cluster counts and file locations for the minority form.
3. The warning severity is attached to minority-form usage, not to the majority/preferred form.
4. Consistent preferred terminology does not emit terminology-cluster findings.
5. Deterministic CLI tests cover both mixed and consistent-library behavior.
6. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. When FEAT-034 lands on main, deduplicate any shared terminology helpers if the implementations diverge.
2. Add additional terminology families only when a future ticket expands the curated variant catalog.
