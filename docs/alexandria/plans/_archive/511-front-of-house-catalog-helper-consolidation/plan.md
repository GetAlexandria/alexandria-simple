# Issue 511 - Front-of-House Catalog Helper Consolidation

Status: implementation plan, 2026-07-01.

Issue: GitHub #511, "Collapse duplicated Front-of-House frontmatter/plane/isRecord helpers onto the catalog source".

Goal: remove duplicated read-only helpers from `packages/ax/src/domain/library-front-of-house.ts` by making the catalog-owned frontmatter reader primitives and product-plane comparator the single source of truth, and by using the already-exported `isRecord` guard from `state-events.ts`.

Linked product plan: none. This is a Wave 3 chain-review backlog refactor following the Front-of-House agenda work in `docs/alexandria/plans/480-front-of-house-table-agenda/plan.md`.

Issue comments checked: the only GitHub comment links Fabro local run `01KWF16450HQ7JT9BBVVZXC2FA`; it adds no extra technical requirements.

## Scope

This slice is a pure `packages/ax` domain refactor.

In scope:

1. Export catalog-owned frontmatter read primitives from `packages/ax/src/domain/library-catalog.ts`.
2. Add a shared frontmatter block splitter that owns the `---` fence regex, returns the exact body slice, and returns the same meaningful frontmatter lines catalog currently reads.
3. Have Front-of-House import the shared frontmatter read primitives while keeping its writer and round-trip state.
4. Export a single `compareProductPlanes(left, right)` comparator next to `PRODUCT_CARD_PLANES`; express `orderProductCardPlanes` through it.
5. Have Front-of-House import `compareProductPlanes` instead of maintaining a local plane-rank map and comparator.
6. Replace the local `isRecord` copies in the chain-touched catalog/FoH files with the exported guard from `state-events.ts`.
7. Add focused tests proving parsing, ordering, and patch round-trip output do not change.

## Non-Goals

1. Do not change Front-of-House agenda behavior, agenda schema, lifecycle semantics, or CLI output.
2. Do not delete or rewrite the Front-of-House frontmatter writer; it still owns field order, `links:`/relationships, and body preservation for `apply-patch`.
3. Do not modify `packages/ax/src/domain/knowledge-artifacts.ts`; its scalar-only frontmatter parser is deliberately separate.
4. Do not sweep the roughly 20 other `isRecord` copies across `packages/ax`.
5. Do not touch `packages/alexandria-plugin`, viewer code, or `docs/alexandria/library/`.

## Current Gap

`library-front-of-house.ts` currently duplicates catalog behavior in three places:

1. Frontmatter reads: local `unquote`, `parseInlineList`, `parseValue`, and an inline `---` fence regex repeat the logic already in `library-catalog.ts`.
2. Plane ordering: local `PRODUCT_PLANE_RANK` and `compareProductPlanes` intentionally reproduce the ordering from catalog `orderProductCardPlanes`.
3. Runtime object guards: FoH and catalog each define a one-line `isRecord` even though `state-events.ts` exports the same guard.

The drift risk is small but real: future changes to quoting/list parsing, frontmatter fence handling, or the canonical plane order would need to be made in multiple files. Existing tests exercise the behavior indirectly but do not assert that catalog and FoH share one implementation source.

## Architectural Boundaries

`library-catalog.ts` remains the owner of product-card parsing and canonical product-plane ordering. It should export narrow helpers rather than introducing a broad new parsing abstraction.

Use a shared `splitFrontmatter(content)` helper in `library-catalog.ts` as the fence reader. It should:

1. Use the current fence regex exactly: `/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/`.
2. Return `null` when there is no frontmatter block.
3. Return `{ body, lines }`, where `body` is the exact `content.slice(match[0].length)` body used by FoH today.
4. Return `lines` with the same blank-line and `#` comment filtering catalog currently applies.

Catalog readers can call `splitFrontmatter(content)?.lines`. If a `frontmatterLines` wrapper is kept for readability, it must be only a thin wrapper around `splitFrontmatter`; the regex must live in one function.

Front-of-House should import `splitFrontmatter`, `unquote`, `parseInlineList`, and either `parseFrontmatterValue` or a same-typed exported catalog value parser. Its local `parseFrontmatter` should keep building `ParsedFrontmatter` with `Map` fields, `order`, `relationships`, and the exact body for the writer.

`compareProductPlanes` should live next to `PRODUCT_CARD_PLANES` in `library-catalog.ts`. It must preserve the exact current rule:

