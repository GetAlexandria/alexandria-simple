# Issue 350 Technical Plan: EL5 Atomizer Re-point

## Header

- Issue reference: `GetAlexandria/alexandria-internal#350`
- Project: Library Rebuild, Phase 2
- Goal: re-point the parked atomic-card production line so EL5 fills an EL4-confirmed empty library from EL1 source-of-truth docs, using confirmed shelves and lexicon names only.
- Plan path: `docs/alexandria/plans/350-el5-atomizer-repoint/plan.md`
- Linked product plan: `docs/alexandria/plans/rebuilding-the-library/plan.md`, Brick 5
- Migration spec: `docs/alexandria/plans/rebuilding-the-library/el5-migration-spec.md`
- Ledger model: `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md`
- Blocked by: EL4 Empty Library Confirm output: a stable empty-library bundle manifest plus a matching user-authored `library.confirmed` Ledger event.
- Execution style: small non-stacked PRs: mechanical port, contract re-point, publish/audit, eval re-proof.

## Goal

EL5 should run the existing atomic-card line against a confirmed empty library, not against freeform source and a hardcoded category enum. For each candidate concept from the source docs, the system must either fill an existing confirmed stub with a lexicon-resolved name, mark it already covered, write a gap report, defer to a human, or reject it.

The draft -> validate -> grade -> revise -> publish loop inside `build-atomic-card` should stay recognizable. The change is the contract around the loop: confirmed shelves, lexicon names, source-doc set, append-only publish into stubs, and Ledger-backed provenance.

## Linked Product-Plan Summary

The Library Rebuild sequence is:

1. EL1 emits a source-of-truth manifest.
2. EL2 drafts an empty-library bundle.
3. EL3 walks the draft with the director and applies structure-only corrections.
4. EL4 records a user-authored `library.confirmed` event for the exact product, bundle path, and library version.
5. EL5 fills the confirmed stubs from EL1 source material.

The migration spec calls this "port-then-re-contract": first bring the old atomic-card workflows and deterministic card commands into the current `packages/alexandria-plugin` and `packages/ax` world, then replace the old input shape and category logic.

## Scope

- Add or port the three atomic-card workflows to the shipped plugin:
  - `atomic-card-planning`
  - `atomic-card-creation`
  - `build-atomic-card`
- Add AX deterministic support for the `ax cards` command family required by those workflows.
- Change the atomic-card planning input contract to:
  - `CONFIRMED_LIBRARY`
  - `VOCABULARY_LEXICON`
  - `SOURCE_OF_TRUTH_DOCS`
  - optional advisory card budget
  - existing grade and revision controls
- Enforce the EL4 gate by deriving approval through `getLibraryConfirmationStatus`, not by reading a hand-written flag.
- Replace hardcoded category triage with confirmed-shelf and lexicon matching.
- Emit gap-report entries for real concepts that lack a confirmed shelf, a lexicon match, or both.
- Publish by appending generated body content to the confirmed stub while preserving frontmatter, wikilinks, and placement.
- Append one `atomic_card.created` Ledger event per published card with an agent actor and source/confirmation references.
- Produce a coverage audit that reports filled cards, covered existing concepts, gap reports, deferrals/rejections, and shelf-misplacement findings.
- Update Studio records so the plays stay filed under Product -> Library Operations, fronted by Raven, with PlaymakerStudio recorded only as provenance.
- Add deterministic tests and EL5 eval coverage for the new contract and the retained draft/grade/publish loop.

## Non-Goals

- Do not build EL6 living updates, partial-run recovery, live atomization monitoring, or an intermediate-card Viewer surface.
- Do not write directly to `docs/alexandria/library/` during implementation. Use fixtures and generated test workspaces.
- Do not create new shelves, categories, lexicon entries, or card names during EL5.
- Do not revive the retired `source-assessment` smoke workflow as part of EL5.
- Do not rewrite `build-atomic-card` into a new play if the existing loop can be re-contracted.
- Do not satisfy provenance by adding hand-authored `proposed_by` or `source_evidence` frontmatter. Provenance belongs to the Ledger event.
- Do not use `docs/alexandria/library/` as a migration scratchpad.

## Current Implementation Gap

