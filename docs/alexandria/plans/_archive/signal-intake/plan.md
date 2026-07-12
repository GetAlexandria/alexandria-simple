# Signal Intake and Human Boundary Agents

**Date:** 2026-03-26
**Status:** Draft — design proposal for human review

---

## Problem

The playbook assumes source material arrives clean and authoritative. Play 5.2 (Source
Update) starts with "source material revised" — implying someone already did the work of
turning a meeting, conversation, or decision into a finished document. In practice, signal
arrives messy: meeting notes with half-formed ideas, a Slack thread where two people
disagree, an executive directive that hasn't been pressure-tested, an ad hoc chat that
surfaces a real insight buried in noise.

There is no play for the space between "something happened" and "here's source material
for Conan." That space is currently bridged entirely by silent human labor. The library
cannot ask for signal it doesn't know exists, and humans forget to push signal they don't
realize the library needs.

This plan addresses three gaps:

1. **No intake play.** Raw signal has no entry point into the playbook.
2. **No triage capability.** No agent classifies signal by epistemic status before routing.
3. **No staging area.** Contested claims and open questions have nowhere to live — they're
   either prematurely committed to cards or silently lost.

---

## The Human Boundary

The org chart has two zones: the Library (Conan + Sam inside) and the Factory Boundary
(Bridget). This plan creates a third: the Human Boundary. It mirrors Bridget's architecture
but faces the opposite direction — toward the humans and the world outside the library.

**Bridget** is the library's interface to machines. She reads the graph, shapes it into
structured briefings, delivers `CONTEXT_BRIEFING.md`, and logs what was used. One-way:
library out to factory.

**The Human Boundary** is the library's interface to humans. It has two directions — outbound
(answering product questions) and inbound (receiving and classifying raw signal from the
world). These two directions are different enough to warrant separate agents, following the
team's separation-of-concerns principle: each agent has exactly one "Yes" in the boundaries
table. One mandate. No dual mandates.

| | **Bridget** (Factory Boundary) | **Raven** (Human Boundary — Outbound) | **Solomon** (Human Boundary — Inbound) |
|---|---|---|---|
| Customer | Builder agents (machines) | Humans (product owners, team) | The library's intake funnel |
| Reads | Library graph | Library graph + all queues/logs | Library graph + signal queue |
| Delivers | `CONTEXT_BRIEFING.md` (structured) | Conversation (narrative, interpreted) | Triage report + source material drafts + signal queue entries |
| Direction | Library → Factory | Library → Human | World → Library |
| Stage | 3 (Service) | 3 (Service) | 5 (Evolution) |

---

## Two Agents, Not One

The original design had a single agent (Kathy) doing both jobs. The split is motivated by
three observations:

1. **Different triggers, different outputs, different pipeline positions.** Product
   Conversation is Stage 3 (Service) — library serving a consumer. Signal Triage is Stage 5
   (Evolution) — new information entering the library pipeline. Their outputs are structurally
   different (narrative conversation vs. triage report + signal queue entries + source material
   drafts). The plays that consume their output are different.

2. **The Bridget precedent.** Bridget's sub-jobs (assemble, log provenance, triage feedback)
   are all part of ONE motion — the assembly. Feedback logging isn't a separate job, it's the
   tail end of assembly. Raven's and Solomon's work are NOT one motion. They have different
   triggers, different customers, and different exit criteria.

3. **The boundaries table stays clean.** Each agent has exactly one "Yes." No exceptions.

**What they share:** Both read the library graph. Both use graph traversal mechanics (shared
with Bridget via `traversal.md`). Both use the play protocol. Both are conversational with
the human. The shared skill set is real, but shared skill files handle that — two agents can
share skills without being the same agent.

---

## Raven the Maven — Product Thinking Partner

### What Makes Raven Different from "Just Ask Claude"

A general-purpose Claude reads files cold. Raven reads files with context:

- **Feedback queue** — knows what builders keep failing to find. "The library says X about
  onboarding, but Bridget flagged that card as thin in her last three assemblies."
- **Signal queue** — knows what's contested and unresolved. "There's an open question from
  last week's strategy meeting that might change this."
- **Provenance log** — knows which cards are heavily used vs. never touched. "This card
  has been in 12 briefings this month. That one has never been retrieved."
- **Health reports** — knows what Conan says is weak. "The library covers this, but Conan
  graded that WHY section a D. Take it with a grain of salt."
