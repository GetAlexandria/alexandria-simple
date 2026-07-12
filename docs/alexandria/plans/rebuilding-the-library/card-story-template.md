# Card Story Template — the programmatic spec

**Status:** Draft spec (2026-06-25). The hard, repeatable logic for the
review-page story + diagram, derived from the elicitation process (ES→DDD→C4)
and the two-bucket model. Goal: a template a machine can fill consistently
across millions of build-outs, and a director can approve in seconds. See
[[library-review-page-model]] [[library-operations-pipeline]].

## The two buckets (the atomic-card jobs)

Every noun's story fits into one or both:

1. **WHAT it does** — the job. Who it's for + the outcome + why it matters. (JTBD.)
2. **HOW it does it** — the mechanism. The pieces + the verbs + the triggers/state.

Sophistication is **not more buckets** — it's **harder slots inside these two**,
keyed by the noun's type.

## Did the elicitation give us usable material? YES.

The back-of-house/front-of-house walk already produced, per the methods:
- **Per-noun `WHAT/WHY/WHERE/HOW/WHEN`** (the stub cards). `WHAT`+`WHY` -> bucket 1;
  `WHERE`+`HOW`+`WHEN` -> bucket 2.
- **`STUDIO-EVENTS.md`** — a time-first Event-Storming timeline: ~22 **past-tense
  Domain Events**, each with **Triggered by** + **Lands in** (e.g. "Play Slot Named
  | Director adds an identity row | registry.js"). This is the raw "how it does it"
  flow, with triggers and landing places already captured.
- **`STAGE-2-BRIEF.md`** — the director-question agenda (the gaps): the 8 job
  categories (only 5 known), Tier semantics, Stage-vs-Status reconciliation. These
  are the unanswered slots the front-of-house walk fills.
- The method grammars are already applied: **DDD** ubiquitous-language nouns,
  **C4** altitudes per card, **ES** past-tense events with triggers.

**The two real gaps:** (a) events live in `EVENTS.md`, not yet as cards; (b) the
STAGE-2 questions need the director's answers (the unification). Everything the
template needs is present in the material.

## The hard rules (apply to every sentence)

- **R1 — Ubiquitous Language.** Every noun is the director's actual word. It
  resolves to a card (link) or is flagged external (gray). Never invent a word.
- **R2 — Verb tense.** Mechanism verbs are **present-tense operational**
  (*lists, records, advances, derives*). Domain events are **past-tense**
  (*Play Slot Named*). Never mix the two in one sentence.
- **R3 — Named trigger.** Every change/advance names its trigger — a **Role**
  (Director) or an **Event**. No passive "it happens." (From the EVENTS
  *Triggered by* column.)
- **R4 — State is enumerated.** Any noun that holds state lists its **states**
  and names the **transition trigger**. (Stage: the six columns + the Director gate.)
- **R5 — Altitude discipline.** A sentence stays at the card's altitude. A piece's
  internals belong on the piece's own card (drill down). (C4 "don't mix levels.")
- **R6 — Source-grounded.** Every claim traces to the card's `evidence`.
  No unsourced assertion (the back-of-house anti-fabrication rule).
- **R7 — Completeness (no orphans).** **Every defined term (card) in a context
  MUST appear in the lead's how-it-works** — as a story link or a diagram
  connector — *or* be explicitly relegated (it belongs to a sub-part one altitude
  down, or it's misfiled to another context). A card defined beneath a part but
  absent from the part's how-it-works is a **bug**, not a stub. This is the rule
  that catches what "pretend there's no Part 2" broke: dropping the facets
  (`Status`/`Prio`/`Tier`/`Job Category`) left four orphaned cards. **Lint:**
  `context cards − cards referenced by the lead's story or connectors = orphans`
  → every orphan is flagged for the director (cover it, relegate it, or remove it).
- **R8 — Chunking (prose chunks; the diagram sequences).** Keep every **verb
  welded to its noun** — one bound chunk per relationship (*"designs each play in
  the brief"*), so the sentence reads on the first pass. The **order/topology**
  between chunks is the **diagram's** job (it already lives in the typed `links:`
  / `flow`) — the sentence must never re-encode the arrows. Use the bare
  arrow-list (`A → B → C`) in prose *only* for **verbless** atomic states (the
  Value/State form); whenever a step carries a verb, write **pair-major** (the
  Aggregate form). **Lint:** a clause that lists N nouns then N verbs across a
  dash/semicolon is a **noun-major smell** → rewrite to N verb-welded-to-noun
  chunks.

## The mad-libs (fill these; type picks the HOW line)

**Body heading canon:** card bodies use standalone headings in this order:

1. `## WHAT`
2. `## WHY`
3. `## WHERE`
4. `## HOW`
5. `## WHEN` only for `horizon: future` cards, per the WHEN slot below.

**Bucket 1 — WHAT it does (one line, all types):**
> `{Noun}` lets `{Role}` `{outcome: present-tense capability}` so that `{why/value}`.
- *The Work Board lets the Director move every play forward on purpose so nothing advances by accident.*

**Bucket 1 — WHY it exists (one line, all types):**
> `{Noun}` exists because `{strategy-plane bet/principle/decision}` needs `{product reasoning}`.
- *The Work Board exists because Director gates need one visible place to hold play movement accountable.*

**Bucket 2 — HOW it does it (one line, keyed by the noun's type):**

| Type | Mad-lib | Diagram it pairs with |
|---|---|---|
| **Aggregate / Surface** (coordinates parts) | It `{verb}`s `{Piece}` and `{verb}`s `{Piece}`; it `{verb}`s `{object}` only when `{Role/Event}` `{triggers}`. | structure hub (pieces + verb connectors) |
| **Value / State** (an enum) | `{Noun}` is one of `{ordered states}`; a `{subject}` moves `{state}`→`{state}` when `{trigger}`. | lifecycle flow (the states, left→right) |
| **Capability / Gate** (an operation) | `{Noun}` takes `{input}` and produces `{output}` by `{operation}`; it runs when `{trigger}`. | input→operation→output |
| **Read-Model** (derived view) | `{Noun}` shows `{info}` derived from `{Aggregate}`'s `{events/state}`; it holds no state of its own. | derived-from arrow |
| **Event** (past-tense fact) | `{Event}` fires when `{Role/Command}` `{acts}` on `{Aggregate}`; it lands in `{place}` and triggers `{Policy}`. | ES timeline (event • trigger • lands-in) |
| **Role / Entity** (an actor / identified thing) | `{Noun}` `{does what in the flow}`, identified by `{key}`. | actor lane / entity node |

*Worked (Work Board, Aggregate):* "It gives each **Play** a **Stage** and advances
it one step only when the **Director** confirms a gate; every move is recorded in
**Board State**, and identity is drawn from the **Play Registry**." → structure hub.

*Worked (Stage, Value):* "Stage is one of **Backlog → Sourced → Designed → Built →
Proven**; a play moves one Stage when the **Director** confirms a gate." → lifecycle flow.

## The WHEN slot (planning/roadmap — `horizon: future` cards only)

Two senses of "when" exist and must never share a home:

- **Mechanism when** — a trigger condition (*"a play moves one Stage when the
  Director confirms a gate"*). That is **HOW material** — R3 (named trigger)
  and R4 (state transition trigger) already own it. It never moves to WHEN.
- **Planning when** — "when will this exist in the product." That is the
  `## WHEN` section, and it exists **only** on a card whose frontmatter says
  `horizon: future` (absent or `now` = the card describes current reality and
  carries no WHEN). On a `future` card, WHEN is required the same way
  WHAT/WHY/WHERE/HOW are.

**Bucket placement:** WHEN joins bucket 2 (`WHERE`+`HOW`+`WHEN` -> how it
does it), last.

**The mad-lib (one or two lines):**
> Planned via `{plan origin: release plan / issue / tracker card}`;
> `{the parts that do not exist yet}` `{is/are}` not built in the shipped
> product today.

- *Planned for the Q3 Builder-hardening pass (release-plan-5); the Builder
  view's bundle-diff mode does not exist in the shipped viewer.*

**The hard rules apply (R1–R8), plus two of its own:**

- **W1 — Cited origin.** A `horizon: future` card carries at least one
  `evidence` entry pointing at the plan's origin (a release plan, a
  doc id, a GitHub issue, a tracker card). Same field, same discipline as R6
  — no new citation mechanism.
- **W2 — Plain-text origins.** Name the plan origin in prose as plain text
  and cite it in `evidence` — never as a `[[wikilink]]` (a wikilink
  claims a card exists and would raise a spurious missing-card gap).

## Relationships are typed links (the WHERE layer)

A noun's relationship to another noun is a **typed link**, authored in the card's
`links:` frontmatter — not prose. The operational vocabulary (the canonical keys):
`contains`, `produces`, `derived_from`, `operates_on`, `conforms_to`,
`related_to`. The HOW sentence's verb *names* the link and the diagram *draws*
it — "Risk Map **derives from** Proof Spec" ⇒ `links.derived_from: [[Proof Spec]]`.
A link whose target lives in **another context** is a **seam**: render it as a
deliberate overlay, never baked into the containment. (A prose `Verb: [[X]]` edge
is a fallback only; prefer `links:`.)

## Composing the mad-libs (the highest altitude)

The type mad-libs are not exclusive — a noun can wear **two faces at once**. The
clearest case is the **product** itself, one altitude above its contexts (where
the Index view lives): it is at once a **lifecycle** (work flows through its
contexts in order — designed, derived, proven) **and** an **aggregate**
(cross-cutting contexts coordinate across all of them). So its HOW composes
**Value/State + Aggregate**. Normally the two faces split across two cards (R5 —
the Work Board vs. the Stage lifecycle); compose them in one story only when
there is no lower card to hold the lifecycle (so far, only the product).

> A card's **`plane`** (strategy / product / learning) is a separate
> business-plan *register*, orthogonal to this product→contexts composition —
> don't conflate "the Product plane" with "the product noun."

## The acceptance bar (a "winning" story)

A card's story passes when:
1. Bucket-1 sentence present (Role + outcome + why). 
2. Bucket-2 sentence present, using the **type-correct** mad-lib.
3. **R1–R8** all hold (UL nouns resolve-or-flag; tense correct; triggers named;
   state enumerated; altitude held; source-grounded; no orphan cards; verbs
   chunked with their nouns).
4. The **diagram renders the HOW** with the *same nouns and verbs* as the
   sentence. Parity is the shared noun+verb *set*, **not** shared order — the
   sentence chunks each verb with its noun; the diagram carries the sequence.
5. No noun in the sentence is unresolved-and-unflagged (every gray = a known gap).
6. **Coverage:** every card in the context is referenced by the lead's
   how-it-works (or relegated to a sub-part). Zero orphans. *(This is the check
   that would have caught the missing facets.)*

This is machine-checkable: noun resolution, tense, trigger-presence, state
enumeration, and noun↔diagram parity are all lints. That is the "hard logic."

## What this means for the pipeline

- The **back-of-house walk** fills these slots crudely (it already emits the
  events, triggers, and WHAT/WHY/WHERE/HOW/WHEN raw material).
- The **front-of-house walk** sharpens them to pass R1–R6 and answers the STAGE-2
  gaps (the unification).
- The **atomizer** writes the final card bodies to the same grammar.
- The **review page** renders bucket-1 + bucket-2 + the type-keyed diagram, and
  lints the acceptance bar — flagging every failure as the director's to-confirm list.
