# Issue 348 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#348`
- Goal: unify the playbook's maintenance quality workflow so Health Check and
  Quality Cycle are documented as one coordinated play with assess and repair
  phases, while keeping related library-reference cards aligned
- Linked product plan:
  [FEAT-048](../../implementation-plans/architecture-review-hardening/tickets/FEAT-048.md),
  [O-6](../../implementation-plans/architecture-review-hardening/outcomes/O-6.md),
  [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md)

## Scope

- Update `docs/design/playbook.md` so the maintenance section describes one
  unified play instead of separate Health Check and Maintenance Improvement Loop
  plays.
- Reframe the unified play around two explicit phases:
  - Assess: periodic or triggered maintenance review
  - Repair: prioritized fix execution that loops until the library is healthy
- Update the playbook's internal cross-references and play index so they point
  at the unified maintenance play.
- Update the library-reference cards named by FEAT-048:
  - `Capability - Health Check`
  - `Artifact - Play Definition`
  - `Artifact - Play Pattern`
- Fix adjacent stale maintenance references surfaced during PR review where
  unchanged library cards or repo metadata still describe the old health-check
  shape or stale playbook counts.
- Keep the change documentation-only unless a direct contradiction in a product
  skill blocks consistency.

## Non-Goals

- Changing actual agent responsibilities, CLI behavior, or the underlying
  health-check / grading mechanics.
- Refactoring `skills/conan/job-health-check.md` unless the playbook rewrite
  reveals wording that is directly incompatible with the final documented model.
- Updating unrelated library cards that mention Health Check as an example but
  do not define the play structure itself.
- Rewriting the broader grading-sampling architecture; keep the playbook aligned
  to the existing sampled maintenance model rather than widening that policy in
  this issue.
- Adding new eval cases or expanding deterministic test coverage for this docs
  slice.

## Current Gap

- `docs/design/playbook.md` currently splits maintenance quality work into
  `Play 4.1: Health Check` and `Play 4.2: Maintenance Improvement Loop`.
- That split contradicts the upstream FEAT-048 intent that assessment without
  repair is an incomplete play; the actual maintenance motion is assess, then
  repair until healthy.
- The three named library cards still describe the old split model or cite play
  counts/examples that would become stale after the merge.
- PR review surfaced additional stale references outside the originally named
  cards: some library docs still call Health Check a six-phase assessment, one
  design doc and one product principle still describe the old standalone
  health-check play, one orchestration example points at the wrong play number,
  one roadmap artifact still names Health Check alone as the most important
  play, one rationale-layer doc still cites removed health-check phase numbers,
  `docs/alexandria/manifest.md` still carries stale maintenance wording and a
  stale play count, and the archived nit-cli-hardening implementation-plan docs
  still talk about the old health-check model without distinguishing it from
  the now-unified maintenance play.
- The current playbook wording allows full-library maintenance grading, which
  conflicts with the checked-in sampled judgment model used elsewhere in the
  library docs.
- The Conan health-check skill describes the assessment capability, not the full
  play orchestration, so it should only move if the docs change would otherwise
  create a direct contradiction.

## Architectural Boundaries

- Keep orchestration changes in design docs and library-reference artifacts; do
  not quietly change executable behavior in skills or CLI code in this issue.
- Preserve the distinction between a capability and a play:
  `Capability - Health Check` can describe the assessment capability while also
  naming its role inside the unified maintenance play.
- Preserve the Stage 2 quality workflow for initial library build quality; this
  issue only changes how periodic maintenance is documented in Stage 4.
- Keep the maintenance play focused on content quality and repair, consistent
  with FEAT-048's note that source alignment and inventory reconciliation are
  being moved to continuous infrastructure and should not be expanded here.
- Avoid product-specific examples or fixed taxonomies beyond the checked-in
  Alexandria terminology already used in the playbook and library cards.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Playbook maintenance workflow | `docs/design/playbook.md` | Stage 4 documents one unified maintenance quality play with assess and repair phases, and updates cross-references/index entries accordingly |