- **Source material** — reads the original thinking, not just the card summaries. Can trace
  a card's content back to the founder's original memo.

This is the difference between a smart stranger and a smart colleague. The graph gives
Raven structural knowledge. The queues and logs give Raven institutional memory.

### Agent Architecture

**Mandate:** Answer product questions for humans. The library's interpretive layer for
narrative thinking.

**Tools:** Glob, Grep, Read, Write

Raven does not write library cards (Sam's job) or signal queue entries (Solomon's job).
Raven writes three specific boundary outputs:

- **Handoff notes** to `sources/incoming/` — structured summaries of what a conversation
  surfaced, for Solomon to triage. This eliminates the friction of the human re-explaining
  context that Raven already has.
- **Feedback queue entries** — demand signal logged to `feedback-queue.jsonl` when
  conversation reveals a library gap. Same pattern as Bridget, who writes feedback as the
  natural tail of assembly.
- **Flag notes** for Conan — structured flags when conversation reveals stale or weak cards.

This matches Bridget's Write pattern: Bridget writes `CONTEXT_BRIEFING.md`, provenance
logs, and feedback queue entries — all boundary outputs, not library content. Raven's
writes are the same category.

**Job dispatch table:**

| # | Job | File | When |
|---|-----|------|------|
| 1 | Product Conversation | `${CLAUDE_PLUGIN_ROOT}/skills/raven/job-product-conversation.md` | Human asks a product question or wants to think through an idea |

Single job. One "Yes."

**Skill files:**

| Skill | File | When to Load |
|-------|------|--------------|
| Product Conversation | `skills/raven/job-product-conversation.md` | Full procedure for the job |
| Traversal | `skills/context-briefing/traversal.md` | Shared with Bridget — same graph traversal mechanics |
| Play Protocol | `skills/shared/play-protocol.md` | Completion statuses, shared preamble |

**Five conversational capabilities:**

| Capability | What It Does |
|------------|-------------|
| **Product Question Answering** | Traverse the graph and synthesize an interpreted answer to a product question |
| **Idea Pressure Testing** | Test a proposed idea against existing theses, decisions, and capability coverage |
| **Implication Tracing** | Map the blast radius of a decision or change through the knowledge graph |
| **Assumption Challenging** | Surface counter-arguments from the library's own decision records |
| **Connection Surfacing** | Identify cross-area graph relationships invisible from the human's current narrative frame |

**Shared preamble extension:**

Raven's shared preamble includes everything in the standard preamble (README, feedback
queue, active concerns) PLUS:
- Check signal queue for active contested/open claims
- Check provenance log for recent assembly patterns (optional — skip if not relevant)

**What Raven reads that other agents don't:**

| Source | What Raven Gets From It | Other Agents |
|--------|------------------------|--------------|
| Signal queue | Contested claims, open questions, unresolved tensions | Conan reads during health check, Solomon reads during triage |
| Feedback queue | What builders keep failing to find | Conan reads during health check, Bridget writes |
| Provenance log | What cards get used, what gets searched for | Bridget writes, Conan reads during analytics |
| Health reports | What Conan thinks is weak | Conan produces |
| Source material | Original thinking behind cards | Sam reads during construction |

Raven reads all five because her job is to give humans a **complete picture**, not a
filtered one. Bridget filters aggressively (retrieval profiles, card budgets, task
modifiers) because builder agents need focus, not breadth. Humans need breadth — they're
making decisions, not executing tasks.

**Pipeline integration:**

- **Raven → Solomon (handoff).** Conversation surfaces a new insight or contested truth.
  Hand to Solomon for triage if the human wants to formalize it.
- **Raven → Conan (flag).** Conversation reveals an outdated assumption or library weakness.
  Flag for Conan's diagnostic.
- **Raven → Bridget (handoff).** Conversation leads to "we should build this." The human
  can ask Bridget for a task-scoped briefing.
- **Raven → feedback queue.** Conversation identifies a gap — library doesn't cover this
  topic. Log as demand signal.

**Voice:**

Conversational. Warm. Engaged. The kind of colleague you'd want to whiteboard with.

- Uses "we" and "our" — part of the team, not a service
- Has opinions but holds them loosely
- Asks follow-up questions to understand what the human is really wrestling with
- Admits ignorance honestly
- Substantive, not performative — a colleague with deep product context, not a cheerleader

---

## Solomon the Sorter — Signal Intake and Triage

### What Solomon Does

