# Issue #545: Raven Front-of-House Opener Contract

Issue reference: GitHub issue `GetAlexandria/alexandria-internal#545`,
"Raven's Front-of-House opener: plain-language product map, one decision per
turn, no internal vocabulary".

Goal: update the shipped `front-of-house-walk` skill so Raven's first
director-facing turn is a plain-language product map only, every subsequent turn
asks for one decision, drift reconciliation happens only after the base map is
confirmed, and director-facing language avoids internal runtime vocabulary.

Linked product plan: no separate product-level plan was linked in the issue
body. The binding product contract is the issue text provided in the planning
request. Related historical input plans reviewed:
`docs/alexandria/plans/front-of-house-walk-reshape/plan.md`,
`docs/alexandria/plans/front-of-house-walk-reshape/walk-spec.md`,
`docs/alexandria/plans/front-of-house-walk-reshape/issue-slice-c-headline.md`,
and
`docs/alexandria/plans/front-of-house-walk-reshape/issue-slice-c2-headline-prompt.md`.
Those older plans describe the previous Turn 0 shape; this issue supersedes the
parts that bundled product map, drift, and search-frame confirmation into one
opener.

Planning note: `gh` is not installed in this environment, so issue comments
could not be fetched with `gh issue view 545 --comments`. The plan is grounded
in the complete issue body included in the request plus the local repository
guidance and existing Front-of-House plans.

## Scope

This slice changes the shipped Front-of-House skill contract and the existing
Front-of-House structural eval cases.

In scope:

1. Amend
   `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`,
   preferably by refining the existing movements rather than restructuring the
   skill.
2. Add an explicit director-facing turn discipline section that applies to the
   opener, drift reconciliation, section comprehension, and held-back problems.
3. Replace the current `### Headline Opener` contract with an opener that is:
   a one-breath product story, then one plain one-line gloss per major piece
   built from card `prefLabel` and usable `WHAT` text, then exactly one closing
   question asking whether the big picture feels right.
4. State that the opener happens before any section read, drift
   reconciliation, search-frame confirmation, or held-back problem material.
5. State the one-decision-per-turn rule: drift reconciliation, search-frame
   confirmation, section reads, section closes, and held-back rulings each get
   their own turns; no director-facing turn ends with two questions.
6. State that drift reconciliation is strictly sequenced after the base product
   map is confirmed.
7. Ban internal vocabulary from director-facing turns and name the banned words:
   `keystone`, `container`, `thread`, `agenda item`, `drift`, `EL2`, `EL3`,
   `bundle`, and frontmatter/runtime field names.
8. Add the honest-attribution and propose-don't-puzzle rule for machine-made
   inconsistencies: Raven says the scan used two words for the same thing,
   leads with her best mapping, and asks for confirmation rather than presenting
   the mismatch as an open mystery.
9. Make the negative cases explicit: a turn that combines the map with a
   section question, combines the map with drift/search-frame reconciliation, or
   ends with two questions violates the skill.
10. Extend the existing Front-of-House eval case family under
    `packages/ax/tests/eval-cases/front-of-house-walk/` so the structural runner
    checks the new opener contract and at least one separate drift-turn contract.

## Non-Goals

1. Do not change Front-of-House agenda, gate, answer-banking, or frame-gate
   mechanics. Related issue #544 owns the opener's banked gate; this issue owns
   only how Raven speaks.
2. Do not change `for-raven.md`, `current-item.md`, `agenda.json`, or the
   deterministic headline projection shape.
3. Do not change AX CLI behavior, exit codes, or runtime artifact schemas.
4. Do not change Viewer behavior.
5. Do not change `plan_bundle_patch.md` unless implementation discovers a
   direct inconsistency with the renamed skill contract; patch mechanics are
   otherwise out of scope.
6. Do not write to `docs/alexandria/library/`.
7. Do not rewrite card bodies, the product thesis body, or any EL5 body-writing
   contract.

## Current Gap

`packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` already has a
`### Headline Opener` movement, but it reflects the older C2 plan. It tells
Raven to read `## Product Containers`, speak in terms of `### Keystone Thesis`,
`### Container Set`, and `### Keystone Drift`, and fold the staged frame-origin
search-frame confirmation into the same turn.

