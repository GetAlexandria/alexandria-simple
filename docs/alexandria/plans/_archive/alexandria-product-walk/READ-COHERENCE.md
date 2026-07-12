# Read-Coherence — Alexandria (the product)

The back-of-house walk's honest self-assessment: what a stranger would and
wouldn't understand from this bundle, written plain. This doubles as the
bundle's navigation (there is deliberately no top-level README — the loader
would read it as a card).

## What this bundle is

A draft product-knowledge library for **Alexandria** — the shipped product
line: the plugin payload, the `ax` CLI, and the local viewer. 70 stub cards
across **eight bounded contexts**, plus the keystone
(`_index/Concept - Alexandria.md`), the work-thread (`workflows.json`), the
open threads (`threads.json`), the director agenda (`STAGE-2-BRIEF.md`), and
the search prior (`library-search-prior.json` — a banked Basic Product
Description existed, so this scan ran prior-led, every lead confirmed or
corrected against source). No answer key was supplied; the legacy 208-card
library was deliberately held back as a post-run coverage oracle, never a
source.

## How to read it (navigation)

- Start at the keystone, `_index/Concept - Alexandria.md` — the working story
  of what the product is, in the director's own banked words, with each of
  the eight containers linked.
- The central record is **`Entity - Play Run`** (in `playbook`). The whole
  bundle is the story of work firing from recorded history, running as a
  play, and accruing back into the ledger; `workflows.json` is that lifecycle
  as 26 ordered, context-tagged steps.
- The eight contexts, in reading order: **product-shell** (how the product is
  met: project, CLI, viewer, agents and their coins) → **ledger** (the
  immutable record and the triggers derived from it) → **session-wake** (how
  recorded facts reach a live agent) → **playbook** (plays, runs, gates, the
  embedded orchestrator) → **vision-onboarding** (the Basic Product
  Description chain) → **knowledge-production** (source → assessment →
  conversion → freeze → atomize → disposition) → **library** (the knowledge
  store and the walks that refine and confirm it) → **canvas** (the work
  surface).
- Cards link by typed `links:` and name each linked card in `## HOW`. One
  card draws a lifecycle: `Pattern - Front-of-House Walk` carries a `flow:`
  (turn → answer → patch → section-confirm → residual).
- `EVENTS.md` (the 33-event timeline) and the other pass artifacts stay under
  `runtime/` — the loader skips that path.

## What a stranger WOULD understand

- **The core loop, end to end.** Facts land in an immutable ledger; triggers
  derive from recorded history; subscriptions wake live agents; agents run
  plays that suspend at human gates and resume on the director's ruling; the
  run's whole life is itself recorded. The event-driven-loop shape the prior
  claimed is confirmed in source.
- **The gate model.** The director rules everywhere it matters — slot
  approvals, human-input gates, review gates, the freeze, section confirms,
  and the whole-library confirmation — and each ruling is a recorded event.
- **The two production chains into the library** — the vision chain (slots →
  source of truth → banked) and the knowledge pipeline (source → assessment →
  conversion → freeze → atomic cards → dispositions).
- **The walk-and-confirm library lifecycle** — draft cards, threads, the
  front-of-house arc, the durable draft overlay over a frozen base, the final
  confirmation gate.

## What a stranger would NOT understand (the gaps)

- **Which "library" and which card taxonomy win.** Three libraries and two
  taxonomies coexist (HS-8, HS-5); the bundle flags the tensions but cannot
  resolve them.
- **What the unbuilt half of the promise looks like.** "Five specialized
  agents," first-class triggers, mechanical federation, and the "living
  business plan" are all product-story claims bigger than shipped code
  (HS-6, HS-3, and the three prior-gap threads); a stranger cannot tell
  intent from staleness. Only the director can.
- **The hosted/deployment shape.** Hosted product instances exist
  (`ops/product-hosting-runbook.md`) but no event names them; deliberately
  not carded.

## Three named reservations

1. **The type vocabulary is partly the product's own, partly the default.**
   Alexandria ships its own taxonomy in source
   (`atomic-card-categories.ts`), which flatters the scan's recall — but this
   bundle's `type` fields use the canonical nine by analogy, not that
   taxonomy. The two are `related_to`-linked, never merged; ratify the
   vocabulary at EL3 (Stage-2 question 9).
2. **The central-record pick is a judgment, not a fact.** Source shows
   several status piles; Play Run was chosen because the plays contract is
   the declared organizing principle. Both alternates (Ledger Event, Library)
   are carded so re-pointing the spine is a ruling, not a re-scan.
3. **The demotion and split calls are proposals, not rulings.** State Store,
   Idempotency Key, Cursor, and Run Labels are proposed for demotion;
   "Source of Truth" is split; the coin, playbook, and wake types are
   provisional. The director may keep or flip any of them — the walk flags,
   it does not rule.

## Hot Spots that are likely real product flaws (not the walk's confusion)

Four findings are the *source* contradicting itself, not the reader being
uncertain (full detail in `HOT-SPOTS.md`): the **two coexisting card
taxonomies** (with an explicit `legacy` schema mode naming the seam), the
**"five specialized agents" claim** against two built-ins plus an un-rostered
`william` id, the **stale viewer README** (one route claimed, twelve-plus
shipped), and the **trigger design noun** running ahead of the two shipped
derived-on-read kinds. A director scanning the bundle should read these as
real product tensions to resolve, not as gaps in the scan.

## Confidence

High on the core loop — ledger, wake, playbook, gates — and on the vision
chain, knowledge pipeline, and library lifecycle (grounded in the domain
files, which are internally consistent on the spine). Medium wherever a
provisional type or altitude carries an HS thread. Low, deliberately, on the
four demotion-proposed cards. The single largest honest gap is that the
product's *story* (five agents, first-class triggers, federation, the living
business plan) is bigger than its shipped runtime, and only the director can
say which parts are roadmap and which are prose.
