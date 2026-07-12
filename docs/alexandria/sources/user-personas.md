# User Personas / JTBD

Source material for knowledge area 1.3. From solicitation prompt conversation, 2026-03-23.

## Persona 1: The Solo Builder

**Role:** Hobbyist, solopreneur, one-person band. Building a product alone or nearly alone.

**Context:** Time-poor, wearing every hat. Probably technical enough to use AI tools but
not necessarily a developer by trade. Has deep domain knowledge about their product but
no team to share it with. The context library IS the team's shared brain — except the
"team" is the builder and their AI agents.

**Job to be done:** Ship something useful, wonderful, and more to spec than they normally
would. The context library lets one person build like a small team by giving AI agents
the product knowledge that would normally live in teammates' heads.

**AI mode likely:** Factory or Pair Programmer. The solo builder leans hard on AI because
there's nobody else.

**Value proposition:** Speed and quality beyond what one person normally achieves. "I built
this alone but it doesn't feel like it."

---

## Persona 2: The Product Owner (Small Team)

**Role:** Product manager or founder leading a small team (2-8 people). May or may not be
technical. This is the primary target user.

**Context:** Has a team but the team is small enough that knowledge lives in people's
heads, not in systems. When someone is out sick or a new person joins, context is lost.
AI agents are part of the workflow — either as Factory builders or as augmentation.

**Job to be done:** Two things at once — ship product AND maintain team alignment. The
context library is the single source of product truth that both humans and AI agents
draw from. Coordination and specification, not just documentation.

**AI mode likely:** Factory or Pair Programmer. The team uses AI as a force multiplier.

**Value proposition:** Team orientation and coordination. "Everyone — human and AI — is
building from the same understanding of the product."

---

## Persona 3: The Enterprise Champion

**Role:** Power user representing a larger organization. Could be a PM, architect, or
team lead advocating for structured product knowledge.

**Context:** The organization has multiple teams, established processes, and existing
documentation. The context library isn't replacing nothing — it's replacing or augmenting
wikis, PRDs, Confluence pages, and tribal knowledge. The champion needs to prove value
within existing workflows.

**Job to be done:** Team orientation and coordination at scale. As much about getting 20
people (and their AI agents) aligned as about the quality of any individual artifact.
May maintain multiple libraries across product lines.

**AI mode likely:** Varies by team. Some teams are Factory, some are Pair Programmer.
The champion needs the library to serve both.

**Value proposition:** AI-native organizational backbone. "Our product knowledge is
structured for both humans and AI agents, and it stays current."

---

## The Cold Persona: The Hand-Coder

**Role:** Developer who codes by hand with occasional Short Order Cook / support help.

**Context:** Comfortable in their IDE. Uses AI for autocomplete, occasional Q&A, maybe
code review. Doesn't think in terms of "product knowledge graphs" — thinks in terms of
code, tests, and maybe a README.

**Why they're cold:** The context library's value scales with AI autonomy. For someone
whose AI interaction is "autocomplete this function," a typed knowledge graph with
retrieval profiles and assembly briefings is overhead that doesn't pay back. The library
is solving a problem they don't have yet.

**What could change this:** If they move toward more autonomous AI usage, or if the
library proves valuable for human-to-human knowledge transfer independent of AI.

---

## User Assumptions Agents Must NEVER Violate

**1. The user may not be technical.**
Never assume the user can read YAML, understands graph theory, knows what "frontmatter"
means, or is comfortable in a terminal. Every user-facing output must be plain language
first, technical detail available on request.

**2. The user's time is the scarcest resource.**
Every interaction should respect that the user has less time than the system has
throughput. Don't produce 120 cards and ask for review. Produce a summary, get
directional confirmation, then produce detail.

**3. The user is the product expert, not the system expert.**
The user knows their product deeply. They do NOT know card types, dimensions, grading
rubrics, or retrieval profiles. Ask questions in product language ("what's your core
user journey?"), not system language ("what Journey cards should we create?").

**4. Magic means invisible mechanics.**
The user should feel like they described their product and got a working knowledge
system. They should NOT feel like they configured a knowledge graph. Every mechanical
step (typing cards, linking edges, assigning dimensions, computing grades) happens
behind the curtain.

**5. Complete at every level.**
The user should never feel "30% done." They should feel "done with Level 1, here's
what Level 2 would add." Every stopping point is a real stopping point with real value.

**6. The user can go deeper if they choose.**
Nothing is hidden — it's layered. A power user who wants to understand grading, tune
retrieval profiles, or read cascade analyses can. But they opt in; the system never
forces depth.

**7. Don't surprise the user with who's doing what.**
The user should always know which agent is acting and why. No front-agent translating
behind the scenes. No emergent delegation. Collegial, not emergent.