That current contract violates issue #545 in four ways:

1. The opener is not "the product map and nothing else"; it can include
   uncertainty reconciliation and search-frame confirmation.
2. The opener can ask for a combined ruling: canonical piece set, merges,
   renames, and search frame in one answer.
3. The director-facing wording is permitted to mirror runtime artifact language
   such as keystone, containers, drift, and thread.
4. The skill's human-terms rule currently applies strongly to section
   comprehension, but no equivalent global language rule applies to every
   director-facing turn.

The existing structural eval case
`packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json`
also asserts the old contract by requiring strings such as
`### Keystone Thesis`, `### Container Set`, `### Keystone Drift`, and
`search-frame`. That case must be updated so it protects the new issue #545
contract instead of the superseded opener.

## Architectural Boundaries

The shipped plugin owns Raven's guided play behavior. The implementation belongs
in `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`; it should
not migrate the behavior into AX, Viewer, docs-library artifacts, or workflow
graph changes.

AX owns deterministic artifacts and the structural eval runner. For this slice,
AX changes are limited to eval fixture/config changes under
`packages/ax/tests/eval-cases/front-of-house-walk/`. There is no CLI behavior
change, so black-box CLI tests are not required.

The skill may still mention internal field names as source-reading instructions
to Raven, for example `prefLabel`, `WHAT`, `origin`, `kind`, or
`placementState`. The ban applies to director-facing turns, examples, and
spoken templates. Do not add global `notContains` checks that would make the
skill unable to document its internal source-reading contract.

Keep the Connection Safeguard, `record-turn`, `ax raven answer`, and
`confirm-section` mechanics intact. The `record-turn` command still happens
before Raven presents any opener, drift, section, or held-back turn.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Front-of-House shipped skill | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | Adds a global director-facing turn discipline and rewrites the opener contract as a plain-language product map only. Drift/search-frame/section material is sequenced into later one-decision turns. |
| Front-of-House opener eval | `packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json` | Stops asserting the old keystone/container/drift/search-frame bundle. Asserts the new one-breath story, per-piece plain glosses, exactly one map question, source usage, and negative cases. |
| Front-of-House drift eval | New or extended config under `packages/ax/tests/eval-cases/front-of-house-walk/`, preferably a sibling such as `drift-reconciliation-contract/config.json` if it keeps the checks readable | Exercises at least one separate drift reconciliation turn in the existing play eval family. Asserts post-map sequencing, honest attribution, proposed mapping, one decision, and no puzzle framing. |
| Existing section eval | `packages/ax/tests/eval-cases/front-of-house-walk/section-comprehension-contract/config.json` | Update only if the skill wording moved enough to require new substrings. Preserve section-comprehension coverage for `prefLabel`/`WHAT`, item-gated answers, and held-back problems. |
| Plan artifact | `docs/alexandria/plans/545-raven-front-of-house-opener/plan.md` | Technical implementation handoff for this issue. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Raven Front-of-House opener | The first director-facing turn becomes a plain product map: one-breath story, named pieces with one-line plain glosses, one closing map question. It does not mention sections, drift, search frame, gates, or internal artifact vocabulary. | Update the opener structural eval and run plugin validation. |
| Raven turn discipline | Every director-facing turn has one decision. Drift reconciliation comes after map confirmation. Section reads, section closes, search-frame confirmations, and held-back rulings are separate turns. | Add structural eval coverage for negative cases and a separate drift turn. |
| Raven language boundary | The human-terms rule expands from section turns to all director-facing turns. The skill names banned internal vocabulary and field names for spoken output. | Ensure director-facing examples in `SKILL.md` avoid the banned terms except when listed as forbidden vocabulary. |
| Machine-made inconsistency handling | Raven attributes inconsistencies to the scan or generated draft, proposes her best mapping, and asks the director to confirm one decision. | Add structural eval checks for phrasing such as "the scan used two words for the same thing" and a proposed merge/rename confirmation. |
| Eval harness | No new harness. Use the existing structural eval runner rooted at `packages/ax/tests/eval-cases`. | Run `pnpm eval -- run front-of-house-walk/all`. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Front-of-House structural evals | `pnpm eval -- run front-of-house-walk/all` | Runs the existing structural substitute against the opener, section, and new/extended drift contract checks. |
| Eval target discovery | `pnpm eval -- list` | Confirms the front-of-house eval cases are registered if a new sibling case is added. |
| Plugin package validation | `claude plugin validate ./packages/alexandria-plugin` | Required by plugin package guidance for shipped skill prose changes. |
| Markdown lint | `pnpm run lint:markdown` | Covers the changed plan and `SKILL.md`. |
| Eval JSON formatting | `pnpm --filter @alexandria/ax run format:check` | Covers changed JSON eval configs under `packages/ax/tests/eval-cases`. |

