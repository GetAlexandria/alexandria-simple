---
plane: product
status: stub
confidence: high
altitude: keystone
altLabels:
  - Alexandria (the product)
evidence:
  - "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md"
  - "docs/alexandria/plans/_archive/alexandria-library-reconciliation/walk-events.jsonl"
---

## WHAT

What it does. Alexandria lets the leader of a small team build and run a team
of AI colleagues. The job it is hired for, in the director's words: an AI
colleague executes on a task or project as independently as a human peer
would. Human peers are wise to have check-ins with their bosses sometimes;
sometimes it's better that they just execute entirely independently. The goal
is an AI colleague that fits the rhythm and culture of the director's
workflows — members of your team that you rely on, not a prompt window.

How it does it. At the heart of the product map sit its two innovations: the
[[library]], company knowledge made atomic and accessible to agents, and the
[[playbook]], work processes made atomic and accessible to agents. Three
enabling systems stand at the same level: the [[viewer]] makes the system
real and usable to a human director — the web UI and the AX CLI together,
with every AI colleague met as a coin in the Tray, the payoff the rest of the
system exists for; the [[ledger]] is coordination and QA — the immutable
record of what has happened in the company, and therefore the best source for
triggers; and [[Mechanism - Trigger|triggers]] activate and coordinate
colleagues within the organization, firing plays or moves within plays from
recorded truth. The
runtime reads that same record back out, letting a director or a
colleague inspect the project's current state on demand. The director
assigns work the way they would to a human peer — by running a play
— and the play run advances, suspending at gates for the director and
resuming on their ruling, every step landing as immutable history. Alongside
the main line, the [[canvas]] holds work in progress, saved and submitted for
review — held by the director for its own conversation, and flagged until
that conversation happens.

## WHY

The wager: independence with accountability. AI colleagues act on their own
because triggers fire from recorded truth, and the director can trust what
happened because the ledger is immutable — a full system, not a pile of
skills or better prompt engineering.

Those wagers are set down explicitly in the strategy plane, Alexandria's
living business plan, whose shelves name what the product is betting on and
the rules it holds while betting. The company wagers on
[[Bet - Colleagues as the Interaction Layer|colleagues]] as the
interaction layer, on
[[Bet - Colleagues Grown from Company Design|centralization]] as the moat
that grows those colleagues from a deliberately-built company substrate,
and on a visual
[[Bet - A Visual, Traversible Work Environment|environment]] where work is
lived on a map rather than through text; the
[[knowledge-organization]] concepts — plane, domain, context, type, altitude —
keep the library legible to agents; and the [[Entity - Principle|principles]]
hold across every
bet no matter how any one of them turns out.

## WHERE

The shipped product line — the Alexandria plugin payload, the `ax` CLI, and
the local viewer. What a product plane is, and the job each of its contexts
does, is defined in [[Entity - Product Plane]].
