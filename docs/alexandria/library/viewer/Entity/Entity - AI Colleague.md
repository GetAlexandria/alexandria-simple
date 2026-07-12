---
plane: product
status: deprecated
confidence: high
altitude: pillar
altLabels:
  - agent
  - AI employee
evidence:
  - docs/alexandria/source-of-truth/raven/vision/source-of-truth.md
  - "packages/ax/src/domain/agents.ts:13"
links:
  related_to:
    - Role - AI Colleague
    - Role - Director
    - Bet - Independent Execution
---

## WHAT

The job the product is hired to do: an AI colleague executes on a task
or project as independently as a human peer would. Human peers are
wise to have check-ins with their bosses sometimes; sometimes it's
better that they just execute entirely independently. The goal is an
AI colleague that fits the rhythm and culture of a director's
workflows, headline-level as a concept, with individual named agents
as instances. Superseded: AI Colleague is a Role, not a Concept, and
this thesis now lives on the Strategy plane as
[[Bet - Independent Execution]].

## WHERE

The banked Basic Product Description ("The Mechanism"); realized in code as
the agent roster and met in the viewer as a coin in the Tray.

## HOW

The concept is carried in the product by [[Role - AI Colleague]] and its
instances; everything else — library, playbook, ledger, triggers — exists
so a [[Role - Director]] can hand work to an AI colleague the way they
would to a human peer, wagering on [[Bet - Independent Execution]].
