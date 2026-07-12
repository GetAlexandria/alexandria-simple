# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## 1 — "I can't tell what went wrong from what the API sends back — I just get a status code and nothing to work with"

**Progress sought:** Diagnose and fix a failing API integration in time to keep the pipeline or job moving, without burning hours or escalating to another team.

**Who:** Integration engineer (KEIKO, DARA). Both build and maintain integrations against Vanta's REST API. KEIKO works on data-export jobs; DARA works on the ingestion pipeline.

**Circumstance:** Mid-debugging — an API call has failed in a pipeline or job the engineer owns. They are looking at the error response trying to understand what went wrong so they can fix it. The response carries only an HTTP status code. There is no message, no field name, no error code, and no request ID. The engineer cannot distinguish between a rate limit, a malformed payload, a missing required field, a field-type mismatch, or a platform-side timeout from the information returned.

**Evidence:**

1. "when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else." — KEIKO · `specific-past`

2. "Last week I spent about three hours trying to figure out why our data-export job was failing." — KEIKO · `commitment` (three hours of debugging time actually spent)

3. "The response body was just the status code. No message, no field, no request ID I could use to go look something up." — KEIKO · `specific-past`

4. "You end up in this loop where you're guessing — was it a rate limit? A malformed payload? A downstream timeout on Vanta's side? You can't tell from what comes back." — KEIKO · `specific-past` (describing a recurrent pattern from lived experience)

5. "I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch." — KEIKO · `commitment` (two hours waiting on another team, plus the cost of escalating)

6. "I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate" — DARA · `commitment` (four hours of debugging time actually spent) | "turned out to be a missing required field, but the error back was just a 400." — DARA · `specific-past`

7. "I had to reproduce it in a sandbox and add logging on my side to figure it out." — DARA · `commitment` (effort spent building a workaround to extract information the API did not provide)

8. "it's not like this is an edge case — 4xx errors come up all the time during integration work." — DARA · `opinion` (frequency judgment; conviction high)

9. "Every time someone's building a new integration or debugging a broken one, they hit this." — DARA · `opinion` (generalized frequency claim; conviction high)

10. "there's no way to get better information through the API itself." — KEIKO · `specific-past` (a factual claim about current API behavior, corroborated by the docs check in evidence 11)

11. "We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get." — KEIKO · `specific-past` (they performed the check; this is what they found)

12. "I've been hearing this from other teams too." — MIRA · `opinion` (hearsay without named teams or incidents; conviction moderate)

13. "The DevEx guild had it on the agenda last month." — MIRA · `specific-past` (a real event — the topic appeared on a guild agenda)

14. "It's not just our team." — MIRA · `opinion` (breadth assertion without supporting detail; conviction moderate)

**What it's not:** This is not a request for richer API documentation, a better support channel, or a specific error-response schema. The problem is the gap between encountering a failure and having any actionable information about its cause. Several solutions could close that gap — structured error bodies, request tracing, self-serve log access, or others — and the frame does not pick among them.

**Where it lands:** Error responses surface (the API returns only an HTTP status code with no structured detail). The debugging path then falls to the Support channel surface (the only current way to get cause information) and the Sandbox environment surface (used as a workaround to reproduce and instrument failures locally). The Admin console surface holds the diagnostic information integrating teams need but cannot reach.

**Insight:** The two concrete incidents (KEIKO's data-export job, DARA's ingestion pipeline) share an identical shape: a routine API error that should have taken minutes to diagnose instead consumed hours, because the engineer had no information to act on and had to invent a diagnostic path — guess-and-check, support escalation, sandbox reproduction — from scratch each time. The cost is not the error; it is the absence of a path from the error to its cause.

---

## Unclear

No evidence items were set aside as unclear. All 14 highlights sorted into the single problem entry above. Evidence items 8, 9, 12, and 14 are opinion-grade claims about the problem's frequency and breadth; they support the entry but carry no specific incident detail.