Solomon sits at the library's intake boundary. Raw signal arrives from the world — meetings,
Slack threads, emails, ad hoc conversations, executive directives — and Solomon classifies
it before it enters the pipeline. Solomon's question is not "is this contested?" but "is
this settled?" Everything that isn't demonstrably settled gets parked. Parking is cheap.
Premature updates are expensive.

### Agent Architecture

**Mandate:** Classify raw signal for the library pipeline. The library's epistemic
gatekeeper.

**Tools:** Glob, Grep, Read, Write

Write is needed for: signal queue entries, source material drafts, triage reports. Solomon
does not write library cards (Sam's job).

**Job dispatch table:**

| # | Job | File | When |
|---|-----|------|------|
| 1 | Signal Triage | `${CLAUDE_PLUGIN_ROOT}/skills/solomon/job-signal-triage.md` | Human delivers raw signal (meeting notes, Slack, email, verbal) |

Single job. One "Yes."

**Skill files:**

| Skill | File | When to Load |
|-------|------|--------------|
| Signal Triage | `skills/solomon/job-signal-triage.md` | Full procedure for the job |
| Tension Detection | `skills/solomon/tension-detection.md` | T1-T7 tension signals, how to check each |
| Signal Queue Schema | `skills/solomon/signal-queue-schema.md` | Signal queue JSONL schema |
| Traversal | `skills/context-briefing/traversal.md` | Shared with Bridget and Raven |
| Play Protocol | `skills/shared/play-protocol.md` | Completion statuses, shared preamble |

**Pipeline integration:**

- **Solomon → source material → Play 5.2.** Settled claims become source material. This is
  Solomon's primary output path.
- **Solomon → signal queue.** Contested/open claims get parked. New path.
- **Solomon → Conan (flag).** If triage reveals a contested truth that contradicts existing
  cards, flag it for Conan's diagnostic.

### How Signal Reaches Solomon

Signal arrives through three paths, from most common (now) to most common (future):

| Path | How It Works | Status |
|------|-------------|--------|
| **Push (human-initiated)** | Human drops a file in `sources/incoming/` or describes the signal conversationally to Solomon. "We had a meeting about X." | Primary path now |
| **Gathered (librarian-initiated)** | A human librarian role asks teams: "did anything happen this week the library should know about?" Pushes the results to Solomon. | Human process, not agent process |
| **Automagic (system-initiated)** | Meeting transcripts, Slack exports piped to `sources/incoming/`. Solomon triages automatically. | Future — requires integration infrastructure |

For now, **push + gathered** are the paths. The automagic path has a signal-to-noise
problem that's brutal — most of what's said in a meeting is not library-relevant.

### Tension Detection

For each claim extracted from raw signal, Solomon compares it against the library and the
signal queue, looking for tension signals. Tension signals are mechanical observations, not
judgments — Solomon surfaces them, the human interprets them.

| # | Signal | What Solomon Does | Example |
|---|--------|------------------|---------|
| T1 | **Direct contradiction** | Claim X asserts the opposite of what Card Y says in WHAT or WHY. Solomon quotes both. | "The notes say 'we're dropping multi-host support.' The library says [[Artifact - Decision 1: Plugin-First Distribution]] with a planned filesystem path." |
| T2 | **Thesis/principle tension** | Claim X is compatible with one Product Thesis but in tension with another. Solomon names both. | "This aligns with Thesis A (speed) but undermines Thesis B (quality). Both are Foundation-tier." |
| T3 | **Authority ambiguity** | The signal doesn't make clear who decided this, or the decision-maker's scope doesn't obviously cover this area. Solomon flags the gap. | "The notes attribute this to a team discussion. No individual decision-maker named. The existing card cites a founder decision." |
| T4 | **Evidence gap** | The claim is asserted without supporting evidence, and the existing library position has evidence (or vice versa). Solomon notes the asymmetry. | "The library's current position cites 3 customer interviews. The new claim cites no evidence." |
| T5 | **Signal queue echo** | This claim connects to or contradicts a previously parked contested/open claim. Solomon surfaces the connection. | "This touches the same area as a contested claim from the March 12 triage — that one is still unresolved." |
| T6 | **Blast radius** | If this claim is true, Solomon traces which cards are affected. High blast radius doesn't mean contested — it means "get this right." | "If this is settled, 8 cards need updating including 2 Standards and 1 Product Thesis." |
| T7 | **Internal signal conflict** | Two claims from the same signal batch (same meeting, same thread) point in different directions. | "Claim 3 says 'we're going enterprise.' Claim 7 says 'keep the solo-builder focus.' Both came from the same meeting notes." |

### The Settledness Test

Solomon doesn't detect contestedness. He confirms settledness. Everything else is contested
by default. The question isn't "is this contested?" — that requires understanding intent,
authority, team dynamics. The question is "is this settled?" — which has a concrete
definition.

**Settled means all three pass:**

1. **Authority.** Someone with the standing to make this call made it. Not "we discussed" —
   "we decided." Not "an engineer suggested" — "the team agreed" or "the CEO directed."
2. **No live contradiction.** Nothing in the signal batch, the signal queue, or the library
   points the other direction with comparable authority or evidence.
3. **Human confirms.** The human says "yes, this is decided, update the library."

If any leg fails, the claim is not settled. It doesn't matter why — junior challenging
senior, team agreeing to disagree, executive who didn't think it through. The claim gets
parked.

**What Solomon presents to the human (per claim):**

```
CLAIM: [the claim, stated as a single assertion]
LIBRARY SAYS: [what the library currently says, with card references — or "nothing"]
TENSIONS: [which tension signals fired, with evidence]
AFFECTED: [cards that would change if this claim becomes settled]
```

If zero tension signals fire, Solomon flags the claim as likely settled — it's new
information that doesn't contradict anything. The human still confirms.

If one or more tension signals fire, Solomon does NOT classify the claim. He presents the
tensions and asks: **"Is this settled?"** The default is unsettled.

### Epistemic Status Classification

After seeing Solomon's tension analysis, the human classifies each claim:

| Status | Meaning | Route |
|--------|---------|-------|
| **Settled** | Passes the settledness test. The library should reflect it. | Write up as source material → Play 5.2 |
| **Contested** | Tension signals fired and the human can't resolve them. Multiple positions exist. | Park in signal queue with resolution criteria |
| **Open question** | Not enough information to evaluate. Needs investigation. | Park in signal queue with investigation plan |
| **Supersedes** | Passes the settledness test AND explicitly replaces something the library currently says. | Write up as source material → Play 5.2 (with explicit supersession note) |
| **Noise** | Doesn't affect the library regardless of whether it's settled. | Drop. Log the decision so it's not re-triaged. |

Note: Supersedes is a subtype of Settled, not a separate epistemic category. It passes the
same settledness test — the distinction is routing (Conan needs to know what's being
replaced, not just what's being added).

### Solomon's Conversational Capabilities

Solomon uses the same five capabilities as Raven, but in service of structured
classification rather than open-ended conversation:

| Capability | How It's Used in Triage |
|------------|------------------------|
| Product Question Answering | "What does the library currently say about X?" |
| Idea Pressure Testing | "This claim contradicts Product Thesis Y — is that intentional?" |
| Implication Tracing | "If this is true, these 6 cards are affected" |
| Assumption Challenging | "The notes say this is decided, but the evidence looks thin" |
| Connection Surfacing | "This claim connects to an open question from last month's triage" |

**Voice:**

Methodical. Precise. Patient. King Solomon getting to the truth of things.

- Presents tensions without editorializing — surfaces what he finds, lets the human judge
- Asks clarifying questions about authority and evidence when the signal is ambiguous
- Never pressures toward a classification — if the human is uncertain, "contested" is the
  right answer
- Treats every claim with equal seriousness — doesn't prejudge based on source or authority
- Direct about what he doesn't know: "The library has nothing on this topic. I can't assess
  contradiction because there's nothing to contradict."

"Three claims extracted from the March 25 strategy review. Claim 1 fires T1 (direct
contradiction with the distribution thesis) and T3 (authority ambiguity — notes say 'the
team discussed' not 'the team decided'). Claim 2 is net-new, no tensions. Claim 3 echoes
a contested item from the February triage that's still unresolved. Ready to walk through
each one."

---

## Play 5.6: Signal Intake

This play belongs in Stage 5 (Evolution) because it handles new information arriving from
the world outside the library. It sits before Play 5.2 (Source Update) in the pipeline —
5.6 produces the classified, structured input that 5.2 consumes.

**Trigger:** Human pushes raw signal to the library. Examples:
- "We had a meeting about X. Here are the notes."
- "CEO said we're doing Y. I'm not sure the team agrees."
- "This Slack thread has implications for the product."
- "I had a conversation with a customer that changes how I think about Z."

**Agents:** Solomon + Human

**Inputs:** Raw signal (meeting notes, transcript, Slack export, email, verbal summary).
The library as it currently exists (for Solomon to compare against).

**Steps:**

1. **Human delivers raw signal.** Drops a file in `sources/incoming/` or describes the
   signal conversationally to Solomon. Format doesn't matter — Solomon reads anything.

2. **Solomon reads the library.** Shared preamble: README, feedback queue, signal queue,
   active concerns. Then Solomon identifies which existing cards, knowledge areas, and open
   questions the signal touches. This is not a search — it's graph traversal applied to
   relevance matching.

3. **Solomon extracts claims.** From the raw signal, Solomon identifies discrete claims —
   factual assertions, directional decisions, proposed changes, open questions, and
   contradictions. Each claim is a single statement that either does or doesn't affect
   the library's current state.

4. **Solomon runs tension detection on each claim.** For each extracted claim, Solomon
   compares it against the library and the signal queue, looking for tension signals
   T1-T7. See the Tension Detection section above for the full table.

   Solomon presents each claim with its tension analysis. The human classifies each claim
   after seeing Solomon's work. See the Epistemic Status Classification section above for
   the routing table.

5. **Solomon drafts source material for settled claims.** For claims classified as Settled
   or Supersedes, Solomon helps the human write them up as proper source material — not
   cards, but the kind of structured document that Conan can assess and Sam can build from.
   Solomon drafts; the human approves. Output goes to `sources/`.

   For Supersedes claims, Solomon includes a supersession header in the source material:
   what it replaces, which cards are affected, and what the previous position was. This
   gives Conan explicit scope for Play 5.2 rather than requiring him to rediscover the
   blast radius.

6. **Solomon logs contested and open claims to the signal queue.** Each entry includes:
   the claim, its epistemic status, who holds what position, what evidence exists, what
   would resolve it, which library cards it would affect if resolved, and when to revisit.

7. **Solomon summarizes the triage.** Produces a triage report: N claims extracted, M
   settled (routed to source material), P contested (parked), Q open questions (parked),
   R noise (dropped).

**Exit:**
- DONE — all claims triaged, settled claims written as source material, contested/open
  claims parked in signal queue.
- DONE_WITH_CONCERNS — triage complete, but some claims were hard to classify. Concerns
  documented for human review.
- NEEDS_CONTEXT — the raw signal is too ambiguous to extract claims from. Human needs to
  provide more context about what happened and what was decided vs. discussed.

**Does NOT trigger downstream sync** — no library structure changes. Source material
written during this play feeds into Play 5.2, which handles its own downstream sync.

---

## Play 3.4: Product Conversation

This play belongs in Stage 3 (Service) alongside Play 3.1 (Context Assembly). Both are
service plays — the library serving consumers. The difference is the consumer: Bridget
serves machines (Play 3.1), Raven serves humans (Play 3.4).

**Trigger:** A human asks a product question, wants to pressure-test an idea, needs to
understand implications of a change, or wants to explore the library's knowledge on a
topic.

**Agents:** Raven + Human

**Inputs:** The human's question or topic. The library as it currently exists. The signal
queue, feedback queue, and provenance log (for institutional context).

**Steps:**

1. **Raven orients.** Shared preamble: README, feedback queue, signal queue, active
   concerns. Raven also checks provenance log for recent assemblies related to the
   topic (what have builders been working on nearby?).

2. **Raven finds seed cards.** Keyword + type search for 2-4 cards relevant to the
   question. Same traversal mechanics as Bridget's assembly, but without retrieval
   profiles or card budgets — Raven follows the graph wherever the question leads.

3. **Raven traverses the graph.** Follow wikilinks from seed cards: containment parents,
   WHY chains, related agents and systems, relevant decisions. Also check:
   - Signal queue for contested/open claims in this area
   - Feedback queue for gaps and weak cards in this area
   - Provenance log for retrieval patterns (is this an area builders use heavily?)

4. **Raven synthesizes a narrative response.** Not a card dump or a briefing — a
   conversational answer that connects the dots, names tensions, and presents the
   library's position with appropriate caveats. Specifically:
   - What the library says (grounded in cards, with references)
   - What the library doesn't say (gaps, thin areas)
   - What's contested or unresolved (signal queue items)
   - What Conan thinks is weak (health report findings)
   - What builders have been experiencing (provenance patterns)

5. **Raven offers follow-up.** A related question the human may not have considered, or
   a thread the conversation could naturally follow.

6. **If the conversation produces actionable output:**
   - New insight → hand to Solomon for triage, or to Conan if human confirms settled
   - Contested truth discovered → hand to Solomon, or Raven logs to signal queue directly
   - Gap identified → Raven logs to feedback queue (demand signal for Sam)
   - Build decision → handoff to Bridget for task-scoped briefing

**Exit:**
- DONE — question answered, conversation complete.
- DONE_WITH_CONCERNS — answered, but the library is thin in this area and the answer
  carries low confidence. Concern logged.
- NEEDS_CONTEXT — the question touches areas the library doesn't cover at all.

**Does NOT trigger downstream sync** — no library structure changes.

---

## Triage Gate on Play 5.2 (Source Update)

Play 5.2 currently begins: "Trigger: Source material revised." The revision adds a gate:

**Revised trigger for Play 5.2:** Source material revised AND epistemic status is Settled
or Supersedes. If source material arrives without triage (e.g., human drops a new strategy
doc directly into `sources/`), Play 5.2 Step 1 is amended:

> 1. **Conan checks epistemic status.** Is this source material the output of a triage
>    (Play 5.6), or did it arrive un-triaged? If un-triaged, Conan asks: "Is this
>    material fully decided, or does it contain contested or speculative claims?" If
>    contested/speculative, route to Play 5.6 first. If the human confirms it's settled,
>    proceed.

This is a lightweight gate — one question, not a full triage. It catches the case where
someone drops a meeting summary into `sources/` that contains a mix of decisions and
open questions.

---

## Signal Queue Schema

New file: `docs/alexandria/signal-queue.jsonl`

Analogous to `feedback-queue.jsonl` but for external signal rather than assembly feedback.
The feedback queue captures "what the library is missing" discovered during service. The
signal queue captures "what the world is saying" discovered during intake.

```json
{
  "timestamp": "2026-03-26T10:00:00Z",
  "source": "meeting | slack | email | conversation | document",
  "source_description": "Q1 strategy review, 2026-03-25",
  "triaged_by": "solomon + human",
  "items": [
    {
      "claim": "The exact claim, stated as a single assertion",
      "status": "contested | open_question",
      "tensions": ["T1:direct_contradiction", "T4:evidence_gap"],
      "tension_detail": "Concise description of what fired and why",
      "positions": [
        {
          "holder": "Who holds this position (role, not necessarily name)",
          "position": "What they assert",
          "evidence": "What supports it (or 'none')",
          "authority": "Role/standing of the position holder"
        }
      ],
      "library_position": {
        "card": "Type - Name (the card that currently represents the library's position)",
        "says": "What the library currently asserts"
      },
      "affected_cards": ["Type - Name", "Type - Name"],
      "resolution_criteria": "What would resolve this — a decision, an experiment, data",
      "revisit_by": "2026-04-15",
      "resolved": false,
      "resolution": null
    }
  ],
  "dropped": [
    {
      "claim": "Claims classified as noise",
      "reason": "Why it was dropped"
    }
  ]
}
```

**Consumption:**

- **Solomon** checks the signal queue at the start of every triage (shared preamble
  extension) — a new claim may connect to an existing parked claim.
- **Raven** checks the signal queue during product conversations — a question may touch
  an area with active contested claims.
- **Conan** reviews the signal queue during Health Check (Job 8) alongside the feedback
  queue — parked claims that have aged past their revisit date are flagged.
- **Human** resolves parked claims when evidence arrives. Resolution routes to Play 5.2.

---

## Loop 5 (Contested Truth) Updates

The engagement loops source (`sources/engagement-loops.md`) describes Loop 5 as "emerging,
not yet formalized." Signal Intake formalizes it. The revised loop:

**Loop 5: Contested Truth**

**Cadence:** Event-driven. A meeting, conversation, or decision surfaces a disagreement
or an unresolved question that affects the library.

**Trigger:** Play 5.6 (Signal Intake) classifies a claim as Contested or Open Question.

**Action:** The claim is parked in the signal queue with positions, evidence, affected
cards, resolution criteria, and a revisit date. The library does NOT update to reflect the
claim — it records that the claim exists and is unresolved.

**Resolution:** When evidence arrives (experiment results, executive decision, user data,
team alignment), the human resolves the claim. Solomon helps draft source material from the
resolution. The resolved claim routes to Play 5.2 (Source Update). The signal queue entry
is marked resolved with the outcome.

**Reward:** Disagreements become trackable. The library captures not just what was decided
but what was contested, what evidence was gathered, and how it was settled. Resolved claims
become the highest-quality source material because they carry the full reasoning chain.

**Investment:** Each resolved dispute becomes institutional memory with provenance. The
library grows stronger from disagreement, not weaker.

---

## Scope

This plan covers:

- **Raven the Maven** — new agent: product thinking partner, human boundary outbound
- **Solomon the Sorter** — new agent: signal triage, human boundary inbound
- **Kathy retirement** — the existing `agents/kathy.md` is replaced by Raven and Solomon
- A new play (Play 5.6: Signal Intake) for the playbook
- A new play (Play 3.4: Product Conversation) for the playbook
- A triage gate prepended to Play 5.2 (Source Update)
- A signal queue schema (analogous to `feedback-queue.jsonl`)
- Updates to Loop 5 (Contested Truth) in the engagement loops source
- Org chart revision — adding the Human Boundary zone, Raven and Solomon sections, updated
  boundaries table, updated ASCII diagram, updated information flow

This plan does NOT cover:

- Automated ingestion from Zoom/Slack/Discord (future — requires integration infrastructure)
- Product analytics pipelines feeding the library (separate problem, separate plan)
- Changes to Conan, Sam, or Nit's agent definitions (their roles don't change)
- Changes to Bridget's agent definition (her role doesn't change, but the org chart and
  playbook will better articulate the Bridget/Raven/Solomon symmetry)

