# Front-of-House Walk — Methodology Reshape (plan)

```
play:     front-of-house-walk (EL3 of the library-elicitation chain)
status:   shipped deterministic baseline; #492 prompt capstone in §15; #495 proving fixture slice in §14
fronted:  Raven · Product / Library Operations
base:     main
```

This is the methodology plan and contract record. It began as a **design freeze**;
§13 records the shipped deterministic baseline, and §14 scopes the #495 proving
fixture refresh. Studio and plugin play copies sync by hand; the runtime runs the
plugin copy.

## 0. Relationship to the in-flight handshake work (#480 / #481)

A separate, **ruled** effort is already reshaping the *input* side of this same
play: `docs/alexandria/plans/front-of-house-handshake/plan.md` (Route B-hybrid).
It lives on a different branch (`foh-walk-threads-handshake`, PR #481) from this
methodology branch (`foh-walk-methodology`) by design. The two are complementary,
not competing — different axes of the same walk:

- **Handshake (#480 / #481) owns the SOURCE / TRIAGE axis** — which information
  reaches the director and how it's *labeled*. Back-of-House tags prior-inference
  threads with `emittingMove: translate_search_prior` + `confidence` + `basis`
  (producer, #481); the FoH consumer (#480, factory) extends
  `FrontOfHouseAgendaItem` with `confidence` + `origin`, renders the
  **inference-to-confirm vs gap-found-in-source** triage, and cites
  `basis`/`confidence` in residuals. `threads.json` stays the single source.
- **This plan owns the STRUCTURE / STANCE axis** — organizing the walk by
  `context` (section), the comprehension-check stance, the headline/keystone turn,
  held-back problems, and the human-language duty.

**The key alignment:** the handshake's triage *is* the data substrate for this
plan's reframe. "Here's what I think I know" = the **prior inferences**
(`translate_search_prior`, low-confidence) to confirm; "here's what I know I
don't know" = the **gaps found in source**. This plan doesn't invent that
distinction — it *organizes and presents* it, section by section.

**Coordination points (this plan defers to / builds on #480):**

1. **#480 organizes the agenda by `context` and "sets the table."** Beyond the
   triage labels, #480 will also carry `context` (+ `plane`) onto
   `FrontOfHouseAgendaItem` and group/sort the agenda by it — the section-grouping
   wiring this plan first scoped as its own slice. That wiring is therefore
   **#480's**, and this plan starts from an already-context-organized, triaged
   agenda. #480 is **not yet dispatched to the factory** (blocked by #481, merging
   now), so the context-organization spec should be added to #480 while the window
   is open.
2. **The headline turn absorbs the "search-frame" thread.** #481 synthesizes a
   walk-level "confirm the search frame" thread from the prior's `fence`/`domain`.
   That is the same opening "set the lens" movement as this plan's headline turn —
   merge them, don't duplicate.
3. **The brief / fixture drift cleanup belongs to #480.** Both plans flagged the
   stale pre-#473 `brief.md`; #480 already folds that cleanup in.

**Sequencing across both plans:** #481 (producer) → #480 (consumer triage +
context organization — *sets the table*) → this plan's stance/structure slices
land **on top of** #480's context-organized, triaged agenda.

## 1. Why — the reframe

Today the walk reads like generic product elicitation: a flat list of questions,
asked roughly blind, noun by noun. The whole point of EL3 is that it is **not**
blind. Back-of-House (EL2) has already produced a draft library — a pre-read.

So Raven's stance is **comprehension-checking, section by section**, not
interrogation:

> "Here's what I think I know about this section. Here's what I know I don't
> know. Did I get it right?"

Only **after** a section is confirmed does Raven optionally offer the problems
she spotted — "if it's helpful, I also found these likely issues" — as a gift at
the end, never interleaved with the comprehension check.

Two non-negotiables that fall out of this:

- **The unit is the section, not the noun.** The walk is organized by the
  product's biggest pieces, and you confirm your understanding of each piece —
  not a stream of per-card corrections.
- **Human language, not computer-ese.** EL2's draft is written from source that
  is procedural and technical. Raven must render surfaces and workflows in
  human-facing terms (what it does / who it's for), not code and jargon. The
  confirmed human framing must survive into EL5.

### Evidence — where the computer-ese actually is (real PMS sweep, 96 cards)

Verified against `studio/sweeps/playmaker-studio/` (the canonical Back-of-House
sweep). The premise holds, but the computer-ese is **not** evenly spread — which
changes who fixes what:

- **Agenda questions are already human.** The thread `question` field
  (director-register, from #473/#478) reads well — e.g. *"A Play can advance two
  ways — the Director's manual stage-confirm… and the auto-advance contract… Which
  is canonical?"* The technical detail sits in the parallel `reason` field
  (builder-register). So Raven does **not** start from computer-ese at the question
  level.
- **Card bodies are the computer-ese, concentrated in `WHERE`/`HOW`.** Every
  `WHERE` is a literal source location — Surface-Board: *"The `/studio?tab=board`
  view, rendered by `StudioApp.tsx` (`BoardView`)"*; Capability-Graduate:
  *"`board-model.js` (`graduatePlay`…)"*. `HOW` carries internal slugs and jargon —
  *"tier-bar, proof-spec, no-unclassified-failure…"*, *"DDD polysemy"*,
  `` the `graduated[]` set ``. **But bodies are EL5's, not FoH's.**
- **The `context` labels — the "sections" — are themselves internal-register:**
  `authoring`, `proving`, `runs`, `board`, `catalog`, `production-ladder`
  (source-folder-derived, lowercase). And 91/96 cards are `plane: Product`, so the
  container set is ~6 contexts under Product.
- **prefLabels are mostly fine**, a minority technical (`Run State`,
  `Projection Standard`, `Untrusted-Input Rule`, `Node Prompt`).
- **The keystone thesis and the context grid disagree.** The keystone
  (`_index/Concept - Playmaker's Studio.md`, `altitude: keystone`,
  `proposed_by: scanner`) names 8 containers via wikilinks
  (`brief`/`workflow`/`proving`/`production-line`/`board`/`catalog`/`make-a-play`/
  `operations`); the cards (`proposed_by: back-of-house-walk`) carve only 6
  contexts, with renames (`production-line` → `production-ladder`), collapses
  (`brief` + `workflow` → `authoring`), empties (`make-a-play`/`operations` have
  no cards), and a `product`/`Product` case split. Reconciling that *is* the
  headline turn's job — see `walk-spec.md` Turn 0.

**Implication — the humanization splits cleanly along the EL3 / EL5 line:**

1. **FoH humanizes the *framing*** — the container/section names (FoH owns
   `context` + `prefLabel` edits) and a confirmed human summary per section. The
   raw contexts (`proving`, `authoring`) are exactly what the headline + section
   turns should re-present in human terms for the director to confirm or rename.
2. **EL5 humanizes the *bodies*** — rewriting `WHERE`/`HOW` out of code-ese —
   **inheriting FoH's confirmed framing** via the `section_confirmed` event (§11),
   instead of re-deriving from `StudioApp.tsx`.

## 2. Vocabulary (grounded in code, not plan-doc invention)

"Section" was the conversational word. The data-model nouns are:

| spoken word | data-model field | where |
| --- | --- | --- |
| section / "container" (Index thesis word) | **`context`** | `packages/ax/src/domain/library-catalog.ts` |
| the layer a context sits on | **`plane`** (strategy / product / learning) | same; canonical order at `library-catalog.ts:348` |
| an individual noun | **card** | — |

The Index thesis header that lists the product's biggest pieces is naming
**contexts**. The code says so directly (`library-catalog.ts:372`): *"the thesis
names **containers**, so its prose wikilinks point at **contexts**."* The thesis
prose itself is a reserved **keystone** card per plane (`LIBRARY_INDEX_CONTEXT`),
one altitude above any context, hidden from the context grid.

Altitude ladder: **plane → context → card**. The headline overview = the plane
keystone; a "section" = a `context`.

## 3. Current state (what is actually shipped)

- `buildFrontOfHouseAgenda` (`library-front-of-house.ts:357`) takes the threads,
  filters to `status: "open"`, and maps them **one-to-one in thread-file order**.
  No grouping, no sort. Gaps (`stage2_question`) and `hot_spot` items come out
  interleaved.
- `FrontOfHouseAgendaItem` (`library-front-of-house.ts:18`) carries only `id`,
  `kind`, `text`, `title`, `evidenceRefs`. The thread's `concerns[]` — including
  which card/context it's about — is **dropped** before Raven sees the item.
- The hook already exists upstream: a thread concern
  (`LibraryCatalogThreadConcern`, `library-catalog.ts:119`) has optional
  `context` and `plane`. But EL2 fixtures don't populate it
  (`concerns: [{ type: "card", cardId: "…" }]`), and the agenda builder ignores
  it regardless.
- The play `brief.md` still documents the pre-#473 `STAGE-2-BRIEF.md` /
  `HOT-SPOTS.md` model. The code is thread-backed (`threads.json`) since #473.
  **The brief is stale and must be reconciled as part of this work.**

Net: grouping-by-section is mostly **wiring something that is already modeled
end-to-end but left empty and unused** — not building it from nothing.

## 4. Target methodology (reshaped golden path)

**Turn 0 — Headline / keystone (NEW).** Before any section, Raven confirms the
**container set and its plane grouping**: "Your product's major pieces are A, B,
C, grouped like this — right?" This is the lens every section is then read
through. It is pure structure (which contexts exist, how they group under
planes) — it does **not** rewrite the keystone thesis prose (that body is EL5).

**Turn 1..N — Section comprehension pass.** One turn per `context`, in plane →
context order. Raven presents a **human-facing read of the section + her
explicit unknowns** ("here's what I think this surface does; here's what I'm not
sure of"). The director confirms or corrects structure only: `prefLabel`,
`context`, `plane`, `status`, relationships. Each confirmation banks a
**section-confirmed** event carrying the agreed human framing (see D1).

**Turn N+1.. — Held-back problems.** After the comprehension pass, Raven offers
the `hot_spot` items as a collected list, **grouped by section**, for the
director to rule. Never shown before that section's comprehension turn.

**Finalize — Residual accounting (unchanged).** Unanswered items → `RESIDUAL-GAPS.md`.

## 5. Load-bearing changes

> **Ownership:** items 1–3 (the section-grouping *table*) are delivered by **#480**
> per §0; items 4–6 are this plan's, built on top of them.

1. **EL2 / Back-of-House fills `concern.context` (and `plane`)** on threads. This
   is the upstream change everything hangs off — without it the agenda has
   nothing to group by. (May piggyback on the #478 search-prior work, which
   already reasons about domain/fence/contexts.)
2. **`FrontOfHouseAgendaItem` carries `context` and `plane`** — stop dropping it
   in `buildFrontOfHouseAgenda`.
3. **`buildFrontOfHouseAgenda` groups/sorts by `context`** (plane → context
   order) and **separates `stage2_question` from `hot_spot`** into two passes.
4. **Presentation flip:** `current-item` / `for-raven` (`renderFrontOfHouseForRaven`,
   `library-front-of-house.ts:500`) changes from "a question" to "a summary +
   explicit unknowns" at the **section** grain.
5. **Headline / keystone turn** — a new move confirming the container set + plane
   grouping (Turn 0).
6. **`section-confirmed` event** — durable, human-facing section summary that EL5
   inherits (D1).

## 6. Open decisions (recommendations)

- **D1 — Does the human section summary become durable, and how?**
  *Recommend: yes, as a Ledger event* (`library.front_of_house.section_confirmed`,
  a process fact citing the backing director answer) carrying the agreed human
  framing + remaining unknowns. Stays inside the event-sourced model, does **not**
  write a card body (preserves the EL3-stops-at-structure boundary), and gives EL5
  a human-language prior so it stops re-translating from computer-ese source.
  **Full contract: §11.**
- **D2 — Can the headline turn edit the keystone?**
  *Recommend: structure only.* FoH confirms which contexts exist and how they
  group under planes (the product's table of contents). The thesis prose body is
  EL5. Keeps the altitude boundary clean.
- **D3 — Threads whose concern maps to no context.**
  *Recommend: an "Unfiled" catch-all section at the end.* Never drop a thread.
- **D4 — Turn granularity.**
  *Recommend: one comprehension turn per `context`* (present read + unknowns as a
  batch), not per thread. Per-thread is the model we're leaving.
- **D5 — Problems ordering: per-section or global? RULED (2026-06-30): global
  held-back.** Hold **all** `hot_spot` items to a second movement after the whole
  comprehension pass, grouped by section — it preserves the "first I prove I
  understand, *then* if it's helpful here are the problems" arc that per-section
  interleaving dilutes. Slice B implements this as a two-pass traversal over the
  flat agenda (filter `kind = hot_spot` to the end).

## 7. New vs. wiring-existing

- **Wiring (low risk):** section grouping (#5.1–5.3) — the `concern.context` →
  agenda-item → group/sort path is already modeled, just empty and dropped.
- **Genuinely new:** the headline/keystone turn, the `section-confirmed` event,
  the presentation flip, and the named Raven humanization duty.

## 8. Slicing (independent PRs off `main`, non-stacked, no auto-merge)

- **A — Section wiring → DONE in #482.** Shipped the full triaged, context-ordered
  table *and* the staged-item triage render. See §13 for the frozen shape to build
  on.
**Deterministic, MERGED:**

- **C1 — Headline projection → #483 (merged).** Container-set + keystone + drift,
  rendered as the `## Product Containers` opener block. `walk-spec.md` Turn 0.
- **B — Held-back hot-spots → #484 (merged).** `hot_spot` items form a trailing
  movement (D5-ruled global held-back).
- **D1 — `section_confirmed` event + `confirm-section` command → #485 (merged).**
  Provenance-gated event/command, derived cards/unknowns (§11).

**Prompt / consumer:**

- **C2 — Raven headline opener prompt → #489 (merged).** Added the `### Headline
  Opener` to `front-of-house-walk` `SKILL.md`.
- **D2 — EL5 consumes `section_confirmed` → #490 (filed; a dropped run is
  re-spooling).** Resolves the event into a `__AX_INPUT_SECTION_SUMMARY__` prompt
  input so EL5 writes human bodies.
- **Capstone — section-comprehension stance + held-back hand-off (prompt) → #492
  (technical handoff in §15).** Mirrors the `### Headline Opener` #489 landed;
  fires on non-`frame`, non-`hot_spot` items (comprehension) then `hot_spot`
  items (held-back); section close calls `confirm-section` (#485). No
  deterministic CLI change is planned for this slice.

**Owed (proving, not authoring):** a prior-bearing bundle (**#495**, see §14) and
detached runtime smoke to prove the chain end-to-end (best run once C2/capstone
land).
- **Docs — Reconcile `brief.md` + `SKILL.md`** to the thread-backed + reshaped
  model (the brief is stale per §3).

## 9. Proof additions (beyond the existing EL3 proof spec)

- Agenda groups by `context` in plane → context order; an orphan thread lands in
  "Unfiled," never dropped.
- No `hot_spot` item is presented before its section's comprehension turn.
- Headline turn confirms the container set as structure with **no** prose write
  to the keystone body.
- A `section-confirmed` event carries the human-facing summary; the card body is
  untouched and Small-floor fields stay intact.
- Existing provenance proofs still hold: no director-attributed value without a
  matching `actor.kind = user` event; unanswered items residualed.

## 10. Boundaries

- Still EL3: **structure only, bodies are EL5.** Nothing here writes a card body.
- Freeze here; dispatch to the factory as the slices in §8. Studio ↔ plugin play
  copies sync by hand; the runtime runs the plugin copy.

## 11. The `section_confirmed` event + EL5 handoff (contract — D1)

The mechanism that carries director-confirmed human language across the EL3 → EL5
boundary **without FoH writing a card body**. Grounded in the §1 evidence: the
real computer-ese lives in card bodies (`WHERE`/`HOW`) and in the internal-register
`context` labels — bodies are EL5's, the framing is FoH's.

**When.** After a section's comprehension turn (its items walked and ruled), Raven
synthesizes a human-facing summary of the section and the director confirms it —
one confirmation turn per `context`.

**Event.** `library.front_of_house.section_confirmed`, emitted as
`actor.kind = process` (a derived fact) citing the backing `actor.kind = user`
answer event(s) — the same provenance gate as `bundle_patch_applied` (no
director-attributed value without a matching user answer). Flow mirrors the proven
answer path: Raven's proposed summary banks as a `turn_recorded`
(`actor.kind = agent`); the director's confirmation is an `answer_recorded`
(`actor.kind = user`); `section_confirmed` cites that answer event id.

**Payload (proposed).**

- `context` — section id + the director-confirmed **human `prefLabel`** for the
  container (may rename the internal label, e.g. `proving` → "Proving a Play").
- `plane` — the section's plane.
- `summary` — 1–3 human sentences: what this section is and who it's for. No code
  refs, no internal slugs.
- `scope` — what's in / fenced out for this section (the local echo of the
  headline turn's confirmed search-frame).
- `cards` — the card ids the framing governs (so EL5 knows the set).
- `unknowns` — pointers to the section's residual items (also in
  `RESIDUAL-GAPS.md`), so EL5 doesn't invent past them.
- `answerEventId` — the backing user confirmation.

**EL5 read.** The atomizer (EL5) reads `section_confirmed` for a card's `context`
as the **human-language prior** when it writes that card's body: it reframes
`WHERE` in product terms ("where you meet this in the product"), drops internal
slugs from `HOW`, and writes `WHAT` from the confirmed summary — instead of
regurgitating the source's file paths. The confirmed `prefLabel`/`scope` constrain
the body so EL5 stays faithful to the director's ruling.

**Boundary.** `section_confirmed` writes **no card body** — it is a durable Ledger
fact at the FoH → EL5 seam. FoH stays structure-only (EL3); EL5 owns the prose and
now inherits human language instead of re-translating computer-ese.

**Buildability (grounded in code, 2026-06-30).** The event types are a fixed enum
(`ALEXANDRIA_STATE_EVENT_TYPES`, `state-events.ts:18`), so `section_confirmed` is a
deterministic addition there — alongside the existing
`library.front_of_house.{turn_recorded, answer_recorded, bundle_patch_applied,
residual_gap_recorded}` — **not** a free string. EL5 already consumes the Ledger on
its publish path (`publishAtomicCard` / `loadConfirmedLibraryInventory`,
`atomic-cards.ts:1693`, which filters events by type + actor to gate on
`library.confirmed`), so reading `section_confirmed` is a natural extension. **But
the body-drafting prompts read files only** (`build-atomic-card/prompts/
draft_or_repair.md`: *"Read only: contract, source ranges, confirmed stub, prior
candidate"*) and today write `WHAT/WHERE/WHY/WHEN/HOW` from the **source ranges** —
the computer-ese. So to actually shape prose, EL5's plan/contract step must resolve
the section's `section_confirmed` into a **prompt-input file** (a
`__AX_INPUT_SECTION_SUMMARY__` beside the contract), not merely emit the event.
That two-step — FoH emits the event → EL5 resolves it into a prompt input — is the
concrete handoff, and it's owed on the EL5 side.

**Proof addition.** A section's confirmation banks a `section_confirmed` citing a
user answer event; an EL5 run over that bundle yields a body that uses the
confirmed human label and contains no source file path the confirmed summary
didn't sanction. (EL5-side proof is owed when EL5 consumes it; the FoH-side proof
is the event + the provenance gate.)

## 12. Concrete walk spec → `walk-spec.md`

The turn-by-turn shape, the presentation templates (headline, comprehension,
held-back problems), and the real-PMS examples live in the companion
`walk-spec.md`. That is the buildable contract for slices B/C/D; this file holds
the rationale + the #480/#481 coordination.

## 13. Shipped baseline — #482 set the table (2026-06-30)

#480 merged as **PR #482** ("Set Front-of-House agenda table by plane and
context"). The table is set and it matches the §0 asks. Build the remaining slices
against this **frozen shape** (`packages/ax/src/domain/library-front-of-house.ts`,
`origin/main`):

- **Agenda item** (`FrontOfHouseAgendaItem`) now carries `context`, `plane`,
  `confidence`, `origin`, `basis?`, and `concerns[]` (card links —
  `cardId`/`cardPath`), plus the existing `kind`/`text`/`id`/`evidenceRefs`.
- **Origins** = `["source", "inference", "frame"]` (`originFromThread`): a thread
  whose `emittingMove` ≠ `translate_search_prior` → `source` (gap found in source);
  otherwise `frame` if `kind === "missing_context"` (the search-frame), else
  `inference` (a prior inference to confirm — `basis` carries the prior's reasoning).
- **Placement** via a resolver: `concern.context` → the concerned card's
  frontmatter `context`/`plane` → `resolveContextPlane`; unresolved → `unfiled`.
- **Ordering** (`compareAgendaProjections`) — a **flat sorted list**, not grouped
  objects: `frame` first → filed items by `plane` (strategy/product/learning) then
  `context` → `unfiled` last; **within a context, `stage2_question` before
  `hot_spot`**, then severity/kind/title/id.
- **Partial slice D already shipped:** `for-raven.md` / `current-item.md` render the
  staged item's plane/context header + triage fields (origin/confidence/basis), and
  `RESIDUAL-GAPS.md` cites placement/triage.
- **Explicitly deferred to THIS branch** (per #482's "Deferred" list): the
  **plane-thesis opener** (slice C), **held-back hot-spot sequencing** (slice B),
  **section-walk pacing**, and **`section_confirmed`** (rest of slice D), plus
  Library Notepad mirroring.

**D5 — RULED (2026-06-30): global held-back.** #482's default sort interleaves
problems per-context, but held-back sequencing was left to this branch and is not
foreclosed (the flat list + `kind`/`origin`/`context` support either). Slice B
holds **all** `hot_spot` items to a second movement after the comprehension pass.

## 14. Issue #495 — refresh `small-el2` as the prior-bearing proving fixture

**Goal.** Replace the stale `small-el2` fixture with a minimal, prior-bearing
Front-of-House bundle so fixture-bound tests and `--fixture small-el2` dry runs
exercise the shipped reshape: headline projection, container drift, origin triage,
section-comprehension ordering, and held-back hot spots.

**Scope.**

- Primary fixture:
  `studio/plays/front-of-house-walk/fixtures/small-el2/`.
- Bundle input:
  `studio/plays/front-of-house-walk/fixtures/small-el2/bundle/`.
- Scripted reactions:
  `studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json`.
- Deterministic tests in `packages/ax/tests/library-front-of-house-bundle.test.ts`
  and, only if needed for fixture binding, `packages/ax/tests/fixtures.test.ts`.
- Plugin copy: no duplicate `small-el2` fixture was found under
  `packages/alexandria-plugin` during planning. Implementation should re-check
  with `rg --files packages/alexandria-plugin | rg 'small-el2|front-of-house'`
  and sync an existing copy if one appears, but should not create a second fixture
  tree just to mirror the studio record.

**Non-goals.**

- No CLI/domain behavior changes: `prepare-agenda`, `buildFrontOfHouseHeadline`,
  `originFromThread`, held-back ordering, and `confirm-section` are already shipped.
- No Raven prompt-layer change in this slice. The existing `brief.md` / launch
  wording still mentions `STAGE-2-BRIEF.md` and `HOT-SPOTS.md`; that cleanup remains
  the §8 docs/prompt reconciliation, not a blocker for this fixture refresh.
- No writes to `docs/alexandria/library/`.
- No vendored repo changes.

**Current implementation gap.** The checked-in fixture still has two stub cards,
legacy `STAGE-2-BRIEF.md` / `HOT-SPOTS.md`, no `threads.json`, and no keystone card.
Because post-#473 `prepare-agenda` reads `threads.json`, this fixture currently
builds an empty agenda and does not prove the reshape.

**Target fixture contract.**

- Delete `bundle/STAGE-2-BRIEF.md` and `bundle/HOT-SPOTS.md`.
- Add `bundle/threads.json` with `schemaVersion: "library-threads.v1"` and about
  four open threads:
  - one `translate_search_prior` + `kind: "missing_context"` gap that becomes
    `origin: "frame"` and sorts first;
  - one non-`translate_search_prior` gap that becomes `origin: "source"`;
  - one `translate_search_prior` non-`missing_context` gap that becomes
    `origin: "inference"` and carries the thread `reason` as `basis`;
  - one `family: "hot_spot"` item that sorts after every `stage2_question`.
- Add a keystone card under `_index/` with frontmatter `context: _index` and
  `altitude: keystone`. Its body should name two or three containers with
  `[[wikilinks]]`.
- Make drift non-trivial:
  - at least one keystone-named container has no cards (`namedButEmpty`);
  - at least one card context is not named by the keystone (`presentButUnnamed`).
- Keep the bundle small but representative: three stub cards is enough if they
  cover at least two real contexts and create one present-but-unnamed context.
  Use production-like Product-card frontmatter: `type`, `prefLabel`, `context`,
  `plane`, `status`, `altitude`, `source_evidence`, `confidence`, `proposed_by`,
  and `links` where useful.
- Prefer stable thread ids that reveal the agenda role, for example
  `frame-small-el2-search-frame`, `gap-small-el2-director-review`,
  `prior-small-el2-raven-ops`, and `hot-spot-small-el2-runtime-boundary`.
- Keep card bodies as short stubs. The fixture is EL3; it must not prove body
  authoring.

**Reactions contract.**

- `reactions.json` stays an ordered list of `AnswerSpec` objects accepted by
  `parseReactions`.
- It has one entry per scripted human gate in agenda order. For this fixture that
  means the frame/headline opener first, then the source/inference section
  comprehension items, then the held-back hot spot. If implementation also wires
  section-close confirmations into the scripted run, add those reactions at the
  exact gate positions and update the count assertion accordingly.
- Keep reaction text explicit enough that a dry-run transcript shows the reshape
  was traversed: headline/search-frame confirmation, section naming/scope
  confirmation, prior-inference confirmation, and deferred hot-spot ruling.

**Touch map.**

- `studio/plays/front-of-house-walk/fixtures/small-el2/README.md` — update the
  fixture description from the legacy two-item EL3 fixture to the thread-backed
  prior-bearing contract.
- `studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json` — replace
  the two old reactions with agenda-ordered reactions for the new gates.
- `studio/plays/front-of-house-walk/fixtures/small-el2/bundle/**` — replace the
  stale bundle contents with the keystone card, stub cards, and `threads.json`;
  remove legacy markdown.
- `packages/ax/tests/library-front-of-house-bundle.test.ts` — add or revise a
  fixture-bound black-box test that copies `small-el2/bundle` to a temp dir,
  runs `prepare-agenda`, and asserts the contract below.
- Optional: `packages/ax/tests/fixtures.test.ts` only if fixture binding regresses
  or a clearer `--fixture small-el2` binding assertion is needed.

**Deterministic test matrix.**

- Prepare-agenda on a temp copy of `small-el2/bundle` exits 0 and reports a
  non-zero `itemCount`.
- `runtime/front-of-house/agenda.json.headline.keystone` exists, points at the
  `_index` card, and lists the keystone wikilinked containers.
- `headline.containers` is non-empty and covers the stub card contexts.
- `headline.drift.namedButEmpty` and `headline.drift.presentButUnnamed` are both
  non-empty.
- `agenda.items[0].origin === "frame"`.
- Agenda origins include `frame`, `source`, and `inference`; the inference item
  includes `basis` equal to its thread `reason`.
- Agenda kinds include `stage2_question` and `hot_spot`.
- Held-back ordering holds globally: every `stage2_question` index is before the
  first `hot_spot` index.
- All items have `sourcePath: "threads.json"` and non-empty `context` / `plane`
  placement, except the frame item's intentional `framing` placement.
- `parseReactions(reactions.json)` succeeds and its count equals the expected gate
  count for the fixture's agenda.
- `STAGE-2-BRIEF.md` and `HOT-SPOTS.md` do not exist in `small-el2/bundle`.
- Re-running `prepare-agenda` on the temp copy is byte-stable for
  `runtime/front-of-house/agenda.json` and does not mutate the keystone card.

**Validation commands.**

- `bun test packages/ax/tests/library-front-of-house-bundle.test.ts`
- If fixture binding is touched:
  `bun test packages/ax/tests/fixtures.test.ts`
- Manual smoke, when a local Fabro/ACP runtime is available:
  `ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json`

Run direct `ax internal front-of-house prepare-agenda` checks against a temp copy,
not the checked-in fixture directory, unless the generated
`runtime/front-of-house/` files are removed before commit.

**Eval impact.** This slice is fixture data plus deterministic tests. It does not
change a reusable product skill, agent, prompt, or eval harness, so no eval-harness
rerun is required by default. If implementation chooses to touch
`packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` despite the
non-goal, rerun the existing structural eval case
`front-of-house-walk/headline-opener-contract` and run plugin validation:
`claude plugin validate ./packages/alexandria-plugin`.

**Risks and mitigations.**

- **False drift.** If keystone names normalize to the same contexts the cards use,
  the drift lists go empty and the headline proof weakens. Mitigation: choose one
  explicit named-empty container and one explicit present-unnamed card context,
  then assert both lists.
- **Agenda-order flake.** Severity/title/id tie-breakers can move items in ways the
  fixture author did not intend. Mitigation: set severities and ids deliberately
  and assert only the load-bearing order: frame first, all stage2 questions before
  hot spots, placement order within each movement.
- **Fixture bloat.** Copying too much of the PMS sweep would make the small fixture
  hard to read and maintain. Mitigation: keep it to about four agenda items and a
  handful of cards; keep the full PMS sweep as the broad regression.
- **Prompt/docs mismatch.** Removing legacy markdown while `brief.md` / skill launch
  text still names it can confuse a human operator. Mitigation: this slice proves
  the deterministic thread-backed runtime and leaves the docs/prompt reconciliation
  as the existing §8 follow-up; do not reintroduce dead markdown to satisfy stale
  prose.
- **Committed runtime residue.** Manual prepare runs write `runtime/front-of-house`
  into the bundle. Mitigation: tests copy to temp dirs; manual validation cleans
  generated runtime files before commit.

**Acceptance and exit criteria.**

- `small-el2` is a thread-backed, prior-bearing fixture with a keystone headline,
  non-empty container set, non-empty drift in both directions, and agenda items
  covering `frame`, `inference`, `source`, and trailing `hot_spot`.
- The fixture has no `STAGE-2-BRIEF.md` or `HOT-SPOTS.md`.
- `reactions.json` has one valid reaction per expected gate, in agenda order.
- The fixture-bound test fails on the stale empty-agenda shape and passes on the
  refreshed fixture.
- The validation commands above pass, or any unavailable optional smoke is called
  out explicitly in the implementation closeout.

**Deferred follow-ups.**

- The Raven-mediated proving smoke (risk-map CHN-3) should run after this fixture
  lands; #495 supplies the data it needs but does not build the smoke harness.
- Reconcile `studio/plays/front-of-house-walk/brief.md` and the
  `front-of-house-walk` skill launch text to the thread-backed model.
- If future workflow changes make `section_confirmed` a first-class scripted gate,
  expand `small-el2/reactions.json` and its count assertion in that same slice.

## 15. Issue #492 — prompt capstone for section comprehension + held-back problems

**Goal.** Finish the Raven-facing consumer layer for the reshaped
Front-of-House Walk. The deterministic table, headline opener, held-back ordering,
and `confirm-section` command already exist; this slice teaches Raven how to use
them in the live prompt: comprehension-check each section first, then offer
problems afterward as optional rulings.

**Scope.**

- Primary product skill:
  `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`.
- Structural eval coverage under
  `packages/ax/tests/eval-cases/front-of-house-walk/`.
- Existing deterministic contract files read as inputs, not edited:
  `packages/ax/src/domain/library-front-of-house.ts` and
  `packages/ax/src/commands/front-of-house.ts`.
- Optional wording-only alignment if implementation finds stale release-facing
  workflow copy:
  `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`.

**Non-goals.**

- No CLI/domain behavior change. Do not change agenda ordering, item shape,
  `record-turn`, `stage-next`, residual accounting, or `confirm-section`.
- No card body writes and no keystone body rewrite. FoH stays at section/shape
  altitude; EL5 owns body prose.
- No EL5 consumption work. `section_confirmed` resolution into EL5 prompt input
  remains #490.
- No writes to `docs/alexandria/library/`.
- No fixture refresh; #495 owns `small-el2`.

**Linked plan/spec summary.** This implements §4 Turns 1..N and Turn N+1 from
this plan and `walk-spec.md`: one comprehension pass over non-`frame`,
non-`hot_spot` agenda items in plane → context order, followed by a trailing
held-back problems movement over `hot_spot` items. It mirrors the conventions
from the shipped `### Headline Opener`: human terms, no raw markdown recitation,
`record-turn` before speaking, uncertainty named as uncertainty, and no body or
keystone prose writes.

**Current implementation gap.** The skill now has the #489 headline opener and a
generic "Riff with the director at section/shape altitude" block. It does not yet
tell Raven to:

- recognize non-`frame`, non-`hot_spot` staged items as section-comprehension
  turns;
- synthesize a human section read from card `WHAT`s and card `prefLabel`s without
  exposing raw `WHERE`/`HOW` code references;
- split same-section agenda items into `origin: "inference"` claims to confirm
  versus `origin: "source"` gaps;
- close a section by proposing a human summary and calling
  `ax internal front-of-house confirm-section`;
- withhold every `hot_spot` until the trailing "Held-Back Problems" movement.

**Architectural boundary.** The backend remains item-gated. Raven may use the
flat `agenda.json` to speak at section altitude, but every staged agenda item
still gets its own existing `ax raven answer` loop. The skill must not imply that
one section-level conversation answered sibling agenda items that have not yet
been staged. Section-close confirmation is a derived process event cited to the
director's actual answer event; it is not a card patch and not a replacement for
the answer loop.

**Behavior surface changes.**

- **Skill: `front-of-house-walk`.** Add `### Section Comprehension` and
  `### Held-Back Problems` movements after `### Headline Opener`. Also expand
  the "On Human Input" read list to include
  `runtime/front-of-house/agenda.json`, because the prompt needs same-context
  siblings and hot-spot groups.
- **Workflow metadata: `front-of-house-walk` legs.** No deterministic behavior
  changes. If `legs.json` is updated, only align the human-leg wording from
  "one Stage-2 question or Hot Spot" to the shipped section-comprehension +
  held-back stance.
- **Eval substitute.** Add a focused structural eval case, or extend the existing
  `headline-opener-contract`, so `pnpm eval -- run front-of-house-walk/all` fails
  if the new skill movements or their guardrails disappear.

**Implementation steps.**

1. In `SKILL.md`, keep the existing launch, `record-turn`, and headline-opener
   flow intact. Add `agenda.json` to the files Raven reads after `record-turn`.
2. Add `### Section Comprehension` immediately after `### Headline Opener`.
   Trigger it when `current-item.json.agendaItem.origin` is `source` or
   `inference` and `kind` is not `hot_spot`.
3. In that movement, define the section as the current agenda item's `context`
   and `plane`. Use `agenda.json` to collect same-context, non-`frame`,
   non-`hot_spot` items; split them into:
   - "what I think I know (confirm)" = `origin: "inference"` items, carrying
     `basis` and `confidence`;
   - "what I know I don't (gaps)" = `origin: "source"` items, carrying the
     director-register prompt and confidence.
4. Tell Raven to read the same-context concerned card files named by
   `concerns[].cardPath` where present. The section read should use card
   `prefLabel`s and `WHAT` content only; if a card lacks usable `WHAT`, Raven
   states the uncertainty instead of filling from `WHERE`, `HOW`, file paths, or
   internal code nouns.
5. Preserve the existing answer loop. Raven asks the director to confirm or
   correct the staged item, and sends exactly the agreed answer through
   `ax raven answer --text-file`. Structural corrections stay limited to
   `prefLabel`, `context`, `plane`, `status`, and relationships through the
   existing patch planner.
6. Define section close. When the current staged item is the last non-`frame`,
   non-`hot_spot` agenda item for that `context` in `agenda.json`, Raven proposes
   the human section label and summary for confirmation. If the director confirms
   in that answer, capture the JSON `eventId` from `ax raven answer --json` as
   the answer event id (or read `answerEventId` from the written answer receipt),
   write a temporary summary file under `runtime/front-of-house/`, and run:

   ```bash
   ax internal front-of-house confirm-section \
     --bundle /abs/path/to/el2-bundle \
     --run <playRunId> \
     --context <context> \
     --pref-label <human section label> \
     --summary-file /abs/path/to/section-summary.md \
     --answer-event <answer event id> \
     --json
   ```

   Use `--scope-file` only when the director has explicitly confirmed useful
   in/out scope text. Do not call `confirm-section` before a user answer event
   exists.
7. Add `### Held-Back Problems`. Trigger it only for `kind: "hot_spot"` staged
   items. Raven frames the movement as an optional offering after the section
   walk, groups hot spots from `agenda.json` by human section label/context, and
   rules or defers the current staged hot spot through the same answer loop.
8. Keep degraded paths explicit:
   - a section with no inference items says there are no inferred claims to
     confirm and presents the source gaps cleanly;
   - a section with no source gaps says no sourced gaps were found;
   - `confirm-section` is still run for a confirmed section even when the command
     will derive `unknowns: []`.
9. Add structural eval coverage. Prefer a sibling case such as
   `packages/ax/tests/eval-cases/front-of-house-walk/section-comprehension-contract/config.json`
   that checks `SKILL.md` for the two new headings, origin split wording,
   `confirm-section`, `section_confirmed`, `hot_spot` withholding, no `WHERE`/
   `HOW`, no body writes, and no keystone rewrite. Keep the existing headline
   opener eval intact.
10. If workflow `legs.json` is touched, keep it descriptive only and rerun the
    state/workflow test named below.

**Deterministic tests and validation.**

- `claude plugin validate ./packages/alexandria-plugin`
- `pnpm eval -- run front-of-house-walk/all`
- `bun test packages/ax/tests/library-front-of-house-bundle.test.ts packages/ax/tests/library-front-of-house.test.ts`
- `pnpm run lint:markdown`
- If `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json` changes:
  `bun test packages/ax/tests/state.test.ts`

No Viewer validation is required; this slice does not touch
`packages/viewer`.

**Eval impact.** This changes a shipped product skill, so eval coverage is
required. Existing coverage only protects the headline opener contract. Add or
extend structural coverage for the section-comprehension and held-back hand-off
contract, then rerun `pnpm eval -- run front-of-house-walk/all`. The current
checkout's eval runner is the structural substitute in
`packages/ax/src/tools/el5-eval.ts`; no transcript baseline update is expected
unless the full live harness is restored before merge. If the live harness is
restored, add an adaptive Raven case that covers a source-only section, an
inference-bearing section close, and the first held-back hot-spot wake.

**Risks and mitigations.**

- **Risk: section language collapses item gates.** A section-level presentation
  could make it sound like sibling agenda items were all answered at once.
  Mitigation: the skill explicitly says every staged item still uses its own
  `ax raven answer` loop; section grouping is presentation context, not a new
  deterministic gate.
- **Risk: hot spots leak back into comprehension.** Because hot spots share
  contexts with ordinary gaps, Raven may mention them early while reading the
  section. Mitigation: the skill filters `kind: "hot_spot"` out of section
  comprehension and the eval checks for held-back wording.
- **Risk: humanization drifts into body authoring.** Asking for a human section
  summary could tempt Raven to rewrite card prose. Mitigation: repeat the
  "no card body, no keystone body" boundary in both new movements and rely on
  the existing patch prompt/AX validation for structural-only writes.
- **Risk: `section_confirmed` cites the wrong event.** The command accepts any
  matching run-level answer event, so Raven must not cite an earlier answer by
  accident. Mitigation: instruct Raven to call it immediately after the director
  confirms the section summary and to use the event id returned by that
  `ax raven answer --json` call or its receipt.
- **Risk: source-only sections read awkwardly.** A section with no inference
  items could look broken if the prompt assumes both columns are non-empty.
  Mitigation: define explicit empty-list language and rely on the existing
  `confirm-section` empty-`unknowns` tests.
- **Risk: structural eval is too shallow.** String checks can prove the contract
  text exists but not that Raven will perform it well. Mitigation: keep the
  structural eval as the merge gate for this prompt slice and record the adaptive
  eval as a follow-up if the live harness returns.

**Acceptance and exit criteria.**

- `SKILL.md` has `### Section Comprehension` and `### Held-Back Problems`,
  mirroring the `### Headline Opener` conventions.
- For non-`frame`, non-`hot_spot` staged items, the skill tells Raven to present
  a human section read, name the section's card pieces, and split same-context
  items into inference confirmations versus source gaps using `origin`,
  `confidence`, and `basis`.
- The skill requires `record-turn` before Raven presents any section or
  held-back turn.
- The skill forbids `hot_spot` presentation during the comprehension movement and
  frames hot spots only in the trailing held-back movement as optional rulings.
- On confirmed section close, the skill calls
  `ax internal front-of-house confirm-section` with the current run, context,
  human label, summary file, and backing answer event id.
- The skill explicitly says no card body is written and the keystone body is not
  rewritten; structural corrections continue through the existing patch loop.
- Degraded paths are covered in prompt text: source-only sections read cleanly,
  sections with no residuals still bank `section_confirmed` with
  `unknowns: []`, and unresolved hot spots can be deferred as residuals.
- Plugin validation, structural eval, targeted AX regression tests, and markdown
  lint pass, or any unavailable optional validation is called out in the
  implementation closeout.

**Deferred follow-ups.**

- #490: EL5 consumes `section_confirmed` as prompt input for body authoring.
- #495: refreshed prior-bearing `small-el2` fixture and Raven-mediated smoke.
- Reconcile `studio/plays/front-of-house-walk/brief.md` with the thread-backed
  model after the prompt capstone lands; this issue should not expand into a
  broader play-doc rewrite.
- Add a live adaptive eval for the full Raven conversation if the broader eval
  harness is restored before or after this slice.
