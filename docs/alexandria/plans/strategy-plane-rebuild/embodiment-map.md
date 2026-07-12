# Strategy ↔ Product embodiment map (2026-07-07)

The linking pass the card contract deferred: "embodied-by ↓ links (to product-plane
cards) are DEFERRED — the product plane is under construction." The product plane has
settled (91 cards, 7 contexts), so this map wires the two planes together. It is the
single source for which links get written; writers may drop a tie they can't ground in
the card's own body, but may not invent ties not listed here.

## Mechanism decisions

1. **Prose wikilinks are the linking mechanism.** The catalog derives graph/constellation
   edges from `[[wikilinks]]` in card bodies (`extractTypedOutboundEdges` scans the raw
   body), and cross-plane edges render with no filter. Frontmatter `links:` feed the
   per-card diagram + the diagram-parity lint instead, so frontmatter is untouched in
   this pass.
2. **No new `embodied_by` frontmatter key.** The allowed link vocabulary
   (`contains, conforms_to, operates_on, produces, related_to, derived_from, relegates`)
   has no down-socket, and adding one is an ax/viewer code change — a follow-up factory
   issue if the director wants the structured socket, recorded under Loose ends below.
3. **Down-direction**: each Bet's `## WHERE` converts its prose-named embodiments into
   resolving wikilinks (and drops the "(link deferred)" parentheticals).
4. **Up-direction**: embodied product cards gain a `## WHY` section — placed between
   WHAT and WHERE, matching the keystone `Concept - Alexandria` — naming the wager(s)
   and any principle that bites, with wikilinks. WHY is prose (machine-language-clean);
   the section parser buckets unknown headings separately, so WHY cannot bleed into the
   lint's HOW story, and the graph card drawer renders the full body so WHY is visible
   where the constellation connects.
5. **Skip rules**: no WHY on deprecated/retired/parked cards (`Concept - AI Colleague`,
   `Entity - Cards`, `Entity - Frozen Source of Truth`, `Capability - Source Assessment`,
   `Capability - Studio Operation`, `Surface - Inbox`, `Rationale - Director Ruling`),
   nor on `_index` cards, nor where no listed tie is honest at one hop.

## Bets → embodying product cards

### colleagues

| Bet | Embodied by (wikilink in WHERE) | Residual gap |
|---|---|---|
| Colleagues as the Interaction Layer (keystone) | Entity - Coin · Surface - Tray · Entity - Play | — |
| Named Colleagues | Role - AI Colleague · Role - Raven · Role - Damien | — |
| The Coin as Abstract Token | Entity - Coin | — |
| The Control-Panel Tray | Surface - Tray | — |
| Colleague in the Channel | — (prose stays) | no product card for channel presence yet |
| Colleague in the Meeting | — (prose stays) | no product card for meeting presence yet |
| The Deep Playbook | Entity - Playbook | — |
| Independent Execution | Capability - Run a Play · Mechanism - Human Gate · Role - AI Colleague | — |
| The Play as Unit of Ownership | Entity - Play · Entity - Playbook · Entity - Play Run | — |

### centralization

| Bet | Embodied by | Residual gap |
|---|---|---|
| Colleagues Grown from Company Design (keystone) | Concept - Library · Entity - Playbook · Entity - Ledger · Mechanism - Trigger | — |
| Library as Living Source of Truth | Concept - Library · Entity - Alexandria Product Library · Pattern - Updating the Library | — |
| Atomic, Agent-Readable Knowledge | Entity - Atomic Card · Concept - Knowledge Organization | — |
| Shared, Agent-Executable Playbook | Entity - Playbook · Entity - Play | — |
| Ledger as Shared Record and Accountability | Entity - Ledger · Entity - Ledger Event | — |
| Event-Sourced Activation | Mechanism - Trigger · Capability - Wake · Entity - Wake Subscription | — |
| Kept Live by the Ledger Loop | Entity - Ledger · Pattern - Updating the Library | the loop itself has no single card |

### environment

| Bet | Embodied by | Residual gap |
|---|---|---|
| A Visual, Traversible Work Environment (keystone) | Surface - Viewer · Mechanism - Canvas | immersive facet (channel/meeting) uncarded |
| Map-First Work Surface | Mechanism - Canvas | the map surface itself is still to build |
| Traversible Context | Surface - Viewer | no card for the graph/constellation view |
| Visualized Work Processes | Entity - Playbook | the playbook view is nascent, uncarded |
| Visualized Colleague Growth | Entity - Knowledge Bank Area | progression views still to build |

## Product cards → WHY sources

Per card: the Bets it cites (and principles in parentheses). Writers pick from this
row only; 2–4 sentences; keystone voice ("The wager: …").

