# Issue 344 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#344`
- Goal: update `docs/design/alexandria.md` so all card-type terminology matches the current Alexandria vocabulary without altering the separate market/corporate/program zone model.
- Linked product plan: [FEAT-044](../../implementation-plans/architecture-review-hardening/tickets/FEAT-044.md), [O-1](../../implementation-plans/architecture-review-hardening/outcomes/O-1.md), [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md)

## Scope

- Replace stale card-type terms in `docs/design/alexandria.md` with the current Alexandria names:
  - Zone -> Domain
  - Room -> Section
  - Structure -> Template
  - Overlay -> Governance
  - Aesthetic -> Experience Goal
  - Dynamic -> Force
- Update examples, tables, and explanatory prose in that document where those words still act as type names.
- Preserve the distinct "zone model" vocabulary for market, corporate, and program zones wherever it refers to organizational scope rather than a card type.
- Verify the edited doc still passes the deterministic CLI and repository quality gates.

## Non-Goals

- Rewriting other design documents, playbooks, or skills that still intentionally discuss historical terminology or other migration work.
- Changing the taxonomy itself, the three-zone organizational model, or any product behavior outside this doc.
- Adding new lint rules or modifying `alxndr lint` behavior.
- Updating versioning, changelog, or release-prep files.

## Current Gap

- `docs/design/alexandria.md` still contains pre-migration card-type names in taxonomy-heavy prose and tables.
- The checked-in product ticket explicitly calls this file out as the remaining drift after earlier cleanup elsewhere.
- The same document also uses "zone" in the separate federated organizational model, so a naive global replacement would corrupt intended meaning.

## Architectural Boundaries

- Keep this slice doc-only: the source of truth for the terminology is already established elsewhere; this issue only aligns one lagging design artifact.
- Treat `docs/alexandria/implementation-plans/architecture-review-hardening/tickets/FEAT-044.md` and the current repository vocabulary as the naming contract for this file.
- Preserve meaning and structure in `docs/design/alexandria.md`; only card-type labels should change.
- Do not broaden the slice into taxonomy redesign, broader terminology sweeps, or playbook sync work that belongs to separate issues.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Design doc terminology | `docs/design/alexandria.md` | Readers see current Alexandria card-type names instead of deprecated synonyms when the doc describes product-library structure |
| Repo planning docs | `docs/alexandria/plans/344-fix-terminology-drift-alexandria/plan.md` | Records the repo-specific scope, zone-model exception, and verification contract for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Design docs | `docs/design/alexandria.md` stops teaching deprecated card-type terms in its taxonomy examples and summaries | Keep the separate zone-model language intact during edit and verify with lint/review |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Targeted deterministic lint | `bin/alxndr lint all . --json` | Satisfies the product ticket's explicit "alxndr lint passes" acceptance using the real CLI surface |
| Repo quality gate | `bun run check` | Covers markdown linting, formatting checks, shell checks, ESLint, and typecheck for the touched plan/doc slice |
| Regression suite | `bun test` | Confirms no broader repo regressions before PR handoff, matching repo workflow expectations |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Design-doc wording | No eval-backed product behavior changes | No eval rerun | N/A |
| Agents / skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Replacing "zone" blindly could break the intended market/corporate/program zone model language | Review each occurrence in context and only rename when "Zone" is acting as the deprecated card type |
| A terminology-only edit could accidentally change meaning in examples or taxonomy summaries | Keep replacements minimal and compare the final diff for semantic drift before finishing |
| A doc-only slice could still fail repo markdown or lint checks | Run `bin/alxndr lint all . --json`, `bun run check`, and `bun test` before final handoff |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/344-fix-terminology-drift-alexandria/`.
2. Edit `docs/design/alexandria.md` to replace only deprecated card-type terms with current vocabulary.
3. Re-read the affected sections to confirm the separate zone model and other non-type meanings remain unchanged.
4. Run targeted lint, then `bun run check`, then `bun test`.
5. Review the final diff to confirm the slice stayed narrow and meaning-preserving.

## Acceptance / Exit Criteria

1. `docs/design/alexandria.md` contains zero instances of the deprecated card-type names used as type labels: Zone, Room, Structure, Overlay, Aesthetic, Dynamic.
2. All examples and tables in that file use the current vocabulary where they refer to card types.
3. The market/corporate/program zone model remains intact and uncorrupted by the terminology update.
4. Meaning is preserved; the change is terminology alignment, not a content rewrite.
5. `bin/alxndr lint all . --json`, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. If other design docs still intentionally carry historical vocabulary, handle them in their own explicitly scoped sync issue rather than expanding FEAT-044.
