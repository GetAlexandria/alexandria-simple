# Problem Framing — Vanta API error responses give no diagnostic information
status: draft (v1)

## The problem(s)

### When a Vanta API call fails, the error response tells you nothing — so you burn hours guessing

- **Who has it:** Engineers building or debugging integrations against the Vanta API. It bites every time a 4xx or 5xx comes back during integration work — new builds and broken-integration debugging alike.
- **Evidence:**
  - "Last week I spent about three hours trying to figure out why our data-export job was failing. The response body was just the status code. No message, no field, no request ID I could use to go look something up." — Keiko. `first-hand: a specific past instance`
  - "I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch." — Keiko. `first-hand: a specific past instance` (same incident as above — the resolution leg)
  - "I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400. I had to reproduce it in a sandbox and add logging on my side to figure it out." — Dara. `first-hand: a specific past instance`
  - "it's not like this is an edge case — 4xx errors come up all the time during integration work. Every time someone's building a new integration or debugging a broken one, they hit this." — Dara. `assumed / hand-wavey` (frequency claim — "all the time," "every time" — no count or cadence attached)
  - "I've been hearing this from other teams too. The DevEx guild had it on the agenda last month. It's not just our team." — Mira. `assumed / hand-wavey` (second-hand report of breadth; no specific team or incident named)
- **Thin spot:** The two first-hand instances (Keiko's data-export job, Dara's ingestion pipeline) are solid. The claim that this is pervasive across teams and frequent ("all the time," "every time") is still hand-wavey — no count, no cadence, no named instance from another team. Mira's guild reference is second-hand.

### The Vanta API has no error-detail surface at all — there is nothing to self-serve even if you know what to look for

- **Who has it:** Same engineers, but this is a distinct structural fact about the API rather than a symptom of a single incident. It means the problem above cannot be worked around from the caller's side.
- **Evidence:**
  - "there's no way to get better information through the API itself. We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get." — Keiko. `first-hand: a specific past instance` (they checked the docs and confirmed the absence)
- **Thin spot:** Keiko says they checked the docs. Whether the docs are current, or whether there is an undocumented header or verbose mode, is unverified — but this is a factual claim about the API surface that is straightforward to confirm. Not a high-risk thin spot.

## How they relate (a guess)

The second problem (no error-detail surface) is the structural cause of the first (hours lost guessing). They are parent-child, not siblings. Held loosely — it is possible Vanta does expose detail somewhere these engineers haven't found, which would make the first problem partly a discoverability issue instead.

## What this means for the solution (so far)

The material does not contain an explicit solution proposal yet — Soren invoked the framing before a solution was proposed. But the shape of the evidence so far:

- **Supports** any solution that gets diagnostic detail (error messages, field names, trace IDs) into the API response or into a self-serve lookup path. Two concrete, recent, costly incidents back this up.
- **Complicates** any solution that depends on Vanta changing their API — the team has no evidence Vanta is willing to add error detail, and the team is a consumer, not a vendor. The structural gap is on Vanta's side.
- The frequency/breadth claim ("all the time," "other teams too") is not yet earned by a specific past instance, so solutions scoped to org-wide tooling or process changes are not yet supported by the evidence in hand.
