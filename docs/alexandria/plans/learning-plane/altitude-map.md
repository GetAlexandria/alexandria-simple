# Altitude map: full-bundle audit + tuning decisions (2026-07-07)

The altitude-tuning pass the D4 ruling deferred: the design log's finding was that
"pillar" does double duty (absolute vs relative), the free-string `altitude:` field has
drifted, and "altitude organization and tagging need tuning across all planes." This map
audits every card carrying an `altitude:` field and proposes keep-or-change per card. It
is the **single source for a later apply pass** (embodiment-map discipline): writers may
decline a change they can't ground in the card's own body, but may not invent changes
not listed here. **This document makes no card edits.**

- **Audited root:** `docs/alexandria/sweeps/alexandria-product/` — the live bundle on
  `origin/main` (114 cards carry `altitude:`). The retained legacy library at
  `docs/alexandria/library/` also exists on `origin/main` but carries **zero** altitude
  fields and is never a source of cards (root guidance); it is not audited. A move is in
  flight; if the bundle re-homes, the stems below (never paths) still key the map.
- **Scope:** only cards with an `altitude:` field. Cards without one (e.g. the
  `principles/` shelf) are out of scope for this pass.
- **Distribution at audit time:** aggregate 27 · component 24 · capability 18 ·
  value 15 · pillar 14 · context 14 · keystone 2 — matching the design log's count.

## The rules applied (D4, ruled 2026-07-07)

Seven ruled words, one operational test each. Pillar grammar is **relative** — "headline
of its shelf" — never the old absolute sense (reserved-for-the-primitives).

| Altitude | Operational test |
|---|---|
| keystone | The one front-page card of a plane. Shipped practice: the two `_index` overview cards only. |
| pillar | The headline card of its own context (shelf) — the card whose story narrates the shelf. Pillar-sparse by design; deprecation vacates headline rank. |
| context | A card about the organizing containers themselves — the library's own organizing vocabulary (Plane, Context, Domain, Company, Library; per D4, a future Release vocabulary card lands here too). |
| aggregate | Own lifecycle with real state transitions. |
| component | A piece inside an aggregate — no independent life; its states, if any, are the aggregate's. |
| value | The card IS its content — meaning by content, no identity beyond it. |
| capability | A verb, operation, or gate the product performs. |

Reading notes used consistently below:

- **Type ≠ altitude.** The two axes are orthogonal (two-axis taxonomy ruling): a
  `Mechanism` card can sit at `capability` (it is a gate) or `component` (it is an
  engine with no domain states); an `Entity` can sit anywhere on the ladder.
- **Deprecated cards keep their subject's rung** (shipped precedent: State Store at
  component, Canvas Review at capability, Inbox parked in place) — **except headline
  rank**: a deprecated card cannot remain the headline of a shelf (adjudicated below).
- **A capability whose runs have a lifecycle stays `capability`** — the run is the
  aggregate, the verb is the verb (e.g. Source Conversion narrates started → completed,
  but the card is the operation).

## How to read the tables

One table per context, keyed by card stem (`Type - Name`), never by path. Columns:
current value → proposed value (**keep** means proposed = current), the rung test
applied, and a one-sentence reason. Proposals marked **(director)** are not decided
here — they are restated as full-sentence questions in "Decisions for the director";
everything else uncontested lands in "Mechanical fixes" or is a keep.

## Audit tables

### _index

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Concept - Alexandria | keystone | keep | keystone: the one front-page card of a plane | The product plane's front page — exactly the shipped `_index`-only keystone practice. |
| Concept - Strategy | keystone | keep | keystone: the one front-page card of a plane | The strategy plane's front page — the second of the two shipped keystones. |

