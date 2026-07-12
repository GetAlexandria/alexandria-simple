# Vision Slot Pegs: The Work

Read this file before Raven drafts or elicits this slot.

## Deep Guidance

### Job
The central unit of work and the path it takes from raw to done.

This slot states the five coordinates of work as intent. The director is asked
in plain terms; each plain term is one work coordinate under another name — the
same five axes, two names. The plain name is how we ask; the coordinate name is
how the build files the answer and reconstructs it against source.

| Asked as (plain) | Work coordinate | What it is |
| --- | --- | --- |
| Unit | **Case** | the central record the work accumulates around |
| Path | **Activity** | the ordered stages it moves through, raw → done |
| Status | **State** | the stored status or enum marking where each unit is |
| Places | **Place** | the contexts or containers the work passes through |
| Advances | **Event** | the command, gate, or rule that advances it |

The director answers from intent. The agent later confirms from source: stored status fields, loop and command surfaces, and per-case artifacts. Deltas are valuable threads: if Vision claims a stage that source cannot show, that mismatch is worth chasing.

### Not the job
- Not an essay
- Not a user journey
- Not a screen inventory
- Not an org chart
- Not every possible edge case
- Not proof that the implementation already matches the Vision

### Common failure modes
- **No unit.** The slot lists activities but never names the pile they accumulate around.
- **No stored state.** The path has stages, but no field or enum the system can inspect.
- **Multiple spines.** Several different units compete for "the work" with no declared primary.
- **Places as screens only.** Places should name work containers or contexts, not just UI labels.
- **Advances as vibes.** "Collaboration" or "AI" does not say what moves the case to the next stage.
- **Source denial.** The Vision claims a path while treating missing source evidence as a nuisance instead of a thread.

### Sharpness target
The five coordinates, terse. A list or table is better than prose.

### Diagnostic test
Could you draw one unit as a thread crossing columns for places and moving down rows for stages? If yes, the slot is probably sharp. If the thread has no unit, no status, or no advancement rule, keep eliciting.

### How it connects
Shape picks the likely evidence trail. The Work names the spine the sweep reconstructs and confirms against source. Felt Experience can then tell a scene on top of the working spine. Refusal & Fence can prune neighboring work units, external dependencies, and alternate shapes that are outside this product.

---

## Examples

### Good example *(claims review tool)*

> | Asked as | Answer |
> | --- | --- |
> | Unit | Claim |
> | Path | Submitted -> triaged -> validated -> adjusted -> approved -> paid |
> | Status | `claim.status` |
> | Places | Intake queue, adjuster workspace, approval queue, payment batch |
> | Advances | Submit claim, triage rule, evidence-complete gate, adjuster approval, payout release |

**Why it works:**
- Names one central unit.
- Gives a stored status field.
- Separates stages, places, and advances.
- Gives the later sweep concrete source trails to confirm.

### Bad example

> Users collaborate on claims, review details, make decisions, and get outcomes faster.

**Why it fails:**
- No central record.
- No raw-to-done path.
- No stored status.
- No places or advancement rules.
- It could describe almost any workflow tool.

### The pattern

Good Work slots let the build trace one case across state, activity, place, and event. Bad Work slots describe busy people doing useful things.

---
