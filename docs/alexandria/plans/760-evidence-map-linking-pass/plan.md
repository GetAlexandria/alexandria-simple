# Issue 760 Technical Plan: Evidence-Map Linking Pass

## Header

Issue reference: GitHub #760, "Evidence-map linking pass: wire tested-by across planes;
both keystones gain the golden-metric proof clause".

Goal: close the deferred evidence channel between Strategy and Learning with a reviewable
map-first content pass, then apply only prose wikilinks that the map grounds. After the
implementation pass, every Bet card either names the Experiment, Measure, or Research card
that instruments it, or has a declined row explaining why no honest tie exists; both
strategy and learning keystones carry the D10 proof clause in `## WHAT` with a resolving
`[[Measure - Fair-Market Value Delivered]]` wikilink.

Linked product-plan inputs:

- GitHub #760 issue body and its single comment, which only points at Fabro run
  `01KX43D0SQZCRAWWN2NZFVC5EN`.
- `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md`, especially mechanism
  decisions, Product cards to WHY sources, and loose end 3.
- `docs/alexandria/plans/strategy-plane-rebuild/design-log.md`, especially the three
  `Tested-by` slices for environment, colleagues, and centralization.
- `docs/alexandria/plans/learning-plane/design-log.md`, especially the evidence-channel
  ruling, D10 keystone proof clause, the elicitation walk results, and "Future - the golden
  metric, banked".
- `docs/alexandria/plans/learning-plane/elicitation-results.md`, especially the standing
  Measures and per-bet instrument notes.
- `docs/alexandria/plans/learning-plane/card-contract.md`, especially prose wikilinks,
  Measure/Experiment contracts, biography-WHEN, and the no-structured-socket posture.
- `docs/alexandria/plans/learning-plane/handoff-to-main.md`, which confirms the learning
  cards, the #729 noun-in-sentence link idiom, and the zero-metadata-issue catalog baseline
  after the learning-plane flight.

## Scope

This slice lands:

- New source-of-truth map: `docs/alexandria/plans/learning-plane/evidence-map.md`.
- Prose wikilinks in the 21 Bet cards under:
  - `docs/alexandria/library/colleagues/Bet/`
  - `docs/alexandria/library/centralization/Bet/`
  - `docs/alexandria/library/environment/Bet/`
- D10 proof-clause audit/update in:
  - `docs/alexandria/library/_index/Entity - Strategy.md`
  - `docs/alexandria/library/_index/Entity - Learning.md`
- Cross-plane WHY/WHERE prose-link updates on existing learning cards only where the map
  grounds the tie from the card's own body. Candidate areas are
  `docs/alexandria/library/research/`, `docs/alexandria/library/experiments/`,
  `docs/alexandria/library/measurement/`, and, if grounded, `docs/alexandria/library/arcs/`.
- Noun-in-sentence wikilinks with pipe aliases where helpful, matching the #661/#729 idiom.

The map is part of the deliverable, not scratch. The map is written first, reviewed against
the sources, and then used as the only allowed apply-pass inventory.

## Non-Goals

- No app code, loader, catalog, lint, viewer, CLI, plugin, or eval-harness changes.
- No new card types, cards, shelves, arcs, fields, or validation rules.
- No structured `tests`, `informs`, `embodied_by`, or `embodied-by` frontmatter sockets.
- No edits to frontmatter `links:` unless implementation discovers an existing malformed
  value unrelated to this pass; this work is prose-link only.
- No broad rewrite of Bet bodies, Learning bodies, or keystone architecture beyond the
  evidence/proof clauses this issue names.
- No ledger edits. If implementation uses `ax` for inspection, it must not append events.
- No freehand updates outside the listed card files and the new map.

## Current Gap

`docs/alexandria/plans/learning-plane/evidence-map.md` does not exist. The strategy
embodiment map deliberately left loose end 3 open: product WHY sections cite Bets, but the
tested-by channel into Learning was unwired until Learning cards existed.

The Learning plane now exists in the live library:

- 5 Measure cards, including `Measure - Fair-Market Value Delivered` as the golden metric.
- 7 Experiment cards, including the ten-director pilot and the visual/centralization probes.
- 20 Research cards, including founding lessons and early internal results.

