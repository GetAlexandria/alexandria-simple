# Skeleton — 1-page template

A Skeleton is the structural bones of a product: information architecture and system design. This template walks through the 6 sections that, taken together, form a reviewable Skeleton document — what a director would draw on a whiteboard if you asked them to sketch the IA of their product.

The template is designed to be fillable by a human directly, or drafted by Raven from a Product Walk artifact (per the Walk template's section 5b). Either way, the output is a single narrative-plus-list document — atomization into cards is downstream sharpening, not this slice.

## How to use this form

- **Stay topological.** A Skeleton describes connections and roles (entry, hub, leaf, branch, background), not what each surface looks like or feels like. Surface and Experience are separate bars.
- **Names are provisional.** Use the stop / region names from the Walk (or your whiteboard). Vocabulary sharpens them later.
- **Lists over prose where structure dominates.** Use a short narrative paragraph to orient, then lists for the actual graph.
- **Length matters.** Each section has length guidance. Overshooting usually means you've drifted into Surface or Experience; undershooting usually means you've left holes a reader can't navigate.
- Each section follows the same schema: *Length · Pulling for · Quick test · Prompt · Answer · Pointer to deeper resources.*
- For Raven drafting from a Walk: read `came_from` / `goes_to` per stop, side-trip branches, and behind-the-scenes processes. Mark inferences with *(inferred)*.

The 6 sections, in reading order:

1. Shape at a glance — *one-paragraph orientation*
2. Entry stops — *where users land*
3. Hubs — *the load-bearing junctions (3+ connections)*
4. The main-path chain — *the spine, in order*
5. Side-trip branches — *what leaves the spine and where it goes*
6. The behind-the-scenes layer — *processes that aren't stops*

A short closing section captures leaves and structural holes the reader should know about.

---

## 1. Shape at a glance

*Length: 1 short paragraph · Pulling for: the topological gestalt — is this a hub-and-spoke, a linear pipeline, a graph with one dominant loop, etc. · Quick test: could a new engineer pick the right region to start reading code in from this paragraph alone?*

In one paragraph, name the overall shape of the product's IA. Is there one dominant hub? A main pipeline with side trips? Two roughly equal regions linked by one bridge? Don't list stops yet — name the shape. If you can't name a shape, say so and note what's making the topology hard to summarize.

> *Your answer here.*

*Deep: `deep-guidance.md § 1` · Examples: `examples.md § 1`*

---

## 2. Entry stops

*Length: bullet list, 1–4 entries · Pulling for: the surfaces a user actually lands on — not just "the home page" · Quick test: does each entry name a concrete arrival, not a category?*

List every stop that a user can arrive at from outside the product (landing page, deep-linked surface, invite-accepted surface, agent-spawned surface). For each: one line on who lands there and from where. In Walk terms, these are stops with `came_from: entry`.

- *Stop name — who arrives here, from where.*
- *Stop name — who arrives here, from where.*

*Deep: `deep-guidance.md § 2` · Examples: `examples.md § 2`*

---

## 3. Hubs

*Length: bullet list, 2–5 entries · Pulling for: the load-bearing junctions — stops with 3+ connections (in or out) · Quick test: if this stop disappeared, would the product fall into disconnected pieces?*

List the stops that act as hubs — stops with three or more connections in or out. For each: name it, list its inbound stops, list its outbound stops, and say in one phrase what role it plays (orienting, dispatching, aggregating, routing). Hubs are the spine of the IA; if you have none, the product is a strict pipeline and that's worth saying explicitly.

- *Hub name*
  - Inbound: *list*
  - Outbound: *list*
  - Role: *one phrase*

*Deep: `deep-guidance.md § 3` · Examples: `examples.md § 3`*

---

## 4. The main-path chain

*Length: ordered list, 4–12 stops · Pulling for: the spine — the sequence a user moves through on the dominant successful run · Quick test: could a stranger replay the product's core loop from this list?*

Write the main path as an ordered list of stops, in order. Use `→` between stops to make the chain visible. Where the path branches and rejoins, note the rejoin point. If there is no single main path (e.g., the product is genuinely a hub-and-spoke with no dominant sequence), say so and list the dominant short loops instead.

1. *Stop A → Stop B*
2. *Stop B → Stop C*
3. *…*

*Deep: `deep-guidance.md § 4` · Examples: `examples.md § 4`*

---

## 5. Side-trip branches

*Length: bullet list, 0–8 entries · Pulling for: branches that leave the spine — what they're for, where they rejoin (or don't) · Quick test: would removing this branch quietly break a real user task?*

For each side trip: name it, name the main-path stop it branches from, name where it goes, and in one phrase say what user need it serves. If a side trip is a dead end (does not rejoin the main path), say so — that's a leaf-shaped branch, not a bug. Walk-sourced side trips are stops with `on_main_path: false`.

- *Branch name — branches from `<stop>` → goes to `<stop(s)>` — serves `<need>`.*

*Deep: `deep-guidance.md § 5` · Examples: `examples.md § 5`*

---

## 6. The behind-the-scenes layer

*Length: bullet list, 0–6 entries · Pulling for: processes that aren't stops — cron jobs, autonomous agents, indexers, webhooks · Quick test: would a director reading only sections 1–5 be surprised that this process exists?*

List the behind-the-scenes processes: things that act on the product's entities without being stops a user visits. For each: name it, one line on what it does, which entities it touches, which stops feel its effects, and its cadence (on-demand, on-event, hourly, nightly, continuous). If the product has no behind-the-scenes layer, say so explicitly — that's load-bearing.

- *Process name — purpose — entities touched — stops affected — cadence.*

*Deep: `deep-guidance.md § 6` · Examples: `examples.md § 6`*

---

## Closing: leaves and known holes

*Length: 2–6 bullets total · Pulling for: terminal stops worth naming + structural gaps the Skeleton can't resolve from current evidence.*

- **Leaves** — terminal stops (no outbound connections) worth calling out, with one phrase on why they're terminal (task complete, hand-off external, etc.).
- **Holes** — regions where the Skeleton is thin: stops named but not connected, suspected hubs not yet walked, behind-the-scenes processes the director hinted at but didn't detail. Mark each *(inferred)* if Raven is guessing.

> *Your answer here.*

---

*Deeper per-section guidance and worked good/bad examples will arrive in a later slice (`deep-guidance.md`, `examples.md`).*
