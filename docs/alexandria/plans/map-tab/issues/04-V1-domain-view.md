# V1: Domain view prototype — regions, contexts, tiles, stray piles

**Flight:** 2 — The two looks · **Depends on:** P1 ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.1–1.2

## Context

The first of two look prototypes the director rules between. Domain view is the Alexandrian
model as geography: work/personal halves → domain territories → context patches → project
and system tiles plus a stray task pile. This layout layer is NEW code (Lifebuild's grid was
flat); the tile renderers are promotions.

## Scope

- Promote `HexTile`, `SystemHexTile` (R3 variant), `HexGrid`, `HexMap`, sprite components
  from quarantine through the Gate 3 checklist, with props adapted to M1's types (never the
  reverse).
- New domain-region layout: assign each domain a contiguous territory from its declared
  `region` (center + radius), split by `half`; region tinting via parchment-shader color
  inputs; painted borders between domains; region and context labels.
- Context patches: contiguous hex clusters inside their domain's territory; entities render
  on hexes within their context's patch (fixture positions).
- Stray task pile: crop-plot/pile sprite per context, size stepping with fixture card count.
- All on the `/dev/map` route against expanded fixtures (2 halves, 4 domains, ~6 contexts,
  ~8 projects/systems, 2 stray piles). No real data.
- Completed-project grey treatment and hibernating-system dim included (they're look
  decisions).

## Acceptance criteria

- [ ] Dev route shows halves, tinted domain territories with borders/labels, context
      patches, project tiles, system tiles (health dots visible), stray piles.
- [ ] The scene is legible at default zoom: the two-second test — you can tell domain,
      context, and tile kind at a glance.
- [ ] Promoted components carry no LiveStore residue; `/simplify` + `/code-review` run.

## QA script

1. Open `/dev/map`; identify each domain and context without reading the fixture file.
2. Zoom out: halves and domains read. Zoom in: tiles and piles read.
3. Screenshot for the look ruling (attach to PR).

## Out of scope

Owner view (V2), real data, placement, signals beyond static health dots.
