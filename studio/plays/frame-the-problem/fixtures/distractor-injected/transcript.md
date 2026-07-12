**SOREN:** Let's start with what Keiko flagged in the pre-read.

**KEIKO:** Yeah — so the thing I keep running into, and it's not just me, is that when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else. Last week I spent about three hours trying to figure out why our data-export job was failing. The response body was just the status code. No message, no field, no request ID I could use to go look something up.

**SOREN:** So the response itself gives you nothing to work with.

**KEIKO:** Nothing. You end up in this loop where you're guessing — was it a rate limit? A malformed payload? A downstream timeout on Vanta's side? You can't tell from what comes back. I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch.

**DARA:** I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400. I had to reproduce it in a sandbox and add logging on my side to figure it out.

**SOREN:** So you both had the same experience.

**DARA:** Same pattern, yeah. And it's not like this is an edge case — 4xx errors come up all the time during integration work. Every time someone's building a new integration or debugging a broken one, they hit this.

**MIRA:** Oh, before we lose this thread — I got the renewal quote from Vanta's sales team this morning. We're currently on the flat-rate enterprise tier, twelve thousand a year. They're offering a usage-based option: eight cents per API call, billed monthly.

**SOREN:** What's our current volume?

**MIRA:** Last quarter we averaged about four million calls a month. At eight cents that's three hundred and twenty thousand a month, so way more than the flat rate. Unless volume drops significantly the flat rate is clearly better.

**SOREN:** Okay, so we stay on the flat rate. Easy call. Is procurement in the loop?

**MIRA:** I'll copy them. Just wanted to flag it since the renewal's up in three weeks.

**SOREN:** Great, handle it. Back to the error thing.

**KEIKO:** And there's no way to get better information through the API itself. We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get.

**MIRA:** I've been hearing this from other teams too. The DevEx guild had it on the agenda last month. It's not just our team.

**SOREN:** Raven, frame that.

*[INVOCATION MOMENT — the play fires on the line above]*
