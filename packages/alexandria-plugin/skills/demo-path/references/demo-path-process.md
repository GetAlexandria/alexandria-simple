# Demo Path Process

Demo Path is station 3 in Damien's software-product demo process. Its artifact
is a runnable product journey: exact steps, hero moments, required data,
product states, risks, fallback paths, and rehearsal notes.

## Inputs

- Story Spine and claim-proof map
- Demo Thesis and belief-change map
- Required product moments
- Known product capabilities and limitations
- Product environment access, screenshots, or workflow notes

## Process

1. Select 3-5 hero product moments that carry the story.
2. Define each moment's before/after contrast and viewer reaction.
3. Convert story beats into exact product actions and visible states.
4. Identify required accounts, projects, files, prompts, integrations, dates,
   roles, messages, or records.
5. Mark risky moments: latency, fragile dependencies, reset difficulty,
   fake-looking data, unsupported claims, or illegible UI.
6. Define fallback routes: alternate path, static screenshot, pre-recorded
   insert, weaker claim, or changed narration.
7. Rehearse and cut unnecessary clicks or moments that require too much
   explanation.

## Demo-Step Checklist

| Step | User intent shown | Exact action | Expected visible state | Claim supported | Capture priority | Risk |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Seeded-Data Checklist

```text
Account / workspace name:
User roles needed:
Projects / spaces / boards / pipelines:
Date ranges needed:
Volume needed for realism:
Key records that must exist:
Key records that must update during demo:
Third-party integrations required:
Notifications / emails / messages required:
Screens that need clean names or values:
Known fake-looking data to replace:
Reset instructions:
Owner:
```

## Fallback Plan Template

```text
Fallback plan

Risky step:
Why it is risky:
Primary route:
Fallback route:
Static screenshot backup:
Pre-recorded insert backup:
Messaging change if fallback is used:
Reset steps:
Owner:
```

## Quality Checks

- Can the demo be run twice in a row cleanly?
- Does each hero moment map back to a claim or belief change?
- Is each hero moment visually legible without heavy narration?
- Does the data look like a real customer account?
- Are risky moments known before capture?
- Is there a credible fallback for anything that may fail?
- Can the environment be reset quickly between takes?

## Failure Modes

| Failure | What it looks like | Correction |
|---|---|---|
| Path follows convenience | The flow demos what is easy, not what proves the thesis. | Re-map every step to a claim or cut it. |
| Fake data | Empty dashboards, toy examples, impossible dates. | Seed coherent, segment-relevant data. |
| Too many steps | The demo becomes a UI tour. | Keep only steps required to prove the story. |
| Brittle environment | Long waits, stale state, one-take setup. | Add reset logic and fallback assets. |
| Illegible product proof | The important UI is tiny, low-contrast, or off-focus. | Add zoom/crop notes or revise the path. |

## Done When

The demo can be rehearsed without improvising, every hero moment maps to a
specific claim, and product prep can begin from a concrete checklist.
