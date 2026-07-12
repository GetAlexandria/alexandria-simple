# ALTITUDES — Alexandria (the product)

Move: `pass3_altitude` · Back-of-House Walk (EL2) · 2026-07-01
Inputs: `runtime/EVENTS.md`, `runtime/contexts.md` (8 contexts, 70 carded
nouns).

Rule (C4, "don't mix levels"): every carded noun gets exactly one altitude —
`pillar` (top-of-product) · `context` (a bounded part) · `aggregate`
(lifecycle-bearing, state transitions) · `component` (piece inside an
aggregate, no independent lifecycle) · `value` (no identity,
meaning-by-content) · `capability` (verb / operation / gate). Rationale only
where the call is non-obvious; a card genuinely between two altitudes is a Hot
Spot naming both candidates (four raised this pass, HS-18–21), never a silent
pick.

Altitude distribution: pillar 5 · context 9 · aggregate 10 · component 23 ·
value 14 · capability 9 = 70.

## 1. `product-shell`

| Card | Altitude | Rationale (only when non-obvious) |
|---|---|---|
| Entity - Project | context *(provisional — HS-18)* | Between context (the bounded workspace everything lives in) and aggregate (it is initialized and carries a configured state). Both candidates named — **HS-18**. |
| Entity - Alexandria Config | component | |
| Surface - AX CLI | pillar | One of the three shipped top-of-product packages; a headline part. |
| Mechanism - AX Runtime Server | component | An engine with no independent product lifecycle beyond started/healthy; it serves the CLI/viewer pillars. |
| Surface - Viewer | pillar | |
| Entity - Viewer Route | value | A route is meaning-by-content — a path→mode mapping with no identity beyond its string. |
| Surface - Coin | component | A rendering inside the agents surface (per the pass1 resolution); its *type* is the open question (HS-9), its altitude is not. |
| Role - Agent | context *(provisional — HS-19)* | See HS-19: the C4 ladder is thing-shaped, not actor-shaped. |
| Role - Raven | context *(provisional — HS-19)* | Arguably pillar — the flagship agent is a headline part of the product. **HS-19** names both. |
| Role - Damien | context *(provisional — HS-19)* | |
| Role - Director | context *(provisional — HS-19)* | Arguably pillar — the product's whole gate model hangs on this actor. **HS-19** names both. |

## 2. `ledger`

| Card | Altitude | Rationale |
|---|---|---|
| Mechanism - Ledger | pillar | A headline part ("immutable ledger" is product-front vocabulary, prior confidence high). |
| Entity - Ledger Event | component | Non-obvious: it has identity (idempotency key) but **no lifecycle** — an appended event never changes, so aggregate is wrong; it is the atom inside the Ledger. |
| Economy - Event Type | value | |
| Mechanism - Trigger | capability | A derived, firing condition — an operation over the ledger, not a stored thing (HS-3 evidence). |
| Economy - Pending Trigger Kind | value | |
| Mechanism - State Store | component | Demotion-proposed (HS-11); as drafted, a piece of the Ledger machinery. |
| Entity - Idempotency Key | value | No identity of its own; meaning purely by content. Demotion-proposed (HS-12). |

## 3. `session-wake`

| Card | Altitude | Rationale |
|---|---|---|
| Entity - Session | aggregate | connected → wakeable; leased and released. |
| Entity - Connection Lease | component | |
| Entity - Wake Subscription | aggregate | Registered and removed independently of any one session wake; carries its own cursor state. |
| Entity - Match Rule | value | Meaning-by-content: an event-type predicate. |
| Capability - Wake | capability | Type ambiguity (HS-17) noted; as a capability its altitude is the verb rung. |
| Mechanism - Monitor | component | A long-running loop, but its life rides the plugin install; no domain state transitions of its own. |
| Entity - Cursor | value | A position, meaning-by-content. Demotion-proposed (HS-13). |

## 4. `playbook`

