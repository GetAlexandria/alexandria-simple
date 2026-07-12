# Issue #740: `library-draft.json` draft-bundle manifest

Status: implementation-ready technical plan. This is a planning-only artifact;
implementation files are intentionally untouched in this stage.

## Header

- Issue: GitHub #740, "Loader recognizes library-draft.json as the
  draft-bundle manifest"
- Goal: teach the catalog loader to recognize `library-draft.json` as the
  draft-bundle manifest, keep `library.json` compatibility, and expose
  optional draft identity fields on catalog `meta`.
- Linked product plan:
  `docs/alexandria/plans/library-migration/plan.md`, Slice 5 companion to the
  post-4d sidecar dissolution work.
- Companion work: back-of-house-walk emit-contract PR #739 is Studio-gated and
  references the new manifest name. This issue unblocks that contract merge.
- Blocked by: nothing.
- Blocks: #739 merge.

## Source Review

- Read repository guidance: `CLAUDE.md`, `README.md`.
- Read planning guidance:
  `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- Fetched GitHub issue comments for #740. The only comment is the Fabro local
  run link for run `01KX27H32DMQYEW17Q9XEDQHP7`; it adds no extra technical
  constraints.
- Read package and surface guidance:
  `packages/ax/CLAUDE.md`, `packages/ax/README.md`,
  `packages/viewer/README.md`, `packages/pms/CLAUDE.md`,
  `packages/alexandria-plugin/CLAUDE.md`,
  `packages/alexandria-plugin/README.md`, and `studio/README.md`.
- Read `EVALS.md`. This slice should not edit product agents, skills, or
  plugin workflows, so eval-harness reruns are not required.
- Read related plan context:
  `docs/alexandria/plans/library-migration/plan.md`,
  `docs/alexandria/plans/library-migration/execution-log.md`, and
  `docs/alexandria/plans/725-single-product-card-drafts-from-ledger/plan.md`.
- Inspected current implementation and tests in:
  `packages/ax/src/effects/library-graph-loader.ts`,
  `packages/ax/src/domain/library-catalog.ts`,
  `packages/ax/src/effects/library-graph-loader.test.ts`,
  `packages/ax/tests/runtime-server.test.ts`,
  `studio/tools/check-keystone.ts`,
  `studio/tools/check-keystone.test.ts`,
  `packages/viewer/src/app/runtime/schemas.ts`,
  `packages/viewer/src/app/runtime/client.test.ts`,
  `packages/viewer/src/components/library/library-bundle-registry.ts`,
  `packages/viewer/src/components/library/library-mode-config.ts`, and
  `packages/viewer/src/components/library/DraftsView.tsx`.

## Scope

In scope:

1. Add a draft-bundle manifest filename, `library-draft.json`, beside the
   existing `library.json` compatibility manifest.
2. Update catalog schema selection for non-product roots:
   - if `library-draft.json` exists, it is the authoritative manifest;
   - otherwise fall back to existing `library.json` behavior;
   - if neither exists and the root is not the config-resolved product root,
     keep legacy mode.
3. Keep the config-resolved product library root product-card by identity, as
   landed in Slice 4d. Manifest parsing must not demote the real product root.
4. Parse `library-draft.json` with the same
   `schemaVersion: "product-card.v1"` gate as `library.json`.
5. Expose valid optional `draftOf` and `playRunId` strings from
   `library-draft.json` on `catalog.meta`.
6. Add named `metadataIssues` for malformed `library-draft.json`, then degrade
   non-product roots to legacy mode instead of throwing.
7. Preserve `library.json` behavior exactly for existing QA and Studio bundles.
8. Add deterministic tests for the issue matrix:
   new manifest, old manifest regression, neither, both-present precedence,
   and malformed draft manifest.
9. Update viewer runtime schemas/types so Builder-facing catalog consumers can
   receive the new `meta.draftOf` and `meta.playRunId` fields.
10. Touch PMS copied viewer schemas only if the AX catalog response would
    otherwise fail PMS viewer decoding. Do not change PMS state or ownership.

## Non-Goals

1. Do not edit `.github/workflows`.
2. Do not freehand-edit `docs/alexandria/library/`.
3. Do not migrate all existing `library.json` fixtures to
   `library-draft.json`; `library.json` remains compatibility behavior.
4. Do not edit the shipped back-of-house prompt or plugin workflow contract in
   this issue. PR #739 owns that Studio-gated play change.
5. Do not change the product-root Drafts projection from Ledger events.
6. Do not reintroduce product-root `library.json` sidecars or patch-log
   dependencies retired by #725/#731.
7. Do not change CLI command semantics or add new public CLI flags.
8. Do not add a new manifest schema version.

## Product-Plan Summary

The library migration plan has already completed Slice 4d: the real product
library no longer needs `library.json`, and product-root catalog mode derives
from config-resolved identity. The execution log records the resulting state:
config says where the product library is, paths say what cards are, and the
Ledger says what happened.

Slice 5 updates Studio-gated play and plugin prose. The back-of-house emit
contract now wants draft bundles to carry a manifest named for what it is,
`library-draft.json`, and to carry draft identity. This issue is the runtime
compatibility layer that lets those bundles load before #739 lands.

## Current Gap

- `LIBRARY_CATALOG_MANIFEST_FILE` is `library.json`.
- `catalogSchemaFromManifestContent` only accepts one manifest content string
  and returns only `"legacy"` or `"product-card.v1"`.
- The current parser silently degrades malformed JSON to legacy, which is
  acceptable for old `library.json` compatibility but does not satisfy the new
  draft-bundle acceptance criterion that a malformed `library-draft.json`
  produce a named `metadataIssue`.
- `LibraryCatalog.meta` has counts, `metadataIssues`, and `planes`, but no
  optional `draftOf` or `playRunId`.
- Viewer and PMS viewer catalog schemas mirror the current meta shape.
- Studio fixture bundles still use `library.json`, so they only cover the old
  manifest path.

## Architectural Boundaries

1. AX owns catalog mode selection and the canonical catalog response shape.
2. `library-draft.json` is a bundle manifest, not product-library source of
   truth. The real product root remains product-card by config identity.
3. The new manifest parser must be deterministic and side-effect free: parse
   JSON, validate the schema gate, collect optional identity fields, and return
   soft metadata issues.
4. Builder and viewer code must consume the catalog through runtime schemas.
   The viewer must not read manifest files directly.
5. PMS remains a separate product boundary. If its copied viewer schema needs
   optional meta fields, copy the decode contract only; do not make PMS state
   depend on Alexandria's Ledger or draft manifests.
6. Plugin workflow and prompt wording stays in #739. This issue can mention
   that dependency in the plan and tests, but should not edit plugin payload.
7. Existing QA bundles with `library.json` continue to load exactly as they do
   today.

## Manifest Contract

1. `library-draft.json` wins over `library.json` whenever it is present.
2. The precedence rule includes malformed `library-draft.json`: do not fall
   back to a stale `library.json` when the new manifest is present but broken.
3. A valid draft manifest is a JSON object with:

   ```json
   {
     "schemaVersion": "product-card.v1",
     "draftOf": "optional non-empty string",
     "playRunId": "optional non-empty string"
   }
   ```

4. `draftOf` and `playRunId` are exposed only from `library-draft.json`, not
   from `library.json`, so old manifest bundles behave exactly as before.
5. If optional identity fields are missing, product-card mode still applies
   when `schemaVersion` is valid.
6. If optional identity fields are present but not non-empty strings, ignore
   the invalid field and add a named `metadataIssue`; do not crash.
7. If `library-draft.json` is invalid JSON, is not an object, or has an
   unsupported `schemaVersion`, non-product roots load in legacy mode with a
   named `metadataIssue` such as `Invalid library-draft.json: ...`.
8. If neither manifest exists and the root is not the config-resolved product
   root, load in legacy mode with no new metadata issue.
9. If the root is the config-resolved product root, keep product-card mode by
   identity. Any manifest metadata issues found at that root may be surfaced,
   but they must not demote the product root.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX catalog constants | `packages/ax/src/domain/library-catalog.ts` | Add `LIBRARY_CATALOG_DRAFT_MANIFEST_FILE = "library-draft.json"` and optional draft identity fields to catalog meta types. |
| AX catalog builder | `packages/ax/src/domain/library-catalog.ts` | Accept optional manifest meta and merge `draftOf` / `playRunId` into `catalog.meta` without changing counts. |
| AX loader manifest resolution | `packages/ax/src/effects/library-graph-loader.ts` | Read `library-draft.json` first, fall back to `library.json`, return schema mode plus manifest meta plus metadata issues. |
| AX loader tests | `packages/ax/src/effects/library-graph-loader.test.ts` or adjacent catalog-focused tests | Add the new/old/neither/both/malformed matrix at the loader level. |
| AX runtime API tests | `packages/ax/tests/runtime-server.test.ts` | Cover `/api/library/catalog` for at least the new manifest and malformed-manifest soft-failure path through HTTP. |
| Viewer runtime contract | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/app/runtime/client.test.ts` | Decode and retain optional `meta.draftOf` and `meta.playRunId`. |
| Builder display, if implemented now | `packages/viewer/src/components/library/DraftsView.tsx` or shell/selector components plus tests | Show draft identity from catalog meta on Builder Drafts/Back surfaces without reading files directly. |
| PMS copied viewer schema, if required | `packages/pms/viewer/src/app/runtime/schemas.ts` and focused PMS viewer tests | Accept the optional meta fields from proxied AX catalog responses; no PMS state behavior change. |
| Studio fixture coverage | `studio/tools/fixtures/keystone/**`, `studio/tools/check-keystone.test.ts` | Add or synthesize a fixture with only `library-draft.json` so Studio validators prove the new manifest loads. Keep existing `library.json` fixtures for regression. |
| Technical plan | `docs/alexandria/plans/740-library-draft-manifest/plan.md` | This handoff document. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Shipped agents | None. | No agent eval rerun. |
| Shipped plugin skills/workflows | None in this issue. #739 owns back-of-house prompt/contract wording. | If implementation expands into `packages/alexandria-plugin`, run `claude plugin validate ./packages/alexandria-plugin`, markdown lint, and reassess eval impact. |
| AX runtime loader | Non-product draft bundles can opt into product-card mode with `library-draft.json`; malformed draft manifests produce soft metadata issues. | Add loader/runtime tests and keep deterministic output stable. |
| Viewer Builder/runtime contract | Optional draft identity can flow through catalog `meta` to Builder consumers. | Update viewer schemas and unit tests; add UI/browser validation if rendered. |
| PMS copied viewer | Only optional decode compatibility if needed. | Do not change PMS commands, records, or Studio state ownership. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX loader/runtime targeted tests | `pnpm --filter @alexandria/ax test -- src/effects/library-graph-loader.test.ts tests/runtime-server.test.ts` | Verifies manifest precedence, malformed soft failure, product-root identity, and HTTP catalog behavior. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Verifies the catalog meta type change is coherent across AX. |
| Studio keystone fixture coverage | `bun test studio/tools/check-keystone.test.ts` | Verifies Studio validators can load draft-manifest bundles while old manifest fixtures remain covered. |
| Viewer runtime/unit tests | `pnpm --filter @alexandria/viewer run test` | Verifies browser runtime schema decoding and any Builder display tests. |
| Viewer check/build | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Required if viewer schemas or components change. |
| Viewer browser validation, if UI display changes | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Verifies the Builder surface renders the new meta without breaking catalog reads. |
| PMS viewer compatibility, if PMS schema changes | `pnpm --filter @alexandria/pms-viewer run test` and `pnpm --filter @alexandria/pms-viewer run build` | Verifies copied schema compatibility without changing PMS behavior. |
| Markdown lint for this plan | `pnpm run lint:markdown` | Verifies the new plan document and any changed prose meet repo lint. |
| Plugin validation, only if scope expands | `claude plugin validate ./packages/alexandria-plugin` | Not required for the planned slice; required if implementation touches plugin payload. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX catalog loader/runtime | Deterministic Bun tests cover loader and runtime routes. | Add targeted test cases; no eval harness coverage needed. | `pnpm --filter @alexandria/ax test -- src/effects/library-graph-loader.test.ts tests/runtime-server.test.ts` |
| Viewer Builder/runtime schema | Viewer unit and optional Playwright tests cover browser behavior. | Update deterministic viewer tests; no skill eval. | `pnpm --filter @alexandria/viewer run test`; add e2e command if UI changes. |
| Studio tools | Bun tests cover `check-keystone`. | Add fixture coverage; no eval harness coverage. | `bun test studio/tools/check-keystone.test.ts` |
| Shipped plugin skills/workflows | Not touched in this issue. #739 owns play contract edits. | No eval rerun required. If implementation edits plugin workflows anyway, reassess with `EVALS.md` and run plugin validation. | None planned. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| A stale `library.json` masks a malformed `library-draft.json` in a bundle that has both. | Pin `library-draft.json` precedence whenever present, including malformed-present cases, and add a both-present regression. |
| Malformed draft manifests silently fall back to legacy without operator-visible diagnostics. | Return manifest `metadataIssues` from the parser and merge them into `catalog.meta.metadataIssues`; assert issue text names `library-draft.json`. |
| Old QA/Studio bundles stop loading because `library.json` compatibility drifts. | Keep old-manifest path isolated and add old-manifest regression tests using existing fixture shape. |
| Product-root post-4d behavior regresses back to manifest dependence. | Keep product-root identity override separate from bundle manifest parsing and include product-root/no-manifest regression coverage. |
| Viewer or PMS runtime schemas drop or reject the new meta fields. | Update optional schema fields and add decode tests. For PMS, copy only the schema compatibility needed for proxied AX catalog responses. |
| Test fixtures hardcode current product-library counts and become brittle. | Derive counts from fixture data or use small temp bundles for matrix tests. |
| Plugin PR #739 and loader semantics disagree about manifest name or draft identity. | Name the constant exactly `library-draft.json`, document the accepted manifest shape, and keep plugin wording changes in the companion PR. |