### centralization (strategy)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Bet - Colleagues Grown from Company Design | pillar | keep **(director)** | pillar: headline card of its own shelf | The cluster-head wager whose story fronts the centralization shelf; the pillar-vs-keystone drift for the three corporate Bets is Question 1. |
| Bet - Atomic, Agent-Readable Knowledge | aggregate | keep | aggregate: own lifecycle with real state transitions | A falsifiable wager lives (open → confirmed/denied, rolls back if wrong) — the evidence loop moves it. |
| Bet - Event-Sourced Activation | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle; consistent with every member Bet in the bundle. |
| Bet - Kept Live by the Ledger Loop | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Ledger as Shared Record and Accountability | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Library as Living Source of Truth | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Shared, Agent-Executable Playbook | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |

### colleagues (strategy)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Bet - Colleagues as the Interaction Layer | pillar | keep **(director)** | pillar: headline card of its own shelf | The cluster-head wager fronting the colleagues shelf; part of Question 1 (pillar vs keystone for the corporate Bets). |
| Bet - Colleague in the Channel | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Colleague in the Meeting | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Independent Execution | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle (and the successor of the deprecated Concept - AI Colleague thesis). |
| Bet - Named Colleagues | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - The Coin as Abstract Token | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - The Control-Panel Tray | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - The Deep Playbook | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - The Play as Unit of Ownership | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |

### environment (strategy)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Bet - A Visual, Traversible Work Environment | pillar | keep **(director)** | pillar: headline card of its own shelf | The cluster-head wager fronting the environment shelf; part of Question 1 (pillar vs keystone for the corporate Bets). |
| Bet - Map-First Work Surface | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Traversible Context | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Visualized Colleague Growth | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |
| Bet - Visualized Work Processes | aggregate | keep | aggregate: own lifecycle with real state transitions | Member wager with the Bet lifecycle. |

### ledger (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Entity - Ledger | pillar | keep | pillar: headline card of its own shelf | The card whose story fronts the ledger shelf — the relative reading lands where the old absolute reading did. |
| Entity - Ledger Event | component | keep | component: piece inside an aggregate, no independent life | The card's own body makes the argument: identity but no lifecycle, the atom inside the Ledger, serving the Play Run. |
| Entity - Idempotency Key | value | keep | value: the card IS its content | Deprecated plumbing kept for reference — a marker whose meaning is its content, surviving as a note on Ledger Event. |
| Mechanism - State Store | component | keep | component: piece inside an aggregate, no independent life | Deprecated machinery that writes onto the ledger — a part of the Ledger, keeping its subject's rung. |
| Capability - Inspect State | capability | keep | capability: a verb, operation, or gate | A read-and-validate operation, plainly a verb. |

