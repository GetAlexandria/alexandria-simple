# 775 — Break the templated WHY closer/opener on the remaining 19 cards

Issue: [#775](https://github.com/GetAlexandria/alexandria-internal/issues/775)
Related: PR #773 (flight A3, WHY content fill) · #672 (learning-plane flight
board) · #673 (F1, WHY fill-gate) ·
`docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md` (class rules)

## Scope and non-goals

Content-only flight — per the learning-plane flight board (#672), content
flights never touch app code. Scope is exactly the `## WHY` section body on 19
cards, three shelves:

- `principles/Principle/` (8): A Full System, Not a Pile of Skills ·
  Conversational Warmth · Cumulative, Not Sisyphean · Director Ruling · First
  Servable Loop · Never-Violate User Assumptions · Progressive Disclosure ·
  Replacement, Not Addition
- `colleagues/Bet/` (8): Colleague in the Channel (opener sentence only) ·
  Colleague in the Meeting · Colleagues as the Interaction Layer · Independent
  Execution · The Coin as Abstract Token · The Control-Panel Tray · The Deep
  Playbook · The Play as Unit of Ownership
- `playbook/Entity/` (3): Move · Source Item · Source of Truth

Non-goals: no new wikilinks; no touching `## WHAT`/`## WHERE`/`## HOW` or
frontmatter on any card; no touching the 6 reference cards already fixed on
`danversfleury/a3-why-fill` (commit `665d38c64`: Transparent Machinery,
Well-Run Franchise, Quiet Until Needed, Legible Graph, Named Colleagues,
Workflow Package) or `Principle - Professional, Not Daffy` (fixed in the same
commit for an unrelated content-accuracy reason, not the closer pattern); no
`packages/*` changes.

## Architectural boundaries

Pure prose edit inside `docs/alexandria/library/`. No code path other than the
existing machine-language lint reads this content differently.

## Touched files (19)

All under `docs/alexandria/library/`:

- `principles/Principle/Principle - A Full System, Not a Pile of Skills.md`
- `principles/Principle/Principle - Conversational Warmth.md`
- `principles/Principle/Principle - Cumulative, Not Sisyphean.md`
- `principles/Principle/Principle - Director Ruling.md`
- `principles/Principle/Principle - First Servable Loop.md`
- `principles/Principle/Principle - Never-Violate User Assumptions.md`
- `principles/Principle/Principle - Progressive Disclosure.md`
- `principles/Principle/Principle - Replacement, Not Addition.md`
- `colleagues/Bet/Bet - Colleague in the Channel.md`
- `colleagues/Bet/Bet - Colleague in the Meeting.md`
- `colleagues/Bet/Bet - Colleagues as the Interaction Layer.md`
- `colleagues/Bet/Bet - Independent Execution.md`
- `colleagues/Bet/Bet - The Coin as Abstract Token.md`
- `colleagues/Bet/Bet - The Control-Panel Tray.md`
- `colleagues/Bet/Bet - The Deep Playbook.md`
- `colleagues/Bet/Bet - The Play as Unit of Ownership.md`
- `playbook/Entity/Entity - Move.md`
- `playbook/Entity/Entity - Source Item.md`
- `playbook/Entity/Entity - Source of Truth.md`

## Changed behavior surfaces

None. No agent, skill, template, or runtime behavior changes — library prose
only. The catalog/lint machinery that reads these cards is unchanged.

## Edit approach

Minimal-diff per card, grounded in what the issue actually flags:

- Principle cards: the issue's Observed Behavior quotes only the **closing**
  WHY sentence as the reused skeleton (`[subject] holds/survives/binds,
  regardless of/independent of/no matter which bet wins, because {reason}`).
  Rewrite only that closing sentence per card; leave the first two sentences
  (failure mode + protection mechanism, not flagged) byte-identical.
- Bet cards: the issue flags only the **opening** "stake" sentence. Rewrite
  only that opener per card, preserving the win/lose/reversibility sentences
  that follow byte-identical. Exception: `Colleague in the Meeting`'s closing
  sentence also contains a stray "at stake" — tidied in the same pass for
  consistency since it's the same word, not a separate content change.
  `Colleague in the Channel` is opener-only per the issue's explicit note (its
  closer was already fixed on `a3-why-fill` for an unrelated reason).
- Entity cards: the issue flags only the **closing** "That [recap noun] is
  what {lets/makes}…" sentence. Rewrite only that sentence per card.

Each rewrite is checked against the others in its own shelf (not just against
the retired phrase) for distinct sentence construction — no shared opening
verb/metaphor across a shelf's 8 (or 3) rewrites.

## Deterministic tests to run

- `node studio/tools/check-machine-language.mjs docs/alexandria/library` — no
  regression from the current 171/171 pass.
- `pnpm exec markdownlint-cli2` scoped to the three touched shelf directories.
- Grep for each of the 19 quoted retired phrases (issue's Observed Behavior
  section) across the three shelf directories — must return no matches.
- `git diff --stat` against `main` — must touch exactly the 19 files listed
  above, WHY-section lines only.

## Evals to rerun or create

None. This is prose-only library content with no new product-facing reusable
agent/skill/template behavior — the targeted-evals gate does not apply.

## Risks and mitigations

- Rewrite settles into a *new* shared skeleton across the 19 (same failure
  mode, different sentence) — mitigated by drafting all rewrites together and
  cross-checking construction/verb choice within each shelf before applying.
- Accidentally weakening or dropping required content (Bet: stake/win/lose/
  cheap-vs-load-bearing; Principle: what the rule protects + holds regardless
  of bet outcome) — mitigated by a line-up-old-vs-new review pass per card
  before opening the PR.
- Touching more than the `## WHY` body — mitigated by scoping every edit to
  the flagged sentence and verifying with `git diff --stat`.

## Deferred follow-ups

None from this issue. Broader follow-ups (structured `embodied_by` frontmatter
socket, uncarded embodiments, learning-plane evidence channel, catalog WHY
story bucket) belong to `embodiment-map.md`'s own Loose ends, not this sweep.