### viewer
- **Surface - Viewer** ← A Visual, Traversible Work Environment · Traversible Context (Legible Graph; A Full System, Not a Pile of Skills)
- **Surface - Tray** ← The Control-Panel Tray · Colleagues as the Interaction Layer (Quiet Until Needed)
- **Surface - Builder** ← Library as Living Source of Truth
- **Entity - Coin** ← The Coin as Abstract Token · Colleagues as the Interaction Layer (Conversational Warmth; Professional, Not Daffy)
- **Role - AI Colleague** ← Named Colleagues · Independent Execution
- **Role - Raven** ← Named Colleagues (Conversational Warmth; Professional, Not Daffy)
- **Role - Damien** ← Named Colleagues
- **Role - Director** ← Colleagues as the Interaction Layer
- skip: Surface - AX CLI, Mechanism - AX Runtime Server, Entity - Alexandria Config, Entity - Project, Entity - Viewer Route, Concept - AI Colleague (deprecated)

### ledger
- **Entity - Ledger** ← Ledger as Shared Record and Accountability · Kept Live by the Ledger Loop (Transparent Machinery)
- **Entity - Ledger Event** ← Ledger as Shared Record and Accountability · Event-Sourced Activation
- **Mechanism - State Store** ← Ledger as Shared Record and Accountability
- **Entity - Idempotency Key** ← Ledger as Shared Record and Accountability
- skip: —

### triggers
- **Mechanism - Trigger** ← Event-Sourced Activation (Quiet Until Needed)
- **Capability - Wake** ← Event-Sourced Activation · Independent Execution
- **Entity - Wake Subscription** ← Event-Sourced Activation
- **Mechanism - Monitor** ← Event-Sourced Activation (Quiet Until Needed)
- skip: Entity - Session, Entity - Connection Lease, Entity - Cursor, Entity - Match Rule

### playbook
- **Entity - Play** ← The Play as Unit of Ownership · Shared, Agent-Executable Playbook · Independent Execution
- **Entity - Playbook** ← Shared, Agent-Executable Playbook · The Deep Playbook · Visualized Work Processes
- **Entity - Play Run** ← The Play as Unit of Ownership (Transparent Machinery)
- **Entity - Play Skill** ← Shared, Agent-Executable Playbook
- **Capability - Run a Play** ← Independent Execution · The Play as Unit of Ownership
- **Capability - Human Feedback** ← Independent Execution (Never-Violate User Assumptions)
- **Pattern - Running Plays** ← The Play as Unit of Ownership
- **Mechanism - Human Gate** ← Independent Execution (Never-Violate User Assumptions)
- **Mechanism - Review Gate** ← Independent Execution (Transparent Machinery)
- **Mechanism - Fabro Orchestrator** ← Shared, Agent-Executable Playbook
- **Entity - Provenance Record** ← Ledger as Shared Record and Accountability (Transparent Machinery)
- **Entity - Human Input Request** ← Independent Execution
- **Entity - Basic Product Description** ← Library as Living Source of Truth (First Servable Loop)
- **Entity - Vision Slot** ← (First Servable Loop; Progressive Disclosure)
- skip: Entity - Move, Entity - Run Labels, Entity - Source Item, Entity - Source of Truth, Entity - Workflow Package

### library
- **Entity - Alexandria Product Library** ← Library as Living Source of Truth (Cumulative, Not Sisyphean)
- **Entity - Atomic Card** ← Atomic, Agent-Readable Knowledge (Cumulative, Not Sisyphean)
- **Pattern - Updating the Library** ← Kept Live by the Ledger Loop · Library as Living Source of Truth (Cumulative, Not Sisyphean)
- **Mechanism - Confirmation Gate** ← Library as Living Source of Truth (Never-Violate User Assumptions)
- **Mechanism - Draft Overlay** ← Library as Living Source of Truth
- **Entity - Knowledge Bank Area** ← Visualized Colleague Growth · Library as Living Source of Truth
- **Entity - Thread** ← Library as Living Source of Truth (Legible Graph)
- **Entity - Bundle Patch** ← Library as Living Source of Truth
- **Entity - Section** ← Library as Living Source of Truth (Legible Graph)
- **Entity - Walk Turn** ← Library as Living Source of Truth
- **Entity - Source** ← Library as Living Source of Truth
- **Capability - Atomize** ← Atomic, Agent-Readable Knowledge
- **Capability - Source Scan** ← Library as Living Source of Truth
- **Capability - Source Conversion** ← Library as Living Source of Truth
- **Capability - Front-of-House Walk** ← Library as Living Source of Truth (Legible Graph; Never-Violate User Assumptions)
- **Capability - Library Confirmation** ← Library as Living Source of Truth (Never-Violate User Assumptions)
- **Capability - Vision Drafting** ← Library as Living Source of Truth (First Servable Loop)
- skip: Domain - Playmaker's Studio Library, Entity - Cards (retired), Entity - Frozen Source of Truth (merged away), Capability - Source Assessment (parked), Capability - Studio Operation (parked), Surface - Inbox (parked), Principle - Director Ruling (strategy-plane card; renamed from Rationale by the bucket retirement)

