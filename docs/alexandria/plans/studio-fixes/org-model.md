# PLAYMAKER'S STUDIO

## Org Model — Company · Division · Function · Play

> **Ruled with the director 2026-06-23.** The corrected organizational floor for the
> Studio: who owns what, how plays are filed, and who fronts each division. It supersedes
> the **Division** treatment in [`studio-data-model.md`](studio-data-model.md), which
> conflated *Company* into *Division* and hardcoded "the 8 Functions" as universal. The
> rest of that draft (Catalog / Board / Operations / Ledger detail) still stands; its org
> spine defers here until it is rewritten. **Ruled this session except the Open Threads at the end.**

---

## The spine

**Company → Division → Function → Play.** Each **Division** has a **face agent**. Each
**Play** also declares a **Tier** (its seniority altitude — an *attribute*, not a level), a
**kind** (production vs maintenance), and a lifecycle **stage**. Tier crosses Function as the
second axis of an org grid (function × seniority); it is not a containment level.

---

## Company — Alexandria_Prime

One Company (this repo is its instance). Multi-tenancy and the eventual PlaymakerStudio
**spin-out** are realized *across instances*, using Alexandria's own
`origin: { core, company }` mechanism (see [`product-data-model`](../product-data-model/alexandria-product-data-model.md),
the `Library (zone)` origin). **We defer that machinery behind the Division seam** — there is
no spin-out plan yet, so we don't pay for it. Strong Division discipline now makes the future
promotion *(Division → Company)* a clean lift.

---

## Divisions and their face agents

| Division | Face agent | Mission | Functions | Library |
|---|---|---|---|---|
| **Product** | **Raven** | build the product | **9** | the Product zone — the library being rebuilt |
| **PlaymakerStudio** | **William** | **write, maintain, and improve plays** | **4** | its product library *(future)* |

**The face agent is the single interface to its division's plays *and* its library — they go
hand in hand.** Filling a division's federated library is how you *power up (onboard)* that
division's AI employees and *unlock* their plays (some plays stay locked until their library
areas exist). So onboarding Raven = filling her library = unlocking her plays ("build-a-Raven").
This sharpens the old "agent-ownership is a view" rule: the agent is the **front** of its
division, never a container.

- **Raven** fronts Product.
- **William** (an ode to Shakespeare, the playmaker) fronts PlaymakerStudio. He is Raven's peer
  and needs **his own coin**. A standalone PlaymakerStudio would have its own "Raven"; as a
  Division it has William — and **on spin-out William simply becomes PlaymakerStudio-the-company's
  Raven-equivalent.** (Practically, William is the seat we collaborate from on studio work.)

---

## Functions — a universal core + per-division domain

Functions are **declared per Division** (different count and names per division — Product has 9,
PlaymakerStudio has 4). There is **no master vocabulary** that divisions subset. But **two
functions recur in every AI-team division**:

- **Operations** *(universal)* — run and maintain the division's own machinery (tools, process,
  cadence, internal upkeep).
- **Library Operations** *(universal)* — build and maintain the division's federated library:
  **elicitation** (the *product walk* — the EL chain) + **atomic-card production** (atomize
  sources → cards) + **living updates** (keep it current). It is the **channel for bringing the
  division's agent new knowledge**, and it is **AI-team-specific**: a human team doesn't have it
  because it isn't powered by a context library. **Exposed everywhere** (every division with a
  library has it), and it is *upstream* — its output (filled library areas) gates the other
  functions' library-dependent plays.

Everything else is **domain-specific**, invented per division.

### Product Division — 9 Functions

The 8 already defined in `studio/index.html` (`JOBS`) **+ Library Operations**. The existing
8th, **Product Operations**, *is* the universal **Operations**; **Library Operations** is the
addition that makes Product 9.

| # | Function | Kind |
|---|---|---|
| 1 | Insight | domain |
| 2 | Strategy | domain |
| 3 | Definition (Spec) | domain |
| 4 | Delivery | domain |
| 5 | Launch | domain |
| 6 | Analytics | domain |
| 7 | Communication | domain |
| 8 | **Operations** (Product Operations) | universal |
| 9 | **Library Operations** | universal |

### PlaymakerStudio Division — 4 Functions

The mission is simple — *write, maintain, improve plays* — and the functions follow it:

