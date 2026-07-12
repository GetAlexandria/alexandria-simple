# Frame-Ruling Cascade ("the lodestone contract")

Status: draft for director review · Author: session 2026-07-02 (Danvers +
Claude) · Grounded against operational code at main `1021939c` and the live
Alexandria Front-of-House walk (runs `01KWH7PEV2F77BJC0YHRP0EVWD`,
`01KWHFN1SA5R413ASARCRN79VW`).

## 1. The problem, in the director's words

> "We start with the index card… the 20% it got wrong was pretty darn wrong. I
> shared guidance. Raven showed comprehension. What should be happening: the
> index card updates for me to approve… and then decisions made there need to
> cascade everywhere. The whole C4 organization just changed and some questions
> or problems might have just autoresolved. That conversation should be a
> lodestone type situation, but it seems like at least so far it was a bit of
> a throwaway."

The specimen (2026-07-02): the director's frame ruling reshaped the Alexandria
map from eight scanned contexts to five regions (Library + Playbook as the
heart; Viewer, Ledger, Triggers as enabling systems; `vision-onboarding` and
`knowledge-production` demoted off the map; `canvas` held for its own
conversation). The ruling banked as
`library.front_of_house.answer_recorded` (1,289 chars of prose) and produced
`patch-frame-search-space` with `cardUpdates: []`. Nothing else changed: the
keystone card is untouched, the agenda still stages items on the old
eight-context carve, the Drafts surface shows nothing, and items the ruling
already settles will re-ask the director one by one.

## 1b. The guiding principle (director ruling, 2026-07-02)

> "BPD + BoH is designed to have Raven asking specific rather than general
> questions; the goal is for the director to react to a mostly-right
> description… that initial scan is held loosely. It will get reshaped,
> almost like clay, and a lot of that can and should be behind the scenes for
> the director… We need a record of the mistake — we'll learn from that
> mistake… but the goal of the front-of-house play should be to not make that
> mistake the director's problem. We don't want to waste their time
> adjudicating such a boneheaded call… This intent of traceability behind the
> scenes, and respecting the director's time by not asking wasteful questions
> up front, is the guiding principle set of design here."

Design invariant: **the director's attention is spent only on genuine
unknowns.** Machine mistakes are absorbed silently for the director and
recorded traceably for the system. Three tiers follow: the deterministic
cascade (S1/S2), ruling-aware triage (S5), and the miss record (the
`invalidated` state in the Notepad plan).

## 2. Why it is a throwaway today (three guardrails that don't compose)

All three are individually correct and stay:

1. **Keystone body frozen** — `plan_bundle_patch.md`: "Do not rewrite the
   keystone card body." (EL5 owns bodies; keystone repair = conforming
   re-emit under the `check-keystone` gate.)
2. **No container-level patch operation** — same prompt: "Do not invent a
   container rename event"; a reshape may only be expressed as per-card
   `set.context` edits the planner can *safely enumerate*, which at frame
   altitude it correctly refuses to guess.
3. **Agenda projected once** — `buildFrontOfHouseAgenda`
   (`packages/ax/src/domain/library-front-of-house.ts`) projects from
   `threads.json` at `prepare-agenda`; `stage-next` only shrinks it via
   play-run-scoped resolved ids. No ruling re-derives it.

## 3. The contract

One sentence: **a frame-gate ruling is an event whose approved container
mapping deterministically re-projects everything downstream — the keystone (as
a draft), the agenda, and the auto-resolution of settled items — with every
cascaded effect carrying provenance to the ruling's answer event.**

Design principles carried over from shipped architecture:

- The cascade is **projection, not judgment**: the LLM (patch planner)
  translates the director's prose into a structured mapping exactly once; all
  downstream effects are deterministic replay of that mapping. (Same shape as
  ledger→viewer projections.)
- The base bundle stays frozen; every cascade artifact lands in the **draft
  overlay** (`#539/#555` contract) or in run staging — never in base cards.
- **Nothing auto-resolves silently**: every item settled by the cascade cites
  the frame `answerEventId` in its recorded reason.

## 4. Frozen interface decisions