### canvas
- **Mechanism - Canvas** ← Map-First Work Surface · A Visual, Traversible Work Environment
- **Capability - Canvas Review** ← A Visual, Traversible Work Environment (Never-Violate User Assumptions)
- **Entity - Canvas Step** ← A Visual, Traversible Work Environment
- skip: —

### knowledge-organization
All of these exist so knowledge stays composable by agents and navigable by the
director — every WHY draws on **Atomic, Agent-Readable Knowledge** and/or
**(Legible Graph)**, tailored to the card's own job; vary the phrasing, never
copy a sentence between cards.
- **Concept - Knowledge Organization**, **Concept - Type**, **Concept - Altitude**,
  **Concept - Plane**, **Concept - Context**, **Concept - Domain**, **Concept - Company**,
  **Concept - Atomic Card Category**, **Concept - Capabilities**, **Concept - Entities**,
  **Concept - Mechanisms**, **Concept - Patterns**, **Concept - Rationale**,
  **Concept - Research**, **Concept - Roles**, **Concept - Surfaces**, **Concept - Economy**,
  **Pattern - The Approach**
- **Concept - Library** additionally ← Library as Living Source of Truth
- **Concept - Rationale** additionally ← the strategy plane is where the product's
  why now lives (cite Colleagues as the Interaction Layer only if the card's body
  already leans that way; otherwise Atomic + Legible Graph)
- **Concept - Plane** additionally: the plane split is itself the strategy→product→
  learning loop the strategy shelf describes; keep to the listed sources for links

## WHY sources — completion pass (2026-07-09, flight A3)

The F1 gate made WHY a required section and its burndown lists 49 cards — exactly the
cards the sections above do not ground: the skip-listed product cards, one post-map card,
and the strategy plane itself (this map's rows run product → strategy only). This section
extends the single source to those classes so the fill pass stays map-grounded. The
original discipline is unchanged: writers work from the card's own body under the class
rule, may decline a WHY they cannot ground there, and never invent ties.

1. **Bet cards (21).** A Bet's WHY states the **stake**: what winning the wager buys the
   company or the product, and what the company learns if it loses — drawn from the
   card's own WHAT, HOW, and `risks:`. It is never a bare attribution to the corporate
   bet (WHERE already carries the charter link; universal body rule 2); the corporate
   wager may be named in prose only where it adds meaning beyond attribution, and adds
   no new wikilinks.
2. **Principle cards (13).** A Principle's WHY states what holding the rule **protects**
   — the failure it forecloses or the quality it preserves — and why it binds regardless
   of how any bet turns out (the keystone's own definition of a principle). Grounded in
   the card's own body; no new ties.
3. **Skip-listed and post-map product cards (15).** The skip ruling stands: no strategy
   tie is honest at one hop, so these WHYs carry **no strategy-plane wikilinks**. The
   WHY is written at product altitude from the card's own body: what having this piece
   buys the product — the failure it prevents, the work it makes possible. A strategy
   tie may be added ONLY where the card's body already leans on one explicitly.

Form rules for all three classes are the pass's standing rules: standalone `## WHY`
between WHAT and WHERE; 2–4 sentences; keystone voice; vary phrasing, never copy a
sentence between cards; wikilinks per-line, never wrapped; prose de-machined.

## Loose ends (for the director)

1. **Structured down-socket** — if the director wants `embodied_by` as a frontmatter
   key (queryable, not just prose), that is an ax + viewer change
   (`LIBRARY_CATALOG_LINK_KEYS`, diagram/parity handling) — a factory issue, not a
   content edit.
2. **Uncarded embodiments** — channel/meeting presence, the map surface, the graph
   view, the playbook view, colleague progression: five bets whose product pieces are
   partly or wholly unbuilt/uncarded. These stay prose in the Bet cards and are the
   natural next sweep additions.
3. **Learning plane** — WHY sections cite Bets (why built) only; the evidence channel
   (tested-by → Learning) stays unwired until Learning-plane cards exist.
4. **Catalog WHY story bucket** — the catalog card detail renders WHAT/HOW story
   buckets only; WHY is visible in the graph card drawer (full markdown). Surfacing a
   WHY bucket in the catalog view is a small viewer follow-up.