Several learning cards already point toward Bets, and some Bet cards mention instrument
concepts in prose, but there is no reviewable source that says which instrument links
belong on which Bet. The result is asymmetric: Learning often knows what it tests, while
the Bet cards do not name their instruments.

`docs/alexandria/library/_index/Entity - Strategy.md` currently lacks a golden-metric proof
clause in `## WHAT`. `docs/alexandria/library/_index/Entity - Learning.md` already contains
a resolving `[[Measure - Fair-Market Value Delivered]]` proof clause in `## WHAT`; the
implementation should still audit it against D10 and keep or minimally tune it so both
keystones satisfy the same rule.

## Architectural Boundaries

- The library body is the graph surface for this pass. The catalog derives cross-plane
  edges from raw-body `[[wikilinks]]`; frontmatter `links:` serves diagram/parity behavior
  and stays out of scope.
- The map follows the embodiment-map discipline: writers may decline a tie they cannot
  ground in the card's own body, but may not invent a tie not listed in the map. If a tie
  is dropped during apply, update the map row with the reason instead of silently diverging.
- D10 proof belongs in keystone `## WHAT`. Do not add a proof-only `## WHY` to Strategy, and
  do not count any existing WHY prose as satisfying the proof-clause acceptance criterion.
- Bet evidence links should live in `## HOW` when they describe the mechanism that tests or
  watches the wager; use `## WHERE` only when the sentence is about the Bet's position in
  the cross-plane graph.
- Learning-card cross-plane ties should be added only where the card already makes the tie
  legible. A Research card may inform a Bet; an Experiment may test a Bet and run in product;
  a Measure may watch a Bet. Do not turn every Learning card into a strategy index.
- This plan explicitly owns the listed library content pass despite the usual "do not
  freehand-edit `docs/alexandria/library`" default. The ownership is narrow: card files
  touched only to apply evidence-map rows.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Evidence map | `docs/alexandria/plans/learning-plane/evidence-map.md` | New single source for tested-by and grounded learning cross-plane ties; same discipline as `embodiment-map.md`. |
| Strategy Bet cards | 21 files in `colleagues/Bet`, `centralization/Bet`, `environment/Bet` | Bet bodies gain resolving prose wikilinks to their instruments, or the map records a declined tie. |
| Strategy keystone | `docs/alexandria/library/_index/Entity - Strategy.md` | `## WHAT` gains the D10 proof clause citing `[[Measure - Fair-Market Value Delivered]]`. |
| Learning keystone | `docs/alexandria/library/_index/Entity - Learning.md` | Existing proof clause is verified or minimally aligned so it remains in `## WHAT` and cites the golden metric. |
| Learning evidence cards | Existing Research, Experiment, Measure, and possibly Arc cards named by the map | Cross-plane WHY/WHERE prose links are folded in where grounded; no new cards or fields. |
| Validation baseline | Existing catalog/story/machine-language tools | No behavior change; the implementation must keep all content gates green. |

## Map Shape

Create `evidence-map.md` before card edits. It should mirror
`strategy-plane-rebuild/embodiment-map.md` in tone and discipline:

1. Start with a short purpose paragraph naming this as the deferred tested-by pass.
2. Add mechanism decisions:
   - prose wikilinks only;
   - no structured sockets;
   - map rows are the only allowed apply inventory;
   - links must resolve by card stem;
   - noun-in-sentence links with pipe aliases are preferred over standalone chips.
3. Add a "Bets -> Learning instruments" section with rows keyed by Bet card stem, with
   columns: card stem, instruments to link, placement, grounding, decline/residual.
4. Add a "Learning cards -> strategy/product WHY ties" section with rows keyed by learning
   card stem where a card needs a cross-plane WHY/WHERE edit, with columns: card stem,
   cross-plane tie to add or verify, placement, grounding, decline/residual.
5. Add a "Keystone proof clauses" section for `Entity - Strategy` and `Entity - Learning`.
6. Add "Declines / residual gaps" for honest non-links and follow-up socket work.

The map must cover all 21 Bet stems, even if a row declines a tie. The expected source
families are:

- Colleagues shelf: golden metric / needed-but-undone measures, ten-director pilot,
  named-colleague-vs-invisible-AI probe, and the live-meeting Research result where grounded.
- Centralization shelf: switching/consolidation measure, grown-colleague-vs-off-the-shelf
  probe, ten-director pilot as the mechanism check where grounded, and substrate/library
  Research where the card already leans on it.