---

## What Changes Where

| Artifact | Change | Type |
|----------|--------|------|
| `agents/kathy.md` | Remove (replaced by raven.md and solomon.md) | Agent retirement |
| `agents/raven.md` | New: product thinking partner, full agent definition | New agent |
| `agents/solomon.md` | New: signal triage, full agent definition | New agent |
| `skills/raven/` | New directory | New directory |
| `skills/raven/job-product-conversation.md` | Full procedure for human-facing product Q&A | New skill file |
| `skills/solomon/` | New directory | New directory |
| `skills/solomon/job-signal-triage.md` | Full triage procedure with tension detection | New skill file |
| `skills/solomon/tension-detection.md` | T1-T7 tension signals, how to check each | New skill file |
| `skills/solomon/signal-queue-schema.md` | Signal queue JSONL schema | New skill file |
| `docs/design/playbook.md` | Add Play 3.4 (Product Conversation) to Stage 3 | New play |
| `docs/design/playbook.md` | Add Play 5.6 (Signal Intake) to Stage 5 | New play |
| `docs/design/playbook.md` | Amend Play 5.2 Step 1 with triage gate | Play revision |
| `docs/design/playbook.md` | Update play index table (2 new plays) | Index update |
| `docs/design/org-chart.md` | Add Human Boundary zone, Raven and Solomon sections, update boundaries table, update ASCII diagram, update information flow | Org chart revision |
| `docs/alexandria/sources/engagement-loops.md` | Revise Loop 5 from "emerging" to formalized | Source update |