- `docs/alexandria/plans/library-elicitation-plays/plan.md` currently contains the EL3 technical plan, so this issue needs its own issue-scoped plan rather than overwriting that artifact.
- `studio/plays/build-atomic-card/` exists as a reverse-derived Studio record, but `studio/plays/atomic-card-planning/` and `studio/plays/atomic-card-creation/` are not present in this checkout.
- `packages/alexandria-plugin/workflows/` has no atomic-card workflows.
- `packages/ax/src/cli/router.ts` has no `cards` subcommand.
- `packages/ax/src/domain/atomic-card-categories.ts` still defines the old ten-category enum, and `atomic_card.created` currently requires `categoryId`.
- `packages/ax/src/domain/knowledge-artifacts.ts` discovers cards by `categoryId`, which does not match the EL5 shelf/lexicon contract.
- EL4 support exists: `library.confirmed` / `library.confirmation_rejected` schemas, `getLibraryConfirmationStatus`, and confirmation CLI/tests are already in `packages/ax`.
- Viewer/catalog code has first-class `gaps.json` support, but catalog display still expects frontmatter provenance fields. EL5 must not paper over that by writing provenance fields by hand.
- The root `package.json` has no `pnpm eval` script, and this checkout does not contain the older `packages/ax/tests/eval-cases/{conan,sam,...}` tree described by `EVALS.md`. EL5 still requires eval coverage; implementation must bind that requirement to the current eval infrastructure or restore it as a prerequisite slice.
- The parked branch named by the migration spec was not available locally during planning. The migration spec is therefore the local authoritative diff unless implementation explicitly fetches the branch.

## Architectural Boundaries

- `packages/alexandria-plugin` owns the guided play behavior and workflow prompts.
- `packages/ax` owns deterministic parsing, validation, publishing, Ledger writes, CLI exit codes, and JSON output.
- `studio/` owns play catalog/design records and must keep the atomic-card plays filed under Product / Library Operations.
- `docs/alexandria/plans/` owns this implementation plan and migration notes.
- `packages/viewer` is out of scope unless the implementation chooses to project card provenance from the Ledger for catalog display. If touched, Viewer tests/build/browser validation are required.
- `repos/` stays read-only reference material.

## Runtime Contract

Add the play ids to `packages/ax/src/domain/plays.ts`:

- `atomic-card-planning`
- `atomic-card-creation`
- `build-atomic-card`

The EL5 launch path is Raven-fronted but deterministic at the CLI boundary:

```bash
ax run atomic-card-planning \
  --input CONFIRMED_LIBRARY=/abs/path/to/el4-bundle \
  --input VOCABULARY_LEXICON=/abs/path/to/vocabulary \
  --input SOURCE_OF_TRUTH_DOCS=/abs/path/to/source-manifest.json \
  --input PLAN_ID=el5-run-001 \
  --input MIN_GRADE=A- \
  --input MAX_REVISION_TURNS=3 \
  --json
```

`MAX_CARDS`, if accepted, is advisory only. The confirmed library bounds what can be filled; overflow becomes gap-report output.

The workflow must fail before inventory or publish if `CONFIRMED_LIBRARY` does not resolve to a clean EL4 bundle whose product/path/version has a matching user-authored `library.confirmed` event.

## Data Contracts

### Confirmed Library

The confirmed library loader should reuse EL4 bundle rules:

- normalize bundle path inside the project root
- read `runtime/empty-library/bundle.json`
- verify manifest hash is clean
- derive approval through `getLibraryConfirmationStatus`
- scan markdown stubs under the bundle, excluding EL4 operational files

For EL5, each fillable stub must have:

- `type`
- `prefLabel`
- `context`
- `plane`
- `status`

The scanner records the stub path, shelf path, file stem, frontmatter, wikilinks, and a hash of the approved stub prefix. EL5 publish uses that record to prove it is appending to the same confirmed structure it planned against.

### Vocabulary Lexicon

The lexicon loader should support the current worked vocabulary directory format: markdown entries with frontmatter fields such as `prefLabel`, `altLabels`, `type`, `category`, `subcategory`, and `_signature` material. It should build a normalized match index:

- exact `prefLabel`
- exact `altLabels`
- normalized/case-folded labels for matching only
- entry path and content hash for provenance

Triage may resolve names only to `prefLabel`. `altLabels` are synonyms, not publish names.

### Source-of-Truth Docs

`SOURCE_OF_TRUTH_DOCS` is a set, not one file. Add a source manifest schema with entries like:

