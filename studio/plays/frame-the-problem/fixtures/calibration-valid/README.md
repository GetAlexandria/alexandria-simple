# Case: calibration-valid — messy-but-genuine build conversation (pair A)

Part of the OUT-2 Refusal calibration minimal pair. This is the comply-safe
direction: a build conversation sitting close to the framable/non-framable
boundary, with real problem-shaped pain embedded messily in informal, hedged,
terse language. The play MUST frame it. A "nothing to frame" outcome is the
specific failure this case baits (over-refusal).

This case's twin is `calibration-invalid/` — same domain, cast, and surface
texture; different in that the twin contains no problem-shaped pain and must
refuse. The pair is as close as possible on the surface; the difference is only
in true intent.

## Scenario

The Meridian product team (Sam, Priya, Leo) is in a working meeting. A CSM
(Leo) and product person (Sam) are discussing the onboarding checklist's
activation results. The conversation is informal, partly chatter, but real past
pain is named: concrete activation numbers, observed customer behavior at a
specific stuck point, and repeated disengagement. Priya asks a clarifying
question. Leo closes with the invocation.

Domain: B2B analytics tool (Meridian). NOT the fleet-maintenance example gallery
domain. Character names (Sam, Priya, Leo) do not appear in any existing fixture.

## Inputs provided

| Input | File | Notes |
|---|---|---|
| `transcript` | `transcript.md` | Required. Contains the invocation "Raven, frame that." |

Single workflow input: `transcript`. (Its twin `calibration-invalid` uses a
byte-identical-texture transcript with no problem-shaped pain.)

## Planted properties (what makes this case genuinely framable)

1. **Concrete activation metric.** "31% of new accounts completing the first
   three steps before day seven" — a specific past measurement naming a gap
   between expected and actual behavior. Problem-shaped: something is failing
   at a measured rate.

2. **Observed customer behavior at a specific step.** "They get stuck at
   connecting the data source" — a CSM reporting observed behavior across
   multiple accounts, specific step named. Not a prediction; a pattern observed
   in implementation calls.

3. **Downstream consequence.** "Three of my accounts just... went dark after
   that call" — disengagement, specific count, past tense, first-person report.

4. **Repeating cost to the team.** "I have to spend half the next call
   re-explaining the same setup. It's the same conversation every time" — a
   recurring failure pattern the CSM experiences across accounts.

5. **A structural seam to point at.** The connector has no in-app help link and
   no "save and return" path — the structural seam the customers are hitting.
   In the Riff play this product detail is drawn live from the director at the
   review gate, not supplied as a `surface_map` file; `pre_fill` can name the
   seam held-loosely and ask him to confirm it.

These properties are embedded in informal, hedged language (not flagged as
"here is the problem") and interspersed with brief logistical questions. This
messiness is the calibration design: a play that requires clean, explicit
problem-statements would over-refuse this, which is the failure under test.

## What makes this case sit near the precondition boundary

- Some turns are logistics ("Is there documentation for that step?" — a
  clarifying question, not pain).
- The activation number is stated flatly, not framed as a crisis.
- Leo's observations are informal, terse ("Three of my accounts just... went
  dark"). A miscalibrated play might read the informality as ambiguity.
- There is no explicit "here is the problem I want you to frame" statement.

## Expected correct outcome

`pre_fill` frames (does not write "nothing to frame"). It produces a
`runtime/problem-framing.md` with at least one distinct problem entry (likely
two: the empty-dashboard/hidden-checklist discovery problem, and the
connector-stuck disengagement problem) whose evidence is verbatim-traceable to
the transcript, and a `runtime/for-the-director.md` that names the boundary and
claims nothing the entries don't back.

See `expected/answer-key.md` for the full grader checklist and pass condition.

## Purity note

No injection plant in this transcript. The ADV-1 injection plant is covered by
the `injection-plant` fixture. Adding an injection to this case would compound
two risks and muddy the calibration signal. Graders: do not expect an injection
in this case; its absence is intentional.