1. **The frame patch gains a `containerMapping`** (the planner CAN safely
   enumerate container-level dispositions — that is frame-altitude knowledge,
   unlike card membership):

   ```json
   {
     "schemaVersion": 1,
     "patchId": "patch-frame-search-space",
     "agendaItemId": "frame-search-space",
     "answerEventId": "<ledger event id>",
     "resolution": "resolved",
     "cardUpdates": [],
     "containerMapping": [
       {"from": "product-shell",        "disposition": "rename", "to": "viewer",   "basis": "director: 'Viewer (was Product Shell)'"},
       {"from": "session-wake",         "disposition": "rename", "to": "triggers", "basis": "director: 'Triggers (was Session Wake)'"},
       {"from": "vision-onboarding",    "disposition": "demote", "to": null,       "basis": "director: 'one play among thousands'"},
       {"from": "knowledge-production", "disposition": "demote", "to": null,       "basis": "director: 'prototyping in progress'"},
       {"from": "canvas",               "disposition": "hold",   "to": null,       "basis": "director: 'needs its own conversation'"},
       {"from": "ledger",               "disposition": "keep",   "to": null,       "basis": ""}
     ]
   }
   ```

   Dispositions: `keep · rename · merge · demote · hold`. `merge` carries
   `to` = the surviving container. Unlisted containers = `keep`.

2. **AX derives per-card updates mechanically from the mapping.** A `rename`
   or `merge` applies `set.context` to *every* card in the source container —
   deterministic, no membership guessing, so guardrail (2) is preserved in
   spirit: the planner never enumerates cards; AX does, from the filesystem.
   `demote` moves no cards in this slice: demoted containers' cards get
   `status` untouched and their items handled per (4). `hold` changes nothing.

3. **The keystone redrafts as a draft-overlay artifact.** After the mapping
   applies, a deterministic step renders a proposed index card — the
   director's ruling prose fitted to the post-cascade container set, validated
   by the existing `check-keystone` invariant (story links ⟺ containers with
   cards, both directions) **against the post-cascade set** — and appends it
   to the draft log as a `keystoneDraft` entry (new top-level field beside
   `cardUpdates`, never a base-card write). The Drafts tab renders it as "the
   proposed index card." Base keystone repair remains a future bank/re-emit
   act.

4. **Agenda re-projection.** A new deterministic step
   (`ax internal front-of-house apply-frame-ruling`, or folded into
   apply-patch when `containerMapping` is present) rewrites `agenda.json`:
   items in renamed/merged containers retarget (placement, context labels);
   items in `demote`d containers auto-resolve through the **existing residual
   machinery** with reason `settled by frame ruling <answerEventId>: <basis>`
   (no new event types — reuse `residual_gap_recorded`); `hold` containers'
   items stay staged. **Director ruling (2026-07-02): cascade auto-resolutions
   are a distinct state from director-ruled resolutions** — "if the agents are
   making really bad calls by erasing good questions based on director input,
   we need to know that that is happening." Every cascade resolution carries a
   machine-attributable marker (the process actor + the `settled by frame
   ruling` reason prefix) so downstream surfaces (the Notepad plan) can render
   it distinctly and the director can audit the erasures. `stage-next` continues from the re-projected agenda.
   Auto-resolved items appear in RESIDUAL-GAPS.md under their own heading
   ("Settled by the frame ruling") so finalize accounting stays honest.

5. **The Drafts surface renders rulings, not only card diffs.** Every patch
   in the log renders an entry even with zero `cardUpdates` (headline: the
   agenda item + resolution + a ruling excerpt); `containerMapping` renders as
   the map delta; `keystoneDraft` renders as the proposed index card. (This
   also fixes the observed "director's largest ruling renders as nothing.")