No Viewer validation is required. No AX typecheck or black-box CLI test is
required unless implementation broadens into TypeScript, CLI behavior, or
runtime artifact generation.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Front-of-House opener | Existing structural case `front-of-house-walk/headline-opener-contract` covers the old headline contract. | Update it to assert the issue #545 opener contract: product map only, one-breath story, per-piece plain glosses from `prefLabel`/`WHAT`, exactly one closing question, and negative cases for map-plus-section/map-plus-drift/two-question turns. | `pnpm eval -- run front-of-house-walk/headline-opener-contract` |
| Front-of-House drift reconciliation | No dedicated structural check for a separate drift turn. | Add a sibling case under the existing `front-of-house-walk` eval family or extend the opener case with a clearly named drift check. It must assert drift comes after map confirmation, uses honest attribution, proposes a best mapping, and asks one confirmation question. | Preferred target after adding the case: `pnpm eval -- run front-of-house-walk/all` |
| Section comprehension | Existing structural case covers human section reads, `prefLabel`/`WHAT`, item-gated answers, and held-back problems. | Keep coverage passing. Update only if wording moves. | `pnpm eval -- run front-of-house-walk/section-comprehension-contract` |
| Full adaptive Raven evals | The current checkout's `pnpm eval` runner is the structural substitute in `packages/ax/src/tools/el5-eval.ts`, not a live multi-turn transcript harness. | Do not invent a new harness in this slice. If the live harness is restored before implementation merges, add or run an adaptive Front-of-House case with opener confirmation followed by a separate drift confirmation. | Conditional follow-up, not a merge blocker for the current structural runner. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The skill still leaks internal words because it must describe internal source fields to Raven. | Put the ban in a director-facing language section and distinguish "source-reading words Raven may use internally" from "spoken words Raven must not say." Do not use global eval `notContains` for fields that must appear in instructions. |
| The opener becomes too vague and loses the useful product structure from `for-raven.md`. | Tell Raven to use `for-raven.md` and card files as source, but translate into a one-breath story plus named pieces with one-line glosses grounded in card `prefLabel`s and usable `WHAT` text. If detail is missing, say that plainly without using runtime labels. |
| Drift reconciliation gets skipped after the product map is confirmed. | Add a dedicated drift-reconciliation movement or subsection that says drift is the next separate decision after map confirmation when machine-made inconsistencies are present. Cover it in the structural eval. |
| Raven presents machine inconsistencies as the director's puzzle. | Require honest attribution and proposal-first language: "the scan used two words for what looks like the same thing; I think X should map to Y; confirm that merge?" |
| The existing frame-origin gate mechanics tempt the opener to include search-frame confirmation again. | State that search-frame confirmation is not part of the opener. Keep gate mechanics untouched and rely on #544 or the next appropriate wake/turn for the banked frame decision. |
| A single sentence with "or" can become two decisions disguised as one question. | Define "one question" as one decision and one question mark. The approved shape may offer "right as the big picture, or reshape before sections" because both options answer the same map decision; do not add a second section, drift, or frame question. |
| Structural evals prove text presence but not live conversational quality. | Strengthen structural checks with positive contract text, explicit negative cases, and director-facing examples. Record adaptive live eval as a deferred follow-up if the full harness returns. |
| The plan accidentally expands into CLI/runtime work. | Keep the touch map limited to `SKILL.md` and eval configs. Any runtime/gate issue discovered during implementation should be filed or routed to #544 rather than solved here. |

## Implementation Steps

1. In `SKILL.md`, add a short global section before the movement-specific
   subsections, for example `### Director-Facing Turn Discipline`.
