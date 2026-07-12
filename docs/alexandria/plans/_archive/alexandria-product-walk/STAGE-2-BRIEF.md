# Stage-2 Brief — Alexandria (the product)

The director-only questions this back-of-house walk surfaced — the agenda for
the front-of-house walk (EL3). A banked Basic Product Description was supplied,
so unlike an answer-keyless scan the "why" tier is short; in its place are the
three prior inferences source could not confirm, which triage should read as
inferences-to-confirm (`emittingMove: translate_search_prior`), not source
gaps. Each question points at a real card or thread.

## Tier A — Naming (would you say this word?)

1. **"Play" is one id for three artifacts** — the playbook definition, the
   workflow template, and the Raven-facing skill. All three carded
   (`Entity - Play`, `Component - Workflow Package`, `Component - Play Skill`;
   thread `hot-spot-play-polysemy`). When you say "the play," which do you
   mean?
2. **"Basic Product Description" vs the internal `vision` naming** — the
   events, id, and route all say `vision`
   (thread `hot-spot-vision-naming`). Which name is canonical?
3. **"Source of Truth" is two things** — the Raven Vision prose kept current
   vs the frozen conversion output. Split into `Entity - Raven Source of
   Truth` and `Entity - Frozen Source of Truth`
   (thread `hot-spot-source-of-truth-split`). Keep the split, or one noun with
   two states?
4. **"Library" is three things** — legacy 208-card oracle (uncarded),
   `product-card.v1` catalog (`Entity - Library`), federated PMS library
   (`Reference - Playmaker's Studio Library`;
   thread `hot-spot-library-polysemy`). Ratify the three-way carve?
5. **Is the coin a place or a rendering?** Drafted as `Surface - Coin`
   provisionally (thread `hot-spot-coin-type`). Pick Surface or Component.
6. **Is the Playbook the registry or the page?** Drafted as `Entity -
   Playbook` with the `/playbook` route as a derived view
   (thread `hot-spot-playbook-type`). Confirm or flip.
7. **Is a Wake the act or the record?** Drafted as `Capability - Wake`
   (thread `hot-spot-wake-type`). Pick Capability or Entity.

## Tier B — Process (what is the unit of work?)

8. **The central record.** The bundle's spine is the `Entity - Play Run` —
   but source shows several status piles, and the Ledger Event or the Library
   are honest alternates, both carded
   (thread `hot-spot-central-record-pick`). Confirm or re-point the spine.
9. **Which card taxonomy is the library's future?** The 10-folder atomic-card
   categories and `product-card.v1` coexist in shipped code with an explicit
   `legacy` mode (thread `hot-spot-two-card-taxonomies`). Rule the vocabulary;
   this decides what happens to every existing card.

## Tier C — Runtime (the execution model)

10. **Triggers: design noun vs shipped pair.** "Programmatic conditions which
    trigger a play" vs two derived-on-read kinds, never materialized
    (thread `hot-spot-trigger-design-vs-runtime`). Is the bigger trigger
    surface planned, cut, or is derived-on-read the model?
11. **Fabro's two hats.** The embedded orchestrator is carded; the factory
    that builds the repo is fenced out
    (thread `hot-spot-fabro-two-hats`). Confirm the boundary.

## Tier D — Values / "why" (the prior raised these; source could not log them)

12. **Is the "living business plan" a product noun?** The nearest shipped
    structure is the strategy/product/learning planes
    (thread `gap-living-business-plan`). A view over the library that deserves
    a card, or prose?
13. **Does "operating plane / mission control" deserve a card?** The closest
    shipped thing is the viewer home surface with the agent coins
    (thread `gap-operating-plane-category`).
14. **Is federation product machinery or practice?** "A federated set of
    context libraries" exists as a ruling (the PMS pointer), not as a
    mechanism in source (thread `gap-federation-mechanism`).
15. **What does "five specialized agents" promise?** Two ship built-in plus an
    un-rostered `william` id (thread `hot-spot-five-agents-claim`). Intent
    with three unbuilt, or stale marketing — and should william be carded?

## Tier E — Implementation detail (demotions and stale docs)

16. **Four demotion proposals** — `Mechanism - State Store`,
    `Component - Idempotency Key`, `Component - Cursor`,
    `Component - Run Labels` (threads `hot-spot-state-store-demotion`,
    `hot-spot-idempotency-key-demotion`, `hot-spot-cursor-demotion`,
    `hot-spot-run-labels-demotion`). Confirm each demotion to a
    source-evidence note, or keep any as a card.
17. **The viewer README is stale** — it claims one route, code ships
    twelve-plus (thread `hot-spot-viewer-readme-routes`). The scan treated
    code as canon; should the README be corrected?

## Tier F — Architect-only (altitude and scope rules)

18. **Set the Role altitude class rule** — actors on a thing-shaped ladder;
    Raven and the Director read as pillars, the class otherwise as context
    (thread `hot-spot-role-altitude-class`).
19. **Three single-card altitude calls** — Project context-vs-aggregate
    (thread `hot-spot-project-altitude`), Play context-vs-aggregate
    (thread `hot-spot-play-altitude`), Vision Slot component-vs-aggregate
    (thread `hot-spot-vision-slot-altitude`).
20. **Did the search frame hold?** The scanned domain was the shipped product
    line, with the legacy library, the Studio, vendored repos, and
    deploy/factory tooling fenced out (thread `frame-search-space`). Confirm
    nothing you consider the product was missed — including whether
    `packages/host-*` / `plugin-runtime` are load-bearing product surface.