### playbook (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Entity - Playbook | pillar | keep | pillar: headline card of its own shelf | The registry card fronting the playbook shelf — one of the two innovations at the heart of the product. |
| Pattern - Running Plays | pillar | keep **(director)** | pillar: headline card of its own shelf | A second pillar on the same shelf — cited by the D4 ruling as legitimate relative usage, but Question 5 asks whether shelves tolerate co-headlines. |
| Entity - Play | context | **aggregate** | aggregate: own lifecycle with real state transitions | A play is the playbook's unit — authored, proven, revised, retired (improve-don't-churn) — symmetric with Atomic Card as the library's unit; it is a product noun, not the library's organizing vocabulary, so `context` fails its test. |
| Entity - Play Run | aggregate | keep | aggregate: own lifecycle with real state transitions | The unit of work the whole system advances — the clearest aggregate in the bundle. |
| Entity - Basic Product Description | aggregate | keep | aggregate: own lifecycle with real state transitions | The card narrates its own lifecycle: not started → in progress → ready to bank → banked. |
| Entity - Move | component | keep | component: piece inside an aggregate, no independent life | One step of a play, no independent lifecycle by its own account. |
| Entity - Play Skill | component | keep | component: piece inside an aggregate, no independent life | A subordinate part of a play with the play's identity. |
| Entity - Workflow Package | component | keep | component: piece inside an aggregate, no independent life | The play's machine contract — the other subordinate part of the play. |
| Entity - Human Input Request | component | keep | component: piece inside an aggregate, no independent life | Its requested-to-resolved states are the run's states, not its own — the body applies the test itself. |
| Entity - Provenance Record | component | keep | component: piece inside an aggregate, no independent life | A declaration pinned to the ledger riding the run it describes. |
| Entity - Source Item | component | keep | component: piece inside an aggregate, no independent life | Identity-bearing but its lifecycle rides the description (tracked at attach, consumed at banking). |
| Entity - Source of Truth | component | keep | component: piece inside an aggregate, no independent life | Its two states (gathered, frozen) mark the atomization work it serves — same rides-the-run logic as Human Input Request — and the card says it is contextualized by its move or play. |
| Entity - Vision Slot | component | keep | component: piece inside an aggregate, no independent life | A fixed piece of the Basic Product Description with no life outside it. |
| Entity - Run Labels | value | keep | value: the card IS its content | Deprecated plumbing — identifiers whose meaning is their content, surviving as a source-evidence note on Play Run. |
| Mechanism - Fabro Orchestrator | component | keep | component: piece inside an aggregate, no independent life | An embedded engine with no domain state transitions of its own (same rung logic as Monitor). |
| Mechanism - Human Gate | capability | keep | capability: a verb, operation, or gate | A gate — the suspend-for-director contract. |
| Mechanism - Review Gate | capability | keep | capability: a verb, operation, or gate | Named gates a reviewed run passes. |
| Capability - Run a Play | capability | keep | capability: a verb, operation, or gate | The product's core verb. |
| Capability - Human Feedback | capability | keep | capability: a verb, operation, or gate | Answer-and-resume — an operation. |

### triggers (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Mechanism - Trigger | capability | keep **(director)** | pillar: headline card of its own shelf (candidate) | The card calls itself "the core noun of the Triggers region", and the triggers shelf is the only primitive shelf with no pillar — Question 4 asks whether to promote it; `capability` (a condition that fires plays) is defensible until ruled. |
| Capability - Wake | capability | keep | capability: a verb, operation, or gate | The delivery operation — a verb. |
| Entity - Wake Subscription | aggregate | keep | aggregate: own lifecycle with real state transitions | Registered and removed independently — its own lifecycle by the card's own argument. |
| Entity - Session | aggregate | keep | aggregate: own lifecycle with real state transitions | Connected → wakeable; a live thing with real transitions. |
| Entity - Connection Lease | component | keep | component: piece inside an aggregate, no independent life | It rides the session that leased it, by its own account. |
| Entity - Cursor | value | keep | value: the card IS its content | A position marker, meaning-by-content; the card itself flags whether it deserves a card at all. |
| Entity - Match Rule | value | keep | value: the card IS its content | An event-type predicate with no identity beyond its content. |
| Mechanism - Monitor | component | keep | component: piece inside an aggregate, no independent life | A long-running engine whose life rides the plugin install — no domain states of its own. |