2. In that section, define:
   - one turn, one decision;
   - no director-facing turn ends with two questions;
   - opener first, then drift/search-frame/sections only after the base map is
     confirmed;
   - banned internal vocabulary for spoken output;
   - honest-attribution/propose-don't-puzzle handling for machine-made
     inconsistencies.
3. Rewrite `### Headline Opener` so the first frame-origin wake produces only
   the map check:
   - use `for-raven.md`, `current-item.md`, and card files as source material;
   - build the one-breath story from the product's own names and usable
     `WHAT` text;
   - list each major piece with a one-line plain gloss;
   - end with exactly one question asking whether the big picture feels right
     before moving section by section;
   - do not include drift reconciliation, search-frame confirmation, section
     read, or held-back problem material.
4. Replace the old internal-heading instructions in the opener. The skill may
   still tell Raven where to read `## Product Containers`, but it should say
   not to echo headings such as `Keystone Thesis`, `Container Set`, or
   `Keystone Drift` to the director.
5. Add a separate drift reconciliation subsection or clearly scoped paragraph
   after the opener contract. It should say to use it only after the product map
   is confirmed and to handle one inconsistency at a time with a proposed
   mapping.
6. Remove or revise the current instruction that folds the staged frame-origin
   item/search-frame confirmation into the opener. The new wording should route
   search-frame confirmation to its own later turn or to #544's banked gate
   mechanics without changing the answer loop here.
7. Keep existing `record-turn`, `ax raven answer`, `confirm-section`,
   Connection Safeguard, Section Comprehension, Held-Back Problems, Completion,
   and Never mechanics intact except where they need references to the new
   global turn discipline.
8. Update `headline-opener-contract/config.json`:
   - revise its description for the plain-language product map;
   - remove required substrings that encode the old spoken contract;
   - require substrings for one-breath story, per-piece one-liners,
     `prefLabel`, usable `WHAT`, exactly one closing question, and negative
     cases.
9. Add or extend a Front-of-House eval config for drift reconciliation:
   - require post-map sequencing;
   - require honest attribution to scan/generated draft inconsistency;
   - require proposal-first mapping;
   - require one decision and one closing question;
   - require that the mismatch is not presented as an open mystery.
10. Run the deterministic verification commands. If any implementation file
    beyond `SKILL.md` and eval configs changes, reassess whether AX tests,
    typecheck, or plugin workflow validation need to expand.

## Acceptance / Exit Criteria

1. `SKILL.md` specifies the opener as a plain-language product map and nothing
   else: one-breath story, per-piece one-line glosses from card `prefLabel`s and
   usable `WHAT` text, and exactly one closing big-picture question.
2. `SKILL.md` states the one-decision-per-turn rule and sequences drift
   reconciliation strictly after the map is confirmed.
3. Director-facing turns ban the named internal vocabulary:
   `keystone`, `container`, `thread`, `agenda item`, `drift`, `EL2`, `EL3`,
   `bundle`, and frontmatter/runtime field names.
4. `SKILL.md` includes the honest-attribution/propose-don't-puzzle rule for
   machine-made inconsistencies.
5. The negative case is explicit: a turn that combines the map with a section
   question, combines the map with drift/search-frame confirmation, or ends with
   two questions violates the skill.
6. Existing answer-loop and connection-safeguard mechanics are unchanged.
7. Existing play eval coverage is extended under
   `packages/ax/tests/eval-cases/front-of-house-walk/` to cover the opener and at
   least one separate drift turn. No new harness is introduced.
8. `pnpm eval -- run front-of-house-walk/all` passes.
9. `claude plugin validate ./packages/alexandria-plugin` passes.
10. Markdown lint passes for the changed plan and skill prose.

## Deferred Follow-Ups

1. Issue #544: banked opener/frame gate mechanics. This issue deliberately does
   not change runtime gate behavior.
2. If the full live eval harness returns, add an adaptive Front-of-House eval
   that has the director confirm the opener, then answer a separate drift
   reconciliation turn, then proceed to a section read.
3. Consider adding a small reusable style checklist for director-facing Raven
   turns if future Front-of-House issues repeat the same internal-vocabulary
   leakage outside this skill.
