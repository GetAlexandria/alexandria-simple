# Hot Spots — Playmaker Studio (PMS)

Every place two sources disagreed, the docs punted to judgment, or a noun was
ambiguous — captured at the noun where it bit (per Brandolini). Each is a loadable
thread in `threads.json` with a canonical kind; this is the human roll-up. The kind
tells "the play was uncertain" apart from "the docs themselves contradict."

## Likely real product flaws (the docs disagree with each other or with runtime)

These are not the walk's confusion — the source genuinely contradicts itself.

- **Two advancement mechanisms** — `runtime_vs_design` — `Pattern - Production
  Ladder`, `Mechanism - Auto-Advance Contract`. The Director's manual ▸ confirm
  ("advances one stage only on the Director's confirm", README) and the
  five-condition auto-advance contract (make-a-play) both move a Play up the same
  ladder. Which is canonical is unstated; the meta-play routes its own exemplar to
  *held*. **Likely a real, live design tension.**
- **Two human-gate models** — `runtime_vs_design` — `Mechanism - Human-Input Pair`,
  `Mechanism - Director Gate`. PROJECTION.md §7's blocking Fabro hexagon vs
  RUNTIME.md's non-blocking event-sourced pair. The blocking one is documented and
  then explicitly corrected ("a blocking Fabro human node deadlocks the moment a
  play runs detached"). **A real, named correction still half-present in the docs.**
- **"Register" timing disagreement** — `docs_disagree` — `Capability - Derive`,
  `Entity - Workflow Package`. README Step 8 (end of line) vs TESTING.md /
  PROJECTION.md (the Derive seam). **A real doc-vs-doc contradiction.**
- **Derived-rendering drift hazard** — `docs_disagree` — `Entity - Workflow
  Package`, `Surface - Story View`. One source (the brief §4), five derived
  renderings that can drift; guarded by Protocol E + check-moves + the sync rule.
  The README names it a live hazard ("Grammar drift killed runs"). **A known,
  guarded-against product risk.**

## Ambiguity the walk flagged (polysemy / demotion / judgment punts)

- **"Tier" polysemy** — `split` — `Economy - Criticality Tier`, `Economy - Role
  Tier`. Criticality band vs role tier; both carded, cross-referenced.
- **"Bank" polysemy** — `split` — `Capability - Output Bank`, `Capability - Package
  Bank`. Deliverable-banking vs code-deploying; both carded.
- **"Play Run" over-promotion** — `demotion` — `Entity - Play Run`. A runtime
  instance, not a peer of Play; proposed for demotion (the brief's named
  over-promotion class).
- **"Legacy Status" supersession** — `demotion` — `Reference - Legacy Status`.
  registry.js `status:` is archeological; proposed for demotion to a deprecation
  note.
- **Collapsed failure exits** — `judgment_punt` — `Economy - Run State`. Refusal /
  ACP-failure / FREEZE merge on `play.failed`; the Tracker re-splits.

## Gaps surfaced (for completeness — full detail in threads.json)

- **The "why" is unrecoverable** — `gap / missing_material` — value-prop, market
  positioning, strategic intent don't live in code; by design, EL3 fills them.
- **Proving never performed** — `gap / missing_material` — only frame-the-problem
  has any graded run (N=1 smoke); pass rates unmeasured across the board.
- **Authoring kit thinly read** — `gap / missing_context` — AUTHORING.md sampled,
  not read in full per the read budget.

## Adversarial content

None found. Every file read was untrusted-by-class; no embedded "ignore your
rules…" directive or planted instruction was encountered in the scanned source. (If
one had been, it would appear here tagged `adversarial-content`, never obeyed.)
