# Knowledge Organization: Planes & Contexts — project plan

## Problem

Alexandria Prime's **Learning plane** cards keep explaining what a learning
plane *is* — generic method true of any Alexandria library — before (and
sometimes instead of) telling the story of *our* learning: our corpora, our
designed tests, our measures, our arcs. The company story is there, but the
inside-baseball buries it.

We already have the right home for the inside baseball: **Knowledge
Organization**, a context on the Product plane whose whole job is to explain how
Alexandria organizes a library — its planes, its contexts, its two axes, its
vocabulary. But KO is underbaked and, since the Learning plane was built and
frozen (#692), **stale**: it still describes a world with no Learning plane. It
also explains the *Product* plane's structure far better than it explains
Strategy's or Learning's.

So this is one move with two sides: **move** the generic design-rationale out of
the Learning plane cards, and **land** it in KO — bringing the Planes-&-Contexts
explanation up to even quality across all three planes while we do.

## The rule (division of labor)

- **Plane keystone + context/shelf leads (in each plane)** tell *this
  company's* story: our wagers, our corpora, our tests, our measures, our arcs.
  Company-specific content.
- **Knowledge Organization (Product plane)** holds the *design account*: what a
  Plane is, what a Context is, and what each of the three planes and their
  contexts is *designed to accomplish* — at even depth across Strategy, Product,
  and Learning.
- **Boundary test:** *Would this sentence be just as true of a different
  company's Alexandria library?* If yes, it is design → KO. If it names our
  corpora, wagers, or metrics, it stays in the plane.
- **Worked example (the whole plan in miniature):** the Learning keystone's HOW
  paragraph — "evidence is held, sought, or flowing… a Research card the moment
  it settles… an Experiment… a Measure" — is pure design-rationale. It defines
  the Learning plane's *type scheme*, which is exactly KO's job. It moves to the
  Learning profile in KO. The keystone keeps its framing paragraph and the
  *names and contents* of our four shelves, and points to the KO profile for the
  scheme.

The keystones are **not** gutted: each keeps a one-paragraph framing of its
plane plus a one-line pointer to its KO profile. Only the *definitional
machinery* (what a Research card is, the held/sought/flowing scheme, what
separates an Experiment from a Measure) moves.

## Canon note

The type catalog is code: `packages/ax/src/domain/atomic-card-categories.ts`.
It now has **fourteen** live categories — `bet, principle, research, experiment,
measure, arc, roles, domains, surfaces, entities, capabilities, mechanisms,
patterns, economy`. Code is the source of truth; every KO card below reconciles
*to* it. (Ground new wording in the code, not in older plan docs that still say
eleven/thirteen.)

## Workstream 1 — Reconcile KO with reality (de-stale)

Mechanical, independent, unblocks the rest. Each item is a confirmed drift.

| Card | Stale today | Fix |
| --- | --- | --- |
| `knowledge-organization/Entity - Atomic Card Category` | "the eleven universal buckets (Bet, Principle, Research, Roles, …, Economy)"; altLabels list omits the new three | Fourteen; insert Experiment, Measure, Arc after Research in prose + altLabels, matching code order |
| `knowledge-organization/Entity - Knowledge Organization` | "the eleven-bucket metaschema … Bet, Principle, Research, Roles, …, Economy"; `contains` list | Fourteen; add Experiment/Measure/Arc to the sentence and (as their vocab cards land) the `contains` links |
| `knowledge-organization/Entity - Research` | "Alexandria's Learning plane has no cards yet, so the bucket is empty by design"; "No card carries it yet" | Learning plane is built; Research now carries ~20 cards. Rewrite WHERE/WHAT to point at the built research shelf |
| `knowledge-organization/Pattern - The Approach` | "belongs to the Learning plane … once that plane exists to hold it. Until then, lessons about organizing stay recorded here" | The plane exists. Forward-link the two cards that now test the Approach: `Research - Is the Library Organization Method Working`, `Research - How We Chose the Library's Structure` |
| **New** `knowledge-organization/Entity - Experiment`, `- Measure`, `- Arc` | Absent — code registers them first-class, KO has no vocab card | Author three vocab cards mirroring the existing `Entity - Research` (definition + nearest-neighbor differentiation), each `plane: product`, `context: knowledge-organization` |

Adjacent flag (not core): Bet and Principle also lack KO vocab cards even though
they are live first-class buckets. Either fold them into W1 for consistency or
note the gap explicitly — a director call.

## Workstream 2 — Even out the Planes & Contexts explanation (the core)

Today KO defines the *abstract* concepts (`Entity - Plane`, `Entity - Context`)
but never catalogs *our* planes and contexts. The Product plane gets named in
passing; Strategy and Learning get nothing. Fix the asymmetry by giving all
three planes equal structural treatment in KO.

**Recommendation:** three **plane-profile** cards in KO — one each for Strategy,
Product, Learning — at even depth. Each profile names the plane's contexts and
states the *organizational job* of each (why the plane is cut this way; what
each context is designed to accomplish), distinct from the plane keystone's
content story. Plus a light roll-up in `Entity - Context` so the abstract
concept lists the real contexts and links their profiles.

Coverage target (must be even):

- **Strategy** → colleagues, centralization, environment, principles
- **Product** → library, playbook, viewer, ledger, triggers, canvas,
  knowledge-organization
- **Learning** → research, experiments, measurement, arcs

The Learning profile is where the misfiled machinery lands: the held/sought/
flowing scheme and the Research/Experiment/Measure/Arc type definitions pulled
out of the Learning cards in W3.

Alternatives to weigh (see decisions): (b) enrich `Entity - Plane` +
`Entity - Context` in place instead of adding three cards; (c) a structural
one-paragraph gloss per context (~15 cards) — most thorough, heaviest.

## Workstream 3 — Trim the Learning plane to its own story

Depends on W2 (needs the KO homes to point at). Card-by-card, strip the generic
definitions, keep everything Alexandria-specific, add a one-line pointer to KO.

- `_index/Entity - Learning` (keystone) — move the HOW type-scheme paragraph to
  the KO Learning profile; keep the four shelves named with their contents.
- `research/Research - The Evidence We Hold` — cut the generic "what a research
  shelf is / write-only-archive" theory; keep our three corpora + banked
  learnings.
- `experiments/Experiment - The Tests We Run` — cut the generic
  probe-vs-experiment / pre-registration definition; keep our designed tests.
- `measurement/Measure - What We Watch` — cut the generic "what a measure is /
  never resolves" definition; keep our golden metric + input measures.
- `arcs/Arc - The Stories We Tell` — cut the generic "what an arc is"; keep our
  actual arcs.

Net effect: the Learning cards get shorter and more concrete; the theory has a
home; the boundary test passes on every remaining sentence.

## Sequencing, routing, gates

- **Order:** W1 (de-stale, independent) → W2 (build KO homes) → W3 (trim
  Learning, point at homes). W3 cannot precede W2.
- **PRs:** separate and non-stacked off `main`. W1 is standalone; W2 and W3 are
  sequential but land as their own PRs.
- **Live library:** this artifact *records* the proposed changes. Actual edits
  to `docs/alexandria/library/` route through the approved director-gated
  process, not freehand.
- **Gates to respect:** `check-machine-language.mjs` (no code/ruling-ids in
  bodies), the de-machining / de-narrate hygiene (product-descriptive prose, not
  process/session language), and the lead-card context-coverage rule (a lead's
  HOW must narrate every context member) — relevant to any keystone/lead touched.

## Acceptance

1. No KO card claims eleven categories or an empty/nonexistent Learning plane;
   all reconcile to `atomic-card-categories.ts` (fourteen).
2. KO explains all three planes and their contexts at even depth — Strategy and
   Learning get the treatment Product had.
3. Every remaining Learning-plane sentence passes the boundary test: it names
   our corpora, tests, measures, or arcs, not the generic scheme.

## Decisions for the director

1. **The boundary rule.** Adopt "would this be true of a *different* company's
   Alexandria library?" as the line between plane cards (our story) and KO (the
   design account)? *Recommend yes* — it is the one test that makes W3
   mechanical.
2. **W2 shape.** Three plane-profile cards in KO (recommended, bounded), or
   enrich `Entity - Plane`/`Entity - Context` in place, or a per-context gloss
   (~15 cards, most thorough)?
3. **Keystone depth.** Confirm keystones keep a framing paragraph + a pointer to
   their KO profile, and shed only the definitional machinery — i.e. we are not
   hollowing out the keystones, only relocating the method?
4. **Bet/Principle vocab cards.** Fold the two missing first-class vocab cards
   into W1 for a complete metaschema, or leave as a noted gap for a later pass?