### library (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Entity - Alexandria Product Library | pillar | keep | pillar: headline card of its own shelf | The knowledge-store card fronting the library shelf — the other of the two heart-of-product innovations. |
| Pattern - Updating the Library | pillar | keep **(director)** | pillar: headline card of its own shelf | Second pillar on the shelf — cited by the D4 ruling as legitimate relative usage; covered by Question 5 (co-headlines). |
| Entity - Atomic Card | aggregate | keep | aggregate: own lifecycle with real state transitions | The library's unit moves through real states (stub → confirmed → deprecated) as it is produced and updated. |
| Entity - Cards | aggregate | keep | aggregate: own lifecycle with real state transitions | Deprecated alias of Atomic Card — keeps its subject's rung (the deprecated-cards note above); only headline rank is vacated by deprecation. |
| Entity - Knowledge Bank Area | aggregate | keep | aggregate: own lifecycle with real state transitions | Explicit lifecycle on the card: available → in progress → ready for atomization → banked (plus locked). |
| Entity - Source | aggregate | keep | aggregate: own lifecycle with real state transitions | Pending assessment → assessed, with a trigger derived from the pending state. |
| Entity - Thread | aggregate | keep | aggregate: own lifecycle with real state transitions | Open → answered or residual — the card narrates the transitions. |
| Entity - Bundle Patch | component | keep | component: piece inside an aggregate, no independent life | The unit the draft log is made of — a piece of the overlay trail. |
| Entity - Section | component | keep | component: piece inside an aggregate, no independent life | One bounded slice of a walk — no life outside it. |
| Entity - Walk Turn | component | keep | component: piece inside an aggregate, no independent life | One recorded exchange of the walk. |
| Entity - Frozen Source of Truth | component | keep | component: piece inside an aggregate, no independent life | Deprecated — a state merged into Source of Truth; keeps its subject's rung as a reference stub. |
| Mechanism - Draft Overlay | component | keep | component: piece inside an aggregate, no independent life | Machinery inside the Library; the card itself says the overlay has no states of its own. |
| Mechanism - Confirmation Gate | capability | keep | capability: a verb, operation, or gate | The whole-library ruling gate. |
| Capability - Source Scan | capability | keep | capability: a verb, operation, or gate | Turn raw material into a draft bundle — a verb. |
| Capability - Front-of-House Walk | capability | keep | capability: a verb, operation, or gate | The card argues its own rung: a capability, not a place — an operation performed on the library. |
| Capability - Library Confirmation | capability | keep | capability: a verb, operation, or gate | Record the approve-or-reject verdict — an operation. |
| Capability - Atomize | capability | keep | capability: a verb, operation, or gate | Break a confirmed library into card bodies — a verb. |
| Capability - Source Conversion | capability | keep | capability: a verb, operation, or gate | The operation stays the verb; its started → completed lifecycle belongs to the run, not the capability card (reading note above). |
| Capability - Vision Drafting | capability | keep | capability: a verb, operation, or gate | Co-author and bank the Vision — an operation. |
| Capability - Source Assessment | capability | keep | capability: a verb, operation, or gate | Deprecated/parked operation — keeps its subject's rung. |
| Capability - Studio Operation | capability | keep | capability: a verb, operation, or gate | Deprecated disposition verbs — keeps its subject's rung. |
| Surface - Inbox | context | **component** | component: piece inside an aggregate, no independent life | Its own body fails the context test ("a bounded place, not itself lifecycle-bearing" — not organizing vocabulary): a parked place inside the knowledge-production pipeline, matching Tray and Builder among Surfaces. |
| Domain - Playmaker's Studio Library | context | keep | context: a card about the organizing containers themselves | A federation pointer to another library — squarely the organizing-container vocabulary the rung exists for. |

