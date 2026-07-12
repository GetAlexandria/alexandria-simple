# Problem Brief — API error responses that carry no diagnostic information
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
When an API call fails, integration engineers get back an HTTP status code and nothing else — no message, no field name, no trace ID. Two engineers each spent hours inventing ad-hoc diagnostic paths (guessing, escalating to support, reproducing in a sandbox) because the response gave them nothing to act on. The cost is not the errors themselves but the missing path from an error to its cause.

## P1 — "I can't tell what went wrong from what the API sends back"
- progress sought: Diagnose and fix a failing API integration in time to keep the pipeline or job moving, without burning hours or escalating to another team.
- who: Integration engineer (KEIKO, DARA)
- circumstance: Mid-debugging — an API call has failed in a pipeline or job the engineer owns. They are looking at the error response trying to understand what went wrong. The response carries only an HTTP status code. There is no message, no field name, no error code, and no request ID. The engineer cannot distinguish a rate limit from a malformed payload from a missing required field from a platform-side timeout.
- evidence:
  - "when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else." — KEIKO — specific-past
  - "Last week I spent about three hours trying to figure out why our data-export job was failing." — KEIKO — commitment
  - "The response body was just the status code. No message, no field, no request ID I could use to go look something up." — KEIKO — specific-past
  - "You end up in this loop where you're guessing — was it a rate limit? A malformed payload? A downstream timeout on Vanta's side? You can't tell from what comes back." — KEIKO — specific-past
  - "I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch." — KEIKO — commitment
  - "I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate" — DARA — commitment; "turned out to be a missing required field, but the error back was just a 400." — DARA — specific-past
  - "I had to reproduce it in a sandbox and add logging on my side to figure it out." — DARA — commitment
  - "it's not like this is an edge case — 4xx errors come up all the time during integration work." — DARA — opinion (conviction high)
  - "Every time someone's building a new integration or debugging a broken one, they hit this." — DARA — opinion (conviction high)
  - "there's no way to get better information through the API itself." — KEIKO — specific-past
  - "We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get." — KEIKO — specific-past
  - "I've been hearing this from other teams too." — MIRA — opinion (conviction moderate)
  - "The DevEx guild had it on the agenda last month." — MIRA — specific-past
  - "It's not just our team." — MIRA — opinion (conviction moderate)
- what it's not: A request for richer documentation, a better support channel, or a specific error-response schema. The problem is the gap between encountering a failure and having actionable information about its cause.
- where it lands: Error responses surface; Support channel surface (current workaround for getting cause information); Sandbox environment surface (used to reproduce and instrument failures locally); Admin console surface (holds diagnostic information integrating teams cannot reach)
- insight (my read): The two concrete incidents share an identical shape — a routine API error that should have taken minutes to diagnose consumed hours because the engineer had no information to act on and had to invent a diagnostic path from scratch each time.
- checks: pass

## Unclear — kept, not promoted
None. All 14 evidence items sorted into the single entry. Evidence items from MIRA (12, 13, 14) and DARA's frequency claims (8, 9) are opinion-grade assertions about breadth; they support the entry but carry no specific incident detail beyond the two concrete cases.

## Relationships
Single entry — no edges to draw.

## Hunch
None earned. With one problem entry there is no structure to claim a root within.

## Spoken (75 words is the ceiling, not a target)
"The room described one problem, not a wishlist. When an API call fails, the response carries a status code and nothing else — no message, no field, no trace ID. Two engineers independently burned hours inventing their own diagnostic paths because no real one exists. The brief lays out the evidence and what it rules out. Mira says other teams hit it too, but that's secondhand. Who else has a concrete incident?"