- Environment shelf: adoption/substitution measure, visual attribution experiment,
  spatial-surface and map-finding probes, and system-builder/tools-for-thought Research
  where the card already leans on it.

If any row is judgment-heavy, stop after the map stage and open or request a draft PR for
director review before applying card edits.

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Alexandria plugin agents/skills | None. This is a content-only library wiring pass. | No plugin validation or eval rerun required. |
| AX CLI behavior | None. Existing catalog/story tools should keep passing. | No CLI black-box tests required because commands, flags, outputs, and exit codes do not change. |
| Viewer behavior | No code behavior change. Existing graph/catalog views will see more prose-derived edges. | No viewer unit/build/browser validation required beyond content catalog gates. |
| Maintainer workflow | New map artifact guides future writers. | No skill changes required. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Machine-language hygiene | `node studio/tools/check-machine-language.mjs docs/alexandria/library` | Confirms edited card bodies stay prose-only and de-machined. |
| Story lint | `bun packages/ax/src/tools/library-catalog-story-lint.ts --project-root . --library-root docs/alexandria/library` | Runs no-orphans and diagram-parity story rules on the live library. |
| Metadata issues | `bun studio/tools/check-library-identity.mjs` | Uses the shipped catalog builder and requires zero `metadataIssues` for the real library. |
| Bet instrument coverage | `rg --files-without-match "\\[\\[(Experiment|Measure|Research) -" docs/alexandria/library/colleagues/Bet docs/alexandria/library/centralization/Bet docs/alexandria/library/environment/Bet` | Should return no files unless every returned Bet has an explicit declined-with-reason row in `evidence-map.md`. |
| Keystone proof links | `rg -n "\\[\\[Measure - Fair-Market Value Delivered" 'docs/alexandria/library/_index/Entity - Strategy.md' 'docs/alexandria/library/_index/Entity - Learning.md'` | Proves both keystone `## WHAT` sections cite the resolving golden metric. |
| No structured sockets | `rg -n "^(tests|informs|embodied_by|embodied-by):|^  (tests|informs|embodied_by|embodied-by):" docs/alexandria/library docs/alexandria/plans/learning-plane/evidence-map.md` | Should return no matches; this pass is prose-link only. |
| Markdown | `pnpm run lint:markdown` | Required because the pass edits Markdown plan and card files. |

For dangling body wikilinks (missing-card threads, which the metadata-issues row above does
not cover), use the shipped catalog thread projection. The implementation can run this
one-off assertion without adding a new tool:

```bash
bun -e 'import fs from "node:fs"; import path from "node:path"; import { buildLibraryCatalog, PRODUCT_CARD_SCHEMA_VERSION } from "./packages/ax/src/domain/library-catalog.ts"; import { LIBRARY_GRAPH_SKIP_FILES } from "./packages/ax/src/domain/library-graph.ts"; const root=path.resolve("docs/alexandria/library"); function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{const p=path.join(dir,entry.name); if(entry.isDirectory()) return files(p); if(entry.isFile()&&entry.name.endsWith(".md")&&!entry.name.startsWith(".")&&!LIBRARY_GRAPH_SKIP_FILES.has(entry.name)) return [{path:p,content:fs.readFileSync(p,"utf8")}]; return [];});} const catalog=buildLibraryCatalog({catalogSchema:PRODUCT_CARD_SCHEMA_VERSION,files:files(root),libraryRoot:root}); const missing=(catalog.threads??[]).filter((thread)=>thread.source==="derived"&&thread.kind==="missing_card"); if(missing.length>0){ console.error(JSON.stringify({missingCards:missing.map((thread)=>thread.reason)},null,2)); process.exit(1); }'
```

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| Library content graph | Deterministic catalog/story/machine-language checks cover this content slice. | No eval-harness coverage required. | Use the verification commands above. |
| Alexandria plugin skills/workflows | Not touched. | No eval rerun. | None. |
| AX CLI | No CLI behavior changes. | No black-box CLI test or eval required. | None. |
| Viewer | No viewer code behavior changes. | No viewer eval/browser rerun required for this slice. | None. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Evidence links become invented attribution rather than grounded evidence. | Map every tie first with a source/grounding column; allow decline rows; prohibit apply-pass links not listed in the map. |
| Bet rows over-link to every Learning card on a shelf, turning the graph into noise. | Prefer the smallest instrument set that actually tests or watches the Bet; use shelf-level measures/probes only when the Bet body supports the relationship. |
| The golden metric proof lands in HOW or WHY instead of the keystone WHAT. | Acceptance explicitly checks the `## WHAT` clause in both keystones; Strategy should not gain a new proof-only WHY section. |
| Structured sockets sneak in because the old design vocabulary says `tested-by`. | Verification searches for `tests`, `informs`, and `embodied_by` frontmatter; the map and card edits use prose wikilinks only. |
| Existing Learning links already point at Bets, and the apply pass duplicates them awkwardly. | The map distinguishes add vs verify. If the card already carries the right tie in the right section, record it as verified rather than rewriting. |
| Pipe aliases or wrapped wikilinks create dangling targets. | Link to exact stems, keep wikilinks on one line, and run the missing-card thread assertion after edits. |
| The implementation stage widens into Learning-plane content design. | No new cards, no new instruments, no new claims. Uncarded or ungrounded needs go into residual gaps in the map. |

