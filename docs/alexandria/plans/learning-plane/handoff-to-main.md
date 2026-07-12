# Handoff: `flight/learning-plane` → main

The integration branch carried the learning-plane wave while main modernized
underneath it. As of the sync merge (this branch's tip), the branch is
**current main plus the wave** — the diff against main is exactly the
innovations, already reconciled and verified against the live surface.
This document is the review map. A companion explainer —
`learning-plane-explainer.html`, alongside this file — tells the plane's
story from the product-manager's seat (open it in a browser); the same
story as slides: `learning-plane-explainer.pptx`.

## What the branch adds (per-flight ledger)

Machinery — each was an independently reviewed, tested PR into this branch:

- **#698 [F2a]** Experiment and Measure registered as first-class card types.
- **#701 [F1]** WHY joins the required fill sections. On main's corpus this
  opens a 49-card WHY burndown (see Open items).
- **#700 [F3]** Altitude ranking completed; unknown altitude words warn.
- **#712 [F2b]** Learning-card vitals parse (Experiment kind/grade/state/
  expected/arc/role/verdict + stop/guardrails tag-note lists; Research
  kind/origin/grade; Measure target/trend); WHEN required for every
  `plane: learning` card. *Its v2 identity fallback was superseded by main's
  #734/#735 and removed at the sync merge.*
- **#713 [F2b-fix]** The hand-rolled frontmatter parser handles YAML block
  scalars (`>-`, `|`, chomping variants).
- **#714 [F2c]** Card drawer renders the vitals (Bet-risks presentation
  precedent).
- **#715 [F2d]** Engine view gains a plane switcher; type filters derive from
  the selected plane.
- **#718 [LP-W4a]** Arc registered as the fourteenth card type.
- **#719 [LP-W1]** WHY and WHEN are first-class story buckets end-to-end
  (was: folded into `how` and truncated). Bucket cap raised 2,400 → 6,000
  in #721 — a 19-member lead narration cannot exist under the old cap.
- **#728 [LP-W5a]** Story links render the author's pipe alias; bare links
  keep the card title.

Content — the learning plane itself:

- **#699/#702/#703/#705 [L1–L4]** keystone skeleton + research (20),
  measurement (5), experiments (7) shelves. (L1 was already on main.)
- **#711 [4c]** Concept→Entity applied (main did this independently as #724;
  the two agreed at the sync merge). #717 renamed the learning keystone to
  match.
- **#721 [LP-W3]** The research lead narrates all 19 members; the #625
  no-orphans lead-coverage gate runs bundle-wide.
- **#722 [LP-W4b]** The arcs shelf: release stories told atomically, 2 arcs
  + lead, contract amended (`arcs/Arc/`, type Arc).
- **#723 [LP-W2]** Keystone rewrite: WHY added, HOW narrates and links all
  four shelves.
- **#729 [LP-W5b]** Noun-in-sentence pass: all 35 standalone chip-links
  woven into sentences; link cardinality preserved exactly.
- **#730/#733** Knowledge-organization planes/contexts cards (director-
  authored).

## Sync-merge resolution policy (the last commit before this file)

Main's doctrine won wherever both lines solved the same problem: path-first
identity + mismatch linting (#734), frontmatter-v2 strip + `evidence:`
(#735), unstated confidence → `"low"`, threads from the ledger with sidecars
retired (#720/#731). The branch's behavior won where it is the innovation:
vitals, WHEN-for-learning, four story buckets, altitude warnings, the Arc
type, and all content. Conflicted card files took main's frontmatter shape
with the branch's newer bodies. Goldens re-pinned to the merged bundle:
**171 cards, zero metadataIssues, 54 derived threads** (composition below).
One main-side test-helper fix: WHY joined the authored-thread
`missingSections` allowlist, matching the production canon.

## Decisions that deserve reviewer eyes

1. `STORY_BUCKET_MAX_CHARS` 2,400 → 6,000 (#721) — forced by lead-coverage
   arithmetic; lint and renderer read the same story.
2. Arc as a first-class type (director-ruled 2026-07-08), placed after
   `measure`, categories renumbered.
3. WHY-gate scope: F1 intentionally opens a 49-card missing-material
   burndown on the product/strategy corpus (the A3 WHY-fill work).
4. The removed v2 fallback: #712's gated identity fallback is gone in favor
   of #734/#735; the F2b tests now assert main's `confidence: "low"`
   default.

## Open items (known, flagged, not blockers)

- 5 derived missing-card threads: the plane-concept cards (#730/#733) use
  bare context wikilinks (`[[triggers]]`, `[[centralization]]`, …) that
  don't resolve; they want the piped-lead treatment (`[[<lead card>|<noun>]]`,
  the LP-W5 idiom). The Product keystone's bare `[[triggers]]` has the same
  latent issue.
- The 49-card WHY burndown (A3) is real open work the gate now tracks.
- Engine view still renders the legacy light palette inside the dark chrome
  (#659, pre-existing).

## Landing guidance

The PR can land as a single merge (per-flight merge commits preserved for
first-parent review), or serve as the checklist for re-landing in your own
sequence — every flight above is an already-merged PR on this branch with
its own body, test plan, and judgment-call notes. CI runs in full on the PR
to main; the branch itself ran the targeted local gates per flight plus
continuous verification against the live viewer (`ax start viewer` off this
branch).
