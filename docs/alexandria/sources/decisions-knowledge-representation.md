# Key Decisions: Knowledge Representation

Source material for knowledge area 5.1. From solicitation prompt conversation, 2026-03-23.

## Decision 1: Why context libraries exist

**The bet:** Agents will do better work with better context. A lot of important context
gets lost at the watercooler — the when/why context, past learning, future plans, and
the reasoning behind both.

**Secondary bet:** Context libraries will also help get human teams on the same page.

**Evidence status:** We are confident on the first bet but in search of evidence that
both matter. If one doesn't, it will make a huge impact on how we design and deliver
context briefings.

**What this means:** The product thesis has two legs. If the AI-context leg is validated
but the human-alignment leg isn't, briefing design may shift toward pure AI optimization
(shorter, more structured, less narrative). If both validate, briefings serve a dual
audience.

## Decision 2: Atomic documentation over monolithic documents

**Decided:** One concept per card. Wiki-style atomic documentation.

**Alternative rejected:** Large narrative documents, folder-organized, human-forward.

**Why atomic:**

1. **Retrieval efficiency** (primary driver). If we're going to pile on WHY/WHEN
   information, context briefings can get potentially slow and expensive. Atomic cards
   let us pull 5 relevant cards instead of 1 giant doc. The card budget system only
   works with atomic units.

2. **Blast radius visibility** (discovered during build). When a core strategy changes
   or a big lesson arrives from the marketplace, atomic documentation shows the splash
   zone — everything linked to the changed card needs revisiting. A monolithic doc hides
   this; you'd have to re-read the whole thing.

3. **Graph traversability**. Atomic cards with wikilink edges create a machine-traversable
   knowledge graph. Retrieval profiles, hop-depth rules, and mandatory category checks
   all depend on the graph being made of discrete, typed, linked nodes.

## Decision 3: Markdown files over a database

**Decided:** Markdown files in a folder structure that encodes the type taxonomy.

**Alternative considered but not yet rejected:** Structured database with typed
relationships and schema enforcement.

**Why markdown (for now):**

- **Prototype speed.** Markdown was the fastest way to get the system built and out the
  door while the technical cofounder focused elsewhere.
- **AI can work with it well enough.** Agents parse markdown, follow wikilinks, and
  produce structured output from it. It's not optimal, but it's sufficient for v1.
- **Human collaboration.** Markdown is accessible to both humans and AI. Humans can read,
  edit, and review cards directly in their editor. A database would require tooling for
  human access.

**Why database is appealing (future direction):**

- **Structured queries** instead of grep-based search.
- **Typed relationships** instead of wikilink text parsing.
- **Schema enforcement** instead of Nit checking card structure after the fact.
- All three would make the system more AI-native and reduce the work Nit does manually.

**Current status:** Markdown is a halfway point. The team wants the best of both worlds
but is unclear on the best approach for getting there. The beadification plan (MCP tool
integration) is one step toward structured access over markdown files.

**What would change this decision:** If the cost of maintaining markdown (Nit's structural
sweeps, Sam's self-checks, broken wikilinks, naming convention enforcement) exceeds the
cost of building database tooling, the balance tips toward a database backend with
markdown as a rendering format rather than a storage format.

## Decision 4: AI-native over human-forward

**The lean:** The library leans AI-native. So much documentation gets delivered to AI in
a way that is human-forward; we want our library to be AI-native.

**What AI-native means concretely:**

- **Five dimensions** are structured for retrieval, not for narrative reading. A human
  would write a paragraph; the library structures it as WHAT/WHERE/WHY/WHEN/HOW.
- **Wikilinks as edges** create a machine-traversable graph. A human would write
  "see also [document name]"; the library writes `[[Type - Name]]` with typed
  relationship context.
- **Card budgets and attention ordering** are optimized for LLM context windows
  (U-shaped attention), not for human reading flow.
- **Retrieval profiles** are programmatic instructions for how to navigate the graph,
  not human-readable "where to find things" guides.

**What human-forward would look like:** More narrative. More folders. Documents organized
for reading flow rather than retrieval. The source material we boil down into cards IS
the human-forward version.

**The tension:** Humans need to maintain, review, and contribute to the library. If it's
too AI-native, humans can't collaborate effectively. If it's too human-forward, AI
retrieval is inefficient and imprecise. The current position is a compromise, leaning AI.

**Open question:** Can the library be stored AI-native (database, typed relationships,
schema enforcement) and rendered human-accessible (markdown views, graph visualizations)?
That would resolve the tension rather than compromising on it.
