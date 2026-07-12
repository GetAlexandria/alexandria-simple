# Progression / Mastery

Source material for knowledge area 3.4. From solicitation prompt conversation, 2026-03-23.

## The Arc: From "Get It Out of My Head" to "Backbone of the Factory"

Alexandria progression isn't about features unlocking — it's about the user's
relationship with their product knowledge deepening, and their agentic independence
increasing as the library matures.

### Stage 1: The Gauntlet (Day 1)

Day 1 is about getting the idea out of your head or out of your docs. For a greenfield
product especially, the wizard's solicitation process IS the first value moment. It's
not seeing a pretty library or getting a briefing — it's the experience of answering
questions you didn't know you needed to answer. Thinking through something you forgot
to think through. Completing decisions you didn't realize were incomplete.

The first "aha" is the gauntlet itself. You feel like you have a partner in all of
this. That feeling — of being genuinely helped to think more clearly about your own
product — is the hook. It's magical in the same way a great executive coach is magical:
the questions are better than the answers.

At this stage, the user may never look at the library directly. They interface with
the agents and take the library on faith — similar to using coding agents but not
knowing how to code. The library is an abstraction they trust because the outputs are
useful.

**Value threshold:** Completing the wizard and solicitation process. The user has
externalized product knowledge they were carrying in their head, and the act of
externalizing it made it better.

### Stage 2: First Factory Feed (Weeks 1-2)

The library is populated enough for Bridget to assemble briefings. The first time
the factory builds something without you and comes back with something good — that's
the second big payoff. The product knowledge you externalized is now *working* for you.
Agents are making decisions that respect your strategy, your constraints, your taste.

At this stage the product knowledge is prototyped, traversible, real-ish. Not complete,
not graded, but functional enough to feed the factory.

**Value threshold:** First useful briefing that produces builder output the user
wouldn't have gotten without the library.

### Stage 3: The Detective (Month 1-2)

If the user sticks with the idea, they start engaging with the library itself — not
just its outputs. Moving up the scale:

- **Casual inspection:** Looking at the folders. Seeing if the organization feels right.
  Is everything in the right place? Do the card types make sense?

- **Active critique:** Digging into cards and questioning them. "This WHY section
  doesn't capture the real reason." "This anti-pattern is missing the case we hit last
  week." The user is developing taste for what makes a good card.

- **Problem hunting:** Something doesn't work right at the factory level. The builder
  produced something off. Instead of just fixing the output, the user hunts down the
  problem in the product story — with agentic help or even solo, tracing the issue back
  through the knowledge graph to find where the context went wrong.

This is the stage where the user starts thinking like a librarian. They're not just
consuming the library's outputs — they're evaluating the library itself. They can feel
the difference between a card with substantive WHY and one with hollow WHY, even if
they couldn't articulate the rubric.

**Value threshold:** First time the user traces a factory-level problem back to a
library-level gap and fixes the root cause.

### Stage 4: The Proactive Curator (Month 3-6)

Great users become proactive. They're not waiting for Conan to surface issues or for
factory problems to reveal gaps. They're:

- **Uploading new context ahead of the curve.** Meeting notes, executive decisions,
  competitive intelligence, presentation decks — new source material entering the
  library before it's needed, not after something breaks.

- **Working with Conan on implications.** The user has a strategic conversation, writes
  the memo, creates the source material — then uploads it and jams with Conan on what
  it *means* for the library. Not just "here's new info" but "what are the downstream
  implications of this shift?"

- **Talking to the library as a product coworker.** This is possibly the most valuable
  daily interaction, and it's not even a formal feature or agent right now. Using a
  general agent on top of the library as a product thinking partner. Asking product
  questions, brainstorming product ideas, pressure-testing strategies. The library
  becomes a coworker who is perfectly aligned with your product context, has perfect
  recall, and often has more nuanced understanding of specific intersections than the
  product owner themselves — because it has the full graph and can see connections the
  human forgot about.

  Real example from the meta-library build: the product owner's technical cofounder
  sends a Discord message asking a product question. The product owner's response:
  "Dude, just ask Conan!!" The library has become the first stop for product context,
  not the human.

**Value threshold:** The user's first instinct when product context changes is to
update the library, not just tell a person. The library is the fulcrum — the
interpretation layer between strategy and tactics, humans and AI.

### Stage 5: The Alignment Tool (Month 6+, Team Scale)

At full scale across a team or company, the library becomes an alignment tool as much
as a production tool. "The conversation of your company" traverses through it. This
is a progression, not a separate use case — a solo founder's library naturally becomes
an alignment tool when they hire.

For a remote worker who misses watercooler talk, the library captures the context that
would otherwise only exist in hallway conversations. For a new team member, the library
is onboarding — not a wiki to read, but a knowledge system to query. For the whole
team, it's shared ground truth that prevents the "two colleagues disagree about how
something should work" problem from festering.

**Value threshold:** The user has the backbone for a software factory. Maybe even the
makings of an autonomous company. Due to the library, they're climbing the ladder of
agentic independence — delegating more, reviewing less, trusting the factory to make
decisions that respect the product vision. If they began at high agentic independence,
they should be running a smarter, faster, more efficient factory than they were at
month 1.

## The Skill Curve

The skill curve isn't about learning features. It's about depth of engagement with the
knowledge graph:

| Level | User Behavior | Mental Model |
|-------|--------------|--------------|
| **Faith** | Never looks at the library. Uses agents, trusts outputs. | "The library is a black box that makes my agents smarter." |
| **Inspector** | Browses folders. Checks organization. Glances at cards. | "The library is structured product knowledge I can navigate." |
| **Critic** | Reads cards. Questions content. Compares to their own understanding. | "Cards have quality dimensions. Some are better than others." |
| **Detective** | Traces factory problems to library gaps. Follows WHY chains. | "The graph has causal structure. Upstream quality affects downstream output." |
| **Curator** | Proactively adds context. Works with Conan on implications. | "The library is a living system I tend. My investment compounds." |
| **Coworker** | Talks to the library daily. Uses it as a product thinking partner. | "The library knows my product as well as I do — sometimes better at intersections." |

Most users will live at Inspector/Critic level and that's fine. The library provides
value at every level. But the compounding returns — the library getting meaningfully
better over time — require at least Detective-level engagement.

## What Would Change This

- **Real onboarding data** showing where users actually stall. The hypothesis is that
  the gauntlet (solicitation) is the hook, but maybe users stall at the cold start
  (too many questions) rather than being energized by it.
- **The "talk to the library" pattern** becoming a formal feature. Right now it's
  emergent — a user running a general agent against library files. If this is the
  most valuable daily interaction, it probably deserves agent support (a "product
  coworker" agent or mode).
- **Multi-user progression** being different from solo progression. The alignment-tool
  stage is hypothesized from solo usage plus imagination. Real team deployments might
  reveal progression stages we haven't thought of — or might show that teams skip
  stages that solo users go through.
- **The Contested Truth loop** (from engagement loops, currently deferred) becoming
  formalized would add a progression stage: users who can not only curate the library
  but use it as a forum for resolving product disputes.
