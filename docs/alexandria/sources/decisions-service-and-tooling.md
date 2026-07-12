# Key Decisions: Service, Assembly & Tooling

Source material for knowledge area 5.1. Synthesized from design conversations, 2026-03-23.

**Evidence status:** These decisions have the least prototype validation of any category.
The wizard has been used and delighted users. The library has meaningfully improved how
LifeBuild gets built. Quality and grading have real reps. But assembly, retrieval, and
tooling are where the team is building to learn — the reasoning is clear but the evidence
is thin. Decisions here should be read as directional bets, not validated patterns.

## Decision 22: Beads as the unit of AI-native knowledge

**Decided:** The library's atoms should be "beads" — structured, typed, machine-addressable
units of product knowledge that can be composed, queried, and assembled programmatically
via MCP tools.

**Current state:** Cards are markdown files with YAML frontmatter. Agents parse them by
reading text. This works but is human-first — the format was designed for humans to read
and edit, with AI as a secondary consumer.

**Why beads:**

- **Organization and communication.** Even before proving beads are better for AI
  consumption, they're a better way to organize and talk about an AI product for a
  human-AI hybrid team. Typed, structured, addressable units create a shared vocabulary
  for what the library contains and how pieces relate.

- **Programmatic access.** MCP tools that serve beads can answer queries like "give me all
  product entities related to this component" without the agent reading and parsing
  markdown files. This shifts the burden from agent inference to structured retrieval.

- **Composability.** Beads can be composed into briefings algorithmically — card budgets,
  attention ordering, hop-depth rules all become software operations on typed data rather
  than agent judgment calls on markdown text.

**What we don't know yet:** Whether beads actually produce better agent output than
well-structured markdown. The hypothesis is strong — structured data should be more
reliable for programmatic consumption than prose — but we've never run the library with
beads. The improvement might be dramatic or marginal. Building the bead infrastructure
is partly a bet and partly a learning vehicle.

**What would change this decision:** Evidence that agents produce equivalent quality output
from well-structured markdown as from beads. If the format doesn't matter to the consumer,
the overhead of bead infrastructure isn't justified. Conversely, evidence that beads
dramatically improve agent output would accelerate the migration from markdown.

## Decision 23: Retrieval profiles over free-form assembly

**Decided:** Context assembly should follow typed retrieval profiles — programmatic
instructions for how to navigate the knowledge graph for a specific task type.

**Alternative rejected:** Free-form assembly where the agent explores the graph and uses
judgment to select relevant cards.

**Why profiles:**

- **Consistency.** A retrieval profile ensures that every "build a new feature" briefing
  includes product vision, relevant entities, interaction patterns, and anti-patterns —
  regardless of which agent instance runs the assembly. Free-form assembly depends on
  the agent's judgment, which varies with context window state.

- **Card budgets.** Profiles specify how many cards to include from each category, enabling
  attention management. LLM context windows have a U-shaped attention curve — information
  in the middle gets less weight. Profiles can front-load high-priority cards and manage
  the total budget.

- **Auditable.** When a briefing produces bad output, profiles make it diagnosable: was the
  profile wrong (wrong cards selected) or was the source material wrong (right cards, bad
  content)? Free-form assembly conflates selection quality with content quality.

**What we don't know yet:** The optimal profile structures. Current profiles are designed
on paper but haven't been tested at scale. Do builders actually produce better work with
profiled briefings vs. "just read the relevant cards"? How many profile types are needed —
is one per play enough, or do profiles need to be parameterized by task characteristics?

**What would change this decision:** Evidence that agents perform just as well with
unstructured access to the full library (e.g., a graph search tool + good judgment). If
models get good enough at self-directed retrieval, profiles become unnecessary overhead.

## Decision 24: Attention ordering is a design problem

**Decided:** The order in which cards appear in a briefing is a deliberate design choice
optimized for LLM attention patterns, not a natural sort (alphabetical, chronological,
by type).

**Why:**

- **U-shaped attention.** LLMs attend more to the beginning and end of their context window.
  The middle gets compressed. This means card ordering directly affects which knowledge
  the agent actually uses. Putting the most important context first and last — with
  supporting context in the middle — is a retrieval design choice.

- **Attention is a resource with a shape.** This is a first-class principle. Briefings that
  ignore attention ordering are leaving agent performance on the table.

**What we don't know yet:** The actual attention curves of current models on our specific
briefing structures. The U-shaped attention pattern is well-documented in research but
varies by model, context length, and content type. We haven't measured whether our
ordering choices actually improve output quality for our specific use case.

**What would change this decision:** Models with flat attention (equal weight across the
full context window) would make ordering irrelevant. More practically, evidence that our
specific ordering choices don't measurably affect output quality would deprioritize this
as a design concern.

