# Raven First-Session: Artifact-First Beats

## Framing

This plan reshapes the `/ax-library` first-session ritual around three moves.
Elicitation becomes **artifact-first**: Raven drafts, the director redlines,
Sam atomizes reactions into cards — the director never writes a card directly.
A new **Beat 3.5 Tour** inserts a narrated topology walkthrough so structure
comes from the director rather than from noun inference. Raven's headline
opening artifact is a **Problem / Approach / Structure one-pager** — the same
shape the director already uses for competitive analysis of alternatives,
mirrored at their own product, which puts them in a familiar critique posture
instead of blank-form answering. Cards remain the persistent atomic substrate
(wikilinks, Conan grades, Tier 1-5 provenance); artifacts are transient
interfaces. The Tier 1-5 leverage ladder (Bet, Product, Settled Thinking,
Loops, Open Bets) governs elicitation order; Tier 2 (topology + naming)
remains the heaviest tier.

---

## Beat 1: Opening + Pre-Drafted One-Pager

- **Purpose:** Replace "tell me about your product" with a redline on Raven's
  first read.
- **Artifact in play:** A **Problem / Approach / Structure one-pager**
  pre-drafted from `ax scan`, repo signals, and any pre-existing Alexandria
  state. If scan was impossible, Raven says so and drafts from public signals
  only, marked as such.
- **Director's action:** Redline. Strike what's wrong, sharpen what's close,
  add what's missing. Critique, do not author.
- **Raven's output:** Team intro, ritual framing, verbatim scan consent line;
  the one-pager rendered under the visible `## Codebase Discovery` anchor.
  Captures redline reactions as Tier 1 card proposals (JTBD, who, win
  condition, why-not-alternatives).
- **Gate:** Director has touched every section of the one-pager (accept,
  reject, or rewrite). Scan consent given or explicitly declined.

## Beat 2: Scan Reconciliation

- **Purpose:** Sanity-check the draft against the scan — not a fresh
  data-collection beat.
- **Artifact in play:** Scan JSON surfaced as candidate nouns and groupings.
- **Director's action:** Confirm, rename, merge, split, or reject candidates;
  flag what's missing.