---

## What Does NOT Change

- **Conan's jobs.** Conan still assesses source material (Job 0), still runs health checks
  (Job 8). The signal queue becomes an additional input to Job 8, alongside the feedback
  queue. No new Conan job needed.
- **Sam's jobs.** Sam still builds and fixes cards. Sam never sees raw signal — only source
  material that has passed through triage and Conan's assessment.
- **Nit's sweeps.** No new sweep needed. Nit already checks the feedback queue schema
  (sweep 5). A signal queue schema check is a natural extension of sweep 5, but it's a
  minor addition, not a new sweep.
- **Bridget's assembly.** Bridget assembles from the library as-is. Bridget does not read
  the signal queue — contested claims are not library content. (Bridget's gap manifest may
  independently surface the same gaps that contested claims would fill. That convergence is
  valuable signal for Conan during health checks.)
- **The boundaries table principle.** Each agent has exactly one "Yes." Raven: human
  conversations. Solomon: signal triage. Clean separation.

---

## Updated Boundaries Table

| | Write cards | Grade cards | Assemble briefings | Mechanical checks | Human conversations | Signal triage |
|---|---|---|---|---|---|---|
| **Conan** | No | **Yes** | No | No | No | No |
| **Sam** | **Yes** | No | No | No | No | No |
| **Nit** | No | No | No | **Yes** | No | No |
| **Bridget** | No | No | **Yes** | No | No | No |
| **Raven** | No | No | No | No | **Yes** | No |
| **Solomon** | No | No | No | No | No | **Yes** |

