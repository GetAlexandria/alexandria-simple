# Vision reshape — wire `shape` + `the-work` slots and the Refusal & Fence into the app

## Summary

Add two slots to Raven's Vision onboarding — **The Shape** and **The Work** —
and reshape **The Refusal** into **The Refusal & Fence**, across the four app
surfaces that define a Vision slot: the slot manifest, the banked-markdown
emitter, the elicitation guidance, and the drafting skill pegs. This is the
shipped-surface wiring slice of [Move V](./plan.md) in *Capture the Work*; the
authoritative slot drafts (ids, labels, order, purposes, and the exact
elicitation copy) live in [vision-reshape.md](./vision-reshape.md) and this issue
freezes them as a contract.

## Motivation / Problem

For library-building, the Vision is the **investigation's prior**: it points the
sweep at the suspects worth chasing and prunes the ones to skip (Vision = prior,
sweep = evidence, library = posterior — see [plan.md](./plan.md) §5 Move V). The
current 9-slot Vision is a persuasion arc; it has **no slot that names the core
unit of work or the shape of the software**, so the sweep harvests the work in
Event Storming and then structurally drops it (plan.md §2). The first PMS dogfood
produced a faithful static noun map and under-told the one story most central to
the product — the assembly line that moves a play across stages and contexts.

This slice makes the work and the shape **first-class Vision questions** and turns
Refusal into an explicit scope **fence** the build can read. It is the cheapest,
highest-leverage move in the sequence (plan.md §6.1): it re-points every future
sweep without touching the sweep itself.

## Proposed contract

### 1. Two new manifest entries (`RAVEN_VISION_SLOT_MANIFEST`, `raven-vision.ts`)

The slot definition shape is `{ id, label, order, purpose }`. Add these two
entries verbatim:

```ts
{
  id: "shape",
  label: "The Shape",
  order: 7,
  purpose: "What kind of work the product does, so the build knows where to look and what to skip",
},
{
  id: "the-work",
  label: "The Work",
  order: 8,
  purpose: "The central unit of work and the path it takes from raw to done",
},
```

And reshape the existing `refusal` entry's `purpose` (label and id unchanged):

```ts
{
  id: "refusal",
  label: "The Refusal & Fence",
  order: 11,
  purpose: "What the product will not be — and, for the build, what is out of scope or not to look for",
},
```

The resulting full slot order is exactly (by `order`, 1→11):

1. `person` — The Person
2. `named-pain` — Named Pain
3. `discovered-pain` — Discovered Pain
4. `shift` — The Shift
5. `inadequacy` — The Inadequacy
6. `mechanism` — The Mechanism
7. `shape` — The Shape  *(new)*
8. `the-work` — The Work  *(new)*
9. `felt-experience` — The Felt Experience
10. `proof` — The Proof
11. `refusal` — The Refusal & Fence  *(reshaped)*

> Note: the current shipped order in `RAVEN_VISION_SLOT_IDS` /
> `RAVEN_VISION_SLOT_MANIFEST` begins `shift, person, named-pain, …`. The frozen
> order above (from [vision-reshape.md](./vision-reshape.md)) is the target; both
> the `RAVEN_VISION_SLOT_IDS` tuple and the manifest must reflect it, and the two
> must stay in agreement (the manifest is iterated by `order`, the tuple drives
> reducers/projection — see Decisions).

### 2. Banked markdown (`buildRavenSourceOfTruthMarkdown`, `raven-vision.ts`)

The emitter iterates `RAVEN_VISION_SLOT_MANIFEST` and writes one `### <label>`
section per approved, non-empty slot. With the manifest above it MUST be able to
emit, in manifest order, the new headers:

- `### The Shape`
- `### The Work`

and the reshaped header `### The Refusal & Fence` (replacing `### The Refusal`).
No other section text changes. The section body is still the slot's approved
`text`, trimmed by `trimBlankLines`, exactly as today.

### 3. Elicitation guidance (`vision-slot-guidance.ts`)

The guidance entry shape is `{ prompt, pullingFor, quickTest, length }`. Add
these two entries verbatim:

```ts
shape: {
  prompt:
    "What shape is this product's core work? Pick the closest: pipeline / assembly-line (a unit transformed through ordered stages), transaction / CRUD (operations on records), interaction loop (a turn loop threading state), decision / calculation (inputs → rules → outputs), or reactive / event-driven (event → policy → reaction). Name the shape — and name any shape it explicitly is not.",
  pullingFor:
    "the classifier that tells the build which evidence trails to chase and which to skip",
  quickTest:
    "Could a builder predict where to look first — and what to ignore — from this one word?",
  length: "one shape + 1–2 'not this' exclusions",
},
"the-work": {
  prompt:
    "Trace the core work by naming five things — terse, a list or table, not an essay: 1. Unit — the central record the work accumulates around (the 'pile': reservations, plays, tickets). 2. Path — the ordered stages it moves through, raw → done. 3. Status — the field/enum the system actually stores to mark each stage. 4. Places — the contexts/containers the work passes through (note any it revisits or steps out to). 5. Advances — what moves it stage to stage (the commands, gates, or rules). One unit's lifecycle, birth to done.",
  pullingFor:
    "the throughline — the work threaded through the structure; the spine the sweep reconstructs and confirms against source",
  quickTest:
    "Could you draw it as a thread crossing columns (places) down rows (stages) — like the PMS reconstruction in pms-workflow.html?",
  length: "the five coordinates, terse",
},
```

And append a scope-fence clause to the existing `refusal.prompt`. The new
`refusal.prompt` is the current string followed by:

> "…and name what the library build should *not* chase: subsystems out of scope,
> shapes this product is *not* (from The Shape), and neighbors that are external
> dependencies rather than parts of this product."

`refusal`'s `pullingFor`, `quickTest`, and `length` are unchanged.

### 4. Drafting skill pegs (`raven-vision-drafting/references/slots/`)

Add `shape.md` and `the-work.md` (peg-note guidance, matching the existing peg
file structure — Job / Not the job / failure modes / sharpness target /
diagnostic test / how it connects / examples), sourced from the peg notes in
[vision-reshape.md](./vision-reshape.md):

- `shape.md`: the shape selects the suspect lineup (pipeline → central record +
  status field + stage loop; decision → rule surfaces; reactive →
  event→reaction handlers; CRUD → entities + state transitions, static map
  largely enough); the shape is a *prior*, not a verdict — the sweep confirms or
  corrects it.