| Card | Altitude | Rationale |
|---|---|---|
| Entity - Play | context *(provisional — HS-20)* | Between context (a bounded definition inside the Playbook that runs are scoped to) and aggregate (identity-bearing, but the shipped manifest entry has **no state transitions** — the production-ladder lifecycle lives in the Studio, not this product). Both named — **HS-20**. |
| Entity - Playbook | pillar | Headline part (prior confidence high; `/playbook` route). |
| Entity - Workflow Package | component | |
| Entity - Move | component | |
| Entity - Play Skill | component | |
| Entity - Play Run | aggregate | The central record (HS-1): requested → submitted → running → awaiting director → resumed → succeeded/failed. |
| Economy - Play Run Status | value | |
| Mechanism - Human Gate | capability | Gates are the altitude definition's own example of the capability rung. |
| Entity - Human Input Request | component | |
| Economy - Review Level | value | |
| Mechanism - Review Gate | capability | |
| Entity - Provenance Record | component | |
| Mechanism - Fabro Orchestrator | component | An engine under the Playbook pillar; the product exposes runs, not the orchestrator's own lifecycle (HS-7 boundary kept). |
| Entity - Run Labels | value | Content-only identifiers. Demotion-proposed (HS-14). |

## 5. `vision-onboarding`

| Card | Altitude | Rationale |
|---|---|---|
| Entity - Basic Product Description | aggregate | not_started → in_progress → ready_to_bank → banked (`raven-vision.ts`). |
| Entity - Vision Slot | component *(provisional — HS-21)* | Between component (one of four fixed pieces of the description, no independent life) and aggregate (it carries its own needs_review → approved/skipped transitions). Both named — **HS-21**. |
| Economy - Slot Status | value | |
| Entity - Source Item | component | Identity-bearing but its lifecycle rides the Vision chain (tracked on attach, consumed at banking). |
| Entity - Raven Source of Truth | component | A derived artifact — flushed from slot state, content-hashed; its currency tracks the aggregate's state rather than owning one. |

## 6. `knowledge-production`

| Card | Altitude | Rationale |
|---|---|---|
| Entity - Source | aggregate | pending assessment → assessed. |
| Surface - Inbox | context | A bounded place inside the knowledge pipeline, not itself lifecycle-bearing. |
| Capability - Source Assessment | capability | |
| Entity - Source Conversion | aggregate | started → ready_to_freeze → completed/failed. |
| Entity - Frozen Source of Truth | component | The conversion carries the lifecycle; this artifact is its output (one state: frozen). |
| Entity - Knowledge Bank Area | aggregate | available → in_progress → ready_for_atomization → banked (plus locked). |
| Entity - Atomic Card | aggregate | created / updated; lives on in the library. |
| Reference - Atomic Card Category | value | A taxonomy label set; meaning-by-content. |
| Capability - Studio Operation | capability | |
| Reference - Director Ruling | component | A recorded rationale riding the ledger event that carries it; no independent lifecycle (its `ruling.capture.pending` projection belongs to Trigger). |

## 7. `library`

| Card | Altitude | Rationale |
|---|---|---|
| Entity - Library | pillar | Headline part; also the aggregate-bearing catalog (confirmed / sent back) — pillar wins because the confirmation lifecycle is carried per-catalog by the Confirmation Gate and the card set, and "Library" is the product's top-of-house noun. |
| Entity - Product Card | aggregate | stub → confirmed; draft-patched via the overlay. |
| Economy - Catalog Schema Mode | value | |
| Economy - Plane | value | |
| Entity - Thread | aggregate | open → answered / residual. |
| Economy - Thread Status | value | |
| Mechanism - Draft Overlay | component | Machinery inside the Library; the patches carry the history, the overlay has no states of its own. |
| Entity - Bundle Patch | component | |
| Pattern - Front-of-House Walk | capability | Non-obvious: a named arc *performed on* the library (turn → answer → patch → confirm), not a place or a thing — the operation rung fits; its `flow:` draws the arc at emit. |
| Entity - Walk Turn | component | |
| Entity - Section | component | |
| Mechanism - Confirmation Gate | capability | |
| Reference - Playmaker's Studio Library | context | A federation pointer to a whole sibling bounded library — the pointer's referent is context-sized, and the card should read at that zoom. |

## 8. `canvas`

| Card | Altitude | Rationale |
|---|---|---|
| Mechanism - Canvas | capability | Retyped from Surface (2026-07-05): a dormant-but-intended generic "save-artifact → request-review → wake" mechanism, not a bounded work surface. |
| Entity - Canvas Step | component | |
| Capability - Canvas Review | capability *(deprecated)* | Folded into [[Mechanism - Canvas]] — not a standalone live capability. |