### viewer (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Surface - Viewer | pillar | keep | pillar: headline card of its own shelf | The card whose story fronts the viewer shelf — the visual environment the whole system is met through. |
| Surface - AX CLI | pillar | **component (director)** | pillar: headline card of its own shelf | Fails the relative test — the Viewer is this shelf's headline; the design log already calls the CLI "arguably over-promoted", and demotion joins it to Tray/Builder as places the product is met (Question 3). |
| Concept - AI Colleague | pillar | **value (director)** | pillar: headline card of its own shelf | A deprecated card cannot hold headline rank; its remaining meaning is a superseded thesis kept for reference (the thesis lives on as Bet - Independent Execution, the class as Role - AI Colleague) — Question 2. |
| Role - Director | pillar | keep | pillar: headline card of its own shelf | Cited by the D4 ruling as legitimate relative usage — the actor the whole gate model hangs on headlines the product's cast. |
| Role - AI Colleague | context | keep **(director)** | context: a card about the organizing containers themselves | Strictly fails the test (a class of actors is not organizing vocabulary), but no rung fits Roles cleanly — Question 6 asks where Role cards sit; as the class-definition card it is the least-wrong `context` of the three. |
| Role - Raven | context | **aggregate (director)** | aggregate: own lifecycle with real state transitions | A named colleague is identity-bearing with a real growth lifecycle (the Visualized Colleague Growth wager is about exactly that progression); `context` fails its test — Question 6. |
| Role - Damien | context | **aggregate (director)** | aggregate: own lifecycle with real state transitions | Same as Raven: a named instance that is coined, built out, and leveled — not organizing vocabulary — Question 6. |
| Surface - Tray | component | keep | component: piece inside an aggregate, no independent life | A visual area of the Viewer; the coins are components inside it in turn. |
| Surface - Builder | component | keep | component: piece inside an aggregate, no independent life | A section of the Viewer with no independent life. |
| Entity - Coin | component | keep | component: piece inside an aggregate, no independent life | Lives inside the Tray, one per colleague — a piece by its own account. |
| Entity - Project | context | keep | context: a card about the organizing containers themselves | Borderline: the outermost working container every record is scoped to is the nearest rung, and the card itself flags its data-model standing as open — no stronger rung to move it to yet. |
| Entity - Alexandria Config | component | keep | component: piece inside an aggregate, no independent life | Exists exactly as long as its project does — the card applies the test itself. |
| Entity - Viewer Route | value | keep | value: the card IS its content | A path-to-mode mapping with no identity beyond its string. |
| Mechanism - AX Runtime Server | component | keep | component: piece inside an aggregate, no independent life | The engine behind the surfaces — serves them, holds their state, no domain lifecycle of its own. |

### canvas (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Mechanism - Canvas | capability | keep | capability: a verb, operation, or gate | A build-artifact → request-review → wake operation (dormant but still a verb); it is also this shelf's only headline candidate, which feeds Question 7 (the "one level down" observation). |
| Entity - Canvas Step | component | keep | component: piece inside an aggregate, no independent life | One saved unit of canvas work — a piece of the mechanism's flow. |
| Capability - Canvas Review | capability | keep | capability: a verb, operation, or gate | Deprecated (folded into Mechanism - Canvas) — keeps its subject's rung as a reference stub. |

### knowledge-organization (product)

| Card stem | Current | Proposed | Test applied | Reason |
|---|---|---|---|---|
| Concept - Knowledge Organization | pillar | keep | pillar: headline card of its own shelf | The Dewey-Decimal card whose story fronts this shelf. |
| Pattern - The Approach | pillar | keep **(director)** | pillar: headline card of its own shelf | Second pillar on the shelf — cited by the D4 ruling as legitimate relative usage; covered by Question 5 (co-headlines). |
| Concept - Plane | context | keep | context: a card about the organizing containers themselves | One of the containment-hierarchy levels — the rung's home case. |
| Concept - Context | context | keep | context: a card about the organizing containers themselves | Containment-hierarchy level. |
| Concept - Domain | context | keep | context: a card about the organizing containers themselves | Containment-hierarchy level (division). |
| Concept - Company | context | keep | context: a card about the organizing containers themselves | Containment-hierarchy level (outermost). |
| Concept - Library | context | keep | context: a card about the organizing containers themselves | The name for the hierarchy's total contents — organizing vocabulary. |
| Concept - Type | context | keep | context: a card about the organizing containers themselves | A classifying axis rather than a container, but D4's own precedent (a future Release vocabulary card lands at `context`) reads the rung as the organizing scheme's vocabulary broadly. |
| Concept - Altitude | context | keep | context: a card about the organizing containers themselves | Same reading as Concept - Type — the organizing scheme describing itself. |
| Concept - Atomic Card Category | value | keep | value: the card IS its content | The eleven-bucket superstructure stated — a definition card, meaning by content. |
| Concept - Capabilities | value | keep | value: the card IS its content | Bucket-definition card. |
| Concept - Economy | value | keep | value: the card IS its content | Bucket-definition card (correctly-empty bucket). |
| Concept - Entities | value | keep | value: the card IS its content | Bucket-definition card. |
| Concept - Mechanisms | value | keep | value: the card IS its content | Bucket-definition card. |
| Concept - Patterns | value | keep | value: the card IS its content | Bucket-definition card. |
| Concept - Rationale | value | keep | value: the card IS its content | Retired bucket kept as a definition-and-pointer card — still meaning by content. |
| Concept - Research | value | keep | value: the card IS its content | Bucket-definition card (Learning-plane bucket, empty by design at audit time). |
| Concept - Roles | value | keep | value: the card IS its content | Bucket-definition card. |
| Concept - Surfaces | value | keep | value: the card IS its content | Bucket-definition card. |