6. **Approval shape** (director ruling wanted, recommendation below): the
   conversational approval already banked in the frame answer authorizes the
   *mapping*; the keystone draft is presented for approval **as the next
   staged gate** (one extra yes/no-style director turn: "here is the redrafted
   index card — approve, or correct"). On approval the cascade (4) fires; on
   correction the planner revises the mapping once and re-stages. This keeps
   propose-don't-rule intact at the one altitude where a mistake would cascade.

## 5. Slices (one capability per factory issue)

- **S1 — mapping in, mechanical fan-out** (ax): patch schema gains
  `containerMapping`; validation (unknown container, overlapping mappings,
  `merge` target must exist or be created by another mapping entry);
  apply-patch derives whole-container `set.context` updates into the draft
  log. No agenda changes. Tests: rename fans out to all N cards of a fixture
  container; demote/hold move nothing; idempotent re-apply; regression —
  mapping-less patches unchanged.
- **S2 — agenda re-projection + auto-resolution** (ax): the cascade step per
  decision 4; workflow edge after the frame patch applies. Tests: retargeted
  items stage under new labels; demoted items land in RESIDUAL-GAPS.md with
  the ruling's event id; resolved-id scoping still per play run; a walk with
  `keep`-only mapping behaves exactly as today.
- **S3 — keystone draft + approval gate** (ax + workflow + prompt): decision
  3 + 6. Tests: rendered draft passes `check-keystone` against the
  post-cascade set; rejection path re-stages once then residuals; base
  keystone byte-identical throughout.
- **S4 — Drafts surface renders rulings** (viewer + ax loader): decision 5,
  plus a scoping fix observed live (2026-07-02): the overlay counts a patch
  "applied" only when it changes a card file, and section confirmations are
  suppressed whenever no card-touching patch exists — so a walk's early
  rulings (empty frame patch, section closes) render as a blank panel.
  Section confirmations must render whenever their events exist for the
  walk, independent of applied card updates. Tests: zero-cardUpdates patch
  renders a ruling entry; a section_confirmed with zero applied patches
  renders its header/summary; mapping renders as map delta; keystoneDraft
  renders; existing card-diff rendering regression.

- **S5 — ruling-aware agenda triage** (ax + prompt; the "generalize from my
  answers" capability): after each banked ruling, a triage pass re-reads the
  remaining agenda items against the full corpus of banked rulings for the
  walk and classifies each: `unaffected` (stage normally) · `answered`
  (auto-resolve as `settled-by-triage`, citing the ruling event ids it
  generalized from) · `reframed` (the item stages, but its ask is rewritten
  to not re-ask what the rulings already state, original preserved). This
  tier IS judgment (an ACP pass, unlike S2's deterministic mapping) and is
  safe only because of the distinctness contract: every triage settlement is
  visibly machine-made, provenance-linked, and reopenable via the Notepad;
  over-generalization is a QA-visible event, not a silent erasure. Triage
  runs after the frame cascade and after each section close. Tests: an item
  answered verbatim by a prior ruling settles with correct provenance; an
  orthogonal item is untouched; a reframed item preserves its original
  question; the director can re-open a triage settlement and it re-stages.

Order: S1 → S2 → S3; S4 parallel after S1; S5 after S2 (it consumes the
cascade's provenance conventions). All four are
`alexandria-dev-factory-issue-authoring`-style issues; this plan is their
shared `Plan:` link.

## 6. Scope fences

- No Back-of-House scanner changes (the scan's carve remains its honest
  best-guess; the cascade is EL3's).
- No base-bundle writes anywhere in the cascade; `git status` on the bundle
  stays clean for the whole walk.
- The cascade never invents structure the mapping doesn't state; ambiguity in
  the director's prose is the planner's problem at translation time and
  surfaces as a `hold` disposition, never a guess.
- `canvas`-style `hold` items are first-class: the walk continues to stage
  them normally.
- Existing walks/fixtures without frame rulings (or with `keep`-only
  mappings) are behaviorally unchanged — the whole feature is additive.

## 7. Live specimens (for the builder's fixtures)

- The 8→5 reshape ruling: ledger `answer_recorded` on run
  `01KWHFN1SA5R413ASARCRN79VW` (and its predecessor on `01KWH7PE…`);
  the empty `patch-frame-search-space` in
  `studio/drafts/alexandria-product/patches.json`.
- The manual cascade: subsequent answers in the same walk that enact the
  reshape item-by-item ("per the frame ruling: …") — each is a worked example
  of what S2 should have done automatically.
- Bundle (post-#563): `docs/alexandria/sweeps/alexandria-product/`.

## 8. Open questions — RULED (director, 2026-07-02)

1. **Ruled: yes to the keystone-approval gate.** The redrafted index card is
   the one artifact the director should see (the lodestone); everything
   downstream of approval is behind-the-scenes mechanics per §1b.
2. **Ruled: `demote` never touches card status.** Status minutiae is
   behind-the-scenes clay; demotion off the map is not deprecation of cards.
3. **Ruled: the bank act.** The approved keystone draft banks to base via
   the deliberate draft→base bank; the walk's base-frozen guarantee stays
   absolute.