| Library capability reference | `docs/alexandria/library/product/capabilities/Capability - Health Check.md` | Health Check is framed as the assessment half of the unified maintenance play rather than a standalone maintenance play that merely recommends action |
| Library play-definition reference | `docs/alexandria/library/product/artifacts/Artifact - Play Definition.md` | Example stage/play structure and "most important play" language align with the unified maintenance play |
| Library play-pattern reference | `docs/alexandria/library/product/artifacts/Artifact - Play Pattern.md` | Shared pattern examples/counts align with the unified play inventory after the merge |
| Adjacent library maintenance references | `docs/alexandria/library/product/artifacts/Artifact - Decision: Orchestration Ownership.md`, `docs/alexandria/library/product/artifacts/Artifact - Product Roadmap.md`, `docs/alexandria/library/product/domains/Domain - Library Interior.md`, `docs/alexandria/library/product/sections/Section - Feedback Workspace.md`, `docs/alexandria/library/product/sections/Section - Source Material.md`, `docs/alexandria/library/product/agents/Agent - Conan the Librarian.md`, `docs/alexandria/library/product/sections/Section - Rationale Layer.md`, `docs/alexandria/library/rationale/standards/Standard - Grading Sampling Rate.md`, `docs/alexandria/library/rationale/principles/Principle - Agentic-Deterministic-Agentic Pattern.md`, `docs/design/org-chart.md`, `docs/design/system-story.md` | Remove stale six-phase / standalone-play / wrong-play references that now contradict the unified maintenance play, including adjacent docs that still described source alignment as a standalone maintenance phase |
| Wizard runtime metadata | `docs/alexandria/wizard-config.json` | Remove a stale hard-coded play count from the wizard notes so repo metadata stays aligned with the playbook |
| Meta-library inventory docs | `docs/alexandria/manifest.md` | Update stale Health Check wording and play-count language so the repo inventory reflects the unified maintenance play and current playbook totals |
| Archived implementation-plan references | `docs/alexandria/implementation-plans/nit-cli-hardening/{release.md,outcomes/O-2.md,library-updates.md,tickets/FEAT-031.md,tickets/FEAT-032.md,CONTEXT_BRIEFING.md}` | Distinguish the health-check assessment procedure from the now-unified maintenance play so older implementation notes do not restate the superseded playbook model |
| Repo technical planning | `docs/alexandria/plans/348-health-check-quality-cycle/plan.md` | Records scope, verification, and the decision to keep Conan skill changes out unless required |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product design docs | Maintenance play structure is documented as one play with two phases | Update playbook cross-references and play index in the same slice |
| Library reference cards | Health Check / play-definition artifacts reflect the same unified model | Keep the three named cards aligned with the playbook wording |
| `skills/conan/job-health-check.md` | None planned unless a blocking contradiction is found | If touched, rerun Conan evals per `EVALS.md`; otherwise no eval action |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Markdown / repo quality gate | `bun run check` | Covers markdownlint, semantic markdown checks, formatting, shell, and typecheck for the touched docs slice |
| Regression suite | `bun test` | Satisfies repo policy for issue-completion verification and catches broad regressions from doc-linked checks |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Playbook and library-reference docs | No eval-backed product-skill surface is changed if this remains a docs-only slice | No eval rerun needed | N/A |
| Conan skill surface | Existing Conan coverage exists only if `skills/conan/*` changes | Do not rerun unless the skill file is edited | `bin/alexandria-eval run conan/all` if needed |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The playbook merge could accidentally blur Stage 2 first-pass quality work with Stage 4 maintenance work | Keep Stage 2 plays intact and only collapse the periodic maintenance loop in Stage 4 |
| Internal references could be left pointing at removed play numbers | Search all `Play 4.1` / `Play 4.2` references in `playbook.md` and update the play index in the same edit |
| The library cards could become inconsistent with the playbook after the merge | Update the three FEAT-048 cards in the same slice rather than leaving follow-up drift |
| PR review could bounce again on unchanged stale references near the touched cards | Sweep adjacent library docs for explicit six-phase, numbered health-check phase, or wrong-play references while keeping the slice documentation-only |
| The maintenance play could drift from the repository's sampled grading model | Keep the playbook and `Capability - Health Check` wording aligned with the existing sampled judgment architecture rather than introducing full-library maintenance grading here |
| Editing the Conan health-check skill would trigger unnecessary eval work without changing executable behavior | Keep the slice docs-only unless a direct contradiction is discovered during the rewrite |
| Specific play counts may become stale after consolidation | Prefer updated counts or count-agnostic wording where exact totals are not essential |

## Implementation Steps

1. Add the issue-specific technical plan under
   `docs/alexandria/plans/348-health-check-quality-cycle/`.
2. Rewrite Stage 4 in `docs/design/playbook.md` so Health Check and Maintenance
   Improvement Loop become one unified maintenance play with assess and repair
   phases.
3. Update related cross-references inside `playbook.md`, especially Alignment
   Sweep relationships and the Play Index.
4. Update the three named library-reference cards so they describe the same
   unified maintenance model and no longer rely on stale play counts/examples.
5. Fix adjacent stale maintenance references surfaced in PR review and local
   review (`Orchestration Ownership`, `Product Roadmap`, `Library Interior`,
   `Feedback Workspace`, `Conan`, `Rationale Layer`, `Grading Sampling Rate`,
   `Agentic-Deterministic-Agentic Pattern`, `org-chart.md`,
   `system-story.md`, `wizard-config.json`, `manifest.md`, and the
   nit-cli-hardening implementation-plan docs) without broadening into
   unrelated library cleanup.
6. Manually review the diff for contradictions between Stage 2 quality work,
   Stage 4 maintenance work, and the library-reference artifacts.
7. Run `bun run check` and `bun test`.

## Acceptance / Exit Criteria

1. `docs/design/playbook.md` documents one maintenance play for Health Check +
   Quality Cycle with explicit assess and repair phases.
2. The old separate `Play 4.1` / `Play 4.2` definitions are consolidated within
   the playbook.
3. Grade, diagnosis, recommendation, surgery, fix, and re-grade are presented as
   steps within the unified maintenance play rather than as a disconnected
   follow-on play.
4. Internal Stage 4 references and the Play Index point to the unified play.
5. `Capability - Health Check`, `Artifact - Play Definition`, and
   `Artifact - Play Pattern` reflect the same unified model.
6. The playbook and health-check docs stay aligned with the existing sampled
   maintenance grading model.
7. Adjacent stale six-phase / numbered-phase / standalone-play references
   called out in review or found during local review are removed from the
   touched docs slice.
8. `docs/alexandria/manifest.md` and the nit-cli-hardening implementation-plan
   docs no longer restate the superseded standalone-health-check model.
9. No executable behavior changes are introduced outside the documentation slice.
10. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. If later work wants the Conan health-check skill to narrate the unified play
   explicitly, do that as a Conan-surface change with the required eval rerun.
2. If broader maintenance docs outside the touched design/library surfaces still
   need copy cleanup after this pass, handle that in a separate library-sync
   slice rather than broadening this issue opportunistically.
