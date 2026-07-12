---
move: emit_bundle
doer: mechanical
consumes:
  - output_path: "__AX_INPUT_OUTPUT_PATH__" (required — the directory the bundle is written into)
  - scope: "__AX_INPUT_SCOPE__" (required — the filing boundary; only in-scope piles become cards)
  - events: runtime/EVENTS.md (required — the timeline and central record)
  - contexts: runtime/contexts.md (required — carved contexts, classified nouns, Hot Spots, suspect piles)
  - altitudes: runtime/altitudes.md (required — per-card altitude)
  - search_prior: runtime/library-search-prior.json (optional — copied to the bundle root when present)
  - repair_list: runtime/check-verdict.md (optional — present only on a repair pass; the exact fixes to apply)
emits: <output_path>/ — the bundle: stub cards, the _index keystone story, library.json, workflows.json, Ledger `library.thread_opened` events, STAGE-2-BRIEF.md, HOT-SPOTS.md, READ-COHERENCE.md, and library-search-prior.json when a prior exists
---

# Move: emit_bundle — write the whole bundle to disk

Assemble the draft library bundle from the runtime artifacts and write every
file into `__AX_INPUT_OUTPUT_PATH__`. The folder layout is a fixed rule; the body
prose inside each card takes your reading. Write **files with your file tool** —
naming a file you did not write is a failed run.

**If `runtime/check-verdict.md` exists** and carries a `REPAIR` fix list, this is
a repair pass: read it and apply **exactly** those fixes to the already-written
bundle, changing nothing else. Otherwise, write the full bundle fresh.

## The cards

One card per in-scope carded noun, at
`<output_path>/<context>/<type>/<Type> - <Name>.md`. A **suspect pile** from the
contexts file gets **no card and no directory** — its only representation is its
`out_of_scope_suspect` thread (below).

Every card opens with this frontmatter. `type`, `prefLabel`, `context`, `plane`,
`status`, `confidence`, and `proposed_by` are **all required** — a card missing
`confidence` or `proposed_by` is silently dropped at load:

```yaml
---
type: Surface
prefLabel: Gate Kiosk
context: gate
plane: product
status: stub
altitude: component
altLabels: []
source_evidence:
  - docs/terminal/gate-operations.md:14
confidence: medium
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Gate Pass
  contains:
    - Component - Lane Signal
  conforms_to:
    - Reference - Gate Operating Standard
  operates_on:
    - Entity - Container
  produces:
    - Reference - Inspection Report
  related_to:
    - Role - Dispatcher
---
```

The typed-link keys are exactly `contains`, `conforms_to`, `operates_on`,
`produces`, `related_to`, `derived_from` — the body names the target card, not
the key. A view that only *displays* another card uses `derived_from`, not a card
type of its own. A card whose category is itself a staged loop (a `Pattern` or
`Mechanism` that *is* an ordered lifecycle — not a `Pattern` that is a lens over
other cards) also carries a `flow:` list of its ordered stage names.

Then a body with **exactly these three headings**, in this order. A card with no
`## WHAT` loads as a gap, not a card:

```markdown
## WHAT
What it is or does, in a sentence or two.

## WHERE
Where it lives or is encountered.

## HOW
How it works, naming every linked card inline as a [[Type - Name]] reference.
```

**Link parity is a hard rule:** every target in the `links:` block is named in
`## HOW` as a `[[Type - Name]]`, and every `[[Type - Name]]` in `## HOW` has a
matching `links:` entry. The prose and the diagram must agree.

**Product-English bodies — the body names the product, the frontmatter holds the
machine.** The body is what the director reads: plain product English, the
product's own nouns, ordinary sentences. `## WHAT` / `## WHERE` / `## HOW` carry
**zero** file paths or filenames, code identifiers (camelCase, snake_case, dotted
event names, type names), route names, raw event indices like `(event 11)`, or
raw provenance ids. None of that is lost — a file or code reference lives in
`source_evidence` (add it there if it is not already), a ruling or event id lives
in frontmatter — and the *meaning* stays in product words. Translate each machine
token to what it means to a user of the product: "fires on a `source.added` with
no assessment (event 11)" becomes "fires when a new source is added but not yet
assessed"; a raw path in `## WHERE` becomes the product surface it names. Keep
every `[[Type - Name]]` wikilink verbatim — those are product nouns. If removing a
token leaves a sentence's meaning genuinely unclear, raise a Hot Spot; never fill
the gap with source mechanics or an invented product fact. A body is not done
until it carries no machine token *and* reads as a plain product sentence — the
token scan is the floor, not the ceiling.

## The _index keystone story

Write **exactly one** keystone card at `<output_path>/_index/<Type> - <Name>.md`
with `context: _index`, `altitude: keystone`, `plane: product`. Its body names
each **card-bearing container** once as a `[[wikilink]]`, and that set of links
must equal the set of container directories that actually hold cards — no more,
no fewer. A link to a container with no cards, or a card-bearing container the
story never links, fails the bundle. `runtime/` and `_index` are reserved and are
never linked or counted.

## The machine-readable sidecars

**`library.json`** — literally `{"schemaVersion":"product-card.v1"}`. This is the
gate that tells the loader to read this root as product cards.

**`workflows.json`** (schemaVersion `library-workflows.v1`) — the central
record's lifecycle, reconstructed from `runtime/EVENTS.md` plus each event's
state. When a search prior exists, start `unit` and the intended path from the
prior's `workThread`, then confirm against the events — a declared stage with no
event is a gap thread, an event with no declared stage is surfaced too:

```json
{
  "schemaVersion": "library-workflows.v1",
  "workflows": [
    {
      "id": "container-handling",
      "unit": "Container",
      "steps": [
        { "order": 0, "activity": "Gate-in", "context": "gate", "doer": "Dispatcher", "stateAfter": "received", "cardRefs": [], "evidence": "docs/terminal/gate-operations.md:14" },
        { "order": 3, "activity": "Customs clearance", "context": "customs", "doer": "Inspector", "gate": true, "stateAfter": "cleared", "cardRefs": ["Mechanism - Customs Gate"], "evidence": "docs/terminal/customs.md:8" }
      ]
    }
  ]
}
```

Each `context` MUST be a carved context and MAY recur; `order` is the sequence;
`cardRefs` point at emitted cards; `gate: true` marks a human-decision step;
`evidence` cites the source `file:line` each step was reconstructed from.

**Ledger `library.thread_opened` events** — the loadable form of every Hot Spot
and gap. Do not write a bundle-local thread sidecar; the Front-of-House agenda
reads the project Ledger projection. Each thread event payload carries a
`threadId`, a `family` (`gap` | `hot_spot`), and a **canonical `kind`** — gaps
are `missing_card` / `missing_context` / `missing_material`; hot spots are
`docs_disagree` / `judgment_punt` / `polysemy` / `runtime_vs_design` /
`demotion` / `split` / `out_of_scope_suspect`. Emit the canonical kind directly
— never a compound or hyphenated word. Every thread also carries its **notepad
provenance**:

- **`question`** — the director-register decision it raises, phrased for the
  director to answer, **not** a copy of `reason`.
- **`reason`** — the builder-register flat statement of the finding.
- **`emittingMove`** — the move that raised it: `survey` / `translate_search_prior`
  / `pass1_events` / `pass2_carve` / `pass3_altitude` / `emit_bundle` /
  `check_bundle`.
- **`sourceEvidence`** — `file:line` refs; `[]` only for a true absence with no
  anchor.

Every emitted thread starts open. Resolving a thread is the downstream review's
job, never yours. Append one event per thread with `ax inspect events append
--type library.thread_opened --payload-file <payload.json> --idempotency-key
boh:thread:<bundle>:<threadId> --json`; AX fills the event id, timestamp, and
actor.

```json
{
  "threadId": "hot-spot-two-gate-rules",
  "family": "hot_spot",
  "kind": "docs_disagree",
  "concerns": [{ "type": "card", "cardId": "Mechanism - Customs Gate" }],
  "confidence": "high",
  "severity": "high",
  "question": "Two conflicting customs-gate rules coexist in source — which is canonical, or do both stay?",
  "emittingMove": "pass1_events",
  "sourceEvidence": ["docs/terminal/customs.md:8", "docs/terminal/gate-operations.md:14"],
  "reason": "Two conflicting customs-gate rules coexist in the source.",
  "backfill": {
    "bundle": "__AX_INPUT_OUTPUT_PATH__",
    "sourceKey": "hot-spot-two-gate-rules",
    "sourcePath": "back-of-house-walk:emit_bundle"
  }
}
```

**Every suspect pile** from the contexts file becomes exactly one
`out_of_scope_suspect` thread (`family: "hot_spot"`) with a stable id from the
normalized pile name, a context concern naming the pile, the card-worthy
`sourceEvidence`, a `question` asking "mine, include next sweep" vs "not mine,
drop," and a `reason` giving the proposed disposition. No cards, no directory for
that pile.

**When a search prior exists**, also emit each unresolved low-confidence
inference as a `gap` thread with `emittingMove: "translate_search_prior"`,
`confidence: "low"`, the prior's `basis` in `reason`, and `sourceEvidence: []`;
plus **one** `missing_context` **search-frame** thread (same `emittingMove`)
whose `question` confirms the assumed domain and fence. These are the
"ask when we can't log it from source" half — the `translate_search_prior` tag is
how the downstream triage tells an inference-to-confirm from a source gap.

## The reports and the prior copy

- **`STAGE-2-BRIEF.md`** — the director-only questions, assembled by tier
  (naming · process · runtime · values · implementation · architect-only) from
  every director-facing Hot Spot plus every question the walk surfaces (the
  "are these the right card types?" question goes here by default when no answer
  key was given).
- **`HOT-SPOTS.md`** — the roll-up of every inline Hot Spot, for easy scan.
- **`READ-COHERENCE.md`** — your honest self-assessment: what a stranger would
  understand from the bundle, what they wouldn't, **three named reservations**,
  and a "Hot Spots that are likely real product flaws" callout. Do not claim
  coherence the bundle hasn't earned.
- If `runtime/library-search-prior.json` exists, copy it to
  `<output_path>/library-search-prior.json`.

## Hard limits

- **Keep `runtime/` out of the bundle root.** `runtime/EVENTS.md` and all scratch
  stay under `runtime/`. Do **not** lift `EVENTS.md` to the root and do **not**
  write a top-level `README.md` — the loader reads every other top-level `.md` as
  a card, so a stray markdown file becomes a broken card. Fold navigation into
  `READ-COHERENCE.md`.
- **Never name a carved context `runtime` or `_index`** — both are reserved; use
  `runs`/`execution` for an execution context or its cards are silently skipped.
- **Write cards only for in-scope piles.** A suspect pile is excluded from card
  and directory emission even when its evidence is card-worthy.
- **No machine-speak in a card body.** A file path, filename, code identifier,
  route name, or raw event index in `## WHAT`/`## WHERE`/`## HOW` is a defect —
  the reference belongs in `source_evidence` or frontmatter, the meaning in plain
  product words.
- **Your knowledge is not a source.** Every card body, link, event, and thread
  traces to the runtime artifacts and the source they cite. Invent nothing.

**Output discipline.** Your deliverable is the written bundle. Use your
file-writing tool for every file above; your reply is a short confirmation of
what you wrote (counts and paths). A reply that names files but writes none is a
failed run.