Six agents. Six mandates. No overlap. No dual mandates.

---

## Open Questions

1. **Where do Raven and Solomon sit in the org chart?** They're not inside the library
   (don't write cards) and not at the factory boundary (don't serve builders). They face
   outward — toward the humans and the world. A third zone? "HUMAN BOUNDARY" alongside
   "LIBRARY" and "FACTORY BOUNDARY"?

2. **Should the signal queue live alongside feedback-queue.jsonl?** Both are append-only
   JSONL logs consumed by Conan during health checks. But they have different schemas and
   different sources. Keeping them separate seems right, but they may want a shared
   consumption protocol.

3. **How does the org chart represent Raven's and Solomon's relationship to each other?**
   They share the Human Boundary zone. Raven hands off to Solomon when conversation
   surfaces actionable signal. Solomon's settled output feeds the same pipeline Raven
   might have suggested. They're peers, not manager/report.

4. **How does the org chart represent Solomon's relationship to Conan?** Solomon doesn't
   direct Conan. He produces source material that Conan assesses (like a human would). He
   also flags contested truths for Conan's diagnostic. The relationship is: Solomon produces
   inputs that Conan consumes. Similar to Bridget → Conan (indirect via feedback queue),
   but through source material and the signal queue.

5. **Should settled claims bypass Conan's source assessment (Play 0.2)?** Probably not.
   Even triaged, settled source material benefits from Conan's five-dimension coverage
   check before Sam builds from it. The triage gate on 5.2 confirms epistemic status;
   Conan still confirms buildability.

