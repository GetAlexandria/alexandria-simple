# V2: Owner view prototype — Domain : Employee, landmark-anchored

**Flight:** 2 — The two looks · **Depends on:** P1 (parallel with V1; shares fixtures) ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.2

## Context

The second look prototype: the Playbook perspective rendered spatially. Each domain is
anchored by its responsible agent or human — the colleague's building at region center,
their territory and its work arranged around them. Answers "what is this colleague in charge
of, and is it healthy?"

## Scope

- Owner-anchored layout function over the same M1-shaped fixtures as V1: domain territory
  centered on its `owner`; owner rendered as a landmark building (promote `FixedBuilding`/
  `LandmarkSprite` from quarantine; colleague portraits or Lifebuild building sprites —
  pick whichever reads better, note the choice in the PR).
- Human owners get a distinct marker (e.g., statue sprite) vs colleague buildings.
- Unclaimed domains render visibly ownerless (dimmed territory + vacant-plot marker) — a
  feature, not an error state.
- View toggle on `/dev/map` switching Domain view ↔ Owner view over identical fixture state
  (if V1 merges first, extend its route; otherwise ship the toggle scaffold and V1 slots in).
- Locked future-seat plots (the four bench seats) placed as vacant landmarks.

## Acceptance criteria

- [ ] Toggle switches views without data changes; both render the same fixtures.
- [ ] Each owned domain shows its owner's building at anchor; unowned domains read as
      unclaimed at a glance.
- [ ] Promoted components pass the Gate 3 checklist; `/simplify` + `/code-review` run.

## QA script

1. Open `/dev/map`, toggle views; confirm the same entities appear in both.
2. In Owner view, answer "what is Raven in charge of?" purely visually.
3. Find the unclaimed domain and the locked seats without hints.
4. Screenshot both views for the look ruling (attach to PR).

## Out of scope

Real data, journal overlays (L2), placement, signals.
