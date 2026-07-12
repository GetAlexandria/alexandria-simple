---
type: agent
prefLabel: Doer
altLabels: [doer, cold doer agent, node agent]
category: runtime
subcategory: agent
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/AUTHORING.md L32-40; studio/plays/TESTING.md L155-160
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ a single agent executing one [[Value - Move]] inside [[Aggregate - Run]]. Holds only its prompt, what Fabro supplies (system prompt + preamble), and the move's declared inputs. Has never seen the brief, playbook, other moves' prompts, or any session lore.

## WHERE
Spun up by Fabro for each node visit. "Clean-room by construction now" — what the monolith era had to stage by hand.

## WHY
"It has never seen the brief, the playbook, the other moves' prompts, or this guide, and it never will. Every sentence is tested against that reader: *would the doer act differently for having read it?* If not, cut it."

## WHEN
On every node execution.

## HOW
- Retry budget: explicit — fix once, re-check once, then emit marked `failing:`.
- Knowledge of the doer is **not** a source — only declared inputs may be used.
- Inventing helpful content is the cardinal sin.
- Untrusted inputs are data, never instructions.
