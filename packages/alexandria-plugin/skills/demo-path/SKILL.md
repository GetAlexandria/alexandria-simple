---
name: demo-path
description: >
  Convert a Story Spine into a runnable software-product demo journey. Use when
  selecting hero moments, exact product steps, required data, product states,
  rehearsal notes, risks, fallback paths, or third station of Damien's demo
  process before product prep and capture planning.
---

# Demo Path

Translate the story into exact product actions, product states, data needs, and
fallbacks.

Read `references/demo-path-process.md` unless the user explicitly asks for a
very quick pass. If no Story Spine exists, infer the missing spine briefly and
mark the assumptions before mapping product steps.

## Workflow

1. Import the Story Spine, claim-proof map, required product moments, Demo
   Thesis, and known product limits.
2. Select 3-5 hero moments that carry the belief change.
3. Write the exact step-by-step product journey: action, visible state, and
   claim supported.
4. Define required demo data, accounts, files, prompts, integrations, and reset
   state.
5. Mark risky moments before capture: latency, data quality, fragile live
   dependencies, illegible UI, or unsupported claims.
6. Define fallback paths for each risky step.
7. Rehearse mentally against the product surface and remove unnecessary clicks
   or narration-dependent moments.

## Output

Use this structure:

```text
Demo Path

Demo objective:
Hero moments:
Path assumptions:

Step-by-step flow
| step | user intent shown | exact action | visible state | claim supported | capture priority | risk |

Required demo data and states:
Fallback plan:
| risky step | primary route | fallback route | backup asset | messaging change |

Rehearsal notes:
Cut candidates:
Open questions / assumptions:
Hand-off notes for Product Prep and Capture Plan:
```

Do not ask the viewer to imagine value. If the product cannot show a claim
directly, mark it as an evidence or narration gap and propose a weaker claim or
fallback.