---

## Consistency notes for `emit_bundle` / `check_bundle`

- No context mixes a `pillar` under a `component` parent; every `value` hangs
  off the aggregate or mechanism whose enum/label it is.
- The five pillars (AX CLI, Viewer, Ledger, Playbook, Library) match the
  prior's places list (visual interface, ledger, playbook, library) plus the
  CLI; the prior's fifth place, the coin, was resolved down to a component at
  pass1 — consistent with HS-9's type question staying open.
- All four altitude ambiguities (HS-18–21) are on the soft context/aggregate
  and component/aggregate lines the brief predicts; none blocks emit — cards
  carry the provisional altitude, threads carry both candidates.

## Hot-spot ledger (running, cumulative through pass3)

Pass1/pass2 entries carried verbatim from `runtime/EVENTS.md` and
`runtime/contexts.md`; full text lives there.

| id | kind | what | where |
|---|---|---|---|
| HS-1 | judgment_punt | Central-record pick: Play Run spine; Ledger Event / Library alternates carded. | `playbook` / Play Run (see contexts.md) |
| HS-2 | polysemy | "Play" = definition vs workflow template vs skill wrapper; three cards + `related_to`. | `playbook` / Play |
| HS-3 | runtime_vs_design | Trigger design noun bigger than the two shipped derived kinds. | `ledger` / Trigger |
| HS-4 | docs_disagree | Viewer README route claim vs shipped `viewer-routes.ts`. | `product-shell` / Viewer |
| HS-5 | docs_disagree | Two card taxonomies (atomic-card folders vs product-card.v1). | `knowledge-production` / Atomic Card · `library` / Product Card |
| HS-6 | docs_disagree | "Five agents" marketed; two built-in + un-rostered `william`. | `product-shell` / Agent |
| HS-7 | runtime_vs_design | Fabro: embedded orchestrator (in scope) vs build factory (out). | `playbook` / Fabro Orchestrator |
| HS-8 | polysemy | "Library": legacy oracle vs product-card catalog vs federated PMS. | `library` / Library |
| HS-9 | polysemy | Coin type: Surface vs Component. | `product-shell` / Coin |
| HS-10 | split | "Source of Truth": Raven Vision prose vs frozen conversion output; both cards drafted. | `vision-onboarding` · `knowledge-production` |
| HS-11 | demotion | State Store — machinery exposed as a noun. | `ledger` / State Store |
| HS-12 | demotion | Idempotency Key — plumbing vocabulary. | `ledger` / Idempotency Key |
| HS-13 | demotion | Cursor — delivery machinery. | `session-wake` / Cursor |
| HS-14 | demotion | Run Labels — line-label nouns. | `playbook` / Run Labels |
| HS-15 | polysemy | Playbook type: Entity (registry) vs Surface (route). | `playbook` / Playbook |
| HS-16 | judgment_punt | prefLabel: "Basic Product Description" vs internal `vision` naming. | `vision-onboarding` / Basic Product Description |
| HS-17 | judgment_punt | Wake type: Capability (operation) vs Entity (request record). | `session-wake` / Wake |
| HS-18 | judgment_punt | **Altitude** — Project: `context` (the bounded workspace) vs `aggregate` (initialized → configured). Provisional: context. | `product-shell` / Project. Evidence: `packages/ax/CLAUDE.md`, event 1 |
| HS-19 | judgment_punt | **Altitude** — the Role class: C4's ladder is thing-shaped, not actor-shaped; Raven and Director read as `pillar` (headline parts), the class otherwise as `context`. Provisional: context for all four Role cards; both candidates named for EL3 to set a class rule. | `product-shell` / Agent, Raven, Damien, Director. Evidence: `agents.ts:13-59` |
| HS-20 | judgment_punt | **Altitude** — Play: `context` (bounded definition runs scope to) vs `aggregate` (identity but no in-product state transitions; the lifecycle lives in the Studio). Provisional: context. | `playbook` / Play. Evidence: `plays.ts` `PLAY_MANIFEST` |
| HS-21 | judgment_punt | **Altitude** — Vision Slot: `component` (one of four fixed pieces, no independent life) vs `aggregate` (own needs_review → approved/skipped transitions). Provisional: component. | `vision-onboarding` / Vision Slot. Evidence: `raven-vision.ts`, events 7–8 |