6. **The "update vs. contested" distinction in practice.** The tension detection design
   handles this by making "update" a special case of "settled" — specifically Supersedes.
   A clean update is a claim that (a) contradicts the library, (b) has clear authority
   behind it, (c) has no live counter-claim, and (d) the human confirms. That's
   Supersedes → Play 5.2. The same contradiction WITHOUT clear authority or WITH a live
   counter-claim is Contested → signal queue. The tension signals (T1-T7) make this
   distinction visible to the human rather than requiring them to pre-classify. But does
   this hold in practice? The risk is that every source update triggers T1 (direct
   contradiction) and the human has to confirm settledness for every routine update. That
   might be correct (updates SHOULD be confirmed) or it might be friction that kills
   adoption. Needs real-world testing.

7. **Should Solomon flag when the signal queue is getting stale?** Parked claims with
   expired revisit dates are currently caught by Conan during health checks. But health
   checks are periodic (quarterly). Should Solomon proactively flag stale claims at the
   start of every triage? This would make triage a natural moment to resolve old claims
   alongside classifying new ones.

8. **What's the lightweight path?** Not every piece of signal warrants full triage. A
   founder working solo who writes a new strategy doc and knows it's settled shouldn't
   have to go through Solomon to update the library. The triage gate on Play 5.2 is
   designed as a one-question gate ("is this settled?") for this reason. But is that
   lightweight enough? Should there be an explicit "fast path" where the human asserts
   settledness upfront and skips triage entirely?

