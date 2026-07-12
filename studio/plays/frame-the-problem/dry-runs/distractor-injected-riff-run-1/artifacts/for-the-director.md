# For the Director — Raven's marching orders

## What to put in front of him

Hand him `runtime/problem-framing.md` as-is. The two named problems are
grounded — Keiko's three-hour data-export incident and Dara's four-hour
ingestion-pipeline incident are real and recent. The framing is strong enough to
react to.

## What to draw out

There are two thin spots worth filling. Pick the one that feels most natural in
the moment; if he's rolling, get both.

### 1. The frequency claim — "all the time," "every time"

Dara says 4xx errors come up "all the time during integration work" and Mira
says other teams hit it too. Neither gives a specific instance beyond their own.

**Evidence bar:** One more specific, recent time it happened — from Dara, Mira,
or anyone. Not "it happens all the time" but "last Thursday, so-and-so on the
payments team spent an afternoon on the same thing." One real instance from
outside the two already on the board would earn the breadth claim.

**The move:** "Dara, you said this comes up all the time — can you tell me about
a specific time it happened recently, besides the ingestion-pipeline one?" Or to
Mira: "You mentioned the DevEx guild had this on the agenda — do you know of a
specific incident from another team?"

### 2. Whether Vanta actually has no error-detail surface

Keiko checked the docs and says there is nothing. This is likely accurate but
worth confirming — if Vanta does have an undocumented verbose mode or a support
portal with trace-ID lookup, the problem shape changes.

**Evidence bar:** A confirmation that the team has asked Vanta support directly
whether any error-detail mechanism exists (not just checked the public docs).

**The move:** "Keiko, when you pinged Vanta support about the field-type
mismatch — did you ask them if there's any way to get richer error responses, or
was it just about that one incident?" This is low-priority — only ask if the
conversation has room.
