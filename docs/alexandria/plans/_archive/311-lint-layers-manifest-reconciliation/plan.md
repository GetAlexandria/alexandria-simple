# Issue 311 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#311`
- Goal: add manifest reconciliation checks to `alxndr lint layers` so sweep 4 can validate inventory fidelity against the markdown manifests Conan already produces
- Linked product plan: [FEAT-035](../../implementation-plans/nit-cli-hardening/tickets/FEAT-035.md), [O-5](../../implementation-plans/nit-cli-hardening/outcomes/O-5.md)

## Scope

- Extend sweep 4 in the shared lint engine to detect and parse checked-in inventory manifests under the library root
- Add manifest-backed layer checks for:
  - manifest fidelity between manifest card rows and cards on disk
  - cross-reference completeness from manifest relationship tables to card `WHERE` links
  - conformance map accuracy from manifest standard constraints to card `Conforms to:` links
  - enumeration decision drift for count-based decisions
- Add deterministic black-box CLI tests covering the new behavior and graceful skip when no manifest exists

## Non-Goals

- Changing Conan inventory output prompts or requiring a new manifest format
- Changing Nit skill text beyond using it as specification
- Adding sweep 6 behavior or changing lint target routing
- Reworking card parsing outside the minimum needed to inspect existing `WHERE` links

## Current Gap

- `src/tools/lint-core.ts` currently implements sweep 4 minimum-population, WHY-chain, and containment checks only
- `skills/nit/sweeps.md` and the FEAT-035 ticket require manifest reconciliation when an inventory manifest exists
- The repo already contains real markdown manifests (`manifest.md`, `manifest-kathy.md`, `manifest-pt3.md`) that the CLI does not read today

## Architectural Boundaries

- This slice belongs in the lint engine and its tests, because the behavior is deterministic and reused by both the legacy lint entry point and `alxndr lint`
- Manifest parsing should accept the existing markdown-table inventory shape instead of inventing a new serialized artifact or coupling lint to Conan runtime internals
- The slice should stay read-only with respect to manifests and cards; lint reports drift, it does not repair it
- No agent, skill, template, setup, or distribution behavior should change in this issue

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/lint-core.ts` | Sweep 4 gains manifest discovery, markdown-table parsing, and reconciliation findings |
| CLI tests | `src/tools/lint.test.ts` | Black-box coverage verifies manifest-driven findings and no-manifest skip behavior |
| Repo planning docs | `docs/alexandria/plans/311-lint-layers-manifest-reconciliation/plan.md` | Records repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Lint CLI behavior | `bun test src/tools/lint.test.ts` | Direct black-box coverage for the touched sweep 4 surface |
| TypeScript + formatting + shell gates | `bun run check` | Repo-required deterministic gate for changed TypeScript and markdown |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | No eval-harness coverage required for this deterministic CLI slice | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Manifest files vary slightly in heading names or table columns | Parse the checked-in manifest headings and table formats already used in this repo, and keep matching logic tolerant of whitespace and supplemental prose |
| Fidelity checks could produce false positives when multiple manifests coexist | Aggregate card claims across all `manifest*.md` files under the library root rather than assuming a single manifest |
| Enumeration drift is easy to overfit to prose | Only implement countable decisions with explicit numeric intent; skip non-countable rows rather than guessing |
| Cross-reference validation could confuse any link with a conformance link | Inspect `WHERE` section content and distinguish declared `Conforms to:` links from general links when checking the conformance map |

## Implementation Steps

1. Add lightweight manifest discovery and markdown-table parsing helpers to `src/tools/lint-core.ts`.
2. Normalize manifest data into card rows, cross-reference rows, conformance rows, and countable enumeration decisions.
3. Extend `sweep4` to emit the required warning/info findings when manifests exist and to do nothing extra when they do not.
4. Add black-box tests that build a temporary library plus manifest fixture and assert each new rule independently.
5. Run the targeted deterministic checks and review the final diff against the plan.

## Acceptance / Exit Criteria

1. `alxndr lint layers` warns on manifest cards missing on disk and notes cards on disk missing from all manifests.
2. `alxndr lint layers` reports missing manifest-declared cross-reference links from card `WHERE` sections.
3. `alxndr lint layers` reports mismatches between manifest conformance map claims and `Conforms to:` links in cards.
4. `alxndr lint layers` reports count drift for explicit enumeration decisions that can be checked mechanically.
5. Running layer lint without any manifest present does not error or emit manifest-only findings.
6. Deterministic CLI tests cover the new rules.

## Deferred Follow-Ups

1. Broaden manifest parsing if Conan inventory output gains a new checked-in format beyond the current markdown tables.
2. Consider extracting manifest parsing into a shared library if future features need the same inventory data outside linting.
