<!-- Filed as GitHub issue #483 (slice C1 of the FoH walk methodology reshape).
     fabro:ready withheld until ready to dispatch. -->

# Front-of-House walk: emit the headline opener (product container set + keystone-vs-contexts drift)

Plan: `front-of-house-walk-reshape` (`docs/alexandria/plans/front-of-house-walk-reshape/plan.md` §13; `walk-spec.md` Turn 0)
Tier: should | Blocked by: #482 (merged) | Blocks: C2 (Raven opener prompt framing), slice B, slice D
Data model: **keystone** (the reserved `_index` thesis card, `altitude: keystone`), **container** (= a `context`), **plane**; **drift** sets (`namedButEmpty`, `presentButUnnamed`)

## Summary

The Front-of-House walk has no opener — #482 set the agenda table (context-grouped,
triaged) but the walk drops the director straight into items. This adds a
deterministic **headline projection** at the top of the agenda: the product's
**container set** (the distinct `context` values per `plane`), the **keystone
thesis** card and the containers its prose names, and the **drift** between the
two — rendered as the walk's first thing in `for-raven.md` / `current-item.md`.
It is the "set the lens" opener the section walk then reads top-down.

## Motivation / Problem

On a real EL2 bundle the thesis and its carved contexts disagree, and nothing
surfaces it. On the canonical PMS sweep the keystone
(`_index/Concept - Playmaker's Studio.md`) names **8** containers in its prose, but
the cards carve only **6** contexts — `make-a-play` and `operations` are named but
empty, `authoring`/`runs` exist but aren't named, and `production-line` (thesis)
vs `production-ladder` (cards) is an unreconciled rename. The director should see
and rule the canonical container set before walking sections; otherwise the
section walk inherits a mislabeled, internal-register table (`authoring`,
`proving`, …). This slice is the deterministic substrate — Raven's conversational
framing of it is the follow-on (C2).

## Current shape (the working sibling)

#482 already ships the pattern this mirrors: `prepare-agenda` projects
`threads.json` into `agenda.json` with placement/triage fields, and renders the
staged item's plane/context header + triage into `for-raven.md` /
`current-item.md`. This is the same kind of **read projection + render** — for the
headline rather than a thread item. The keystone is a real, enumerable card
(`context: "_index"`, `altitude: keystone`).

## Proposed contract

`agenda.json` gains an additive `headline` object; `for-raven.md` /
`current-item.md` render it as an opener block before the staged section item. On
the PMS bundle the projection is (counts are whatever the bundle actually holds):

```json
{
  "headline": {
    "keystone": {
      "cardPath": "_index/Concept - Playmaker's Studio.md",
      "prefLabel": "Playmaker's Studio",
      "namesContainers": ["brief","workflow","proving","production-line","board","catalog","make-a-play","operations"]
    },
    "containers": [
      { "context": "authoring", "plane": "product", "cardCount": 22 },
      { "context": "board", "plane": "product", "cardCount": 14 },
      { "context": "catalog", "plane": "product", "cardCount": 12 },
      { "context": "production-ladder", "plane": "product", "cardCount": 9 },
      { "context": "proving", "plane": "product", "cardCount": 17 },
      { "context": "runs", "plane": "product", "cardCount": 17 }
    ],
    "drift": {
      "namedButEmpty": ["make-a-play","operations","production-line"],
      "presentButUnnamed": ["authoring","production-ladder","runs"]
    }
  }
}
```

**Decisions:**

- **Keystone identity:** the card with `context == "_index"` **and**
  `altitude == "keystone"`. Multiple → one per `plane`, lowest `cardPath` (stable).
  None → `headline` still emits with `keystone: null` and `drift: null`;
  `containers` always emit.
- **Container set:** distinct `context` values across bundle cards **excluding
  `_index`**, each with its `plane` and integer `cardCount`. Order = canonical
  plane order (`strategy`, `product`, `learning`) then `context` localeCompare —
  the same ordering #482 uses.
- **`plane` normalization:** lowercased (keystone uses `product`, cards use
  `Product`); emit/group the lowercased value.
- **`namesContainers`:** the keystone body's `[[wikilink]]` targets, trimmed +
  lowercased + deduped, in document order.
- **Drift = pure set differences** (lowercased exact match, **no fuzzy matching**):
  `namedButEmpty` = named containers with no matching context; `presentButUnnamed`
  = contexts (excl. `_index`) not named. The director/Raven reconciles renames
  (e.g. `production-line` ↔ `production-ladder`) by reading both lists — this slice
  does **not** guess renames.
- **Read-only projection.** The headline writes no card and does not rewrite the
  keystone body. Container renames the director rules flow through the **existing**
  answer → `apply_bundle_patch` loop (`context` is already an allowed patch field);
  no new answer/patch semantics here.
- **Render position:** the headline block renders first in `for-raven.md` /
  `current-item.md`, before the staged section item and before the `frame` item.

## Acceptance criteria

- Running `prepare-agenda` on the PMS bundle emits `agenda.json` with a `headline`
  object of the shape above: one `containers` entry per distinct non-`_index`
  context with its `cardCount` equal to that context's card total, in
  plane→context order; the keystone `prefLabel` + `namesContainers`; and
  `drift.namedButEmpty` ⊇ {`make-a-play`,`operations`} and
  `drift.presentButUnnamed` ⊇ {`authoring`,`runs`}.
- `for-raven.md` and `current-item.md` render the headline as an opener block (the
  container list + both drift lists) **above** the staged item.
- **Negative:** emitting the headline writes or modifies **no** card file; the
  keystone body bytes are unchanged.
- **Degraded:** a bundle with no `_index` keystone card emits `headline.containers`
  with `keystone: null` and `drift: null` (no crash).
- **Idempotency:** re-running `prepare-agenda` yields a byte-identical `headline`.
- **Regression:** the existing agenda `items`, their order, triage fields, and the
  `frame`-first / `unfiled`-last behavior from #482 are unchanged; source-only and
  `--no-*` paths are unaffected.
- **Test matrix (must cover):** the PMS bundle (multi-context, drift present); a
  single-context bundle (empty drift lists); a no-keystone bundle (degraded
  `null`s); plane-case normalization (`Product` → `product`); idempotent re-run;
  and a regression assertion that #482's agenda items/order are untouched.
  Deterministic unit tests (`library-front-of-house.test.ts`) for the projection +
  black-box CLI tests (`library-front-of-house-bundle.test.ts`) for `agenda.json` /
  `for-raven.md` output.

## Implementation notes

- Scope to the **deterministic projection + render**. Raven's conversational opener
  framing (presenting the drift as *"here's my read of your whole product, a few
  I'm unsure of…"*) and any container-rename *prompting* are the follow-on **C2**
  (a methodology/skill change), explicitly out of this slice — exactly as #482
  deferred its prompt changes.
- Relevant current files (orientation only — the factory chooses what to touch):
  `packages/ax/src/domain/library-front-of-house.ts` (projection + renderers),
  `packages/ax/src/commands/front-of-house.ts` (`prepare-agenda`),
  `packages/ax/src/domain/library-catalog.ts` (plane order, the `_index` keystone
  constant). Reuse #482's resolver / ordering helpers; do not re-derive plane order.
- Keep the headline a sibling of the existing agenda projection; do not change the
  `frame` item or the section items.