- **Raven's output:** `## Codebase Discovery` continuation. Mismatch questions
  in the calibrated pattern ("the code suggests X, but your redline points at
  Y — what am I missing?"). No card proposals yet; nouns stay proposals until
  topology is fixed in 3.5.
- **Gate:** Each candidate classified as real product noun, implementation
  detail, or unknown.

## Beat 3: Nouns (vocabulary, not topology)

- **Purpose:** Lock the *names* of the load-bearing 3-5 product entities.
  Vocabulary only.
- **Artifact in play:** A short noun list with one-line definitions drafted
  from Beats 1-2.
- **Director's action:** Confirm wording, contest the "most-debated word,"
  flag synonyms and dead terms.
- **Raven's output:** Visible `## Confirmed Entities` anchor. Tier 2 card
  stubs for each confirmed noun with definitions, but no edges drawn yet.
- **Gate:** 3-7 nouns with defensible definitions; the "most-debated word"
  named explicitly.

## Beat 3.5: Tour (NEW)

- **Purpose:** Capture topology directly from the director instead of
  inferring it from names. This is where Tier 2's heaviest work happens.
- **Artifact in play:** A **surface map** Raven draws live as the director
  narrates. Nodes are confirmed nouns plus newly named surfaces; edges are
  wikilink proposals.
- **Director's action:** Walk Raven through the product using six prompts in
  order:
  1. "Open the product. What's the first screen?"
  2. "What lives here, and what links from here?" (repeat per surface)
  3. "Show me the screen you're proudest of. Why?"
  4. "Show me the screen you're embarrassed by. Why?"
  5. "Walk me through what happens when a user does <core action>."
  6. "What's in here that a new hire wouldn't find without you?"
- **Raven's output:** A visible `## Surface Map` section with the rendered
  diagram (ASCII or wikilink-shaped prose), gnarly bits and corners flagged
  inline, mismatches against Beat 2 surfaced explicitly. Card proposals for
  surfaces, edges between nouns, and "new-hire-only" hidden knowledge. Raven
  **does not configure** here — no AI mode, novelty, or complexity read.
- **Gate:** Every load-bearing noun has a place on the map; proudest and
  embarrassed surfaces named; at least one core-action journey has an edge
  sequence; the "new hire" prompt answered or explicitly waived.

## Beat 4: Three-Axes Configuration + Confirmation Gate

- **Purpose:** Settle AI mode, domain novelty, and product complexity — now
  informed by topology, not naming alone.
- **Artifact in play:** A **calibrated read** drafted from the tour: "given
  this surface map and these gnarly bits, my first read is X mode, Y novelty,
  Z complexity."
- **Director's action:** Confirm or correct each axis. Generic acknowledgments
  are not confirmation (rule preserved).
- **Raven's output:** Visible `### Confirmation Gate` anchor with the three
  values and any build-pipeline-autonomy note. Tier 3 card proposals for
  settled-thinking signals that surfaced ("we decided X for reason Y").
- **Gate:** All three axes confirmed explicitly, against topology evidence.

## Beat 5: Engine Run

- **Purpose:** Run the Wizard Configuration Engine and write
  `alexandria-config.json`.
- **Artifact in play:** Engine output (tier shape).
- **Director's action:** Confirm the tier shape "rings true," or send Raven
  back to Beat 4.
- **Raven's output:** `## Engine Result` anchor (preserved). Config written
  to `docs/alexandria/alexandria-config.json` with the `discovery` section
  now including tour-derived surfaces and edges, not only nouns.
- **Gate:** Config written; tier shape confirmed.

## Beat 6: Gap Analysis

- **Purpose:** Identify which library areas have material and which don't.
- **Artifact in play:** A **gap matrix** Raven drafts from the tour and
  config, pre-populating discovery-backed areas. Tier 3 surfaces a
  **force-field diagram** and **anti-positioning chart** when signal exists.
  Tier 4 surfaces a **journey strip** seeded by the Beat 3.5 core-action
  walkthrough. Tier 5 surfaces a **confidence grid** (or language-native
  capture when grids don't fit).
- **Director's action:** Confirm status per area; redline drafted Tier 3-5
  artifacts where they exist.
- **Raven's output:** Gap matrix; card proposals atomized from redlines.
  Compression patterns from the current ritual still apply (bundled
  confirmation for clearly-absent areas).
- **Gate:** All gap areas have confirmed status; any redlined artifacts have
  produced card proposals.

## Beat 7: Initialize Artifacts + Sam Starter Handoff

- **Purpose:** Persist initialize state and queue the first real Sam build.
- **Artifact in play:** `docs/alexandria/initialize-output.md` (Raven owns)
  and the first starter source artifact (Sam owns).
- **Director's action:** None required — this is execution.
- **Raven's output:** `## Raven -> Sam` block with concrete handoff (path,
  expected output, review expectation). Card proposals from Beats 1-6 batched
  for Sam to atomize.
- **Gate:** Initialize artifact on disk; Sam handoff emitted under the
  literal anchor.

## Beat 8: Scoreboard

- **Purpose:** Show the shared progress surface.
- **Artifact in play:** Rendered scoreboard from `ax scoreboard render .`,
  or honest fallback summary.
- **Director's action:** Inspect.
- **Raven's output:** `## Scoreboard` anchor (preserved). The scoreboard now
  reflects **topology depth** alongside card count — surfaces mapped, edges
  drawn, load-bearing nouns covered — not just raw card totals. This is the
  most consequential cascade change to existing beats.
- **Gate:** Scoreboard rendered, or fallback emitted with the failure named.

## Beat 9: Conan Handoff + Close

- **Purpose:** Hand off to grading and close with status.
- **Artifact in play:** Conan dispatch payload (queued or live).
- **Director's action:** None required at the boundary; loop continues when
  Agent tool is available.
- **Raven's output:** `## Raven -> Conan` anchor, beat recap in order,
  `**Status: DONE**` (or appropriate variant). Close-out order remains rigid:
  Sam → Scoreboard → Conan → recap → status.
- **Gate:** Conan handoff visible; status marker emitted; loop continues or
  stops honestly.

---

## Cascade Notes

Beats 5, 7, 9 are structurally unchanged. Beat 6 gains draft Tier 3-5
artifacts to redline; this is additive, and existing compression patterns
still apply when material is thin. The biggest cascade is **Beat 8's
scoreboard**, which must learn to score topology depth alongside card count
— otherwise a tour-rich session reads as "low progress" by the old card-count
heuristic. The three-axes Confirmation Gate is still authoritative for the
engine run, but its inputs are now post-tour topology, not naming alone.

## Open Questions

- **Pre-draft accuracy floor.** How wrong can Raven's Beat 1 one-pager be
  before redlining costs more than blank-page elicitation? Is there a
  scan-signal threshold below which Raven should skip the draft and ask?
- **Tour length budgeting.** Six prompts can balloon. Should Raven cap tour
  turns, or let the director run long and compress later beats?
- **Director-as-critic muscle.** Some directors will try to author cards
  directly. What's the line Raven uses to redirect them back into redline
  posture without sounding precious?
- **Topology vs. nouns ordering.** Could Beat 3 collapse into 3.5, with
  vocabulary emerging from the walkthrough? Or does noun lock-in before the
  tour prevent the director from renaming mid-walk?
- **Scoreboard topology metric.** What counts as "topology depth" —
  surfaces, edges, edges-per-noun, journey depth? The metric needs to be
  defensible against gaming.
- **Tier 5 artifact choice.** Confidence grid vs. language-native capture —
  which survives contact with directors who don't think in grids?
- **Mismatch precedence.** When the tour contradicts the scan, which wins by
  default? Today's ritual treats scan as proposal, not truth — does the tour
  inherit the same status, or does narrated topology outrank both?
