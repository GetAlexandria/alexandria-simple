# Issue #676: altitude code hygiene

## Header

- Issue: [#676](https://github.com/GetAlexandria/alexandria-internal/issues/676)
- Goal: rank all seven ruled altitude words for lead-card selection and surface
  unknown altitude words as soft catalog metadata issues while preserving
  `altitude` as a free string.
- Linked product plan: no dedicated product-level `plan.md`. Product grounding
  comes from `docs/alexandria/plans/learning-plane/design-log.md` section
  "Altitude-tuning pass - concrete findings" and
  `docs/alexandria/plans/learning-plane/launch-plan.md` section "F3 -
  Factory issue: altitude code hygiene".
- Issue comments checked: comment
  `https://github.com/GetAlexandria/alexandria-internal/issues/676#issuecomment-4915796317`
  says the fold-and-close contingency did not trigger: live main still lacks
  `keystone` and `context` in `LEAD_ALTITUDE_RANK`, no remaining migration
  slice touches `library-catalog-story.ts`, and migration Slice 4e path lint
  covers path shape, not altitude vocabulary.

## Scope

This slice lands:

1. Complete lead-rank tables for all ruled altitude words:
   `keystone`, `pillar`, `aggregate`, `component`, `context`, `capability`,
   and `value`.
2. `keystone` ranks above `pillar`.
3. `context` ranks between `capability` and `component`.
4. Existing relative order for the five already-ranked words stays intact:
   `pillar > aggregate > component > capability > value`.
5. A present `altitude` outside the ruled vocabulary adds a soft
   `metadataIssues` entry and the card still loads with the authored altitude
   value.
6. Tests that prove lead selection and unknown-altitude warnings through the
   domain loader, the story-lint CLI path when lead selection affects output,
   and the Viewer peek model.

## Non-Goals

1. Do not edit card content under `docs/alexandria/library/` or any other live
   library path.
2. Do not retune existing cards' altitude values.
3. Do not make `altitude` a closed enum, TypeScript union, or hard schema
   rejection.
4. Do not change draft-patch mutation validation, front-of-house patch rules,
   or runtime update contracts that currently reject unsupported patch fields.
5. Do not add new altitude words, aliases, or migration behavior.
6. Do not change plugin prompts, product skills, agents, or eval fixtures.
7. Do not implement library-migration `product-card.v2` path lint in this slice.

## Linked Product-Plan Summary

The learning-plane design log records the shipped altitude distribution and the
code gap: `altitude` is a free string, there is no vocabulary warning, and the
lead-selection rank table knows only five of seven live words. The ruled words
for this slice are:

```text
keystone pillar context aggregate component value capability
```

The launch plan F3 section freezes two technical decisions: complete
`LEAD_ALTITUDE_RANK` in `packages/ax/src/domain/library-catalog-story.ts`, and
warn through `metadataIssues` for unknown altitude words without rejecting the
card. The issue comments confirm library-migration path lint does not already
solve this and that this issue remains standalone.

## Current Gap

- `packages/ax/src/domain/library-catalog-story.ts` currently ranks only
  `pillar`, `aggregate`, `component`, `capability`, and `value`.
- `packages/viewer/src/components/library/library-peek-view-model.ts` has a
  separate Viewer lead-rank table with the same five-word gap. A fix limited
  to AX would leave visible context peeks able to choose the wrong area story.
- `leadAltitudeRank(...)` lowercases and defaults unknown words to rank `0`,
  so a typo such as `altitude: pilar` sorts like a missing altitude.
- `packages/ax/src/domain/library-catalog.ts` reads `altitude` with
  `frontmatterString(...)` and preserves it on the card, but it does not check
  the vocabulary.
- The catalog already has the right soft-warning channel:
  `reportCardIssue(...)` appends deduped `Invalid card <path>: ...` strings to
  `metadataIssues` for malformed optional structures while still keeping valid
  card records.
- Existing Viewer components already display `catalog.meta.metadataIssues`, so
  no new visible UI surface is needed if the loader emits the warning.

## Architectural Boundaries

- `packages/ax` owns catalog parsing, catalog metadata issues, product-card
  story resolution, and deterministic CLI tools. The vocabulary warning belongs
  in the catalog loader near the existing optional-field parse helpers, not in
  Viewer-only code.
- `packages/viewer` owns browser-only derived peek models. Because it has its
  own rank table and cannot import AX internals today, it should either mirror
  the completed rank table in this slice or be refactored only if an existing
  shared package boundary already supports that cleanly.
- Do not introduce a dependency from `packages/viewer` to `packages/ax`.
- Do not move AX catalog-domain code into `@alexandria/library-card-resolver`;
  altitude ranking is catalog semantics, not resolver semantics.
- Keep warning behavior case-insensitive for recognition, matching current rank
  lookup, while preserving the trimmed authored altitude string on the card.
- Missing `altitude` remains allowed and should not emit a metadata issue.
- Runtime APIs and Viewer metadata panels should receive the warning through the
  existing `catalog.meta.metadataIssues` contract.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX story lead ranking | `packages/ax/src/domain/library-catalog-story.ts` | Rank `keystone` above `pillar` and `context` between `capability` and `component`; unknown values still rank `0`. |
| AX catalog parsing | `packages/ax/src/domain/library-catalog.ts` | When `altitude` is present but not one of the seven ruled words, append a soft metadata issue and keep the card. |
| AX domain tests | `packages/ax/src/domain/library-catalog-story.test.ts`, `packages/ax/src/domain/library-catalog.test.ts` | Cover `keystone` lead selection and unknown-altitude warning with card preservation. |
| AX CLI/tool tests | `packages/ax/tests/library-catalog-story-lint.test.ts` | Add black-box coverage for rank-driven story-lint behavior so CLI exit/output remains deterministic. |
| Viewer peek model | `packages/viewer/src/components/library/library-peek-view-model.ts` | Visible context peeks use the completed seven-word lead ranking. |
| Viewer unit tests | `packages/viewer/src/components/library/library-peek-view-model.test.ts` | Prove a `keystone` card wins over a `pillar` card and `context` ranks above `capability` but below `component`. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Product agents | None. No agent prompt, workflow, or runtime behavior changes. | No agent eval rerun. |
| Product skills | None. No `packages/alexandria-plugin/skills/**` files should change. | No skill eval rerun. |
| Maintainer skills | None. This plan uses the maintainer planning skill but does not modify it. | No eval-harness coverage. |
| CLI tools | Existing story-lint output may change for fixtures whose winning lead changes because `keystone`/`context` now rank. | Add/adjust black-box story-lint tests for exit code and stderr/stdout. |
| Viewer | Context peek story selection changes when a context contains `keystone` or `context` altitude cards. | Viewer unit, check, build, and browser validation. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX focused domain and CLI tests | `pnpm --filter @alexandria/ax exec bun test src/domain/library-catalog-story.test.ts src/domain/library-catalog.test.ts tests/library-catalog-story-lint.test.ts` | Covers rank ordering, metadata issue emission, card preservation, and black-box story-lint behavior. |
| AX package tests | `pnpm --filter @alexandria/ax run test` | Catches adjacent catalog/runtime assumptions, including existing runtime altitude patch tests that should stay unchanged. |
| AX typecheck/lint | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run lint` | Verifies TypeScript, ESLint, and story-lint package gates. |
| Viewer focused unit test | `pnpm --filter @alexandria/viewer exec bun test src/components/library/library-peek-view-model.test.ts` | Proves visible context peeks use the completed rank table. |
| Viewer unit suite | `pnpm --filter @alexandria/viewer run test` | Catches library component/model regressions. |
| Viewer build/check | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Required because Viewer behavior changes. |
| Viewer browser validation | `pnpm --filter @alexandria/viewer run test:e2e` | Confirms the Library surface still renders after the model change. |
| Real-library guard | `pnpm run lint:library-stories` | Ensures current checked-in library cards still pass story lint and existing cards are otherwise unchanged. |
| Markdown plan lint | `pnpm run lint:markdown` | Verifies this plan document formatting if included in the implementation PR. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX catalog and story ranking | Deterministic Bun tests, not eval-harness backed. | Add deterministic tests only. | No eval command. |
| AX story-lint CLI | Black-box Bun tests under `packages/ax/tests`. | Add or update CLI tests for rank-driven output. | No eval command. |
| Viewer peek model | Deterministic Viewer unit tests. | Add model tests and run Viewer validation. | No eval command. |
| Agents / product skills | Not touched. | No eval rerun required. | None. |

No eval-harness coverage is required for this slice because it does not change
reusable agent, product skill, workflow, prompt, or eval-backed behavior. If an
implementation unexpectedly touches `packages/alexandria-plugin/**`, stop and
revise this plan before proceeding.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| AX and Viewer rank tables drift again because they are duplicated. | Update both in the same slice and add tests in both packages. If a small shared helper already exists at an allowed boundary, use it; otherwise avoid creating a new cross-package dependency for this narrow fix. |
| Adding a vocabulary check accidentally rejects cards or drops the authored altitude. | Implement the check as a `metadataIssues` append after `frontmatterString(...)`; keep the existing `card.altitude` assignment and return a `CatalogCardBuildRecord`. |
| The warning is too broad and flags missing altitude values. | Only check when `frontmatterString(fields, "altitude")` returns a non-null value. |
| Case differences in authored cards become noisy warnings even though ranking is case-insensitive. | Normalize with `trim().toLowerCase()` for membership, but preserve the authored trimmed value in the card and warning message. |
| Re-ranking changes existing five-word behavior. | Preserve the existing order and only insert `context` between `capability` and `component`, plus `keystone` above `pillar`. Use tests that assert the relative ordering. |
| Story-lint fixtures become confusing because lead selection changed. | Add a targeted fixture where the expected lead is unambiguous and the assertion names the resulting exit code/output. |
| The library-migration loader-lint work later adds a second altitude warning. | Before implementation, re-check active migration branches or merged changes for altitude vocabulary checks. If present, fold this issue into that work instead of adding a duplicate warning. The current issue comment says this contingency did not trigger on live main. |
| Runtime draft patch validation is mistaken for this loader warning. | Treat runtime patch validation as out of scope; keep existing tests that reject unsupported patch `altitude` updates unchanged. |

## Implementation Steps

1. Re-check the worktree and relevant branches for a pre-existing altitude
   vocabulary check:
   `rg -n "altitude.*one of|unknown altitude|keystone|LEAD_ALTITUDE_RANK" packages/ax packages/viewer`.
   If a merged loader-lint check already handles unknown altitude words through
   `metadataIssues`, do not duplicate it; update or close #676 as folded.
2. In `packages/ax/src/domain/library-catalog-story.ts`, complete
   `LEAD_ALTITUDE_RANK` while preserving existing relative order. A simple
   integer rank shape is acceptable:
   `value: 1`, `capability: 2`, `context: 3`, `component: 4`,
   `aggregate: 5`, `pillar: 6`, `keystone: 7`.
3. In `packages/viewer/src/components/library/library-peek-view-model.ts`,
   make the same rank update, or use an existing allowed shared helper if one
   is already available without adding a Viewer-to-AX dependency.
4. In `packages/ax/src/domain/library-catalog.ts`, add a single ruled-altitude
   word list or set near other product-card constants or import one from the
   story module if that avoids circular runtime imports.
5. Add a helper such as `warnUnknownAltitude(...)` that:
   - accepts `altitude`, `relativePath`, and a metadata issue array
   - returns without warning for `null`
   - accepts the seven ruled words case-insensitively
   - calls `reportCardIssue(...)` for unknown values
   - does not transform or reject the card
6. Call the helper in both product-card and legacy catalog record creation
   immediately after reading `altitude`, unless implementation discovery finds
   a strong reason to scope the warning to `product-card.v1` only. If scoped,
   record the reason in code review and tests.
7. Add AX story-domain tests:
   - a context containing `keystone` and `pillar` cards proves the `keystone`
     lead drives `lintProductCatalogStories(...)`
   - a `context` card outranks `capability` and does not outrank `component`
     where the lead result is observable
8. Add AX catalog parser tests:
   - `altitude: pilar` appears in `catalog.cards`
   - `catalog.meta.metadataIssues` contains a warning naming the card path,
     the bad value, and the seven allowed words
   - a ruled word such as `keystone` emits no warning
9. Add or update black-box story-lint CLI tests in
   `packages/ax/tests/library-catalog-story-lint.test.ts` for rank-driven
   behavior. Keep assertions on `exitCode`, `stdout`, and important `stderr`
   text.
10. Add Viewer peek-model tests for the completed rank order and context peek
    lead selection.
11. Run the deterministic verification matrix.
12. Inspect `git diff --stat` and confirm no card content under
    `docs/alexandria/library/**` or other live library paths changed.

## Acceptance / Exit Criteria

1. `LEAD_ALTITUDE_RANK` in
   `packages/ax/src/domain/library-catalog-story.ts` ranks all seven ruled
   altitude words.
2. The Viewer peek model ranks all seven ruled altitude words, so visible
   context peeks agree with AX story lead semantics.
3. In one context, a `keystone` card beats a `pillar` card for lead selection.
4. `context` ranks higher than `capability` and lower than `component`.
5. A card with `altitude: pilar` loads, preserves `card.altitude === "pilar"`,
   and contributes a `metadataIssues` warning.
6. A card with any ruled altitude word emits no unknown-altitude warning.
7. Missing `altitude` remains allowed and emits no unknown-altitude warning.
8. Existing runtime patch tests that reject unsupported `altitude` patch
   updates still pass, proving this slice did not broaden mutation behavior.
9. No card content changes are present in the diff.
10. The deterministic verification commands pass, or any skipped command is
    documented with the exact blocker.

## Deferred Follow-Ups

1. A broader altitude content tuning pass should decide whether specific cards
   should change altitude; this issue intentionally only fixes code hygiene.
2. Library-migration `product-card.v2` path and identity lint remains separate.
3. If more catalog semantics become duplicated between AX and Viewer, consider
   a small shared catalog-view-model package, but do not introduce that package
   for this narrow issue alone.
4. If future altitude words are ruled, add them to the same rank and warning
   tests in the same slice as the ruling.