## Implementation Steps

1. Add `LIBRARY_CATALOG_DRAFT_MANIFEST_FILE` in
   `packages/ax/src/domain/library-catalog.ts` near
   `LIBRARY_CATALOG_MANIFEST_FILE`.
2. Extend `LibraryCatalog["meta"]` with optional `draftOf?: string` and
   `playRunId?: string`.
3. Add a small manifest-meta input to `buildLibraryCatalog` so the catalog
   builder owns the final `meta` shape. Keep counts and planes unchanged.
4. Replace `catalogSchemaFromManifestContent(content)` in
   `library-graph-loader.ts` with a manifest resolver that accepts draft and
   old manifest content and returns:
   - `catalogSchema`;
   - optional `draftOf`;
   - optional `playRunId`;
   - manifest `metadataIssues`;
   - the selected manifest filename for tests/debugging if useful.
5. Implement precedence:
   - if `library-draft.json` content is present, parse it and ignore
     `library.json`;
   - otherwise parse `library.json` with today's compatibility behavior;
   - otherwise return legacy with no issue.
6. For `library-draft.json`, add named `metadataIssues` for invalid JSON,
   non-object JSON, unsupported schemaVersion, and invalid optional identity
   field types. Do not throw for these cases.
7. Wire manifest `metadataIssues` into `buildLibraryCatalog` alongside extras
   and workflow metadata issues.