```json
{
  "schemaVersion": 1,
  "documents": [
    {
      "id": "source-1",
      "path": "docs/alexandria/source-of-truth/product.md",
      "contentHash": "sha256:...",
      "sourceOfTruthId": "source_of_truth_..."
    }
  ]
}
```

Range resolution must include document id, path, content hash, and range. Validation rejects ranges whose current file hash differs from the manifest.

### Build Plan

Bump the planning schema to an EL5 contract version. The plan must include:

- `schemaVersion`: `atomic-card-build-plan.v1`
- `confirmedLibrary`: product, bundle path, library version, confirmation event id
- `sourceDocuments[]`
- `contracts[]`
- `gapReports[]`
- `coveredExisting[]`
- `deferHuman[]`
- `reject[]`

Each candidate has exactly one disposition:

- `write_new`
- `covered_existing`
- `gap_report`
- `defer_human`
- `reject`

Each `write_new` contract must resolve to an existing stub:

```json
{
  "contractId": "el5-raven-001",
  "disposition": "write_new",
  "targetCard": {
    "path": "product/agents/Agent - Raven.md",
    "shelfPath": "product/agents",
    "type": "Agent",
    "prefLabel": "Raven",
    "context": "Library Operations",
    "plane": "Product",
    "lexiconMatch": {
      "prefLabel": "Raven",
      "matchKind": "prefLabel",
      "entryPath": "vocabularies/alexandria/roles/agentic/front-of-house/Role - Raven the Maven.md"
    },
    "confirmedStubHash": "sha256:..."
  },
  "sourceRefs": [
    {
      "documentId": "source-1",
      "path": "docs/alexandria/source-of-truth/product.md",
      "contentHash": "sha256:...",
      "range": { "start": 120, "end": 340 }
    }
  ]
}
```

A gap report must include source refs and what is missing:

```json
{
  "disposition": "gap_report",
  "candidateLabel": "Telemetry Sink",
  "sourceRefs": [{ "documentId": "source-1", "range": { "start": 800, "end": 920 } }],
  "missingShelf": true,
  "missingLexiconEntry": true,
  "reason": "Source describes a real runtime concept, but no confirmed Product shelf or lexicon entry resolves it."
}
```

## Triage Rules

- Delete prompt and validator dependence on the old ten-category enum.
- A `write_new` decision must cite both a confirmed stub path and a lexicon `prefLabel`.
- A candidate with a shelf but no lexicon match is `gap_report`.
- A candidate with a lexicon match but no confirmed shelf is `gap_report`.
- A candidate with ambiguous shelf or ambiguous lexicon resolution is `defer_human` unless the source gives enough evidence to reject it.
- A candidate already represented by a filled or planned stub is `covered_existing`.
- No command or prompt may derive a folder from a category id.
- No prompt may mint a name absent from the lexicon.

## Publish Rules

`ax cards publish` must append to the confirmed stub, not copy a generated card over it.

Publish must:

- re-read the target stub
- verify path stays inside the confirmed bundle
- verify the bundle is still confirmed and clean enough for the planned library version
- verify the stub's approved frontmatter, wikilinks, and placement match the planned `confirmedStubHash`
- extract only the candidate body content for `WHAT`, `WHERE`, `WHY`, `WHEN`, and `HOW`
- append that body after the existing stub prefix
- refuse to publish if the body is already filled unless the contract marks it `covered_existing`
- preserve all existing frontmatter and wikilinks byte-for-byte where possible
- write no hand-authored provenance frontmatter

For idempotency, the publish implementation should add an EL5-owned body marker or equivalent deterministic check so a retry does not duplicate body content.

## Ledger Event Contract

Each published card appends `atomic_card.created`.

New EL5 events should not require `categoryId`. Keep legacy event decoding for older events, but new EL5 publish should write shelf/lexicon fields:

```json
{
  "atomicCardId": "Agent - Raven",
  "path": "product/agents/Agent - Raven.md",
  "contentHash": "sha256:...",
  "type": "Agent",
  "prefLabel": "Raven",
  "context": "Library Operations",
  "plane": "Product",
  "shelfPath": "product/agents",
  "lexiconPrefLabel": "Raven",
  "confirmationEventId": "evt_...",
  "product": "alexandria",
  "libraryVersion": 1,
  "contractId": "el5-raven-001",
  "playRunId": "run_...",
  "sourceRefs": [{ "documentId": "source-1", "path": "docs/source.md" }],
  "sourceOfTruthIds": ["source_of_truth_..."]
}
```