## Decision 25: YAML frontmatter is a human-first compromise

**Decided (current state):** Cards use YAML frontmatter for metadata (type, status, links,
dimensions).

**The concern:** This format may be optimized for human readability at the expense of AI
consumption. YAML frontmatter is how humans expect to see structured metadata in markdown
files. But agents parsing YAML from markdown is a string-processing task that could fail
silently or lose structure — it's not how you'd design the format if AI were the primary
consumer.

**The broader pattern:** Many of the current agent instructions and card formats were
designed by AI assistants helping build AI tools — and those assistants defaulted to
human-first patterns. YAML frontmatter, markdown prose, natural language instructions —
these are all conventions from human-readable documentation, not from AI-native systems
design. The team has a serious concern that the agents are written human-first, not
AI-first, because the AI helpers that built them defaulted to human-readable patterns.

**What AI-first might look like:**

- Structured data formats (JSON, typed schemas) instead of YAML-in-markdown
- Machine-addressable references instead of wikilink text parsing
- Typed relationships with schema enforcement instead of convention-based linking
- Query interfaces instead of file-reading-and-parsing

**What we're building toward:** The beadification plan is partly a response to this concern.
MCP tools that serve structured data to agents — rather than agents reading markdown files
and parsing frontmatter — would shift the library toward AI-native consumption while
preserving human-readable rendering.

**What would change this decision:** Evidence on which formats actually produce better agent
output. The team hasn't tested JSON cards vs. YAML-frontmatter cards vs. pure markdown
vs. MCP-served structured data. This is a prime candidate for the eval/iterate process —
version the card format, benchmark agent output quality, promote the winner.

## Decision 26: MCP tools as the AI-native interface

**Decided:** The long-term interface between agents and the library should be MCP tools —
structured, typed, queryable — rather than file system access.

**Current state:** Agents read markdown files from the file system. They navigate by
following wikilinks (text parsing), filter by reading frontmatter (YAML parsing), and
assemble briefings by concatenating card contents (string operations).

**Why MCP:**

- **Structured queries.** "Give me all Component cards linked to this Strategy" becomes a
  tool call with typed parameters and a typed response, not a series of file reads and
  grep operations.

- **Schema enforcement at the interface.** The MCP tool can validate requests and responses
  against a schema. Bad queries fail fast. Agents can't silently misparse a wikilink
  or miss a frontmatter field.

- **Separation of storage and access.** MCP tools can serve the same data regardless of
  whether the underlying storage is markdown files, a database, or a hybrid. This decouples
  the storage decision (Decision 3) from the access pattern.

**What we don't know yet:** Almost everything about actual MCP-mediated library access.
We haven't built the tools. We haven't tested whether agents produce better output when
using structured tool calls vs. reading files. We don't know the latency characteristics,
the failure modes, or the debugging experience. The hypothesis is strong but the evidence
is zero.

**The learning plan:** Build the simplest possible MCP tools (read card, search cards,
get linked cards) and test whether agent output quality improves. This is the beadification
plan's Phase 1 — not a full migration, just enough tooling to learn whether the direction
is right.

**What would change this decision:** Evidence that file-system access with good conventions
produces equivalent agent output to MCP-mediated access. If the overhead of building and
maintaining MCP tools doesn't buy measurably better results, the simpler approach wins.

## Decision 27: Build to learn, not build to ship

**Decided:** Service, assembly, and tooling work is prioritized for learning over shipping.
The goal is to discover what works, not to build the production system.

**Why:**

- **Thin evidence.** The wizard has delighted users. The library has meaningfully improved
  LifeBuild development. Quality and grading have real reps. But assembly, retrieval,
  beads, and MCP tools have not been prototype-tested to the same degree. Investing in
  production-quality infrastructure for patterns that haven't been validated would be
  premature.

- **The AI-first question is open.** The team's concern that current formats are human-first
  is well-founded but unproven. Building to learn means testing the hypothesis: does
  AI-native formatting actually produce better agent output? If yes, how much better, and
  at what infrastructure cost? These questions can only be answered by building prototypes
  and measuring.

- **Eval/iterate is the mechanism.** The versioned play system with staged drafts and
  benchmarking (from the Elicit-inspired eval/iterate pattern) is designed exactly for
  this: try a new approach, measure it against the current approach, promote if better.
  Service and tooling decisions should flow through this process rather than being decided
  in advance.

**What would change this decision:** Enough prototype evidence to graduate from "build to
learn" to "build to scale." Specifically: evidence on bead format effectiveness,
retrieval profile optimization, MCP tool utility, and attention ordering impact. Each
of these can be tested independently and promoted when ready.
