# Capture the Work — a strategic reform of Vision, the sweep, and the card contract

**Thesis:** A product library must capture not only the system's *parts* (its
static structure) but the *work it does* (its dynamic process). Our pipeline
currently harvests the work and then discards it, because none of the three
layers it passes through — the Vision, the Back-of-House sweep, the card contract
— treats "the work" as first-class. The fix is to make the core work a
first-class **question** in the Vision, a first-class **preserved output** of the
sweep, and a first-class **primitive** in the contract — and to make all of it
**shape-aware** so we don't repeat the miss on differently-shaped software.

Adjacent to [rebuilding-the-library](../rebuilding-the-library/plan.md) and the
[PMS library handoff](../pms-library-handoff/HANDOFF.md). Grounded in the
operational code, not Brick docs.

---

## 1. The trigger — what the first dogfood missed

The PMS-Back dogfood produced a faithful **static** map of Playmaker Studio: 8
contexts (containers), 39 noun cards, typed structural links. But a single
Event-Storming picture from a parallel effort — *the work threaded through the
structure*: columns = contexts, time running down, a diagonal tracing one play
from `brief → board (Gate 1) → grading → runtime → board (Gate 2)* — told a
higher-fidelity story than our entire card set. The work **revisits** `board` at
both gates and **steps out** to `runtime`; it is emphatically *not* the clean
left-to-right pipeline the static map implies.

Playmaker Studio's product **is a process** — an assembly line that moves a play
across stages and contexts. A static noun-library of an assembly line documents
the *stations* and skips the *line*. We under-told the one story that is most the
product.

## 2. Diagnosis — three layers, all complicit

### Layer 1 · Vision asks for the work only as prose
The 9-slot Vision (`packages/ax/src/domain/raven-vision.ts:29-84`,
`RAVEN_VISION_SLOT_MANIFEST`) is a **persuasion arc** (Shift → Person → Pain →
Inadequacy → Mechanism → Felt Experience → Proof → Refusal). The dynamic story is
latent but never *structured*:
- **Mechanism (6)** is a positioning claim ("what we are that no one else is"),
  not a sequence (`vision-slot-guidance.ts`, `slots/mechanism.md`).
- **Felt Experience (7)** is *one illustrative scene* with "clocks and verbs"
  (`slots/felt-experience.md:62-63`) — evidence that a throughline exists, but a
  single path told as a story, not the general process model.

No slot answers: *what is the central unit of work, and what path does it take
from raw to done?* (Probe verdict: **no** first-class work/lifecycle slot.)

### Layer 2 · The sweep harvests the work, then discards it
The Back-of-House sweep (`studio/plays/back-of-house-walk/brief.md`) move spine is
`survey → pass1_events → pass2_carve → pass3_altitude → emit_bundle →
check_bundle`.
- **`pass1_events` does Event Storming**: surfaces ~20-30 *past-tense domain
  events*, time-ordered, into `runtime/EVENTS.md` (`brief.md:134-156`).
- **`pass2_carve` uses those events to discover bounded contexts and nouns** —
  then the events' *sequence* is dropped. The move from events → contexts is
  **lossy by design** (`brief.md:159-192`).
- **`emit_bundle`'s output contract is noun-only**: cards with Small frontmatter +
  altitude + `source_evidence` + **six static typed-link keys** — `contains`,
  `conforms_to`, `operates_on`, `produces`, `related_to`, `derived_from`
  (`brief.md:251-286`). **There are no temporal keys** (`precedes`, `triggers`,
  `hands_off_to`), no ordered sequence, no process artifact. `EVENTS.md` survives
  only as a **human-readable report** for the director, never as machine-readable
  structure.
- **`check_bundle` is a structural gate only** — typed-link targets resolve,
  Small fields present, altitudes consistent, reads coherently to a stranger
  (`brief.md:300-315`). It never asks *is the core work represented as a
  sequence?* So the omission is **invisible to the gate.**

Net: the dynamic layer is **collected in Pass 1 and structurally dropped at
emit**, and nothing notices. (Probe verdict: event/process info does **not**
survive into the output contract.)

### Layer 3 · The contract has no place to put the work
The card model is nouns + the six static links. The viewer's diagram lenses are
`hub` (relationships), `feeds` (inbound), and `lifecycle` (an ordered `flow:`)
— but `flow:` is single-column, and **0 of 39 swept cards use it**. There is no
"lifecycle across contexts" lens (the diagonal), and no temporal link to derive
one from.

> **Smoking gun:** the information loss is *forced by the model's shape*. Even an
> agent that perfectly understood the assembly line had nowhere to record it.

## 3. Why this generalizes — the sweep is shape-blind

The root pathology is not "we forgot process." It is that the sweep applies **one
capture method — noun-harvest → static taxonomy — regardless of what kind of work
the software does.** That default is the *CRUD/transaction* answer. It happens to
be adequate when the parts *are* the value, and a husk when the work is.

Software has a **shape**, and shape determines what "faithful" means:

| Shape | Core work | What faithful capture is |
|---|---|---|
| **Pipeline / assembly-line** (PMS, CI/CD, compilers, ETL) | a unit transformed through ordered stages across contexts | the **throughline** — stages, hand-offs, gates, what's transformed |
| **Transaction / CRUD** (most SaaS, admin) | operations on entities | entities + their **state transitions** (static map ~sufficient) |
| **Interaction / loop** (chat, games, collab) | a turn loop threading state | the **loop** + the state it carries |
| **Decision / calculation** (pricing, risk, reco) | inputs → rules → outputs | the **decision flow** + rule surfaces |
| **Reactive / event-driven** (monitoring, trading, IoT) | event → policy → reaction | the **event→reaction chains** |

The taxonomy itself is negotiable; the principle is not: **a shape-blind
harvester silently defaults to the static answer.** That is why we'll keep
missing big things on differently-shaped software until *shape* is something the
pipeline establishes *before* it harvests.

## 4. The self-referential argument (why this is the discipline, not an add-on)

Playmaker Studio exists because *good agentic work is invisible* — its Named Pain
is *"I track all of it in my head … none of it is anywhere I can see it,"* and its
Mechanism is to make the **work** of an AI play visible, traceable, designed-once.
**Our library of Playmaker Studio committed exactly that sin:** it left the
Studio's own work as scattered prose instead of one legible artifact. The tool
failed its own thesis. Capturing the work is therefore not a feature of the
library — it *is* the job.

## 5. The fix — shape-first + three coordinated moves

### Move 0 · Shape-first (the meta-move)
Before harvesting, the pipeline names the software's **shape** and its **core unit
of work**. This is one decision that re-points everything downstream: a pipeline
shape demands a throughline; a CRUD shape is honestly served by the static map we
already build. Establishing shape is what makes the fix *general*, not a
PMS-special-case.

### Move V · Vision — reframe it as the investigation's prior
**Concrete slot drafts (implementation-ready): [vision-reshape.md](./vision-reshape.md).**

**Reframe Vision's JTBD.** Today Vision optimizes for *"should this product exist"*
(a pitch). For feeding the library it must also be the **investigation's prior** —
it **points** the sweep at the suspects worth chasing and **prunes** the ones to
skip. It need not be right: Vision = prior, sweep = evidence, library = posterior.

**The calorie rule — route each question to the author who can ground it.** This
is what fixes the AI "wild-guessing" the market slots: stop asking the AI to
*author* un-groundable claims.
- **Director-asserted** (AI does *not* generate): the market/intent band — Shift,
  Person, Pains, Inadequacy, Proof.
- **Source-extracted + director-confirmed** (where the AI can ground, and where
  (b) proved the evidence sits): the mechanics band — Shape, The Work.

**The change set** (no slot deleted; framing kept, weight shifted):
- **`+ Shape`** — the classifier (pipeline / CRUD / loop / decision / reactive)
  that selects the suspect lineup and enables the prune.
- **`+ The Work`** — the throughline, stated as the five coordinates (unit ·
  states · status · places · what-advances). For PMS this answer *is* the
  reconstruction in [`pms-workflow.html`](./pms-workflow.html).
- **`~ Refusal → Refusal & Fence`** — extend it to name what the build should
  *not* chase (out-of-scope subsystems, shapes it is *not*, external neighbors).
  This is the prune.
- **Re-point the sweep's salience lens** from *"Mechanism + Felt Experience +
  Proof"* to *"Shape + The Work"* (Mechanism stays the anchor; Felt Experience
  demoted to the *illustrative* path — evidence the throughline exists, not the
  spec).

Touch points (the **wiring slice — its own PR**, this is a shipped surface):
`RAVEN_VISION_SLOT_MANIFEST` + `buildRavenSourceOfTruthMarkdown`
(`raven-vision.ts:29-84`, `:677-700`); `vision-slot-guidance.ts`; the slot pegs
(`skills/raven-vision-drafting/references/slots/`).

### Move S · Sweep — preserve the work, and make the self-check demand it
The sweep already does the hard part (`pass1_events`). The reform is to **stop
collapsing events into nouns and throw the timeline away**, and instead emit a
**process artifact**: a machine-readable, ordered, **context-tagged** work-thread
— each step carrying its event/activity, its context, its doer, what it
consumes/emits, and the hand-off. This is the screenshot *as data*, derived from
`EVENTS.md` + contexts rather than discarded.

Anchor it to the Vision's **The Work** slot: the sweep *reconstructs the declared
throughline against the source's events*. Deltas (Vision says the work does X; the
source shows Y or nothing) are the most valuable output — the same "intended vs.
real" discipline already in the Vision-as-anchor rule, now applied to the
**process**, not just the nouns.

Add a **process gate** to `check_bundle`: *is the core work present as a sequence?
Does every step of the declared throughline map to a captured step? Is any context
never visited by the work-thread (dead structure), or any boundary-crossing not
captured as a hand-off?* Absence → a **gap thread**. (Today's check is
structural-only — that's precisely why our omission was silent.)

Touch points: `studio/plays/back-of-house-walk/brief.md` (the move graph §4, the
`emit_bundle` contract `:251-286`, `check_bundle` `:300-315`), `moves.md`,
`risk-map.md`.

### Move C · Contract — a primitive for the work
Escalating options:
- **(min)** a **temporal link key** (`precedes` / `hands_off_to`) added to the six
  static keys — lets sequence and cross-context hand-offs be graph-encoded; the
  diagonal becomes *derivable*. Smallest contract delta.
- **(full)** a first-class **Process card** whose body is an ordered,
  context-tagged step list (`{step, context, doer, consumes, emits}`). Richest and
  most faithful — and it maps onto the existing `Process` type (Production Ladder
  is *already* typed `Process` but wastes its sequence in prose + unordered
  `contains:`).
- **Renderer:** a **"lifecycle across contexts"** view — the diagonal. The viewer
  already has hub/feeds/lifecycle; this is the fourth lens, and the one that tells
  a process-shaped product's story.

Touch points: card frontmatter + link keys (`library-catalog.ts` /
`library-graph.ts`); diagram derivation (`library-catalog-story.ts`
`diagramForCatalogCard`); the viewer `FunctionalDiagram`
(`EmptyLibraryView.tsx:762`).

### Why all three (the leak argument)
- Vision without contract → the director articulates the work; it has nowhere to
  live.
- Contract without sweep → a primitive nobody populates.
- Sweep without Vision → the agent harvests events but has no spec of what the
  work *should* be, so it can't tell a coverage gap from a complete map. (That is
  exactly today: it harvested events and didn't know to keep them.)
- The **self-check** is what makes capturing the work non-optional. **Shape-first**
  is what makes it generalize.

## 6. Sequencing — smallest proof first

1. **Vision: add "The Work" + the shape question.** Cheapest, highest leverage;
   re-points every future sweep. (Shipped surface — stage it.)
2. **Sweep: preserve the process.** Emit the context-tagged work-thread from the
   already-harvested events; add the `check_bundle` process gate.
3. **Contract + renderer.** Temporal link / Process-card step-list + the
   cross-context lens.
4. **Re-dogfood PMS** to prove the throughline now renders from data — then prove
   *generality* by running the upgraded pipeline on a **differently-shaped**
   product (a CRUD-ish one) and confirming shape-first selects the right capture
   (and does *not* over-impose a throughline where there isn't one).

## 7. Open questions / risks
- **Where does the process live** — its own `Process`/work-thread card, or a
  separate process *view* over event data? (Leaning: a `Process` card owning the
  ordered step-list, so it sits in the same library and renders inline.)
- **Vision bloat.** A 10th slot on a shipped artifact; guard against turning the
  pitch into a spec doc. Mitigation: "The Work" is short and structured (unit +
  shape + ordered path), not another essay.
- **Shape taxonomy is a model, not truth.** Keep it a small heuristic that picks a
  capture method, not a rigid classifier.
- **BoH-pure discipline holds:** every change is in the Vision/sweep **emit** and
  the **contract** — never hand-edits to frozen swept output.

## 8. Pointers
- Vision canon: `packages/ax/src/domain/raven-vision.ts:29-84`, `:677-700`;
  `vision-slot-guidance.ts`; `skills/raven-vision-drafting/references/slots/`.
- Sweep canon: `studio/plays/back-of-house-walk/{brief,moves,risk-map}.md`;
  dogfood bundles under `docs/alexandria/plans/rebuilding-the-library/test-scan-*`.
- Contract/render: `library-catalog.ts`, `library-graph.ts`,
  `library-catalog-story.ts` (`diagramForCatalogCard`), `EmptyLibraryView.tsx:762`.
- The PMS dogfood that surfaced this: `studio/sweeps/playmaker-studio/`.