## Decisions for the director

Judgment calls the apply pass must not make on its own. Each is a question with a
recommendation and the live alternatives; the tables above mark every affected row
**(director)**.

**Question 1 — Should the three corporate Bets (Colleagues Grown from Company Design,
Colleagues as the Interaction Layer, A Visual, Traversible Work Environment) stay at
`pillar`, even though the two-axis taxonomy ruling once said the cluster heads are
`keystone`?** The drift is real: the ruling said keystone, but shipped practice made
keystone mean "the two `_index` front pages" and nothing else, and the D4 learning-plane
ruling reaffirmed exactly-one-keystone-per-plane. *Recommendation (not decided here):
keep all three at `pillar`* — under the ruled relative grammar each is precisely the
headline card of its own cluster shelf, and this formally supersedes the old keystone
wording rather than un-shipping it. Alternatives: (a) promote the three to `keystone`,
which restores the old ruling's letter but breaks "keystone = a plane's one front page"
and the viewer's `_index` convention; (b) demote them to `aggregate` like their member
Bets, which leaves the three strategy shelves with no headline at all.

**Question 2 — Should the deprecated `Concept - AI Colleague` be demoted from `pillar`
to `value`?** A deprecated card holding headline rank distorts any lead-selection or
index logic that trusts altitude, and this card's job is done: its thesis lives on as
`Bet - Independent Execution` and its class as `Role - AI Colleague`. *Recommendation:
demote to `value`* — what remains is a superseded statement kept for reference, meaning
by content, matching the deprecated-reference precedent (Idempotency Key, Run Labels).
Alternatives: (a) `component` (treat it as a retired piece of the viewer story — but it
was never a part of anything); (b) keep `pillar` and rely on `status: deprecated` alone,
which preserves history but leaves two headline cards of the viewer shelf, one of them
dead.