8. Keep `options.isProductLibraryRoot === true` overriding schema mode to
   `PRODUCT_CARD_SCHEMA_VERSION` after manifest resolution, preserving post-4d
   product-root behavior.
9. Update viewer runtime schema/type exports for optional `meta.draftOf` and
   `meta.playRunId`. Update PMS copied schema only if needed for proxied AX
   catalog decode compatibility.
10. Decide whether to render the draft identity immediately in Builder. If yes,
    add a compact display using the existing catalog data path; if no, keep the
    acceptance at API/meta level and leave richer Builder presentation as a
    follow-up.
11. Add loader-level tests for:
    - only `library-draft.json` with `draftOf` and `playRunId`;
    - only `library.json`;
    - neither manifest on a non-product root;
    - both manifests present, draft wins;
    - malformed `library-draft.json` yields legacy plus named metadata issue.
12. Add runtime API coverage for at least new-manifest success and malformed
    draft-manifest soft failure.
13. Add or synthesize one Studio keystone fixture with only
    `library-draft.json`; keep the existing old-manifest fixture as regression.
14. Update viewer client/schema tests to assert optional draft identity fields
    survive decoding.
15. Run the deterministic verification commands listed above.

## Acceptance / Exit Criteria

1. A bundle with only `library-draft.json` containing
   `{"schemaVersion":"product-card.v1","draftOf":"x","playRunId":"y"}`
   loads in product-card mode.