The event actor should be `kind: "agent"` with the card author/orchestrator name carried from the contract or workflow context. The mechanical CLI process is the transport, not the card provenance. Tests should reject EL5 publish paths that append `atomic_card.created` with the default process actor unless the implementation has an explicit product ruling for process-authored cards.

Use stable idempotency keys such as:

```text
atomic-card-created:<product>:<libraryVersion>:<targetPath>:<contentHash>
```

## Gap Reports And Audit

EL5 should write deterministic run artifacts under the bundle runtime area, for example:

- `runtime/atomic-cards/build-plan.json`
- `runtime/atomic-cards/gap-report.json`
- `runtime/atomic-cards/coverage-audit.json`
- `runtime/atomic-cards/COVERAGE-AUDIT.md`

If the product wants Viewer-visible gaps in the same slice, update or merge the existing library-root `gaps.json` read model. Do not create markdown gap cards.

The coverage audit must report:

- filled cards
- covered existing concepts
- gap reports with missing shelf / missing lexicon flags
- deferrals and rejects
- source documents with no emitted candidate
- any published card whose path, frontmatter, lexicon match, or shelf-fit grade does not match the confirmed contract

## Affected Behavior Surfaces

| Surface | Files / areas | Behavior change | Required follow-through |
| --- | --- | --- | --- |
| Plugin workflows | `packages/alexandria-plugin/workflows/atomic-card-planning/*`, `atomic-card-creation/*`, `build-atomic-card/*` | Adds/ports atomic-card workflows and re-points inputs to confirmed library, lexicon, and source manifest | Plugin validation; workflow fixture smoke; prompt extraction if inline prompts are ported |
| Plugin Raven guidance | new `packages/alexandria-plugin/skills/atomic-card-production/SKILL.md`, likely `ax-start/SKILL.md`, `alexandria-event-log/SKILL.md` | Teaches Raven how to launch EL5, respect the EL4 gate, read gap/audit output, and never hand-author cards | Product skill eval; plugin validation |
| AX CLI | `packages/ax/src/cli/router.ts`, new `packages/ax/src/commands/cards.ts`, `packages/ax/README.md` if exposed | Adds deterministic `ax cards` play-support commands with stable JSON and exit codes | Black-box CLI tests |
| AX domains | new or ported `atomic-card-*` domain modules; `library-confirmation.ts` reuse | Adds source manifest, confirmed-library scanner, lexicon loader, build-plan schema, contract schema, publish append logic, audit logic | Unit tests for each domain |
| Event schema | `packages/ax/src/domain/state-events.ts`, `events.test.ts` | Re-contracts `atomic_card.created` for EL5 shelf/lexicon payload while preserving legacy reads | Event schema tests and `ax inspect events schema --json` checks |
| State/read models | `knowledge-artifacts.ts`, `project-state.ts`, maybe `library-catalog.ts` | Stops treating `categoryId` as the only card identity/projection path | Regression tests for legacy events plus EL5 events |
| Studio records | `studio/plays/{atomic-card-planning,atomic-card-creation,build-atomic-card}/`, `studio/plays/registry.js`, `studio/plays/board-state.json` | Adds missing planning/creation records and updates build docs to EL5 without filing under Studio as product owner | `studio/tools/check.sh`; catalog/board checks |
| Fixtures | `packages/ax/tests/fixtures/atomic-cards/*` or equivalent | Adds small confirmed-library, lexicon, source-manifest, no-confirm, and gap fixtures | Tests and smoke commands use the same fixture set |
| Viewer | Only if ledger-projected provenance is needed for catalog display | Catalog provenance comes from Ledger projection, not hand-written frontmatter | Viewer unit/build/browser validation if touched |

## Deterministic Verification

Add focused black-box and domain tests. Expected commands after implementation:

```bash
cd packages/ax
bun test tests/cards.test.ts tests/atomic-card-contract.test.ts tests/atomic-card-publish.test.ts tests/events.test.ts tests/library-confirmation.test.ts tests/cli.test.ts
```

Also run:

```bash
pnpm --filter @alexandria/ax run typecheck
pnpm --filter @alexandria/ax run lint
claude plugin validate ./packages/alexandria-plugin
studio/tools/check.sh
```

Required test cases:

- CLI help and unknown subcommands return stable exit code `2` and diagnostics on stderr.
- Missing EL5 required inputs return exit code `2`.
- An unconfirmed bundle returns an operational failure before inventory and writes no cards.
- A confirmed small fixture fills one stub on a confirmed shelf with a lexicon `prefLabel`.
- The filled card preserves the original stub frontmatter, wikilinks, and path.
- `atomic_card.created` is appended once per published card with an agent actor and confirmation/source refs.
- A source concept with no shelf and no lexicon match creates a gap-report entry and no new shelf/file.
- A source concept with a lexicon match but no shelf creates a gap report and no file.
- A source concept with a shelf but no lexicon match creates a gap report and no minted name.
- The audit reports filled, covered, gaps, deferrals/rejections, and shelf-fit findings.
- Planning and creation validators reject mismatched schema versions.
- Legacy `atomic_card.created` events with `categoryId` still parse if existing read models need backward compatibility.

Smoke commands after the workflow is wired:

```bash
ax run atomic-card-planning --fixture small-confirmed --json
ax run atomic-card-planning --fixture no-confirm-event --json
ax cards coverage-audit --plan runtime/atomic-cards/build-plan.json --lexicon <lexicon-path> --json
ax inspect events list --type atomic_card.created --json --limit 20
```

## Eval Impact

EL5 changes product-facing play behavior and agent-mediated drafting/grading behavior, so eval coverage is required.

Current inspection found no active `pnpm eval` script and no checked-in `packages/ax/tests/eval-cases/{conan,sam}` directories. Implementation must not claim the old conan/sam/bridget/solomon suite passed unless those cases are restored or found in the current eval harness.

Required EL5 eval work:

- Create or restore an `atomic-card-planning` eval for shelf-constrained triage:
  - fixture: small confirmed library plus vocabulary lexicon plus source manifest
  - expected: `write_new` only for confirmed shelf and lexicon name, `gap_report` for no shelf/no lexicon
- Create a `build-atomic-card` eval for drafting against a confirmed stub:
  - expected: WHAT/WHERE/WHY/WHEN/HOW quality remains strong, no frontmatter rewrite, no invented wikilinks
- Create a `build-atomic-card` shelf-fit eval:
  - fixture: body that would pass the old category rubric but belongs on the wrong confirmed shelf
  - expected: grader flags shelf-fit failure
- Create an append-not-overwrite structural eval or deterministic eval check:
  - expected: approved stub frontmatter and wikilinks are preserved
- Create a negative no-invented-structure eval:
  - expected: no shelf/no lexicon source concept becomes a gap report

If the current repo-approved harness is restored as `pnpm eval`, run:

```bash
pnpm eval -- run atomic-card-planning/all
pnpm eval -- run build-atomic-card/all
```

If the harness remains absent, the implementation slice must either land the required harness path first or document the approved substitute eval runner in the implementation notes before merge. Deterministic Bun tests alone are not enough for the prompt-level triage and grader behavior.

Issue 350 implementation note: this checkout still lacks the historical live
Claude eval harness, so the slice adds a narrow substitute runner at
`packages/ax/src/tools/el5-eval.ts`, exposed as `pnpm eval`. It evaluates
checked-in structural prompt/workflow cases under
`packages/ax/tests/eval-cases/{atomic-card-planning,atomic-card-creation,build-atomic-card}/`.
Run:

```bash
pnpm eval -- list
pnpm eval -- run atomic-card-planning/all
pnpm eval -- run atomic-card-creation/all
pnpm eval -- run build-atomic-card/all
```

This substitute does not claim live model judge coverage; it is the approved
local gate for the EL5 prompt/graph contract until the full eval harness is
restored.

## Implementation Steps

1. Mechanical port PR:
   - fetch or otherwise recover the parked workflow and card command sources if available
   - port `ax2 cards` support to current `packages/ax` as `ax cards`
   - port workflows into `packages/alexandria-plugin/workflows`
   - rename `.ax2-runtime` to `.alexandria` or the current runtime path
   - rename `__AX2_*__` placeholders to the current `__AX_*__` convention
   - keep behavior semantically unchanged
   - prove ported command tests pass

2. Studio alignment PR:
   - add missing `atomic-card-planning` and `atomic-card-creation` Studio records
   - update `build-atomic-card` Studio docs to distinguish old reverse-derived behavior from the upcoming EL5 contract
   - keep all atomic-card plays under Product / Library Operations
   - update board/catalog state and run Studio checks