- `the-work.md`: the five coordinates of work (Case · State · Activity · Place ·
  Event) stated as intent; the director answers from intent, the agent confirms
  from `board-state.json`-style status fields, the loop/command surfaces, and
  per-case artifacts; deltas (Vision claims a stage the source can't show) are
  the most valuable threads.

Revise `refusal.md` to cover the **& Fence** half: the prune — name what the
library build should *not* chase (out-of-scope subsystems, shapes it is *not*,
external-dependency neighbors), mirroring the sweep's hand-applied Vision-anchor
scope cut (e.g. "scan only the Studio, not Alexandria's library/atomizer"). Keep
the existing trap-shaped anti-position guidance intact and add the fence as the
second half.

### Decisions

- **Final slot ids / labels / order are frozen as the 1→11 table above.** The two
  new ids are `shape` and `the-work` (kebab-case, matching `named-pain` /
  `discovered-pain` / `felt-experience`). `shape` sits at order 7, `the-work` at
  order 8 — **`the-work` immediately precedes `felt-experience`** (the mechanics
  band sits before the illustrative scene).
- **`shape` is a free-text value, not a closed enum.** The five named shapes
  (pipeline / CRUD / loop / decision / reactive) live only in the prompt copy as
  the suggested closest-fit lineup; the stored slot `text` remains free prose
  (the prompt explicitly also asks for "any shape it explicitly is *not*", which
  an enum could not hold). No new enum type is introduced for shape.
- **The slot status/state machine is unchanged.** New slots use the same
  `RavenVisionSlotStatus` (`empty | needs_review | approved | skipped`) and the
  same per-slot state shape; `createInitialRavenVisionState` seeds them `empty`
  like every other slot, purely by virtue of being in `RAVEN_VISION_SLOT_IDS`.
- **Banked section headers are exactly `### The Shape`, `### The Work`, and
  `### The Refusal & Fence`** — they are `### ${definition.label}`, so they are
  fully determined by the manifest `label` and need no separate string.
- **`RAVEN_VISION_SLOT_IDS` and `RAVEN_VISION_SLOT_MANIFEST` must both list all
  11 slots and agree on membership.** The tuple is the type/reducer source; the
  manifest carries order/label/purpose and is what the emitter and projection
  iterate. (Order within the tuple is not load-bearing for output — the emitter
  uses the manifest — but the two sets of ids must match or projection/seeding
  breaks.)
- **Why-band author routing is a Decision + acceptance constraint, not a flow
  rewrite in this slice.** Per [vision-reshape.md](./vision-reshape.md), the
  market/intent slots (`shift`, `person`, `named-pain`, `discovered-pain`,
  `inadequacy`, `proof`) are **director-asserted: the agent does not author/draft
  them**; the mechanics slots (`mechanism`, `shape`, `the-work`) are the
  source-extract band. This slice adds the two slots and the fence; it does **not**
  re-architect the elicitation/draft-pass flow to enforce director-only authoring.
  If wiring a no-AI-draft pass for the Why band is non-trivial, capture it as a
  follow-on issue (see Implementation notes).

## Acceptance criteria

Observable behavior when this slice is done:

- [ ] `RAVEN_VISION_SLOT_MANIFEST` contains entries for `shape` (order 7) and
      `the-work` (order 8) with the exact `label` and `purpose` strings frozen
      above.
- [ ] The `refusal` manifest entry's `label` is `"The Refusal & Fence"` and its
      `purpose` is the reshaped string frozen above; its `id` is still
      `"refusal"`.
- [ ] `RAVEN_VISION_SLOT_IDS` includes `"shape"` and `"the-work"`, and
      `isRavenVisionSlotId("shape")` / `isRavenVisionSlotId("the-work")` return
      `true`.
- [ ] `slotGuidance` (`vision-slot-guidance.ts`) has `shape` and `the-work`
      entries whose `prompt`, `pullingFor`, `quickTest`, and `length` match the
      frozen strings byte-for-byte.
- [ ] `slotGuidance.refusal.prompt` ends with the appended scope-fence clause
      frozen above; its `pullingFor`, `quickTest`, and `length` are unchanged.
- [ ] For a vision state where `shape` and `the-work` are `approved` with
      non-empty text, `buildRavenSourceOfTruthMarkdown` output contains the
      headers `### The Shape` and `### The Work`, in manifest order, with the
      slot text as the body.
- [ ] For a vision state where `refusal` is `approved` with text,
      `buildRavenSourceOfTruthMarkdown` emits `### The Refusal & Fence` and does
      **not** emit `### The Refusal`.
- [ ] Peg files `shape.md` and `the-work.md` exist under
      `raven-vision-drafting/references/slots/` and `refusal.md` covers the fence
      (out-of-scope / shapes-it-is-not / external-neighbor prune) in addition to
      its existing anti-position guidance.

Negative / regression:

- [ ] **The other nine slots are unchanged in order, id, label, and purpose** —
      `person`, `named-pain`, `discovered-pain`, `shift`, `inadequacy`,
      `mechanism`, `felt-experience`, `proof` keep their existing `{id, label,
      purpose}` exactly (only their `order` values shift to match the frozen
      1→11 table).
- [ ] **Banked markdown for the existing approved slots is byte-identical to
      before, except** (a) the two added `### The Shape` / `### The Work`
      sections and (b) `### The Refusal` becoming `### The Refusal & Fence`. The
      preamble (`# Raven Product Context` … `## Vision`), the `### <label>` /
      blank-line / body / blank-line section format, and the trailing-newline
      normalization are unchanged.
- [ ] `slotGuidance` for the eight non-`refusal` existing slots is unchanged
      (no prompt/pullingFor/quickTest/length drift).
- [ ] A `shape` slot whose text names a shape **not** in the five-item lineup
      still banks (free-text, no enum rejection); skipping `shape` or `the-work`
      behaves like skipping any other slot (no section emitted, vision can still
      reach `ready_to_bank`).
- [ ] No acceptance/spec/validation text is rendered in the Vision UI. The
      prompt/pullingFor/quickTest/length strings **are** on-screen elicitation
      copy and render as today; nothing in this issue (purposes, decisions,
      criteria) appears as user-facing copy or a "contract valid" banner.

**Test matrix** (the named cases this slice must cover):

- *Manifest shape* — all 11 ids present in both `RAVEN_VISION_SLOT_IDS` and
  `RAVEN_VISION_SLOT_MANIFEST`; `shape`/`the-work` literal `{label, purpose,
  order}`; `refusal` reshaped `{label, purpose}`; the eight others unchanged.
- *Guidance strings* — `shape` and `the-work` `{prompt, pullingFor, quickTest,
  length}` equal the frozen literals; `refusal.prompt` has the fence suffix; the
  eight other guidance entries unchanged.
- *Banked markdown — additions* — approved `shape` + `the-work` emit
  `### The Shape` / `### The Work` in manifest order with bodies.
- *Banked markdown — reshape* — approved `refusal` emits `### The Refusal &
  Fence`, never `### The Refusal`.
- *Banked markdown — regression* — for a fixture exercising the original eight
  approved slots, output is byte-identical except the Refusal header rename
  (snapshot/equality).
- *Free-text shape* — a `shape` value outside the five-item lineup banks
  without rejection.
- *Skip path* — skipped `shape` / `the-work` emit no section and do not block
  `ready_to_bank`.
- *Pegs present* — `shape.md`, `the-work.md` exist; `refusal.md` includes the
  fence half.

## Implementation notes

**Scope fences:**

- **One capability: the Vision slot/manifest/guidance/peg + banked-markdown
  wiring in the app.** Nothing else.
- **The sweep's salience-lens change is OUT.** [vision-reshape.md](./vision-reshape.md)
  also re-points the Back-of-House sweep's Vision-anchor lens from *"Mechanism +
  Felt Experience + Proof"* to *"Shape + The Work"* (`back-of-house-walk/brief.md`,
  Move S). That is a **separate play-authoring track** and must not be touched
  here.