**Question 3 — Should `Surface - AX CLI` come down from `pillar` to `component`?** The
design log already flags it as "arguably over-promoted": under the relative grammar the
viewer shelf's headline is `Surface - Viewer`, and the CLI is another place the product
is met — the rung Tray and Builder already occupy. *Recommendation: demote to
`component`.* Alternative: keep `pillar` by ruling the CLI a genuine co-headline — the
terminal half of how the product is met, as its own body ("one of the product's headline
parts") argues; if Question 5 lands on strict single-headline shelves, this alternative
is off the table.

**Question 4 — Should `Mechanism - Trigger` be promoted to `pillar` so the triggers
shelf has a headline?** Triggers is named among the product's true pillars in the
product index, yet it is the only primitive shelf with no pillar-altitude card; the
card calls itself "the core noun of the Triggers region". *Recommendation: promote
`Mechanism - Trigger` from `capability` to `pillar`*, matching Ledger, Playbook,
Library, and Viewer. Alternatives: (a) leave the shelf headline-less until the region
is designed (the card admits most of the area is not yet cut); (b) headline
`Capability - Wake` instead, though it narrates delivery rather than the region.

**Question 5 — May a shelf carry two headline cards (the primitive noun plus its
Pattern), or is `pillar` strictly singular?** Three shelves pair a noun-pillar with a
pattern-pillar (Playbook + Running Plays, Alexandria Product Library + Updating the
Library, Knowledge Organization + The Approach), and the viewer shelf keeps Role -
Director beside Surface - Viewer. *Recommendation: tolerate co-headlines — rule pillar
as pillar-sparse, not pillar-singular* — the D4 ruling itself cites these pattern cards
as legitimate relative usage and puts the golden metric at pillar on a shelf that
already has a lead card. Alternative: strict single-headline shelves, which would force
a new rung for the two core recurring Patterns and for Role - Director (none of the
remaining five words fits a recurring motion well — the nearest is `capability`, which
flattens a pattern into an operation).

**Question 6 — Where do Role cards sit on the ladder?** The current scatter matches no
rung's test: Director at `pillar` (blessed by the ruling), but Raven, Damien, and the
AI Colleague class at `context`, a rung whose test is "about the organizing containers
themselves". *Recommendation: move the named instances `Role - Raven` and
`Role - Damien` to `aggregate`* — a named colleague is identity-bearing with a real
growth lifecycle (coined → built out → leveled, the exact progression the Visualized
Colleague Growth wager bets on) — *and keep the class card `Role - AI Colleague` at
`context`* as the least-wrong seat for a class-definition card until a better rung is
ruled. Alternatives: (a) keep all three at `context` as a shipped roles-convention and
document the exception; (b) rule a dedicated reading ("context = classes and
containers") so the class card stops being an exception; (c) move the class card to
`value` (a definition card, like the eleven bucket cards).

**Question 7 — What should happen to canvas and knowledge-organization, the two
contexts the director observed "feel one level down" among the product pillars?** No
altitude edit can fix this: the feel comes from container placement, not card
frontmatter — canvas is a dormant three-card mechanism family with no pillar card, and
knowledge-organization is the library describing its own machinery rather than a
product region. *Recommendation: treat it as a structural (container) question outside
this apply pass* — candidate moves are re-homing canvas inside the viewer context (its
would-be headline is a dormant mechanism) and accepting knowledge-organization as a
deliberate self-description shelf whose pillar stays, with the index rendering both
below the five primitive shelves. Alternatives: (a) leave both as-is and let the index
order carry the demotion visually; (b) give canvas a pillar (promote Mechanism -
Canvas) to make it a full shelf, which cuts against its dormant, zero-shipped-UI state.

## Mechanical fixes

Obvious corrections needing no ruling — the apply pass may make these directly:

| Card stem | Current | Proposed | Reason |
|---|---|---|---|
| Entity - Play | context | aggregate | A product noun, not organizing vocabulary: the playbook's unit, authored → proven → revised → retired, symmetric with Atomic Card (aggregate) as the library's unit. |
| Surface - Inbox | context | component | The card's own body fails the context test ("a bounded place, not itself lifecycle-bearing"): a parked place in the pipeline, matching Tray and Builder among Surfaces. |

Adjacent findings recorded, not part of the card apply pass (already logged in the
design log's tuning findings): `altitude:` is a free string nowhere validated against
the seven ruled words, and the viewer's lead-selection rank table knows only five of the
seven (keystone and context unranked) — both are factory-issue material, not card edits.

## Tally

114 cards audited: **100 keep** (uncontested), **2 mechanical changes**
(Entity - Play, Surface - Inbox), **12 rows held for the director** across 7
questions — of which 5 recommend a change (Concept - AI Colleague → value,
Surface - AX CLI → component, Role - Raven → aggregate, Role - Damien → aggregate,
Mechanism - Trigger → pillar) and 7 recommend keeping the current value (the three
corporate Bets at pillar, the three co-headline Patterns under Question 5, and the
Role - AI Colleague class card).