3. EL5 contract PR:
   - add confirmed-library scanner and gate preflight
   - add vocabulary lexicon loader
   - add source manifest set loader and range resolver
   - bump build-plan and contract schemas
   - replace category-derived folder logic with stub and lexicon resolution
   - add gap-report disposition and rendering
   - update planning/creation workflow prompts and validators

4. Build loop re-contract PR:
   - update `build-atomic-card` prompt language for confirmed stubs
   - update candidate validator for EL5 contracts
   - add shelf-fit fields to grader output
   - remove the "empty library means links are impossible" branch
   - preserve draft/validate/grade/revise/publish routing

5. Publish and Ledger PR:
   - implement append-to-stub publish
   - update `atomic_card.created` payload validation and descriptors
   - append events with agent actor and source/confirmation refs
   - add idempotency keys
   - update knowledge/read models for EL5 events
   - add coverage audit output

6. Eval re-proof PR:
   - restore or create the EL5 eval harness cases
   - retune old Conan/Sam rubric material into the actual current play surfaces
   - run and check in baselines through the approved harness
   - document any old eval paths that no longer exist

7. Dogfood prep PR:
   - run EL5 against a small confirmed-library fixture
   - only after the chain is proven, prepare a separate dogfood run for Alexandria's own EL4-confirmed bundle
   - do not include dogfood-generated `docs/alexandria/library/` changes in the implementation PRs unless explicitly approved

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Publish overwrites director-approved structure | Publish verifies the confirmed stub hash and appends body content only; tests assert frontmatter, wikilinks, and path are preserved |
| Old category enum leaks into new triage | New schemas have no required `categoryId`; tests search new workflow/domain paths for category-derived folder mapping; validators reject category-only write decisions |
| EL5 fills an unconfirmed bundle | Gate preflight calls `getLibraryConfirmationStatus`; negative test proves no files or events are written without a matching user-authored `library.confirmed` |
| Lexicon synonyms become published names | Triage can match on `altLabels` but must publish `prefLabel`; tests seed alias-only source language |
| Real concepts are forced into near-fit shelves | Ambiguous or missing shelf/lexicon becomes `gap_report` or `defer_human`; audit lists every gap with source refs and missing fields |
| Ledger provenance gets duplicated in frontmatter | Publish writes no `proposed_by` / `source_evidence`; `atomic_card.created` carries the actor and source refs; tests assert no new hand-authored provenance fields appear |
| Catalog display excludes filled cards without frontmatter provenance | If display is required in this slice, implement ledger-projected catalog provenance; otherwise document Viewer display as a deferred follow-up |
| Planning and creation schemas drift | Keep schema constants in one domain module and test planning output against creation input validation |
| Eval requirement becomes unverifiable because the old harness is absent | Treat eval harness discovery/restoration as a required EL5 implementation task, not optional polish |
| Source manifest ranges go stale | Range resolver validates document hashes before use and fails with a deterministic diagnostic |

## Acceptance And Exit Criteria

- EL5 accepts `CONFIRMED_LIBRARY`, `VOCABULARY_LEXICON`, and `SOURCE_OF_TRUTH_DOCS` and refuses unconfirmed bundles.
- Every published card fills an existing confirmed stub on a confirmed shelf.
- Published names resolve to lexicon `prefLabel`; no off-lexicon names are minted.
- No new category, shelf, or markdown card is created for a missing concept.
- Missing shelf and/or missing lexicon produces a gap-report entry with source refs.
- Publishing appends to the confirmed stub and preserves frontmatter, wikilinks, and placement.
- Each published card has one `atomic_card.created` event with the correct agent actor, confirmation event id, and source refs.
- A coverage audit reports fills, covered existing concepts, gaps, deferrals/rejections, and shelf-misplacement findings.
- The build loop still drafts, validates, grades, revises, bails, exhausts, and publishes as before under the new contract.
- Planning and creation schemas stay in lockstep.
- Deterministic AX tests, plugin validation, Studio checks, and EL5 eval reruns pass.

## Deferred Follow-ups

- Viewer projection of Ledger-backed card provenance if not needed for the first CLI/runtime acceptance pass.
- Live atomization progress UI and partial-run recovery.
- EL6 living updates.
- Alexandria dogfood library population as its own approved run/change set.
- Any expansion of the lexicon format beyond the worked markdown vocabulary format.
- `atomic_card.updated` semantics for future card refreshes.
