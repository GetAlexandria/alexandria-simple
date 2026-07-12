# Strategy-plane card contract (2026-07-06)

The shape every strategy-plane card follows, so the build passes the librarian+editor sweep.
Grounded in real sweep cards (`_index/Concept - Alexandria.md`, `viewer/Concept/Concept - AI Colleague.md`).

## Folder convention
`docs/alexandria/sweeps/alexandria-product/<context>/<Type>/<Type - prefLabel>.md`
- **Contexts** (bet-cluster shelves, lowercase tokens): `colleagues` (#2) · `centralization` (#3) ·
  `environment` (#1) · `principles`.
- **Types**: `Bet`, `Principle`.

## Bet card — frontmatter
`type: Bet` · `prefLabel` · `plane: strategy` · `context` · `status: stub` · `confidence` (low, evidence-earned)
· `cost` (high|med|low, forward/remaining) · `altitude` (keystone = corporate | pillar = refraction) ·
`proposed_by: director` · `risks:` list of `{tag, note}` · `links: { charter: [Bet - <corporate bet>] }` (refractions).
- **Corporate bets** also carry `home: company-library` + `transfer: pending`, `altitude: keystone`, and NO
  charter link (they anchor; they charter up to the Company Library via the `home` marker, not a card).
- **embodied-by ↓** links (to product-plane cards) are DEFERRED — the product plane is under construction —
  so components are named in prose, not wikilinked, to avoid dangling links.

## Bet card — body (prose only; de-machining clean)
- `## WHAT` — the wager, plainly.
- `## WHERE` — where it sits: charters up to `[[Bet - ...]]`; what embodies it (product components in prose).
- `## HOW` — why we'd win if right; and what rolls back if wrong.

## Principle card — frontmatter
`type: Principle` · `prefLabel` · `plane: strategy` · `context: principles` · `kind` (refusal|experience-goal|standard|ruling)
· `strength` (hard|soft) · `status: stub` · `confidence: high` (settled ruling) · `proposed_by: director` ·
(altitude-less, per ruling).

## Principle card — body
- `## WHAT` — the rule. `## WHERE` — what it governs. `## HOW` — what a violation looks like.

## Open contract items (flag for director)
1. **Source policy** — strategy cards are director-sourced (no code). Using `proposed_by: director`;
   `source_evidence` omitted for now. Decide: commit the SoT (walk + stash + log) to
   `docs/alexandria/plans/strategy-plane-rebuild/` as the durable source and cite it, or leave director-sourced.
2. **Principles altitude-less** — deliberate two-axis exception; confirm the sweep tolerates it.
3. **New `type` values + contexts** load (free strings); Bet/Principle now have viewer icon palette entries
   — RESOLVED (2026-07-07): this change adds them to the palette and the canonical enum.
