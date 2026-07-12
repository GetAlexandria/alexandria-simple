# Issue 340 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#340`
- Goal: add deterministic governed-domain conformance checking to `alxndr lint` so sweep 4 can enforce `reference.md` Standard obligations for product-layer cards
- Linked product plan: [FEAT-040](../../implementation-plans/architecture-review-hardening/tickets/FEAT-040.md), [O-2](../../implementation-plans/architecture-review-hardening/outcomes/O-2.md)

## Scope

- Extend the shared lint engine so `alxndr lint layers` can read `docs/alexandria/reference.md` from the target library root and parse its conformance obligations table
- Add sweep 4 checks that:
  - identify governed product-layer cards by domain/type obligation
  - warn when required `Conforms to:` links are missing
  - rely on the existing graph scan to surface missing Standard targets as broken links
- Harden the helper parsing that sweep 4 now depends on so review-only formatting does not silently change conformance results:
  - stop `Conforms to:` block capture when a new WHERE heading starts, even when the new heading has inline content
  - avoid matching product card types from compound words in the `reference.md` obligation table
  - keep manifest card-name extraction aligned with the prior plain-text manifest behavior
- Add black-box CLI coverage for governed, ungoverned, missing-standard, and helper-regression cases

## Non-Goals

- Reworking the manifest reconciliation checks added for issue 311
- Changing Nit, Conan, or Sam skill text in this slice
- Introducing qualitative conformance validation beyond existence of the required Standard link
- Broadening `reference.md` parsing past the minimum table support needed for the conformance obligations spec

## Current Gap

- Sweep 4 currently checks layer population, WHY chains, containment, and manifest-derived reconciliation
- FEAT-040 requires direct validation from the canonical `reference.md` conformance obligations table, not only from optional manifests
- `alxndr lint` does not yet distinguish governed vs ungoverned product cards from the library reference, so missing conformance is only caught indirectly in agent workflows

## Architectural Boundaries

- The behavior belongs in `src/tools/lint-core.ts` because it is deterministic CLI logic shared by the legacy wrapper and `alxndr lint`
- The source of truth for governed-domain obligations is the target library's `docs/alexandria/reference.md`; the lint engine should read that checked-in spec rather than hardcoding repo-specific mappings
- Broken conformance targets should stay in the existing graph/broken-link path instead of duplicating filesystem existence logic inside a new sweep 4 rule
- No agent, product skill, template, setup, or distribution behavior should change in this issue

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/lint-core.ts` | Sweep 4 gains `reference.md` conformance-obligation parsing and governed-card checks |
| Lint parsing helpers | `src/tools/lint-manifest.ts`, `src/tools/lint-parsing.ts` | WHERE block extraction and manifest card-name parsing stay narrow enough to avoid false-positive conformance matches |
| CLI tests | `src/tools/lint.test.ts` | Black-box coverage verifies governed vs ungoverned handling and missing-target behavior |
| Repo planning docs | `docs/alexandria/plans/340-alxndr-lint-conformance/plan.md` | Captures repo-specific scope, risks, and verification |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Lint CLI behavior | `bun test src/tools/lint.test.ts` | Direct black-box coverage for the changed sweep 4 surface |
| Repo deterministic gates | `bun run check` | Required formatting, lint, shell, and TypeScript gate |
| Regression coverage | `bun test` | Repo-required full deterministic suite before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | Deterministic CLI surface, no eval-harness coverage required | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| `reference.md` tables may include prose or column variations that make parsing brittle | Parse only the explicit conformance-obligation table shape needed for the fixture and fail soft by emitting no conformance obligations when the table is absent |
| A new rule could flag the wrong cards if domain matching logic is too broad | Restrict governed-card selection to product-layer cards whose type/domain combinations are explicitly listed in the parsed table |
| Missing Standard targets could get reported twice in confusing ways | Let sweep 4 report the missing obligated `Conforms to:` link and rely on the existing sweep 3 broken-link finding when a required target is linked but absent on disk |
| Helper parsing could treat unrelated WHERE links or prose compounds as conformance evidence | Add regression coverage for inline WHERE headings, compound-word type cells, and manifest rows that should stay plain-text-only |
| The slice could drift into repo-internal reference synchronization work | Keep scope limited to target-library `reference.md` parsing for conformance obligations, not general meta-file reconciliation |

## Implementation Steps

1. Add a small parser for the `reference.md` conformance obligations table in `src/tools/lint-core.ts`.
2. Map parsed obligations to governed product-layer cards in the loaded library and detect missing required `Conforms to:` links.
3. Tighten the helper logic that sweep 4 depends on so WHERE-block parsing, type matching, and manifest claim extraction stay conservative.
4. Keep output in sweep 4 with lint-standard finding structure and severity.
5. Add black-box tests for governed cards with and without required conformance, ungoverned cards, required links whose Standard target is missing on disk, and the helper regressions above.
6. Run deterministic checks and review the diff against FEAT-040 acceptance criteria and PR review feedback.

## Acceptance / Exit Criteria

1. `alxndr lint layers` reads conformance obligations from `docs/alexandria/reference.md` when present.
2. Governed product-layer cards missing their required `Conforms to:` link produce a warning finding.
3. Ungoverned product-layer cards do not produce conformance warnings solely for lacking a `Conforms to:` link.
4. When a governed card links to a required Standard that is missing on disk, lint still surfaces the broken target via existing output.
5. Deterministic CLI tests cover governed, ungoverned, and missing-target cases.

## Deferred Follow-Ups

1. Expand `reference.md` parsing if future tickets need richer governed-domain metadata than the FEAT-040 table.
2. Consider consolidating manifest- and reference-driven conformance helpers if more sweep 4 rules need shared WHERE-link inspection logic.