## Implementation Steps

1. Re-read the issue body and the linked source artifacts named in this plan. Confirm the
   live card inventory still has 21 Bet cards, 5 Measure cards, 7 Experiment cards, and the
   current learning keystone path `docs/alexandria/library/_index/Entity - Learning.md`.
2. Author `docs/alexandria/plans/learning-plane/evidence-map.md` only. Use the map shape
   above. Cover all 21 Bet stems and both keystone stems. Add learning-card rows only where
   an actual cross-plane WHY/WHERE edit is needed or verified.
3. Review the map against `strategy-plane-rebuild/design-log.md` tested-by slices and
   `learning-plane/elicitation-results.md` standing Measures. If any row depends on
   judgment beyond the source text and the card's own body, pause for director review before
   applying card edits.
4. Apply Bet-card edits from the map:
   add one or more prose wikilinks to Experiment, Measure, or Research cards in `## HOW` or
   `## WHERE`; preserve existing voice and avoid listy link chips.
5. Apply keystone edits:
   add the Strategy proof clause in `## WHAT`; verify the Learning proof clause remains in
   `## WHAT`; both clauses must cite `[[Measure - Fair-Market Value Delivered]]` with a
   readable sentence-level alias if useful.
6. Apply learning-card edits from the map:
   fold in cross-plane WHY/WHERE ties only where the card's own body grounds them. If an
   intended tie is not grounded on reread, update the map row to decline it instead of
   forcing the link.
7. Re-run the deterministic verification matrix. Fix only in-scope content failures.
8. Final implementation diff should contain only the new map plus the card files explicitly
   named by map rows.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/learning-plane/evidence-map.md` exists and follows the
   embodiment-map discipline: rows keyed by card stem, source-grounded, and treated as the
   single source for the apply pass.
2. Every one of the 21 Bet cards has at least one resolving prose wikilink to a Learning
   instrument, or its map row records a clear declined-with-reason residual.
3. The three corporate Bet clusters follow the design-log instrument model:
   colleagues/golden metric plus needed-but-undone, centralization/switching plus
   head-to-head quality, and environment/adoption plus attribution.
4. `Entity - Strategy` and `Entity - Learning` both carry a D10 proof clause in `## WHAT`
   with a resolving `[[Measure - Fair-Market Value Delivered]]` wikilink.
5. Learning-card cross-plane WHY/WHERE ties listed in the map are either applied or recorded
   as verified/declined; no unlisted ties are added during apply.
6. No `tests`, `informs`, `embodied_by`, or `embodied-by` structured frontmatter is added.
7. Machine-language, story lint, metadata issue, markdown, and missing-card checks pass.
8. The final diff does not touch app code, loader/lint code, plugin files, viewer files, or
   unrelated library cards.

## Deferred Follow-Ups

1. Structured evidence sockets (`tests`, `informs`, and any down-socket equivalent) as a
   separate factory issue after the prose graph proves the need on real cards.
2. Viewer or catalog affordances for reading tested-by/informs edges as typed edges rather
   than general prose-derived wikilinks.
3. Additional Learning cards if the evidence map records ungrounded or uncarded instruments.
4. Library-wide biography-WHEN reactivation and any broader keystone WHY/WHEN editorial
   cleanup outside this evidence pass.
