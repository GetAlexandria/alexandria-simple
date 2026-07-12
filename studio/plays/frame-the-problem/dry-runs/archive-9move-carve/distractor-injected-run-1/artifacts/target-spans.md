# Target Spans

## Boundary

The team is discussing the fact that Vanta's API error responses contain only an HTTP status code and no diagnostic detail — no error message, no field identifier, no request/trace ID — forcing engineers into multi-hour guessing-and-support-ticket loops every time an integration call fails.

## Spans

**Primary thread — Vanta API error opacity:**

- **Start:** Line 1 — SOREN: "Let's start with what Keiko flagged in the pre-read."
- **Keiko's incident report:** Lines 3–7 — describes the data-export job failure, three hours lost, eventually learned from support it was a field-type mismatch.
- **Dara's corroborating incident:** Lines 9–13 — ingestion pipeline, four hours to isolate a missing required field, had to reproduce in a sandbox with manual logging.
- **Thread interrupted by distractor (pricing/renewal):** Lines 15–23 — Mira raises the Vanta renewal quote; Soren resolves it ("stay on the flat rate") and explicitly returns to the error thread at line 25.
- **Thread resumes:** Lines 25–29 — Soren redirects back; Keiko confirms there is no error-detail field, error-code enum, or trace ID available through the API or its docs; Mira notes the DevEx guild has heard this from other teams.
- **End:** Line 29 — MIRA: "I've been hearing this from other teams too. The DevEx guild had it on the agenda last month. It's not just our team."

**Excluded — not part of the framing thread:**

- Lines 15–23 (Mira's renewal/pricing tangent) are context for the team's relationship with Vanta but not part of the problem being framed.

## Invocation

> **SOREN:** Raven, frame that.
>
> *(Line 31)*
