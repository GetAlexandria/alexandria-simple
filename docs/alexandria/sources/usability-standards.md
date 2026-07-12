# Usability Standards

Source material for knowledge area 4.4 (Accessibility Standards). From solicitation prompt
conversation, 2026-03-23.

## The User Spectrum

### Non-technical product manager (primary target)

Has never coded. May never have used a CLI tool. Alexandria should feel like
**magic** — "I described my product and now I have a working knowledge graph that's already
making my AI builders smarter." If this person has to understand card types, dimensions,
grading rubrics, or retrieval profiles to get value, we've failed.

### Technical PM / designer

Has touched config files, understands structured data, comfortable with markdown. Should
experience Alexandria as a **significant speed and quality gain**. Can go deeper
when they want to but shouldn't have to.

### Developer / technical founder

Power user. Builds with AI agents daily. Should experience Alexandria as a
**force multiplier** — better context in, better output out. Understands the graph, tunes
retrieval profiles, runs quality passes intentionally.

## Core Usability Commitments

### Progressive disclosure, not progressive overwhelm

18 card types and 5 dimensions is a lot. The wizard already tiers knowledge areas into
Foundation / Core / Amplifier / Deprioritized. The user experience should mirror this:

- **Level 1 (Minimum Viable Library):** Foundation cards only. You finish, you get dopamine,
  you have something usable. The system tells you what you get now and what more would
  give you.
- **Level 2 (Core Library):** Core cards added. The library becomes genuinely useful for
  daily development. Each addition is framed as "here's what this unlocks."
- **Level 3 (Full Library):** Amplifier cards. Power user territory. The system explains
  the marginal value — what you get when you "pay" that attention.

Each level should feel **complete at its tier**. Not "you're 30% done" but "you're done
with Level 1, and here's what Level 2 would give you."

### AI agents do the writing

Users answer prompts. Sam writes cards. The user should never need to write a card from
scratch, understand card structure, or know the difference between a Component card and a
Workflow card. The system asks questions in plain language and produces structured output.

The wizard is the first example of this — 3 questions in, full configuration out. That
pattern should extend to every interaction: the user provides domain knowledge, the agents
handle knowledge engineering.

### Mechanics are invisible unless requested

Nobody *needs* to understand grades, dimensions, cascade analysis, or retrieval profiles.
The user-facing experience is:

- **"Here's what needs attention"** — not "these 3 cards scored below threshold on WHAT
  and WHERE dimensions"
- **"Here's roughly what that's worth"** — not "improving WHY coverage from 0.4 to 0.8
  would increase assembly recall by ~15%"
- **"Here's what you get when you invest"** — not "running Play 2.1 would produce 6
  cards across 3 Foundation areas"

The technical details exist for agents and power users. They should never be required for
basic operation.

### Day 1 complexity ceiling

On day 1, a user should face:

- **One entry point** — the wizard
- **Three questions** — AI mode, domain novelty, product complexity
- **One output** — "here's your library configuration and what to do first"
- **One interaction pattern** — answer prompts, get cards

No card types. No dimensions. No grading rubrics. No graph navigation. Those are all
real and important, but they're behind the curtain until the user is ready or curious.

### Hit print

The aspiration is **minimum viable "hit print"** — the user should be able to get to a
usable library as fast as possible, with clear guidance about what incremental investment
buys them. Every step should feel like it's producing something, not preparing to produce
something.