- **The Why-band no-AI-draft author routing is OUT of the flow this slice.** It
  is captured above as a Decision + acceptance constraint only (the band is
  *declared* director-asserted; the slots are added). Do **not** rewrite the
  `VisionOnboardingView` elicitation/draft-pass flow to enforce director-only
  authoring in this issue; if that enforcement is non-trivial, file it as a
  follow-on.
- **No contract/renderer work** (temporal link keys, a Process card, the
  cross-context lifecycle lens — plan.md Move C) is in scope.

**Relevant current files** (orientation only — the factory chooses what to edit;
this is not an edit recipe):

- `packages/ax/src/domain/raven-vision.ts` — `RAVEN_VISION_SLOT_IDS`,
  `RAVEN_VISION_SLOT_MANIFEST`, and `buildRavenSourceOfTruthMarkdown` (the
  emitter iterates the manifest and writes `### ${definition.label}` per
  approved non-empty slot).
- `packages/ax/src/domain/library-catalog.test.ts` and the existing
  `raven-vision` tests — where manifest/markdown coverage lives.
- `packages/viewer/src/components/library/vision/vision-slot-guidance.ts` — the
  `slotGuidance` record keyed by slot id; entry shape `{ prompt, pullingFor,
  quickTest, length }`.
- `packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/` —
  the per-slot peg files (`refusal.md` et al.) Raven reads before drafting.
- `packages/viewer/src/app/runtime/schemas` — the runtime
  `RuntimeRavenVisionSlotId` that `slotGuidance` is keyed by (its slot-id set
  must include the two new ids for the guidance record to typecheck).

**Reuse:** match the existing peg-file structure for `shape.md` / `the-work.md`
rather than inventing a new layout; keep slot ids kebab-case to match siblings.
The two prompt strings are user-facing elicitation copy — they are given here
verbatim precisely because they render on-screen, so do not paraphrase them.
