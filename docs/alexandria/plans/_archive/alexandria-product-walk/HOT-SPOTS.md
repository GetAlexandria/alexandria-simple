# Hot Spots — Alexandria (the product)

Every place two sources disagreed, the docs punted to judgment, or a noun was
ambiguous — captured at the noun where it bit (per Brandolini), cumulative
across the three passes (HS-1–21). Each is a loadable thread in `threads.json`
with a canonical kind; this is the human roll-up. The kind tells "the play was
uncertain" apart from "the docs themselves contradict."

## Likely real product flaws (the source disagrees with itself)

- **HS-5 · Two card taxonomies coexist** — `docs_disagree` —
  `Entity - Atomic Card` / `Entity - Product Card` /
  `Economy - Catalog Schema Mode`. The 10-folder atomic-card categories and
  `product-card.v1` both ship, with an explicit `legacy` mode naming the
  seam. **Likely a real, live migration tension** — which vocabulary is the
  library's future is undecided in source.
- **HS-6 · "Five specialized agents"** — `docs_disagree` — `Role - Agent`.
  `plugin.json` markets five; two ship built-in (Raven, Damien) and a third
  id (`william`, `plays.ts:7`) exists un-rostered. **A real marketed-vs-shipped
  gap**; william is evidence here, not a card.
- **HS-4 · Viewer README vs routes** — `docs_disagree` — `Surface - Viewer`,
  `Component - Viewer Route`. README says "/" only; code ships twelve-plus.
  Code canon, README stale.
- **HS-3 · Trigger: design noun bigger than runtime** — `runtime_vs_design` —
  `Mechanism - Trigger`. First-class "programmatic conditions" in the
  product story; two derived-on-read kinds in code, never materialized.

## Judgment punts (the walk had to pick; the director rules)

- **HS-1 · The central-record pick** — `judgment_punt` — `Entity - Play Run`
  chosen as the spine; `Entity - Ledger Event` and `Entity - Library` are
  honest alternates, both carded so EL3 can re-point without a re-carve.
- **HS-16 · Vision naming** — `judgment_punt` — director-facing "Basic
  Product Description" vs internal `vision` id/events/route.
- **HS-17 · Wake type** — `judgment_punt` — Capability (the act) vs Entity
  (the requested → delivered / failed record).
- **HS-18–21 · Altitude calls** — `judgment_punt` — Project
  (context/aggregate), the Role class (context/pillar; needs a class rule),
  Play (context/aggregate; its lifecycle lives in the Studio, not this
  product), Vision Slot (component/aggregate).

## Polysemy and splits (one word, more than one thing)

- **HS-2 · "Play" three ways** — `polysemy` — definition / workflow template /
  skill wrapper, one id. All three carded, `related_to`-linked.
- **HS-8 · "Library" three ways** — `polysemy` — legacy oracle (uncarded) /
  product-card catalog / federated PMS pointer.
- **HS-9 · Coin** — `polysemy` — Surface (a place) vs Component (a
  rendering); drafted Surface.
- **HS-15 · Playbook** — `polysemy` — Entity (registry) vs Surface (route);
  drafted Entity, route as derived view.
- **HS-10 · "Source of Truth"** — `split` — Raven Vision's current prose vs
  the frozen conversion output; both carded + `related_to`.

## Demotion proposals (fails the "would the architect say it?" test)

- **HS-11 · State Store** — `demotion` — append machinery exposed as a noun;
  propose a note on `Mechanism - Ledger`.
- **HS-12 · Idempotency Key** — `demotion` — plumbing; propose a note on
  `Entity - Ledger Event`.
- **HS-13 · Cursor** — `demotion` — delivery machinery; propose a note on
  `Entity - Wake Subscription`.
- **HS-14 · Run Labels** — `demotion` — line-label identifiers; propose a
  note on `Entity - Play Run`.

All four are drafted as cards anyway — the play flags, it never deletes.

## Boundary kept deliberately

- **HS-7 · Fabro's two hats** — `runtime_vs_design` (low severity) —
  `Mechanism - Fabro Orchestrator` is the shipped embedded orchestrator only;
  the software factory that builds this repository is out of scope and never
  merged here.

## Prior gaps (inferences to confirm, not source findings)

Three prior leads source could not confirm, plus the search-frame check —
full detail in `threads.json`, all tagged `emittingMove:
translate_search_prior`, `sourceEvidence: []`: **living business plan**
(vocabulary lead; nearest structure is the planes), **operating plane /
mission control** (category lead; nearest thing is the viewer home),
**federation mechanism** (organizational, not yet mechanical), and **did the
search frame hold**.

## Adversarial content

None found. Every file read was untrusted-by-class; no embedded "ignore your
rules…" directive or planted instruction was encountered in the manifest or
any scanned source file. (If one had been, it would appear here, never
obeyed.)
