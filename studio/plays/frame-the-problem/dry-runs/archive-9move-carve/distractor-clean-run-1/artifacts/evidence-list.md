# Evidence List

Extracted from: `studio/plays/frame-the-problem-next/fixtures/distractor-clean/transcript.md`
Boundary: lines 1–17 (SOREN opens through MIRA closes)

---

## 1
- **Quote:** "when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else."
- **Speaker:** KEIKO
- **Mark:** pain

## 2
- **Quote:** "Last week I spent about three hours trying to figure out why our data-export job was failing."
- **Speaker:** KEIKO
- **Mark:** pain

## 3
- **Quote:** "The response body was just the status code. No message, no field, no request ID I could use to go look something up."
- **Speaker:** KEIKO
- **Mark:** pain

## 4
- **Quote:** "You end up in this loop where you're guessing — was it a rate limit? A malformed payload? A downstream timeout on Vanta's side? You can't tell from what comes back."
- **Speaker:** KEIKO
- **Mark:** pain

## 5
- **Quote:** "I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch."
- **Speaker:** KEIKO
- **Mark:** pain

## 6
- **Quote:** "I hit the same thing two weeks ago on the ingestion pipeline. Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400."
- **Speaker:** DARA
- **Mark:** pain

## 7
- **Quote:** "I had to reproduce it in a sandbox and add logging on my side to figure it out."
- **Speaker:** DARA
- **Mark:** pain

## 8
- **Quote:** "it's not like this is an edge case — 4xx errors come up all the time during integration work."
- **Speaker:** DARA
- **Mark:** evidence-free claim

## 9
- **Quote:** "Every time someone's building a new integration or debugging a broken one, they hit this."
- **Speaker:** DARA
- **Mark:** evidence-free claim

## 10
- **Quote:** "there's no way to get better information through the API itself."
- **Speaker:** KEIKO
- **Mark:** pain

## 11
- **Quote:** "We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get."
- **Speaker:** KEIKO
- **Mark:** pain

## 12
- **Quote:** "I've been hearing this from other teams too."
- **Speaker:** MIRA
- **Mark:** evidence-free claim

## 13
- **Quote:** "The DevEx guild had it on the agenda last month."
- **Speaker:** MIRA
- **Mark:** pain

## 14
- **Quote:** "It's not just our team."
- **Speaker:** MIRA
- **Mark:** evidence-free claim
