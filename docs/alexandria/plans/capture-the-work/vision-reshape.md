# (a) Vision reshape — implementation-ready slot drafts

**Reframe:** for library-building, the Vision's job is the **investigation's
prior** — it **points** the sweep at the suspects worth chasing and **prunes** the
ones to skip. It does not have to be right; the sweep corrects it against source
(Vision = prior, sweep = evidence, library = posterior).

**Calorie rule — route each question to the author who can ground it.** Stop
asking the AI to *author* un-groundable market claims (that is the wild-guessing).
- **Director-asserted** (cheap human knowledge, AI does *not* generate): the
  market/intent band — Shift, Person, Pains, Inadequacy, Proof, Refusal.
- **Source-extracted + director-confirmed** (where the AI can ground, and where
  (b) proved the evidence sits): the mechanics band — Shape, The Work.

This keeps the existing framing intact but moves the AI's effort, and the sweep's
salience budget, from *(low-yield-for-the-build × AI-weak)* to *(high-yield ×
AI-strong)*. Two new slots, one reshaped; nothing deleted.

## The reshaped manifest

`+` new · `~` reshaped · author = who grounds it · AI-drafts = does the agent draft it

| order | id | label | author | AI-drafts | band |
|---|---|---|---|---|---|
| 1 | `person` | The Person | director | no | Why |
| 2 | `named-pain` | Named Pain | director | no | Why |
| 3 | `discovered-pain` | Discovered Pain | director | no (optional) | Why |
| 4 | `shift` | The Shift | director | **no (was yes)** | Why |
| 5 | `inadequacy` | The Inadequacy | director | no | Why |
| 6 | `mechanism` | The Mechanism | director + source | yes | **Anchor** |
| 7 `+` | `shape` | The Shape | source + director | yes | **Work** |
| 8 `+` | `the-work` | The Work | source + director | yes | **Work** |
| 9 | `felt-experience` | The Felt Experience | source + director | yes | Illustration |
| 10 | `proof` | The Proof | director | no | Why |
| 11 `~` | `refusal` | The Refusal & Fence | director + source | partial | Prune |

Key change beyond the two new slots: the **Why band flips to director-asserted**
(the AI stops generating speculative market claims — most importantly `shift`),
and the **sweep's salience lens** moves from *"Mechanism + Felt Experience +
Proof"* to *"Shape + The Work"* (Mechanism still the anchor; Felt Experience
demoted to the illustrative path).

---

## NEW slot · `shape`

**Manifest:** `{ id: "shape", label: "The Shape", order: 7, purpose: "What kind
of work the product does, so the build knows where to look and what to skip" }`

**Elicitation guidance:**
- **prompt:** "What shape is this product's core work? Pick the closest:
  **pipeline / assembly-line** (a unit transformed through ordered stages),
  **transaction / CRUD** (operations on records), **interaction loop** (a turn
  loop threading state), **decision / calculation** (inputs → rules → outputs), or
  **reactive / event-driven** (event → policy → reaction). Name the shape — and
  name any shape it explicitly is *not*."
- **pullingFor:** "the classifier that tells the build which evidence trails to
  chase and which to skip"
- **quickTest:** "Could a builder predict where to look first — and what to ignore
  — from this one word?"
- **length:** "one shape + 1–2 'not this' exclusions"

**Peg notes:** the shape selects the suspect lineup. Pipeline → central record +
status field + the stage loop. Decision → the rule surfaces. Reactive → the
event→reaction handlers. CRUD → entities + their state transitions (the static map
is largely enough — say so). The shape is a *prior*, not a verdict; the sweep
confirms or corrects it.

## NEW slot · `the-work`

**Manifest:** `{ id: "the-work", label: "The Work", order: 8, purpose: "The
central unit of work and the path it takes from raw to done" }`

**Elicitation guidance:**
- **prompt:** "Trace the core work by naming five things — terse, a list or table,
  not an essay:
  1. **Unit** — the central record the work accumulates around (the 'pile':
     reservations, plays, tickets).
  2. **Path** — the ordered stages it moves through, raw → done.
  3. **Status** — the field/enum the system actually stores to mark each stage.
  4. **Places** — the contexts/containers the work passes through (note any it
     **revisits** or **steps out** to).
  5. **Advances** — what moves it stage to stage (the commands, gates, or rules).
  One unit's lifecycle, birth to done."
- **pullingFor:** "the throughline — the work threaded through the structure; the
  spine the sweep reconstructs and confirms against source"
- **quickTest:** "Could you draw it as a thread crossing columns (places) down
  rows (stages) — like the PMS reconstruction in `pms-workflow.html`?"
- **length:** "the five coordinates, terse"

**Peg notes:** this is the [five coordinates of work](./pms-workflow-reconstruction.md)
(Case · State · Activity · Place · Event) stated as intent. The sweep's job is to
*find the evidence* for each and reconcile; deltas (the Vision claims a stage the
source can't show) become the most valuable threads. The director answers from
intent; the agent confirms from `board-state.json`-style status fields, the
loop/command surfaces, and the per-case artifacts.

## RESHAPED slot · `refusal` → "The Refusal & Fence"

**Manifest purpose** (was *"What the product will not be and why"*) → "What the
product will not be — and, for the build, what is out of scope or not to look
for."

**Elicitation prompt — append:** "…and name what the **library build** should
*not* chase: subsystems out of scope, shapes this product is *not* (from The
Shape), and neighbors that are external dependencies rather than parts of this
product."

This is the **prune** — it turns the Vision into an explicit "eliminate these
places to look" instruction, mirroring the scope-fence the sweep's Vision-anchor
rule already applied by hand (e.g. "scan only the Studio, not Alexandria's
library/atomizer").

---

## Downstream changes the reshape implies

1. **Banked markdown** (`buildRavenSourceOfTruthMarkdown`, `raven-vision.ts:677-700`):
   add `### The Shape` and `### The Work` sections; this is the part the sweep
   actually reads as its anchor.
2. **Sweep's Vision-anchor rule** (`back-of-house-walk/brief.md`): change the
   injected lens from *"Mechanism + Felt Experience + Proof"* to *"Shape + The
   Work"* (Mechanism as anchor), and read The Work as the throughline to
   reconstruct + The Refusal/Fence as the scope cut.
3. **Elicitation flow** (`VisionOnboardingView` + `vision-slot-guidance.ts`):
   register the two slots; mark the Why band director-asserted (no AI draft pass);
   the mechanics band gets the source-extract pass.

## Implementation touch-points (for the wiring slice — its own PR)
- `packages/ax/src/domain/raven-vision.ts` — `RAVEN_VISION_SLOT_MANIFEST` (:29-84)
  + `buildRavenSourceOfTruthMarkdown` (:677-700).
- `packages/viewer/src/components/library/vision/vision-slot-guidance.ts` — the
  two new prompts + the director/source routing.
- `packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/` —
  add `shape.md`, `the-work.md`; revise `refusal.md`; tag the Why slots
  director-asserted.
- `studio/plays/back-of-house-walk/brief.md` — the salience-lens + throughline
  reconstruction (pairs with Move S in [plan.md](./plan.md)).