2. That catalog response includes `meta.draftOf === "x"` and
   `meta.playRunId === "y"`.
3. A bundle with only `library.json` behaves exactly as today and does not gain
   draft identity fields.
4. A non-product bundle with neither manifest stays legacy mode.
5. A malformed `library-draft.json` does not crash the loader or runtime route.
6. The malformed draft-manifest catalog includes a named
   `metadataIssues` entry that mentions `library-draft.json`.
7. When both manifests are present, `library-draft.json` wins and the test
   asserts that precedence.
8. The config-resolved product root still loads product-card with no manifest.
9. Viewer catalog decoding accepts the new optional meta fields.
10. Studio keystone validation has at least one passing draft-manifest fixture.
11. No `.github/workflows` files are changed.
12. No files under `docs/alexandria/library/` are changed.
13. Required deterministic tests, typechecks, and lint pass or any failures are
    documented with concrete blockers.

## Deferred Follow-Ups

1. PR #739 should update back-of-house-walk emit-contract wording and fixtures
   to emit `library-draft.json` with draft identity.
2. A later migration may convert more QA/Studio fixtures from `library.json` to
   `library-draft.json` once compatibility coverage is no longer needed.
3. A richer Builder UI can present draft lineage beyond `draftOf` and
   `playRunId` after the API/meta contract is stable.
4. If future draft manifests need more fields, add a new manifest parser test
   matrix before expanding the schema.