1. `strategy`, `product`, `learning` in `PRODUCT_CARD_PLANES` order.
2. Unknown planes sort after canonical planes.
3. Ties within the same rank use `left.localeCompare(right)`.

`orderProductCardPlanes(values)` should become `[...new Set(values)].sort(compareProductPlanes)`.

`isRecord` should be imported from `./state-events.js` in `library-front-of-house.ts` and `library-catalog.ts`. The current `state-events.ts` import graph has no direct dependency on `library-catalog.ts`; if implementation reveals an actual runtime cycle, stop and lift only the guard into a tiny leaf module that `state-events.ts`, catalog, and FoH import.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Catalog frontmatter reader | `packages/ax/src/domain/library-catalog.ts` | No observable behavior change; read primitives become exported and the fence/body split lives in one helper |
| Catalog plane ordering | `packages/ax/src/domain/library-catalog.ts` | No observable behavior change; `orderProductCardPlanes` delegates to exported `compareProductPlanes` |
| Catalog record guard | `packages/ax/src/domain/library-catalog.ts`, `packages/ax/src/domain/state-events.ts` | No observable behavior change; catalog uses the canonical exported guard |
| Front-of-House frontmatter reader/writer | `packages/ax/src/domain/library-front-of-house.ts` | No writer behavior change; FoH imports shared read helpers and keeps order/relationships/body serialization |
| Front-of-House agenda ordering | `packages/ax/src/domain/library-front-of-house.ts` | No ordering change; agenda comparator imports catalog `compareProductPlanes` |
| Unit tests | `packages/ax/src/domain/library-catalog.test.ts`, `packages/ax/tests/library-front-of-house.test.ts` | Add regression coverage for shared parsing, plane ordering, and exact patch output |
| Black-box FoH tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Existing `apply-patch` retry/output tests should remain green; add only if unit coverage cannot prove byte identity |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Shipped plugin skills | None | No plugin validation or eval rerun required |
| Reusable agents | None | No agent prompt or deployment changes |
| `ax internal front-of-house` CLI | None intended | Existing black-box tests must stay green; no exit code or output field changes |
| Generated FoH runtime files | None intended | Exact-output tests should prove `apply-patch` card serialization is unchanged |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Catalog parser/order unit tests | `cd packages/ax && bun test src/domain/library-catalog.test.ts` | Proves catalog frontmatter parsing and product-plane ordering remain stable |
| FoH domain unit tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Proves agenda ordering uses the shared comparator and `apply-patch` preserves exact card output |
| FoH black-box bundle tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Guards CLI `prepare-agenda`/`apply-patch` flows and existing byte-identical retry checks |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches export/import and circular type issues |
| AX format check | `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript formatted |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches unused exports/imports and package lint issues |

If implementation only changes the two domain files and focused tests, the three Bun test commands plus typecheck are the minimum handoff gate. Name any skipped lint/format checks explicitly.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `packages/ax` deterministic domain/CLI behavior | Covered by Bun unit and integration tests | Extend deterministic tests in this slice | Commands listed above |
| Plugin skills/workflows | Not touched | No eval-harness rerun required | None |
| Contributor planning skill | Used only to create this plan | No eval-harness coverage required | None |

Rationale: this refactor does not change reusable agent, skill, prompt, workflow, or eval-backed behavior. `EVALS.md` requires eval reruns for skill/agent/product workflow changes; this slice is internal `packages/ax` helper consolidation with deterministic tests.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| FoH loses exact body preservation when switching from its inline regex to a shared reader | `splitFrontmatter` returns the exact `content.slice(match[0].length)` body; add an exact-output `applyFrontOfHousePatch` test with scalar fields, dash-list fields, `links:`, and a body |
| Blank/comment filtering changes subtly between catalog and FoH | Keep the current catalog filtering rule in `splitFrontmatter`; add `parseLibraryFrontmatter` coverage with comments plus scalar, inline-list, dash-list, quoted, and unquoted fields |
| Plane ordering drifts while changing from `indexOf` to a rank map | Implement `compareProductPlanes` with the exact `-1 -> PRODUCT_CARD_PLANES.length` fallback and `localeCompare` tie-break; test canonical planes, unknown planes, and duplicate dedupe through `orderProductCardPlanes` |
| Agenda ordering changes because FoH now imports the catalog comparator | Extend the existing FoH agenda ordering test with unknown planes sorted after canonical planes and alphabetically among themselves |
| Importing `isRecord` from `state-events.ts` creates a runtime import cycle | Typecheck and run focused tests; if a real cycle appears, lift the guard into a leaf module and have `state-events.ts`, catalog, and FoH import it |
| Exporting low-level helpers invites broader use outside the intended catalog/FoH boundary | Keep exports narrow and documented by tests; do not create a general YAML parser or new public CLI API |

## Implementation Steps

1. In `library-catalog.ts`, introduce `export function splitFrontmatter(content)` near the existing frontmatter helpers. Move the current fence regex and meaningful-line filtering into it, and update catalog callers to use `splitFrontmatter(content)?.lines` or a thin wrapper that delegates to it.
2. Export the read helpers FoH needs: `unquote`, `parseInlineList`, and the scalar/list value parser currently named `parseFrontmatterValue`. Export the related value/frontmatter types only if TypeScript requires them for public signatures.
3. Add `export function compareProductPlanes(left: string, right: string): number` beside `PRODUCT_CARD_PLANES`. Reuse the current rank/fallback/tie logic exactly, then rewrite `orderProductCardPlanes` as dedupe plus `.sort(compareProductPlanes)`.
4. Import `isRecord` from `./state-events.js` in `library-catalog.ts` and remove catalog's local guard. Keep the import type/value split clean so existing TypeScript module settings pass.
5. In `library-front-of-house.ts`, import `splitFrontmatter`, `unquote`, `parseInlineList`, the shared scalar/list value parser, and `compareProductPlanes` from `./library-catalog.js`; import `isRecord` from `./state-events.js`.
6. Delete FoH's local `isRecord`, `unquote`, `parseInlineList`, `parseValue`, `PRODUCT_PLANE_RANK`, and `compareProductPlanes`.
7. Update FoH `parseFrontmatter` to call `splitFrontmatter(content)`. On `null`, keep returning `Error("Card is missing YAML frontmatter.")`. Use `block.body` for `ParsedFrontmatter.body` and iterate `block.lines` through the existing field/order/relationships logic.
8. Keep FoH serialization/rendering helpers unchanged except for imported read helpers. Do not change field order, relationship rendering, closed-set normalization, or body handling.
9. Extend `library-catalog.test.ts` with a parser case covering scalar, inline-list, dash-list, quoted/unquoted values, comments, and blank lines. Add ordering assertions for `compareProductPlanes` and `orderProductCardPlanes`, including canonical planes, unknown planes, alphabetical unknown ties, and duplicate dedupe.
10. Extend `library-front-of-house.test.ts` with a focused `applyFrontOfHousePatch` exact-output fixture that preserves field order, `source_evidence` list parsing, `links:` relationships, and body bytes after a valid patch. Extend the agenda ordering coverage so unknown planes sort after canonical planes and alphabetically among themselves.
11. Run the deterministic verification commands and fix only regressions caused by this refactor.

## Acceptance / Exit Criteria

1. There is exactly one implementation of `unquote` and `parseInlineList`, exported from `library-catalog.ts`.
2. The frontmatter fence regex lives in one shared reader, and FoH imports it rather than redefining the regex.
3. FoH has no local `parseValue` duplicate unless it is a trivial type alias around the exported catalog value parser; preferred exit state is no local `parseValue`.
4. There is exactly one `compareProductPlanes`, exported from `library-catalog.ts`; `orderProductCardPlanes` is implemented as dedupe plus that comparator.
5. `library-front-of-house.ts` has no local `isRecord`; it imports the exported guard from `state-events.ts`.
6. `library-catalog.ts` no longer keeps its own `isRecord` unless implementation proves a hard import cycle and records the leaf-module fallback in the final notes.
7. FoH `apply-patch` card output remains byte-identical for the tested round-trip fixture, including field order, links/relationships, and body.
8. Catalog frontmatter parsing still handles scalar fields, inline lists, dash lists, quoted values, unquoted values, blank lines, and comments.
9. Catalog and FoH plane ordering are unchanged for canonical planes plus unknown planes and alphabetical ties.
10. Focused Bun tests and AX typecheck pass, with any skipped lint/format/package-wide checks named in the implementation handoff.

## Deferred Follow-Ups

1. Do not consolidate the remaining unrelated `isRecord` copies in `packages/ax`; that should be a separate mechanical cleanup if it becomes worthwhile.
2. Do not replace the deliberate scalar-only `knowledge-artifacts.ts` frontmatter parser in this issue.
3. Do not introduce a general YAML dependency or parser until a separate issue requires broader YAML semantics.
4. If more modules need frontmatter read primitives later, consider moving the helpers from `library-catalog.ts` into a leaf `library-frontmatter.ts`; do not do that in this slice unless an import cycle forces it.
