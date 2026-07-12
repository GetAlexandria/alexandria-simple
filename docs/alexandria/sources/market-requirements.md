# Market Requirements

Source material for knowledge area 1.5. From solicitation prompt conversation, 2026-03-24.

## Evidence Status: Pre-Launch, Qualitative Only

We have two deployed libraries (LifeBuild, now sunset; this meta-library) and zero
external paying users. All evidence is qualitative, from the product owner's direct
experience and a handful of conversations with senior developers. This source file
should be read as "what we've observed and what we believe" — not "what the market
has validated."

## What We've Observed

### Signal 1: Richer Context Produces Better Work (Compounding)

This elicitation session is itself evidence. Through iterative solicitation, the agent
knows the product better than anyone but the product owner — maybe even better in
specific intersections. The questions and back-and-forth operate at both a deeper and
higher level than general elicitation. Agents with richer context do better work, and
the human does better work because the agent is doing better work. The compounding
effect is real and felt.

**Epistemic caveats (agent-contributed):**

- The product owner is an exceptional elicitation subject — thinks in systems, answers
  with structure, pushes back productively. A less articulate user might produce thinner
  source material with weaker compounding. Is it the process or the person?
- The context was structured by Claude, for Claude. The model-agnostic claim is
  important but untested. A library built by one model and consumed by a different one
  might not compound the same way.
- Much of this session's quality may be conversation context, not library context. A
  fresh agent picking up the library cold — does it get the same quality? Untested.
- Sample size of one, on the most favorable possible test case (the meta-library for
  the product that builds libraries).

### Signal 2: The Magical Coworker (Emergent)

The highest-value interaction was not designed — it emerged. The product owner started
using a general agent backed by the library as a product thinking partner. This became
the most valuable daily interaction with the product. The "coworker" has perfect recall,
intersectional insight, and is always available. This pattern led directly to the Chatty
Kathy agent design.

This is significant because it wasn't planned. The product owner built the library for
agent-facing context delivery and discovered human-facing value as a side effect. When
the product surprises its creator with unexpected value, that's a strong signal.

### Signal 3: The Gap Briefing Forcing Function

For LifeBuild, when it came time to build a new area or feature, Conan presented a
context gap briefing with questions to fill the gap. The questions were exceptional —
they forced clearer thinking than the product owner would have done unprompted. The
guidance that shipped was more precise than it would have been without that forcing
function.

This is the strongest direct signal: even if the context library doesn't lead to better
coding, it leads to better producting. The wizard and gap analysis function as a product
thinking tool, not just a documentation tool.

### Signal 4: The 115% Blog Post

The product owner used the library+factory method to write a blog post using AI. This
was the first piece of AI-assisted work that was genuinely better than what the human
would have produced solo — not 80% with AI, not 90% with AI, but 115% with AI. The
library provided enough context about the product's voice, positioning, and arguments
that the AI could produce work at a higher level than the human's baseline.

This happened about a week before this conversation. It's a single data point, but it's
the first evidence that the library can produce superhuman-quality output in a domain
(writing) different from the one it was built for (product development).

### Signal 5: The Visual/Prototype Gap

The biggest assumption breaker: the product owner expected to "word" around the lack
of visual prototypes, since AI isn't inherently visual. This hasn't been the case. There
is a gap in context for prototypes and visual design, and it shows in the work the
factory produces. The context library's text-heavy knowledge graph can't fully substitute
for visual artifacts when it comes to design decisions.

This is evidence that the library is necessary but not sufficient — certain kinds of
context (visual, spatial, interactive) may need different representations than five-
dimension Markdown cards.

## What the Market Looks Like

### The Developer World Isn't Thinking About This

Generally, the developer world is not solving this problem. They're software builders
building factories where it is just assumed that someone will give the factory stuff
to build. Their factories are often "dumb" — not built on learning. The dominant
pattern right now is what might be called the "Ralph loop": build 8 possible futures,
look at them, throw out 7. Dumb building.

The product owner wrote a blog post asking: assume a winning factory comes through.
We can factory software. How do you keep it fed? How do you get full utilization, like
a real factory? And moving at that blazing speed, how does everyone else keep up? The
answer is a solution shaped like a context library.

### Senior Developer Response: "Non-Obvious"

Conversations with senior developers — the AI-specialized types with big comp
packages — produced a consistent response: this is non-obvious. They're not thinking
about it. They want to see it in action.

This is both good and bad:
- **Good:** Non-obvious means no competition. Nobody else is building this.
- **Bad:** Non-obvious means category creation. You have to show, not tell.

Best input received: "Don't treat this like a lab, treat it like a factory. Factories
measure defects to improve the factory." This influenced the quality grading system and
the improvement flagging roadmap item.

### Outside the AI-Savvy Bubble: Blank Stares

People with no exposure to software factories don't have a mental model for what the
context library supports. Talking about a 5-dimensional knowledge graph and improved
context for agents produces polite confusion. The product requires the audience to
already understand the factory paradigm — which most people don't, yet.

The 30-month timeline estimate for broader market readiness comes partly from this
observation. The context library is ahead of where most of the market is.

### Not Socializing Until We Can Show Magic

The product owner is deliberately not socializing the product widely until it can
demonstrate magic — the "spec at 8pm, product exists at 6am" moment or equivalent.
The demo (roadmap item 3) is the prerequisite for meaningful market engagement.

## The Core Thesis Under Test

The context library is a bet that the bottleneck for autonomous AI isn't model
capability — it's context. Make the context rich, structured, and accessible, and
agents can do product-level work independently. The evidence so far:

- **For:** Compounding context quality, emergent coworker pattern, gap briefing
  forcing function, 115% blog post, "non-obvious" competitive landscape
- **Against:** Sample size of one, visual/prototype gap, model circularity concern,
  30-month market readiness gap, possible model capability making context wrangling
  unnecessary (the prompt engineering analogy)

### The Prompt Engineering Analogy (Strongest Counter-Signal)

18 months ago the product owner was becoming a prompt engineer — getting good work
out of AI required exceptional prompting skill. It was 70% of the game. Now it's maybe
10%. Context wrangling and AI-in-organization coordination could easily go the same
way. The invention may drive its own obsolescence — core models may get so good that
explicit context structuring becomes unnecessary.

This is the honest worst case: not that the product fails, but that it succeeds at
proving the thesis and then the thesis becomes trivially solvable by the models
themselves. The defense is speed — build the community and data moat before the
models catch up.

## What Would Change This

- **External validation from a user we don't know.** One person building a library
  for a product we've never seen, reporting that it made their agents meaningfully
  better. This would break the sample-size-of-one concern.

- **The 115% moment happening for someone else.** If another user reports superhuman
  AI output powered by their context library, that's replicable magic.

- **Factory defect data.** Measuring whether library-backed builds have fewer defects
  than non-library builds. This is the "treat it like a factory" advice in action.

- **The visual gap getting solved.** If someone figures out how to encode visual/
  spatial context in the library (or an adjacent system), the "necessary but not
  sufficient" assessment changes to "getting closer to sufficient."

- **A model that makes context structuring trivial.** If a future model can infer
  the product graph from a codebase + a 5-minute conversation, the elaborate wizard
  pipeline becomes overkill. Watch for this signal carefully.