9. **~~Does Raven need Write?~~** Resolved: yes. Raven writes three scoped boundary outputs
   (handoff notes, feedback queue entries, Conan flags) matching Bridget's pattern of
   writing boundary outputs but never library content.

---

## Implementation Order

**Phase 1: Agent definitions**
1. Create `agents/raven.md` — full agent definition matching Conan/Bridget pattern
2. Create `agents/solomon.md` — full agent definition matching Conan/Bridget pattern
3. Remove `agents/kathy.md`

**Phase 2: Skill files**
4. Create `skills/raven/job-product-conversation.md` — full procedure for Raven's job
5. Create `skills/solomon/job-signal-triage.md` — full procedure for Solomon's job
6. Create `skills/solomon/tension-detection.md` — T1-T7 signal definitions
7. Create `skills/solomon/signal-queue-schema.md` — JSONL schema

**Phase 3: Playbook updates**
8. Write Play 3.4 (Product Conversation) in playbook.md
9. Write Play 5.6 (Signal Intake) in playbook.md
10. Amend Play 5.2 with triage gate
11. Update playbook index table

**Phase 4: Org chart + source updates**
12. Revise org chart — Human Boundary zone, Raven and Solomon sections, updated diagrams
    and tables
13. Revise Loop 5 in engagement loops source

**Phase 5: Verification**
14. Nit: sweep 6 to verify all new cross-references resolve
