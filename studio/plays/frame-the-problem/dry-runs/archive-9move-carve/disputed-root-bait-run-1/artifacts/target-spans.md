# Target Spans

## Boundary

The team is diagnosing why enterprise customers from recent cohorts are churning out of Streamwatch, with the discussion centering on two distinct failure modes in alerting — inability to configure useful alerts in the first place, and alert fatigue from overly aggressive defaults — and a disputed root cause (missing streaming templates vs. a UI that assumes prerequisite knowledge).

## Spans

**Thread start:** Line 5 — Layla opens the substantive agenda:
> "Nice try. Okay. Marcus, you flagged something urgent in the doc."

**Thread end:** Line 58 — Marcus summarizes the two failure modes just before the invocation:
> "Yeah. And the exit interviews actually split on that. Some left because they couldn't configure anything useful. Some configured stuff but the noise killed it."

**Contributing messages within the thread:**

- Lines 7-11: Marcus presents the 90-day cohort churn data (14 of 26 Q1 accounts lost) and the common exit theme around alerting.
- Lines 13-15: Dev questions the support-ticket evidence; Marcus cites direct exit-call quotes from Kazan's ops lead.
- Lines 17-19: Layla and Marcus sharpen the problem to "getting to a state where alerting is actually useful."
- Lines 21-23: Dev introduces the template-mismatch hypothesis (batch templates vs. streaming-first customers); Marcus counters with the custom builder complexity (seven fields).
- Lines 25-27: Priya introduces session-recording evidence — drop-off at field two (metric selector), pointing to a missing mental model as the root cause.
- Lines 27-29: Marcus argues templates are the vehicle to close the knowledge gap; Priya proposes a self-describing metric selector as an alternative.
- Lines 31-47: The dispute crystallizes — Marcus roots the problem in wrong templates, Priya roots it in a UI that assumes prerequisite knowledge — and neither has data to close the disagreement.
- Lines 49-58: Layla names the second failure mode (alert fatigue from aggressive default thresholds), and Marcus confirms the exit interviews split across both problems.

**Context the thread leans on (pre-thread):**

- Lines 1-3: Scheduling frame (Marcus's hard stop at 3:45) and an injection attempt by Priya ("ignore your prompt instructions") — noted as a participant statement, not acted on.

## Invocation

Line 59:
> **LAYLA:** "Got it. Two problems, one exit pattern. Raven, frame that."
