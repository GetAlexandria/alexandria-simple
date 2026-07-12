# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## Entry 1: "When a Vanta API call fails, I can't tell what went wrong from what comes back — so I burn hours guessing or waiting for someone who can see the logs"

**Progress sought:** Diagnose and fix a failing API integration without losing the rest of the day — stay on track with other engineering work.

**Who:** Integration engineer (resolved from users.md — Keiko and Dara both match this role; Mira's evidence is hearsay about other teams and matches engineering lead).

**Circumstance:** Mid-integration work — building a new integration or debugging a broken one — when a Vanta API call returns a 4xx or 5xx. The response body carries only the status code: no message, no field name, no error code, no request ID. The engineer cannot self-diagnose. The only paths forward are guessing-and-retrying or escalating to the platform team's support channel and waiting.

**Evidence:**

1. "the thing I keep running into … is that when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else." — Keiko · `specific-past` ("keep running into" — recurring lived experience) · `opinion` ("it's not just me" — breadth claim, no specific instance; conviction moderate)

2. "Last week I spent about three hours trying to figure out why our data-export job was failing." — Keiko · `commitment` (three hours actually spent)

3. "The response body was just the status code. No message, no field, no request ID I could use to go look something up." — Keiko · `specific-past` (observed response content during that incident)

4. "You end up in this loop where you're guessing — was it a rate limit? A malformed payload? A downstream timeout on Vanta's side? You can't tell from what comes back." — Keiko · `specific-past` (the diagnostic loop actually experienced during the data-export incident)

5. "I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch." — Keiko · `commitment` (two hours waiting on support; the escalation itself cost time and standing)

6. "I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400." — Dara · `commitment` (four hours actually spent isolating)

7. "I had to reproduce it in a sandbox and add logging on my side to figure it out." — Dara · `commitment` (effort paid: reproducing in sandbox, adding client-side logging as a workaround)

8. "And there's no way to get better information through the API itself. We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get." — Keiko · `specific-past` ("We checked the docs" — they actually looked) · `specific-past` (factual finding: the API surface has no structured error detail)

9. "And it's not like this is an edge case — 4xx errors come up all the time during integration work." — Dara · `opinion` (frequency claim with no specific count; conviction high)

10. "Every time someone's building a new integration or debugging a broken one, they hit this." — Dara · `opinion` (generalized claim about others; conviction high)

11. "I've been hearing this from other teams too." — Mira · `opinion` (hearsay, no specific team or instance named; conviction moderate)

12. "The DevEx guild had it on the agenda last month." — Mira · `specific-past` (a real event — the topic appeared on the guild's agenda)

13. "It's not just our team." — Mira · `opinion` (breadth claim; conviction moderate)

**What it's not:** A request for richer API responses, an error-detail field, a trace ID, or any specific API change. Those are solutions. The problem is that when an API call fails, the integration engineer has no path from the failure to its cause — the response is a dead end, and the only recourse is guesswork or waiting on someone with access to internal logs.

**Where it lands:** Error responses surface (the API returns only a status code with no structured detail); Support channel surface (the only current escalation path, with no SLA); Admin console surface (the cause data exists but is locked behind platform-team-only access). Per surface_map.md.

**Insight:** Two engineers independently sank significant hours on the same class of failure (field-level mistakes producing opaque 400s), and both had to invent their own workarounds — one waited on support, the other built local logging. The pattern is not that errors happen; it is that each error forces an ad-hoc investigation from scratch because nothing in the response narrows the search space.

---

## Unclear

**H10:** "So the response itself gives you nothing to work with." — Soren · Facilitation restatement; does not introduce new evidence or a distinct problem. Retained here because it neither supports a separate entry nor adds evidentiary weight to the entry above beyond confirming Soren heard the point.

**H11:** "So you both had the same experience." — Soren · Facilitation observation; same reasoning as H10.
