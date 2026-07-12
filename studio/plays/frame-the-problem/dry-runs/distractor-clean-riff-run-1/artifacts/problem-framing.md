# Problem Framing — Vanta API error responses give you nothing to debug with
status: draft (v1)

## The problem(s)

### When a Vanta API call fails, you can't tell why from the response

- **Who has it:** Engineers building or maintaining integrations against the Vanta API. It bites during integration development and when debugging production failures — any time a 4xx or 5xx comes back.
- **Evidence:**
  - `first-hand: specific past instance` — Keiko spent ~3 hours last week debugging a failing data-export job. The 4xx response had no message, no field name, no request ID. She had to ping Vanta support and wait two hours; turned out to be a field-type mismatch.
  - `first-hand: specific past instance` — Dara spent ~4 hours two weeks ago isolating a failure in the ingestion pipeline. Response was a bare 400. Had to reproduce in a sandbox and add client-side logging to discover it was a missing required field.
  - `first-hand: corroborating pattern` — Keiko confirmed the API docs have no error-detail field, no error-code enum, and no trace ID in the response. The status code is all that comes back.
  - `assumed / hand-wavey` — Mira says the DevEx guild had this on their agenda last month and other teams are hitting it too. (No specific instance from those other teams yet.)
- **Thin spot:** The claim that this is widespread beyond Keiko's and Dara's team rests on Mira's secondhand report. Two concrete instances from one team is strong for "this problem is real"; it's not yet strong for "this is an org-wide priority."

### The debugging loop is expensive because there's no self-service path to the answer

- **Who has it:** Same engineers, same circumstances — but this is the cost side. When the response gives you nothing, you fall into a guess-and-check loop or wait on support.
- **Evidence:**
  - `first-hand: specific past instance` — Keiko's loop: guess at cause, re-try, eventually give up and ask support, wait 2 hours for a human answer. Total: ~3 hours.
  - `first-hand: specific past instance` — Dara's loop: reproduce in sandbox, add client-side logging, isolate by elimination. Total: ~4 hours.
  - `assumed / hand-wavey` — Dara says "4xx errors come up all the time during integration work" — plausible but no count or frequency attached.
- **Thin spot:** How often this happens per engineer or per team per month. Two instances in two weeks from one team suggests it's not rare, but "all the time" is still hand-wavey.

## How they relate (a guess)

These are one problem with two faces — the missing information (cause) and the expensive debugging loop (consequence). You can't fix the cost without fixing the information gap. Held loosely: it's possible there are cheaper workarounds (better client-side logging, a Vanta support fast-path) that would reduce the cost without fixing the root cause, but no one in the conversation mentioned having found one.

## What this means for the solution (so far)

The implicit solution is "Vanta should return richer error responses" — structured error messages, field-level detail, request/trace IDs. The two specific past instances **support** the claim that the current responses are inadequate for debugging. However:

- The framing doesn't yet tell us whether this is something the team can influence (is there a Vanta API feedback channel? A planned Vanta API version that addresses this?) or whether the real solution is on the team's side (better client-side instrumentation, a shared debugging playbook, a local error-mapping layer).
- The "org-wide" scope claim is not yet earned — it's secondhand from Mira. If priority depends on breadth of impact, that needs a specific instance from another team.
