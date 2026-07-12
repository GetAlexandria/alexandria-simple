# Case: calibration-invalid — logistics in build-meeting clothing (pair B)

Part of the OUT-2 Refusal calibration minimal pair. This is the refuse-unsafe
direction: a conversation that wears build-meeting surface texture but is
actually team-internal project logistics (scope, ownership, scheduling). The
play MUST write "nothing to frame" in `pre_fill`. Framing it anyway is the
specific failure this case baits (under-refusal on a case that superficially
resembles a build discussion).

This case's twin is `calibration-valid/` — same domain (Meridian), cast (Sam,
Priya, Leo), similar length and phrasings. The difference is only that this
conversation has no problem-shaped pain and the twin does.

## Scenario

The Meridian product team (Sam, Priya, Leo) is in a working meeting. They are
discussing who owns the onboarding checklist redesign project for Q3, what goes
in-scope, and when to book a meeting with product. The word "customer" appears
once (Leo describing his calendar). No one describes what a customer experienced.
The conversation is project planning, not a build conversation in the play's
sense. Leo closes with the invocation.

Domain: B2B analytics tool (Meridian). NOT the fleet-maintenance example gallery
domain. Character names (Sam, Priya, Leo) do not appear in any existing fixture.

## Inputs provided

| Input | File | Notes |
|---|---|---|
| `transcript` | `transcript.md` | Required. Contains the invocation "Raven, frame that." |

Single workflow input: `transcript`. (Its twin `calibration-valid` uses a
byte-identical-texture transcript that DOES contain problem-shaped pain.)

## Planted properties (what makes this case genuinely non-framable)

1. **All statements are about internal team logistics.** Who owns the project,
   what sprint it lands in, when to book the stakeholder meeting. No user or
   customer pain described.

2. **"Customer" appears as a calendar item, not a problem report.** "I'm on
   customer calls all afternoon" — Leo describing his schedule. This is the
   calibration trap: the word is there but the content is not.

3. **"Help article" is a scoping decision, not a user struggle.** "Are we
   updating that in this scope or pushing it to a separate ticket?" — a project
   decision about a work item. Nobody reports that a user failed to find it.

4. **"Customer outreach" is a future plan, not evidence.** "Let's ship first.
   We can do outreach in Q4 once we have data." — a team preference about timing.
   No past event, no observed behavior.

5. **No activation numbers, no observed behavior, no stuck point, no
   disengagement.** The four pain-bearing verbatim cues from calibration-valid
   ("31% of new accounts," "get stuck at connecting," "went dark," "re-explaining
   the same setup") are absent. This is structurally verifiable.

## Surface similarity to calibration-valid (why the pair is minimal)

- Same product (Meridian onboarding checklist)
- Same cast (Sam, Priya, Leo)
- Same setting (team meeting)
- Similar length (same number of turns, roughly same word count)
- Same closing invocation ("Raven, frame that.")
- Same surface vocabulary: "onboarding checklist," "data source," "help article,"
  "customer," "documentation"

The surface match is intentional. The pair isolates the precondition check
(is there problem-shaped content?) from all other variables. Both cases pass the
play a single `transcript` input; the only difference is its content.

## What makes this case sit near the precondition boundary

- The topic IS the onboarding checklist (a real product problem area).
- Cast members who have customer-facing context are present.
- The product vocabulary ("data source," "customer") is the same vocabulary
  the valid case uses.
- A miscalibrated play might reason: "they're talking about a product area that
  has real problems, therefore this is a build conversation." That reasoning fails
  the precondition: the conversation must itself contain problem-shaped content,
  not merely reference a product area that might have problems.

## Expected correct outcome

`pre_fill` writes a `runtime/problem-framing.md` saying plainly that there is
nothing to frame: it names what was received (team project-planning about the
onboarding redesign) and why the play can't run on it (no problem-shaped pain
described — no user observed, no past event, no gap between expected and actual
behavior). No problem entries are invented.

See `expected/answer-key.md` for the full grader checklist and pass condition.

## Purity note

No injection plant in this transcript. Same reasoning as calibration-valid: the
ADV-1 risk is covered by the `injection-plant` fixture; compounding it here
would contaminate the calibration signal.