| Function | Mission verb | Kind | Holds |
|---|---|---|---|
| **Production** | **write** | domain | make plays — the forward-design pipeline (Ground → Brief → Harden → Derive → Test → Run → Bank → Register) |
| **Proving** | **improve** | domain | validate & sharpen plays — the whole `TESTING.md` / `RISKS.md` canon, the proving ladder, the Improvement loop |
| **Operations** | **maintain** | universal | run/maintain the studio — Play Re-sync, the Curator, the Board, the operations manual *(all of [`studio-operations-division.md`](studio-operations-division.md) lives here)* |
| **Library Operations** | — | universal | William's product library *(future — empty for now)* |

*(Production and Proving can merge to one if a coarser cut is preferred — director's granularity call.)*

---

## Home Division vs. Built-by — provenance is not the filing key

A play carries **two distinct relationships**:

- **Home Division** — who *owns / serves* the play. **The filing key.**
- **Built-by** — the *factory* that produced it. **Provenance — a Ledger actor fact, never the
  filing location.**

So **PlaymakerStudio is a factory: it writes plays for other divisions, and those plays file in
the divisions they serve.** "Built by William/PlaymakerStudio" rides on the Ledger.

**Consequence — `atomic-card` + the EL (elicitation / product-walk) plays live in
`Alexandria_Prime → Product → Library Operations`, fronted by Raven** — *not* in PlaymakerStudio.
PlaymakerStudio merely built them. (The `job: Library` breadcrumb on `back-of-house-walk` was
reaching for exactly this Library Operations home.)

**The reframe that falls out:** `studio/plays/registry.js` today is essentially **the Product
Division's catalog** — Raven's golden path (frame-the-problem, write-the-one-pager, scope-an-mvp,
the build plan…), with `job:` = their Product Function. It was never "the studio's registry"; it
is *Raven's*, and PlaymakerStudio merely tends it.

---

## "Back-of-house" is retired

The old zoo of hidden back-of-house agents (Conan the Librarian, Sam, the Hardener, Checker,
Grader…) **dissolves.** There is **no "back-of-house play"** — only Division → Function plays
fronted by the division's agent. Internal step-roles collapse into **Moves** inside plays.
**Conan's librarian work = Raven doing Library Operations.** This retires the whole
front/back-of-house *modeling distinction*.

> **Do not over-cut:** this is *different* from the **Back-of-House / Front-of-House Walk** plays
> (EL2 / EL3). Those names describe *which part of the business you elicit* (the restaurant
> metaphor — internal ops vs. customer-facing), not a hidden play. **They keep their names.**

---

## What this corrects in `studio-data-model.md`

| The draft said | Corrected |
|---|---|
| **Division** = `Alexandria : Operations` / `Playmaker Studio : Operations` | Those strings were `<Company> : <Function-word>` — Company folded into Division and Function doubled. → **Company = Alexandria_Prime; PlaymakerStudio is a Division; Operations is a Function.** |
| "the **canonical 8** Functions" (universal) | Functions are **per-division**; only **Operations + Library Operations** are universal. |
| `registry.js` = "the studio's registry" | It is **the Product Division's catalog** (Raven's golden path). |
| atomic-card family filed under `Alexandria : Operations` | **Product → Library Operations**, fronted by Raven; **built-by** PlaymakerStudio is provenance. |
| back-of-house as a modeling axis | **Retired** — division face agent + Functions; internal roles dissolve to Moves. |

---

## Implications for the keystone (catalog-home) PR

The catalog can't be a flat file with a global Function enum. It becomes **Division-partitioned,
Functions-per-Division**:

- **Product Division catalog** — today's `registry.js` golden path, re-homed and relabeled as
  Raven's; **add Library Operations**; give `atomic-card` + the EL family a Library Operations home.
- **PlaymakerStudio Division catalog** — a (small) catalog for its 4 functions' plays
  (Production / Proving / Operations / Library Operations).
- **Built-by** rides the Ledger (provenance), not the filing.
- The universal core `{ Operations, Library Operations }` + each division's domain set are
  **declared as data** (so a division's Functions are validated against *its* set).

This is data/filing work, not deep code — but a genuine restructure, and the right floor.

---

## Open threads

1. **William's coin + onboarding** (build-a-William) — downstream, trackable; not today.
2. **Production / Proving granularity** — keep 4, or merge to 3.
3. **Where the Function vocabulary lives as data** — the home that declares the universal core +
   each division's set (a keystone-PR detail).
4. **Studio's own product Library timing** — when William's library (PlaymakerStudio's Library
   Operations) actually gets built.
