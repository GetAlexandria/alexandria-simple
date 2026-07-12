---
status: speculative
captured: 2026-04-23
epistemic: idea-capture
surface: lab
---

# Alexandria should offer to report problems back to Alexandria

## The claim

Alexandria is a product that lives inside other people's repos and sessions. When it breaks, confuses, or misbehaves, the user is *in the middle of something else* and has no low-friction path to tell us. The friction kills the feedback loop: problems we could learn from never make it back to us.

Alexandria itself could close that loop. A built-in tool/skill that, when invoked (or when Alexandria notices something is wrong), prompts the user to describe the problem and handles the reporting end-to-end — likely via [PostHog's product feedback API](https://posthog.com) or equivalent. The user never has to leave their session, never has to figure out where to file an issue, never has to context-switch.

## Why this might matter

- Alexandria's customers *are* developers working inside AI-assisted flows. The feedback channel should match that medium (in-session, conversational) rather than requiring a GitHub issue or Slack context-switch.
- We already have one signal that feedback-via-conversation works: Jess's running scratchpad of architecture observations emerged during sessions, not in a separate "feedback writing" mode.
- Every piece of feedback Alexandria captures *about itself* is a seed for library cards, bug reports, or plan inputs — it routes into the pipelines that already exist.

## Open questions

- **Solicited vs unsolicited.** Does Alexandria prompt proactively ("something looked off — want to report it?") or only when the user invokes a `/report` or similar? Proactive is higher recall but higher annoyance tax.
- **Transport.** PostHog feedback API is one path. GitHub issue via `gh`, email, or a dedicated Alexandria-hosted endpoint are others. Each has trade-offs on durability, privacy, and analytics.
- **What data ships with the report.** Just the user's words? Recent session context? Repo state? Model used? The more shipped, the more useful — and the more privacy surface.
- **Who owns the report pipeline.** Does this live as an `ax` CLI command, a skill, an agent capability, or all three?
- **Reporting about Alexandria vs reporting in general.** If Alexandria ships a feedback-capture primitive, other tools might want to use it too. Is this an Alexandria-only feature or a capability worth generalizing?

## Related (possible future links)

- Lab concept itself — ideas like this are exactly what the Lab is for
- Notebook thread — Jess flagged "we need daily notes in this repo" alongside this idea, which is the Notebook surface pushing harder on being real
- Solomon's signal intake — reported problems are signals; Solomon already triages them for library consumption
- Customer-feedback-waiting-to-process (parked thread from prior session) — that feedback came in through a conversation, not a formal channel, which itself is evidence for this idea

## Provenance

- 2026-04-23 — Captured by Jess during PR-merge dialogue for PR #42. Explicit "we need daily notes in this repo" comment alongside. Not ready to plan. Capture only.
